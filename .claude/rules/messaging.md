---
paths:
    - 'src/**/*.{ts,tsx}'
---

# Messaging (messages and ports)

> How the content script, the background, the popup and the downloads page talk to each other.

## Message model

- Every message is a `MessageModel<T>` (`src/shared/models/messages/base/message-model.ts`): `{ code: MessageCode; data?: T }`. Payload types live in `src/shared/models/messages/` and are exported from its `index.ts`: `NewTabMessage` (`url`, `active`), `BatchDownloadItemsMessage` (`items`, optional `format`), `BatchDownloadItemIdMessage` (`id`), `BatchDownloadProgressMessage` (`updates: { id, progress }[]`, 0–100).
- `MessageCode` (`src/shared/enums/message-code.ts`), every value prefixed `band-play-`:

| Code                                                                                                                                                                                        | From → to                                   | Payload                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| `CreateNewTab`                                                                                                                                                                              | content → background                        | `NewTabMessage`                                     |
| `UrlChanged`                                                                                                                                                                                | background → content (the tab that changed) | none                                                |
| `NewUpdateAvailable`                                                                                                                                                                        | background → content (active tab)           | `runtime.onUpdateAvailable` details; no handler yet |
| `BatchDownloadSendItemsToBackground`                                                                                                                                                        | content → background                        | `BatchDownloadItemsMessage`                         |
| `BatchDownloadOpenDownloadsTab`                                                                                                                                                             | popup → background                          | none                                                |
| `BatchDownloadRetryItem`, `BatchDownloadResumeItem`, `BatchDownloadPauseItem`, `BatchDownloadCancelItem`, `BatchDownloadDeleteFile`, `BatchDownloadRemoveItem`, `BatchDownloadShowInFolder` | downloads page → background                 | `BatchDownloadItemIdMessage`                        |
| `BatchDownloadRetryAllFailed`, `BatchDownloadPauseAll`, `BatchDownloadResumeAll`, `BatchDownloadClearCompleted`, `BatchDownloadClearAll`                                                    | downloads page → background                 | none                                                |
| `BatchDownloadProgressUpdate`                                                                                                                                                               | background → downloads page, over the port  | `BatchDownloadProgressMessage`                      |

## `messageService` (`src/shared/services/message-service.ts`)

- `sendToBackground(message)` → `chrome.runtime.sendMessage`; `sendToContent(tabId, message)` → `chrome.tabs.sendMessage`; `sendToActiveContent(message)` sends to the active tab of the current window.
- `addListener(func, errorHandler?)` wraps `chrome.runtime.onMessage`: it ignores messages without `code`, calls `func` and routes a thrown error **or a rejected promise** to `errorHandler`. Without an `errorHandler` the error is dropped silently, so pass one (`(e) => console.error(e)`) when the handler can fail. The listener never calls `sendResponse` and returns nothing: messages are one-way, and `sendToBackground` resolves with no value.
- Listeners: `MessagesBackgroundService` (background, a `switch` over the codes, no `errorHandler` today) and, in the content script, `PageServiceWorker` and `BatchDownloadService` (both react to `UrlChanged`).
- Background handlers validate the payload and do nothing on bad data (missing `items` or `id`). `CreateNewTab` opens only absolute `http:` / `https:` URLs (`isWebUrl`), because the URL comes from the page.

## No receiver

- A message to a tab without the content script (still loading, never injected, not a Bandcamp page) rejects with "Could not establish connection. Receiving end does not exist." `UrlChangeBackgroundService` ignores exactly that error (it checks the message text for `Receiving end does not exist`) and logs any other; `UpdateAvailableBackgroundService` ignores every error.
- After an extension update or reload the old content script is orphaned: its `chrome.*` calls throw "Extension context invalidated". `PageServiceWorker` checks `chrome.runtime?.id` and stops its `initTracks` timer.
- A sender always handles the returned promise (`.catch(...)`): `@typescript-eslint/no-floating-promises` is an error in `src/`.

## Ports

- `PortName` (`src/shared/enums/port-name.ts`): `BatchDownloadUi` = `band-play-batch-download-ui`, the only `chrome.runtime.connect` port.
- The downloads page (`src/downloads/downloads-app.tsx`) connects on mount and reconnects 1 s after a disconnect (the MV3 service worker can stop at any time). The background (`src/background/batch-download/ui-presence.ts`) keeps the open ports in a `Set` in memory: `isDownloadsUiConnected()` is true while one is open, a new connection starts the progress poller, and `broadcastBatchDownloadProgress(updates)` posts `BatchDownloadProgressUpdate` to every port. Progress values sent this way are volatile (not written to storage); state changes still go through `batchDownloadItems` in storage ([batch-download.md](batch-download.md)).

## Adding a message

1. Add a `MessageCode` member with the `band-play-` prefix and a comment that names sender and receiver.
2. Add a payload interface under `src/shared/models/messages/` and export it from `index.ts` (keep `data` small and serializable: no DOM nodes, no functions).
3. Handle it in `MessagesBackgroundService` (background) or with `messageService.addListener` (content); keep the handler small and delegate the work to a service.
4. Handle the "no receiver" rejection at the sender.
5. Update the table above.

- Do not use string codes outside `MessageCode`. Do not add `sendResponse` replies without updating `messageService` (it does not support them).
