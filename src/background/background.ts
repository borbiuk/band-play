import { MessageCode } from '@shared/enums';
import { MessageModel, NewTabMessage } from '@shared/models/messages';
import configService from '@shared/services/config-service';
import messageService from '@shared/services/message-service';
import { notExist } from '@shared/utils';

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
				// skip error
				if (
					e.message ===
					'Could not establish connection. Receiving end does not exist.'
				) {
					return;
				}

				console.error(e);
			});
	});

// Subscribe on messages.
const registerMessagesHandling = () =>
	messageService.addListener(async (message: MessageModel<unknown>) => {
		switch (message.code) {
			// Open a new tab
			case MessageCode.CreateNewTab: {
				const { url, active } = message.data as NewTabMessage;
				chrome.tabs.create({ url: String(url), active }).catch((e) => {
					console.error(e);
				});
				break;
			}

			// Redirect ShowGuide message to content
			case MessageCode.ShowGuide: {
				await messageService.sendToActiveContent<boolean>(
					message as MessageModel<boolean>
				);
				break;
			}

			default:
				break;
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

	configService.get<boolean>('keepAwake').then(update);
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
