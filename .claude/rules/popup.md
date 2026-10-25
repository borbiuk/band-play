---
paths:
    - 'src/options/**'
    - 'public/options.html'
---

# Toolbar popup (`src/options/`)

> Settings UI: React 19 + Tailwind 3 with the redesign tokens and the UI primitives of [design-system.md](design-system.md) (`@shared/components/ui`). It is only the toolbar popup (`action.default_popup` `./options.html`, 400 × 560 px); the manifests have no `options_ui`. The approved design is `design/popup/popup.html` and `design/popup/NOTES.md`.

## Layout (`options.tsx`)

- One `Options` component with a glass header (`components/popup-header.tsx`: logo, name, GitHub, Buy Me a Coffee and Chrome Web Store reviews links, then the tabs), a panel in the middle and a glass footer (`components/popup-footer.tsx`). The popup background is plain white; the panel scrolls under the glass bars.
- Tabs (`components/tabs.tsx`: text only, underline on the selected tab; `role="tablist"`, arrow keys, Home and End, roving tabindex). Only the selected panel is mounted:
    - **Playback** (`components/panels/playback-tab.tsx`): `autoplay`, `loopTrack`, `mediaKeys`, `keepAwake` (only when `chrome.power` exists; red "Use with care" style) and `playbackStep` (`NumberStepper`: 1 to 120 sec, the buttons move to the next multiple of 5, typing is allowed, the id `playbackStep-number-input`).
    - **Page** (`page-tab.tsx`): `highlightVisited`, `autoscroll`, `showFeedPlayer`, and the visited history: the number of stored entries (`countVisited` over the stored value, read with `useStorageValue`; a release adds several hashes, so it is not a count of releases) and **Clear** with a confirm dialog (`clearVisitedHistory`).
    - **Downloads** (`downloads-tab.tsx`, must fit without scrolling): "Open downloads" with the counts from `batchDownloadItems` (`hooks/use-download-summary.ts`; sends `BatchDownloadOpenDownloadsTab`), `batchDownloadFormat`, `batchDownloadConcurrency`, `batchDownloadNotify`, `batchDownloadOpenPage`, `batchDownloadSkipDownloaded`.
    - **Shortcuts** (`shortcuts-tab.tsx`): search, **Reset** (confirm; `configService.resetShortcuts()` writes `shortcuts` `{}` and `disabledShortcuts` `[]` in one call), and a scrolling list (the list scrolls, the panel does not). Each row has the key caps, a pencil button "Change shortcut for …" and a switch "Enable …" (`disabledShortcuts`); a pink dot marks a combination changed from the default.
- The header links (GitHub, Buy Me a Coffee, rate) come from `src/shared/constants/links.ts`. Firefox has no store page yet, so the rate link is not shown there (`getRateUrl()` returns null); the downloads page footer and the collection page tab follow the same rule.
- `Switch` inside a `SettingRow` is described by the row's hint (`SettingRowHintContext`, `aria-describedby`).
- Footer: the version, **Import**, **Export** and **Reset all** (confirm; `configService.resetSettings()`); a short result shows in place of the version (`role="status"` or `role="alert"`). Export downloads `band-play-settings.json` (`configService.exportSettings()`); Import reads a file with `importSettings`, which validates it (a foreign file is refused). In Firefox a popup closes when a file dialog opens, so Import opens `options.html#import` in a tab (`components/import-page.tsx`).
- `createRoot` gets `renderErrorOptions(container, 'settings')`: an uncaught render error shows a short `role="alert"` message instead of a blank popup.

## Saving

- `src/shared/hooks/use-config.ts`: one `useConfig()` loads the settings, follows `configService.addListener`, and `update(key, value)` shows the new value at once and writes that single key (`configService.update`).
- **No writes on open**: nothing saves from an effect; `Switch`, `NumberStepper`, `Range` and `Select` call `update` only from their change handlers, so opening the popup writes nothing, also in a StrictMode development build. `tests/e2e/popup-settings.spec.ts` checks that only the changed key is stored. Keep this when you add a control: never write a default back.
- **Notifications**: `batchDownloadNotify` needs the optional `notifications` permission. The switch asks for it from the click (`requestNotificationsPermission`, called before anything is awaited) and saves `true` only when it is granted; the switch shows on only while the permission is still granted. A refusal shows a red hint.

## Shortcut dialog (`components/shortcut-edit-dialog.tsx`)

- The pencil opens a native `<dialog>` (`Dialog` primitive, `showModal()`) with a read-only field "Key combination", an alert area, **Use default**, **Cancel** and **Save**.
- Recording (`keydown` on the field, `preventDefault` + `stopPropagation`): Tab is left alone, Escape closes the dialog, a key event without `code` is ignored. The combination is the held modifiers from the event flags plus `event.code`; modifiers alone show a live preview and are not a combination. Keys are shown with `mapToHumanString` (`⌘`, `⌥`, `⇧`, arrows on Mac); the digit key shows as `1–9` or `0–9` (`toKeyLabels`).
- The error shows at once and **Save stays off**: a browser-reserved combination (`isReservedByBrowser` in `utils/shortcut-recorder.utils.ts`: Control/Meta with letters (not M), digits, `Equal`, `Minus`, `Tab`, `Space`, `PageUp`, `PageDown`, `F4`; `F5`, `F11`, `F12` always; Alt with `ArrowLeft`, `ArrowRight`, `KeyD`, `KeyE`, `KeyF`, `Home`) or a combination another **enabled** shortcut uses (`findConflict`, compared after `mapShortcutToString` normalization, the same one the content script uses; a shortcut switched off never conflicts). Otherwise Save writes the whole `shortcuts` object with `JSON.stringify(keys)` for that type.
- **Use default** writes `'[]'` for the type, which `configService` reads as "use the default"; it refuses when another enabled shortcut uses the default combination now.
- A new `ShortcutType` appears in the list without popup changes ([extension-architecture.md](extension-architecture.md), "How to add a keyboard shortcut").

## Firefox

- `chrome.power` does not exist: the Keep awake row is not rendered (and the background ignores `keepAwake`).
- Import opens in a tab (see above); this path is not covered by the tests and must be checked by hand.
- Everything else is the same in both browsers. More: [firefox.md](firefox.md).

## Checks

- Open the popup in Chrome and Firefox and check that nothing is written on open, that each control saves only its key, the shortcut dialog errors, and that the Downloads tab does not scroll. e2e tests: `tests/e2e/popup-settings.spec.ts`, `tests/e2e/popup-shortcuts.spec.ts` (they open `options.html` in a tab, Chromium only). The notification permission prompt is not automated: check it by hand.
