import configService from '@shared/services/config-service';

/**
 * Prevents the display from being turned off or dimmed, or the system from sleeping in response
 * to user inactivity (based on configuration).
 */
export class KeepAwakeBackgroundService {
	public start(): void {
		let currentKeepAwake: boolean = null;

		const update = (keepAwake: boolean) => {
			if (keepAwake === currentKeepAwake) {
				return;
			}

			if (keepAwake) {
				chrome.power.requestKeepAwake('display');
			} else {
				chrome.power.releaseKeepAwake();
			}

			currentKeepAwake = keepAwake;
		};

		configService.get<boolean>('keepAwake').then(update);

		// React to settings changes in real time
		configService.addListener((newConfig) => {
			update(Boolean(newConfig.keepAwake));
		});
	}
}
