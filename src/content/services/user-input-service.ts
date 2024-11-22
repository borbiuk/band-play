import { PlaybackPitchAction } from '../../shared/enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../../shared/enums/playback-speed-action';
import { PageService } from '../../shared/interfaces/page-service';
import { ConfigModel } from '../../shared/models/config-model';
import { ConfigService } from '../../shared/services/config-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { ShortcutHandler } from '../shortcut/shortcut-handler';
import { ShortcutSet } from '../shortcut/shortcut-set';
import { ShortcutType } from '../shortcut/shortcut-type';
import { PageServiceWorker } from './page-service-worker';

export class UserInputService {
	constructor(private readonly configService: ConfigService) {}

	public start(serviceWorker: PageServiceWorker): void {
		this.listenHotkeys(serviceWorker);
		this.listenNavigator(serviceWorker);

		const updateShortcutHandlers = (x: ConfigModel) => {
			this.updateShortcutHandlers(x);
		};

		this.configService.getAll().then(updateShortcutHandlers);
		this.configService.addListener(updateShortcutHandlers);
	}

	private updateShortcutHandlers(newConfig: ConfigModel) {
		Object.keys(newConfig.shortcuts).forEach((key) => {
			const shortcutHandler = this.shortcutHandlers.find(
				({ type }) => type === key
			);
			if (exist(shortcutHandler)) {
				shortcutHandler.combination = JSON.parse(
					newConfig.shortcuts[key]
				);
			}
		});
	}

	private listenHotkeys(serviceWorker: PageServiceWorker): void {
		const keysPressed = new ShortcutSet();
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			keysPressed.add(event.code);

			const isShortcut = this.shortcutHandlers.some(({ set }) =>
				set.has(event.code)
			);

			if (isShortcut) {
				event.preventDefault();
			}
		});
		document.addEventListener('keyup', (event: KeyboardEvent) => {
			if (keysPressed.size === 0) {
				return;
			}

			const targetName = (event.target as HTMLElement)?.localName;
			if (['input', 'textarea'].includes(targetName)) {
				return;
			}

			this.handleShortcut(serviceWorker, keysPressed, event);

			keysPressed.clear();
		});
	}

	private handleShortcut(
		serviceWorker: PageServiceWorker,
		keysPressed: ShortcutSet,
		event: KeyboardEvent
	): void {
		const shortcut = this.shortcutHandlers.find((x) =>
			x.set.equal(keysPressed)
		);
		if (notExist(shortcut)) {
			return;
		}

		event.preventDefault();
		shortcut.handle(serviceWorker.pageService, keysPressed);
	}

	private shortcutHandlers: ShortcutHandler[] = [
		new ShortcutHandler(
			ShortcutType.PlaybackSpeedIncrease,
			(service: PageService) =>
				service.speedPlayback(PlaybackSpeedAction.Increase)
		),
		new ShortcutHandler(
			ShortcutType.PlaybackSpeedDecrease,
			(service: PageService) =>
				service.speedPlayback(PlaybackSpeedAction.Decrease)
		),
		new ShortcutHandler(
			ShortcutType.PlaybackSpeedReset,
			(service: PageService) =>
				service.speedPlayback(PlaybackSpeedAction.Reset)
		),
		new ShortcutHandler(
			ShortcutType.MovePlaybackBackward,
			(service: PageService) => service.movePlayback(false)
		),
		new ShortcutHandler(
			ShortcutType.MovePlaybackForward,
			(service: PageService) => service.movePlayback(true)
		),
		new ShortcutHandler(ShortcutType.PlayPause, (service: PageService) =>
			service.playPause()
		),
		new ShortcutHandler(
			ShortcutType.PreviousTrack,
			(service: PageService) => service.playNextTrack(false)
		),
		new ShortcutHandler(ShortcutType.NextTrack, (service: PageService) =>
			service.playNextTrack(true)
		),
		new ShortcutHandler(
			ShortcutType.AddToWishlist,
			(service: PageService) => service.addToWishlist()
		),
		new ShortcutHandler(ShortcutType.OpenInNewTab, (service: PageService) =>
			service.open(false)
		),
		new ShortcutHandler(
			ShortcutType.OpenInNewTabWithFocus,
			(service: PageService) => service.open(true)
		),
		new ShortcutHandler(
			ShortcutType.SetPlaybackProgress,
			(service: PageService, shortcut) =>
				service.setPlayback(shortcut.digit * 10)
		),
		new ShortcutHandler(
			ShortcutType.PlayTrackByIndex,
			(service: PageService, shortcut) =>
				service.playTrackByIndex(shortcut.digit - 1)
		),
		new ShortcutHandler(
			ShortcutType.AutoPitchSwitch,
			(service: PageService) =>
				service.switchPreservesPitch(PlaybackPitchAction.Switch)
		),
		new ShortcutHandler(
			ShortcutType.AutoPitchReset,
			(service: PageService) =>
				service.switchPreservesPitch(PlaybackPitchAction.Reset)
		),
	];

	private listenNavigator(serviceWorker: PageServiceWorker): void {
		const pageService: PageService = serviceWorker.pageService;

		navigator.mediaSession.setActionHandler('play', () => {
			pageService.playPause();
		});

		navigator.mediaSession.setActionHandler('pause', () => {
			pageService.playPause();
		});

		navigator.mediaSession.setActionHandler('nexttrack', () => {
			pageService.playNextTrack(true);
		});

		navigator.mediaSession.setActionHandler('previoustrack', () => {
			pageService.playNextTrack(false);
		});
	}
}
