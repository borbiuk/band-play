import { ConfigModel } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { notExist } from '@shared/utils/common.utils';
import React, { useEffect, useState } from 'react';

import { Checkbox } from './internal/checkbox';
import { PlaybackStepInput } from './internal/playback-step-input';

/**
 * Configuration component for managing and displaying user preferences.
 *
 * This component provides a UI for users to configure extension settings including:
 * - Autoplay functionality
 * - Autoscroll behavior
 * - Keep awake feature
 * - Playback step configuration
 * - Loop track option
 * - Feed player visibility
 *
 * @returns JSX element containing the configuration interface
 */
export const Configuration = () => {
	/** Current active tab ID */
	const [tabId, setTabId] = useState(null as number);

	/** Current configuration settings */
	const [currentConfig, setCurrentConfig] = useState(null as ConfigModel);

	/**
	 * Updates a configuration setting in storage.
	 *
	 * @param key - The configuration key to update
	 * @param value - The new value for the configuration
	 */
	const updateStorage = async (key: keyof ConfigModel, value: unknown) => {
		await configService.update(key, value);
	};

	/**
	 * Loads the current active tab ID.
	 *
	 * @returns Promise resolving to the active tab ID
	 */
	const loadTabId = async () => {
		const tabs = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		return tabs[0].id;
	};

	useEffect(() => {
		loadTabId().then((tabId) => {
			setTabId(tabId);
		});

		configService.getAll().then((config) => {
			setCurrentConfig(config);
		});
	}, []);

	// Render loading indicator if tabId or currentConfig is not available.
	if (notExist(tabId) || notExist(currentConfig)) {
		return <div>...</div>;
	}

	return (
		<div className="flex w-full flex-col gap-y-6">
			<div className="relative flex flex-col gap-y-1 rounded-xl border border-gray-300 p-2 pt-4 shadow-md shadow-gray-300">
				<span className="absolute left-1 -mt-7.5 rounded-xl p-0.5 text-base text-gray-500 backdrop-blur-sm">
					Configuration
				</span>

				{/* Flags */}
				<Checkbox
					id="autoplay"
					label="Autoplay"
					tooltip="Enable automatic playing of the next track in the collection, wishlist, feed, or album"
					defaultValue={currentConfig.autoplay}
					onChange={updateStorage}
				/>
				<Checkbox
					id="autoscroll"
					label="Autoscroll"
					tooltip="Automatic scrolling to the item that started playing"
					defaultValue={currentConfig.autoscroll}
					onChange={updateStorage}
				/>
				<Checkbox
					id="keepAwake"
					label="Keep Awake"
					tooltip="Keep your system or display from going to sleep"
					defaultValue={currentConfig.keepAwake}
					onChange={updateStorage}
				/>
				<Checkbox
					id="showFeedPlayer"
					label="Show feed player"
					tooltip="Show the feed player on Bandcamp feed pages"
					defaultValue={currentConfig.showFeedPlayer}
					onChange={updateStorage}
				/>
				<Checkbox
					id="highlightVisited"
					label="Highlight visited"
					tooltip="Hihlight albums and tracks that are already listened"
					defaultValue={currentConfig.highlightVisited}
					onChange={updateStorage}
				/>
			</div>

			<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-2 pt-4 shadow-md shadow-gray-300">
				<span className="absolute left-1 z-20 -mt-8 rounded-xl p-1 text-base text-gray-500 backdrop-blur-sm">
					Playback step
				</span>

				{/* Playback moving step */}
				<PlaybackStepInput
					id="playbackStep"
					defaultValue={currentConfig.playbackStep}
					min={1}
					max={120}
					suffix="sec"
					onChange={updateStorage}
				/>
			</div>
		</div>
	);
};
