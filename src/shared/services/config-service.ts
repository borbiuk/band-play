import { BatchDownloadFormat, KeyCode, ShortcutType } from '@shared/enums';
import { exist, isPlainObject } from '@shared/utils';

import { ConfigModel, ShortcutConfig } from '../models/config-model';

/** Every setting once: the compiler fails when a `ConfigModel` field is missing here or is not a setting. */
const CONFIG_KEY_SET = {
	autoplay: true,
	autoscroll: true,
	keepAwake: true,
	highlightVisited: true,
	playbackStep: true,
	loopTrack: true,
	showFeedPlayer: true,
	shortcuts: true,
	disabledShortcuts: true,
	mediaKeys: true,
	batchDownloadFormat: true,
	batchDownloadConcurrency: true,
	batchDownloadNotify: true,
	batchDownloadOpenPage: true,
	batchDownloadSkipDownloaded: true,
} satisfies Record<keyof ConfigModel, true>;

/** Storage keys of the configuration (storage.local also holds downloads and history). */
const CONFIG_KEYS = Object.keys(CONFIG_KEY_SET) as (keyof ConfigModel)[];

/** Identifies a settings file, and the version of its layout. */
const SETTINGS_FILE_FORMAT = 'band-play-settings';
const SETTINGS_FILE_VERSION = 1;

/** The content of an exported settings file. */
export interface SettingsFile {
	format: typeof SETTINGS_FILE_FORMAT;
	version: number;
	settings: ConfigModel;
}

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
	 * Calls back with the current settings now and with the new ones after every change.
	 *
	 * @param callback - The callback function to handle the settings.
	 * @returns A function that stops the callbacks.
	 */
	public watch(callback: (config: ConfigModel) => void): () => void {
		const unsubscribe = this.addListener(callback);
		this.getAll()
			.then(callback)
			.catch((e) => console.error(e));
		return unsubscribe;
	}

	/**
	 * Updates a specific key-value pair in the local storage.
	 *
	 * @param key - The key of the configuration setting to be updated.
	 * @param value - The new value for the specified configuration setting.
	 * @returns A promise that resolves when the update operation is complete.
	 */
	public async update<K extends keyof ConfigModel>(
		key: K,
		value: ConfigModel[K]
	): Promise<void> {
		await chrome.storage.local.set({ [key]: value });
	}

	/**
	 * Returns every shortcut to its default key and switches all of them on, in one write.
	 *
	 * @returns A promise that resolves when the shortcut settings are reset.
	 */
	public async resetShortcuts(): Promise<void> {
		await chrome.storage.local.set({
			shortcuts: {},
			disabledShortcuts: [],
		});
	}

	/**
	 * Builds the settings file content: every setting with its current (or default) value.
	 * Visited history and downloads are not part of it.
	 *
	 * @returns The settings file object.
	 */
	public async exportSettings(): Promise<SettingsFile> {
		return {
			format: SETTINGS_FILE_FORMAT,
			version: SETTINGS_FILE_VERSION,
			settings: await this.getAll(),
		};
	}

	/**
	 * Replaces all settings with the ones of a settings file. Every value is checked like a stored one:
	 * unknown keys are dropped, invalid values fall back to the default.
	 *
	 * @param file - The parsed content of a settings file.
	 * @returns A promise that resolves when the settings are stored.
	 * @throws Error when the content is not a Band Play settings file.
	 */
	public async importSettings(file: unknown): Promise<void> {
		if (
			typeof file !== 'object' ||
			file === null ||
			(file as SettingsFile).format !== SETTINGS_FILE_FORMAT
		) {
			throw new Error('This is not a Band Play settings file.');
		}

		const { version, settings } = file as SettingsFile;
		if (version !== SETTINGS_FILE_VERSION) {
			throw new Error('This settings file has an unsupported version.');
		}

		if (!isPlainObject(settings)) {
			throw new Error('The settings file has no settings.');
		}

		const checked = this.getWithDefaults(settings);
		await chrome.storage.local.set(
			Object.fromEntries(CONFIG_KEYS.map((key) => [key, checked[key]]))
		);
	}

	/**
	 * Removes every stored setting, so each one returns to its default.
	 * Visited history and downloads stay.
	 *
	 * @returns A promise that resolves when the settings are removed.
	 */
	public async resetSettings(): Promise<void> {
		await chrome.storage.local.remove(CONFIG_KEYS);
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
	public async get<K extends keyof ConfigModel>(
		key: K
	): Promise<ConfigModel[K]> {
		return (await this.getAll())[key];
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
			disabledShortcuts: this.toDisabledShortcuts(
				config.disabledShortcuts
			),
			mediaKeys: exist(config.mediaKeys)
				? Boolean(config.mediaKeys)
				: true,
			batchDownloadFormat: Object.values(BatchDownloadFormat).includes(
				config.batchDownloadFormat
			)
				? config.batchDownloadFormat
				: BatchDownloadFormat.Wav,
			batchDownloadConcurrency:
				toNumberOrNull(config.batchDownloadConcurrency) ?? 8,
			batchDownloadNotify: exist(config.batchDownloadNotify)
				? Boolean(config.batchDownloadNotify)
				: false,
			batchDownloadOpenPage: exist(config.batchDownloadOpenPage)
				? Boolean(config.batchDownloadOpenPage)
				: true,
			batchDownloadSkipDownloaded: exist(
				config.batchDownloadSkipDownloaded
			)
				? Boolean(config.batchDownloadSkipDownloaded)
				: false,
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

	/** Keeps only known shortcut types, once each; anything else means "none disabled". */
	private toDisabledShortcuts(value: unknown): ShortcutType[] {
		if (!Array.isArray(value)) {
			return [];
		}

		const known = Object.values(ShortcutType) as string[];
		return [...new Set(value)].filter(
			(x): x is ShortcutType => typeof x === 'string' && known.includes(x)
		);
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
