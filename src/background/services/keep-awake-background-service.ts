import configService from '@shared/services/config-service';

import { IBackgroundService } from './base/i-background-service';

/**
 * Prevents the display from being turned off or dimmed, or the system from sleeping in response
 * to user inactivity (based on configuration).
 */
export class KeepAwakeBackgroundService implements IBackgroundService {
	public start(): void {
		let currentKeepAwake: boolean = null;

		const isPowerApiAvailable = typeof chrome.power !== 'undefined';

		const update = (keepAwake: boolean) => {
			if (keepAwake === currentKeepAwake) {
				return;
			}

			if (isPowerApiAvailable) {
				if (keepAwake) {
					chrome.power.requestKeepAwake('display');
				} else {
					chrome.power.releaseKeepAwake();
				}
			}

			currentKeepAwake = keepAwake;
		};

		// Applies the stored setting now and follows its changes in real time
		configService.watch((config) => update(Boolean(config.keepAwake)));
	}
}
