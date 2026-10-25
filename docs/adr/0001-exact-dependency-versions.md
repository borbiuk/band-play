# 0001. Pin exact dependency versions and wait a week before updates

- Status: Accepted
- Date: 2026-10-23 (commit `00f358f`)

## Context

The extension is published to two stores, and its build runs in CI and in the release workflow. A version range (`^` or `~`) lets an install pick a new release that nobody has tested here. A newly published release can also be broken or malicious, and npm releases are sometimes pulled soon after publication.

## Decision

- Every dependency in `package.json` is an exact version. `.npmrc` sets `save-exact=true`, and `npm run check:versions` fails on any other range.
- `.npmrc` sets `engine-strict=true`, so the install fails on a Node version below the one in `engines`.
- Dependabot opens weekly updates with a 7-day cooldown, so a release is usually a week old when the update opens.
- Updates are made with `npm install -E <package>@latest`, then `npm run check:versions`.

## Consequences

- Installs are reproducible, and a bad release is not picked up by accident.
- Updates are a deliberate step. A security fix in a dependency waits for a human to update it.
- CI runs `npm audit signatures` on every install, so the registry signatures of the installed packages are checked too.
