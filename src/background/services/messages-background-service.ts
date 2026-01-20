import { MessageCode } from '@shared/enums';
import {
	BatchDownloadItemsMessage,
	BatchDownloadItemIdMessage,
	MessageModel,
	NewTabMessage,
} from '@shared/models/messages';
import messageService from '@shared/services/message-service';

import { BatchDownloadBackgroundService } from '../batch-download/batch-download-background-service';

/**
 * Handles inter-component communication.
 * Processes messages from content scripts and UI pages.
 */
export class MessagesBackgroundService {
	public constructor(
		private readonly batchDownload: BatchDownloadBackgroundService
	) {}

	public start(): void {
		messageService.addListener(async (message: MessageModel<unknown>) => {
			switch (message.code) {
				// Open a new tab
				case MessageCode.CreateNewTab: {
					const { url, active } = message.data as NewTabMessage;
					chrome.tabs
						.create({ url: String(url), active })
						.catch((e) => {
							console.error(e);
						});
					break;
				}

				case MessageCode.BatchDownloadSendItemsToBackground: {
					const data = message.data as BatchDownloadItemsMessage;

					if (!data?.items || data.items.length === 0) {
						break;
					}

					await this.batchDownload.enqueuePendingItems(data.items);
					break;
				}

				case MessageCode.BatchDownloadTabOpened: {
					// Downloads tab is storage-driven; keep message for compatibility.
					this.batchDownload.scheduleTick();
					break;
				}

				case MessageCode.BatchDownloadOpenDownloadsTab: {
					await this.batchDownload.openDownloadsTab();
					break;
				}

				case MessageCode.BatchDownloadRetryItem: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.retryItem(String(data.id));
					break;
				}

				case MessageCode.BatchDownloadRetryAllFailed: {
					await this.batchDownload.retryAllFailed();
					break;
				}

				case MessageCode.BatchDownloadPauseAll: {
					await this.batchDownload.pauseAll();
					break;
				}

				case MessageCode.BatchDownloadResumeAll: {
					await this.batchDownload.resumeAll();
					break;
				}

				case MessageCode.BatchDownloadClearCompleted: {
					await this.batchDownload.clearCompleted();
					break;
				}

				case MessageCode.BatchDownloadClearAll: {
					await this.batchDownload.clearAll();
					break;
				}

				case MessageCode.BatchDownloadRemoveItem: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.removeItem(String(data.id));
					break;
				}

				case MessageCode.BatchDownloadShowInFolder: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.showInFolder(String(data.id));
					break;
				}

				default:
					break;
			}
		});
	}
}
