import { Config } from '../contracts/config';
import { MessageCode } from './message-code';
import { MessageService } from './message-service';
import { exist } from './utils';

export class ConfigService {
	private readonly _messageService: MessageService = new MessageService();

	async update<T>(key: keyof Config, value: T, tabId: number): Promise<void> {
		await chrome.storage.local
			.set({ [key]: value })
			.then(async () => {
				await this._messageService.sendTabMessage(
					tabId,
					MessageCode.StorageChanged
				);
			})
			.catch((e) => {
				console.log(e);
			});
	}

	async getAll(): Promise<Config> {
		let config = (await chrome.storage.local.get([
			'autoplay',
			'autoscroll',
			'keepAwake',
			'playFirst',
			'movingStep',
		])) as Config;
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
		};

		if (isNaN(config.movingStep)) {
			config.movingStep = 10;
		}

		return config;
	}
}
