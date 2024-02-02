import { Config } from '../contracts/config';
import { exist } from './utils';

export class ConfigService {

	async update<T>(key: keyof Config, value: T, tabId?: number): Promise<void> {
		await chrome.storage.local.set({ [key]: value });

		if (exist(tabId)) {
			await chrome.tabs.sendMessage(tabId, {
				code: 'STORAGE_CHANGED',
			});
		}
	}

	async getAll(): Promise<Config> {
		let config = await chrome.storage.local.get(['autoplay', 'autoscroll', 'playFirst', 'movingStep']) as Config;
		config = {
			...config,
			autoplay: exist(config.autoplay) ? Boolean(config.autoplay) : true,
			autoscroll: exist(config.autoscroll) ? Boolean(config.autoscroll) : true,
			playFirst: Boolean(config.playFirst),
			movingStep: Number(config.movingStep),
		}

		if (isNaN(config.movingStep)) {
			config.movingStep = 10;
		}

		return config;
	}
}
