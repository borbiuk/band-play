# 0006. Publish the test report and the e2e feature coverage from master

- Status: Accepted
- Date: 2026-10-26

## Context

The e2e suite grows, and the pass count alone does not say which features of the extension have a test. We also want to see how the results and the coverage change over time. Pull requests only need to know that the tests do not fail.

## Decision

- Every e2e test carries `feature(...)` labels. The features are listed in `tests/coverage-map.json`; a feature that the Chromium suite cannot test has a `skip` reason. An e2e test without a label fails.
- The Allure reporter runs only when `BAND_PLAY_ALLURE` is set (`npm run test:allure`). Allure 3 (`allure` and `allure-playwright`) needs no Java and keeps the run history in one JSON Lines file.
- `scripts/feature-coverage.mjs` counts the features of the map that have passing e2e tests, writes a Markdown table and a static page, and keeps its own history for the trend. It fails on labelling mistakes, not on low coverage.
- `report.yml` runs on pushes to `master` only. It publishes the Allure report, the coverage page and both histories to GitHub Pages with the official Pages actions. The history is fetched from the published site before the next run, so no branch, cache or write token is needed.
- Pull requests keep running the tests in `build.yml` and publish nothing.

## Consequences

- The trend has one point per `master` run. The first run starts with an empty history.
- `master` turns red when the tests fail, although the report is published.
- A new feature needs an entry in the map and a labelled test, or it shows as "No tests".
- `allure` depends on a vulnerable `dompurify` version, so `package.json` pins it with an `overrides` entry. Remove the entry when Allure ships a fixed version.
- A push made with the workflow token (the snapshot commit of `markup.yml`) does not start `report.yml`.
- The Pages source must be "GitHub Actions", and the `github-pages` environment allows deploys from `master` only.
