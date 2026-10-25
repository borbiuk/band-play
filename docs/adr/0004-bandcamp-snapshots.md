# 0004. Test on saved Bandcamp pages and check the live markup daily

- Status: Accepted
- Date: 2026-10-23 (commits `395ac64` and `845709f`)

## Context

The end-to-end tests must run without network access and without a Bandcamp account. Bandcamp changes its markup without notice, and the extension reads that markup to find the play buttons, the items and the links. A test on a live page would be slow and would depend on the account and on the page content.

## Decision

- The e2e tests load the built extension in Chromium on saved pages in `tests/e2e/fixtures/pages/`. Every other request is blocked, and the scripts of the saved pages are removed, so the page does not change during a test.
- `npm run test:snapshots` captures the pages again. It removes the fan data, and it fails when a page lacks the markup the tests need.
- The workflow `markup.yml` runs every day. It captures the pages, commits changed snapshots to `master` as `github-actions[bot]`, runs the e2e tests and the live smoke tests on bandcamp.com, and opens one `markup-drift` issue on failure.
- The snapshot commit goes to `master` even when the tests then fail, so the failure stays visible in CI.

## Consequences

- `master` can stay red until the selectors in `src/content` and the tests are fixed. This is intended.
- A push made with the workflow token does not start `build.yml`. That is why `markup.yml` runs the tests itself.
- Branch protection on `master` must let the bot push, or the daily snapshot commit fails.
