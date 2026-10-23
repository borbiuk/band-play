import { BatchDownloadFormat, KeyCode, ShortcutType } from '@shared/enums';
import { exist } from '@shared/utils';

import { ConfigModel, ShortcutConfig } from '../models/config-model';

/** Storage keys of the configuration (storage.local also holds downloads and history). */
const CONFIG_KEYS: (keyof ConfigModel)[] = [
	'autoplay',
	'autoscroll',
	'keepAwake',
	'highlightVisited',
	'playbackStep',
	'loopTrack',
	'showFeedPlayer',
	'shortcuts',
	'batchDownloadFormat',
	'batchDownloadConcurrency',
	'batchDownloadFilenameTemplate',
];

/** A stored number, or null when the value is missing or not a finite number. */
const toNumberOrNull = (value: unknown): number | null => {
	if (!exist(value)) {
		return null;
	}

	const number = Number(value);
	return Number.isFinite(number) ? number : null;
};

/** Parses a stored combination; null when the value is not a JSON array of strings. */
const parseCombination = (value: unknown): string[] | null => {
	if (typeof value !== 'string') {
		return null;
	}

	try {
		const parsed: unknown = JSON.parse(value);
		if (
			Array.isArray(parsed) &&
			parsed.every((x) => typeof x === 'string')
		) {
			return parsed as string[];
		}
	} catch {
		// A corrupt value falls back to the default combination
	}

	return null;
};

/**
 * Service for managing and handling configuration settings stored in local storage.
 */
class ConfigService {
	/**
	 * Adds a listener for changes to the local storage, specifically designed for tracking changes in configuration settings.
	 *
	 * @param callback - The callback function to handle the updated configuration.
	 * @returns A function that removes the listener.
	 */
	public addListener(callback: (newConfig: ConfigModel) => void): () => void {
		const handler = (changes: {
			[key: string]: chrome.storage.StorageChange;
		}): void => {
			// Batch download progress and the visited history are written often:
			// only a change of a configuration key reloads the configuration
			if (!CONFIG_KEYS.some((key) => key in changes)) {
				return;
			}

			this.getAll().then(callback, () => void 0);
		};

		chrome.storage.local.onChanged.addListener(handler);
		return () => chrome.storage.local.onChanged.removeListener(handler);
	}

	/**
	 * Updates a specific key-value pair in the local storage.
	 *
	 * @param key - The key of the configuration setting to be updated.
	 * @param value - The new value for the specified configuration setting.
	 * @returns A promise that resolves when the update operation is complete.
	 */
	public async update<T>(key: keyof ConfigModel, value: T): Promise<void> {
		await chrome.storage.local.set({ [key]: value });
	}

	/**
	 * Retrieves all configuration settings from local storage.
	 *
	 * @returns A promise that resolves with the complete configuration object.
	 */
	public async getAll(): Promise<ConfigModel> {
		const config = await chrome.storage.local.get(CONFIG_KEYS);

		return this.getWithDefaults(config as unknown as ConfigModel);
	}

	/**
	 * Retrieves configuration settings from local storage by key.
	 *
	 * @returns A promise that resolves with the complete configuration object.
	 */
	public async get<T>(key: keyof ConfigModel): Promise<T> {
		return (await this.getAll())[key] as T;
	}

	/**
	 * Applies default values and type conversions to the provided configuration object.
	 *
	 * @param config - The raw configuration object obtained from storage.
	 * @returns The processed configuration object with defaults applied.
	 * @private
	 */
	private getWithDefaults(config: ConfigModel): ConfigModel {
		config = {
			...config,
			autoplay: exist(config.autoplay) ? Boolean(config.autoplay) : true,
			autoscroll: exist(config.autoscroll)
				? Boolean(config.autoscroll)
				: true,
			keepAwake: exist(config.keepAwake)
				? Boolean(config.keepAwake)
				: false,
			highlightVisited: exist(config.highlightVisited)
				? Boolean(config.highlightVisited)
				: true,
			playbackStep: toNumberOrNull(config.playbackStep) ?? 10,
			loopTrack: exist(config.loopTrack)
				? Boolean(config.loopTrack)
				: false,
			showFeedPlayer: exist(config.showFeedPlayer)
				? Boolean(config.showFeedPlayer)
				: true,
			shortcuts: this.mergeShortcuts(config.shortcuts),
			batchDownloadFormat: Object.values(BatchDownloadFormat).includes(
				config.batchDownloadFormat
			)
				? config.batchDownloadFormat
				: BatchDownloadFormat.Wav,
			batchDownloadConcurrency:
				toNumberOrNull(config.batchDownloadConcurrency) ?? 8,
			batchDownloadFilenameTemplate: exist(
				config.batchDownloadFilenameTemplate
			)
				? String(config.batchDownloadFilenameTemplate)
				: '',
		};

		if (config.playbackStep < 1 || config.playbackStep > 120) {
			config.playbackStep = 10;
		}

		if (
			config.batchDownloadConcurrency < 1 ||
			config.batchDownloadConcurrency > 15
		) {
			config.batchDownloadConcurrency = 8;
		}

		return config;
	}

	private mergeShortcuts(shortcuts: ShortcutConfig): ShortcutConfig {
		const defaultShortcuts = this.defaultShortcuts();

		if (exist(shortcuts)) {
			// Unknown keys are dropped; an empty or corrupt combination means "use the default"
			Object.values(ShortcutType)
				.filter(
					(key) => (parseCombination(shortcuts[key])?.length ?? 0) > 0
				)
				.forEach((key) => {
					defaultShortcuts[key] = shortcuts[key];
				});
		}

		return defaultShortcuts;
	}

	/**
	 * The default key combinations (JSON arrays of key codes).
	 *
	 * @returns A new object on every call.
	 */
	public defaultShortcuts(): ShortcutConfig {
		const shortcuts = {
			[ShortcutType.PlaybackSpeedIncrease]: [KeyCode.ArrowUp],
			[ShortcutType.PlaybackSpeedDecrease]: [KeyCode.ArrowDown],
			[ShortcutType.PlaybackSpeedReset]: [
				KeyCode.ArrowDown,
				KeyCode.Shift,
			],
			[ShortcutType.AutoPitchSwitch]: [KeyCode.KeyP],
			[ShortcutType.AutoPitchReset]: [KeyCode.KeyP, KeyCode.Shift],
			[ShortcutType.SeekForward]: [KeyCode.ArrowRight],
			[ShortcutType.SeekBackward]: [KeyCode.ArrowLeft],
			[ShortcutType.SeekToPercentage]: [KeyCode.Digit],
			[ShortcutType.PlayPause]: [KeyCode.Space],
			[ShortcutType.PreviousTrack]: [KeyCode.KeyB],
			[ShortcutType.NextTrack]: [KeyCode.KeyN],
			[ShortcutType.PlayTrackByIndex]: [KeyCode.Digit, KeyCode.Shift],
			[ShortcutType.LoopTrack]: [KeyCode.KeyV, KeyCode.Shift],
			[ShortcutType.OpenInNewTab]: [KeyCode.KeyO],
			[ShortcutType.OpenInNewTabWithFocus]: [KeyCode.KeyO, KeyCode.Shift],
			[ShortcutType.AddToWishlist]: [KeyCode.KeyL],
		};

		const result = {} as ShortcutConfig;

		Object.keys(shortcuts).forEach((key) => {
			const shortcutType = key as ShortcutType;
			result[shortcutType] = JSON.stringify(shortcuts[shortcutType]);
		});

		return result;
	}
}

const service = new ConfigService();
export default service;
