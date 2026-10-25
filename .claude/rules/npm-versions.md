---
paths:
    - 'package.json'
    - 'package-lock.json'
    - '.npmrc'
    - 'scripts/check-versions.mjs'
---

# npm versions policy

> Exact versions only.

- **Every** entry in `dependencies` and `devDependencies` is an exact version such as `19.3.1`. Never use `^`, `~`, `*`, `latest` or other ranges. `scripts/check-versions.mjs` (`npm run check:versions`) checks `dependencies`, `devDependencies`, `optionalDependencies` and `peerDependencies`.
- npm aliases are allowed with an exact version: `"typescript7": "npm:typescript@7.0.2"`.
- `.npmrc` sets `save-exact=true` and `engine-strict=true` (`engines.node` `>=24.0.0`).
- Add or update dependencies only when the task needs it, and say so explicitly; `npm install` asks for confirmation (see `.claude/settings.json`).

## Updating

```bash
npm install -E <package>@latest      # dependency
npm install -D -E <package>@latest   # dev dependency
npm run check:versions               # fails if anything is not exact
npm run check:outdated               # npm outdated; local use, not run in CI
```

- DO review `package.json` after installing: aliases and overrides must stay exact.
- DON'T hand-edit versions in `package-lock.json`; let npm regenerate it.
- After updates run `npm run build`, `npm run build:firefox`, `npm run lint` and `npm test` (or `/verify`).
- After a `@playwright/test` update, regenerate the Playwright agents ([testing.md](testing.md)).

## TypeScript

- `typescript7` → `npm:typescript@7.0.2`: the compiler used by `npm run typecheck` (`node node_modules/typescript7/bin/tsc --noEmit`, then the same with `-p tests`).
- `typescript` → `6.0.3`: TypeScript 6, which provides the JavaScript API that `ts-loader` and `typescript-eslint` still need. Do not remove it and do not move it to version 7; Dependabot ignores its major updates.
- `ts-loader` runs with `transpileOnly`; type errors show up only in `npm run typecheck` / `npm run lint`.
- When updating either one, keep the other in mind and run `npm run lint`.

## Tailwind

- `tailwindcss` stays on version 3 (`3.4.17`): `tailwind.config.js`, `postcss.config.js` (the `tailwindcss` PostCSS plugin) and `@tailwind base` / `@tailwind utilities` in the SCSS files use the v3 setup. Tailwind 4 changes the configuration and the PostCSS plugin; move to it only as a separate, agreed task. `prettier-plugin-tailwindcss` sorts the class names.

## Overrides

- `overrides` in `package.json` pins `eslint-plugin-react` to the root `eslint` (`"eslint": "$eslint"`). Keep it when updating.

## CI

- `.github/workflows/build.yml` runs `npm ci`, `npm audit signatures` and `npm run check:versions` on every push and pull request. `check:outdated` is for local use only because new releases would break CI at random.
- `.github/dependabot.yml` opens weekly pull requests (7-day cooldown; groups `dev-tooling` and `runtime`) and keeps the versions exact.
