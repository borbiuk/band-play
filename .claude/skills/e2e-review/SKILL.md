---
name: e2e-review
description: Reviews Playwright test changes of Band Play (unit tests of src/, e2e tests with the built extension in Chromium on Bandcamp snapshots, the live smoke suite, playwright.config.ts, test fixtures, page snapshots and the capture script, test steps in CI) against the project test standard in references/rules.md, and reports verified Critical, Major and Minor findings with concrete fixes in chat. Use when the user asks to review or re-review the tests or e2e specs ("review the tests", "review e2e", "перевір тести", "переглянь e2e"), or shares a GitHub pull request link or number that touches tests/. Read-only; it never edits files, commits or comments on GitHub.
argument-hint: '[base-ref | PR number]'
allowed-tools: Bash(git status --short) Bash(git diff *) Bash(git log *) Bash(git show *) Bash(git rev-parse *) Bash(npm run lint) Bash(npm run typecheck) Bash(npm run build) Bash(npx --no playwright test *)
---

# Test review (Band Play)

Reviews one change to the Playwright test suite against the standard in [references/rules.md](references/rules.md) and reports verified, severity-ranked findings in chat. Band Play is a browser extension with no backend of its own, tested in Chromium against Bandcamp page snapshots with a silent test audio.

- Writing, running and debugging tests: the [playwright skill](../playwright/SKILL.md); test conventions: [testing.md](../../rules/testing.md).
- The read-only [e2e-reviewer](../../agents/e2e-reviewer.md) agent runs this skill in a separate context.
- Changes under `src/`: the read-only [code-reviewer](../../agents/code-reviewer.md) agent, not this skill.
- The suite lives in `playwright.config.ts`, `tests/unit/**`, `tests/helpers/**`, `tests/setup/**` (the `dist` project that builds `dist/`), `tests/e2e/**` (including `seed.spec.ts` for the Playwright test agents) and `tests/live/**`. CI test steps: `npm run test:unit` in job `build` and job `e2e` in `.github/workflows/build.yml`, plus `.github/workflows/markup.yml` (daily snapshot refresh, e2e and live; it commits snapshots to `master` and opens a `markup-drift` issue on failure).
- GitHub: the repository is `borbiuk/band-play`; run `gh` as `GH_TOKEN=$(gh auth token --user borbiuk) gh … -R borbiuk/band-play`, never `gh auth switch`.

## Hard rules

1. **Read-only.** Never edit, create or delete files; never stage, commit, push, fetch, check out or stash; never comment, review or approve on GitHub. The deliverable is the chat report. If asked to post or fix, say this skill only reviews: the user or the main session applies fixes.
2. **Review the change, not the suite.** Findings target lines the change adds or modifies, plus existing code the change makes wrong. A problem in untouched code is at most one "FYI (pre-existing)" line.
3. **Every finding is verified** against the full file, and by `Grep` when you claim something is missing, unused or duplicated. Drop what you cannot prove; never write "please verify that…".
4. **One problem = one finding.** The same rule with the same fix in several places is one finding, anchored at the first occurrence, listing the others. A different rule or a different fix is its own finding.
5. **Budget: at most 8–10 standalone findings**: every Critical and Major, plus Minor findings that repeat widely or touch the fixture architecture. Other Minor findings go into one grouped list. More than 10 Critical and Major findings → all of them are standalone anyway.
6. **No nits.** Formatting is Prettier's job.
7. **Language:** findings in English; the chat framing in the user's language.
8. **Code from the change runs only with care.** Lint, type check, `--list` and test runs execute the change's code (config, fixtures, specs at collection time). Run them only on the local working tree, and for a pull request only when the user has checked it out. For a pull request from a fork or an unfamiliar author, first read the diffs of `package.json`, `package-lock.json`, `.npmrc`, `playwright.config.ts`, `eslint.config.mjs`, `tsconfig*.json`, the fixtures and `capture-pages.mjs`; run nothing if they add lifecycle scripts, registries, git or tarball URLs, or code that runs at load, and say why in the header. Never `npm install`; run Playwright only as `npx --no playwright …`, so npx never downloads a package. Never run the `live` project or `npm run test:snapshots` (both use the network) unless the user asks.

## Workflow

Copy this checklist into the response and check it off:

```
Review progress:
- [ ] 1. Resolve the change
- [ ] 2. Scope gate
- [ ] 3. Read the change and the feature under test
- [ ] 4. Static checks
- [ ] 5. Run the changed tests (optional)
- [ ] 6. Review pass
- [ ] 7. Verify every finding
- [ ] 8. Re-review mode (only for a re-review)
- [ ] 9. Report in chat
```

### 1. Resolve the change

- **No argument (local change):** `git status --short`, `git log --oneline origin/master..HEAD`, `git diff origin/master...HEAD` (commits) and `git diff HEAD` (uncommitted). Read untracked files from the status list directly. Do not fetch: say in the header that the base is the local `origin/master`.
- **A base ref:** the same with that ref instead of `origin/master`.
- **A pull request (number or URL):** `GH_TOKEN=$(gh auth token --user borbiuk) gh pr view <n> -R borbiuk/band-play --json number,title,body,author,isCrossRepository,headRefName,headRefOid,baseRefName,files,commits,reviews` and `… gh pr diff <n> -R borbiuk/band-play`; `… gh pr view <n> -R borbiuk/band-play --comments` for earlier review notes. If `git rev-parse HEAD` equals `headRefOid`, the PR is checked out: read files from the working tree. Otherwise try `git show <headRefOid>:<path>`; if the commit is not local, review from the diff, say "files not read in full; static checks skipped" in the header, and suggest the user check out the PR for a full review.

### 2. Scope gate

- `tests/unit/**`: core rules + UNIT.
- `tests/e2e/**` (specs, `seed.spec.ts`, `fixtures/extension.ts`, `fixtures/bandcamp.ts`): core rules + EXT + BC.
- `tests/e2e/fixtures/pages/*` and `fixtures/capture-pages.mjs`: BC-1, BC-6, PR-3, PR-7, DATA-6.
- `tests/live/**`: core rules + EXT-10 + BC-2 (no added audio in `live`).
- `tests/setup/**` and `playwright.config.ts`: PR-3, SYNC-14, EXT-7.
- `.github/workflows/*`: only the test steps and test workflows (PR-3, DATA-4, EXT-10).
- `package.json`, `package-lock.json`, `eslint.config.mjs`, `tsconfig*.json`: only the test parts (scripts, Playwright and lint versions, test lint and type config).
- `src/**`: out of scope; read it as the feature under test (§3).
- Anything else: out of scope; list it, do not review it (PR-7 still applies to every file).

Core rules are SCN, AST, DATA, SYNC, MIG, STY and PR. No file in scope → stop with "not a test change". A mixed change → review only the test part and say so.

### 3. Read the change and the feature under test

- Read every changed test file **in full**: title/assertion mismatches, vacuous assertions and missing controls are invisible in hunks. Read the fixtures each changed spec imports.
- **Snapshots** (`fixtures/pages/*.html`): do not read them whole. `Grep` for what the spec relies on (`playbutton`, `nextbutton`, `prevbutton`, `play-col`, `track_info`, track titles) and for personal data (PR-7: `fan_id`, `collectors-data`, `collected-by`, emails, a country code in `ip_location_country_code`, signed-in markers).
- **Feature under test**: build a short fact sheet, only for what the change touches:
    - Keyboard shortcuts: `src/content/services/user-input-service.ts` (capture-phase `keydown`, typing detection, full-match `preventDefault`, repeat), `src/content/shortcut/*`, `src/shared/utils/shortcut.utils.ts`, the shortcut table in `README.md`.
    - Page services and playback: `src/content/services/page-service-worker.ts`, `src/content/page-services/bandcamp/*` (album and track share `album-page-service.ts`), [bandcamp-dom.md](../../rules/bandcamp-dom.md).
    - Readiness marker: `src/content/content.ts`.
    - Settings and storage: `src/shared/services/config-service.ts`, `src/shared/models/config-model.ts`.
    - Popup: [popup.md](../../rules/popup.md); `src/options/components/*`, `src/shared/components/batch-download.tsx`.
    - Batch download, downloads page: [batch-download.md](../../rules/batch-download.md); `src/background/batch-download/*`, `src/downloads/*`, the messaging rule [messaging.md](../../rules/messaging.md).
    - Unit tests: the module under test.
- **Test basis:** the rule docs above, the feature list and shortcut table in `README.md`, and what the PR description claims. A behaviour the change claims to cover but does not is a finding under the rule the gap breaks; an uncovered behaviour that is not claimed is FYI.
- **Intermediate commits** (when the commits are local): `git log --no-merges --diff-filter=AD --name-status <base>..HEAD` and `git log --no-merges --format='%h %s' --name-only -G'([Tt]oken|[Ss]ecret|[Pp]assw|[Cc]ookie|storageState|fan_id|@[A-Za-z0-9-]+\.[a-z]{2,})' <base>..HEAD`. Inspect hits with `git show <commit> -- <path>` for PR-7 and DATA-6; report the commit and path only, never the value.

### 4. Static checks

Run them for a local change, or a checked-out PR, unless hard rule 8 says no:

| Command                           | Proves                                                                                                                            | Feeds                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `npm run lint`                    | ESLint over the whole repository (`eslint .`), then the TypeScript 7 type check of `src/` and of `tests/` (`tests/tsconfig.json`) | rule map in rules.md, STY-2 |
| `npx --no playwright test --list` | every project loads: no spec importing a spec, no duplicate titles, no import errors                                              | STY-6, STY-4                |

- `tests/tsconfig.json` includes `tests/**/*.ts` and `playwright.config.ts`. If a change moves tests out of `tests/**` or drops that config, say "type check does not cover tests" in the header. `capture-pages.mjs` is linted but not type-checked.
- ESLint exits 0 on warnings: read the output. Keep only messages on changed lines and map them with the table in [rules.md](references/rules.md#tool-messages--rules).
- Read the `@playwright/test` and `eslint-plugin-playwright` versions in `package.json` before suggesting an API or citing a lint rule.
- A check failing on the change's own code is a Major finding (the suite does not compile or load); on untouched code, FYI. A check that cannot run → say so and review that area by hand.

### 5. Run the changed tests (optional)

When the user asks, or for a small local change: `npx --no playwright test <changed spec files>` with `--project=unit` or `--project=e2e` (the `dist` project builds `dist/` first; the bundled Chromium must be installed), and `--repeat-each=3` for a flaky-test fix. It writes only build output and Playwright's report folders. Never `--project=live` (it exists only with `BAND_PLAY_LIVE`) unless asked. A failure on the change's code is evidence for a finding under the rule its cause breaks; a pass never clears a vacuous assertion.

### 6. Review pass, highest yield first

0. Static check output (§4): read it before the manual pass.
1. **Scenario design** ([SCN](references/rules.md#scn--scenario-design)).
2. **Assertion depth** ([AST](references/rules.md#ast--assertion-depth)) with EXT-5 and BC-5: exact media values, starting values, absence proofs.
3. **Data and isolation** ([DATA](references/rules.md#data--settings-fixtures-and-isolation)) with BC-4.
4. **Sync** ([SYNC](references/rules.md#sync--synchronization-and-flakiness)) with BC-2, BC-3, EXT-3 and EXT-6: readiness, the audio element, keyboard, in-page navigation.
5. **Routing and snapshots** ([BC-1, BC-6](references/rules.md#bc--bandcamp-pages-audio-and-storage)), PR-7.
6. **Locators** (EXT-4, SYNC-10, SYNC-11).
7. **Unit specifics** ([UNIT](references/rules.md#unit--unit-tests)) for `tests/unit/**`; **build and scope** ([EXT-7 to EXT-10](references/rules.md#ext--browser-extension-specifics)) for config, fixtures and `live`.
8. **Migration parity** ([MIG](references/rules.md#mig--replacing-or-restructuring-tests)) when a spec is replaced or moved.
9. **Style** ([STY](references/rules.md#sty--code-style)) and **PR hygiene** ([PR](references/rules.md#pr--pull-request-hygiene)), including PR-7 across every commit.

For **every test** in a changed spec, answer the test card:

- What single behaviour does it prove? (Several unrelated → SCN-1.)
- **Could it still pass if the feature were broken?** Audio that never loaded, a negative check without `recordKeys` or a positive control, an expected value computed by the code under test, `toBeGreaterThan` on a time, `.first()` on repeated controls, a seed equal to the default (AST-7, EXT-5, BC-5).
- Does it open the page with `openBandcamp` and add the audio with `addPlayerAudio` before the first playback key (BC-2, BC-3)?
- Is every precondition arranged through `storage.set`, before `openBandcamp`, in the stored shape (DATA-1/2, BC-4)?
- Is every request routed, and would an unexpected one fail the test (DATA-4, BC-1)?
- Does it use real key events with explicit focus (EXT-3)?
- For the popup: does it wait for the loaded state, then prove the change in storage and after reload (SYNC-6, SYNC-9, EXT-9)?
- After closing a dialog or overlay, is it hidden before the next step (SYNC-8)?
- Does every step title match what the step asserts (SCN-4)?
- Would it pass with other tests running in parallel: own context, own output path (DATA-3/7)?
- Unit: one test per case, a fresh fake storage, injected time and pinned platform (UNIT-1/3/7)?

### 7. Verify

Re-read the full file, confirm exact line numbers, grep for claimed-missing symbols, and drop anything unproven. Typical false positives here:

- Flagging `context.route` on bandcamp.com or the silent WAV as "mocking the app": it is the third-party environment (SYNC-17).
- Flagging `addPlayerAudio` as a stub of the extension: it stands in for Bandcamp's player (BC-2).
- Asking for Firefox coverage: impossible with Playwright; check only that the limit is stated (EXT-8).
- Asking for e2e coverage of signed-in pages (feed, collection, purchases): they have no safe snapshot; check only that the limit is stated (DATA-6).
- Asking for a second readiness wait after `openBandcamp`, or flagging the plain `expect` on a value read once after `recordKeys` proved the event was processed (AST-12 exception).
- Flagging `page.evaluate` used for storage on the extension page, for the audio state or for the key recorder (that is the intended mechanism).
- Suggesting an API newer than the installed Playwright version.

### 8. Re-review mode

Triggered when the user says "re-review" or this conversation already holds an earlier review of the same change.

- Resolve the change again (§1) and re-run the static checks. Re-read in full every file the earlier findings point to and every file changed since.
- For each earlier finding: **fixed** (one line of evidence, listed under "Verified as fixed"), **partially fixed** (a PR-5 finding at the original severity: what is done, then exactly what is still missing), **not fixed** (listed under "Still open", not repeated as new), or **declined** (the author's reason, and whether it holds; a new finding only if the original was Critical or Major and the reason does not hold).
- A new problem introduced by the fix is a new finding.
- For a pull request, also check open review comments from `gh pr view <n> --comments` the same way.

### 9. Report in chat

```markdown
## Test review: <local change on <branch> | PR #<n>: <title>>

**Scope:** unit | e2e | live | config · **Base:** <ref> · **Files:** <n> reviewed, <m> out of scope
**Findings:** <n> Critical · <n> Major · <n> Minor
**Checks:** lint ok · type check ok (tests not covered) · list ok, <n> tests (Playwright <version>) · run: e2e 6 passed (or what was skipped and why)
**Coverage:** Chromium only; Firefox not covered by Playwright
**Verdict:** changes needed | ready, with suggestions | ready

### Summary

<1–2 sentences: overall quality and the single most important fix>

### Fix first

1. Finding 1 · Critical · EXT-5: "Control+ArrowRight does nothing" checked right after the key press
2. Finding 2 · Major · BC-3: Space pressed after a bare `page.goto()`

### Findings

**1 · Critical · EXT-5** — `tests/e2e/album-shortcuts.spec.ts:88`

`currentTime` is asserted to be 0 right after `keyboard.press('Control+ArrowRight')`, so the check passes before the content script could react. Start `recordKeys` after `openBandcamp`, poll until the reader shows both keys with `defaultPrevented: false`, then assert `currentTime` is still close to 0.

**2 · Major · BC-3** — `tests/e2e/settings-on-page.spec.ts:41` (also lines 63, 97)

…

### Minor

**Titles**

- `tests/e2e/album-shortcuts.spec.ts:12` — SCN-4: the title says "resets the speed" but the test never presses Shift+ArrowDown; rename it or add the step.

**Waits**

- `tests/e2e/popup-settings.spec.ts:30` — SYNC-5: `waitForURL` before an element assertion is redundant; drop it.

### Verified as fixed ← re-review only

### Still open ← re-review only

### FYI (pre-existing or out of scope)

- …
```

- Numbered findings, ordered Critical → Major → Minor, then by file and line. Header line: `**<n> · <Severity> · <RULE-ID>** — <repo-relative path>:<line or range>`, plus "(also lines …)" for a repeated finding, or "change-level" when there is no single anchor.
- Text: one paragraph, at most three sentences: the problem, then the concrete fix; a short code snippet only when it is the fix. No praise, no restating the diff.
- **Fix first:** at most 8 lines: every Critical and the most important Major.
- **Minor:** grouped by topic, each item `` `path:line` — RULE-ID: problem; fix. ``. Omit the section when empty.
- Wrap identifiers, selectors and snippets in backticks. Never quote a secret or personal data (PR-7).
- A clean change → one line saying so, verdict "ready", and the checks line.
