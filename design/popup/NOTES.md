# Popup redesign notes

Prototype: `popup.html` (open in a browser). Screens: `screens/`. Shared styles: `../tokens.css`, `../components.css`.

## Layout

- Size 400 x 560 px (Chrome popups are at most 800 x 600). The old popup was `max-content` wide, so the real popup must set an explicit size.
- Top and bottom bars are glass (`backdrop-filter: blur`); the panels scroll under them. Fallback: opaque white when `backdrop-filter` is missing.
- Four text-only tabs with an underline on the selected one (`role="tablist"`, arrow keys, Home/End): Playback, Page, Downloads, Shortcuts.

## Settings per tab

- Playback: `autoplay`, `loopTrack`, media keys (new), `keepAwake` (Chrome only, styled as a risky setting: red hint, "Use with care" badge, red switch), `playbackStep` (stepper 1-120, no preset chips).
- Page: `highlightVisited`, `autoscroll`, `showFeedPlayer`, visited history count and Clear (new).
- Downloads (fits without scrolling): open downloads, `batchDownloadFormat`, `batchDownloadConcurrency` (slider), notify when finished (new), open downloads page on start (new), skip already downloaded (new). The filename template is removed.
- Shortcuts: the list scrolls inside its card (the panel does not). Each row has the keys, an Edit button and an on/off switch. Edit opens a dialog with the key input, an error area, Cancel and Save. Reset with confirm.
- Footer: version, Import, Export (new), Reset all (new, confirm).

## New behaviour that needs code

- Media keys switch, clear visited history, notifications, open downloads page on start, skip already downloaded, import/export, reset all.
- **Per-shortcut switch**: store the disabled ones (for example a `disabledShortcuts` list of `ShortcutType`, default empty = all on). `UserInputService` skips a disabled shortcut, and its key stays free for the page. A disabled shortcut does not count as a conflict when another one is recorded. Reset shortcuts should also turn everything back on.
- **Remove the filename template**: `batchDownloadFilenameTemplate`, `filename.ts`, `filename-router.ts` (and the `onDeterminingFilename` listener and session maps), their unit and e2e tests, and the docs (`batch-download.md`, popup rules, README, LISTING). Check whether the `downloads.shelf` and `downloads.ui` permissions are still needed.

## Implementation notes

- Switch: `<input type="checkbox" role="switch">` with `appearance: none`. The `switch` attribute is Safari-only, so no polyfill and no reliance on it.
- Dialogs: native `<dialog>` opened with `showModal()` from script. Invoker commands (`commandfor`) need Firefox 144, and the extension supports Firefox 128+.
- Every control still saves on change; no Save button except in the shortcut recorder (see `.claude/rules/popup.md`).
- Keep the "no writes on open" rule: never write a default back.
- Colors: brand `#1DA0C3` (switch on, focus, sliders); text on brand buttons uses `#0F6F8A` for AA contrast. Accent pink `#E8508A` (badge fill `#BE2F6A`) only for counters and dots; warnings and errors use deep coral. White background, no gradient.
