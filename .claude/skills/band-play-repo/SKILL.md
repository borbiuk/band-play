---
name: band-play-repo
description: Bandcamp Play Chrome extension (MV3)—read AGENTS.md, respect architecture and messaging conventions before editing TypeScript or manifest.
---

# Bandcamp Play repo (Claude Code)

1. Read **[AGENTS.md](../../../AGENTS.md)** at the repository root for entrypoints, build commands, and MV3 boundaries.
2. Project skills live under `.claude/skills/`; use **`chrome-extension-ai-assist`**, **`chrome-extension-docs`**, or **`article-writing`** as the task implies. The **`technical-writer`** subagent (`.claude/agents/`) handles heavier documentation work.
3. Prefer official Chrome docs on **developer.chrome.com**; mirrored pages live under `.claude/skills/chrome-extension-docs/references/`.
4. Keep changes minimal unless the user explicitly asks for a broad refactor (see working rules in [CLAUDE.md](../../../CLAUDE.md)).
