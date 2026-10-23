---
paths:
    - 'src/**'
    - 'public/**'
    - 'webpack/**'
    - 'tsconfig.json'
    - 'tailwind.config.js'
    - 'postcss.config.js'
---

# Extension architecture (MV3, Chrome + Firefox)

> Architecture rules for the Band Play MV3 extension and its build constraints.

## Entry points

- `src/content/content.ts`: content script on `https://bandcamp.com/*` and `https://*.bandcamp.com/*` (`run_at: document_idle`). It imports `styles/visited.scss` and `styles/batch-download.scss` and builds three services:
    - `PageServiceWorker` (`services/page-service-worker.ts`): picks the first page service whose `isServiceUrl(url)` is true, in this order: `AlbumPageService` (`/album/`, `/track/`), `DiscoverPageService` (`/discover`), `FeedPageService` (URL ends with `/feed` or has `/feed?`; also renders the React feed player), `CollectionPageService` (`^https://bandcamp.com/<user>(/wishlist)?$`, query ignored). No match means `pageService` is `null`. It loads the config into the service, re-picks the service on `MessageCode.UrlChanged`, pushes config changes into it, runs `tryAutoplay()` every 250 ms (only when `config.autoplay`) and `initTracks()` every 300 ms. When the extension was updated or reloaded (`chrome.runtime.id` missing) it stops the `initTracks` timer. Selectors: [bandcamp-dom.md](bandcamp-dom.md).
    - `UserInputService` (`services/user-input-service.ts`): keyboard shortcuts and media keys (see "Keyboard shortcuts" below).
    - `BatchDownloadService` (`services/batch-download-service.ts`): checkboxes and the overlay on collection, wishlist and purchases pages ([batch-download.md](batch-download.md)).
    - When `serviceWorker.start()` and `userInputService.start()` have resolved (settings and shortcuts loaded), `content.ts` sets `data-band-play="ready"` on `<html>`. The e2e tests wait for it; keep it.
- Page services: `PageService` interface (`src/shared/interfaces/page-service.ts`) → `BasePageService` (`src/content/page-services/base/base-page-service.ts`, no-op defaults and `createNewTab`, which sends `CreateNewTab` to the background) → `BaseBandcampPageService` (`page-services/bandcamp/base/base-bandcamp-page-service.ts`: `audioOperator` finds the `<audio>` element, also inside shadow roots; play/pause, seek, speed ±0.01, `preservesPitch`, visited highlighting, autoplay at 99.5 % progress) → the four Bandcamp services.
- `src/background/background.ts`: one instance per browser; starts these services (each `start()` in its own try/catch):
    - `UrlChangeBackgroundService`: `tabs.onUpdated` with a new URL that contains `bandcamp.com` → `UrlChanged` to that tab.
    - `UpdateAvailableBackgroundService`: `runtime.onUpdateAvailable` → `NewUpdateAvailable` to the active tab (no content handler yet).
    - `KeepAwakeBackgroundService`: `chrome.power.requestKeepAwake('display')` / `releaseKeepAwake()` from `config.keepAwake`; does nothing when `chrome.power` is missing (Firefox).
    - `BatchDownloadBackgroundService` (`batch-download/`): runner, alarms watchdog, `downloads.onChanged`, tab cleanup, the filename router (Chrome-only `onDeterminingFilename`, only the extension's own downloads) and the downloads UI port ([batch-download.md](batch-download.md)).
    - `MessagesBackgroundService`: the only `runtime.onMessage` handler in the background ([messaging.md](messaging.md)).
- `src/options/options.tsx`: toolbar popup (`action.default_popup` `./options.html`), React 19 + Tailwind 3 ([popup.md](popup.md)).
- `src/downloads/downloads.tsx`: the downloads page (`downloads.html`), React + Tailwind; reads `batchDownloadItems` from storage and connects the `BatchDownloadUi` port.
- `src/shared/`: `enums/`, `models/` (`ConfigModel`, `BandcampTrackModel`, `messages/`), `interfaces/`, `services/` (`config-service`, `message-service`, `visited-service`, `batch-download-history-service`, `event-emitter`), `components/` (buttons, external links, `BatchDownloadControls`), `utils/` (guards, `isMac`, shortcut and time helpers, `renderErrorOptions`).
- `src/types/global.d.ts`: ambient declarations.
- Both React pages pass `renderErrorOptions(container, name)` (`src/shared/utils/render-error.utils.ts`) to `createRoot`: after an uncaught render error they show a short `role="alert"` message instead of a blank page.

## Storage

- Everything is in `chrome.storage.local` (not `sync`); `storage.session` only holds the filename router maps.
- **Config** (`src/shared/services/config-service.ts`): one storage key per `ConfigModel` field, listed in `CONFIG_KEYS`. `getAll()` reads only these keys and applies defaults and validation: `autoplay` true, `autoscroll` true, `keepAwake` false, `highlightVisited` true, `playbackStep` 10 (outside 1–120 → 10), `loopTrack` false, `showFeedPlayer` true, `batchDownloadFormat` `wav` (unknown value → `wav`), `batchDownloadConcurrency` 8 (outside 1–15 → 8), `batchDownloadFilenameTemplate` `''`. `update(key, value)` writes one key. `addListener` calls back with a fresh `getAll()` only when a key from `CONFIG_KEYS` changed (download progress and visited history writes do not reload the config).
- **Shortcuts** are stored under `shortcuts` as an object `{ [ShortcutType]: string }`; each value is a JSON string of key codes such as `'["ArrowDown","Shift"]'`. `mergeShortcuts` starts from `defaultShortcuts()` and keeps a stored value only for known `ShortcutType` keys whose value parses to a non-empty array of strings; `'[]'` or a corrupt value means "use the default". `defaultShortcuts()` returns a new object on every call.
- **Visited history** (`src/shared/services/visited-service.ts`): key `bp_visited_v1`, an array of cyrb53 base36 hashes of `bc|tralbum|<id>` and `bc|url|<pathname>`; writes are debounced (800 ms), merged with the stored list (other tabs) and capped at the newest 50 000 entries. Visited items get the class `band-play-visited` (`styles/visited.scss`).
- **Batch download**: `batchDownloadItems`, `batchDownloadQueuedItems`, `batchDownloadTabId`, `batchDownloadHistory` (local) and `batchDownloadPendingFilenames`, `batchDownloadExpectedFilenames` (session). Details: [batch-download.md](batch-download.md).

## Keyboard shortcuts

- Defaults (`configService.defaultShortcuts()`): Play/Pause Space, previous B, next N, play track by index Shift+digit, loop track Shift+V, speed up ArrowUp, speed down ArrowDown, speed reset Shift+ArrowDown, pitch switch P, pitch reset Shift+P, seek forward ArrowRight, seek backward ArrowLeft, seek to percentage digit (×10 %), open in new tab O, open with focus Shift+O, wishlist L. `KeyCode.Digit` (`'1'`) is the placeholder for any digit key.
- Matching (`UserInputService.listenHotkeys`): a `keydown` listener on `document` in the capture phase. It ignores typing (`isComposing`, `defaultPrevented`, a content-editable target, `input`, `textarea`, `select` or Bandcamp's `menu-bar` element, read from `composedPath()[0]`), lone modifier keys and pages without a page service (their arrows and Space keep scrolling). The pressed combination is the held modifiers from the event flags (`ctrlKey`, `metaKey`, `altKey`, `shiftKey`) plus `event.code`, as a `ShortcutSet`; only an **exact** match (`ShortcutSet.equal`, same size) runs a handler, so Ctrl+P stays print. A match calls `preventDefault()`; a repeated `keydown` (`event.repeat`) runs nothing, so a held key runs the shortcut once. Shortcuts run on `keydown` because macOS sends no `keyup` for a key pressed with Cmd.
- `ShortcutSet` (`src/content/shortcut/shortcut-set.ts`) normalizes keys with `mapShortcutToString` (`ShiftLeft`/`ShiftRight` → `shift`, any `Digit*` → `1` and `digit` holds the number).
- Media keys (`navigator.mediaSession`): next, previous, seek forward, seek backward, play and pause call the page service; they do nothing on pages without one.
- The popup recorder rejects browser-reserved and duplicate combinations ([popup.md](popup.md)).

### How to add a keyboard shortcut

1. Add a value to `ShortcutType` in `src/shared/enums/shortcut-type.ts`. The string value is the storage key and the label in the popup list, so it is permanent: renaming it drops the users' saved combination.
2. Add its default to `defaultShortcuts()` in `src/shared/services/config-service.ts` (add a `KeyCode` member in `src/shared/enums/key-code.ts` if the key is new). The default must not equal another default and must not be browser-reserved (`isReservedByBrowser` in `src/options/components/shortcut-input.tsx`).
3. Add a `new ShortcutHandler(ShortcutType.X, (service, combination) => ...)` to `shortcutHandlers` in `src/content/services/user-input-service.ts`. A new page action needs a method in `PageService`, a no-op in `BasePageService` and an implementation in each page service that supports it.
4. The popup needs no change: the list is `Object.values(ShortcutType)`.
5. Update the literal `DEFAULT_SHORTCUTS` in `tests/unit/config-service.spec.ts` (a `Record<ShortcutType, string>`, so the type check fails until it is updated) and add an e2e test when the page has a snapshot.
6. Update the docs: `README.md` (shortcut table), `LISTING.md`, `RELEASE_NOTES.md`, and this rule.

## Manifests

- Two manifests: `public/manifest.json` (Chrome) and `public/manifest.firefox.json` (Firefox), copied as `manifest.json` by `webpack.prod.js` / `webpack.dev.js` and `webpack.firefox.js` (`webpack.common.js` ignores both, and `logo-full.png`, `logo.png`, `.DS_Store`). Keep them identical except `background`, `browser_specific_settings` and the Chrome-only permissions ([firefox.md](firefox.md)). Any other change goes into both.
- `web_accessible_resources`: `assets/logo-128.png`, `assets/nextprev.png`, `assets/buymeacoffee.png`, `assets/rate.png` for the Bandcamp origins (the feed player uses `nextprev.png`).
- Icons: `icons` and `action.default_icon` (16, 32, 48, 128) point to `assets/logo-*.png`. `zip.sh` has its own `include_files` list: a new file the extension loads must be added there too.
- No `options_ui`: settings exist only as the toolbar popup.
- The version is edited only in `public/manifest.json`; the pre-commit hook syncs it.

## Bundles

- Entries in `webpack/webpack.common.js`: `options`, `background`, `content`, `downloads`; output `[name].js`, `splitChunks: false`, `runtimeChunk: false`, target `['web', 'es2021']`. HTML pages and manifests reference these exact names.
- `ts-loader` with `transpileOnly`: type errors show up only in `npm run typecheck` / `npm run lint`.
- `*.scss` / `*.sass` (not from `node_modules`) go through `sass-loader` → `postcss-loader` (`postcss.config.js`: Tailwind, autoprefixer, postcss-preset-env) → `css-loader` → `style-loader`. Tailwind 3 scans `./src/**/*.{html,js,ts,tsx}`; the `band` palette and the extra scale, margin and spacing values are in `tailwind.config.js`.
- Production builds (`webpack.prod.base.js`) drop `console.log`, `console.info` and `console.debug` (Terser `drop_console` and `pure_funcs`); `console.warn` and `console.error` stay. Size hint at 2 MB per asset.
- The content script imports React (feed player, batch download overlay), so `content.js` is large; do not add more libraries to it without a reason.

## Imports and APIs

- Prefer the `@shared/*` alias for shared code; avoid `../../shared/...`. Some files import `src/downloads/*` models by relative path; keep that as it is.
- Use the `chrome.*` namespace (Firefox MV3 supports it); no `browser.*` polyfill. Feature-detect Chrome-only APIs instead of checking the browser name.
- Verify Chrome API behavior with the `chrome-extensions` skill (plugin `modern-web-guidance`) or on `developer.chrome.com`; Firefox differences are in [firefox.md](firefox.md) and on MDN.
- **Network**: the content script makes no requests of its own; the background fetches only the Bandcamp download pages of selected items (`parseBandcampDownloads` in `src/downloads/services/bandcamp-parser.ts`, 15 s timeout) and starts the file downloads with `chrome.downloads.download`. The popup and pages open external links (GitHub, Buy Me a Coffee, Chrome Web Store reviews) in new tabs. No analytics.
