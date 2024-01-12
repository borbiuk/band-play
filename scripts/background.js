const notExist = (value) =>
	value === undefined
	|| value === null
	|| value === '';

// send URL change message
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// url not changed
	if (notExist(changeInfo.url)) {
		return;
	}

	if (!changeInfo.url.includes('bandcamp.com')) {
		return;
	}

	chrome.tabs.sendMessage(tabId, {
		code: 'URL_CHANGED'
	});
});

// subscribe on messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// Open new tab without focus on it
	if (request?.id === 'CREATE_TAB') {
		chrome.tabs.create({url: request.url, active: false});
	}
});

// Subscribe on extension update
chrome.runtime.onUpdateAvailable.addListener((details) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {
			code: 'SHOW_UPDATE',
			details
		});
	});
});
