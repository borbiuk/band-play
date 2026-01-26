# Chrome Extension Example

This is a minimal Chrome Extension template built with React, Tailwind, Webpack, ESLint, and Prettier.

## Structure

- `src/background` — service worker and Chrome API access.
- `src/content` — DOM integration and messaging.
- `src/popup` — popup UI in React.
- `src/tabs` — standalone extension page (tab).
- `src/shared` — shared types and components.

## Build

```bash
npm install
npm run build
```

For dev mode with watch:

```bash
npm run watch
```

Build output: `example/dist`.

## Run in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `example/dist` folder.

## Tailwind and style isolation

Tailwind is configured with `prefix: "ext-"` and `preflight` disabled. This reduces the risk of CSS conflicts with the host page.
For content scripts this is critical, because styles are injected into the current page.
