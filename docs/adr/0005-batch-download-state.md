# 0005. Keep the batch download state in storage and alarms

- Status: Accepted
- Date: 2026-10-23 (commits `3fd9eb9` and `e1b3a8e`)

## Context

In Manifest V3 the background script is a service worker. The browser stops it when it is idle, so a batch download that runs for minutes cannot rely on variables in memory. A batch can also outlive the browser session, and the Bandcamp download pages can answer "too many requests", which means waiting before the next request.

## Decision

- The queue of the batch download is stored in `chrome.storage.local` (the key `batchDownloadItems`). The runner reads the queue on each step.
- The runner wakes up with `chrome.alarms`: a periodic watchdog alarm keeps a running batch going, and a retry alarm resumes it after Bandcamp asks to slow down.
- The map of expected file names is stored in `chrome.storage.session`, so it survives a restart of the service worker but not a restart of the browser.

## Consequences

- Everything the runner needs must be serializable and stored before the runner waits.
- A tick of the runner is a pure decision (see `tests/unit/tick-logic.spec.ts`), so the timing rules can be tested without a browser.
- Chrome-only download features are checked before use, because Firefox does not have them (see [usage.md](../usage.md)).
