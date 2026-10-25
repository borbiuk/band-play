<p align="center"><img src="public/assets/logo.png" alt="Band Play logo" height="140"></p>

# Band Play

**Power up Bandcamp with keyboard shortcuts, media keys, speed and pitch control, autoplay and batch download of your purchases.** Lightweight, private and open source.

[![Build](https://github.com/borbiuk/band-play/actions/workflows/build.yml/badge.svg)](https://github.com/borbiuk/band-play/actions/workflows/build.yml)
[![Latest release](https://img.shields.io/github/v/release/borbiuk/band-play)](https://github.com/borbiuk/band-play/releases/latest)
[![License: MIT](https://img.shields.io/github/license/borbiuk/band-play)](LICENSE)

Browser extension for **Chrome** and **Firefox** 128 or newer.

## Why

Band Play is for listening on Bandcamp without moving the mouse:

- **Control the player from the keyboard**: shortcuts for play, pause, next and previous track, seek and loop, plus the media keys of your keyboard or headset.
- **Change the speed and the pitch**: in 1% steps, with or without pitch preservation.
- **Download your purchases in one batch**: pick the format, and skip the releases you already have.

## Features

- **Playback**: keyboard shortcuts, media keys, speed and pitch, a seek step of 1 to 120 seconds, loop track.
- **Automation**: autoplay of the next track, autoscroll, Keep Awake (Chrome).
- **Pages**: a mark for the albums and tracks you already opened, a feed player, open in a new tab, wishlist.
- **Batch download**: MP3, FLAC, AAC, Ogg Vorbis, ALAC, WAV and AIFF, with a downloads page that shows the progress.

The full list, the keyboard shortcuts and the supported pages are in [docs/usage.md](docs/usage.md).

## Install

- **Chrome**: from the [Chrome Web Store](https://chromewebstore.google.com/detail/nooegmjcddclidfdlibmgcpaahkikmlh).
- **Firefox**: build the extension from this repository, see [Installation](docs/development.md#installation).

## Privacy

Band Play collects no data. It has no analytics and no servers of its own. Your settings, your visited history and your download history stay in your browser. The only requests go to Bandcamp, and only for batch download. The full policy is in [PRIVACY.md](PRIVACY.md).

## Documentation

- [Usage](docs/usage.md): features, keyboard shortcuts, supported pages and the settings popup.
- [Development](docs/development.md): setup, npm scripts, tests, CI, releases and the file structure.
- [Contributing](.github/CONTRIBUTING.md), [Support](.github/SUPPORT.md), [Security](SECURITY.md), [Privacy](PRIVACY.md) and [release notes](RELEASE_NOTES.md).

## License

MIT. See [LICENSE](LICENSE).
