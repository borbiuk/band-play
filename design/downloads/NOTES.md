# Downloads page redesign notes

Prototype: `downloads.html` (add `?static` to stop the demo progress timer; `#empty` and `#unverified` open those states). Screens: `screens/`. Shared styles: `../tokens.css`, `../components.css`.

## Layout

- One sticky glass header: brand, batch settings (format, parallel downloads), summary card, filter and action row. The list scrolls underneath. Fallback: opaque white without `backdrop-filter`.
- The list is a card of fixed-height rows (`--row-h: 64px`), so the existing windowed rendering (`ROW_HEIGHT`) keeps working. Child rows of a bundle use the same height.
- Row columns: expand toggle, cover, title and subtitle (artist, format, size), status cell (pill, percent, bar, hint), actions.
- Footer: version, "by borbiuk", GitHub, coffee, rate. The floating "by borbiuk" label and the page-wide horizontal scroll are gone (checked at 1440, 1024 and 720 px).

## Behaviour that already exists in the code

Pause all and Resume all, Retry failed, Clear completed, Clear all, per-item pause, resume, cancel, retry, remove, delete file, show in folder, open release page, windowed list, unverified-email banner, duplicate and rate-limited states.

## New behaviour that needs code

- **Filter chips with counts** (All, Active, Paused, Failed, Done), counted over top-level rows. Active = pending, queued, resolving, resolved, downloading, rate-limited. Paused = paused, duplicate.
- **Search by title or artist**, and a **Sort by** select (Queue order, Title, Status) instead of the clickable table headers.
- **One main action** that switches between Pause all and Resume all; **Retry failed** with a count, shown only when something failed.
- **Clear all asks for confirmation** (dialog). Clear completed does not.
- **Rate-limited hint** with a countdown from `nextRetryAt`. **Duplicate hint**: "File already exists. Resume to keep both".
- **Expand all / Collapse all** for bundles. A bundle is a purchase with several separate downloads (the `Multiple` item with `Single` children), for example a discography: each child is its own zip with its own progress. An album is always one zip, so tracks inside it are never listed or tracked.
- Failure text under the Failed pill uses `failReason` ("Email not verified") or a generic message.

## Removed

The "#" column, sortable table headers, the "Remaining" badge, the filename template field (the feature is removed, see the popup notes).

## Notes

- Status is never shown by color alone: every one of the 10 statuses has an icon and a label.
- Long titles are cut with an ellipsis and keep the full text in `title`.
- Covers in the prototype are generated; the real page uses `coverArtUrl`. A cover that fails to load should show a neutral tile.
- Reduced motion: transitions off, and the demo timer is not used in the real page.
