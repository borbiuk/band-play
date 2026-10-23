import { MessageCode } from '@shared/enums';
import {
	BatchDownloadItemsMessage,
	BatchDownloadItemIdMessage,
	MessageModel,
	NewTabMessage,
} from '@shared/models/messages';
import messageService from '@shared/services/message-service';

import { BatchDownloadBackgroundService } from '../batch-download/batch-download-background-service';

import { IBackgroundService } from './base/i-background-service';

/** True for an absolute http(s) URL. */
const isWebUrl = (url: unknown): boolean => {
	try {
		const { protocol } = new URL(String(url));
		return protocol === 'https:' || protocol === 'http:';
	} catch {
		return false;
	}
};

/**
 * Handles inter-component communication.
 * Processes messages from content scripts and UI pages.
 */
export class MessagesBackgroundService implements IBackgroundService {
	public constructor(
		private readonly batchDownload: BatchDownloadBackgroundService
	) {}

	public start(): void {
		messageService.addListener(async (message: MessageModel<unknown>) => {
			switch (message.code) {
				// Open a new tab
				case MessageCode.CreateNewTab: {
					const { url, active } = message.data as NewTabMessage;
					// The URL comes from the page: only web pages are opened
					if (!isWebUrl(url)) {
						break;
					}

					chrome.tabs
						.create({ url: String(url), active })
						.catch((e) => console.error(e));
					break;
				}

				case MessageCode.BatchDownloadSendItemsToBackground: {
					const data = message.data as BatchDownloadItemsMessage;

					if (!data?.items || data.items.length === 0) {
						break;
					}

					await this.batchDownload.enqueuePendingItems(
						data.items,
						data.format
					);
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
				case MessageCode.BatchDownloadResumeItem: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.resumeItem(String(data.id));
					break;
				}

				case MessageCode.BatchDownloadPauseItem: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.pauseItem(String(data.id));
					break;
				}

				case MessageCode.BatchDownloadCancelItem: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.cancelItem(String(data.id));
					break;
				}

				case MessageCode.BatchDownloadDeleteFile: {
					const data = message.data as BatchDownloadItemIdMessage;
					if (!data?.id) {
						break;
					}

					await this.batchDownload.deleteFile(String(data.id));
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
