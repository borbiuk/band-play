const isNotExist = (value) =>
	value === undefined
	|| value === null
	|| value === '';

// send URL change message
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// url not changed
	if (isNotExist(changeInfo.url)) {
		return;
	}

	if (!changeInfo.url.includes('bandcamp.com')) {
		return;
	}

	chrome.tabs.sendMessage(tabId, {
		code: 'URL_CHANGED'
	});
});
