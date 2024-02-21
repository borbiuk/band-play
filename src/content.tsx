import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigService } from './common/config-service';
import { MessageService } from './common/message-service';
import { isHotKey, notExist } from './common/utils';
import { Message } from './contracts/message';
import { MessageCode } from './contracts/message-code';
import { Service } from './contracts/service';
import { Album } from './services/album';
import { Collection } from './services/collection';
import { Discover } from './services/discover';
import { Feed } from './services/feed';
import { Guide } from './guide/guide';

const services = [new Album(), new Discover(), new Feed(), new Collection()];

const configService = new ConfigService();
const messageService = new MessageService();

let service: Service = null;

// Get the object to handle current page functionality.
const currentService = () => {
	const url = window.location.href;
	return services.find((x) => x.checkUrl(url));
};

// Main function to start the application.
const main = async () => {
	console.log('[Start]: Band Play');

	service = currentService();
	service.config = await configService.getAll();
	configService.addListener((newConfig) => {
		service.config = newConfig;
	});

	// Main execution loop for track playback and initialization
	setInterval(() => {
		if (!service?.config.autoplay) {
			return;
		}

		try {
			service?.tryAutoplay();
		} catch (e) {
			console.log(e);
		}
	}, 300);

	// Initialization loop to refresh tracks periodically
	service?.initTracks();
	setInterval(() => {
		try {
			service?.initTracks();
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
		if (!isHotKey(event)) {
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
		} else if (event.code === 'KeyL') {
			service.addToWishlist();
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
messageService.addListener(
	async (message: Message<any>) => {
		if (notExist(message?.code)) {
			return;
		}

		// clear data on URL change message
		if (message.code === MessageCode.UrlChanged) {
			service = currentService();
			service.tracks = [];
			service.initTracks();

			return;
		}

		if (message.code === MessageCode.NewUpdateAvailable) {
			alert(
				`New update available! Version: ${message.data.version}\n\nCheck extension page in Chrome Web Store:\n\nhttps://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh`
			);
		}
	},
	(error: Error) => console.error(error)
);

// guide
const mountGuideWindow = () => {
	const guideContainerId = 'band-play_guide-container';
	const guideContainer = document.createElement('div');
	guideContainer.id = guideContainerId;
	document.body.append(guideContainer)

	const root = createRoot(document.getElementById(guideContainerId));
	root.render(
		<React.StrictMode>
			<Guide />
		</React.StrictMode>
	);
};

mountGuideWindow();


