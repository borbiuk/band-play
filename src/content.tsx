import { ConfigService } from './common/config-service';
import { MessageCode } from './common/message-code';
import { isHotKey, notExist } from './common/utils';
import { Config } from './contracts/config';
import { Service } from './contracts/service';
import { Album } from './services/album';
import { Collection } from './services/collection';
import { Discover } from './services/discover';
import { Feed } from './services/feed';

const configService = new ConfigService();

const services = [new Album(), new Discover(), new Feed(), new Collection()];

let config: Config;
let service: Service = null;

// Get the object to handle current page functionality.
const currentService = () => {
	const url = window.location.href;
	return services.find((x) => x.checkUrl(url));
};

// Main function to start the application.
const main = async () => {
	console.log('[Start]: Band Play');

	config = await configService.getAll();

	// Main execution loop for track playback and initialization
	setInterval(() => {
		try {
			service = currentService();
			if (notExist(service)) {
				return;
			}

			service.config = config;

			if (config.autoplay) {
				service.tryAutoplay();
			}
		} catch (e) {
			console.log(e);
		}
	}, 300);

	// Initialization loop to refresh tracks periodically
	currentService()?.initTracks();
	setInterval(() => {
		try {
			currentService()?.initTracks();
		} catch (e) {
			console.log(e);
		}
	}, 1_000);
};

main().catch((e) => {
	console.error(e);
});

/*
	Background.
*/

// Event listeners for keyboard shortcuts.
document.addEventListener(
	'keydown',
	(event: KeyboardEvent) => {
		if (
			(event.target as HTMLElement)?.localName === 'input' ||
			!isHotKey(event)
		) {
			return true;
		}

		event.preventDefault();

		if (notExist(service)) {
			return true;
		}

		if (event.code === 'Space') {
			// Play/Pause current track on the 'Space' keydown
			service.playPause();
		} else if (event.code === 'KeyN') {
			// Play the next track on the 'N' keydown
			service.playNextTrack(true);
		} else if (event.code === 'KeyB') {
			// Play the next track on the 'N' keydown
			service.playNextTrack(false);
		} else if (event.code === 'KeyM') {
			// Play the next track with currently played percentage on the 'M' keydown
			service.playNextTrackWithPercentage();
		} else if (event.code.startsWith('Digit')) {
			if (event.shiftKey) {
				const index = Number(event.code.split('Digit')[1]) - 1;
				if (index >= 0) {
					service.play(index);
				}

				return;
			}

			// Play the current track with percentage on the 'Digit' keydown
			const percentage = Number(event.code.split('Digit')[1]) * 10;
			service.playPercentage(percentage);
		} else if (event.code === 'ArrowRight') {
			service.move(true);
		} else if (event.code === 'ArrowLeft') {
			service.move(false);
		} else if (event.code === 'KeyO') {
			service.open();
		}

		return true;
	},
	false
);

// Event listeners for Chrome messages.
chrome.runtime.onMessage.addListener(
	async (message, _sender, _sendResponse) => {
		if (notExist(message?.code)) {
			return;
		}

		// clear data on URL change message
		if (message.code === MessageCode.UrlChanged) {
			service = currentService();
			service.config = config;
			service.tracks = [];
			service.initTracks();

			return;
		}

		if (message.code === MessageCode.StorageChanged) {
			config = await configService.getAll();
			return;
		}

		if (message.code === MessageCode.Log) {
			console.log(message.data);

			return;
		}

		if (message.code === MessageCode.ShowUpdate) {
			alert(
				`New update available! Version: ${message.data.details.version}\n\nCheck extension page in Chrome Web Store:\n\nhttps://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh`
			);
		}
	}
);
