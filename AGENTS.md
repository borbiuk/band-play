# Repository agents (Band Play)

This file orients human and AI contributors to the **Band Play** browser extension for Chrome and Firefox (Manifest V3). Prefer **small, focused changes**; do not refactor unless asked. Topic rules live in [`.claude/rules/`](.claude/rules/).

## Product

- **Band Play** (manifest `name` "Bandcamp Play", `short_name` "BandPlay", npm package `bandcamp-play`) — adds playback controls to Bandcamp: autoplay of the next track, loop track, seek step, playback speed and pitch correction, keyboard shortcuts and media keys, a highlight of visited albums and tracks, a feed player and batch download of purchases.
- **Pages** (`https://bandcamp.com/*`, `https://*.bandcamp.com/*`): album and track pages (`/album/`, `/track/`), Discover (`/discover`), the feed (`/feed`, with the React feed player), the collection and wishlist (`bandcamp.com/<user>`, `bandcamp.com/<user>/wishlist`). Batch download adds checkboxes and an overlay to the collection, wishlist and purchases pages. Other Bandcamp pages (an artist home page) get no page service and keep their keys.
- **Settings** — edited in the toolbar popup (`options.html`), stored in `chrome.storage.local` (not `sync`): `autoplay`, `autoscroll`, `keepAwake` (Chrome only), `highlightVisited`, `playbackStep` (1 to 120 seconds), `loopTrack`, `showFeedPlayer`, `shortcuts`, `batchDownloadFormat`, `batchDownloadConcurrency` (1 to 15), `disabledShortcuts`, `mediaKeys`, `batchDownloadNotify`, `batchDownloadOpenPage`, `batchDownloadSkipDownloaded`. The settings can be exported, imported and reset (`configService`) from the popup footer.
- **Downloads page** — `downloads.html`, opened as a tab by batch download: the queue with progress and per-item controls.
- **Build output** — `dist/` (Chrome, Load unpacked) and `dist-firefox/` (Firefox, `about:debugging`).
- **Source manifests** — `public/manifest.json` (Chrome) and `public/manifest.firefox.json` (Firefox); copied to `manifest.json` in the matching build directory.

## Architecture (MV3)

| Area           | Path                           | Role                                                                                                                                                                                                      |
| -------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content script | `src/content/content.ts`       | Runs on Bandcamp pages: picks a page service by URL, runs shortcuts and media keys, highlights visited items, renders the feed player and the batch download UI. Uses `chrome.storage` and messages only. |
| Background     | `src/background/background.ts` | Service worker (Chrome) / event page (Firefox): opens tabs, forwards URL changes, Keep Awake, update notice, the batch download runner and the expected filename recorder.                                |
| Popup          | `src/options/options.tsx`      | Toolbar popup (`public/options.html`): React + Tailwind settings UI, four tabs (Playback, Page, Downloads, Shortcuts).                                                                                    |
| Downloads page | `src/downloads/downloads.tsx`  | Extension page (`public/downloads.html`) with the batch download queue.                                                                                                                                   |
| Shared code    | `src/shared/`                  | Enums, models, services (config, messages, visited history, download history), components and utils — reuse via the **`@shared/*`** alias.                                                                |

Details: [extension-architecture.md](.claude/rules/extension-architecture.md) (entrypoints, storage, how to add a shortcut), [messaging.md](.claude/rules/messaging.md), [bandcamp-dom.md](.claude/rules/bandcamp-dom.md), [batch-download.md](.claude/rules/batch-download.md), [popup.md](.claude/rules/popup.md), [firefox.md](.claude/rules/firefox.md).

## Build and manifest constraints

- **No hashed bundle filenames** — manifests and HTML pages reference fixed names; webpack uses **`[name].js`** and each entry (`options`, `background`, `content`, `downloads`) is a single self-contained file (`splitChunks: false`, `runtimeChunk: false`). Do not introduce content hashes or chunks.
- **Two manifests, kept in sync** — they differ only by `background` (`service_worker` in Chrome, `scripts` in Firefox), `browser_specific_settings` (Firefox only: Gecko ID `borbiuk.n@gmail.com`, `strict_min_version` 128.0, `data_collection_permissions`) and the Chrome-only permissions `power`, `downloads.shelf` and `downloads.ui`. The version is set in `public/manifest.json`; the pre-commit hook (`.husky/set-version.sh`) copies it to `package.json` and `manifest.firefox.json`.
- **Permissions** — `storage`, `downloads`, `alarms` (both) plus `power`, `downloads.shelf`, `downloads.ui` (Chrome); optional `notifications` (both, asked when the user turns on the batch notification); `host_permissions` and content script `matches` are `https://bandcamp.com/*` and `https://*.bandcamp.com/*`.
- **`chrome.*` namespace only** — Firefox MV3 supports it; do not add a `browser.*` polyfill. Chrome-only APIs are feature-detected (`typeof chrome.power`, `chrome.downloads?.onDeterminingFilename`).
- Cross-import shared code via **`@shared/...`** (see `webpack/webpack.common.js` and `tsconfig.json`). `content`, `background`, `options` and `downloads` never import each other, and `shared/` imports none of them (ESLint `no-restricted-imports`): code that two entrypoints need goes to `src/shared/`.
- Styles are SCSS through `sass-loader` → `postcss-loader` (Tailwind 3, autoprefixer, postcss-preset-env) → `css-loader` → `style-loader`.

## Dependency policy

- **Only exact versions** in `package.json` — never `^`, `~` or ranges. `.npmrc` sets `save-exact=true` and `engine-strict=true` (Node >= 22.13.0).
- Update with `npm install -E <package>@latest` (add `-D` for dev dependencies), then run `npm run check:versions`. Use `npm run check:outdated` locally to find updates.
- `typescript7` (alias of TypeScript 7) is the type checker (`npm run typecheck`); `typescript` 6 is kept for `ts-loader` and `typescript-eslint`.
- Details: [npm-versions.md](.claude/rules/npm-versions.md).

## Commands

- `npm run build` / `npm run build:firefox` — production bundles for Chrome (`dist/`) / Firefox (`dist-firefox/`).
- `npm run watch` — development build for Chrome (`dist/`) in watch mode. `npm run analyze` — Chrome production build with the bundle analyzer. `npm run clean` — removes `dist` and `dist-firefox`.
- `npm run zip` — `zip.sh`: rebuilds both browsers and creates `band-play-build-{chrome,firefox}_<date>_<version>.zip` (needs `jq` and `zip`).
- `npm run lint` — ESLint on the whole repository (`eslint .`; type-aware promise rules on `src/` and `tests/`) + `npm run typecheck` (TypeScript 7 on `src/` and `tests/`); `npm run lint:fix` — ESLint with `--fix`; `npm run lint:firefox` — `web-ext lint` on `dist-firefox/`.
- `npm run format` / `npm run format:check` — Prettier on `ts, tsx, js, mjs, json, md, yml, scss, css, html`. `npm run check:versions`, `npm run check:outdated` — dependency checks.
- `npm test` — Playwright `unit` + `e2e`; `npm run test:unit` (no browser), `npm run test:e2e` (Playwright's bundled Chromium, Bandcamp snapshots, no network), `npm run test:live` (real bandcamp.com, on demand; sets `BAND_PLAY_LIVE`), `npm run test:snapshots` (refresh the page snapshots, needs network). A `dist` setup project builds `dist/` before `e2e` and `live`. First time: `npx playwright install chromium`. Chromium only. Details: [testing.md](.claude/rules/testing.md).

## Git hooks

The Husky pre-commit hook (`.husky/pre-commit`, `set -e`) runs on **every commit**:

1. Copies the version from `public/manifest.json` to `package.json` and `public/manifest.firefox.json` (`.husky/set-version.sh`; stops when the version is not `x.y.z`).
2. Runs `npm run format`.
3. Runs `git add -u`, which **stages all modified tracked files** (formatting and version changes). **Partial commits (staging only some files or hunks) are therefore not supported**: everything modified is committed. New files must be staged on purpose.
4. Runs `./zip.sh`, which rebuilds **both browsers** and creates the `.zip` packages. A commit needs `jq`, `zip` and a working build.

## CI

- `.github/workflows/build.yml` (push and pull request to `master`): job `build` (Node 22, 24, 26: versions, format check, both builds, lint, `web-ext lint`, unit tests) and job `e2e` (Node 24, Playwright Chromium, `npm run test:e2e`).
- `.github/workflows/markup.yml` (daily): refreshes the Bandcamp snapshots, runs e2e and live tests, opens a `markup-drift` issue on failure.
- `.github/workflows/publish-chrome.yml` and `publish-firefox.yml`: manual store publishing from `master`. Details: [docs-and-ci.md](.claude/rules/docs-and-ci.md).

## Documentation

- Chrome APIs: cite **`developer.chrome.com`**. Firefox differences: [firefox.md](.claude/rules/firefox.md) and MDN.
- Release history: [RELEASE_NOTES.md](RELEASE_NOTES.md) (`## x.y.z` headings are read by `scripts/tag-releases.sh`). Store text: [LISTING.md](LISTING.md).
- Claude Code tooling (skills, subagents, MCP servers, permissions) is listed in [CLAUDE.md](CLAUDE.md); how to maintain it: [maintaining-agent-context.md](.claude/rules/maintaining-agent-context.md).

## Rules of engagement

- English for code comments and technical docs in-repo (per project convention).
- Follow the working rules in [CLAUDE.md](CLAUDE.md) (minimal scope, no speculative refactors).
- Never add a `^` or `~` version range.
- For AI-assisted work, see Google's [Extensions and AI](https://developer.chrome.com/docs/extensions/ai) page.
