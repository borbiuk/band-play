import { getBatchDownloadTabId, setBatchDownloadTabId } from './state';

const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
	const tabs = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});

	if (tabs.length === 0) {
		return null;
	}

	return tabs[0];
};

export const openOrFocusDownloadsTab = async (): Promise<number> => {
	let tabId = await getBatchDownloadTabId();

	// Is the tab still open?
	if (tabId) {
		try {
			await chrome.tabs.get(tabId);
		} catch (_e) {
			tabId = null;
		}
	}

	if (!tabId) {
		const activeTab = await getActiveTab();
		const url = chrome.runtime.getURL('./downloads.html');

		const tab = await chrome.tabs.create({
			url,
			active: true,
			index: activeTab ? activeTab.index + 1 : undefined,
		});

		tabId = tab.id;
		await setBatchDownloadTabId(tabId);
	} else {
		await chrome.tabs.update(tabId, { active: true });
	}

	return tabId;
};

export const clearBatchDownloadTabIdIfMatches = async (
	tabId: number
): Promise<boolean> => {
	const current = await getBatchDownloadTabId();
	if (current !== tabId) {
		return false;
	}

	await setBatchDownloadTabId(null);
	return true;
};
