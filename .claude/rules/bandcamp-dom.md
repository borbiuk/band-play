---
paths:
    - 'src/content/**'
---

# Bandcamp DOM (page services and selectors)

> Which Bandcamp markup the content script depends on, and how to check it after Bandcamp changes its pages.

- Bandcamp has no public API for the player: the extension reads and clicks the page's own elements and the `<audio>` element. Any selector below can break when Bandcamp changes its markup.
- **The selectors are spread over the files** (not centralized in one module yet). When you change one, search for the same selector in the other files (`visited-service.ts` and `batch-download-service.ts` repeat some of them).

## Page detection

- `PageServiceWorker.currentService()` (`src/content/services/page-service-worker.ts`) takes the first service whose `isServiceUrl(window.location.href)` is true; the order matters:
    1. `AlbumPageService`: the URL contains `/album/` or `/track/`.
    2. `DiscoverPageService`: the URL contains `/discover`.
    3. `FeedPageService`: the URL ends with `/feed` or contains `/feed?`. Its `isServiceUrl` also calls `renderPlayer(this)`, so it has a side effect: it mounts the feed player.
    4. `CollectionPageService`: the URL without the query matches `^https://bandcamp.com/[a-zA-Z0-9-_]+(?:/wishlist)?$`; `isWishlist` is set from `/wishlist`.
- No match (an artist home page such as `https://<artist>.bandcamp.com/`, the purchases page, search): `pageService` is `null`, shortcuts and media keys do nothing and the page keeps its keys.
- When the tab URL changes, also without a page reload, the background sends `UrlChanged` (from `tabs.onUpdated`) and the service is picked again; `BatchDownloadService` cleans up and sets itself up again.
- `BatchDownloadService` detects its pages by elements, not by URL: `#oh-container` (purchases), else `#collection-grid` or `#wishlist-grid` (collection, wishlist).
- `tests/unit/page-service-urls.spec.ts` covers the URL rules of the album, discover and collection services (not the feed service, whose `isServiceUrl` renders React).

## Selectors per file

All paths are under `src/content/` unless noted.

- **Audio** (`page-services/bandcamp/base/base-bandcamp-page-service.ts`, `audioOperator`): `document.querySelector('audio')`; when it has no `src`, a recursive search through every `shadowRoot`. Play/pause, seek, speed and pitch work on that element; `audioEventEmitter` emits it (or `null`) for the feed player and the visited history.
- **Album and track** (`page-services/bandcamp/album-page-service.ts`):
    - play/pause fallback without audio: `.playbutton`; next / previous: `.nextbutton`, `.prevbutton`;
    - play by index: `td.play-col > a:not(:has(div.play_status.disabled))`, then its `div` (`:has()` needs Firefox 121+);
    - open in new tab: `.current_track .title a` (`href`, relative to `window.location.origin`);
    - wishlist: `#collect-item` with class `wishlist` → click `#wishlist-msg`, class `wishlisted` → click `#wishlisted-msg`;
    - autoplay here only loops the track (`loopTrack`); `initTracks()` is empty, so no visited highlighting on these pages.
- **Discover** (`page-services/bandcamp/discover-page-service.ts`):
    - items: `.results-grid-item` (id from `data-test`), play button inside: `.play-pause-button`;
    - play/pause: `.player-top > button.play-pause-button`;
    - current item: `[aria-label="Pause"]`, three `parentElement` steps up, its `data-test`;
    - progress for autoplay: text of `.playback-time.current` and `.playback-time.total` (`convertTimeStringToSeconds`);
    - open: `.buy-button` (`href`); wishlist: `.wishlist-button`; pitch switch does nothing here.
- **Feed** (`page-services/bandcamp/feed-page-service.ts`, `feed-player/feed-player.tsx`):
    - items: `#story-list [data-tralbumid]`; play button: `.play-button` (a click listener records the now-playing item, once per button);
    - now playing: `.collection-item-title`, `.collection-item-artist`, cover `.tralbum-art-large`, else `img[class*="art"]`, else `img[src*="bcbits.com"]`;
    - open: `.item-link` (`href`); wishlist: `#collect-item_<tralbumid>` inside the item, the class `wishlisted` two parents up, then `.wishlisted-msg` / `.wishlist-msg`;
    - the feed player is a React root in `#band-play_player-container`, appended to `<body>`; it uses `chrome.runtime.getURL('./assets/nextprev.png')` (a `web_accessible_resources` entry) and follows `showFeedPlayer`.
- **Collection and wishlist** (`page-services/bandcamp/collection-page-service.ts`):
    - items: `#collection-grid` or `#wishlist-grid` `[data-tralbumid]` that also have `data-trackid` (unreleased items have none); play: the item's first `a`;
    - now playing id: `div[data-collect-item]`, attribute value without its first character;
    - open: `.item-link`; wishlist: `#collect-item_<id>`, the class `wishlisted` two parents up, `.wishlisted-msg` / `.wishlist-msg`;
    - clicks every `.show-more` once (marks it with the attribute `band-play-clicked`) to load all items;
    - adds two tabs to `#grid-tabs`: `li#band-play-tab-donate` and `li#band-play-tab-rate` (class `band-play-external-tab`), opened through `CreateNewTab`.
- **Visited history** (`src/shared/services/visited-service.ts`, `styles/visited.scss`): ids from `[data-tralbumid]` and `div[data-collect-item]`, the path from `link[rel="canonical"]` or `location.href`; item links `a.item-link`, `a.buy-button`, `a[href*="/album/"]`, `a[href*="/track/"]`. The class `band-play-visited` colors text inside `.tralbum-details`, `.collection-title-details` and the other containers in `visited.scss`.
- **Batch download** (`services/batch-download-service.ts`, `components/batch-download-checkboxes-layer.tsx`):
    - collection items: `[id*="collection-item-container"], .collection-item-container` with `data-tralbumid` and a `.redownload-item a` link (the download page URL); title `.collection-item-title` (first line), artist `.collection-item-artist` (without "by "), cover `img.collection-item-art`; also observed: `#collection-search-grid`;
    - purchases items: `.purchases-item` with the attribute `sale_item_id`; link `[data-tid="download"]`; checkbox mount inside `[data-tid="links"]` (skipped when it has the class `deleted-badge`); title `.purchases-item-title` (`"<title> by <artist>"`), cover `.purchases-item-art img`, `.item-art img` or `img[src*="bcbits.com"]`;
    - "select all": collection count `#grid-tabs>.active .count`, more button `.expand-container.show-button > button`; purchases count from the parent text of `.page-items-number` (`of N`), more button `.view-all-button`, list `.purchases`; active checkbox container `.grid.active`, else `.purchases`, else `<body>`;
    - own elements: `#band-play-batch-overlay-root`, `.band-play-batch-checkbox`, attributes `data-band-play-batch-checkbox`, `data-band-play-batch-id`, `data-band-play-batch-checkbox-mount`.
- **Download page data** (`src/downloads/services/bandcamp-parser.ts`, used by the background): the `data-blob` attribute of the element with `id="pagedata"` (read with a regular expression, because a service worker has no `DOMParser`), JSON `digital_items[]` (`downloads[<format>].url`, `size_mb`, `item_id` or `sale_id`, `artist`, `title`, `killed`) and `identities.fan.verified`.

## Rules for selectors

- Prefer ids and `data-*` attributes over layout classes; guard every lookup (`?.`, `notExist`) so a missing element does nothing instead of throwing every 250 ms. Some old code still calls `.click()` on a lookup without a guard (`.nextbutton`, `.prevbutton`, discover `[aria-label="Pause"]`); keep new code guarded.
- Mark elements the extension adds with a `band-play` id, class or attribute, and make every injection idempotent (the services run again on every timer tick and URL change).
- Do not depend on Bandcamp's scripts in tests: the snapshots have none ([testing.md](testing.md)).

## How markup changes are detected

- `tests/e2e/fixtures/capture-pages.mjs` (`npm run test:snapshots`) downloads the snapshot pages (album, track, artist home) and fails when a page lacks a string in `REQUIRED_MARKUP` (album: `class="playbutton`, `class="nextbutton`, `class="prevbutton`, `play-col`; track: the first three; artist: none).
- `.github/workflows/markup.yml` (daily) runs that capture, commits changed snapshots to `master`, runs `npm run test:e2e` and `npm run test:live`, and opens or comments on a `markup-drift` issue on failure ([docs-and-ci.md](docs-and-ci.md)).
- Not covered by any automated check: Discover, feed, collection, wishlist, purchases and the batch download selectors. Check them by hand after a change.
- When you rely on new album or track markup, add it to `REQUIRED_MARKUP` so a Bandcamp change fails in the capture step.

## Verifying changes

- Test on: an album page and a track page (Space, next/previous, Shift+digit, seek, speed, pitch, wishlist, open in new tab), an artist home page (arrows and Space must still scroll), `/discover`, the feed (feed player, autoplay of the next item), a collection and a wishlist (autoplay, visited highlight, the donate and rate tabs), and the purchases page (checkboxes, overlay, select all). Navigate between pages without a reload and check that nothing is added twice.
- In-browser checks with the `chrome-devtools` MCP server (`.mcp.json`): after `npm run build`, call `install_extension` with the absolute path of `dist/`, and `reload_extension` after every rebuild. Open the pages above, check `html[data-band-play="ready"]` and `list_console_messages` for errors. The feed and the purchases page need a signed-in Bandcamp account: check them by hand in a signed-in browser profile.
