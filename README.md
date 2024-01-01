<br/>
<img src="./assets/logo.png" alt="band-play logo" style="height: 138px; margin-bottom: -40px;"/>

# Band Play

Band Play is a **Google Chrome extension** that enhances the music experience on [Bandcamp](https://bandcamp.com) by providing autoplay functionality and other automation features, allowing users to seamlessly control their music playback.

Check the [Chrome Web Store](https://chrome.google.com/webstore/detail/band-play/nooegmjcddclidfdlibmgcpaahkikmlh) page for more details.

<hr/>

## 🚀 Usage

To use the extension, simply navigate to a supported album/track or collection/wishlist page.

## ⌨️ Hotkeys

This extension supports fixed keyboard shortcuts (hotkeys) for quick and easy control over music playback:

- `Space bar`: Pause/Play the current track.
- `n`: Play the next track from the start.
- `b`: Play the previous track from the start.
- `m`: Play the next track, continuing with the previous track's progress.
- Digits from `0` to `9`: Play the current track with progress `(Digit * 10)%`.
- Shift + `0` to `9`: Play the track by index.
- `←` and `→` move track playback back or forward on `step` seconds.

Please note that customization of hotkeys is not available in the current version.

## 🛠️ Installation

1. Open the Google Chrome browser.
2. Navigate to `chrome://extensions/` and enable Developer Mode by toggling the switch in the top right corner.
3. Click on `Load unpacked` and select the directory of your cloned repository.
4. The extension should now appear in your list of installed extensions and is ready to use.

## 👩‍💻 Development

### File Structure

- `assets/`: Contains images and icons used by the extension.
- `popup/`: Contains HTML and JavaScript files used for popup of extension.
- `scripts/`: Contains the JavaScript files for background and content scripts.
- `LICENSE`: The license under which this extension is released.
- `manifest.json`: The Chrome extension manifest file.
- `publish.sh`: A script for building and packaging the extension for distribution.

## 🤝 Contributing

We welcome contributions! If you would like to contribute to this project, please:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes.
4. Push the branch to your fork.
5. Submit a pull request to the original repository.

For any issues or queries during installation or usage, refer to our [Issues Section](https://github.com/borbiuk/band-play/issues).

Your contributions and feedback are greatly appreciated!
