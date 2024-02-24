import { MessageCode } from '../shared/enums/message-code';
import { ConfigModel } from '../shared/models/config-model';
import { ConfigService } from '../shared/services/config-service';
import { MessageService } from '../shared/services/message-service';
import { notExist } from '../shared/utils/utils.common';

const messageService: MessageService = new MessageService();
const configService: ConfigService = new ConfigService();

const executeInCurrentTab = (
	tabCallback: (tabId: number) => void | Promise<void>
) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs.length > 0) {
			tabCallback(tabs[0].id);
		}
	});
};

// Send URL change message.
const registerUrlChange = () =>
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
		// url not changed
		if (notExist(changeInfo.url)) {
			return;
		}

		if (!changeInfo.url.includes('bandcamp.com')) {
			return;
		}

		messageService
			.sendToContent(tabId, { code: MessageCode.UrlChanged })
			.catch((e) => {
				console.error(e);
			});
	});

// Subscribe on messages.
const registerMessagesHandling = () =>
	messageService.addListener((message) => {
		// Open new tab without focus on it
		if (message?.code === MessageCode.CreateNewTab) {
			chrome.tabs
				.create({ url: String(message.data), active: false })
				.catch((e) => {
					console.error(e);
				});
		}
	});

// Subscribe on extension update.
const registerUpdateHandling = () =>
	chrome.runtime.onUpdateAvailable.addListener((details) => {
		executeInCurrentTab((tabId) => {
			messageService
				.sendToContent(tabId, {
					code: MessageCode.NewUpdateAvailable,
					data: details,
				})
				.catch((e) => {
					console.error(e);
				});
		});
	});

// Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity.
const registerKeepAwakeChange = () => {
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

	configService.getAll().then(({ keepAwake }: ConfigModel) => {
		update(keepAwake);
	});

	configService.addListener(({ keepAwake }: ConfigModel) => {
		update(keepAwake);
	});
};

const start = (): void => {
	[
		registerUrlChange,
		registerMessagesHandling,
		registerUpdateHandling,
		registerKeepAwakeChange,
	].forEach((func) => {
		try {
			func();
		} catch (e) {
			console.error(e);
		}
	});
};

start();
