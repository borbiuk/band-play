import React, { useEffect, useState } from 'react';
import { ConfigModel } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { notExist } from '@shared/utils/utils.common';
import { Checkbox } from './internal/checkbox';
import { PlaybackStepInput } from './internal/playback-step-input';

/**
 * Configuration component for managing and displaying user preferences.
 */
export const Configuration = () => {
	const [tabId, setTabId] = useState(null as number);
	const [currentConfig, setCurrentConfig] = useState(null as ConfigModel);

	const updateStorage = async (key: keyof ConfigModel, value: unknown) => {
		await configService.update(key, value);
	};

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
