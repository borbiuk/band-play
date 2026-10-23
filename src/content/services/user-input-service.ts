import {
	PlaybackPitchAction,
	PlaybackSpeedAction,
	ShortcutType,
} from '@shared/enums';
import { PageService } from '@shared/interfaces';
import { ConfigModel, ShortcutConfig } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { exist, notExist } from '@shared/utils';

import { ShortcutHandler } from '../shortcut/shortcut-handler';
import { ShortcutSet } from '../shortcut/shortcut-set';

import { PageServiceWorker } from './page-service-worker';

/** Physical modifier keys (`event.code`). */
const MODIFIER_CODES = [
	'ShiftLeft',
	'ShiftRight',
	'ControlLeft',
	'ControlRight',
	'AltLeft',
	'AltRight',
	'MetaLeft',
	'MetaRight',
];

/** Elements Bandcamp uses for typing besides the standard form fields. */
const BANDCAMP_INPUT_ELEMENTS = ['menu-bar'];

/**
 * True when the key press belongs to typing: a text field, a select, an editable element,
 * an input method composing text, or a key the page already handled.
 */
const isTypingEvent = (event: KeyboardEvent): boolean => {
	if (event.isComposing || event.defaultPrevented) {
		return true;
	}

	// The first element of the path is the real target, also inside shadow DOM
	const target = event.composedPath()[0];
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	if (target.isContentEditable) {
		return true;
	}

	return (
		['input', 'textarea', 'select'].includes(target.localName) ||
		BANDCAMP_INPUT_ELEMENTS.includes(target.localName)
	);
};

/** The pressed combination: every held modifier plus the main key. */
const toShortcutSet = (event: KeyboardEvent): ShortcutSet => {
	const keys = new ShortcutSet();
	if (event.ctrlKey) {
		keys.add('Control');
	}

	if (event.metaKey) {
		keys.add('Meta');
	}

	if (event.altKey) {
		keys.add('Alt');
	}

	if (event.shiftKey) {
		keys.add('Shift');
	}

	keys.add(event.code);
	return keys;
};

/**
 * Service for handling user input and keyboard shortcuts.
 *
 * This class manages:
 * - Keyboard shortcut detection and handling
 * - Navigation between tracks and pages
 * - Configuration updates for shortcuts
 * - Integration with page services for command execution
 */
export class UserInputService {
	/**
	 * Starts the user input service with the given page service worker.
	 * Sets up keyboard listeners and configuration updates.
	 *
	 * @param serviceWorker - The page service worker to integrate with
	 */
	public start(serviceWorker: PageServiceWorker): Promise<void> {
		this.listenHotkeys(serviceWorker);
		this.listenNavigator(serviceWorker);

		const updateShortcutHandlers = (x: ShortcutConfig) => {
			this.updateShortcutHandlers(x);
		};

		configService.addListener(({ shortcuts }: ConfigModel) =>
			updateShortcutHandlers(shortcuts)
		);
		return configService
			.get<ShortcutConfig>('shortcuts')
			.then(updateShortcutHandlers)
			.catch((e) => console.error(e));
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
		// The shortcut runs on keydown: macOS sends no keyup for a key pressed with Cmd
		document.addEventListener(
			'keydown',
			(event: KeyboardEvent) => {
				if (isTypingEvent(event)) {
					return;
				}

				// A lone modifier is never a shortcut; it is left to the page and the browser
				if (MODIFIER_CODES.includes(event.code)) {
					return;
				}

				// Pages without a page service keep their keys (arrows and Space scroll)
				const service = serviceWorker.pageService;
				if (notExist(service)) {
					return;
				}

				const keys = toShortcutSet(event);
				const handler = this.shortcutHandlers.find(
					({ set }) => exist(set) && set.equal(keys)
				);
				if (notExist(handler)) {
					return;
				}

				// Only a full match is taken from the page (Ctrl+P stays print)
				event.preventDefault();
				// A held key runs the shortcut once, as before
				if (event.repeat) {
					return;
				}

				handler.handle(service, keys);
			},
			{ capture: true }
		);
	}

	private readonly shortcutHandlers: ShortcutHandler[] = [
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
		new ShortcutHandler(ShortcutType.LoopTrack, (service: PageService) => {
			configService
				.update('loopTrack', !service.config.loopTrack)
				.catch((e) => console.error(e));
		}),
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

		// Media keys work only on pages with a page service; elsewhere they do
		// nothing (the handlers replace the browser's own media key handling)
		const withService =
			(action: (service: PageService) => void) => (): void => {
				const service = serviceWorker.pageService;
				if (notExist(service)) {
					return;
				}

				action(service);
			};

		// Playlist control:
		mediaSession.setActionHandler(
			'nexttrack',
			withService((service) => service.playNextTrack(true))
		);
		mediaSession.setActionHandler(
			'previoustrack',
			withService((service) => service.playNextTrack(false))
		);

		// Playback control:
		mediaSession.setActionHandler(
			'seekforward',
			withService((service) => service.seekForward(true))
		);
		mediaSession.setActionHandler(
			'seekbackward',
			withService((service) => service.seekForward(false))
		);

		// Play/Pause:
		mediaSession.setActionHandler(
			'play',
			withService((service) => service.playPause())
		);
		mediaSession.setActionHandler(
			'pause',
			withService((service) => service.playPause())
		);
	}
}
