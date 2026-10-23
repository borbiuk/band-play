import { BatchDownloadFormat } from '@shared/enums';

import { BatchDownloadPendingItemModel } from '../../downloads/batch-download-pending-item-model';

import {
	enqueuePendingItems,
	cancelBatchDownloadItem,
	clearAllBatchDownloads,
	clearCompletedBatchDownloads,
	deleteBatchDownloadFile,
	pauseAllBatchDownloads,
	pauseBatchDownloadItem,
	resumeAllBatchDownloads,
	resumeBatchDownloadItem,
	removeBatchDownloadItem,
	retryAllFailedBatchDownloads,
	retryBatchDownloadItem,
	showBatchDownloadInFolder,
} from './actions';
import { openOrFocusDownloadsTab } from './downloads-tab';
import { registerFilenameRouter } from './filename-router';
import { registerDownloadsProgressHandling } from './progress-updates';
import { BatchDownloadRunner } from './runner';
import {
	appendQueuedBatchDownloadItems,
	setDownloadsShelfEnabledSafe,
} from './state';
import { registerBatchDownloadTabCleanup } from './tab-cleanup';
import { registerDownloadsUiPresence } from './ui-presence';

export class BatchDownloadBackgroundService {
	private readonly runner = new BatchDownloadRunner();

	public start(): void {
		registerBatchDownloadTabCleanup();
		registerDownloadsProgressHandling(this.runner);
		registerFilenameRouter();
		registerDownloadsUiPresence(() =>
			this.runner.startDownloadsProgressPoller()
		);

		this.runner.start();
	}

	public async enqueuePendingItems(
		items: BatchDownloadPendingItemModel[],
		format?: BatchDownloadFormat
	): Promise<void> {
		await enqueuePendingItems(
			items,
			format,
			setDownloadsShelfEnabledSafe,
			appendQueuedBatchDownloadItems,
			openOrFocusDownloadsTab,
			() => this.runner.scheduleBatchTick()
		);
	}

	public async openDownloadsTab(): Promise<void> {
		await openOrFocusDownloadsTab();
	}

	public async retryItem(id: string): Promise<void> {
		await retryBatchDownloadItem(String(id), () =>
			this.runner.scheduleBatchTick()
		);
	}

	public async retryAllFailed(): Promise<void> {
		await retryAllFailedBatchDownloads(() =>
			this.runner.scheduleBatchTick()
		);
	}

	public async pauseAll(): Promise<void> {
		await pauseAllBatchDownloads(() => this.runner.scheduleBatchTick());
	}

	public async resumeAll(): Promise<void> {
		await resumeAllBatchDownloads(() => this.runner.scheduleBatchTick());
	}

	public async resumeItem(id: string): Promise<void> {
		await resumeBatchDownloadItem(String(id), () =>
			this.runner.scheduleBatchTick()
		);
	}

	public async pauseItem(id: string): Promise<void> {
		await pauseBatchDownloadItem(String(id), () =>
			this.runner.scheduleBatchTick()
		);
	}

	public async cancelItem(id: string): Promise<void> {
		await cancelBatchDownloadItem(String(id), () =>
			this.runner.scheduleBatchTick()
		);
	}

	public async deleteFile(id: string): Promise<void> {
		await deleteBatchDownloadFile(String(id));
	}

	public async clearCompleted(): Promise<void> {
		await clearCompletedBatchDownloads(() =>
			this.runner.scheduleBatchTick()
		);
	}

	public async clearAll(): Promise<void> {
		await clearAllBatchDownloads(() => this.runner.scheduleBatchTick());
	}

	public async removeItem(id: string): Promise<void> {
		await removeBatchDownloadItem(String(id), () =>
			this.runner.scheduleBatchTick()
		);
	}

	public async showInFolder(id: string): Promise<void> {
		await showBatchDownloadInFolder(String(id));
	}
}
