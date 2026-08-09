# Claude Code — Bandcamp Play

Read **[AGENTS.md](AGENTS.md)** first. It lists entrypoints, MV3 constraints, messaging conventions, and build commands.

## Working rules

- Follow existing project conventions (code style, folder structure, naming, dependency management) unless explicitly instructed otherwise.
- Never refactor unless explicitly requested; apply only the changes directly required for the current request. Keep changes minimal, explicit, and localized.
- Always use a block `if-return` statement (avoid inline one-liners).
- All comments and documentation must be in English; answer in the same language as the question.
- Git safety: never run `commit`, `reset`, `rebase`, `push`, `pull --force`, `checkout --force`, `clean`, or `stash drop` unless the user explicitly asks; confirm before `git pull`, `git merge`, or `git stash`.

## Detailed rules (read on demand)

- Chrome extension architecture: [`.claude/rules/chrome-extension-architecture.md`](.claude/rules/chrome-extension-architecture.md)
- Messaging conventions: [`.claude/rules/messaging-conventions.md`](.claude/rules/messaging-conventions.md)
- Maintaining agent context: [`.claude/rules/maintaining-agent-context.md`](.claude/rules/maintaining-agent-context.md)

## Skills and commands

- Skills (`.claude/skills/`): `chrome-extension-docs` (offline Chrome docs mirror), `chrome-extension-ai-assist` (AI-assisted extension work), `band-play-repo` (repo orientation), `article-writing` (article branch).
- Slash commands (`.claude/commands/`): `/build`, `/watch`, `/lint`, `/format`, `/zip`.
- AI + extensions (official): https://developer.chrome.com/docs/extensions/ai/build_with_ai
