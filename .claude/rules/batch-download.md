---
paths:
    - 'src/background/batch-download/**'
    - 'src/downloads/**'
    - 'src/content/services/batch-download-service.ts'
    - 'src/content/components/batch-download-*'
---

# Batch download

> How selected Bandcamp purchases become browser downloads. The work runs in the MV3 background, which can stop at any moment, so every step is stored and recovered.

## Flow

1. **Content** (`src/content/services/batch-download-service.ts`, `components/batch-download-checkboxes-layer.tsx`, `components/batch-download-bar.tsx`): on a collection (`#collection-grid`, only items with a `.redownload-item a` link; **never on the wishlist**, `isWishlistPage()`) or the purchases page (`#oh-container`, `.purchases-item`) it renders a checkbox per item (React portals) and the bar in `#band-play-batch-overlay-root`. While anything is selected `<body>` has the class `band-play-selecting` and every checkbox stays visible. Shift+click selects a range; "select all" (or only items not downloaded yet in the current format) first loads more items with Bandcamp's own "more" button. Items already in the download history for the current format get a `.band-play-downloaded-badge` (a separate element on the cover, or above the checkbox on purchases); the marks follow `batchDownloadHistory` and `batchDownloadFormat` changes. The bar is a narrow column fixed at the bottom right (so it does not cover the items), and has four states: idle ("Batch download"), selected ("N selected", Select all, Select new when the history is not empty, a split Download button with a format menu), loading the whole list ("Selecting N of M" with Stop) and, for four seconds after Download, "N releases sent to Downloads" with an Open link. Download sends `BatchDownloadSendItemsToBackground` with `BatchDownloadPendingItemModel[]` (`id`, `title`, `url` of the Bandcamp download page, `coverArtUrl`) and an optional one-off `format` from the bar's format menu (it applies to that batch only, then the default returns). Selectors: [bandcamp-dom.md](bandcamp-dom.md).
2. **Enqueue** (`actions.ts`, `enqueuePendingItems`): hides the browser download UI, gives each item a unique `id` (`<id>-<createdAt>-<index>-<random>`; `sourceId` keeps the original id), appends them to `batchDownloadQueuedItems` (skipping releases that are already queued or active, by `sourceId`), opens or focuses the downloads tab and schedules a tick.
3. **Runner** (`runner.ts`, `BatchDownloadRunner.runBatchTick`), one tick at a time. `runBatchTick` only calls the steps: `recoverStaleTransientItems`, `resolvePendingItems` (one release per `resolvePendingItem`), `startResolvedItems` (one file per `startResolvedItem`) and `scheduleNextTick`. The decisions that need no browser API are pure functions in `tick-logic.ts` (what to resolve and start, how a parsed release replaces its pending item, the shared rate-limit pause, `planNextWake`) with unit tests; the runner does the calls and applies their results:
    1. drain the queue into `batchDownloadItems` (`drainQueuedBatchDownloadItems`);
    2. recover states left by a stopped worker (`Resolving` → `Pending`; `Queued` → adopt the matching browser download started after `createdAt`, else `Resolved`);
    3. while work is running (`isRunningBatchDownloadItem`: active items except `Paused` and `Duplicate`, which wait for the user): disable the download UI and keep the watchdog alarm;
    4. resolve up to `MAX_PENDING_RESOLVE_PER_TICK` (3) pending items with `parseBandcampDownloads(url, format)` (`src/background/batch-download/bandcamp-parser.ts`): one file → a `Single` item, several → a `Multiple` parent with `Single` children (`<parentId>:<fileId>`), none → `Failed`;
    5. start `Resolved` singles up to `batchDownloadConcurrency` (`Downloading` items take a slot, and `Paused` items only when their browser download exists; an item is queued only while it is still `Resolved`, so a pause or cancel made during the tick wins) with `chrome.downloads.download({ url, conflictAction: 'uniquify', saveAs: false })`;
    6. update parent progress (`updateParentsProgress`); when nothing is active, enable the download UI again, stop the poller and clear the alarms;
    7. schedule the next tick at once (work and free slots left) or at the earliest retry time.
4. **Progress**: `chrome.downloads.onChanged` (`progress-updates.ts`, top-level, so it wakes the worker) and, only while the downloads page is connected, a 250 ms poller (`pollActiveDownloadsProgress`, one `downloads.search` per tick, at most 10 items). State changes are written to storage; progress-only changes are pushed over the port and not written.
5. **Downloads page** (`src/downloads/downloads-app.tsx`, details in [downloads-page.md](downloads-page.md)): reads `batchDownloadItems` and follows its changes, merges the live progress from the port, and sends the per-item and "all" commands ([messaging.md](messaging.md)).

## State

- Item model: `src/shared/models/batch-download/batch-download-item-model.ts` (with the `SingleItem`, `PendingItem` and `MultipleItem` types), a union by `type` (`DownloadType`: `pending`, `single`, `multiple`); `status` is a `DownloadStatus` (`src/shared/models/batch-download/download-status.ts`, which also has `isTerminalStatus` and `isPausedStatus`): `pending`, `queued`, `resolving`, `resolved`, `downloading`, `paused`, `duplicate`, `rate-limited`, `completed`, `failed`.
    - `Pending` items: `pending` → `resolving` → (replaced by a single or multiple item) | `rate-limited` → `pending` again after `nextRetryAt` | `failed` (`failReason: 'unverified'` when Bandcamp withholds the URLs of an unverified account).
    - `Single` items: `resolved` → `queued` → `downloading` → `completed` | `paused` | `duplicate` | `failed`.
    - `Multiple` items: progress is the share of completed children; `completed` when all children completed, `failed` when all are finished and one failed, `resolved` again after a child retry.
- Storage keys (`state.ts`, `chrome.storage.local`): `batchDownloadItems` (the list), `batchDownloadQueuedItems` (the transport queue from enqueue to the runner), `batchDownloadTabId` (the downloads tab; cleared by `tab-cleanup.ts` when that tab closes; downloads continue).
- **Write queue**: every read-modify-write of `batchDownloadItems` and `batchDownloadQueuedItems` goes through `updateBatchDownloadItems`, `appendQueuedBatchDownloadItems` or `drainQueuedBatchDownloadItems`, which run one after another (`enqueueStateWrite`, a `createSerialQueue()`). To change one item inside such an update use `patchItem(items, id, type, patch)`: it leaves every other item, and an item of another type with the same id, alone. Runner ticks, the poller, `onChanged` events and user actions run at the same time; a direct `chrome.storage.local.set` of these keys would lose changes. Never bypass it.
- The download UI: `chrome.downloads.setUiOptions({ enabled })` (Chrome 117+), else `setShelfEnabled`, else nothing (`setDownloadsShelfEnabledSafe`).

## Alarms, retries and backoff

- **Watchdog**: alarm `band-play-batch-download-watchdog`, every 0.5 minutes while work is running; it reconciles tracked downloads with their real browser state, restarts the poller and schedules a tick. `chrome.alarms` is feature-detected.
- **Retry alarm**: one-shot `band-play-batch-download-retry` for a retry delay of 25 s or more (`setTimeout` does not survive a stopped worker).
- **Automatic retries** of an interrupted or failed download: `MAX_AUTO_RETRIES` 3, delays 5 s, 10 s, 20 s; the last attempt re-resolves the signed file URL from `pageUrl` first (`needsUrlRefresh`). An interrupted download with `canResume` is resumed in place (counts as one attempt). `USER_CANCELED` is never retried; `USER_SHUTDOWN` is.
- **HTTP 429** from Bandcamp (`BandcampRateLimitError`): backoff 10 s, 15 s, 30 s, 60 s (then 60 s) with ±30 % jitter, at most `MAX_RATE_LIMIT_ATTEMPTS` 8, then `failed`.
- A "complete" download smaller than 16 KB, with a `text/html` MIME type or with a missing file counts as failed (an HTML error page).
- **Duplicates**: when the browser uniquified the name (`x (1).zip`) because the file exists, the download is paused and marked `duplicate`; Resume continues it and sets `duplicateResumed`. On Chrome the name is compared with the name recorded in `onDeterminingFilename` (`expected-filenames.ts`); without a recorded name (Firefox, or after a browser restart) the download is a duplicate only when the browser already has the file without the ` (n)` suffix (`downloads.search({ filename })`), so a title such as `Album (2)` is not paused.
- Manual actions (`actions.ts`): retry (a failed parent retries its failed children; the URL is refreshed), retry all failed, pause / resume (item or all), cancel (stays as `failed`), remove (cancels the browser download), delete file (`downloads.removeFile`, completed items only), show in folder (`downloads.show`), clear completed, clear all.

## Batch options and notification

- Settings read by `enqueuePendingItems` (`actions.ts`): `batchDownloadSkipDownloaded` leaves out releases whose `"<sourceId>::<format>"` is already in the history (the format is the item's, the batch's or the default); `batchDownloadOpenPage` (default true) opens or focuses the downloads tab, the queue starts either way; `batchDownloadNotify` marks the batch for a notification.
- `notify.ts`: the key `batchDownloadNotifyPending` (local storage, the batch start time) is set when a batch is queued with `batchDownloadNotify` on. When the runner finds nothing running (`announceFinishedBatch`), it takes the mark once and shows "N releases downloaded, M failed" (`chrome.notifications`, history entries newer than the start). The `notifications` permission is **optional** in both manifests: the popup asks for it from the switch click (`requestNotificationsPermission` in `permissions.utils.ts`); without it `chrome.notifications` is missing and nothing is shown. A click on the notification does nothing yet.

## Expected filenames (duplicate detection)

- The extension never renames downloads: the server names are kept (the filename template was removed).
- `expected-filenames.ts`: the top-level `chrome.downloads.onDeterminingFilename` listener (Chrome only) records the pre-uniquify basename of **the extension's own downloads** (`item.byExtensionId === chrome.runtime.id`) and calls `suggest()` without changes; the user's other downloads are left alone. The map (at most 500 entries, oldest dropped) is kept in `chrome.storage.session` (`batchDownloadExpectedFilenames`) to survive a worker restart. `getExpectedFilename`, `isUniquifiedVariantOf` and `toBaseFileName` serve the duplicate check in the runner.
- Firefox has no `onDeterminingFilename`: nothing is recorded and the runner checks the downloads list (see "Duplicates").

## History

- `src/shared/services/batch-download-history-service.ts`: key `batchDownloadHistory`, a map `"<sourceId>::<format>"` → completion time. The runner adds an entry when a top-level item becomes `completed` (writes are serialized); the content script reads it to mark downloaded items. The key includes the format, so a release downloaded as MP3 is still offered for FLAC.

## Ports

- The downloads page holds the `BatchDownloadUi` port open (`ui-presence.ts`); the poller runs only while a port is connected, and progress is pushed with `broadcastBatchDownloadProgress`. Details: [messaging.md](messaging.md).

## Tests

- Unit: `tests/unit/enqueue-pending-items.spec.ts` (the batch options), `tests/unit/tick-logic.spec.ts` and `tests/unit/batch-download-items.spec.ts` (the pure decisions of a tick, `patchItem`, `resumedSingle`), `tests/unit/expected-filenames.spec.ts` (`toBaseFileName`, `isUniquifiedVariantOf`), `bandcamp-parser.spec.ts` (with a fake `fetch`). The settings file and the new config keys: `config-service.spec.ts`.
- e2e: `tests/e2e/downloads-page.spec.ts` (the downloads page with seeded items) and `tests/e2e/batch-download-ui.spec.ts` (checkboxes, the bar, the history marks, on hand-written pages). **Not covered:** the runner and real downloads, and the real collection and purchases markup; check them by hand with a Bandcamp account that has purchases.
