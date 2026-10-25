# Usage

## Features

### Playback

- **Keyboard shortcuts**: play and pause, next and previous track, seek, speed, pitch, loop, open in a new tab and wishlist (see [Keyboard shortcuts](#keyboard-shortcuts)). Every combination can be changed in the popup.
- **Media keys**: the play, pause, next track, previous track, seek forward and seek backward keys of your keyboard or headset control the Bandcamp player on the supported pages.
- **Speed**: each step changes the playback speed by 1% (`playbackRate` ± 0.01); a reset sets it back to normal speed.
- **Pitch**: switch pitch preservation on and off while the speed is changed (the browser's `preservesPitch`); the reset shortcut turns it off.
- **Seek step**: seek forward and backward by a number of seconds you set in the popup (1 to 120, default 10).
- **Jump to a position**: a digit key jumps to 0%, 10%, ... 90% of the track; Shift plus a digit plays that track of the list (Shift+1 is the first track).
- **Loop track**: repeat the current track instead of moving on (off by default; Shift+V switches it).

### Automation

- **Autoplay** (on by default): when a track ends, the next track of the album, collection, wishlist, feed or discover list starts.
- **Autoscroll** (on by default): the page scrolls to the item that started playing.
- **Keep Awake** (off by default, Chrome only): keeps the display from turning off or dimming while the setting is on (`chrome.power`).

### Pages

- **Highlight visited** (on by default): albums and tracks you already opened or played are marked on Bandcamp pages. The history is stored in the extension's local storage only (up to 50,000 items) and is shared by all tabs.
- **Feed player** (on by default): a small player on the Bandcamp feed page with the cover, the title and a progress bar you can click to seek.
- **Open in new tab**: open the current item in a new tab, in the background (O) or with focus (Shift+O).
- **Wishlist**: add the current item to the wishlist or remove it (L).

### Batch download

- **Where**: on your collection page (items you bought, that have a download link) and on your purchases page; there is nothing to download on the wishlist. Band Play adds a checkbox to each item and a small bar at the bottom right of the page. The checkbox shows when you point at an item, and all of them stay visible while something is selected.
- **Select**: click checkboxes one by one; Shift+click selects the range from the last clicked checkbox. **Select All** loads the whole list and selects every item (it shows the progress and can be stopped). **Select New** selects only the items you have not downloaded yet in the current format. Releases you already have in that format show a **Downloaded** mark. After **Download** the bar says how many releases were sent to the downloads page.
- **Format**: MP3 V0, MP3 320, FLAC, AAC, Ogg Vorbis, ALAC, WAV (default) or AIFF. Set the default in the popup, or pick a format for one batch with the arrow next to the **Download** button.
- **Concurrency**: how many files download at the same time (1 to 15, default 8).
- **Downloads page**: a download starts a Band Play downloads page in a browser tab. It shows the overall progress, with speed and time left, and every item with its status and progress. You can filter by status (All, Active, Paused, Failed, Done), search, and sort by queue order, title or status. A purchase with several downloads (a bundle) folds into one row. The page has **Pause all** or **Resume all**, **Retry failed**, **Clear completed** and **Clear all** (it asks first), and per item Pause, Resume, Cancel, Retry, Show in folder, Copy Bandcamp link, Delete file from disk (it asks first) and Remove. The popup has an **Open downloads** button.
- **Reliable**: when Bandcamp answers "too many requests" (HTTP 429), the download is retried later with a growing delay. In Chrome the browser's download bubble is hidden while a batch runs and shown again afterwards.
- **History**: completed downloads are remembered per release and format, so **Select New** and the marks on the page know what you already have.

### Keyboard shortcuts

Defaults (change them in the popup):

| Shortcut                   | Default            | What it does                                           |
| -------------------------- | ------------------ | ------------------------------------------------------ |
| Play/Pause                 | Space              | Play or pause the current track                        |
| Play next track            | N                  | Play the next track of the list                        |
| Play previous track        | B                  | Play the previous track of the list                    |
| Play track by index        | Shift + 1...9      | Play that track of the list (Shift+1 is the first one) |
| Loop track                 | Shift + V          | Switch looping of the current track on or off          |
| Seek forward               | Arrow Right        | Move forward by the seek step (default 10 seconds)     |
| Seek backward              | Arrow Left         | Move back by the seek step                             |
| Set playback progress      | 0...9              | Jump to 0%, 10%, ... 90% of the track                  |
| Increase playback speed    | Arrow Up           | Speed up by 1%                                         |
| Decrease playback speed    | Arrow Down         | Slow down by 1%                                        |
| Reset playback speed       | Shift + Arrow Down | Back to normal speed                                   |
| Switch Auto-Pitch          | P                  | Switch pitch preservation on or off                    |
| Reset Auto-Pitch           | Shift + P          | Turn pitch preservation off                            |
| Open in new tab            | O                  | Open the current item in a new background tab          |
| Open in new tab with focus | Shift + O          | Open the current item in a new tab and switch to it    |
| Add/Remove from Wishlist   | L                  | Add the current item to the wishlist or remove it      |

Notes:

- The shortcuts work only on the supported pages (see below). On other Bandcamp pages the keys are left to the page, so the arrows and Space still scroll.
- They do nothing while you type in a text field or while an input method composes text.
- Only an exact match is used: a combination with an extra modifier (for example Ctrl+P) is left to the page and the browser.
- To change a shortcut, pick it in the popup, press the new combination and click **Save**; **Reset** restores the default. The popup refuses a combination that another shortcut already uses or that the browser uses.

### Supported pages

| Page                    | URL                                              | What you get                                       |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------- |
| **Album and track**     | `https://*.bandcamp.com/album/...`, `/track/...` | Shortcuts, media keys, autoplay, highlight visited |
| **Collection/Wishlist** | `https://bandcamp.com/USER`, `/USER/wishlist`    | All of the above, autoscroll, batch download       |
| **Purchases**           | your purchases page on `bandcamp.com`            | Batch download                                     |
| **Feed**                | `https://bandcamp.com/USER/feed`                 | All playback features and the feed player          |
| **Discover**            | `https://bandcamp.com/discover`                  | Playback features, autoplay, autoscroll            |

Pitch preservation is not available on the discover page.

### Settings popup

Click the Band Play icon in the toolbar. The popup has four tabs:

- **Playback**: Autoplay next track, Loop track, Media keys, Keep screen awake (Chrome only) and the seek step.
- **Page**: Highlight visited, Autoscroll, Feed player, and the visited history with a **Clear** button.
- **Downloads**: **Open downloads**, the batch download format and concurrency, a notification when a batch finishes, opening the downloads page when a batch starts, and skipping releases you already downloaded in the same format.
- **Shortcuts**: a search, a switch to turn each shortcut on or off, a pencil to record a new key, and **Reset**.

The footer has **Import** and **Export** (a settings file) and **Reset all**. All settings are saved at once in the extension's local storage (`chrome.storage.local`).

### Firefox

Band Play works in Firefox 128 or newer, with two differences:

- **Keep Awake** is hidden, because Firefox has no `chrome.power` API.
- **Import** of a settings file opens in a browser tab, because Firefox closes the popup when a file dialog opens.
