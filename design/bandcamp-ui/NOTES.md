# Elements on Bandcamp: redesign notes

Prototypes: `collection.html`, `purchases.html`, `wishlist.html` (rough copies of Bandcamp pages, only for judging the elements in context). Add `#selected`, `#menu`, `#loading` or `#toast` to a URL to open that state. Screens: `screens/`.
The deliverable for the extension is `band-play.css` (all rules are scoped by `band-play` classes or ids). `mock.css` and `demo.js` are prototype-only.

## Look

Bandcamp first: white, flat, 13 px Helvetica Neue, aqua links, thin grey lines. Band Play shows only in details: 8-10 px rounded corners, aqua-700 primary button, a soft shadow on the bar.

## Elements

- **Checkbox** (`.band-play-batch-checkbox`): 26 px on the cover corner in the collection (hidden until hover, focus or checked), 22 px in the purchases list. Aqua when checked. A selected collection card gets a 2 px aqua frame (`:has(:checked)`, Chrome 105+ and Firefox 121+, the extension needs 128+).
- **Selection mode**: while at least one item is selected, `<body>` gets `band-play-selecting` and every checkbox stays visible (new).
- **Downloaded badge** (`.band-play-downloaded-badge`): a green "Downloaded" pill on the cover instead of the green checkbox, so "downloaded" is no longer confused with "selected". It is a separate element rendered next to the checkbox (collection: inside `.collection-item-art-container`, purchases: above the checkbox). The checkbox still works, so a release can be downloaded again.
- **Batch bar** (`#band-play-batch-overlay-root .bp-bar`): one horizontal bar bottom right, 96 px above the bottom so it clears Bandcamp's player.
    - Idle: logo, "Batch download", Select all, Select new, disabled Download with the current format.
    - Selected: "N selected" with a clear button, Select all, Select new, and a split button "Download N · WAV" with a format menu.
    - Selecting all: "Selecting 120 of 847" with a progress track and Stop.
    - Sent: "3 releases sent to Downloads" with an Open link for 4 s (new feedback).
    - Select new appears only when the download history is not empty (as today).
- **Format menu** (`.bp-menu`): a list with the current format checked (`role="menuitemradio"`).
- **Visited**: purple text (`#7b1fa2`) as now; the same class `band-play-visited`.
- **Donate and rate tabs**: same tabs as Bandcamp's own, with a small pink heart and an aqua star.
- **Feed player: not changed** (it must stay identical to Bandcamp's player).

## Wishlist

No batch UI there: no checkboxes, no bar, no badges. `BatchDownloadService` must not run on `#wishlist-grid` (today it does). Visited colors and the donate and rate tabs stay.

## For the implementation

- The checkbox no longer needs the inline `left` and `top` style; position it from the CSS (`left`/`top` 16 px relative to the card, which has 8 px padding).
- The old overlay styles (`!important` button overrides, Tailwind inside `#band-play-batch-overlay-root`) can go: `band-play.css` is standalone.
- Keep the existing ids, classes and data attributes listed in `.claude/rules/bandcamp-dom.md`.
- Honor `prefers-reduced-motion` (already in the CSS) and keep visible focus rings.
- Verify on a real signed-in account: collection, purchases and wishlist have no automated check. The prototypes are approximations of Bandcamp's markup and CSS.
