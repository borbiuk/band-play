import { clearBatchDownloadTabIdIfMatches } from './downloads-tab';
import {
	isActiveBatchDownloadItem,
	getBatchDownloadItems,
	setDownloadsShelfEnabledSafe,
} from './state';

export const registerBatchDownloadTabCleanup = (): void => {
	chrome.tabs.onRemoved.addListener((tabId) => {
		clearBatchDownloadTabIdIfMatches(tabId)
			.then(async (matched) => {
				if (!matched) {
					return;
				}

				// Do NOT reset batch-download state when the tab is closed:
				// downloads can continue in background.
				const items = await getBatchDownloadItems();
				const hasActive = items.some(isActiveBatchDownloadItem);
				if (!hasActive) {
					setDownloadsShelfEnabledSafe(true);
				}
			})
			.catch(() => void 0);
	});
};
