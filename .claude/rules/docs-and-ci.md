---
paths:
    - 'README.md'
    - 'LISTING.md'
    - 'RELEASE_NOTES.md'
    - '.github/**'
    - 'scripts/tag-releases.sh'
    - '.husky/**'
    - 'zip.sh'
---

# Docs, CI and releases

> Conventions for the user-facing docs, GitHub automation, the git hooks, packaging and release tagging.

## Docs

- Describe the code as it is: read `package.json`, `public/manifest*.json`, `src/**` and `webpack/**` before writing about them. Every command, script name, path, shortcut, setting and manifest value must match the code.
- `README.md`: features, keyboard shortcuts with their defaults (`configService.defaultShortcuts()`), supported pages, development setup (Chrome Load unpacked `dist/`, Firefox `about:debugging` with `dist-firefox/manifest.json`), npm scripts, tests, file structure.
- `LISTING.md`: store text. Privacy: no analytics and no data collection; settings, visited history and download state stay in the browser (`chrome.storage.local`); the only requests go to Bandcamp (download pages and files for batch download). Explain every permission (`storage`, `downloads`, `alarms`, the Chrome-only `power`, `downloads.shelf`, `downloads.ui`, and the Bandcamp host access).
- A user-visible change (shortcut, setting, page, permission) goes into `README.md`, `LISTING.md` and `RELEASE_NOTES.md` together.
- `RELEASE_NOTES.md`: one `## x.y.z` heading per release, newest first. `scripts/tag-releases.sh` reads that heading pattern, so do not use it for anything else.

## CI

- [build.yml](../../.github/workflows/build.yml) (workflow `build`) runs on pushes and pull requests to `master`. Job `build` (Node 22.x, 24.x and 26.x, 15-minute timeout): `npm ci`, `npm audit signatures`, `check:versions`, `format:check`, `build`, `build:firefox`, `lint`, `lint:firefox`, `test:unit`. Job `e2e` (Node 24.x, 15-minute timeout): `npm ci`, `npx --no playwright install --with-deps chromium`, `npm run test:e2e`; on failure it uploads `playwright-report/` and `test-results/` as the artifact `playwright-report-e2e` (14 days). `concurrency` group `build-<ref>` cancels an older run of the same ref; checkout uses `persist-credentials: false`. Do not add `check:outdated`.
- [markup.yml](../../.github/workflows/markup.yml) (workflow `bandcamp-markup`) runs daily at 05:17 UTC (cron `17 5 * * *`, not at minute 0) and on `workflow_dispatch`, never on push or pull request. Permissions `contents: write` and `issues: write`; `concurrency` group `bandcamp-markup`; job timeout 40 minutes. Steps: `npm ci`, Playwright Chromium, `npm run test:snapshots`; if `tests/e2e/fixtures/pages` changed, commit "Refresh Bandcamp page snapshots" as `github-actions[bot]` (Husky off with `HUSKY=0`), `git pull --rebase` and push to `master`; then `npm run test:e2e` and `npm run test:live` (also when e2e failed; with `PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report-live` and `--output=test-results-live`). On any failure it uploads `playwright-report-markup` (14 days) and opens one issue labelled `markup-drift` ("Tests fail on the current Bandcamp markup") or comments on the open one. Close the issue after fixing the selectors.
- **By design**, snapshots that make tests fail land on `master`: push CI stays red until the selectors in `src/content` and the tests are fixed ([bandcamp-dom.md](bandcamp-dom.md), [testing.md](testing.md)). A push with the workflow token does not trigger `build.yml`, which is why `markup.yml` runs the tests itself.
- [publish-chrome.yml](../../.github/workflows/publish-chrome.yml) and [publish-firefox.yml](../../.github/workflows/publish-firefox.yml): `workflow_dispatch` only, the job runs only on `refs/heads/master`, environment `store` (set required reviewers in the repository settings), 20-minute timeout, own `concurrency` group. Steps: `npm ci`, `npm audit signatures`, `lint`, `test:unit`, a check that both manifest versions match, `npm run zip`, then:
    - Chrome: `chrome.zip` (artifact `chrome-package`) → `npx --no chrome-webstore-upload` with the secrets `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN` and `CHROME_PUBLISHER_ID` (`chrome-webstore-upload-cli` 4 uses the Chrome Web Store API v2; v1.1 stopped on 15 October 2026);
    - Firefox: `firefox.zip` and `source.zip` (`git archive HEAD`; artifact `firefox-package`) → unzip → `npx --no web-ext sign --channel listed --upload-source-code source.zip --approval-timeout 0` with the secrets `AMO_JWT_ISSUER` (`WEB_EXT_API_KEY`) and `AMO_JWT_SECRET` (`WEB_EXT_API_SECRET`).
- [dependabot.yml](../../.github/dependabot.yml): weekly `npm` and `github-actions` updates, 7-day cooldown, no major updates of `typescript`, groups `dev-tooling` and `runtime`.
- **Pinned actions**: every `uses:` is a full commit SHA with the tag in a comment (`actions/checkout@<sha> # v7.0.1`). Workflows use least-privilege `permissions` (`contents: read`; `markup.yml` adds only what it needs) and reference only existing npm scripts. The Playwright browser is installed with `npx --no playwright install`, so it matches the installed `@playwright/test`.
- Other GitHub files: `FUNDING.yml`, `ISSUE_TEMPLATE/bug_report.md`, `ISSUE_TEMPLATE/feature_request.md`, `pull_request_template.md`.

## Git hooks and packaging

- `.husky/pre-commit` (`set -e`): `. set-version.sh` → `npm run format` → `git add -u` → `./zip.sh`. Because of `git add -u`, every modified tracked file is committed (no partial commits); new files are not added automatically.
- `.husky/set-version.sh`: reads `version` from `public/manifest.json` with `jq`, stops unless it is `x.y.z`, writes it into `package.json` and `public/manifest.firefox.json` (through a `.tmp` file) and re-formats both with Prettier.
- `zip.sh` (`set -euo pipefail`): for Chrome (`dist`, `npm run build`) and Firefox (`dist-firefox`, `npm run build:firefox`) it deletes the build directory, rebuilds, copies the files of `include_files` into a temporary folder and zips them with the files at the archive root: `band-play-build-<browser>_<dd-mm-YYYY_HH:MM:SS>_<version>.zip`. A new file the extension loads (asset, page, script) must be added to `include_files`. Zips and `band-play-build*` are gitignored.

## Releases

- `scripts/tag-releases.sh` reads the `## x.y.z` headings of `RELEASE_NOTES.md`, finds for each version the first commit (oldest first) whose `public/manifest.json` has it, and creates annotated tags locally only (`TAG_PREFIX` optional; existing tags are skipped). Test it with `DRY_RUN=1` only.
- The whole release flow is the `/release` skill (`.claude/skills/release/SKILL.md`); update it when this process changes.
