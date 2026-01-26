import {
	MessageType,
	STORAGE_KEYS,
	type ExtensionMessage,
	type PageInfo,
} from '@shared/messages';

const sendLastPageInfo = (
	sendResponse: (response: { lastPage: PageInfo | null }) => void
) => {
	chrome.storage.local.get([STORAGE_KEYS.lastPage], (result) => {
		const lastPage = (result[STORAGE_KEYS.lastPage] as PageInfo) || null;
		sendResponse({ lastPage });
	});
};

chrome.runtime.onMessage.addListener(
	(message: ExtensionMessage, _sender, sendResponse) => {
		if (message.type === MessageType.ContentPageInfo) {
			chrome.storage.local.set({
				[STORAGE_KEYS.lastPage]: message.payload,
			});
			sendResponse({ ok: true });
			return false;
		}

		if (message.type === MessageType.PopupOpenTab) {
			chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') });
			sendResponse({ ok: true });
			return false;
		}

		if (
			message.type === MessageType.PopupGetLastPage ||
			message.type === MessageType.TabGetLastPage
		) {
			sendLastPageInfo(sendResponse);
			return true;
		}

		if (message.type === MessageType.PopupHighlight) {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const activeTabId = tabs[0]?.id;

				if (!activeTabId) {
					sendResponse({ ok: false });
					return;
				}

				chrome.tabs.sendMessage(activeTabId, {
					type: MessageType.ContentHighlight,
					payload: { color: '#fef08a' },
				});

				sendResponse({ ok: true });
			});

			return true;
		}

		sendResponse({ ok: false });
		return false;
	}
);

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== 'popup-connection') {
		return;
	}

	port.onMessage.addListener((message: ExtensionMessage) => {
		if (message.type !== MessageType.PopupPortPing) {
			return;
		}

		port.postMessage({ type: MessageType.BackgroundPortPong });
	});
});
