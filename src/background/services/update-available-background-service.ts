import { MessageCode } from '@shared/enums';
import messageService from '@shared/services/message-service';

/**
 * Notifies content scripts when a new extension update is available.
 */
export class UpdateAvailableBackgroundService {
	public start(): void {
		chrome.runtime.onUpdateAvailable.addListener((details) => {
			this.executeInCurrentTab((tabId) => {
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
	}

	private executeInCurrentTab(
		tabCallback: (tabId: number) => void | Promise<void>
	): void {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs.length > 0) {
				tabCallback(tabs[0].id);
			}
		});
	}
}
