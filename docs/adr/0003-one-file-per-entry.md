# 0003. Build every entry as one file with a fixed name

- Status: Accepted
- Date: 2026-10-23 (commit `00f358f`)

## Context

The manifests and the HTML pages name their scripts directly (`background.js`, `content.js`, `options.js`, `downloads.js`). The packaging script (`zip.sh`) copies a fixed list of files. A build that splits code into shared chunks, or adds a content hash to the names, would need a loader and new names in every one of these places.

## Decision

- webpack builds four entries, and each one is a single self-contained file named `[name].js`. The settings are `splitChunks: false` and `runtimeChunk: false`.
- File names have no hashes. The manifests and `zip.sh` reference the names directly.
- Shared code is duplicated into each entry that uses it. That is the price of one file per entry.

## Consequences

- The entry files are larger, because a shared helper is in each file that imports it.
- A new file that the extension loads (an asset, a page, a script) must be added to `include_files` in `zip.sh`, or the package misses it. The rule [docs-and-ci.md](../../.claude/rules/docs-and-ci.md) says the same.
