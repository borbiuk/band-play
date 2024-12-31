<br/>
<div style="width: 100%; display: flex; flex-direction: column; align-items: center; background: linear-gradient(to right, #2b809d, #1d5669, #2b809d); padding: 20px; border-radius: 15px; margin: 10px 0;">
    <img src="./public/assets/logo.png" alt="band-play logo" style="height: 140px; margin-bottom: -20px; border-radius: 10px;" />
    <h1 style="margin-top: 10px; margin-bottom: -8px; color: rgb(17 24 39); font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Band Play</h1>
</div>

Band Play is a **Google Chrome extension** that enhances the music experience on [Bandcamp](https://bandcamp.com) by
providing autoplay functionality and other automation features, allowing users to seamlessly control their music
playback.

Check the [Chrome Web Store](https://chrome.google.com/webstore/detail/band-play/nooegmjcddclidfdlibmgcpaahkikmlh) page
for more details.

<hr/>

## 🚀 Usage

To use the extension, simply navigate to a supported pages:

- Feed
- Discover
- Collection/Wishlist
- Album/Track

### ⌨️ Hotkeys

This extension supports fixed keyboard shortcuts (hotkeys) for quick and easy control over music playback:

|       Key       | Description                                                         |
| :-------------: | ------------------------------------------------------------------- |
|     `Space`     | Pause/Play the current track                                        |
|       `N`       | Play the next Track                                                 |
|       `B`       | Play the previous Track                                             |
|       `O`       | Open the current Track in new tab                                   |
|       `P`       | Enable or disable auto pitch (usable whe playback speed is changed) |
|   `Shift`+`O`   | Reset auto pitch                                                    |
|   `Shift`+`O`   | Open the current Track in new tab and focus on it                   |
|       `L`       | Add or Remove Track from wishlist                                   |
|      `0-9`      | Play the current track with progress `(Digit * 10)%` \*             |
|  `Shift`+`0-9`  | Play the track by index                                             |
|     `←` `→`     | Move track playback back or forward on `step` seconds               |
|     `↑` `↓`     | Increase or decrease track playback speed on `3.03%` \*\*           |
| `Shift`+`↑`/`↓` | Reset track playback speed                                          |

1. \* For example, pressing key `3` will set the track playback to `30%` of all duration.
2. \*\* the same as one rotation of a vinyl per minute.

Please note that customization of hotkeys is not available in the current version.

<hr/>

## 👩‍💻 Development

### 🛠️ Installation

1. Open the Google Chrome browser.
2. Navigate to `chrome://extensions/` and enable Developer Mode by toggling the switch in the top right corner.
3. Run `npm install` in the root of repository.
4. Run `npm run build` in the root of repository.
5. Click on `Load unpacked` and select the `dist` directory created after previous step.
6. The extension should now appear in your list of installed extensions and is ready to use.

### 📁 File Structure

- `public/`: Contains `manifest.json`, images and icons used by the extension.
- `src/`:
    - `background/background.ts`: Contains the TypeScript files for background script (single instance for Chrome).
    - `content/`:
        - `guide/`: Contains Guide React component.
        - `page-services/` Contains services for handling different pages of site.
        - `services/` Contains core services.
        - `content.ts`: The TypeScript file for content script (running on each site page).
    - `options/`: Contains extension pop-up React component.
    - `shared/`: Contains shared models and utils
- `webpack/`: Configuration of webpack for different type od builds.
- `zip.sh`: A script for creating a `.zip` file with build for publishing.

### 🤝 Contributing

We welcome contributions! If you would like to contribute to this project, please:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes.
4. Push the branch to your fork.
5. Submit a pull request to the original repository.

For any issues or queries during installation or usage, refer to
our [Issues Section](https://github.com/borbiuk/band-play/issues).

Your contributions and feedback are greatly appreciated!
