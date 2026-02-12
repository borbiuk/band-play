## 10.0.0

**Summary:** Batch download with new background/content infrastructure, downloads UI, and a dedicated downloads page.

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

**Summary:** History highlighting via `visited-service` and new styles.

### Added

- `src/shared/services/visited-service.ts` + `interval.utils.ts`.
- `src/content/styles/visited.scss`.

### Changed

- Integrated visited tracking into Bandcamp page services and page-service-worker.
- `config-model` and `config-service` for highlight control.
- Brand assets (banner/logos) and manifest.

## 8.0.4

**Summary:** keepAwake fix + webpack/dependency stabilization.

### Fixed

- keepAwake in background.

### Changed

- `package.json`, `manifest.json`.
- `webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`.
- LISTING.

## 8.0.3

**Summary:** Guide removed, options UI refreshed.

### Removed

- Entire Guide (tsx/scss/enums/assets).
- `zip.sh`.

### Changed

- Options UI (footer/inputs/shortcuts).
- Small updates in event/message services.

## 8.0.2

**Summary:** Webpack configs reworked; minimal page service tweaks.

### Changed

- `webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`.
- Minor changes in `album/collection/feed` page services.
- `manifest.json`/`package.json`.

## 8.0.1

**Summary:** Feed player integrated into the feed page.

### Added

- `feed-player.scss` + `feed-player.tsx`.
- New shortcuts/enums.
- Base page service.

### Changed

- `feed-page-service` and `page-service-worker`.
- README, eslint config, dependencies.

## 8.0.0

**Summary:** Initial feed player version + infrastructure updates.

### Added

- `feed-player` (scss/tsx) + `nextprev.png`.

### Changed

- Base bandcamp page service.
- Event-emitter/message-service.

## 7.1.0

**Summary:** Adjustments for the new Bandcamp UI.

### Changed

- Guide components and styles.
- `user-input-service` and shortcut handling.
- Small config/options/background updates.

## 7.0.7

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.6

**Summary:** Dependencies + GitHub landing.

### Added

- `docs/index.html`.

### Changed

- `package.json`, `manifest.json`.

## 7.0.5

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.4

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.3

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.2

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 7.0.1

**Summary:** ESLint v9 migration.

### Added

- `eslint.config.mjs`.

### Removed

- `.eslintrc.json`.

### Changed

- `package.json`, `.prettierrc.json`.

## 7.0.0

**Summary:** SoundCloud support (discover).

### Added

- `sound-cloud-discover-page-service`.

### Changed

- Base page service, contracts, `user-input-service`, shortcuts.

## 6.0.8

**Summary:** Dependencies + small input handling tweaks.

### Changed

- `package.json`, `manifest.json`.
- `user-input-service`.

## 6.0.7

**Summary:** Feed playlist control simplified.

### Changed

- `feed-page-service`.
- README.

## 6.0.6

**Summary:** Asset size optimization + bundle analyzer.

### Added

- `webpack.analize.js`.

### Changed

- Image assets and `webpack.common.js`.

## 6.0.5

**Summary:** Dependencies + README.

### Changed

- `package.json`, `manifest.json`, README.

## 6.0.4

**Summary:** Loop track shortcut.

### Added

- Key asset.

### Changed

- `page-service-worker`, `user-input-service`, `config-service`, `message-service`.
- `album/collection/discover/feed` page services.

## 6.0.3

**Summary:** MediaSession control fixes.

### Fixed

- MediaSession handling.

### Changed

- Base page service, `user-input-service`, `shortcut-type`, `config-service`.

## 6.0.2

**Summary:** Input handling cleanup.

### Fixed

- Input handling in content/page services.

### Changed

- `page-service-worker`, options/config.

## 6.0.1

**Summary:** `this` context fix in UserInputService.

### Fixed

- `user-input-service` context binding.

## 6.0.0

**Summary:** Custom shortcuts + options UI move.

### Added

- UI components (checkbox/input/button/shortcut list).
- `shortcut-handler`, `shortcut-set`, `shortcut-type`.

### Changed

- `config-service`, message codes.
- `popup.html` → `options.html`.

## 5.2.0

**Summary:** Guide assets + UI refresh.

### Added

- SVG assets for keys and Guide.

### Changed

- `guide.tsx`, `hotkey.tsx`.
- Base page service, footer, `zip.sh`.

## 5.1.4

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 5.1.3

**Summary:** Discover page fix.

### Fixed

- Discover page logic.

### Changed

- Guide and background.

## 5.1.2

**Summary:** Pitch hotkey.

### Added

- `playback-pitch-action` enum + key asset.

### Changed

- Guide, base page service.

## 5.1.1

**Summary:** Play/pause refactor.

### Changed

- `album/collection` page services.

## 5.1.0

**Summary:** Playback speed control + hotkeys refactor.

### Added

- `playback-speed-action` enum.

### Changed

- `user-input-service`.
- `page-service-worker` moved to `content/services`.
- Guide, README, assets.

## 5.0.0

**Summary:** Audio API playback.

### Changed

- Switched to Audio API.
- Removed `playNextTrackWithPercentage`.
- Reworked logic in page services/feed.

## 4.1.4

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.3

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.2

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.1

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.1.0

**Summary:** MediaSession actions support.

### Added

- MediaSession actions handling.

### Changed

- `hotkey-listener`, `collection-page-service`, content/manifest.

## 4.0.16

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.0.15

**Summary:** Guide UI fix for small screens.

### Fixed

- `pages-note` and Guide layout.

## 4.0.14

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.0.13

**Summary:** Cleanup of unnecessary document events.

### Fixed

- Extra events in `page-service-worker` and `collection-page-service`.

## 4.0.11

**Summary:** Dependencies + lint cleanup + popup UI tweaks.

### Fixed

- Lint and unused imports.

### Changed

- Popup components: button/checkbox/number-input.
- `package.json`, `manifest.json`.

## 4.0.10

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 4.0.9

**Summary:** Collection RegExp fix.

### Fixed

- RegExp in `collection-page-service`.

## 4.0.8

**Summary:** React key warning fix.

### Fixed

- `available-pages` key warning.

## 4.0.7

**Summary:** Guide notes.

### Added

- Page marks/notes in Guide.

### Changed

- Guide components/models.

## 4.0.6

**Summary:** Guide + popup UI polish.

### Changed

- Guide and popup components.
- Pre-commit for prettier.

## 4.0.5

**Summary:** Guide UI + tooling.

### Added

- Tailwind formatter plugin.
- Gitignore for unzip build.

### Changed

- README, pre-commit zip hook.
- Guide/popup components.

## 4.0.4

**Summary:** Tooling + page services refactor.

### Added

- Pre-commit + `set-version.sh`.
- `BasePageService`.

### Changed

- Shortened `manifest.json`, updated `tsconfig.json`.
- Page services and popup structure refactor.

## 4.0.3

**Summary:** Project structure + L hotkey.

### Added

- L hotkey for collection.

### Changed

- Folder move to background/content/shared.

## 4.0.2

**Summary:** Content workers split.

### Added

- `hotkey-listener`, `page-service-worker`.

### Changed

- Content script split.
- Guide fix for small screens.

## 4.0.1

**Summary:** Docs + dependencies + Guide refactor.

### Changed

- Guide switched to chrome events.
- Message service, popup controls.
- `package.json`, `manifest.json`.

## 4.0.0

**Summary:** Guide + hotkeys.

### Added

- Guide components and key assets.

### Changed

- Popup footer and hotkeys.

## 3.1.0

**Summary:** Like hotkey.

### Added

- Like hotkey for feed/album.

### Changed

- Page services and utils.

## 3.0.9

**Summary:** Default keepAwake.

### Changed

- keepAwake default in background.

## 3.0.8

**Summary:** keepAwake fix.

### Fixed

- keepAwake logic in background.

## 3.0.7

**Summary:** Message/Config services expansion.

### Added

- Message codes/contracts.

### Changed

- Background/content and page services.

## 3.0.6

**Summary:** MessageService.

### Added

- MessageService + message codes/contracts.

### Changed

- Background/content and page services.

## 3.0.5

**Summary:** Playback step UX.

### Added

- Seconds suffix in playback step.

### Changed

- Popup UI (number-input/footer/config).
- Formatting, dependencies, tailwind/webpack.

## 3.0.4

**Summary:** keepAwake + redesign.

### Added

- KeepAwake config.

### Changed

- Popup UI and tailwind classes.
- Small page services updates.

## 3.0.3

**Summary:** Build/tooling upgrade.

### Added

- ESLint/Prettier.

### Changed

- React components for popup.
- Webpack optimization + assets/styles refresh.

## 3.0.2

**Summary:** Services split + packaging.

### Added

- Services for album/collection/discover/feed.
- New contracts, zip command.

### Changed

- Content script split.

## 3.0.1

**Summary:** Dependencies/manifest only.

### Changed

- `package.json`, `manifest.json`.

## 3.0.0

**Summary:** React/TypeScript migration + large feature bundle.

### Added

- Full hotkeys set (play/pause, next/prev, digits, B/N, space).
- Autoplay + configs (step/percentage, autoplay).
- Packaging scripts.

### Changed

- Popup UI and documentation.
- Build scripts and assets.

## 2.0.0

**Summary:** Data unavailable.

### Notes

- There is no git history for 2.x in this repository, so 2.0.0 changes cannot be derived.
