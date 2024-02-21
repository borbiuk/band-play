import { Config } from '../contracts/config';
import { exist } from './utils';

export class ConfigService {
	constructor() {}

	public addListener(callback: (newConfig: Config) => void): void {
		chrome.storage.local.onChanged.addListener(
			(storageChanges: {
				[key: string]: chrome.storage.StorageChange;
			}) => {
				const currentConfig = Object.keys(storageChanges).reduce(
					(config, key) => ({
						...config,
						[key]:
							storageChanges[key] === undefined
								? storageChanges[key].oldValue
								: storageChanges[key].newValue,
					}),
					{} as Config
				);

				callback(this.getWithDefaults(currentConfig));
			}
		);
	}

	public async update<T>(key: keyof Config, value: T): Promise<void> {
		await chrome.storage.local.set({ [key]: value });
	}

	public async getAll(): Promise<Config> {
		const config = (await chrome.storage.local.get([
			'autoplay',
			'autoscroll',
			'keepAwake',
			'playFirst',
			'movingStep',
			'showGuide'
		])) as Config;

		return this.getWithDefaults(config);
	}

	private getWithDefaults(config: Config): Config {
		config = {
			...config,
			autoplay: exist(config.autoplay) ? Boolean(config.autoplay) : true,
			autoscroll: exist(config.autoscroll)
				? Boolean(config.autoscroll)
				: true,
			keepAwake: exist(config.keepAwake)
				? Boolean(config.keepAwake)
				: true,
			playFirst: Boolean(config.playFirst),
			movingStep: Number(config.movingStep),
			showGuide: Boolean(config.showGuide),
		};

		if (isNaN(config.movingStep)) {
			config.movingStep = 10;
		}

		return config;
	}
}
