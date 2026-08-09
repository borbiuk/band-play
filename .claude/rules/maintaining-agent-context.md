# Maintaining agent context (.claude/)

> How to keep CLAUDE.md, rules, skills, and commands in this repo consistent and useful.

## Layout

| Location            | Purpose                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `CLAUDE.md`         | Always-loaded project memory: core working rules and pointers. Keep it short.        |
| `AGENTS.md`         | Tool-agnostic orientation for humans and AI contributors (entrypoints, constraints). |
| `.claude/rules/`    | Detailed topical rules, read on demand and linked from CLAUDE.md/AGENTS.md.          |
| `.claude/skills/`   | Skills (`<name>/SKILL.md` + optional `references/`) loaded when the task matches.    |
| `.claude/agents/`   | Subagent definitions (frontmatter with `name`, `description`, `tools`, `model`).     |
| `.claude/commands/` | Slash commands (`/build`, `/lint`, ...): one markdown file per command.              |

## Writing rules and skills

- Start with a short, high-level overview; then specific, actionable requirements.
- Use `[filename](path)` links to reference real project files over theoretical examples.
- Use language-specific code blocks; prefer **DO** / **DON'T** pairs when they improve clarity.
- Keep documents DRY: link to other rules/skills instead of duplicating them.
- In a skill, keep `SKILL.md` small and move bulky material into `references/` files that are read on demand.

## When to add or update

- **Add a rule/skill when**: a new technology or pattern is used in 3+ files, code review feedback repeats the same points, or a rule can prevent common bugs or security issues.
- **Update when**: better examples exist in the codebase, new edge cases are discovered, or implementation details have changed.
- **Remove** outdated guidance promptly; stale rules are worse than no rules.

## Quality checks

- Rules should be actionable and specific; examples should come from actual code.
- References and paths must stay up to date (verify after moving or renaming files).
