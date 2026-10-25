# 0002. Type check with TypeScript 7, build with TypeScript 6

- Status: Accepted
- Date: 2026-10-23 (commit `00f358f`)

## Context

The type check is the strictest check of the code, so it should use the newest compiler. The build tools and the ESLint type-aware rules still load the TypeScript 6 package: `ts-loader` (webpack) and `typescript-eslint` use it.

## Decision

- `typescript7` (an alias of `npm:typescript@7.0.2`) runs the type check: `npm run typecheck` runs it on `src/` and on `tests/`, and `npm run lint` runs it after ESLint.
- `typescript` (6.x) stays installed for `ts-loader` and `typescript-eslint`.
- Dependabot does not offer major updates of `typescript` (see `.github/dependabot.yml`).

## Consequences

- Two TypeScript versions are installed. A contributor who imports the compiler API directly must use the right one.
- When `ts-loader` and `typescript-eslint` support TypeScript 7, this record should be replaced by a new one that removes the second version.
