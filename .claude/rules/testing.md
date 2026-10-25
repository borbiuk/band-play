---
paths:
    - 'tests/**'
    - 'playwright.config.ts'
---

# Tests (Playwright)

> Conventions for the test suite. How to write, run and debug tests: the [playwright skill](../skills/playwright/SKILL.md). The test standard (rules and severities) is [e2e-review/references/rules.md](../skills/e2e-review/references/rules.md).

- **Write to the standard.** Every new or changed test follows the rules in the standard. When a rule and existing test code disagree, the rule wins.
- **Review before commit.** After writing or changing tests, run the `e2e-reviewer` agent (`/e2e-review`), fix every Critical and Major finding, and decide the Minor ones explicitly.

## Structure

- **Projects** (`playwright.config.ts`):
    - `unit` (`tests/unit/`, no browser; `npm run test:unit`): pure logic from `src`. Files: `config-service.spec.ts` (defaults, validation, shortcut merge, disabled shortcuts, settings export, import and reset, `addListener`, with a fake `chrome.storage.local`), `shortcut-set.spec.ts`, `shortcut-utils.spec.ts` (fake `navigator`), `page-service-urls.spec.ts` (`isServiceUrl` of the album, discover and collection services), `expected-filenames.spec.ts` (`toBaseFileName`, `isUniquifiedVariantOf`), `enqueue-pending-items.spec.ts` (skip downloaded, open page and notify options, with a fake `chrome.storage.local`), `downloads-list.spec.ts`, `downloads-row-view.spec.ts` and `downloads-overall.spec.ts` (the downloads page logic), `batch-download-items.spec.ts` (`patchItem`, `resumedSingle`), `tick-logic.spec.ts` (the decisions of a runner tick: what to resolve and start, the shared rate-limit pause, the next wake), `bandcamp-parser.spec.ts` (fake `fetch`), `url-utils.spec.ts`, `guard-utils.spec.ts` and `serial-queue.spec.ts` (small shared helpers). Shared test code is in `tests/helpers/`: `fake-chrome.ts` (`FakeLocalStorage`, an in-memory `chrome.storage.local` with `onChanged`, and `installChrome()`, which swaps the `chrome` global and returns the function that restores it) and `download-items.ts` (`single`, `pending`, `bundle`: batch download items for unit and e2e tests). A test that replaces `globalThis.chrome`, `fetch` or `navigator` restores the original afterwards.
    - `dist` (`tests/setup/dist.setup.ts`): runs `npm run build` (2-minute timeout) and checks that `dist/manifest.json` has the `package.json` version. `e2e` and `live` depend on it, so the npm scripts do not build themselves and a plain `npx playwright test` (and the Playwright agents) always runs on the current sources.
    - `e2e` (`tests/e2e/`; `npm run test:e2e`): the built `dist/` in Playwright's bundled Chromium (`channel: 'chromium'`), Bandcamp pages served from snapshots, no network.
    - `live` (`tests/live/smoke.spec.ts`; `npm run test:live` = `BAND_PLAY_LIVE=1 playwright test --project=live`): real bandcamp.com with Bandcamp's own player (Space starts the album, Shift+2 plays the second track). Defined only when `BAND_PLAY_LIVE` is set, so nothing else reaches the network. On demand and in the daily `markup.yml`; never part of `npm test`, `/verify` or push CI.
- `npm test` = `playwright test --project=unit --project=e2e`. Never add network access to `unit` or `e2e`. First time: `npx playwright install chromium`.
- Settings: `fullyParallel`, `retries: 0` (flaky tests are fixed, not retried), `trace: 'retain-on-failure'`, reporters `list` + `html` (plus `github` in CI). With `CI` set: `forbidOnly`, `globalTimeout` 10 minutes, `workers: 2`.

## Fixtures

- `tests/e2e/fixtures/extension.ts`: specs import `test` and `expect` from here. Fixtures: `context` (a fresh persistent Chromium profile per test with `--load-extension=dist`, `--autoplay-policy=no-user-gesture-required`; it fails the test when the extension did not load, when the extension (content script, background or an extension page) logs a console error or throws, or when a request has no snapshot or rule), `page`, `extensionId` (computed from the `dist/` path with `unpackedExtensionId`, SHA-256 mapped to `a`–`p`), `openOptions()` (opens `options.html` in a tab), `storage.set(values)` / `storage.get(key)` (`chrome.storage.local` through an extension page), option `bandcampRoutes` (`'snapshots'` by default, `'live'` in the `live` project).
- `tests/e2e/fixtures/bandcamp.ts`: `PAGES` (`album`, `track`, `artist`: an artist home page without a page service), `routeBandcamp(context)`, `openBandcamp(page, url)` (waits for `html[data-band-play="ready"]`), `addPlayerAudio(page)` (adds the `<audio>` element Bandcamp's player would create, with the silent test audio, and waits for `loadedmetadata`), `readAudio(page)` (`paused`, `currentTime`, `playbackRate`, `preservesPitch`), `recordKeys(page)` (keydowns that reach `window` in the bubble phase, with `defaultPrevented`), `AUDIO_URL`, `AUDIO_SECONDS` (120), `ALBUM_SECOND_TRACK`.
- **Audio**: `AUDIO_URL` (`https://t4.bcbits.com/stream/band-play-test.wav`) is a generated silent WAV (8 kHz, 8 bit, mono, 120 s) served with **range requests** (`206`, `content-range`), because media can seek only when the server answers them.
- **Routing**: a snapshot is served for a `document` request whose `host + pathname` is in `pages/index.json`; static resources (stylesheet, image, font, media, and `other` under `/img/`) of `bcbits.com`, `bandcamp.com` and `stripe.com` are aborted quietly; any other request is aborted and reported, which fails the test. `chrome-extension:` and `data:` URLs pass.
- **Arrange state through storage** (`storage.set({ ... })` with the stored format, for example `shortcuts` as JSON strings), not through the popup UI, unless the popup is under test. Each test starts from a clean profile.

## Snapshots

- `tests/e2e/fixtures/pages/`: `album.html` (`baugruppe90.bandcamp.com/album/laser-cut`), `track.html` (`/track/body-drift`), `artist.html` (the artist home page) and `index.json` (`pages`: `host + path` → file). Captured by `tests/e2e/fixtures/capture-pages.mjs` (`npm run test:snapshots`, needs network) with a fixed desktop Chrome user agent: Bandcamp's scripts, script preloads and inline event handlers are removed (the page must not change during a test), and fan data is removed (`#collectors-data`, `.collected-by…`, `data-*` attributes with `fan_id`, the IP country code); it fails when fan data remains or a page lacks its `REQUIRED_MARKUP`.
- Refreshed daily by `markup.yml` (committed to `master` when changed) and by hand with `npm run test:snapshots`; review a manual refresh before commit. Excluded from Prettier (`.prettierignore`).
- Adding a page: add it to `PAGES` in both `capture-pages.mjs` and `fixtures/bandcamp.ts`, add its `REQUIRED_MARKUP`, capture, and check the file for personal data.

## Specs

- `seed.spec.ts` (seed of the Playwright agents), `album-shortcuts.spec.ts` (Space on album and track, seek, speed, pitch, Control combinations left to the page, no Space while typing), `settings-on-page.spec.ts` (stored playback step and combination, a disabled shortcut leaves its key to the page, keys kept on the artist page), `popup-settings.spec.ts` (tabs, only the changed key is written, the playback step, batch options, clear history, reset all, export, import), `downloads-page.spec.ts` (the downloads page with seeded items), `batch-download-ui.spec.ts` (checkboxes, the bar, the history marks, the wishlist and purchases pages on hand-written pages), `popup-shortcuts.spec.ts` (the change dialog: record, duplicate, browser-reserved, disabled shortcut, use default; the switch, reset all and search).

## Not covered

- **Chrome only**: Playwright cannot load extensions into Firefox; never claim Firefox coverage from these tests.
- No e2e test yet for Discover, the feed and the feed player, visited highlighting, the batch runner and live progress, media keys, autoplay of the next track, Keep Awake, the notification permission prompt and the Firefox import tab. There are no snapshots of these pages (most need a signed-in account).

## Style and tooling

- Tests are TypeScript, follow the repository style (tabs, block `if`, English comments), import shared code through `@shared/*`, and are linted and type-checked with the rest of the code: `npm run lint` runs ESLint over `tests/` and `playwright.config.ts` (Node globals, type-aware `no-floating-promises`, `eslint-plugin-playwright` recommended rules plus stricter ones as errors, for example `no-wait-for-timeout`, `no-conditional-in-test`, `no-force-option`, `prefer-web-first-assertions`), and `npm run typecheck` also checks `tests/` (`tests/tsconfig.json`, types `chrome` and `node`).
- **Playwright test agents**: `playwright-test-planner`, `-generator` and `-healer` in `.claude/agents/` and the `playwright-test` MCP server in `.mcp.json` are generated by `npx playwright init-agents --loop=claude --project=e2e`. Regenerate them after every Playwright update; do not hand-edit them. The command **overwrites `.mcp.json`**: re-add the `chrome-devtools` server afterwards (`git diff .mcp.json`). Seed: `tests/e2e/seed.spec.ts`; plans go to `specs/`. Their output must follow this rule and pass `/e2e-review`.
- When the suite layout, fixtures or npm scripts change, update this rule, the playwright skill, `README.md`, the `/verify` and `/release` skills and the `qa-engineer` checklist.
