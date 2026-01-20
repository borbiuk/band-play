import { ConfigModel } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { notExist } from '@shared/utils/guard.utils';
import React, { useEffect, useState } from 'react';

import { PlaybackStepInput } from './internal/playback-step-input';

/**
 * PlaybackStep component for configuring the playback moving step.
 *
 * Separated from the main Configuration block to support multi-column popup layout
 * without changing existing control sizes and spacing.
 *
 * @returns JSX element containing the playback step configuration UI
 */
export const PlaybackStep = () => {
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

	useEffect(() => {
		configService.getAll().then((config) => {
			setCurrentConfig(config);
		});
	}, []);

	// Render loading indicator if currentConfig is not available.
	if (notExist(currentConfig)) {
		return <div>...</div>;
	}

	return (
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
	);
};
