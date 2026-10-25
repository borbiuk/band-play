---
name: verify
description: Runs the full Band Play check suite (exact versions, Prettier check, Chrome and Firefox builds, ESLint with the TypeScript 7 type check, web-ext lint, Playwright unit and e2e tests) and reports failures grouped by file. Use after code, manifest or dependency changes, or when the user asks to build, lint or check the project.
allowed-tools: Bash(npm run check:versions) Bash(npm run format:check) Bash(npm run build) Bash(npm run build:firefox) Bash(npm run lint) Bash(npm run lint:firefox) Bash(npm run lint:docs) Bash(npm run lint:unused) Bash(npm run test:unit) Bash(npm run test:e2e)
---

Run in order and stop at the first failing step:

1. `npm run check:versions` (every version in `package.json` is exact)
2. `npm run format:check` (Prettier `--check`, as in CI)
3. `npm run build` (Chrome, `dist/`)
4. `npm run build:firefox` (Firefox, `dist-firefox/`)
5. `npm run lint` (ESLint on the whole repository, then the TypeScript 7 type check of `src/` and of `tests/` with `tests/tsconfig.json`)
6. `npm run lint:firefox` (`web-ext lint` on `dist-firefox/`; see the expected warnings below)
7. `npm run test:unit` (Playwright `unit` project: pure logic from `src/`, no browser)
8. `npm run test:e2e` (Playwright `e2e` project: the `dist` setup project rebuilds `dist/` first, then the extension runs in Playwright's bundled Chromium against Bandcamp snapshots, no network)
9. `npm run lint:docs` (markdownlint with the Prettier style, then `scripts/check-docs.mjs`: relative links and the release headings)
10. `npm run lint:unused` (knip with `knip.jsonc`: unused files, exports and dependencies)

Steps 1 to 7 are the order of the `build` job in [build.yml](../../../.github/workflows/build.yml), and step 8 is its `e2e` job. Steps 9 and 10 are its `checks` job.

## Expected `web-ext lint` warnings

`web-ext lint` exits 0 with **0 errors, 0 notices and 16 warnings** (measured on version 11.0.0). All 16 are expected:

| Count | Code                                             | File                                                | Why it is expected                                                                                                                                                                                                             |
| ----- | ------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `KEY_FIREFOX_UNSUPPORTED_BY_MIN_VERSION`         | `manifest.json`                                     | `browser_specific_settings.gecko.data_collection_permissions` needs Firefox 140, but `strict_min_version` is 128. AMO requires the key; older Firefox versions ignore it                                                       |
| 1     | `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION` | `manifest.json`                                     | The same key needs Firefox for Android 142                                                                                                                                                                                     |
| 8     | `UNSUPPORTED_API`                                | `background.js`                                     | Chrome-only APIs that the code feature-detects: `downloads.setUiOptions`, `downloads.setShelfEnabled`, `downloads.onDeterminingFilename` (batch download) and `power.requestKeepAwake` / `power.releaseKeepAwake` (Keep Awake) |
| 6     | `UNSAFE_VAR_ASSIGNMENT` (innerHTML)              | `content.js`, `options.js`, `downloads.js` (2 each) | Bundled React DOM code; `src/` has no `innerHTML`                                                                                                                                                                              |

Report any other warning, any change in these counts, and every error or notice as a finding. Print the full list with `npx --no web-ext lint --source-dir dist-firefox --output json` when the counts differ.

## Notes

- `test:e2e` needs Playwright's Chromium: run `npx playwright install chromium` once per machine (and after a Playwright update). If the browser is missing, report that step as blocked and tell the user the command; do not install it unasked.
- `npm run test:live` (real bandcamp.com, needs network) is not part of verify; run it only on request.
- The tests cover Chromium only. Firefox is covered only by the build, `web-ext lint` and manual checks; say so in the report.

## Report

Report each step as pass, fail or blocked, with the relevant output (for `lint:firefox`: the warning counts and whether they match the table). For failures, group errors by file and propose minimal fixes; do not apply them unless asked. Do not call the change fully verified: the Firefox runtime and the live site were not tested.
