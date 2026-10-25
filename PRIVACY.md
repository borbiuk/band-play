# Privacy Policy

This policy describes Band Play version 11.0.0 and the code in this repository.

## Summary

- Band Play collects no data. It has no accounts, no analytics and no servers of its own.
- Everything the extension stores stays in your browser.
- The only requests the extension makes are to Bandcamp, and only for batch download.

## What the extension reads

On Bandcamp pages (`bandcamp.com` and its subdomains), the content script reads the page to play, skip and highlight items: the albums, tracks and links on the page. It does not send what it reads anywhere.

## What the extension stores

All data is stored in the browser on your computer:

- **Settings and shortcuts** (`chrome.storage.local`): the options of the popup and the keyboard shortcuts.
- **Visited history** (`chrome.storage.local`): the albums and tracks you open or play, up to 50,000 entries.
- **Batch download state** (`chrome.storage.local`): the queue and the history of batch downloads, and whether a finished-batch notification is waiting.
- **File names of a batch download** (`chrome.storage.session`): the names of the files the extension is saving. This storage is kept only while the browser runs.

You can export your settings to a file from the popup. The file is saved where you choose. You can clear the visited history and reset all settings in the popup. Removing the extension removes its stored data.

## Network requests

- **Bandcamp pages**: the browser loads them as usual. The extension runs on them, but makes no requests of its own while it plays or highlights items.
- **Batch download**: the extension requests the Bandcamp download page of each selected item. It accepts only Bandcamp page addresses for this. Then it downloads the files from the links on those pages, through the browser's download function. Your browser sends these requests with its usual Bandcamp cookies. The extension does not read or store cookies.
- **Other links**: the GitHub page, the donation page, the Chrome Web Store reviews page and the Bandcamp home page open only when you click them.

The extension makes no other requests.

## Third parties

There are no analytics services, advertising services or third-party scripts. All code is in the extension package. The extension does not load remote code.

## Permissions

[LISTING.md](LISTING.md) explains what each permission is used for.

## Changes

If the extension starts to collect or send data, this policy will say so before the change is released.

## Contact

Report issues and ask questions on [GitHub](https://github.com/borbiuk/band-play/issues). Report security problems as described in [SECURITY.md](SECURITY.md).
