import { ConfigService } from './common/config-service';
import { notExist } from './common/utils';

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

		chrome.tabs
			.sendMessage(tabId, {
				code: 'URL_CHANGED',
			})
			.catch((e) => {
				console.log(e);
			});
	});

// Subscribe on messages.
const registerMessagesHandling = () =>
	chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
		// Open new tab without focus on it
		if (request?.id === 'CREATE_TAB') {
			chrome.tabs
				.create({ url: request.url, active: false })
				.catch((e) => {
					console.log(e);
				});
		}
	});

// Subscribe on extension update.
const registerUpdateHandling = () =>
	chrome.runtime.onUpdateAvailable.addListener((details) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs
				.sendMessage(tabs[0].id, {
					code: 'SHOW_UPDATE',
					details,
				})
				.catch((e) => {
					console.log(e);
				});
		});
	});

// Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity.
const registerKeepAwakeChange = () => {
	const configService = new ConfigService();

	chrome.runtime.onMessage.addListener(
		async (message, _sender, _sendResponse) => {
			if (message?.code === 'STORAGE_CHANGED') {
				const { keepAwake } = await configService.getAll();
				chrome.power.requestKeepAwake(keepAwake ? 'display' : 'system');
			}
		}
	);
};

registerUrlChange();
registerMessagesHandling();
registerUpdateHandling();
registerKeepAwakeChange();
