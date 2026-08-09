<br/>
<div style="width: 100%; display: flex; flex-direction: column; align-items: center; background: linear-gradient(to right, #2b809d, #1d5669, #2b809d); padding: 20px; border-radius: 15px; margin: 10px 0;">
    <img src="./public/assets/logo.png" alt="band-play logo" style="height: 140px; margin-bottom: -20px; border-radius: 10px;" />
    <h1 style="margin-top: 10px; margin-bottom: -8px; color: rgb(17 24 39); font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Band Play</h1>
</div>

Band Play is a **Google Chrome extension** that enhances the music experience on [Bandcamp](https://bandcamp.com)
by providing advanced playback controls, tempo adjustment, pitch preservation,
keyboard shortcuts, autoplay functionality, batch downloads, and other automation features for seamless music control.

Check the [Chrome Web Store](https://chrome.google.com/webstore/detail/band-play/nooegmjcddclidfdlibmgcpaahkikmlh) page
for more details.

<hr/>

## ✨ Features

### 🎵 **Playback Control**

- **Advanced Speed Control**: Adjust playback speed with 3.03% increments
- **Pitch Preservation**: Maintain audio pitch when changing speed
- **Customizable Seek Step**: Configurable forward/backward seeking (1-120 seconds)
- **Progress Jumping**: Quick navigation to any point in track

### 🔄 **Automation**

- **Autoplay**: Automatic progression through playlists and collections
- **Autoscroll**: Auto-scroll to currently playing track
- **Keep Awake**: Prevent system sleep during playback
- **Smart Detection**: Automatic page type recognition

### 🎛️ **Advanced Features**

- **Feed Player**: Custom player interface for Bandcamp feed pages
- **Batch Download**: Quickly select multiple purchases to download in bulk

### 🎹 **Keyboard Shortcuts**

| Feature               | Description                                  | Key    |
| --------------------- | -------------------------------------------- | ------ |
| **Play/Pause**        | Quick control to play or pause current track | ␣      |
| **Next Track**        | Play the next track in playlist              | 🇳      |
| **Previous Track**    | Play the previous track in playlist          | 🇧      |
| **Track by Index**    | Play specific track by number (0-9)          | ⇧ + 🔢 |
| **Loop Track**        | Toggle looping of current track              | ⇧ + 🇻  |
| **Seek Forward**      | Move playback forward by step seconds \*\*   | ➡️     |
| **Seek Backward**     | Move playback backward by step seconds \*\*  | ⬅️     |
| **Speed Increase**    | Increase playback speed by 3.03% \*\*\*      | ⬆️     |
| **Speed Decrease**    | Decrease playback speed by 3.03% \*\*\*      | ⬇️     |
| **Reset Speed**       | Reset playback speed to normal               | ⇧ + ⬇️ |
| **Auto Pitch Toggle** | Enable/disable pitch preservation            | 🇵      |
| **Reset Auto Pitch**  | Reset auto pitch settings                    | ⇧ + 🇵  |
| **Progress Control**  | Jump to specific percentage (0-90%) \*       | 🔢     |
| **Open in New Tab**   | Open current track in new browser tab        | 🇴      |
| **Open with Focus**   | Open track in new tab and focus on it        | ⇧ + 🇴  |
| **Wishlist Toggle**   | Add/remove track from wishlist               | 🇱      |

1. \* For example, pressing key `3` will set the track playback to `30%` of all duration.
2. \*\* You can change a `step` value in the menu.
3. \*\*\* The same as one rotation of a vinyl per minute.

<hr/>

## 📄 Supported Pages

| Page Type               | Features                      | Description                                |
| ----------------------- | ----------------------------- | ------------------------------------------ |
| **Feed**                | All features + Feed Player    | Custom player interface with full controls |
| **Discover**            | All features                  | Browse and play new music                  |
| **Collection/Wishlist** | All features + Batch Download | Manage your music library                  |
| **Album/Track**         | All features                  | Individual album and track pages           |

<hr/>

## 👩‍💻 Development

### 🛠️ Installation

1. Open the Google Chrome browser.
2. Navigate to `chrome://extensions/` and enable Developer Mode by toggling the switch in the top right corner.
3. Run `npm install` in the root of repository.
4. Run `npm run build` in the root of repository.
5. Click on `Load unpacked` and select the `dist` directory created after previous step.
6. The extension should now appear in your list of installed extensions and is ready to use.

### 📁 **File Structure**

- `public/`: Contains `manifest.json`, images and icons used by the extension.
- `src/`:
    - `background/`:
        - `batch-download/`: Contains the batch download queue (state, runner, actions).
        - `services/`: Contains background services (messages, keep-awake, update, URL change).
        - `background.ts`: The TypeScript file for background script (single service worker instance for Chrome).
    - `content/`:
        - `components/`: Contains React components injected into Bandcamp pages.
        - `page-services/`: Contains services for handling different pages of site.
        - `services/`: Contains core services.
        - `shortcut/`: Contains keyboard shortcut handling.
        - `content.ts`: The TypeScript file for content script (running on each site page).
    - `downloads/`: Contains the batch download manager page.
    - `options/`: Contains extension pop-up React component.
    - `shared/`: Contains shared components, models, enums, interfaces, services and utils.
- `webpack/`: Configuration of webpack for different type of builds.
- `scripts/`: Maintenance scripts (e.g. `tag-releases.sh` for tagging released versions).
- `.github/workflows/`: CI configuration (build + lint on pushes and pull requests to `master`).
- `.claude/`: Agent context for AI-assisted development (rules, skills, commands), see [AGENTS.md](AGENTS.md).
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
