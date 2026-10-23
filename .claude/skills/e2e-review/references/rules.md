# Band Play test standard

> The rules `/e2e-review` applies to the Playwright tests of Band Play (`unit`, `e2e`, `live`). Test writers follow the same rules (the `/playwright` skill).

Built from the Playwright docs, eslint-plugin-playwright and the ISTQB syllabi (CTFL, CTAL-TA, CTAL-TAE, CTAL-TTA, CT-TAS) for a browser extension with no backend of its own. Rule IDs are stable because other files cite them: a removed ID is never reused. The IDs follow the standard of the sister project Hyperfriend; EXT-1 and EXT-2 (clipboard) do not apply here and are not used, and the Bandcamp rules are the BC group.

Format: **ID — rule** · default severity, then what to look for and the fix.

## Contents

- [Test environment](#test-environment-facts-the-rules-rely-on): the projects, the extension setup, the oracle
- [SCN — Scenario design](#scn--scenario-design): SCN-1 to SCN-8
- [AST — Assertion depth](#ast--assertion-depth): AST-1 to AST-12
- [DATA — Settings, fixtures and isolation](#data--settings-fixtures-and-isolation): DATA-1 to DATA-10
- [SYNC — Synchronization and flakiness](#sync--synchronization-and-flakiness): SYNC-1 to SYNC-17
- [MIG — Replacing or restructuring tests](#mig--replacing-or-restructuring-tests): MIG-1 to MIG-4
- [STY — Code style](#sty--code-style): STY-1 to STY-6
- [PR — Pull-request hygiene](#pr--pull-request-hygiene): PR-1 to PR-7
- [EXT — Browser extension specifics](#ext--browser-extension-specifics): EXT-3 to EXT-10
- [BC — Bandcamp pages, audio and storage](#bc--bandcamp-pages-audio-and-storage): BC-1 to BC-6
- [UNIT — Unit tests](#unit--unit-tests): UNIT-1 to UNIT-7
- [Severity](#severity): levels, examples and the verdict
- [Top defects to check first](#top-defects-to-check-first)
- [Tool messages → rules](#tool-messages--rules): lint rule to rule ID map

## Test environment (facts the rules rely on)

Where things live: `playwright.config.ts`, `tests/unit/**`, `tests/setup/dist.setup.ts`, `tests/e2e/fixtures/{extension.ts,bandcamp.ts,capture-pages.mjs}`, `tests/e2e/fixtures/pages/*.html` with `index.json`, `tests/e2e/*.spec.ts` (`seed.spec.ts` is the seed of the Playwright test agents), `tests/live/**`, `tests/tsconfig.json`. CI: `npm run test:unit` in job `build` and job `e2e` (Node 24) in `build.yml`, and `markup.yml` (daily and manual: refreshes the snapshots, runs e2e and live).

- **`unit`**: Node, no browser. Pure logic from `src/` (`@shared/*`, or a relative import for content, background and downloads modules); there is no `chrome` global, so a test that needs `chrome.storage.local` builds a per-test fake.
- **`e2e`**: the built extension from `dist/` in Playwright's bundled Chromium (`channel: 'chromium'`, headless unless `--headed`) via `launchPersistentContext` with `--disable-extensions-except`, `--load-extension` and `--autoplay-policy=no-user-gesture-required`. The `dist` setup project runs `npm run build` before it.
    - The extension id is computed from the absolute path of `dist/`, not read from the service worker.
    - `context.route('**/*')` serves script-stripped snapshots of public `baugruppe90.bandcamp.com` pages (album, track, and the artist home page, which has no page service), looked up by host + path for `document` requests. The test audio URL gets a silent WAV with range support. Static resources of the Bandcamp hosts are aborted quietly; every other request is aborted, reported and fails the test.
    - Bandcamp's own scripts are removed, so the test adds the `<audio>` element (`addPlayerAudio`). The content script sets `html[data-band-play="ready"]` when its settings are loaded and the shortcut listener runs (`openBandcamp` waits for it).
    - Settings are written with `storage.set` to `chrome.storage.local` from an extension page. The popup is tested as `chrome-extension://<id>/options.html`.
- **`live`**: real bandcamp.com, anonymous, on demand (`npm run test:live`, which sets `BAND_PLAY_LIVE`; the project does not exist without it); also run daily by `markup.yml` after the snapshot refresh (05:17 UTC, plus manual dispatch). Never part of push or pull request CI.
- **Firefox is not covered**: Playwright cannot load extensions into Firefox. Firefox stays `npm run lint:firefox` plus manual checks (EXT-8).
- **Pages that need a signed-in fan account** (feed, collection, wishlist, purchases, batch download) and the downloads page with real downloads are not covered by e2e today: they stay manual checks unless a test builds a safe snapshot for them (DATA-6, PR-7).
- **The oracle** (what correct behaviour is): the feature list and the shortcut table in `README.md`, [bandcamp-dom.md](../../../rules/bandcamp-dom.md) (page services and selectors), [messaging.md](../../../rules/messaging.md), [popup.md](../../../rules/popup.md), [batch-download.md](../../../rules/batch-download.md), and the code of the page services in `src/content/page-services/`.

---

## SCN — Scenario design

**SCN-1 — One behaviour per test.** · Major

- _Detect_: one `test()` that mixes unrelated concerns: a playback shortcut and a popup setting, seeking and the speed, a positive case and an unrelated negative one.
- _Fix_: split; each test arranges its own state.
- _Not a finding_: one shortcut on one page state with its observable outcomes in steps (press → audio state → press again → reverted state); a positive control placed before a negative check on purpose (EXT-5).

**SCN-2 — One full-proof test per page kind and entry point; logic variations go to unit tests.** · Major

- _Full proof_: the shortcut changes the `<audio>` state (or the Bandcamp control it drives) to the exact expected value, and the key is taken from the page (`defaultPrevented: true` where it matters). Needed once for each page service the change touches (album and track share one).
- _Point e2e tests_ cover only what needs a browser: the shortcut skipped in a text field, a combination with an extra modifier left to the page, a page without a page service, a stored setting that changes the behaviour, popup persistence.
- Parsing, URL matching, file names, shortcut sets and the human-readable shortcut labels are unit tests (`bandcamp-parser`, `page-service-urls`, `filename`, `shortcut-set`, `shortcut-utils`). One e2e test with a seeded setting proves the content script uses the stored value.
- _Detect_: a page kind with only a presence check; edge cases of pure logic multiplied through the browser.

**SCN-3 — Parameterize independent cases; stay DAMP when the Arrange differs.** · Major

- _Detect_: `for (…) { await test.step(…) }` over independent cases (pages, keys, settings): it stops at the first failure and later cases do not start clean.
- _Fix_: one top-level `test()` per case, generated from a table (as `album-shortcuts.spec.ts` does for the album and track page); a missing precondition is `test.skip(condition, reason)` inside the generated test.
- _Not a finding_: one Arrange and Act followed by a loop of assertions; near-identical tests whose Arrange really differs (keep them explicit, do not force a config object).

**SCN-4 — Step and test titles match their assertions.** · Major

- A title that promises a check the body does not make is a false claim of coverage. Add the assertion or rename.

**SCN-5 — Arrange is visible.** · Minor

- Seeding, routing and the audio element live in fixtures, in `beforeEach`, or in `test.step('setup: …')` steps that return what the test needs; outcome steps are named for what they prove.

**SCN-6 — Known gaps are explicit and removed when fixed.** · Minor

- `test.fixme(…)`, `test.skip(condition, '<reason>, <issue link>')` or `test.fail(…)` with an `issue` annotation; never a commented-out test or an emptied body. A gap comment left next to a check that now passes is a finding.
- Firefox is a stated scope limit (EXT-8), not a per-test skip.

**SCN-7 — Tests are independent and parallel-safe.** · Major

- _Detect_: an outer `let` shared between tests; a test that relies on a previous one; `describe.serial` / `mode: 'serial'` without a real reason; side effects at module or `describe` level (they run at collection time); a worker-scoped context handed to tests that change storage without a reset (DATA-3).

**SCN-8 — No branching on page content.** · Minor

- `if (await button.isVisible())` hides what the test proves. Snapshots are deterministic, so assert unconditionally; in `live`, use `test.skip(condition, reason)` at the top of the test.

---

## AST — Assertion depth

**AST-1 — The test owns its outcome assertions.** · Major

- Fixtures (`extension.ts`, `bandcamp.ts`) arrange and return data: the extension id, a page, `readAudio(page)`, the `recordKeys` reader, `storage.get(key)`. The spec asserts. A fixture that asserts the audio state, the stored value or a popup message hides coverage from the reader. Waiting for the readiness marker or `loadedmetadata` inside a helper is arrange, not an outcome assertion.

**AST-2 — Assert concrete values, not presence.** · Major

- After a shortcut: the exact audio state (`paused`, `currentTime` close to the expected second, `playbackRate`, `preservesPitch`), not "something changed".
- After a key: the recorded `{ code, defaultPrevented }` list with `toEqual`, not "the list is not empty".
- A popup change: the exact stored value and the field value after reload.

**AST-3 — List coverage proves every item, not one.** · Major

- _Detect_: "one track got the mark" as the only assertion for a feature that applies to every item (visited marks, batch download checkboxes, track list handling).
- _Fix_: the count equals the number of items in the snapshot (from a fixture constant, `toHaveCount`), each item is identified by its own title or link, and after a rescan there is still exactly one per item.

**AST-4 — Accessible names and announcements are asserted.** · Minor

- _Why_: screen-reader users get the result of a popup action only through the `role="status"` and `role="alert"` regions and the control names.
- _Look for_: popup tests that assert visuals only.
- _Fix_: locate controls by role and name (`getByRole('checkbox', { name: 'Autoscroll' })`) and assert the status or alert text after a save, a reset or a refused combination.

**AST-5 — UI state is behaviour.** · Major

- Popup: checkbox state, the field value of the shortcut recorder, the status text ("… saved.", "… reset to the default."), the alert text, hidden controls where a feature is not available.
- Page: the feed player, the batch download overlay and the visited marks are behaviour too when the change touches them.

**AST-6 — Downloads are verified as files or as stored state.** · Major

- A test of a download path checks what was produced: a file saved under `testInfo.outputPath()` and read back, or the item state the extension stores, with `waitForEvent('download')` armed before the action (SYNC-4). A click on "Download" that only checks a toast proves nothing.

**AST-7 — No assertion that cannot fail.** · **Critical** (Minor when a later assertion would catch the same defect)

- A vacuous assertion reports coverage that does not exist. Shapes to look for in this repo:
    - the audio state read without a known starting value: a seek test on audio that never loaded, or "paused is true" on audio that was never played (BC-5);
    - absence asserted right after an action (`currentTime` is 0 right after a key press) — it passes before anything could happen (EXT-5);
    - the expected value computed with the code under test (`mapToHumanString`, `configService`, a page service) or read from the page under test. Build it from the test's own constants;
    - `toBeGreaterThan(0)` on `currentTime` or `playbackRate` instead of the exact expected value with a stated tolerance;
    - `.first()` on a list of extension elements: passes when other items have none or two;
    - a seeded setting equal to the default: the test passes whether or not the seed was applied (DATA-2);
    - `expect(locator).toBeTruthy()`, `expect(x)` without a matcher, a matcher without `()`, `expect` inside `if` / `catch`, an empty `catch {}` or `.catch(() => {})` around an action;
    - an `expect.soft` that a later step depends on.
- _Fix_: scope to the specific item; exact equality with values from the test's data; positive control before absence (EXT-5); assert unconditionally.

**AST-8 — User feedback is asserted explicitly in the spec.** · Major

- Literal texts: popup status "`<shortcut>` saved." and "`<shortcut>` reset to the default.", alerts "Press a key combination first.", "The browser uses this combination. Choose another one.", "`"<shortcut>"` already uses this combination.". Never asserted inside a fixture. Build the shortcut name from `ShortcutType`, not a copied literal.

**AST-9 — Time is compared through injected values.** · Major

- Unit: a function that reads the time gets it as an input (or the clock is set per test), then the exact result is compared. E2E: never compare with the test's own `new Date()`.

**AST-10 — Platform-dependent display strings follow one mirror.** · Minor

- Shortcut labels depend on `isMac()` (`⇧ + K` on macOS). The expected value comes from one helper or a per-platform table keyed on the platform the page or process reports, never a literal from the author's machine (a Mac literal fails on Linux CI). In e2e the popup runs in Chromium on the host platform: an expected label is valid only for the platform it names, or the test pins it.

**AST-11 — Validation coverage is complete and scoped.** · Minor (one finding per form or function)

- Every user-visible message is covered somewhere, by its text: the shortcut recorder (no combination, browser-reserved, already used by another shortcut), the playback step limits, the filename template.
- The logic that produces the messages is unit-tested at both sides of each limit (UNIT-6). In e2e, one message per region is enough when unit tests cover the rest.
- Several invalid inputs at once only while each message is asserted on its own.

**AST-12 — Web-first assertions only.** · Major

- `expect(await loc.isVisible()).toBe(true)`, `expect(await loc.count())…`, `expect(await loc.textContent())…` → `toBeVisible()`, `toHaveCount()`, `toHaveText()`. Values that are not locators (audio state, storage, recorded keys) are polled: `await expect.poll(async () => (await readAudio(page)).paused).toBe(false)`.
- _Not a finding_: a plain `expect` on a value read once to prove that nothing changed, after the event was demonstrably processed (EXT-5), or on a starting value.

_Good practice (do not flag)_: recording `event.defaultPrevented` with a page-side listener (EXT-5); asserting the starting state of the audio before the first key.

---

## DATA — Settings, fixtures and isolation

There is no backend. "Data" is the extension's settings (and history) in `chrome.storage.local`, the Bandcamp page snapshots, the test audio, and sample models in unit tests.

**DATA-1 — Arrange through storage and fixtures; the popup UI only when the popup is under test.** · Major

- Write `chrome.storage.local` with `storage.set` (BC-4) and await it **before** opening the Bandcamp page: the content script reads the settings when it starts. A change while the page is open is a different behaviour (live update, SYNC-13).
- _Detect_: popup clicks or typing used to set up a content-script test.

**DATA-2 — Seeded settings use the stored shape and differ from the defaults when they matter.** · Major

- The keys are the `ConfigModel` keys the extension writes (`playbackStep`, `autoscroll`, `shortcuts`, …), with the stored types: numbers as numbers, each shortcut combination as a JSON string of key codes (`JSON.stringify(['KeyK'])`), `'[]'` for "use the default". A value in another shape is dropped by `configService` on read, the default applies, and the test passes for the wrong reason (unless the test is about that fallback).
- A seed that proves something must differ from the default, or the test passes without it (a playback step of 10 proves nothing about the stored step).

**DATA-3 — Every test starts from a clean state.** · Major

- A new persistent context per test (its own temporary user data dir), or a worker context where every test clears storage, closes its pages and resets its routes. Do not flag the cost of a fresh launch.

**DATA-4 — No live network outside `live`.** · Major

- Every request from the e2e browser is routed: Bandcamp documents to snapshots, the audio URL to the silent WAV, known static resources aborted, everything else aborted and reported, and an unexpected request fails the test instead of passing silently (BC-1). `unit` makes no network calls. `live` never runs on pushes or pull requests and never blocks a merge.

**DATA-5 — Inputs respect product limits unless they probe them.** · Major

- Playback step: 1 to 120 seconds. Shortcuts: a full combination that no other shortcut uses and the browser does not reserve. A seek target inside the audio length (`AUDIO_SECONDS`, 120 s): a seek past the end clamps and the test proves something else.

**DATA-6 — No signed-in Bandcamp session.** · **Critical**

- Snapshots are captured signed out; no cookies, `storageState`, identity tokens or credentials in tests, fixtures or workflows; `live` runs anonymous. Pages that need a fan account (feed, collection, wishlist, purchases) stay manual checks.

**DATA-7 — Parallel-safe resources.** · Major

- Each context has its own user data dir; downloads and generated files go under `testInfo.outputPath()`; no fixed ports or shared temporary paths.

**DATA-8 — Time-stable data.** · Major

- No current date or year in expectations. Release dates and counts in snapshots are frozen text; do not assert them.

**DATA-9 — Act on the item the test names.** · Major

- A locator scoped to the item by its title, link or accessible name; not `.first()` / `.nth(i)` on all items. Shortcuts by index (`Shift+Digit2`) name the item by its position on purpose: assert the title of the track that started.

**DATA-10 — Constants come from one place.** · Major

- Page URLs, track titles, the audio URL and its length are fixture constants (`bandcamp.ts`: `PAGES`, `AUDIO_URL`, `AUDIO_SECONDS`, `ALBUM_SECOND_TRACK`); the extension id is computed (EXT-7); the `dist/` path is `DIST_PATH` in `extension.ts`; shortcut names come from `ShortcutType`. A `https://baugruppe90.bandcamp.com/...` literal in a spec is a finding.

---

## SYNC — Synchronization and flakiness

**SYNC-1 — No hard waits.** · **Critical**

- `page.waitForTimeout()` and sleep loops, including "let the audio start" or "wait for the template save". Wait for the state with a web-first assertion or `expect.poll`.

**SYNC-2 — No `networkidle`.** · **Critical** (bare) / Major (bounded)

- Also `{ waitUntil: 'networkidle' }` on `goto()`, `reload()`, `waitForURL()`. Wait for the readiness marker or a specific element instead.

**SYNC-3 — Every async Playwright call is awaited.** · **Critical**

- Including `page.evaluate`, `storage.set`, `addPlayerAudio`, `recordKeys`, `context.route`, `test.step`. Exception: a wait promise armed before an action and awaited right after.

**SYNC-4 — Event waits are armed before the action.** · Major

- `waitForEvent('download')`, `context.waitForEvent('page')` (a shortcut that opens a new tab), `waitForRequest`: in one `Promise.all` with the action, or stored in a variable before it. Never `await action; await page.waitForEvent(…)`.

**SYNC-5 — Explicit waits only for an objective race.** · Minor

- Auto-waiting covers most cases; an extra `waitForURL` or `waitFor()` before a normal action or assertion is clutter. A justified wait has a one-line comment naming the race.

**SYNC-6 — Wait for the extension to be ready before acting.** · Major

- On a Bandcamp page the readiness signal is `html[data-band-play="ready"]` (BC-3); in the popup, the loaded state (a field showing the stored value, as `selectShortcut` in `popup-shortcuts.spec.ts` waits for it) before typing or clicking.

**SYNC-7 — Polling with `expect.poll` / `toPass`, with a timeout.** · Major

- No `Date.now()` deadlines, `for (;;)` loops or manual retry counters; `toPass()` always gets an explicit `timeout` (its default retries until the test times out).

**SYNC-8 — Overlays are gone before the next interaction.** · Major

- After closing a dialog, the batch download overlay or a menu: `await expect(<the element that would intercept>).toBeHidden()` before the next step.

**SYNC-9 — The popup's save finishes before the result is read.** · Major

- The filename template saves after a short pause while typing; the shortcut recorder saves on "Save". Poll storage (`expect.poll(() => storage.get(key))`) or wait for the status text before reading storage, reloading or closing the page.

**SYNC-10 — `.first()`, `:visible` and `{ force: true }` need a root cause; generic text needs a scope.** · Major

- Bandcamp pages repeat controls (a play button per track row and one in the player): scope to the container instead of `.first()`. `dispatchEvent('click')` is `force` in disguise.
- Accessible names and text match as case-insensitive substrings by default: use `exact: true` or an anchored regex when a shorter name is a prefix of another.
- A kept `.first()` / `:visible` carries a one-line comment explaining why the duplicates are equivalent.

**SYNC-11 — A `has:` inner locator is not re-rooted outside the row.** · **Critical**

- `rows.filter({ has: page.locator('…') })` is correct (resolved inside each row). Chained from another scope (`has: list.locator(…)`) or naming an ancestor outside the row, it matches nothing and every negative check on it passes. An attribute of the row itself goes in `.and(…)`.

**SYNC-12 — Route handlers are precise and fail loudly.** · Minor

- Snapshots are matched by exact host + path for documents; an unknown request is aborted and reported, never answered with a fallback page or passed to the real network with `route.continue()`.

**SYNC-13 — Settings changed after load reach the page asynchronously.** · Major

- With a Bandcamp page open, a storage change arrives through `chrome.storage.onChanged`. Assert the resulting behaviour with polling; never assume it is immediate, and do not reload to "apply" it unless startup is the behaviour under test.

**SYNC-14 — Flakiness is not fixed with retries, fewer workers or bigger timeouts.** · **Critical**

- Raising `retries`, lowering `workers` or raising timeouts as a "fix" masks races; fix the race. `{ timeout: 0 }` disables a timeout (Major). A justified longer timeout is a named constant with a reason (Minor), as `BUILD_TIMEOUT_MS` in `dist.setup.ts`.
- Exception: the `live` project may have retries in its own config, with a comment (real network).

**SYNC-15 — Routes, permissions and listeners are set before navigation.** · Major

- `page.route` / `context.route`, `addInitScript`, console and `pageerror` listeners come before `goto()`; otherwise the first requests and errors are missed. `recordKeys` comes after `openBandcamp` (it installs a listener in the loaded page) and before the key press.

**SYNC-16 — No legacy or redundant waits.** · Major (legacy) / Minor (redundant)

- `waitForNavigation()` → `expect(page).toHaveURL(…)`; `waitForSelector()` → a locator assertion; `waitFor()` / `isVisible()` right before `click()` on the same element adds nothing.
- `keyboard.press()` runs no actionability checks: the focus it relies on is established explicitly (the document body for a positive shortcut test, the text field with `locator.press` for the "skipped while typing" test).

**SYNC-17 — Mock only the third party; the extension's own paths stay real.** · Major

- Bandcamp's pages, its player's `<audio>` element and its media stream are the test environment: replacing them is required in `e2e` (BC-1, BC-2).
- Never stub `chrome.storage`, `chrome.runtime` messaging, `HTMLMediaElement.prototype.play` or the content script in a happy-path e2e test.
- An injected failure (an audio `error`, a failing request) is allowed when the test is about that failure **and** asserts the failure state is rendered. A stub in the page's main world does not reach the content script's isolated world for its own globals, so only the rendered result proves it took effect.
- The route is registered before the request and the test asserts the routed page loaded (the readiness marker), so an unmatched route cannot pass silently.

---

## MIG — Replacing or restructuring tests

**MIG-1 — Coverage parity is mandatory; extension is welcome.** · Major

- A rewritten spec, or one moved onto new fixtures, covers every scenario of the old one. Removing a check needs a reason in the PR description.

**MIG-2 — No coverage gap, no dead code.** · Major

- Do not delete the old spec before its replacement is merged. No fixture, helper or snapshot without a consumer "for the next PR".

**MIG-3 — Changed expectations are explained.** · Major

- Editing an expected value, label or count to make a test pass needs the product change behind it (the matching `RELEASE_NOTES.md` entry or source change) named in the PR. Silent re-baselining drops coverage.

**MIG-4 — Superseded code is removed.** · Minor

- Once the replacement is merged, the old spec and its now-unused helpers go in the follow-up.

---

## STY — Code style

**STY-1 — Comments explain why, never what.** · Minor

- Allowed: a workaround, a browser quirk (Chromium corrects the pitch by default), a race, a snapshot detail the test relies on. Flag narration, AI provenance notes, `// TODO` in merged code, commented-out code, and comments the change made stale.

**STY-2 — TypeScript and repo conventions.** · Minor

- Block `if` statements, tabs, single quotes (ESLint and Prettier), `import/order` groups, explicit return types on exported helpers, no `any`, `async` / `await` instead of `.then()` chains, `@shared/*` to reach `src/shared` (a relative `../../src/...` only for modules outside `src/shared`).

**STY-3 — Reuse before writing.** · Minor

- Use the fixtures' helpers (`openBandcamp`, `addPlayerAudio`, `readAudio`, `recordKeys`, `storage`, `openOptions`) instead of inline copies; flag duplicated utilities.

**STY-4 — No debug leftovers or legacy page APIs.** · **Critical** for `test.only` / `page.pause()`; Major for `evaluate` closures; Minor otherwise

- `test.only`, `test.describe.only`, `page.pause()`; `console.log` stage logging in specs; `headless: false` committed in config.
- `page.$`, `page.$$`, `page.$eval`, `page.click(selector)` → the Locator API.
- `page.evaluate(() => outerVar)`: the callback runs in the browser; pass values as the argument (as `addPlayerAudio` passes `AUDIO_URL`).

**STY-5 — Labels and names are accurate.** · Minor

- Typos, or titles that contradict the data ("step over 60 seconds" with a seed of 30).

**STY-6 — Spec files export nothing and are never imported.** · Minor (export) / Major (a spec imports a spec)

- Playwright refuses to load a run where a test file imports another test file; `--list` shows it. Shared values live in fixture or constant modules.

---

## PR — Pull-request hygiene

**PR-1 — The description says what and why.** · Major (empty or missing what/why) · Minor (stale details)

- Use the repository's pull request template. For new coverage, name the scenarios covered and those left out (Firefox, signed-in pages, anything manual). For a flaky fix, the root cause.

**PR-2 — Evidence of a green run.** · Minor

- A CI run or a local `npx playwright test` result for the changed specs; a flaky fix shows `--repeat-each`. A change to a shared fixture shows the specs that use it, not only the new one.

**PR-3 — Config and tooling changes are justified; Playwright is pinned.** · Major (config, version) / Minor (otherwise)

- Every `playwright.config.ts` change (projects, retries, workers, timeouts, `use`) has its own justification.
- `@playwright/test` and `eslint-plugin-playwright` are exact versions; a Playwright bump goes in its own PR, and CI installs the browser from that same package (`npx --no playwright install --with-deps chromium`).
- Regenerated snapshots come from the capture script in their own commit: the daily `markup.yml` commit as `github-actions[bot]`, or a manual one with the capture date in the PR. Hand edits to a snapshot are named and minimal.
- The `markup.yml` workflow runs only on a schedule or manual dispatch (never on push or pull request) and has only the permissions it needs (`contents: write` for the snapshot commit, `issues: write` for the drift issue); `build.yml` stays `contents: read`.

**PR-4 — Traceability.** · Minor

- Link the GitHub issue when there is one (the template's `Fixes` line).

**PR-5 — "Resolved" means fully changed.** · the original finding's severity

- A finding the author marks as fixed must have a change that covers all of it. A partial fix is reported as what is done plus what is still missing, at the original severity. A new problem introduced by the fix is a new finding.

**PR-6 — Docs follow the change.** · Minor

- Moving test paths, renaming npm scripts or changing a convention updates `README.md`, `AGENTS.md`, [testing.md](../../../rules/testing.md), the [playwright skill](../../playwright/SKILL.md), the [verify skill](../../verify/SKILL.md) and this standard in the same PR.

**PR-7 — Nothing secret or personal is committed, in any commit of the PR.** · **Critical**

- Tokens, cookies, `storageState` files, `.env`, store credentials. Anything added in one commit and removed in a later one is still in the history: the fix is rotating the secret, not deleting the file.
- **Snapshots hold no personal data**: captured signed out, scripts removed, no "supported by" fan lists (`collectors-data`, `collected-by`), no `fan_id` anywhere, no country code of the capturing machine, no email addresses, no signed-in fan data. Public release metadata the tests need (artist, album and track titles, track list) is fine. Never quote the leaked value in a finding.

---

## EXT — Browser extension specifics

EXT-1 and EXT-2 (clipboard payload and clipboard reads) are not used in this project.

**EXT-3 — Keyboard tests use real key events.** · Major

- `page.keyboard.press('Space')`, `locator.press('Shift+KeyK')`, or `Input.dispatchKeyEvent` through a CDP session when `key` and `code` must differ.
- Never `dispatchEvent(new KeyboardEvent(…))`: untrusted events carry no user activation, so `play()` and the extension path differ and the test proves something else.
- Each skip case (text field, `select`, `[contenteditable]`, extra modifier, key repeat, page without a page service) is its own test with explicit focus.

**EXT-4 — Locators follow the product's selector rules.** · Major (hashed class, position path, XPath) / Minor (a weaker but stable choice)

- Extension DOM: role and accessible name in the popup (`getByRole('textbox', { name: 'Key combination' })`), and the `data-band-play*` markers on Bandcamp pages for structure and counts. The `ready` marker proves readiness, not behaviour.
- Bandcamp DOM: the stable hooks the page services use (`.playbutton`, `.nextbutton`, `.prevbutton`, `.track_info .title`, `.play-col`), as listed in [bandcamp-dom.md](../../../rules/bandcamp-dom.md). Never `nth-child` paths or layout classes the extension does not use.

**EXT-5 — "Does nothing" is proven after a positive control in the same page state.** · **Critical** (AST-7 shape)

- Applies to a key left to the page (extra modifier, no matching shortcut, a page without a page service), a key while typing, and a feature turned off in the settings.
- (1) A positive control shows the extension is live: the readiness marker is set, so the settings loaded and the listener started; for a key that a setting moved, the new key works in the same test. (2) The absence is checked only after the event has demonstrably been processed: `recordKeys` shows the key reached `window` with `defaultPrevented: false` (the extension prevents the default in the capture phase on a match). (3) Then the audio state is still the starting one (still paused, `currentTime` still 0).
- A bare check right after the action passes before anything could have happened.

**EXT-6 — In-page navigation is simulated in the page.** · Major

- Bandcamp's feed and discover pages change the URL without a full load; the background script reports URL changes to the content script. Simulate with `history.pushState` (and the content swap) in the page; `page.goto()` is a full load: a different code path.
- Assert the state after the change: the page service that now applies, tracks re-read, stale extension elements removed.

**EXT-7 — Tests run the current build, with the computed id.** · Major

- e2e loads `dist/` (never `src/`), built right before the run by the `dist` setup project (or a CI step); a stale build gives a false green.
- The extension id is computed from the absolute `dist/` path and checked by fetching its `manifest.json`; never hardcoded. The fixture fails fast when the extension did not load instead of letting every test time out.
- Extension pages and the content script log no errors: the fixture collects `console` errors and page errors from `chrome-extension://<id>/` and the test fails on them.

**EXT-8 — Coverage claims match what ran.** · Major (a false claim) / Minor (an unstated limit)

- Chromium only. No `firefox` or `webkit` project for extension tests; titles, comments and PR text do not claim Firefox. Firefox-only behaviour (Keep Awake hidden, no download filename routing, no download shelf control) and signed-in pages are listed as manual checks. The `live` smoke is not a gate.

**EXT-9 — Popup tests prove persistence.** · Major

- A setting changed in the popup is asserted in `chrome.storage.local` (stored shape, `storage.get`) **and** after reloading `options.html`; a content-script effect is asserted on a Bandcamp page. The control's visible state alone proves nothing. Keys the user did not change stay unwritten (`storage.get` returns `undefined`).

**EXT-10 — `live` is a smoke test, not a copy of e2e.** · Major

- Read-only and anonymous; a few tests: Space starts Bandcamp's own player on a real album page, and a track shortcut plays the expected track of a stable album. A failure (or an e2e failure on freshly captured snapshots) means "Bandcamp changed its markup": `markup.yml` opens a `markup-drift` issue; fix the selectors and the tests. Never part of the default test run or of push and PR CI.

---

## BC — Bandcamp pages, audio and storage

**BC-1 — Every request is served by a snapshot or a rule, or it fails the test.** · Major (Critical when a change lets requests reach the network)

- `routeBandcamp` serves `document` requests from `pages/index.json` (host + path), the audio URL from the silent WAV, aborts static resources of the known Bandcamp hosts quietly, and reports everything else; the context fixture fails the test when the list is not empty.
- _Detect_: widening `STATIC_HOSTS` or `STATIC_TYPES`, or adding `route.continue()` for an `https:` URL, to silence a report; a test-level route that answers every URL; a spec on a URL that has no snapshot.
- _Fix_: add the page to the capture script (`PAGES` and `REQUIRED_MARKUP`) and to `PAGES` in `bandcamp.ts`, or a precise route for that request.

**BC-2 — The `<audio>` element is added by the test, and only after the page is ready.** · Major

- The snapshots have no Bandcamp scripts, so nothing creates the player's `<audio>`. Call `addPlayerAudio(page)` after `openBandcamp` and before the first playback key; it waits for `loadedmetadata`, so the length is known and seeking works.
- _Detect_: a playback test without `addPlayerAudio` (the page service clicks `.playbutton`, which does nothing, and an absence check passes); a second `<audio>` element (`readAudio` reads the first one); stubbing `play()` or `paused`; a custom audio source without range support.
- In `live`, Bandcamp's own player creates the element: do not add one there.

**BC-3 — Wait for the readiness marker before any key press.** · Major

- `openBandcamp(page, url)` waits for `html[data-band-play="ready"]`, which `content.ts` sets after the settings loaded and the shortcut listener started. A bare `page.goto()` followed by a key races the listener (the key is lost, or handled with the default settings).
- The marker proves readiness, not behaviour: an absence check still needs EXT-5.
- _Detect_: `page.goto` on a Bandcamp URL in a spec; a key press before `openBandcamp` resolved; an own wait for the marker instead of the helper (STY-3).

**BC-4 — Storage is read and written from an extension page.** · Major

- `storage.set` / `storage.get` run `chrome.storage.local` in an `options.html` tab. The Bandcamp page's main world has no `chrome.storage`, and the content script's isolated world is not reachable from `page.evaluate`.
- _Detect_: `page.evaluate(() => chrome.storage…)` on a Bandcamp page; `chrome.storage.sync` (the extension does not use it); settings written through popup clicks for a content-script test (DATA-1); a seed written after `openBandcamp` for a startup behaviour.

**BC-5 — The media state starts known and is compared with a stated tolerance.** · Major (Critical when the test cannot fail, AST-7)

- Before the action the starting state is known: `currentTime` 0 and `paused: true` after `addPlayerAudio`, `playbackRate` 1, `preservesPitch` true by Chromium's default (asserted or stated in a comment). Expected values come from the test's constants (the default step of 10 seconds, the seeded step, the speed step), not from the code under test.
- Compare times and rates with `toBeCloseTo(expected, digits)`, never `toBeGreaterThan`; poll them (`expect.poll`), because the media element updates asynchronously.
- _Detect_: an expected time beyond `AUDIO_SECONDS`; a speed test that changes `playbackRate` once and checks "not 1".

**BC-6 — The capture script keeps its safety checks.** · **Critical** (personal data) / Major (markup checks)

- `capture-pages.mjs` removes scripts, script preloads and inline event handlers, removes fan lists, `fan_id` attributes and the country code, and throws when fan data remains. `REQUIRED_MARKUP` fails the capture when a page lost the markup the extension or the tests need.
- _Detect_: a weakened or removed strip step or final check; a new page without `REQUIRED_MARKUP` entries; a page that needs sign-in; capture with cookies or a signed-in session (DATA-6).

---

## UNIT — Unit tests

**UNIT-1 — One `test()` per case when the Arrange differs.** · Major

- Table-driven: `for (const c of CASES) { test(c.title, …) }`, with the input in the title. No `test.step` loops over cases. One Arrange with many assertions is fine.

**UNIT-2 — Expected values are literals derived from the test's own inputs.** · Major (Critical when the function under test produces the expected value, AST-7)

- A file name, a parsed track list, a shortcut label or a matched URL is compared with a literal written in the test. Never compute the expected value with the function under test or a copy of its algorithm. Compare the whole result (`toEqual`), not one field.
- Sample models and HTML inputs are built in the test or a small factory with explicit fields; include the edge cases that matter (invisible characters, long names, trailing dots, encoded titles).

**UNIT-3 — No shared mutable fake storage between tests.** · Major

- A fresh fake `chrome` per test (fixture or `beforeEach`), restored afterwards; never a module-level fake mutated across tests.
- A module that keeps module-level state is either isolated per test or not depended on, and the spec says which (`config-service.spec.ts` states that `configService` keeps none).

**UNIT-4 — Unit tests stay DOM-free unless the unit needs it.** · Minor

- `@shared/*` for `src/shared`; content, background and downloads modules by a relative import. Globals a unit needs (`navigator`, `chrome`) are minimal per-test stubs, removed afterwards; no full DOM emulation for pure functions.

**UNIT-5 — The fake behaves like `chrome.storage.local` where the code depends on it.** · Major

- Promise API (`get`, `set`, `remove`, `clear`); `onChanged` events with `newValue` / `oldValue`; values copied on write and read (`structuredClone`) so a test cannot pass through a shared reference. Failures are injected explicitly (a rejecting `set`, a missing `chrome.storage`) for the error paths.

**UNIT-6 — Untrusted input and limits are tested on both sides.** · Minor (one finding per function)

- Stored values of the wrong type (a corrupt shortcut string, a non-numeric step), parsed Bandcamp data, file name parts: exactly at the limit (for example the 120-character name part) passes unchanged, one past it is cut, and each user-facing message is asserted by its exact text. The boundary belongs here, not in e2e (AST-11).

**UNIT-7 — Time and platform are inputs.** · Major

- Where the code reads `isMac()` (`navigator.platform`), set the platform per test and restore it, as `usePlatform` in `shortcut-utils.spec.ts` does: Node exposes `navigator.platform` (`MacIntel` on macOS), so an unpinned test passes on a Mac and fails on Linux CI. Time is passed in or set per test.

---

## Severity

| Severity     | Meaning                                                                                                                 | Examples                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | The test can pass while the feature is broken, hangs or flakes by construction, masks flakiness, or is unsafe to commit | vacuous assertion nothing later catches (incl. an absence check without a positive control, audio that never loaded, an expected value computed by the code under test), re-rooted `has:`, missing `await`, `waitForTimeout`, bare `networkidle`, flake "fixed" with retries or timeouts, signed-in session or secrets (also in intermediate commits), personal data in snapshots or a weakened capture check, `test.only` / `page.pause()`                                                                                |
| **Major**    | A convention break that makes tests slow, flaky, misleading or hard to maintain                                         | several behaviours in one test, presence-only checks, settings arranged through the popup, a seed in the wrong shape or equal to the default, live network in e2e, synthetic key events, a key pressed before the readiness marker, no `addPlayerAudio`, storage read on the Bandcamp page, `.first()` on repeated controls, mocking the extension's own code, stale `dist/`, Firefox coverage claimed, shared fake storage, platform-dependent unit test, unjustified config change, suite no longer compiling or loading |
| **Minor**    | A local improvement                                                                                                     | titles, comments, duplication, redundant waits, magic timeouts, a substring match that hits nothing else today, a redundant assertion a later one covers, missing validation messages (one per form or function), stale PR description details                                                                                                                                                                                                                                                                             |
| Nit          | Formatting                                                                                                              | never reported (Prettier's job)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

A partial fix of an earlier finding (PR-5) keeps the original severity. Verdict: any Critical or Major → **changes needed**; only Minor → **ready, with suggestions**; nothing → **ready**.

## Top defects to check first

Expected for this suite (an extension with keyboard shortcuts on media, a settings page and a snapshot-served site); each maps to a rule:

1. "The key does nothing" asserted right after the key press, without `recordKeys` or a positive control — **EXT-5, AST-7**.
2. A key pressed after a bare `page.goto()`, before the readiness marker — **BC-3, SYNC-6**.
3. A playback test without `addPlayerAudio`, or a stubbed `play()` — **BC-2, SYNC-17**.
4. Times and rates compared with `toBeGreaterThan` or without a known starting value — **BC-5, AST-7**.
5. Synthetic `KeyboardEvent`s instead of `page.keyboard` / `locator.press` — **EXT-3**.
6. Settings arranged through the popup, written in the wrong shape (a shortcut array instead of a JSON string) or equal to the default — **DATA-1, DATA-2, BC-4**.
7. Storage read or written with `page.evaluate` on the Bandcamp page, or in `chrome.storage.sync` — **BC-4**.
8. A request escaping to the real network, or the routing widened to silence a report — **DATA-4, BC-1**.
9. A popup change checked only by the control's state, not in storage and after reload — **EXT-9, SYNC-9**.
10. Expected labels or values computed with the code under test — **AST-7, UNIT-2**.
11. `waitForTimeout` "for the audio" or "for the save" — **SYNC-1**.
12. State shared between tests (one context, storage not reset; module-level fake storage) — **DATA-3, SCN-7, UNIT-3**.
13. Unit tests depending on the machine's platform or the current time — **UNIT-7, AST-9/10**.
14. Snapshots with fan data or a weakened capture script — **PR-7, BC-6, DATA-6**.

## Tool messages → rules

`eslint-plugin-playwright` (`flat/recommended` plus errors for the rules rated Critical or Major here: `no-wait-for-timeout`, `no-page-pause`, `no-focused-test`, `no-conditional-expect`, `no-conditional-in-test`, `no-element-handle`, `no-eval`, `no-force-option`, `no-wait-for-selector`, `no-wait-for-navigation`, `no-networkidle`, `no-skipped-test` (conditional skips allowed), `prefer-to-have-count`, `prefer-web-first-assertions`; `no-nth-methods`, `require-to-pass-timeout` and `no-commented-out-tests` stay warnings) and the type-aware `@typescript-eslint/no-floating-promises` run on `tests/**` in `npm run lint`; check `eslint.config.mjs` for the current set. Map each message on a changed line to the skill rule, verify it like any other finding, and cite the rule ID, not the lint rule name. Rules set to `warn` are hints: check the documented exceptions.

| Lint rule                                                                                                                                     | Skill rule      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `@typescript-eslint/no-floating-promises`, `missing-playwright-await`                                                                         | SYNC-3          |
| `no-wait-for-timeout`                                                                                                                         | SYNC-1          |
| `no-networkidle`                                                                                                                              | SYNC-2          |
| `no-wait-for-selector`, `no-wait-for-navigation`                                                                                              | SYNC-16         |
| `no-force-option`, `no-nth-methods`                                                                                                           | SYNC-10, DATA-9 |
| `no-element-handle`, `no-eval`, `prefer-locator`, `no-unsafe-references`, `no-page-pause`, `no-focused-test`, `valid-describe-callback`       | STY-4           |
| `prefer-web-first-assertions`, `prefer-to-have-count`                                                                                         | AST-12          |
| `no-unused-locators`, `no-unnecessary-assertions`, `valid-expect`, `valid-expect-in-promise`, `no-conditional-expect`, `no-standalone-expect` | AST-7           |
| `require-to-pass-timeout`                                                                                                                     | SYNC-7          |
| `no-commented-out-tests`, `no-skipped-test`, `require-annotation-reason`                                                                      | SCN-6           |
| `no-duplicate-slow`                                                                                                                           | SYNC-14         |
| `no-export`                                                                                                                                   | STY-6           |
| `no-conditional-in-test`                                                                                                                      | SCN-8           |
| `expect-expect`                                                                                                                               | AST-1           |

The plugin catches narrow shapes only: `missing-playwright-await` misses calls on fixture helpers (`no-floating-promises` covers them), and most AST-7, EXT, BC and SYNC rules stay a manual job.
