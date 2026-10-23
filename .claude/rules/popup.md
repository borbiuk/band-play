---
paths:
    - 'src/options/**'
    - 'public/options.html'
---

# Toolbar popup (`src/options/`)

> Settings UI: React 19 + Tailwind 3 (`options.scss` with `@tailwind base` and `utilities`; the `band` colors from `tailwind.config.js`), tooltips from `react-tooltip`. It is only the toolbar popup (`action.default_popup` `./options.html`); the manifests have no `options_ui`.

## Layout (`options.tsx`)

- Header: logo (`./../assets/logo-128.png`), "BandPlay" and `ExternalLinksPopup` (`src/shared/components/external-links.tsx`: GitHub, Buy Me a Coffee, Chrome Web Store reviews, opened with `window.open`).
- Three columns, each `w-46`:
    - **Common** (`components/configuration.tsx`): `Checkbox` rows (`components/internal/checkbox.tsx`) for `autoplay`, `autoscroll`, `keepAwake` (only when `chrome.power` exists), `showFeedPlayer` and `highlightVisited`. The element `id` is the config key. It renders "..." until the config and the active tab id (`chrome.tabs.query`) are loaded.
    - **Shortcuts** (`components/shortcut-input.tsx`) and **Playback step** (`components/playback-step.tsx` with `internal/playback-step-input.tsx`: number field `#playbackStep-number-input`, − / + buttons that move to the next multiple of 5, 1–120 "sec").
    - **Downloads** (`components/batch-download.tsx`): "Open downloads" (only while `batchDownloadItems` has active items; sends `BatchDownloadOpenDownloadsTab`) and `BatchDownloadControls` (`src/shared/components/batch-download.tsx`): format `<select>` (`batchDownloadFormatLabel`), concurrency range 1–15 and, on Chrome only, the filename template field.
- Footer text "by borbiuk". The body width is `max-content` (`options.scss`).
- `createRoot` gets `renderErrorOptions(container, 'settings')`: an uncaught render error shows a short `role="alert"` message instead of a blank popup.

## Saving

- **Every control saves on change** with `configService.update(key, value)` (`chrome.storage.local`); there is no Save button except in the shortcut recorder.
- **No writes on open**: `Checkbox` and `PlaybackStepInput` skip their first effect run (`isFirstRender` ref), so opening the popup writes nothing. `tests/e2e/popup-settings.spec.ts` checks that only the changed key is stored. Keep this when you add a control: never write a default back.
- The filename template autosaves 300 ms after the last key press (`TEMPLATE_SAVE_DELAY_MS`), and at once on blur, Enter, `pagehide` and unmount; the value is trimmed. The popup closes when it loses focus, so pending text must be flushed.
- `ShortcutInput` and `BatchDownloadControls` follow `configService.addListener`; `Configuration` and `PlaybackStep` read the config once when the popup opens.

## Shortcut recorder (`components/shortcut-input.tsx`)

- A `<select>` "Shortcut to change" lists `Object.values(ShortcutType)` (the enum values are the labels), a read-only text field "Key combination" records the keys, and **Save** / **Reset** buttons; messages go to `role="status"` and `role="alert"` spans.
- Recording (`keydown` on the field, `preventDefault` + `stopPropagation`): Tab is left alone, Escape cancels, a key event without `code` is ignored. The combination is the held modifiers from the event flags (`Control`, `Meta`, `Alt`, `Shift`) plus `event.code`; modifiers alone show a live preview and are not a combination. Keys are shown with `mapToHumanString` (`⌘`, `⌥`, `⇧`, arrows on Mac).
- **Save** refuses: no recorded combination ("Press a key combination first."), a browser-reserved combination (`isReservedByBrowser`: Control/Meta with letters, digits, `Equal`, `Minus`, `Tab`, `Space`, `PageUp`, `PageDown`, `F4`; `F5`, `F11`, `F12` always; Alt with `ArrowLeft`, `ArrowRight`, `KeyD`, `KeyE`, `KeyF`, `Home`) and a combination another shortcut already uses (`findConflict`, compared after `mapShortcutToString` normalization, the same one the content script uses). Otherwise it writes the whole `shortcuts` object with `JSON.stringify(keys)` for the selected type.
- **Reset** writes `'[]'` for the type, which `configService` reads as "use the default"; it refuses when another shortcut uses the default combination now.
- A new `ShortcutType` appears in the list without popup changes ([extension-architecture.md](extension-architecture.md), "How to add a keyboard shortcut").

## Firefox

- `chrome.power` does not exist: the Keep Awake checkbox is not rendered (and the background ignores `keepAwake`).
- `chrome.downloads.onDeterminingFilename` does not exist: the filename template field is not rendered.
- Everything else is the same in both browsers. More: [firefox.md](firefox.md).

## Checks

- Open the popup in Chrome and Firefox and check that nothing is written on open, that each control saves only its key, and the recorder errors. e2e tests: `tests/e2e/popup-settings.spec.ts`, `tests/e2e/popup-shortcuts.spec.ts` (they open `options.html` in a tab, Chromium only).
