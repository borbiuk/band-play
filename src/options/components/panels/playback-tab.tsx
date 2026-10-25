import {
	Badge,
	Card,
	CardTitle,
	NumberStepper,
	SettingRow,
	Switch,
	SwitchRow,
} from '@shared/components/ui';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

import { TabProps } from './types';

/** Rounds to the next multiple of 5, as the playback step buttons always did. */
const nextStep = (value: number, direction: 1 | -1): number => {
	const remainder = value % 5;
	if (remainder === 0) {
		return value + direction * 5;
	}

	return direction === 1 ? value + (5 - remainder) : value - remainder;
};

/** Keep Awake needs the power API, which Firefox does not have. */
const isPowerApiAvailable = typeof chrome.power !== 'undefined';

/**
 * Playback tab: player switches and the seek step.
 *
 * @param {TabProps} props - The props of component.
 */
export const PlaybackTab = ({ config, update }: TabProps) => {
	return (
		<div className="flex flex-col gap-3.5">
			<div>
				<CardTitle>Player</CardTitle>
				<Card>
					<SwitchRow
						label="Autoplay next track"
						hint="Start the next track when one ends"
						checked={config.autoplay}
						onChange={(value) => update('autoplay', value)}
					/>
					<SwitchRow
						label="Loop track"
						hint="Repeat the current track"
						checked={config.loopTrack}
						onChange={(value) => update('loopTrack', value)}
					/>
					<SwitchRow
						label="Media keys"
						hint="Play, pause, next and previous keys"
						checked={config.mediaKeys}
						onChange={(value) => update('mediaKeys', value)}
					/>
					{isPowerApiAvailable && (
						<SettingRow
							asLabel
							danger
							label={
								<>
									Keep screen awake{' '}
									<span className="ml-1.5 align-[1px]">
										<Badge tone="danger">
											<TriangleAlert
												size={11}
												aria-hidden="true"
											/>
											Use with care
										</Badge>
									</span>
								</>
							}
							hint="Stops the display from sleeping and drains battery"
						>
							<Switch
								danger
								ariaLabel="Keep screen awake"
								checked={config.keepAwake}
								onChange={(value) => update('keepAwake', value)}
							/>
						</SettingRow>
					)}
				</Card>
			</div>

			<div>
				<CardTitle>Seek step</CardTitle>
				<Card>
					<SettingRow
						label="Jump length"
						hint="For the left and right arrow keys"
					>
						<NumberStepper
							id="playbackStep-number-input"
							ariaLabel="Playback step in seconds"
							unit="sec"
							min={1}
							max={120}
							value={config.playbackStep}
							step={nextStep}
							onChange={(value) => update('playbackStep', value)}
						/>
					</SettingRow>
				</Card>
			</div>
		</div>
	);
};
