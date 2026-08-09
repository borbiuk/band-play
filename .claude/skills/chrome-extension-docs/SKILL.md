---
name: chrome-extension-docs
description: Use when implementing or debugging Chrome Extension APIs (downloads, storage, messaging, manifest, permissions, etc.). Provides access to local offline Chrome extension documentation.
---

# Chrome Extension API — local docs

Use this skill when the task involves Chrome extension APIs, manifest, permissions, or MV3 behavior. Do **not** load all doc files: read only the specific API or topic files relevant to the current task.

## When to use

- Implementing or changing code that uses `chrome.*` APIs (e.g. `chrome.downloads`, `chrome.storage`, `chrome.runtime`).
- Editing `public/manifest.json` (permissions, background, manifest keys).
- Debugging extension behavior, content scripts, or messaging.
- Checking API types, permissions, or official examples.

## Where the docs are

Local offline copies of Chrome extension docs (developer.chrome.com) live next to this file at:

**`references/developer.chrome.com/docs/extensions/`**

A full file index is in **`references/index.md`**. Path structure mirrors the site, for example:

- API reference: `reference/api/<apiName>.md` (e.g. `reference/api/downloads.md`, `reference/api/storage.md`).
- Manifest: `reference/manifest/<key>.md` (e.g. `reference/manifest/background.md`, `reference/manifest/web-accessible-resources.md`).
- Concepts: `develop/concepts/<topic>.md` (e.g. `develop/concepts/content-scripts.md`, `develop/concepts/storage-and-cookies.md`).
- How-to: `how-to/...`, `reference/permissions.md`, `messaging.md`, etc.

## Instructions

1. **Identify the relevant doc**: From the task, determine which API or topic is needed (e.g. downloads → `reference/api/downloads.md`).
2. **Read only that file (or a small set)**: Use the `Read` tool to open the specific `.md` file under `references/developer.chrome.com/docs/extensions/`. Do not read the whole directory or many files at once.
3. **Prefer local docs over web search**: When the doc exists locally, use it instead of searching the web to avoid wrong or outdated snippets.
4. **Keep architecture rules in mind**: Project-specific rules (entry points, manifest constraints, `@shared/*`) live in `.claude/rules/` and `AGENTS.md`; this skill is only for Chrome API/manifest reference.

## Quick path reference

| Topic                       | Path (under `references/developer.chrome.com/docs/extensions/`)                      |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Downloads API               | `reference/api/downloads.md`                                                         |
| Storage API                 | `reference/api/storage.md`, `reference/api/storage/StorageArea.md`                   |
| Runtime / messaging         | `reference/api/runtime.md`, `messaging.md`                                           |
| Manifest (background, etc.) | `reference/manifest/background.md`, `reference/manifest/web-accessible-resources.md` |
| Permissions                 | `reference/permissions.md`                                                           |
| Content scripts             | `develop/concepts/content-scripts.md`                                                |

When in doubt, check `references/index.md` or search under `references/` to find the right file by name (e.g. `downloads.md`, `storage.md`).
