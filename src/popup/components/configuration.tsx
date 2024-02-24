import React, { useEffect, useState } from 'react';
import { ConfigModel } from '../../shared/models/config-model';
import { ConfigService } from '../../shared/services/config-service';
import { notExist } from '../../shared/utils/utils.common';
import { Checkbox } from './checkbox';
import { NumberInput } from './number-input';

/**
 * Configuration component for managing and displaying user preferences.
 */
export const Configuration = () => {
	const [tabId, setTabId] = useState(null as number);
	const [currentConfig, setCurrentConfig] = useState(null as ConfigModel);

	const configService: ConfigService = new ConfigService();

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
		<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 pt-5 shadow-md shadow-gray-300">
			<span className="absolute left-1 z-20 -mt-9 rounded-xl p-0.5 text-base text-gray-500 backdrop-blur-sm">
				Configuration
			</span>

			{/* Flags */}
			<Checkbox
				id="autoplay"
				label="Autoplay"
				defaultValue={currentConfig.autoplay}
				onChange={updateStorage}
			/>
			<Checkbox
				id="autoscroll"
				label="Autoscroll"
				defaultValue={currentConfig.autoscroll}
				onChange={updateStorage}
			/>
			<Checkbox
				id="keepAwake"
				label="Keep Awake"
				defaultValue={currentConfig.keepAwake}
				onChange={updateStorage}
			/>
			<Checkbox
				id="playFirst"
				label="Play First"
				defaultValue={currentConfig.playFirst}
				onChange={updateStorage}
			/>

			{/* Playback moving step */}
			<NumberInput
				id="playbackStep"
				label="Playback step"
				defaultValue={currentConfig.playbackStep}
				min={6}
				max={60}
				suffix="sec"
				onChange={updateStorage}
			/>
		</div>
	);
};
