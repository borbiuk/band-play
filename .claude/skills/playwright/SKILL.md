---
name: playwright
description: Writes, runs and debugs the Playwright tests of Band Play (unit tests for pure logic in src/, end-to-end tests with the real extension loaded into Chromium, and the live smoke suite), including the extension-specific parts — loading the unpacked build, the extension id, the settings page, chrome.storage.local, Bandcamp page snapshots, the test audio element, keyboard checks and traces. Use when adding or changing tests, when a test fails or flakes, or when the user asks to run the tests ("напиши тест", "запусти тести", "тест падає").
argument-hint: '[unit | e2e | live | <spec file>]'
---

# Playwright tests for Band Play

How to work on the test suite. **What a good test looks like** (rules, severities) is the standard in [e2e-review/references/rules.md](../e2e-review/references/rules.md); follow it while writing. Project conventions are in [testing.md](../../rules/testing.md).

> Check `package.json` and `playwright.config.ts` before relying on a script or project that this file does not list.

With an argument, run that project (`unit`, `e2e`, `live`) or spec file and report the result; without one, follow the request.

## Projects and commands

| Project | What                                                                                                                                                                      | Command                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `unit`  | Pure logic from `src/` (`@shared/*` for `src/shared`, a relative `../../src/...` import for content, background and downloads modules), no browser and no `chrome` global | `npm run test:unit`                                                     |
| `dist`  | Setup project (`tests/setup/dist.setup.ts`): runs `npm run build` and checks `dist/manifest.json` against `package.json`; no tests of its own                             | runs by itself before `e2e` and `live` (a dependency)                   |
| `e2e`   | The built extension (`dist/`) in Playwright's bundled Chromium, headless; Bandcamp pages come from snapshots, no network                                                  | `npm run test:e2e`                                                      |
| `live`  | Smoke checks against real bandcamp.com; defined **only when `BAND_PLAY_LIVE` is set**; never part of `npm test`                                                           | `npm run test:live` (`BAND_PLAY_LIVE=1 playwright test --project=live`) |

- The npm scripts do not build: the `dist` project does, so a plain `npx playwright test` (and the Playwright agents / MCP server) also runs on the current sources. `unit`-only runs skip the build. `--no-deps` skips it when `dist/` is already current.
- Because `live` exists only with `BAND_PLAY_LIVE`, a plain `npx playwright test` never reaches the network; `--project=live` without the variable fails with an unknown project.
- `npm test` = `playwright test --project=unit --project=e2e` (the build runs through `dist`). `npm run test:snapshots` refreshes the page snapshots (network needed).
- First time on a machine: `npx playwright install chromium` (the bundled Chromium, not Google Chrome).
- `playwright.config.ts`: `fullyParallel`, `retries: 0` by design (flaky tests are fixed, SYNC-14), `forbidOnly` in CI, `workers: 2` and a 10 minute `globalTimeout` in CI, reporters `list` + `html` (`playwright-report/`, plus `github` in CI), traces kept on failure (`retain-on-failure`) in `test-results/`. These folders are gitignored.
- Chromium only; there is no Firefox project.
- **CI** ([build.yml](../../../.github/workflows/build.yml), [markup.yml](../../../.github/workflows/markup.yml)): job `build` runs `npm run test:unit` on Node 22, 24 and 26; job `e2e` (Node 24) installs Chromium with `npx --no playwright install --with-deps chromium` and runs `npm run test:e2e`. `markup.yml` (workflow `bandcamp-markup`, daily at 05:17 UTC and manual, never on push) runs `npm run test:snapshots`, commits changed snapshots to `master` as `github-actions[bot]`, then runs `npm run test:e2e` on them and `npm run test:live` (into `playwright-report-live/` and `test-results-live/`); on failure it opens one `markup-drift` issue (or comments on the open one). After a markup change the new snapshots are on `master`, so push CI stays red until the selectors and tests are fixed, by design.
- **Reading a failed CI run**: open the run, read the `list` output and the annotations; download the artifact (`playwright-report-e2e` or `playwright-report-markup`, kept 14 days), unzip it, then `npx playwright show-report <folder>/playwright-report` and `npx playwright show-trace <folder>/test-results/<test>/trace.zip` (these open windows: suggest them to the user). Reproduce locally with the same command as CI (`npm run test:e2e`), not with retries.

Run Playwright as `npx --no playwright …` so npx never downloads a package that is not installed. Useful flags: `test <file> -g "<title>"`, `--project=e2e`, `--repeat-each=5` (flakiness), `--last-failed`. `--headed`, `--debug`, `--ui`, `show-report` and `show-trace <trace.zip>` open windows and wait: suggest them to the user instead of running them; read the failure output and `test-results/` yourself (a trace is kept for every failed test).

## Workflow

1. Write or change the test to the standard; arrange state through storage and fixtures.
2. `npm run lint` (ESLint over the whole repository, then the type check of `src/` and `tests/`), then run the changed specs; for a flaky test also `--repeat-each=5`.
3. On a failure, find the cause in the output or trace and fix it. Never "fix" a race with retries, fewer workers or longer timeouts (SYNC-14); re-run until green.
4. Review with the `e2e-reviewer` agent (`/e2e-review`), fix every Critical and Major finding, re-run, and decide the Minor ones with the user.

## Loading the extension in Chromium

- Extensions load only into a **persistent context** of Playwright's **bundled Chromium** (`channel: 'chromium'`, which also runs extensions headless). Branded Google Chrome and Edge ignore `--load-extension`. The fixture launches with `--disable-extensions-except=<dist>`, `--load-extension=<dist>` and `--autoplay-policy=no-user-gesture-required` (so `play()` works without a click). The tests load `dist/`, not `src/`; the `dist` project rebuilds it before every `e2e` / `live` run.
- **Extension id**: computed, not read from `context.serviceWorkers()` (the background service worker may not have started yet). Chromium derives an unpacked extension's id from its absolute path (SHA-256 of the path, the first 32 hex digits mapped `0-f` → `a-p`); `unpackedExtensionId` in `extension.ts` does that for `DIST_PATH` (the real path of `dist/`). The context fixture then fetches `chrome-extension://<id>/manifest.json`. When that fails, it waits up to 5 s for the service worker and fails the test at once: with the real id when it differs ("Chromium's id of unpacked extensions differs on this system"), otherwise with "The extension did not load … run npm run build". The formula is for macOS and Linux paths.
- **Settings page**: `openOptions()` opens `chrome-extension://<id>/options.html` in a new tab. The toolbar popup itself cannot be opened reliably in headless runs.
- **Storage**: the extension keeps its settings in `chrome.storage.local` (not `sync`). `storage.set` / `storage.get` write and read it from an extension page with `page.evaluate`. Never set state through the settings page unless that page is what the test verifies.
- **Errors**: the context fixture collects console errors and page errors whose source is `chrome-extension://<id>/` and fails the test after it with the messages.

## Fixtures

Import `test` and `expect` from `tests/e2e/fixtures/extension.ts` (the `live` specs too: `../e2e/fixtures/extension`), never from `@playwright/test`; `unit` specs and the setup project use `@playwright/test` directly. Every test gets a fresh Chromium profile (an empty user data dir) with the extension loaded and Bandcamp served from snapshots.

`tests/e2e/fixtures/extension.ts`:

| Fixture / option        | What                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `context`               | Persistent context of the bundled Chromium with the extension from `dist/` and the Bandcamp routing; honours `headless` (`--headed` and `--debug` work). Fails the test, see below                                                                                                                                             |
| `page`                  | The first tab of the context                                                                                                                                                                                                                                                                                                   |
| `extensionId`           | Computed id of the unpacked extension                                                                                                                                                                                                                                                                                          |
| `openOptions()`         | Opens `options.html` in a new tab and returns the `Page`                                                                                                                                                                                                                                                                       |
| `storage.set(values)`   | Writes the keys to `chrome.storage.local` as given. Use the shape the extension writes: for example `playbackStep: 90`, `autoscroll: false`, `shortcuts: { [ShortcutType.PlayPause]: JSON.stringify(['KeyK']) }` (each combination is a JSON string; `'[]'` means "use the default"). Call it before opening the Bandcamp page |
| `storage.get(key)`      | Returns one stored key, or `undefined` when nothing is stored (the settings page writes only what the user changes, so an untouched key stays `undefined`)                                                                                                                                                                     |
| option `bandcampRoutes` | `'snapshots'` (default) or `'live'`, which skips routing (set by the `live` project)                                                                                                                                                                                                                                           |

The storage fixture opens its own `options.html` tab on first use and closes it after the test. The context fixture fails the test **after it ends** when the extension logged an error, and when a request had no snapshot or routing rule (see below). It fails before the test when the extension did not load.

`tests/e2e/fixtures/bandcamp.ts` (plain functions and constants, not fixtures):

| Export                       | What                                                                                                                                                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PAGES`                      | `album` (`https://baugruppe90.bandcamp.com/album/laser-cut`), `track` (`…/track/body-drift`), `artist` (`https://baugruppe90.bandcamp.com/`: Bandcamp, but no page service of the extension)                                                                                              |
| `openBandcamp(page, url)`    | `page.goto(url)`, then waits until `html[data-band-play="ready"]` is attached. `content.ts` sets that marker when the page service worker and the shortcut listener have started, that is after the settings loaded. Use it for every Bandcamp page (SYNC-6)                              |
| `addPlayerAudio(page)`       | Appends the `<audio>` element Bandcamp's player would create, with the silent test audio (`AUDIO_URL`), and waits for `loadedmetadata`                                                                                                                                                    |
| `readAudio(page)`            | `{ paused, currentTime, playbackRate, preservesPitch }` of the page's `<audio>`; throws when there is none. Poll it: `await expect.poll(async () => (await readAudio(page)).paused).toBe(false)`                                                                                          |
| `recordKeys(page)`           | Starts recording keydown events that reach `window` in the bubble phase and returns a reader of `{ code, defaultPrevented }`. The extension handles a shortcut in the capture phase and calls `preventDefault()`, so `defaultPrevented: false` proves it left the key to the page (EXT-5) |
| `routeBandcamp(context)`     | The routing the context fixture installs (see below); returns the list of unplanned URLs                                                                                                                                                                                                  |
| `AUDIO_URL`, `AUDIO_SECONDS` | `https://t4.bcbits.com/stream/band-play-test.wav`, 120 seconds long                                                                                                                                                                                                                       |
| `ALBUM_SECOND_TRACK`         | Title of the album's second track, for the `live` smoke tests                                                                                                                                                                                                                             |

Keep URLs, titles and audio values in `bandcamp.ts`, not repeated in specs (DATA-10). Fixtures arrange; the spec asserts (AST-1).

## Bandcamp pages in e2e

- `context.route('**/*')` serves the saved snapshots listed in `tests/e2e/fixtures/pages/index.json` (`pages`: host + path → file, for example `"baugruppe90.bandcamp.com/album/laser-cut": "album.html"`). Only requests of type `document` get a snapshot; the query string is not part of the key. Because the URL is real, the content script (`matches: https://*.bandcamp.com/*`) is injected exactly as in the browser. `chrome-extension:` and `data:` requests pass.
- Anything else is **reported and fails the test** after it ends ("Requests without a snapshot or routing rule"), and is aborted. Only stylesheets, images, fonts and media (and `/img/` favicons) from `bcbits.com`, `bandcamp.com` and `stripe.com` are aborted quietly. Documents, `fetch` and XHR are always reported. Add a snapshot or a route instead of ignoring it.
- **Audio**: the snapshots have no scripts, so Bandcamp's player never creates its `<audio>`; `addPlayerAudio` adds one. `AUDIO_URL` is answered with a generated silent WAV (8 kHz, 8 bit, mono, 120 s). The route answers **range requests** (`206` with `content-range`, `accept-ranges: bytes`): without them Chromium cannot seek, and `currentTime` would stay at 0. The extension's page services use the `<audio>` element when it exists and fall back to clicking `.playbutton` (which does nothing in a snapshot).
- **Snapshots** are refreshed with `npm run test:snapshots` (`tests/e2e/fixtures/capture-pages.mjs`; needs network). It fetches the server HTML of each page in its `PAGES` list with a fixed desktop user agent, checks `REQUIRED_MARKUP` (album: `class="playbutton`, `class="nextbutton`, `class="prevbutton`, `play-col`; track: the three buttons; artist: nothing) so a Bandcamp markup change fails there and not in a test, removes scripts, script preloads and inline event handlers, and removes personal data: the "supported by" fan lists (`id="collectors-data"`, `class="collected-by`), any `data-*` attribute with `fan_id`, and the capturing machine's country code. It fails when fan data remains. It writes `index.json` and says when the page list changed. Snapshots are excluded from Prettier (`.prettierignore`): they are saved as captured.
- `markup.yml` refreshes the snapshots daily and commits the result (a `markup-drift` issue means the tests fail on the fresh snapshots or on the live site: fix the selectors in `src/content` and the tests, then close the issue). Review the diff for personal data before committing a manual refresh. To add a page, add it to `PAGES` and `REQUIRED_MARKUP` in the capture script and to `PAGES` in `bandcamp.ts`, then run the script.

## Keyboard

- Use real key events: `page.keyboard.press('Space')`, `'ArrowRight'`, `'Shift+KeyP'`, `'Shift+Digit2'`. The listener runs on `document` in the capture phase on `keydown`; it skips text fields, `select`, `[contenteditable]`, Bandcamp's `menu-bar`, IME composition and events the page already prevented, leaves lone modifiers and combinations without a handler (for example `Control+ArrowRight`, `Control+KeyP`) to the page, prevents the default only on a full match, and runs a held key once.
- Pages without a page service (the artist page) keep all their keys. Prove "does nothing" with `recordKeys` after the readiness marker (EXT-5), and for playback keys check the audio state too.
- To prove a key is skipped while typing, add a field with an accessible name, focus it with `locator.press(…)`, then assert the field value and that the audio is still paused.

## Spec layout

`tests/unit` (`bandcamp-parser`, `config-service`, `filename`, `filename-router`, `page-service-urls`, `shortcut-set`, `shortcut-utils`), `tests/e2e` (`seed`, then per feature: `album-shortcuts`, `settings-on-page`, `popup-settings`, `popup-shortcuts`) and `tests/live/smoke.spec.ts`. `album-shortcuts.spec.ts` is the reference for page tests, `popup-shortcuts.spec.ts` for settings page tests. Unit tests that need `chrome.storage.local` build a per-test fake (see `config-service.spec.ts`); tests that depend on the platform pin `navigator.platform` per describe and restore it (see `shortcut-utils.spec.ts`).

## Firefox

Playwright cannot load extensions into Firefox. Firefox coverage stays `npm run lint:firefox` (web-ext lint) plus manual checks; the shared code is the same for both browsers, but Chrome-only APIs (`chrome.power`, `downloads.onDeterminingFilename`, `downloads.setUiOptions`) are feature-detected and behave differently. State this in reports instead of implying Firefox was tested.

## AI tooling for tests

- **Chrome DevTools MCP** (`chrome-devtools` in [.mcp.json](../../../.mcp.json)) loads the unpacked build into Chrome for exploration and debugging.
- **Playwright Test Agents** (their MCP server runs on the same `playwright.config.ts`, so they never reach the network: `live` is not defined without `BAND_PLAY_LIVE`): [playwright-test-planner](../../agents/playwright-test-planner.md), [playwright-test-generator](../../agents/playwright-test-generator.md) and [playwright-test-healer](../../agents/playwright-test-healer.md), with the `playwright-test` MCP server in `.mcp.json`. They are generated by `npx playwright init-agents --loop=claude --project=e2e`: regenerate them after every Playwright update, and do not hand-edit them. The command overwrites `.mcp.json`; re-add the `chrome-devtools` entry afterwards (`git diff .mcp.json`).
    - Seed: `tests/e2e/seed.spec.ts` (the extension on the album snapshot). Plans go to `specs/`.
    - Their output is a draft: it must follow this skill (fixtures from `extension.ts`, helpers from `bandcamp.ts`, snapshots, no `waitForTimeout`) and pass `/e2e-review` before it is kept.
- The official `chrome-extensions` skill (plugin `modern-web-guidance`) is the reference for Chrome extension APIs.

## References

- Playwright: [Chrome extensions](https://playwright.dev/docs/chrome-extensions), [Best practices](https://playwright.dev/docs/best-practices), [Test agents](https://playwright.dev/docs/test-agents)
- Chrome: [End-to-end testing of extensions](https://developer.chrome.com/docs/extensions/how-to/test/end-to-end-testing), [Autoplay policy](https://developer.chrome.com/blog/autoplay)
- Lint: [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright)
