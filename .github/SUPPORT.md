# Support

## Where to ask

- Questions and bug reports: [GitHub issues](https://github.com/borbiuk/band-play/issues). Use the issue templates.
- Security problems: do not open a public issue. Follow [SECURITY.md](../SECURITY.md).

## What is supported

- The latest released version (see the supported versions table in [SECURITY.md](../SECURITY.md)).
- Chrome, from the Chrome Web Store.
- Firefox 128 or newer, from a build of the release package or from source. Keep Awake is Chrome only.

## When Bandcamp changes its pages

Band Play reads the markup of Bandcamp pages. When Bandcamp changes that markup, some features can stop working until the extension is updated. A daily check ([markup.yml](workflows/markup.yml)) tests the extension against the current Bandcamp pages and opens an issue labelled `markup-drift` when a test fails. Report a broken feature as an issue with the page address and the browser version.
