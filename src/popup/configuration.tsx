import React, { useEffect, useState } from 'react';
import { ConfigService } from '../common/config-service';
import { notExist } from '../common/utils';
import { Config } from '../contracts/config';
import { Checkbox } from './checkbox';
import { NumberInput } from './number-input';

export const Configuration = () => {
	const [tabId, setTabId] = useState(null as number);
	const [currentConfig, setCurrentConfig] = useState(null as Config);

	const configService = new ConfigService();
	const updateStorage = async (key: keyof Config, value: unknown) => {
		await configService.update(key, value, tabId);
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

	if (notExist(tabId) || notExist(currentConfig)) {
		return <div>...</div>;
	}

	return (
		<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 pt-5 shadow-md shadow-gray-300">
			<span className="absolute left-1 z-20 -mt-9 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
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
				id="movingStep"
				label="Playback step"
				defaultValue={currentConfig.movingStep}
				min={6}
				max={60}
				suffix="sec"
				onChange={updateStorage}
			/>
		</div>
	);
};
