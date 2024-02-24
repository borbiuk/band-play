import { exist, isHotKey, notExist } from '../shared/utils';
import { PageServiceWorker } from './page-service-worker';

const handleHotkey = ({ code, shiftKey }: KeyboardEvent, serviceWorker: PageServiceWorker) => {
	if (code === 'Space') {
		// Play/Pause current track on the 'Space' keydown
		serviceWorker.service.playPause();
	} else if (code === 'KeyN') {
		// Play the next track on the 'N' keydown
		serviceWorker.service.playNextTrack(true);
	} else if (code === 'KeyB') {
		// Play the next track on the 'N' keydown
		serviceWorker.service.playNextTrack(false);
	} else if (code === 'KeyM') {
		// Play the next track with currently played percentage on the 'M' keydown
		serviceWorker.service.playNextTrackWithPercentage();
	} else if (code === 'KeyL') {
		serviceWorker.service.addToWishlist();
	} else if (code.startsWith('Digit')) {
		if (shiftKey) {
			const index = Number(code.split('Digit')[1]) - 1;
			if (index >= 0) {
				serviceWorker.service.play(index);
			}

			return;
		}

		// Play the current track with percentage on the 'Digit' keydown
		const percentage = Number(code.split('Digit')[1]) * 10;
		serviceWorker.service.playPercentage(percentage);
	} else if (code === 'ArrowRight') {
		serviceWorker.service.move(true);
	} else if (code === 'ArrowLeft') {
		serviceWorker.service.move(false);
	} else if (code === 'KeyO') {
		serviceWorker.service.open();
	}
}

export const listenHotkeys = (serviceWorker: PageServiceWorker) => {
	document.addEventListener(
		'keydown',
		(event: KeyboardEvent) => {
			if (exist(serviceWorker.service) && isHotKey(event)) {
				event.preventDefault();
				handleHotkey(event, serviceWorker);
			}

			return true;
		},
		false
	);
};
