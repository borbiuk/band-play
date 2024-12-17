import { PlaybackPitchAction } from '../../shared/enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../../shared/enums/playback-speed-action';
import { PageService } from '../../shared/interfaces/page-service';
import { ConfigModel, ShortcutConfig } from '../../shared/models/config-model';
import configService from '../../shared/services/config-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { ShortcutHandler } from '../shortcut/shortcut-handler';
import { ShortcutSet } from '../shortcut/shortcut-set';
import { ShortcutType } from '../shortcut/shortcut-type';
import { PageServiceWorker } from './page-service-worker';

export class UserInputService {
	constructor() {}

	public start(serviceWorker: PageServiceWorker): void {
		this.listenHotkeys(serviceWorker);
		this.listenNavigator(serviceWorker);

		const updateShortcutHandlers = (x: ShortcutConfig) => {
			this.updateShortcutHandlers(x);
		};

		configService
			.get<ShortcutConfig>('shortcuts')
			.then(updateShortcutHandlers);
		configService.addListener(({ shortcuts }: ConfigModel) =>
			updateShortcutHandlers(shortcuts)
		);
	}

	private updateShortcutHandlers(shortcuts: ShortcutConfig) {
		Object.keys(shortcuts).forEach((key) => {
			const shortcutHandler = this.shortcutHandlers.find(
				({ type }) => type === key
			);
			if (exist(shortcutHandler)) {
				shortcutHandler.combination = JSON.parse(shortcuts[key]);
			}
		});
	}

	private listenHotkeys(serviceWorker: PageServiceWorker): void {
		const keysPressed = new ShortcutSet();
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			const targetName = (event.target as HTMLElement)?.localName;
			if (['input', 'textarea'].includes(targetName)) {
				return;
			}

			const isShortcut = this.shortcutHandlers.some(({ set }) =>
				set.has(event.code)
			);
			if (!isShortcut) {
				return;
			}

			event.preventDefault();

			keysPressed.add(event.code);
		});
		document.addEventListener('keyup', (event: KeyboardEvent) => {
			if (keysPressed.size === 0) {
				return;
			}

			const targetName = (event.target as HTMLElement)?.localName;
			if (['input', 'textarea'].includes(targetName)) {
				return;
			}

			event.preventDefault();

			this.handleShortcut(serviceWorker, keysPressed, event);
			keysPressed.clear();
		});
	}

	private handleShortcut(
		serviceWorker: PageServiceWorker,
		keysPressed: ShortcutSet,
		event: KeyboardEvent
	): void {
		if (notExist(serviceWorker.pageService)) {
			return;
		}

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
		new ShortcutHandler(ShortcutType.SeekBackward, (service: PageService) =>
			service.seekForward(false)
		),
		new ShortcutHandler(ShortcutType.SeekForward, (service: PageService) =>
			service.seekForward(true)
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
			ShortcutType.SeekToPercentage,
			(service: PageService, shortcut) =>
				service.seekToPercentage(shortcut.digit * 10)
		),
		new ShortcutHandler(
			ShortcutType.PlayTrackByIndex,
			(service: PageService, shortcut) =>
				service.playTrackByIndex(shortcut.digit - 1)
		),
		new ShortcutHandler(ShortcutType.LoopTrack, (service: PageService) =>
			configService.update('loopTrack', !service.config.loopTrack)
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
		const { mediaSession } = navigator;

		// Playlist control:
		mediaSession.setActionHandler('nexttrack', () => {
			serviceWorker.pageService.playNextTrack(true);
		});
		mediaSession.setActionHandler('previoustrack', () => {
			serviceWorker.pageService.playNextTrack(false);
		});

		// Playback control:
		mediaSession.setActionHandler('seekforward', () => {
			serviceWorker.pageService.seekForward(true);
		});
		mediaSession.setActionHandler('seekbackward', () => {
			serviceWorker.pageService.seekForward(false);
		});
		mediaSession.setActionHandler(
			'seekto',
			(details: MediaSessionActionDetails) => {
				serviceWorker.pageService.audioOperator(
					(audio: HTMLAudioElement) => {
						if (details.fastSeek) {
							audio.fastSeek(details.seekTime);
						} else {
							audio.currentTime = details.seekTime;
						}
					}
				);
			}
		);

		// Play/Pause:
		mediaSession.setActionHandler('play', () => {
			serviceWorker.pageService.playPause();
		});
		mediaSession.setActionHandler('pause', () => {
			serviceWorker.pageService.playPause();
		});
	}
}
