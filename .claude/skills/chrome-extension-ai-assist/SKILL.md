---
name: chrome-extension-ai-assist
description: Use when using AI assistants (Claude Code, Cursor, Copilot, etc.) to change this MV3 Chrome extension—verify manifests, APIs, messaging, and build output; pair with Google's official AI guide.
---

# Chrome extension + AI assistants (Bandcamp Play)

## Official baseline

Always treat this as authoritative for how Chrome describes AI-assisted extension development:

- **https://developer.chrome.com/docs/extensions/ai/build_with_ai**

Do **not** treat model output as a specification of `chrome.*` APIs.

## Repo-specific checklist

1. Read root **[AGENTS.md](../../../AGENTS.md)** (entrypoints and constraints).
2. After **`public/manifest.json`** edits — cross-check [Manifest reference](https://developer.chrome.com/docs/extensions/reference/manifest) and [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions).
3. Run **`npm run build`** and load **`dist/`** unpacked when behavior is non-trivial.
4. Messaging edits must align with **`MessageCode`**, **`src/shared/models/messages/`**, and **`messages-background-service.ts`** ([messaging-conventions.md](../../rules/messaging-conventions.md)).
5. Prefer mirrored docs loaded via the **[chrome-extension-docs](../chrome-extension-docs/SKILL.md)** skill instead of guessing API shapes.

## What to avoid

- Hashed output filenames without manifest + webpack alignment ([chrome-extension-architecture.md](../../rules/chrome-extension-architecture.md)).
- Ad hoc string-only message protocols outside shared enums/models.
- Any pattern that violates MV3 rules on packaged, locally executed extension code.
