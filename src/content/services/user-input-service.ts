import { KeyCode } from '../../shared/enums/key-code';
import { PlaybackSpeedAction } from '../../shared/enums/playback-speed-action';
import { PageService } from '../../shared/interfaces/page-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { parseDigitCode } from '../../shared/utils/utils.keyboard-event';
import { PageServiceWorker } from './page-service-worker';

type KeyHandler = {
	[code in KeyCode]?: (service: PageService, event: KeyboardEvent) => void;
};

export class UserInputService {
	private readonly hotKeyHandlers: KeyHandler = {
		[KeyCode.Space]: (service: PageService) => service.playPause(),
		[KeyCode.KeyN]: (service: PageService) => service.playNextTrack(true),
		[KeyCode.KeyB]: (service: PageService) => service.playNextTrack(false),
		[KeyCode.KeyL]: (service: PageService) => service.addToWishlist(),
		[KeyCode.KeyO]: (service: PageService) => service.open(),
		[KeyCode.ArrowUp]: (service: PageService) =>
			service.speedPlayback(PlaybackSpeedAction.Increase),
		[KeyCode.ArrowDown]: (service: PageService) =>
			service.speedPlayback(PlaybackSpeedAction.Decrease),
		[KeyCode.ArrowRight]: (service: PageService) =>
			service.movePlayback(true),
		[KeyCode.ArrowLeft]: (service: PageService) =>
			service.movePlayback(false),
		[KeyCode.Digit]: (service: PageService, event: KeyboardEvent) => {
			const percentage = parseDigitCode(event) * 10;
			service.setPlayback(percentage);
		},
	};

	private readonly shiftHotKeyHandlers: KeyHandler = {
		[KeyCode.ArrowUp]: (service: PageService) =>
			service.speedPlayback(PlaybackSpeedAction.Reset),
		[KeyCode.ArrowDown]: (service: PageService) =>
			service.speedPlayback(PlaybackSpeedAction.Reset),
		[KeyCode.Digit]: (service: PageService, event: KeyboardEvent) => {
			const index = parseDigitCode(event) - 1;
			if (index >= 0) {
				service.playTrackByIndex(index);
			}
		},
	};

	constructor() {}

	public start(serviceWorker: PageServiceWorker): void {
		this.listenHotkeys(serviceWorker);
		this.listenNavigator(serviceWorker);
	}

	private listenHotkeys(serviceWorker: PageServiceWorker): void {
		document.addEventListener(
			'keydown',
			(event: KeyboardEvent) => {
				if (notExist(serviceWorker.pageService)) {
					return true;
				}

				const targetName = (event.target as HTMLElement)?.localName;
				if (
					['input', 'textarea'].includes(targetName) ||
					event.ctrlKey ||
					event.metaKey
				) {
					return true;
				}

				const key = event.code.startsWith(KeyCode.Digit)
					? KeyCode.Digit
					: event.code;

				const hotKeyHandled = event.shiftKey
					? this.shiftHotKeyHandlers[key]
					: this.hotKeyHandlers[key];

				if (exist(hotKeyHandled)) {
					event.preventDefault();
					hotKeyHandled(serviceWorker.pageService, event);
				}

				return true;
			},
			false
		);
	}

	private listenNavigator(serviceWorker: PageServiceWorker): void {
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
	}
}
