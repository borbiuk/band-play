---
paths:
    - 'README.md'
    - 'LISTING.md'
    - 'PRIVACY.md'
    - 'RELEASE_NOTES.md'
    - 'docs/**'
    - '.github/**'
    - 'scripts/**'
    - '.husky/**'
    - 'zip.sh'
    - 'knip.jsonc'
    - '.markdownlint-cli2.jsonc'
---

# Docs, CI and releases

> Conventions for the user-facing docs, GitHub automation, the git hooks, packaging and release tagging.

## Docs

- Describe the code as it is: read `package.json`, `public/manifest*.json`, `src/**` and `webpack/**` before writing about them. Every command, script name, path, shortcut, setting and manifest value must match the code.
- `README.md`: a short front page (value, install, privacy, links). The reference is in `docs/usage.md` (features, keyboard shortcuts with their defaults from `configService.defaultShortcuts()`, supported pages, popup, Firefox differences) and `docs/development.md` (setup with Chrome `dist/` and Firefox `dist-firefox/manifest.json`, npm scripts, tests, CI, releases, file structure). Decisions: `docs/adr/`. Contributor rules: `.github/CONTRIBUTING.md`.
- `LISTING.md`: store text. Privacy: no analytics and no data collection; settings, visited history and download state stay in the browser (`chrome.storage.local`); the only requests go to Bandcamp (download pages and files for batch download). Explain every permission (`storage`, `downloads`, `alarms`, the Chrome-only `power`, `downloads.shelf`, `downloads.ui`, and the Bandcamp host access).
- A user-visible change (shortcut, setting, page, permission) goes into `docs/usage.md`, `LISTING.md`, `PRIVACY.md` (when data handling changes) and `RELEASE_NOTES.md` together. `docs/usage.md` is the place for the shortcut table.
- `RELEASE_NOTES.md`: one `## x.y.z` heading per release, newest first. `scripts/tag-releases.sh` and `scripts/check-docs.mjs` read that heading pattern, so do not use it for anything else. A comment at the top of the file states the rules.

## CI

- [build.yml](../../.github/workflows/build.yml) (workflow `build`) runs on pushes and pull requests to `master`. Job `build` (Node 24.x and 26.x, 15-minute timeout): `npm ci`, `npm audit signatures`, `check:versions`, `format:check`, `build`, `build:firefox`, `lint`, `lint:firefox`, `test:unit`. Job `checks` (Node 24.x, 10-minute timeout): `npm ci`, `npm audit signatures`, `lint:docs` (markdownlint and `scripts/check-docs.mjs`) and `lint:unused` (knip, `knip.jsonc`). Job `e2e` (Node 24.x, 15-minute timeout): `npm ci`, `npx --no playwright install --with-deps chromium`, `npm run test:e2e`; on failure it uploads `playwright-report/` and `test-results/` as the artifact `playwright-report-e2e` (14 days). `concurrency` group `build-<ref>` cancels an older run of the same ref; checkout uses `persist-credentials: false`. Do not add `check:outdated`.
- [markup.yml](../../.github/workflows/markup.yml) (workflow `bandcamp-markup`) runs daily at 05:17 UTC (cron `17 5 * * *`, not at minute 0) and on `workflow_dispatch`, never on push or pull request. Permissions: the workflow default is `contents: read`; the job sets `contents: write` (the snapshot commit) and `issues: write` (the drift issue); `concurrency` group `bandcamp-markup`; job timeout 40 minutes. Steps: `npm ci`, Playwright Chromium, `npm run test:snapshots`; if `tests/e2e/fixtures/pages` changed, commit "Refresh Bandcamp page snapshots" as `github-actions[bot]` (Husky off with `HUSKY=0`), `git pull --rebase` and push to `master`; then `npm run test:e2e` and `npm run test:live` (also when e2e failed; with `PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report-live` and `--output=test-results-live`). On any failure it uploads `playwright-report-markup` (14 days) and opens one issue labelled `markup-drift` ("Tests fail on the current Bandcamp markup") or comments on the open one. A last step (`if: success()`) closes the open `markup-drift` issues after a passing run, so fix the selectors first.
- **By design**, snapshots that make tests fail land on `master`: push CI stays red until the selectors in `src/content` and the tests are fixed ([bandcamp-dom.md](bandcamp-dom.md), [testing.md](testing.md)). A push with the workflow token does not trigger `build.yml`, which is why `markup.yml` runs the tests itself.
- [codeql.yml](../../.github/workflows/codeql.yml): CodeQL for `javascript-typescript` and `actions` (`build-mode: none`), on pushes and pull requests to `master` and weekly; paths from `.github/codeql/codeql-config.yml`.
- [scorecard.yml](../../.github/workflows/scorecard.yml): OpenSSF Scorecard, in the official shape (`permissions: read-all` at the top). No badge until branch protection and reviews exist.
- [dependency-review.yml](../../.github/workflows/dependency-review.yml): pull requests only; fails on high vulnerabilities and on licenses outside its allow list (the licenses of `package-lock.json`).
- [pr-title.yml](../../.github/workflows/pr-title.yml): checks the pull request title with `scripts/check-pr-title.mjs`; the title reaches the script only through `env`.
- [release.yml](../../.github/workflows/release.yml): runs on a pushed version tag `x.y.z`; a manual run is a dry run unless `dry_run` is turned off. Guards: the versions match, the tag is on `master`, the build of that commit passed, the changelog has the version and no release exists. It builds and names the packages, checks their versions and uploads them. With the dry run off it attests them and creates the GitHub Release with `scripts/release-notes.sh`.
- [dependabot.yml](../../.github/dependabot.yml): weekly `npm` and `github-actions` updates, 7-day cooldown, no major updates of `typescript`, groups `dev-tooling` and `runtime`.
- **Pinned actions**: every `uses:` is a full commit SHA with the tag in a comment (`actions/checkout@<sha> # v7.0.1`). Workflows use least-privilege `permissions` (`contents: read` at the top; a job that needs more sets its own scopes) and reference only existing npm scripts. The Playwright browser is installed with `npx --no playwright install`, so it matches the installed `@playwright/test`.
- Other GitHub files: `FUNDING.yml`, `ISSUE_TEMPLATE/bug_report.md`, `ISSUE_TEMPLATE/feature_request.md`, `ISSUE_TEMPLATE/config.yml` (the chooser with the security and contributing links), `pull_request_template.md`, `CONTRIBUTING.md`, `SUPPORT.md`, `CODEOWNERS`, and `codeql/codeql-config.yml`.

## Git hooks and packaging

- `.husky/pre-commit` (`set -e`): `. set-version.sh` → `npm run format` → `git add -u` → `./zip.sh`. Because of `git add -u`, every modified tracked file is committed (no partial commits); new files are not added automatically.
- `.husky/set-version.sh`: reads `version` from `public/manifest.json` with `jq`, stops unless it is `x.y.z`, writes it into `package.json` and `public/manifest.firefox.json` (through a `.tmp` file) and re-formats both with Prettier.
- `zip.sh` (`set -euo pipefail`): for Chrome (`dist`, `npm run build`) and Firefox (`dist-firefox`, `npm run build:firefox`) it deletes the build directory, rebuilds, copies the files of `include_files` into a temporary folder and zips them with the files at the archive root: `artifacts/band-play-build-<browser>_<dd-mm-YYYY_HH:MM:SS>_<version>.zip`. A new file the extension loads (asset, page, script) must be added to `include_files`. The packages go to `artifacts/` (created on the fly, gitignored); the temporary folder comes from `mktemp -d`, outside the repository. Old `band-play-build*` folders may still be ignored by `.gitignore`.

## Releases

- `scripts/tag-releases.sh` reads the `## x.y.z` headings of `RELEASE_NOTES.md`, finds for each version the first commit (oldest first) whose `public/manifest.json` has it, and creates annotated tags locally only (`TAG_PREFIX` optional; existing tags are skipped). Test it with `DRY_RUN=1` only.
- `scripts/release-notes.sh <version> <ref>` prints the notes of a GitHub Release from the section of that version (`--title` prints the summary line). `release.yml` uses it.
- `release.yml` (see CI) runs on the pushed tag; the release flow itself is the `/release` skill (`.claude/skills/release/SKILL.md`). Update the skill when this process changes.
