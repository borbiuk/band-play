<p align="center"><img src="public/assets/logo.png" alt="Band Play logo" height="140"></p>

# Band Play

Band Play is a **browser extension for Chrome and Firefox** that improves listening on [Bandcamp](https://bandcamp.com).
It adds keyboard shortcuts and media keys, speed and pitch control, autoplay and autoscroll, a feed player,
marks for albums and tracks you already opened, and batch download of your purchases in the format you choose.

- **Chrome**: [Chrome Web Store](https://chromewebstore.google.com/detail/nooegmjcddclidfdlibmgcpaahkikmlh)
- **Firefox**: Firefox 128 or newer. To use a build from this repository, see [Installation](#installation).

<hr/>

## Features

### Playback

- **Keyboard shortcuts**: play and pause, next and previous track, seek, speed, pitch, loop, open in a new tab and wishlist (see [Keyboard shortcuts](#keyboard-shortcuts)). Every combination can be changed in the popup.
- **Media keys**: the play, pause, next track, previous track, seek forward and seek backward keys of your keyboard or headset control the Bandcamp player on the supported pages.
- **Speed**: each step changes the playback speed by 1% (`playbackRate` ± 0.01); a reset sets it back to normal speed.
- **Pitch**: switch pitch preservation on and off while the speed is changed (the browser's `preservesPitch`); the reset shortcut turns it off.
- **Seek step**: seek forward and backward by a number of seconds you set in the popup (1 to 120, default 10).
- **Jump to a position**: a digit key jumps to 0%, 10%, ... 90% of the track; Shift plus a digit plays that track of the list (Shift+1 is the first track).
- **Loop track**: repeat the current track instead of moving on (off by default; Shift+V switches it).

### Automation

- **Autoplay** (on by default): when a track ends, the next track of the album, collection, wishlist, feed or discover list starts.
- **Autoscroll** (on by default): the page scrolls to the item that started playing.
- **Keep Awake** (off by default, Chrome only): keeps the display from turning off or dimming while the setting is on (`chrome.power`).

### Pages

- **Highlight visited** (on by default): albums and tracks you already opened or played are marked on Bandcamp pages. The history is stored in the extension's local storage only (up to 50,000 items) and is shared by all tabs.
- **Feed player** (on by default): a small player on the Bandcamp feed page with the cover, the title and a progress bar you can click to seek.
- **Open in new tab**: open the current item in a new tab, in the background (O) or with focus (Shift+O).
- **Wishlist**: add the current item to the wishlist or remove it (L).

### Batch download

- **Where**: on your collection and wishlist pages (items you bought, that have a download link) and on your purchases page. Band Play adds a checkbox to each item and a small panel at the bottom right of the page.
- **Select**: click checkboxes one by one; Shift+click selects the range from the last clicked checkbox. **Select All** loads the whole list and selects every item (it shows the progress and can be stopped). **Select New** selects only the items you have not downloaded yet in the current format.
- **Format**: MP3 V0, MP3 320, FLAC, AAC, Ogg Vorbis, ALAC, WAV (default) or AIFF. Set the default in the popup, or pick a format for one batch with the arrow next to the **Download** button.
- **Concurrency**: how many files download at the same time (1 to 15, default 8).
- **Filename template** (Chrome only): for example `{artist}/{artist} - {title}`. The tokens are `{artist}`, `{title}` and `{format}`, and `/` creates folders. The template must contain `{title}`, otherwise it is not used. Leave it empty to keep the file names Bandcamp sends.
- **Downloads page**: a download starts a Band Play downloads page in a browser tab. It shows every item with its status and progress and has **Clear all**, **Pause all**, **Resume all**, **Retry failed** and **Clear completed**, and per item Pause, Resume, Cancel, Retry, Show in folder, Copy Bandcamp URL, Delete file from disk and Remove. While downloads are active, the popup shows an **Open downloads** button.
- **Reliable**: when Bandcamp answers "too many requests" (HTTP 429), the download is retried later with a growing delay. In Chrome the browser's download bubble is hidden while a batch runs and shown again afterwards.
- **History**: completed downloads are remembered per release and format, so **Select New** and the marks on the page know what you already have.

### Keyboard shortcuts

Defaults (change them in the popup):

| Shortcut                   | Default            | What it does                                           |
| -------------------------- | ------------------ | ------------------------------------------------------ |
| Play/Pause                 | Space              | Play or pause the current track                        |
| Play next track            | N                  | Play the next track of the list                        |
| Play previous track        | B                  | Play the previous track of the list                    |
| Play track by index        | Shift + 1...9      | Play that track of the list (Shift+1 is the first one) |
| Loop track                 | Shift + V          | Switch looping of the current track on or off          |
| Seek forward               | Arrow Right        | Move forward by the seek step (default 10 seconds)     |
| Seek backward              | Arrow Left         | Move back by the seek step                             |
| Set playback progress      | 0...9              | Jump to 0%, 10%, ... 90% of the track                  |
| Increase playback speed    | Arrow Up           | Speed up by 1%                                         |
| Decrease playback speed    | Arrow Down         | Slow down by 1%                                        |
| Reset playback speed       | Shift + Arrow Down | Back to normal speed                                   |
| Switch Auto-Pitch          | P                  | Switch pitch preservation on or off                    |
| Reset Auto-Pitch           | Shift + P          | Turn pitch preservation off                            |
| Open in new tab            | O                  | Open the current item in a new background tab          |
| Open in new tab with focus | Shift + O          | Open the current item in a new tab and switch to it    |
| Add/Remove from Wishlist   | L                  | Add the current item to the wishlist or remove it      |

Notes:

- The shortcuts work only on the supported pages (see below). On other Bandcamp pages the keys are left to the page, so the arrows and Space still scroll.
- They do nothing while you type in a text field or while an input method composes text.
- Only an exact match is used: a combination with an extra modifier (for example Ctrl+P) is left to the page and the browser.
- To change a shortcut, pick it in the popup, press the new combination and click **Save**; **Reset** restores the default. The popup refuses a combination that another shortcut already uses or that the browser uses.

### Supported pages

| Page                    | URL                                              | What you get                                       |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------- |
| **Album and track**     | `https://*.bandcamp.com/album/...`, `/track/...` | Shortcuts, media keys, autoplay, highlight visited |
| **Collection/Wishlist** | `https://bandcamp.com/USER`, `/USER/wishlist`    | All of the above, autoscroll, batch download       |
| **Purchases**           | your purchases page on `bandcamp.com`            | Batch download                                     |
| **Feed**                | `https://bandcamp.com/USER/feed`                 | All playback features and the feed player          |
| **Discover**            | `https://bandcamp.com/discover`                  | Playback features, autoplay, autoscroll            |

Pitch preservation is not available on the discover page.

### Settings popup

Click the Band Play icon in the toolbar. The popup has three panels:

- **Common**: Autoplay, Autoscroll, Keep Awake (Chrome only), Show feed player, Highlight visited.
- **Shortcuts** and the **seek step**.
- **Downloads**: the batch download format, the concurrency, the filename template (Chrome only) and **Open downloads** while downloads are active.

All settings are saved at once in the extension's local storage (`chrome.storage.local`).

### Firefox

Band Play works in Firefox 128 or newer, with two differences:

- **Keep Awake** is hidden, because Firefox has no `chrome.power` API.
- The **filename template** is hidden, because Firefox has no `downloads.onDeterminingFilename`. Files keep the names Bandcamp sends.

<hr/>

## Development

### Requirements

- Node.js 22.13 or newer (enforced by `engines` and `engine-strict` in `.npmrc`).
- `jq` and `zip` for `zip.sh` (packaging) and the pre-commit hook.

### Setup

```sh
npm install
```

Dependencies are pinned to exact versions (`.npmrc` sets `save-exact=true`). Add or update a package with
`npm install -E <package>@latest` and run `npm run check:versions`.

### npm scripts

| Script                   | Description                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `npm run watch`          | Development build for Chrome into `dist/`, rebuilt on every change.                             |
| `npm run build`          | Production build for Chrome into `dist/`.                                                       |
| `npm run build:firefox`  | Production build for Firefox into `dist-firefox/`.                                              |
| `npm run analyze`        | Production build with `webpack-bundle-analyzer`, to inspect the bundle sizes.                   |
| `npm run clean`          | Remove `dist/` and `dist-firefox/`.                                                             |
| `npm run zip`            | Rebuild both browsers and create `.zip` packages for publishing (runs `zip.sh`).                |
| `npm run typecheck`      | TypeScript 7 type check of `src/` and `tests/` without emitting files.                          |
| `npm run lint`           | ESLint for the whole repository, followed by the type check.                                    |
| `npm run lint:fix`       | ESLint with automatic fixes.                                                                    |
| `npm run lint:firefox`   | `web-ext lint` for the Firefox build (run `npm run build:firefox` first).                       |
| `npm test`               | The `unit` and `e2e` tests (see [Testing](#testing)).                                           |
| `npm run test:unit`      | Unit tests (no browser, no build).                                                              |
| `npm run test:e2e`       | End-to-end tests of the extension in Chromium on saved Bandcamp pages (builds `dist/` first).   |
| `npm run test:live`      | Smoke tests against real bandcamp.com (needs network; builds `dist/` first).                    |
| `npm run test:snapshots` | Refresh the Bandcamp page snapshots the e2e tests use (needs network).                          |
| `npm run format`         | Prettier for `.ts`, `.tsx`, `.js`, `.mjs`, `.json`, `.md`, `.yml`, `.scss`, `.css` and `.html`. |
| `npm run format:check`   | Fail if any of these files is not formatted (run in CI).                                        |
| `npm run check:versions` | Fail if any dependency in `package.json` is not pinned to an exact version.                     |
| `npm run check:outdated` | List outdated dependencies (`npm outdated`). For local use, not run in CI.                      |
| `npm run prepare`        | Installs the Husky Git hooks (runs on `npm install`).                                           |

### Build output

Webpack builds four entries, each as one file with a fixed name: `background.js`, `content.js`, `options.js`
(the popup, `options.html`) and `downloads.js` (the downloads page, `downloads.html`). `dist/` gets
`public/manifest.json`, `dist-firefox/` gets `public/manifest.firefox.json` as `manifest.json`; both get the
files from `public/assets/`.

The two manifests differ only in:

- `browser_specific_settings` (Firefox only): the add-on ID `borbiuk.n@gmail.com`, `strict_min_version` 128.0 and `data_collection_permissions` `none`.
- `background`: `service_worker` in Chrome, `scripts` (an event page) in Firefox.
- `permissions`: Chrome also has `power`, `downloads.shelf` and `downloads.ui`.

### Installation

#### Chrome

1. Run `npm install` and `npm run build` in the root of the repository.
2. Open `chrome://extensions/` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist` directory.

#### Firefox

Firefox 128 or newer is required.

1. Run `npm install` and `npm run build:firefox` in the root of the repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and select `manifest.json` inside the `dist-firefox` directory.

> **Note:** Firefox removes temporary add-ons when it restarts. Load it again after a restart.

### Versions

The version lives in `public/manifest.json`. Change it only there: the pre-commit hook copies it to
`package.json` and `public/manifest.firefox.json` (`.husky/set-version.sh`; it stops when the version is not `x.y.z`).

### Pre-commit hook

The Husky hook `.husky/pre-commit` runs on every commit, with `set -e`, so the commit stops at the first failing step:

1. `.husky/set-version.sh` copies the version from `public/manifest.json` to `package.json` and `public/manifest.firefox.json`.
2. `npm run format` formats the files.
3. `git add -u` stages **all modified tracked files** (new files must be staged on purpose). Partial commits (only some files or hunks) are therefore not supported: everything modified is committed.
4. `./zip.sh` rebuilds both browsers (`dist/`, `dist-firefox/`) and creates `band-play-build-chrome_<date>_<version>.zip` and `band-play-build-firefox_<date>_<version>.zip`, with the extension files at the archive root. A commit needs `jq`, `zip` and a working build.

### Testing

The tests use [Playwright](https://playwright.dev) and live in `tests/`. Projects in `playwright.config.ts`:

- **`unit`** (`npm run test:unit`, `tests/unit/`): pure logic, no browser: the config defaults, shortcut parsing, the filename template and the filename router, the Bandcamp download page parser and the page URL matching.
- **`e2e`** (`npm run test:e2e`, `tests/e2e/`): the built extension (`dist/`) in Playwright's bundled Chromium. Bandcamp pages come from offline snapshots in `tests/e2e/fixtures/pages/` (an album, a track and an artist page) and every other request is blocked, so the tests need no network and no Bandcamp account. They cover the shortcuts on the album and track pages, settings used on the page and the popup (settings and the shortcut recorder).
- **`live`** (`npm run test:live`, `tests/live/`): a short smoke check against real bandcamp.com. It exists only when `BAND_PLAY_LIVE` is set (the script sets it), so a plain `npx playwright test` never reaches the network.

A setup project (`dist`) runs `npm run build` before `e2e` and `live`; `unit` does not build. First time on a
machine, install the browser: `npx playwright install chromium`.

`npm run test:snapshots` (`tests/e2e/fixtures/capture-pages.mjs`) saves fresh copies of the Bandcamp pages, without Bandcamp's scripts, and fails when the markup the tests need is missing.

Retries are off, so a flaky test is a bug to fix. A trace is kept for every failed test in `test-results/`, and the HTML report is written to `playwright-report/` (`npx playwright show-report`).

Not covered by automated tests: the feed, collection, wishlist, purchases and discover pages, batch download and the downloads page (they need a signed-in account), and **Firefox** (the tests run in **Chromium only**, because Playwright cannot load extensions into Firefox). Check these by hand, and run `npm run lint:firefox` for Firefox.

### CI

GitHub Actions workflows in `.github/workflows/`:

- **`build.yml`**: on pushes and pull requests to `master`. A newer push to the same branch cancels the older run.
    - Job `build` (Node 22, 24 and 26): `npm ci`, `npm audit signatures`, `check:versions`, `format:check`, both builds, `lint`, `lint:firefox` and `test:unit`.
    - Job `e2e` (Node 24): installs Playwright's Chromium and runs `npm run test:e2e`; on failure it uploads the artifact `playwright-report-e2e` (kept 14 days).
- **`markup.yml`** (workflow `bandcamp-markup`): every day at 05:17 UTC and on manual dispatch. It captures fresh snapshots with `npm run test:snapshots`, commits them to `master` when they changed ("Refresh Bandcamp page snapshots"), runs `npm run test:e2e` on them and then `npm run test:live`. On any failure it uploads `playwright-report-markup` and opens one issue labelled `markup-drift` ("Tests fail on the current Bandcamp markup"); later failures are added to it as comments. Close it after fixing the selectors in `src/content` and the tests.
- **`publish-chrome.yml`** and **`publish-firefox.yml`**: started by hand from the Actions tab, from `master` only, in the `store` environment (configure required reviewers for it in the repository settings). Both run lint, the type check and the unit tests, check that the two manifest versions match and run `npm run zip`. The Chrome workflow uploads and publishes the Chrome package with `chrome-webstore-upload`; the Firefox workflow submits the Firefox package and a source archive (`git archive`) to AMO with `web-ext sign` on the `listed` channel. The store credentials are repository secrets (Chrome: `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`, `CHROME_PUBLISHER_ID`; Firefox: `AMO_JWT_ISSUER`, `AMO_JWT_SECRET`).

Actions are pinned to commit SHAs. Dependabot (`.github/dependabot.yml`) opens weekly update pull requests for npm packages and GitHub Actions, with a 7-day cooldown.

### Releases

- Write the changes of every release in [RELEASE_NOTES.md](RELEASE_NOTES.md) under a `## x.y.z` heading.
- `scripts/tag-releases.sh` reads these headings and creates an annotated tag (`Release x.y.z`) at the first commit whose `public/manifest.json` has that version. It skips tags that already exist; `DRY_RUN=1` only prints what it would tag, and `TAG_PREFIX` adds a prefix (for example `v`). It does not push the tags.
- Publish to the stores with the manual publish workflows (see [CI](#ci)), or upload the `.zip` packages from `npm run zip` by hand.

### File structure

- `public/`: `manifest.json` (Chrome), `manifest.firefox.json` (Firefox), `options.html` (popup), `downloads.html` (downloads page) and `assets/` (icons and images).
- `src/`:
    - `background/`: the background script (`background.ts`): batch download queue (`batch-download/`) and services for messages, Keep Awake, update notices and URL changes (`services/`).
    - `content/`: the content script (`content.ts`) on Bandcamp pages: page services per page type (`page-services/`), the feed player, the batch download checkboxes and panel (`components/`), keyboard and media key handling (`services/`, `shortcut/`) and styles.
    - `downloads/`: the downloads page (React) and the Bandcamp download page parser.
    - `options/`: the popup (React).
    - `shared/`: components, enums, models, services (config, messages, visited history, download history) and utils, imported via `@shared/*`.
    - `types/`: ambient type declarations.
- `webpack/`: webpack configuration for the development, Chrome, Firefox and analyze builds.
- `tests/`: Playwright tests (`unit/`, `e2e/` with `fixtures/`, `live/`, `setup/`), see [Testing](#testing).
- `scripts/`: `check-versions.mjs` and `tag-releases.sh`.
- `.github/`: issue and pull request templates, workflows and Dependabot.
- `.husky/`: the pre-commit hook and `set-version.sh`.
- `zip.sh`: builds both browsers and creates the `.zip` packages.

Agent context for contributors who use coding agents is in [AGENTS.md](AGENTS.md) and `.claude/`.

### Contributing

Contributions are welcome:

1. Fork the repository.
2. Create a branch for your feature or fix.
3. Commit your changes and push the branch to your fork.
4. Open a pull request to `master`.

Report bugs and ideas in [Issues](https://github.com/borbiuk/band-play/issues). Report security problems privately, see [SECURITY.md](SECURITY.md).
