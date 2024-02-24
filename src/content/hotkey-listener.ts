import { isHotKey, notExist } from '../shared/utils';
import { PageServiceWorker } from './page-service-worker';

export const listenHotkeys = (serviceWorker: PageServiceWorker) => {
	document.addEventListener(
		'keydown',
		(event: KeyboardEvent) => {
			if (!isHotKey(event)) {
				return true;
			}

			event.preventDefault();

			if (notExist(serviceWorker.service)) {
				return true;
			}

			if (event.code === 'Space') {
				// Play/Pause current track on the 'Space' keydown
				serviceWorker.service.playPause();
			} else if (event.code === 'KeyN') {
				// Play the next track on the 'N' keydown
				serviceWorker.service.playNextTrack(true);
			} else if (event.code === 'KeyB') {
				// Play the next track on the 'N' keydown
				serviceWorker.service.playNextTrack(false);
			} else if (event.code === 'KeyM') {
				// Play the next track with currently played percentage on the 'M' keydown
				serviceWorker.service.playNextTrackWithPercentage();
			} else if (event.code === 'KeyL') {
				serviceWorker.service.addToWishlist();
			} else if (event.code.startsWith('Digit')) {
				if (event.shiftKey) {
					const index = Number(event.code.split('Digit')[1]) - 1;
					if (index >= 0) {
						serviceWorker.service.play(index);
					}

					return;
				}

				// Play the current track with percentage on the 'Digit' keydown
				const percentage = Number(event.code.split('Digit')[1]) * 10;
				serviceWorker.service.playPercentage(percentage);
			} else if (event.code === 'ArrowRight') {
				serviceWorker.service.move(true);
			} else if (event.code === 'ArrowLeft') {
				serviceWorker.service.move(false);
			} else if (event.code === 'KeyO') {
				serviceWorker.service.open();
			}

			return true;
		},
		false
	);
}
