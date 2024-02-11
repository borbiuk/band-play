import { ConfigService } from './common/config-service';
import { MessageCode } from './common/message-code';
import { MessageService } from './common/message-service';
import { notExist } from './common/utils';

const messageService: MessageService = new MessageService();

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
			.sendTabMessage(tabId, MessageCode.UrlChanged)
			.catch((e) => {
				console.error(e);
			});
	});

// Subscribe on messages.
const registerMessagesHandling = () =>
	chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
		// Open new tab without focus on it
		if (message?.code === MessageCode.CreateTab) {
			chrome.tabs
				.create({ url: message.data.url, active: false })
				.catch((e) => {
					console.error(e);
				});
		}
	});

// Subscribe on extension update.
const registerUpdateHandling = () =>
	chrome.runtime.onUpdateAvailable.addListener((details) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			messageService
				.sendTabMessage(tabs[0].id, MessageCode.ShowUpdate, details)
				.catch((e) => {
					console.error(e);
				});
		});
	});

// Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity.
const registerKeepAwakeChange = () => {
	const configService = new ConfigService();

	chrome.runtime.onMessage.addListener(
		async (message, _sender, _sendResponse) => {
			chrome.tabs.query(
				{ active: true, currentWindow: true },
				async (tabs) => {
					if (message?.code === MessageCode.StorageChanged) {
						await messageService.sendTabMessage(
							tabs[0].id,
							MessageCode.Log,
							{ power: chrome.power }
						);

						const { keepAwake } = await configService.getAll();
						chrome.power.requestKeepAwake(
							keepAwake ? 'display' : 'system'
						);
					}
				}
			);
		}
	);
};

[
	registerUrlChange,
	registerMessagesHandling,
	registerUpdateHandling,
	registerKeepAwakeChange,
].forEach((func) => {
	try {
		func();
	} catch (error) {
		messageService
			.sendRuntimeMessage(MessageCode.Log, {
				message: `Background ${func.name} function throw an error:\n${JSON.stringify(error)}`,
			})
			.catch((e) => {
				console.error(e);
			});
	}
});
