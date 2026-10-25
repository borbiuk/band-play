# Development

## Requirements

- Node.js 24 or newer (enforced by `engines` and `engine-strict` in `.npmrc`).
- `jq` and `zip` for `zip.sh` (packaging) and the pre-commit hook.

## Setup

```sh
npm install
```

Dependencies are pinned to exact versions (`.npmrc` sets `save-exact=true`). Add or update a package with
`npm install -E <package>@latest` and run `npm run check:versions`.

## npm scripts

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
| `npm run lint:docs`      | markdownlint and `scripts/check-docs.mjs`: relative links and the release headings.             |
| `npm run lint:unused`    | knip: files, exports and dependencies that nothing uses (`knip.jsonc`).                         |
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

## Build output

Webpack builds four entries, each as one file with a fixed name: `background.js`, `content.js`, `options.js`
(the popup, `options.html`) and `downloads.js` (the downloads page, `downloads.html`). `dist/` gets
`public/manifest.json`, `dist-firefox/` gets `public/manifest.firefox.json` as `manifest.json`; both get the
files from `public/assets/`.

The two manifests differ only in:

- `browser_specific_settings` (Firefox only): the add-on ID `borbiuk.n@gmail.com`, `strict_min_version` 128.0 and `data_collection_permissions` `none`.
- `background`: `service_worker` in Chrome, `scripts` (an event page) in Firefox.
- `permissions`: Chrome also has `power`, `downloads.shelf` and `downloads.ui`.

Both manifests list `notifications` as an optional permission. The popup asks for it only when you turn on the "notify when a batch finishes" switch.

## Installation

### Chrome

1. Run `npm install` and `npm run build` in the root of the repository.
2. Open `chrome://extensions/` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist` directory.

### Firefox

Firefox 128 or newer is required.

1. Run `npm install` and `npm run build:firefox` in the root of the repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and select `manifest.json` inside the `dist-firefox` directory.

> **Note:** Firefox removes temporary add-ons when it restarts. Load it again after a restart.

## Versions

The version lives in `public/manifest.json`. Change it only there: the pre-commit hook copies it to
`package.json` and `public/manifest.firefox.json` (`.husky/set-version.sh`; it stops when the version is not `x.y.z`).

## Pre-commit hook

The Husky hook `.husky/pre-commit` runs on every commit, with `set -e`, so the commit stops at the first failing step:

1. `.husky/set-version.sh` copies the version from `public/manifest.json` to `package.json` and `public/manifest.firefox.json`.
2. `npm run format` formats the files.
3. `git add -u` stages **all modified tracked files** (new files must be staged on purpose). Partial commits (only some files or hunks) are therefore not supported: everything modified is committed.
4. `./zip.sh` rebuilds both browsers (`dist/`, `dist-firefox/`) and writes `artifacts/band-play-build-chrome_<date>_<version>.zip` and `artifacts/band-play-build-firefox_<date>_<version>.zip`, with the extension files at the archive root. A commit needs `jq`, `zip` and a working build.

## Testing

The tests use [Playwright](https://playwright.dev) and live in `tests/`. Projects in `playwright.config.ts`:

- **`unit`** (`npm run test:unit`, `tests/unit/`): pure logic, no browser: the config defaults and the settings file, shortcut parsing, the expected filenames of downloads, the pending queue, the decisions of a runner tick, the downloads page list, row and overall progress logic, the Bandcamp download page parser, the page URL matching, and `manifests.spec.ts`, which reads `public/` and `package.json` from disk: the same version everywhere, the two manifests differ only in the intended keys, the exact permissions and hosts, and the icon files exist. It is the one unit test that does not import `src/`.
- **`e2e`** (`npm run test:e2e`, `tests/e2e/`): the built extension (`dist/`) in Playwright's bundled Chromium. Bandcamp pages come from offline snapshots in `tests/e2e/fixtures/pages/` (an album, a track and an artist page) and every other request is blocked, so the tests need no network and no Bandcamp account. They cover the shortcuts on the album and track pages, settings used on the page, the popup (settings and the shortcut recorder) and the downloads page. The batch download checkboxes and bar run on hand-written collection, purchases and wishlist pages in `tests/e2e/fixtures/synthetic/`.
- **`live`** (`npm run test:live`, `tests/live/`): a short smoke check against real bandcamp.com. It exists only when `BAND_PLAY_LIVE` is set (the script sets it), so a plain `npx playwright test` never reaches the network.

A setup project (`dist`) runs `npm run build` before `e2e` and `live`; `unit` does not build. First time on a
machine, install the browser: `npx playwright install chromium`.

`npm run test:snapshots` (`tests/e2e/fixtures/capture-pages.mjs`) saves fresh copies of the Bandcamp pages, without Bandcamp's scripts, and fails when the markup the tests need is missing.

Retries are off, so a flaky test is a bug to fix. A trace is kept for every failed test in `test-results/`, and the HTML report is written to `playwright-report/` (`npx playwright show-report`).

Not covered by automated tests: the real feed, collection, wishlist, purchases and discover pages, batch download itself, media keys, the notification permission prompt and live download progress (they need a signed-in account), and **Firefox** (the tests run in **Chromium only**, because Playwright cannot load extensions into Firefox). Check these by hand, and run `npm run lint:firefox` for Firefox.

## CI

GitHub Actions workflows in `.github/workflows/`:

- **`build.yml`**: on pushes and pull requests to `master`. A newer push to the same branch cancels the older run.
    - Job `build` (Node 24 and 26): `npm ci`, `npm audit signatures`, `check:versions`, `format:check`, both builds, `lint`, `lint:firefox` and `test:unit`.
    - Job `checks` (Node 24): `npm ci`, `npm audit signatures`, `lint:docs` and `lint:unused`.
    - Job `e2e` (Node 24): installs Playwright's Chromium and runs `npm run test:e2e`; on failure it uploads the artifact `playwright-report-e2e` (kept 14 days).
- **`markup.yml`** (workflow `bandcamp-markup`): every day at 05:17 UTC and on manual dispatch. It captures fresh snapshots with `npm run test:snapshots`, commits them to `master` when they changed ("Refresh Bandcamp page snapshots"), runs `npm run test:e2e` on them and then `npm run test:live`. On any failure it uploads `playwright-report-markup` and opens one issue labelled `markup-drift` ("Tests fail on the current Bandcamp markup"); later failures are added to it as comments. The next passing run closes the open issues. Fix the selectors in `src/content` and the tests first.
- **`codeql.yml`** (code scanning, JavaScript and TypeScript plus the workflows) and **`scorecard.yml`** (OpenSSF Scorecard): on pushes and pull requests to `master`, and weekly. Results go to the code scanning tab.
- **`dependency-review.yml`**: on pull requests. Fails on a high or critical vulnerability and on licenses that are not in its allow list.
- **`pr-title.yml`**: on pull requests. Checks the title with `scripts/check-pr-title.mjs` (upper-case start, at most 72 characters, no period, no `WIP`, `fixup!` or `squash!`). Dependabot pull requests are skipped.
- **`release.yml`** (workflow `release`): started by hand on a version tag (`gh workflow run release.yml --ref <x.y.z>`). It checks the release guards (the versions match, the tag is on `master`, the build of that commit passed, the changelog has the version, no release exists yet), builds both packages with `npm run zip`, checks their versions and uploads them as the artifact `release-packages`. With `dry_run` turned off (it is on by default) it attests the packages and creates the GitHub Release with `scripts/release-notes.sh`.
- **`publish-chrome.yml`** and **`publish-firefox.yml`**: started by hand from the Actions tab, from `master` only, in the `store` environment (configure required reviewers for it in the repository settings). Both run lint, the type check and the unit tests, check that the two manifest versions match and run `npm run zip`. The Chrome workflow uploads and publishes the Chrome package with `chrome-webstore-upload`; the Firefox workflow submits the Firefox package and a source archive (`git archive`) to AMO with `web-ext sign` on the `listed` channel. The store credentials are repository secrets (Chrome: `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`, `CHROME_PUBLISHER_ID`; Firefox: `AMO_JWT_ISSUER`, `AMO_JWT_SECRET`).

Actions are pinned to commit SHAs. Dependabot (`.github/dependabot.yml`) opens weekly update pull requests for npm packages and GitHub Actions, with a 7-day cooldown.

## Releases

- Write the changes of every release in [RELEASE_NOTES.md](../RELEASE_NOTES.md) under a `## x.y.z` heading.
- `scripts/tag-releases.sh` reads these headings and creates an annotated tag (`Release x.y.z`) at the first commit whose `public/manifest.json` has that version. It skips tags that already exist; `DRY_RUN=1` only prints what it would tag, and `TAG_PREFIX` adds a prefix (for example `v`). It does not push the tags.
- `scripts/release-notes.sh <version> <ref>` prints the notes of a GitHub Release from the section of that version (`--title` prints its summary line). The `release` workflow uses it (see [CI](#ci)).
- Publish to the stores with the manual publish workflows (see [CI](#ci)), or upload the `.zip` packages from `npm run zip` by hand.

## File structure

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
- `docs/`: this reference and [usage.md](usage.md).
- `scripts/`: `check-versions.mjs`, `check-docs.mjs`, `check-pr-title.mjs`, `release-notes.sh` and `tag-releases.sh`.
- `.github/`: issue and pull request templates, the issue chooser (`ISSUE_TEMPLATE/config.yml`), [CONTRIBUTING.md](../.github/CONTRIBUTING.md), `SUPPORT.md`, `CODEOWNERS`, workflows and Dependabot.
- `.husky/`: the pre-commit hook and `set-version.sh`.
- `zip.sh`: builds both browsers and creates the `.zip` packages in `artifacts/` (gitignored).
- `knip.jsonc` and `.markdownlint-cli2.jsonc`: the configuration of the unused code check and the docs lint.

Agent context for contributors who use coding agents is in [AGENTS.md](../AGENTS.md) and `.claude/`.
