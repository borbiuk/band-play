# Repository agents (Bandcamp Play)

This file orients human and AI contributors to the **Bandcamp Play** Chrome extension (Manifest V3). Prefer **small, focused changes**; do not refactor unless asked.

## Product

- **Bandcamp Play** — browser extension for Bandcamp (playback, UI, batch download, etc.).
- **Build output** — `dist/` (Load unpacked target).
- **Source manifest** — `public/manifest.json` (copied into `dist/` by the build).

## Architecture (MV3)

| Area                 | Path                           | Role                                                                           |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| Service worker       | `src/background/background.ts` | Events, coordination, privileged `chrome.*` APIs. Keep lean and deterministic. |
| Content script       | `src/content/content.ts`       | DOM on matched Bandcamp URLs; limited `chrome.*`.                              |
| Options / toolbar UI | `src/options/options.tsx`      | Extension popup / options UI.                                                  |
| Dedicated page       | `src/downloads/downloads.tsx`  | Extension page opened as a tab.                                                |
| Shared code          | `src/shared/`                  | Models, enums, services, utilities — reuse via **`@shared/*`** alias.          |

See also [chrome-extension-architecture.md](.claude/rules/chrome-extension-architecture.md).

## Messaging

- Use typed **`MessageModel`** / **`MessageCode`** as described in [messaging-conventions.md](.claude/rules/messaging-conventions.md).
- Background handling: `src/background/services/messages-background-service.ts`.

## Build and manifest constraints

- **No hashed bundle filenames** — `manifest.json` references fixed names; webpack uses **`[name].js`**. Do not introduce content hashes without updating `public/manifest.json` and tooling.
- Cross-import shared code via **`@shared/...`** (see `webpack/webpack.common.js`).

## Commands

- `npm run build` — production bundle.
- `npm run watch` — dev watch mode.
- `npm run zip` — zip script for packaging `dist/` (see `zip.sh`).
- `npm run lint` — ESLint.

## Documentation

- **Article series (Ukrainian):** [`docs/chrome-extensions-series/README.md`](docs/chrome-extensions-series/README.md) (on the `article` branch until merged).
- Official Chrome APIs: **`developer.chrome.com`** only when citing chrome/extension behavior.

## Rules of engagement

- English for code comments and technical docs in-repo (per project convention).
- Follow the working rules in [CLAUDE.md](CLAUDE.md) (minimal scope, no speculative refactors).
- For AI-assisted work, start from Google's [Build Chrome Extensions with AI](https://developer.chrome.com/docs/extensions/ai/build_with_ai), then verify against the local docs mirror in the [chrome-extension-docs skill](.claude/skills/chrome-extension-docs/SKILL.md) (`.claude/skills/chrome-extension-docs/references/`).
