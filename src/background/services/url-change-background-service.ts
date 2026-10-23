import { MessageCode } from '@shared/enums';
import messageService from '@shared/services/message-service';
import { notExist } from '@shared/utils';

import { IBackgroundService } from './base/i-background-service';

/**
 * Sends a URL-changed notification to content scripts on Bandcamp navigation.
 */
export class UrlChangeBackgroundService implements IBackgroundService {
	public start(): void {
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
					// No content script in the tab (it is still loading or was never injected)
					if (
						String(e?.message).includes(
							'Receiving end does not exist'
						)
					) {
						return;
					}

					console.error(e);
				});
		});
	}
}
