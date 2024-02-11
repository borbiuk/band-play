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
	const updateStorage = (key: keyof Config, value: unknown) => {
		configService.update(key, value)
			.then(() => {
				// Send Chrome event about local storage changes.
				chrome.tabs.sendMessage(tabId, {
					code: 'STORAGE_CHANGED',
				});
			});
	};

	const loadTabId = async () => {
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
		return tabs[0].id;
	};

	useEffect(() => {
		loadTabId().then((tabId) => {
			setTabId(tabId);
		});

		configService.getAll().then(config => {
			setCurrentConfig(config);
		});
	}, []);

	if (notExist(tabId) || notExist(currentConfig)) {
		return <div>...</div>;
	}

	return (
		<div className="flex flex-col gap-y-2 relative rounded-xl border border-gray-300 p-3 pt-5 shadow-md shadow-gray-300">

			<span className="absolute left-1 -mt-9 z-20 p-0.5 rounded-xl bg-band-100 text-gray-500 text-base">Configuration</span>

			{/* Flags */}
			<Checkbox id="autoplay" label="Autoplay" defaultValue={currentConfig.autoplay} onChange={updateStorage}/>
			<Checkbox id="autoscroll" label="Autoscroll" defaultValue={currentConfig.autoscroll} onChange={updateStorage}/>
			<Checkbox id="playFirst" label="Play First" defaultValue={currentConfig.playFirst} onChange={updateStorage}/>

			{/* Playback moving step */}
			<NumberInput id="movingStep" label="Playback step" defaultValue={currentConfig.movingStep} min={6} max={60} onChange={updateStorage}/>

		</div>
	);
};
