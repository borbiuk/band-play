import { KeyCode, ShortcutType } from '@shared/enums';
import { ConfigModel, ShortcutConfig } from '../models/config-model';
import { exist } from '@shared/utils';

/**
 * Service for managing and handling configuration settings stored in local storage.
 */
class ConfigService {
	/**
	 * Adds a listener for changes to the local storage, specifically designed for tracking changes in configuration settings.
	 *
	 * @param callback - The callback function to handle the updated configuration.
	 */
	public addListener(callback: (newConfig: ConfigModel) => void): void {
		chrome.storage.local.onChanged.addListener(
			(storageChanges: {
				[key: string]: chrome.storage.StorageChange;
			}) => {
				const currentConfig = Object.keys(storageChanges).reduce(
					(config, key) => ({
						...config,
						[key]:
							storageChanges[key] === undefined
								? storageChanges[key].oldValue
								: storageChanges[key].newValue,
					}),
					{} as ConfigModel
				);

				callback(this.getWithDefaults(currentConfig));
			}
		);
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
		const config = (await chrome.storage.local.get([
			'autoplay',
			'autoscroll',
			'keepAwake',
			'playbackStep',
			'loopTrack',
			'shortcuts',
		])) as ConfigModel;

		return this.getWithDefaults(config);
	}

	/**
	 * Retrieves configuration settings from local storage by key.
	 *
	 * @returns A promise that resolves with the complete configuration object.
	 */
	public async get<T>(key: keyof ConfigModel): Promise<T> {
		const config = (await chrome.storage.local.get([key])) as ConfigModel;

		return this.getWithDefaults(config)[key] as T;
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
				: true,
			playbackStep: Number(config.playbackStep),
			loopTrack: exist(config.loopTrack)
				? Boolean(config.loopTrack)
				: false,
			shortcuts: this.mergeShortcuts(config.shortcuts),
		};

		if (isNaN(config.playbackStep)) {
			config.playbackStep = 10;
		}

		return config;
	}

	private mergeShortcuts(shortcuts: ShortcutConfig): ShortcutConfig {
		const defaultShortcuts = this.defaultShortcuts();

		if (exist(shortcuts)) {
			Object.keys(shortcuts)
				.filter(
					(key) =>
						exist(shortcuts[key]) &&
						(JSON.parse(shortcuts[key]) as string[]).length > 0
				)
				.forEach((key) => {
					defaultShortcuts[key] = shortcuts[key];
				});
		}

		return defaultShortcuts;
	}

	private defaultShortcuts(): ShortcutConfig {
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
