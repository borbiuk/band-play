---
paths:
    - 'public/manifest*.json'
    - 'webpack/**'
---

# Firefox notes (Band Play)

> Project-specific notes about Firefox MV3 differences. Not a mirror of MDN: verify details on `developer.mozilla.org` (WebExtensions) when something here is not enough.

## Build and manifest

- `npm run build:firefox` (`webpack/webpack.firefox.js`: the production base config, output `dist-firefox/`) copies `public/manifest.firefox.json` to `dist-firefox/manifest.json`. The bundles are the same as for Chrome.
- The Firefox manifest differs from `public/manifest.json` only in:
    - `background`: `{ "scripts": ["background.js"] }` (an event page; Firefox MV3 has no service worker) instead of `{ "service_worker": "background.js" }`;
    - `browser_specific_settings.gecko`: `id` `borbiuk.n@gmail.com` (the ID of the existing add-on on addons.mozilla.org; AMO rejects an upload with another ID), `strict_min_version` `128.0`, `data_collection_permissions` `{ "required": ["none"] }` (no data collection; AMO requires the key);
    - `permissions`: `["storage", "downloads", "alarms"]`, without the Chrome-only `power`, `downloads.shelf` and `downloads.ui`.
- There is no `gecko_android` entry.
- **Why 128**: the album page uses the CSS `:has()` selector (`td.play-col > a:not(:has(...))`, Firefox 121+), and Firefox grants MV3 `host_permissions` at install only from version 127. Raise the minimum when a feature needs a newer Firefox, and write the reason here.
- The version is synced from `public/manifest.json` by `.husky/set-version.sh`; the release workflow fails when the two versions differ.

## What is different at runtime

- **`chrome.*` namespace works.** Firefox MV3 supports `chrome.*` with promises. Do not add a `browser.*` polyfill or `webextension-polyfill`.
- **Keep Awake is hidden**: no `chrome.power`; the popup does not render the row and `KeepAwakeBackgroundService` does nothing.
- **No `onDeterminingFilename`**: the expected filename recorder is inactive. Duplicate detection looks for the file without the ` (n)` suffix in the browser downloads (`downloads.search({ filename })`).
- **Download UI**: no `downloads.setUiOptions` / `setShelfEnabled`; `setDownloadsShelfEnabledSafe` does nothing.
- **Event page**: like the Chrome service worker, it can be unloaded when idle. The batch download state is in storage and the alarms wake the background, so the same recovery code runs ([batch-download.md](batch-download.md)).
- **Temporary install**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → pick `dist-firefox/manifest.json`. The add-on is removed when Firefox restarts.
- **Tests**: Playwright cannot load extensions into Firefox. Firefox is covered only by the build, `npm run lint:firefox` and manual checks; never claim Firefox coverage from the test suite.

## `web-ext lint`

- `npm run lint:firefox` (`web-ext lint --source-dir dist-firefox`) currently reports 0 errors, 0 notices and 16 expected warnings:
    - `KEY_FIREFOX_UNSUPPORTED_BY_MIN_VERSION` (1) and `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION` (1): `data_collection_permissions` needs Firefox 140 (Android 142) but the minimum is 128; older versions ignore the key;
    - `UNSUPPORTED_API` (8, all in `background.js`): the feature-detected Chrome-only APIs `downloads.setUiOptions`, `downloads.setShelfEnabled`, `downloads.onDeterminingFilename`, `power.requestKeepAwake`, `power.releaseKeepAwake`;
    - `UNSAFE_VAR_ASSIGNMENT` (6: `content.js`, `options.js`, `downloads.js`, 2 each): `innerHTML` in the bundled React DOM; `src/` has no `innerHTML`.
- Any other warning, a change in these counts, an error or a notice is a finding. The `/verify` skill keeps the same list; update both together. Full list: `npx --no web-ext lint --source-dir dist-firefox --output json`.

## Store

- The Firefox zip comes from `npm run zip` (in `release.yml`); the zip has the files at the archive root, as AMO requires. The AMO upload is manual: it needs the source code of the same commit, because the code is bundled.

## Checklist before shipping a Firefox change

1. Both manifests updated (`public/manifest.json`, `public/manifest.firefox.json`), differing only as listed above.
2. `npm run build:firefox` and `npm run lint:firefox` pass with the expected warnings only.
3. Loaded in Firefox 128+ and checked on an album page (shortcuts), the popup (Keep Awake hidden) and, with an account, a batch download.
