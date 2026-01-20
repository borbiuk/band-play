import { BatchDownloadFormat, KeyCode, ShortcutType } from '@shared/enums';
import { exist, notExist } from '@shared/utils';

import { ConfigModel, ShortcutConfig } from '../models/config-model';

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
		chrome.storage.local.onChanged.addListener(() =>
			this.getAll().then(callback)
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
		const config = await chrome.storage.local.get([
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
		]);

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
				: true,
			highlightVisited: exist(config.highlightVisited)
				? Boolean(config.highlightVisited)
				: true,
			playbackStep: exist(config.playbackStep) ? config.playbackStep : 10,
			loopTrack: exist(config.loopTrack)
				? Boolean(config.loopTrack)
				: false,
			showFeedPlayer: exist(config.showFeedPlayer)
				? Boolean(config.showFeedPlayer)
				: true,
			shortcuts: this.mergeShortcuts(config.shortcuts),
			batchDownloadFormat: exist(config.batchDownloadFormat)
				? config.batchDownloadFormat
				: BatchDownloadFormat.Wav,
			batchDownloadConcurrency: exist(config.batchDownloadConcurrency)
				? config.batchDownloadConcurrency
				: 8,
		};

		if (config.playbackStep < 1 || config.playbackStep > 60) {
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
