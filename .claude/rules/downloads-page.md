---
paths:
    - 'src/downloads/**'
    - 'public/downloads.html'
---

# Downloads page (`src/downloads/`)

> The page `downloads.html` that batch download opens in a tab: the queue with progress and per-item controls. React 19 + Tailwind 3 with the redesign tokens and primitives ([design-system.md](design-system.md)). The approved design is `design/downloads/downloads.html` and `design/downloads/NOTES.md`. How the queue runs: [batch-download.md](batch-download.md).

## Layout (`downloads-app.tsx`)

- A sticky glass header (`glass`) holds, in order: `DownloadsHeader` (brand, the format select and the parallel downloads slider; they save `batchDownloadFormat` and `batchDownloadConcurrency` with `useConfig`), `SummaryCard`, and `ControlsBar`. Summary and controls show only when the list is not empty; otherwise `EmptyState` (three steps and an "Open Bandcamp" link) shows. The page scrolls under the header.
- `ControlsBar`: filter chips with counts (All, Active, Paused, Failed, Done, counted over top-level rows), a search box, a **Sort by** select (Queue order, Title A–Z, Status), fold or unfold all bundles, one main button (**Pause all** while something downloads, otherwise **Resume all**, off when neither applies), **Retry failed** with a count (only when something failed) and the "..." menu (`ActionsMenu`: Clear completed, **Clear all…** which opens a confirm dialog).
- `DownloadRow` (`components/download-row.tsx`): a fixed-height row (`h-16`): fold toggle (bundles), cover (a plain tile when the image is missing or fails), title and subtitle, status pill (icon and label, never color alone), percent, progress bar, a hint line, and actions. The first action (Retry, Resume, Pause or Show in folder/Finder) is always visible; the others (Cancel, Copy Bandcamp link, Delete file from disk, Remove from list) show on hover and focus. Delete file asks for confirmation in a dialog.
- A **bundle** is a `Multiple` item with its files (`Single` items with `parentId`). It shows as one row with a fold toggle, its files one level deeper. An album is always one zip, so tracks inside it are never listed.
- The footer has the version, the author and the GitHub, donate and rate links (`src/shared/constants/links.ts`; no rate link in Firefox).
- On windows under 760 px the status column is narrower, the hint line is hidden and the action column grows to fit the actions; the secondary actions still show on hover and focus.
- The title of the tab follows the progress (`BandPlay · 42%`, `... paused`).

## Pure logic (`utils/`, covered by unit tests)

- `list.utils.ts`: `statusGroup`, `countByFilter`, `buildRows` (filter, search, sort, bundles), `duplicateIndexById` (a release queued twice shows as `Title (2)`), `bundleFiles` (the files of every bundle in one pass, computed once per list with `useMemo`) and `filesOfBundle`. Default order: newest batch first, then the collection order.
- `row-view.utils.ts`: `toRowView` turns an item into what a row shows (status kind, hint, progress, actions). Hints: rate limit countdown from `nextRetryAt`, "Already exists. Resume to keep both", "Email not verified" (`failReason: 'unverified'`).
- `computeOverall` (`src/shared/utils/batch-download-overall.utils.ts`, shared with the popup): totals, shares, sizes; a release that is not resolved yet counts as one download.
- `format.utils.ts`: sizes, speed and time left.

## Data and live progress

- `hooks/use-downloads.ts` returns `{ items, isLoaded }` (the page shows a placeholder until the list is read, so the empty state does not flash); it reads `batchDownloadItems` (key in `src/shared/constants/storage-keys.ts`), follows its changes, opens the `BatchDownloadUi` port (reconnects 1 s after a disconnect) and puts the volatile progress over the stored value. It never writes; every change goes to the background as a message ([messaging.md](messaging.md)).
- `hooks/use-transfer-rate.ts` (speed and time left from the last 5 s), `hooks/use-now.ts` (a one-second clock while a countdown is shown).

## Windowing

- Rows are 64 px high. Above 100 rows only the visible slice plus an overscan is rendered, with spacer `li` elements for the rest (`ROW_HEIGHT`, `WINDOWED_THRESHOLD` in `downloads-app.tsx`). Keep the row height fixed when you change a row, or the spacers drift.

## Checks

- `tests/e2e/downloads-page.spec.ts` seeds `batchDownloadItems` and checks the summary, filters, search, sort, bundles, hints, the clear dialogs, the header settings and windowing. It seeds only states the background leaves alone (completed, failed, paused, a retry far in the future): a running or pending item would make the runner fetch Bandcamp.
- Not automated: live progress and speed (they need real downloads), the Firefox layout. Check a real batch by hand with an account that has purchases.
