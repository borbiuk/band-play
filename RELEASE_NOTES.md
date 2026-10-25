# Release Notes

<!--
Rules for this file (scripts/tag-releases.sh and scripts/check-docs.mjs read it):
- One `## x.y.z` heading per release, newest first. Nothing else in this file uses that heading pattern.
- A one-sentence summary under each heading.
- The sections Added, Changed, Fixed and Removed, only when they have items.
- Bullets are written for users: what changes for them, in plain words.
- A Permissions bullet whenever a permission is added, removed or explained differently.
-->

## 11.0.0

A new look for the popup, the downloads page and the Bandcamp page elements, a new icon, and more control over batch download.

### Added

- New popup with four tabs (Playback, Page, Downloads, Shortcuts): a switch for each shortcut, a dialog to record a new key, search, a media keys switch, and **Import**, **Export** and **Reset all** for a settings file.
- Downloads page: overall progress with speed and time left, filters (All, Active, Paused, Failed, Done), search, sorting, bundles folded into one row, Pause all, Resume all, Clear all, and per item Show in folder, Copy Bandcamp link and Delete file from disk.
- Batch download options: skip releases already downloaded in the same format, open the downloads page when a batch starts, and a notification when a batch finishes (optional `notifications` permission, asked only when you turn the switch on).
- **Select New** and a **Downloaded** mark on collection items.
- A **Clear** button for the visited history.

### Changed

- New icon, store images and Bandcamp page elements (checkboxes, bar, tab icons); light theme only.
- An album download is one zip file, so the downloads page shows it as one item.
- Development needs Node 24 or newer (it was 22.13), and CI builds on Node 24 and 26. This does not affect the extension itself.

### Removed

- The filename template for batch download (Chrome). Files keep the names Bandcamp gives them; Band Play still detects duplicates.

## 10.2.2

AMO add-on ID fix.

### Changed

- **Firefox manifest only — no functional changes to the extension.**
- `manifest.firefox.json`: the `browser_specific_settings.gecko.id` now matches the ID of the existing Band Play add-on entry on addons.mozilla.org (`borbiuk.n@gmail.com`) — AMO rejects uploads whose manifest ID does not match the add-on being updated.

## 10.2.1

AMO readiness: data collection declaration (no data collected).

### Changed

- **Firefox manifest only — no functional changes to the extension.**
- `manifest.firefox.json`: added `browser_specific_settings.gecko.data_collection_permissions` with `required: ["none"]` — mandatory for all new extensions submitted to [addons.mozilla.org](https://addons.mozilla.org) since November 2025. Band Play collects and transmits no user data: the only network request fetches bandcamp.com pages for the batch download feature, and all settings/history are stored locally via `storage.local`.

## 10.2.0

Firefox support: MV3 build, AMO-ready packaging, dual-browser zip script.

### Added

- **Firefox support** ([#18](https://github.com/borbiuk/band-play/pull/18) by [@xbill82](https://github.com/xbill82), closes [#16](https://github.com/borbiuk/band-play/issues/16)):
    - Firefox MV3 manifest (`public/manifest.firefox.json`) with an event-page background (`background.scripts`) and an AMO add-on ID (`browser_specific_settings.gecko`, `strict_min_version: 109.0`).
    - `npm run build:firefox` builds the extension into `dist-firefox/` (`webpack/webpack.firefox.js`).
    - `chrome.power` (Keep Awake) is feature-detected: the feature is disabled on Firefox and its toggle is hidden in the popup.
    - README instructions for loading the extension in Firefox.

### Changed

- `zip.sh` now packages both Chrome and Firefox builds, with extension files at the archive root (required by addons.mozilla.org).
- `npm run clean` also removes `dist-firefox/`.

### Fixed

- The packaged `.zip` was missing `downloads.html` / `downloads.js` (the batch download manager page).

## 10.1.3

CI pipeline fix: committed lockfile and Node 22/24 matrix.

### Changed

- **CI fix only — no functional changes to the extension.**
- `package-lock.json` is now committed (removed from `.gitignore`) so `npm ci` works in the build pipeline.
- CI matrix updated: dropped EOL Node 18/20, builds now run on Node 22.x and 24.x (ESLint 10 requires Node `^20.19 || ^22.13 || >=24`).
- `actions/setup-node` bumped v4 → v5 with npm dependency caching enabled.

## 10.1.2

Dependency updates: TypeScript 6, ESLint 10, and build toolchain.

### Changed

- **npm dependency updates only — no functional changes.** All builds verified: `tsc --noEmit`, ESLint, and production webpack build pass cleanly.
- **TypeScript 5.9 → 6.0.3**: `tsconfig` target raised to ES2021 (code uses `String.replaceAll`), explicit `types: ["chrome", "node"]`, and a `declare module '*.scss'` shim for the new side-effect import checks (TS2882).
- **ESLint 9 → 10.8.1** (+ `@eslint/js` 10): legacy `.eslintignore` removed — ignores live in the flat config.
- **sass-loader 16 → 17** (+ sass 1.102): legacy Sass API removed upstream; `outputStyle` option renamed to `style`.
- **webpack toolchain**: webpack 5.109.2, webpack-cli 7, copy-webpack-plugin 14, css-minimizer-webpack-plugin 8; `terser-webpack-plugin` is now a declared devDependency.
- **UI libraries**: react/react-dom 19.2.8, react-tooltip 5 → 6.0.8, lucide-react 0.564 → 1.31.0 — no source migration required, all used props and icon aliases remain available.
- Added `.npmrc` with `legacy-peer-deps=true` (eslint-plugin-react / eslint-plugin-import do not yet declare ESLint 10 peer support).

## 10.1.1

Keep Awake disabled by default.

### Changed

- **Keep Awake is now opt-in**: the `keepAwake` setting defaults to `false`. Previously the extension acquired a `chrome.power.requestKeepAwake('display')` wake lock for every user out of the box, which kept the machine and display awake indefinitely — even with no Bandcamp tab open (#17). Users who explicitly enabled Keep Awake in the options keep their stored setting.

## 10.1.0

Duplicate download handling, sortable downloads page, and agent context migrated to .claude.

### Added

- **Duplicate download detection**: when Chrome uniquifies a file as `name (N).ext`, the batch item is automatically paused with the new `Duplicate` status instead of silently downloading a copy (`src/background/batch-download/runner.ts`).
- **Per-item Resume**: new `BatchDownloadResumeItem` message and a Resume button on the downloads page for paused/duplicate items. Resuming a duplicate sets `duplicateResumed`, so the auto-pause no longer re-triggers for that item.
- **Re-download support**: queued items now get unique ids (original id is kept as `sourceId`), so the same purchase can be downloaded again; duplicates are numbered in the UI (`Title (1)`, `Title (2)`).
- **Batch item metadata**: `coverArtUrl`, `collectionIndex`, `createdAt`, `sourceId` are captured on selection in the content script and propagated through background to the downloads page.
- **Downloads page UI**: sortable columns (`#`, `Title`, `Status`), alphabetical group letters when sorted by title, status icons, cover art thumbnails, row hover states, wider layout.
- **`IBackgroundService`** interface implemented by all background services (`src/background/services/base/i-background-service.ts`).
- **CI**: GitHub Actions workflow (`npm ci` + build + lint on Node 18/20/22) for pushes and PRs to `master`.
- **`scripts/tag-releases.sh`**: backfills git tags for versions listed in `RELEASE_NOTES.md`.
- **AI agent context**: `.claude/` rules, skills (including the offline Chrome extension docs mirror) and slash commands; new `CLAUDE.md` and `AGENTS.md`.

### Changed

- `shortcut.utils.ts` rewritten with lookup maps instead of if-chains.
- `NewTabMessage` model consolidated (removed `NewTabMessageDataModel`); `message-model.ts` moved to `models/messages/base/`.
- Safer runtime calls: `audio.play().catch(...)`, `Number.isFinite` / `Number.parseInt` instead of globals.
- README file-structure section updated to the current layout.
- Dependencies updated (React 19.2.4, webpack 5.105.2, typescript-eslint 8.55, prettier 3.8.1, and more); `analize` script renamed to `analyze`, new `clean` script (rimraf).

### Fixed

- `ArrowDown` human-readable shortcut mapping typo (`ArrowDow`).

### Removed

- `.cursor/` rules and commands (migrated to `.claude/`).
- `uniqById` queue de-duplication (superseded by unique queue ids).

## 10.0.0

Batch download with new background/content infrastructure, downloads UI, and a dedicated downloads page.

### Added

- `src/background/batch-download/*` (state, runner, progress updates, tab cleanup).
- `src/content/services/batch-download-service.ts` + UI overlay and checkboxes.
- `src/downloads/*` (models, services, app, styles) and `public/downloads.html`.
- New shared components/buttons and `batch-download-format` enum.

### Changed

- `config-service`, `message-code`, `key-code`, `shortcut-type` to support the new flow.
- `downloads` infrastructure across background + content.

### Notes

- This release touches background/content/options/downloads at once.

## 9.0.0

History highlighting via `visited-service` and new styles.

### Added

- `src/shared/services/visited-service.ts` + `interval.utils.ts`.
- `src/content/styles/visited.scss`.

### Changed

- Integrated visited tracking into Bandcamp page services and page-service-worker.
- `config-model` and `config-service` for highlight control.
- Brand assets (banner/logos) and manifest.

## 8.0.4

keepAwake fix + webpack/dependency stabilization.

### Fixed

- keepAwake in background.

### Changed

- `package.json`, `manifest.json`.
- `webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`.
- LISTING.

## 8.0.3

Guide removed, options UI refreshed.

### Removed

- Entire Guide (tsx/scss/enums/assets).
- `zip.sh`.

### Changed

- Options UI (footer/inputs/shortcuts).
- Small updates in event/message services.

## 8.0.2

Webpack configs reworked; minimal page service tweaks.

### Changed

- `webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`.
- Minor changes in `album/collection/feed` page services.
- `manifest.json`/`package.json`.

## 8.0.1

Feed player integrated into the feed page.

### Added

- `feed-player.scss` + `feed-player.tsx`.
- New shortcuts/enums.
- Base page service.

### Changed

- `feed-page-service` and `page-service-worker`.
- README, eslint config, dependencies.

## 8.0.0

Initial feed player version + infrastructure updates.

### Added

- `feed-player` (scss/tsx) + `nextprev.png`.

### Changed

- Base bandcamp page service.
- Event-emitter/message-service.

## 7.1.0

Adjustments for the new Bandcamp UI.

### Changed

- Guide components and styles.
- `user-input-service` and shortcut handling.
- Small config/options/background updates.

## 7.0.7

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.6

Dependencies + GitHub landing.

### Added

- `docs/index.html`.

### Changed

- `package.json`, `manifest.json`.

## 7.0.5

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.4

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.3

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.2

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.1

ESLint v9 migration.

### Added

- `eslint.config.mjs`.

### Removed

- `.eslintrc.json`.

### Changed

- `package.json`, `.prettierrc.json`.

## 7.0.0

SoundCloud support (discover).

### Added

- `sound-cloud-discover-page-service`.

### Changed

- Base page service, contracts, `user-input-service`, shortcuts.

## 6.0.8

Dependencies + small input handling tweaks.

### Changed

- `package.json`, `manifest.json`.
- `user-input-service`.

## 6.0.7

Feed playlist control simplified.

### Changed

- `feed-page-service`.
- README.

## 6.0.6

Asset size optimization + bundle analyzer.

### Added

- `webpack.analize.js`.

### Changed

- Image assets and `webpack.common.js`.

## 6.0.5

Dependencies + README.

**Summary:** Dependencies + README.

### Changed

- `package.json`, `manifest.json`, README.

## 6.0.4

Loop track shortcut.

### Added

- Key asset.

### Changed

- `page-service-worker`, `user-input-service`, `config-service`, `message-service`.
- `album/collection/discover/feed` page services.

## 6.0.3

MediaSession control fixes.

### Fixed

- MediaSession handling.

### Changed

- Base page service, `user-input-service`, `shortcut-type`, `config-service`.

## 6.0.2

Input handling cleanup.

### Fixed

- Input handling in content/page services.

### Changed

- `page-service-worker`, options/config.

## 6.0.1

`this` context fix in UserInputService.

### Fixed

- `user-input-service` context binding.

## 6.0.0

Custom shortcuts + options UI move.

### Added

- UI components (checkbox/input/button/shortcut list).
- `shortcut-handler`, `shortcut-set`, `shortcut-type`.

### Changed

- `config-service`, message codes.
- `popup.html` → `options.html`.

## 5.2.0

Guide assets + UI refresh.

### Added

- SVG assets for keys and Guide.

### Changed

- `guide.tsx`, `hotkey.tsx`.
- Base page service, footer, `zip.sh`.

## 5.1.4

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 5.1.3

Discover page fix.

### Fixed

- Discover page logic.

### Changed

- Guide and background.

## 5.1.2

Pitch hotkey.

### Added

- `playback-pitch-action` enum + key asset.

### Changed

- Guide, base page service.

## 5.1.1

Play/pause refactor.

### Changed

- `album/collection` page services.

## 5.1.0

Playback speed control + hotkeys refactor.

### Added

- `playback-speed-action` enum.

### Changed

- `user-input-service`.
- `page-service-worker` moved to `content/services`.
- Guide, README, assets.

## 5.0.0

Audio API playback.

### Changed

- Switched to Audio API.
- Removed `playNextTrackWithPercentage`.
- Reworked logic in page services/feed.

## 4.1.4

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.3

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.2

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.1

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.0

MediaSession actions support.

### Added

- MediaSession actions handling.

### Changed

- `hotkey-listener`, `collection-page-service`, content/manifest.

## 4.0.16

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.0.15

Guide UI fix for small screens.

### Fixed

- `pages-note` and Guide layout.

## 4.0.14

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.0.13

Cleanup of unnecessary document events.

### Fixed

- Extra events in `page-service-worker` and `collection-page-service`.

## 4.0.11

Dependencies + lint cleanup + popup UI tweaks.

### Fixed

- Lint and unused imports.

### Changed

- Popup components: button/checkbox/number-input.
- `package.json`, `manifest.json`.

## 4.0.10

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.0.9

Collection RegExp fix.

### Fixed

- RegExp in `collection-page-service`.

## 4.0.8

React key warning fix.

### Fixed

- `available-pages` key warning.

## 4.0.7

Guide notes.

### Added

- Page marks/notes in Guide.

### Changed

- Guide components/models.

## 4.0.6

Guide + popup UI polish.

### Changed

- Guide and popup components.
- Pre-commit for prettier.

## 4.0.5

Guide UI + tooling.

### Added

- Tailwind formatter plugin.
- Gitignore for unzip build.

### Changed

- README, pre-commit zip hook.
- Guide/popup components.

## 4.0.4

Tooling + page services refactor.

### Added

- Pre-commit + `set-version.sh`.
- `BasePageService`.

### Changed

- Shortened `manifest.json`, updated `tsconfig.json`.
- Page services and popup structure refactor.

## 4.0.3

Project structure + L hotkey.

### Added

- L hotkey for collection.

### Changed

- Folder move to background/content/shared.

## 4.0.2

Content workers split.

### Added

- `hotkey-listener`, `page-service-worker`.

### Changed

- Content script split.
- Guide fix for small screens.

## 4.0.1

Docs + dependencies + Guide refactor.

### Changed

- Guide switched to chrome events.
- Message service, popup controls.
- `package.json`, `manifest.json`.

## 4.0.0

Guide + hotkeys.

### Added

- Guide components and key assets.

### Changed

- Popup footer and hotkeys.

## 3.1.0

Like hotkey.

### Added

- Like hotkey for feed/album.

### Changed

- Page services and utils.

## 3.0.9

Default keepAwake.

### Changed

- keepAwake default in background.

## 3.0.8

keepAwake fix.

### Fixed

- keepAwake logic in background.

## 3.0.7

Message/Config services expansion.

### Added

- Message codes/contracts.

### Changed

- Background/content and page services.

## 3.0.6

MessageService

### Added

- MessageService + message codes/contracts.

### Changed

- Background/content and page services.

## 3.0.5

Playback step UX.

### Added

- Seconds suffix in playback step.

### Changed

- Popup UI (number-input/footer/config).
- Formatting, dependencies, tailwind/webpack.

## 3.0.4

keepAwake + redesign.

### Added

- KeepAwake config.

### Changed

- Popup UI and tailwind classes.
- Small page services updates.

## 3.0.3

Build/tooling upgrade.

### Added

- ESLint/Prettier.

### Changed

- React components for popup.
- Webpack optimization + assets/styles refresh.

## 3.0.2

Services split + packaging.

### Added

- Services for album/collection/discover/feed.
- New contracts, zip command.

### Changed

- Content script split.

## 3.0.1

Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 3.0.0

React/TypeScript migration + large feature bundle.

### Added

- Full hotkeys set (play/pause, next/prev, digits, B/N, space).
- Autoplay + configs (step/percentage, autoplay).
- Packaging scripts.

### Changed

- Popup UI and documentation.
- Build scripts and assets.
