---
paths:
    - 'src/shared/components/ui/**'
    - 'src/shared/styles/**'
    - 'tailwind.config.js'
    - 'design/**'
---

# Design system (redesign)

> Tokens and UI primitives of the redesign. The approved design is in [`design/`](../../design/): open `design/style-guide/index.html` first, then the notes next to each prototype (`popup/NOTES.md`, `downloads/NOTES.md`, `bandcamp-ui/NOTES.md`, `banners/NOTES.md`).

## Tokens

- One source of truth: the `aqua`, `pink` (accent), `coral`, `ink`, `line`, `danger`, `warn`, `success` colors, `rounded-ctl|menu|card|dialog`, `shadow-card|pop` and `font-ui` in `tailwind.config.js`. They match `design/tokens.css`; change both together.
- The old `band` palette is gone. Do not bring back `band-*` classes.
- Brand is Bandcamp Aqua `#1da0c3` (`aqua-500`). Use it for fills and non-text UI; text and button fills use `aqua-700` and darker. `pink` is the accent for counters and dots (badge fill `pink-700` with white text, `pink-500` never for text); `danger` and `warn` are deep coral on a coral tint, `coral-500` is for bars and borders. Every text pair must pass WCAG AA (the table in the style guide is computed from the tokens).
- Focus ring: `focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2` (never remove an outline without it).
- Light theme only. Font stack is Helvetica Neue, the same as Bandcamp.

## Primitives (`src/shared/components/ui/`)

- `Button`, `Switch`, `Chip`, `Badge`, `Pill`, `Kbd`, `Note`, `Field`, `Select`, `Range`, `Stepper`, `ProgressBar`, `Dialog`, `ConfirmDialog`, `Card`, `CardTitle`, `SettingRow`, `SwitchRow`, `glass`. Import from `@shared/components/ui`.
- Use them for new UI in the popup and the downloads page instead of repeating utility classes. A variant maps all its colors in one place, so classes never conflict.
- `Switch` is a native checkbox with `role="switch"` (the `switch` attribute is Safari-only). It calls `onChange` only for a user change: it never writes when it renders.
- `ConfirmDialog` is a `Dialog` with Cancel and a red confirm button for a risky action: it closes first, then calls `onConfirm`. `SwitchRow` is a `SettingRow` with a `Switch` (a click on the row toggles it); a `Switch` in a `SettingRow` is described by the row's hint.
- `Dialog` uses the native `<dialog>` and `showModal()` from script (invoker commands need Firefox 144, the extension supports 128).
- Plain CSS that utilities cannot express (range thumbs, the select arrow, the dialog backdrop) is in `src/shared/styles/ui.scss`, imported by the component that needs it.
- The content script does not use these primitives or Tailwind (except the feed player's own scoped utilities, built from `feed-player/tailwind.config.js`, which scans only `feed-player.tsx`, so `content.js` does not carry the classes of the popup and the downloads page): the batch download checkboxes, badge, bar and tabs are plain CSS in `src/content/styles/batch-download.scss`, designed in `design/bandcamp-ui/` ([bandcamp-dom.md](bandcamp-dom.md)).

## Design files

- `design/` is prototypes and exports, not extension code: ESLint and Prettier ignore it. Prototype pages are plain HTML, CSS and JS and open in a browser.
