import { exist } from '../shared/utils/utils.common';
import { PageServiceWorker } from './page-service-worker';

// Function to define that keyboard event should be handled as hotkey of extension.
const isHotKey = (event: KeyboardEvent): boolean => {
	const targetName = (event.target as HTMLElement)?.localName;
	if (
		['input', 'textarea'].includes(targetName) ||
		event.ctrlKey ||
		event.metaKey
	) {
		return false;
	}

	if (event.shiftKey) {
		return event.code.startsWith('Digit');
	} else {
		return (
			event.code.startsWith('Digit') ||
			[
				'Space',
				'KeyN',
				'KeyB',
				'KeyM',
				'KeyL',
				'ArrowRight',
				'ArrowLeft',
				'KeyO',
			].includes(event.code)
		);
	}
};

const handleHotkey = (
	{ code, shiftKey }: KeyboardEvent,
	serviceWorker: PageServiceWorker
) => {
	if (code === 'Space') {
		// Play/Pause current track on the 'Space' keydown
		serviceWorker.pageService.playPause();
	} else if (code === 'KeyN') {
		// Play the next track on the 'N' keydown
		serviceWorker.pageService.playNextTrack(true);
	} else if (code === 'KeyB') {
		// Play the next track on the 'N' keydown
		serviceWorker.pageService.playNextTrack(false);
	} else if (code === 'KeyL') {
		serviceWorker.pageService.addToWishlist();
	} else if (code.startsWith('Digit')) {
		if (shiftKey) {
			const index = Number(code.split('Digit')[1]) - 1;
			if (index >= 0) {
				serviceWorker.pageService.playTrackByIndex(index);
			}

			return;
		}

		// Play the current track with percentage on the 'Digit' keydown
		const percentage = Number(code.split('Digit')[1]) * 10;
		serviceWorker.pageService.setPlayback(percentage);
	} else if (code === 'ArrowRight') {
		serviceWorker.pageService.movePlayback(true);
	} else if (code === 'ArrowLeft') {
		serviceWorker.pageService.movePlayback(false);
	} else if (code === 'KeyO') {
		serviceWorker.pageService.open();
	}
};

export const listenHotkeys = (serviceWorker: PageServiceWorker): void => {
	document.addEventListener(
		'keydown',
		(event: KeyboardEvent) => {
			if (exist(serviceWorker.pageService) && isHotKey(event)) {
				event.preventDefault();
				handleHotkey(event, serviceWorker);
			}

			return true;
		},
		false
	);
};

export const listenNavigator = (serviceWorker: PageServiceWorker): void => {
	navigator.mediaSession.setActionHandler('play', () => {
		serviceWorker.pageService.playPause();
	});

	navigator.mediaSession.setActionHandler('pause', () => {
		serviceWorker.pageService.playPause();
	});

	navigator.mediaSession.setActionHandler('nexttrack', () => {
		serviceWorker.pageService.playNextTrack(true);
	});

	navigator.mediaSession.setActionHandler('previoustrack', () => {
		serviceWorker.pageService.playNextTrack(false);
	});
};
