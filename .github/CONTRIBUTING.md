# Contributing to Band Play

Thank you for helping. Read this page before you open a pull request.

## Set up

- Node.js 24 or newer, `jq` and `zip` (the pre-commit hook packages the extension).
- Run `npm install`. For the end-to-end tests, run `npx playwright install chromium` once.
- The details are in [docs/development.md](../docs/development.md).

## Checks

Run the checks that match your change before you push. CI runs them all.

| Check                          | Command                                                | CI job   |
| ------------------------------ | ------------------------------------------------------ | -------- |
| Exact dependency versions      | `npm run check:versions`                               | `build`  |
| Formatting                     | `npm run format:check`                                 | `build`  |
| Builds (Chrome, Firefox)       | `npm run build` and `npm run build:firefox`            | `build`  |
| ESLint and type check          | `npm run lint`                                         | `build`  |
| Firefox package lint           | `npm run lint:firefox` (after `npm run build:firefox`) | `build`  |
| Unit tests                     | `npm run test:unit`                                    | `build`  |
| End-to-end tests               | `npm run test:e2e`                                     | `e2e`    |
| Docs (links, release headings) | `npm run lint:docs`                                    | `checks` |
| Unused files and exports       | `npm run lint:unused`                                  | `checks` |

Pull requests also run the code scanning, the dependency review and the title check.

## Code and dependency rules

- Follow the style of the code around your change. Prettier and ESLint enforce most of it.
- Write code comments and documentation in English.
- Dependencies are pinned to exact versions, without `^` or `~`. Add one with `npm install -E <package>@latest`, then run `npm run check:versions`.
- A new permission changes both manifests. Explain it in [LISTING.md](../LISTING.md) and in the pull request.
- A change the user can see updates [docs/usage.md](../docs/usage.md), [LISTING.md](../LISTING.md) and [RELEASE_NOTES.md](../RELEASE_NOTES.md) together.

## Commits and pull request titles

- Write the title in the imperative mood, starting with a capital letter. Keep it at most 72 characters, with no period at the end.
- The title check (`pr-title.yml`) enforces the length, the capital letter, the period and the `WIP`, `fixup!` and `squash!` prefixes. The mood is not checked by a script.
- Do not add generated-by or co-author lines.

## How changes arrive

- The maintainer pushes small changes straight to `master`. Pushes to `master` run the build and the checks.
- Other changes come as pull requests to `master`.

## The pre-commit hook

`.husky/pre-commit` runs on every commit. It copies the version from `public/manifest.json` to `package.json` and `public/manifest.firefox.json`, runs `npm run format`, runs `git add -u` and then `./zip.sh`, which builds both browsers (this takes minutes).

Side effects to know about:

- `git add -u` stages every modified tracked file, so partial commits are not possible.
- A new file is not added. Stage it yourself with `git add`.

## Releases

Only the maintainer releases. The steps are in [docs/development.md](../docs/development.md#releases).

## Reporting

- Bugs and ideas: [issues](https://github.com/borbiuk/band-play/issues).
- Security problems: report them privately, as described in [SECURITY.md](../SECURITY.md).
