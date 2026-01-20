import { BatchDownloadPendingItemModel } from '../../downloads/batch-download-pending-item-model';

import {
	enqueuePendingItems,
	hasActiveItems,
	clearAllBatchDownloads,
	clearCompletedBatchDownloads,
	pauseAllBatchDownloads,
	resumeAllBatchDownloads,
	removeBatchDownloadItem,
	retryAllFailedBatchDownloads,
	retryBatchDownloadItem,
	showBatchDownloadInFolder,
} from './actions';
import { openOrFocusDownloadsTab } from './downloads-tab';
import { BatchDownloadRunner } from './runner';
import {
	getQueuedBatchDownloadItems,
	setDownloadsShelfEnabledSafe,
	setQueuedBatchDownloadItems,
} from './state';
import { registerBatchDownloadTabCleanup } from './tab-cleanup';

export class BatchDownloadBackgroundService {
	private readonly runner = new BatchDownloadRunner();

	public start(): void {
		registerBatchDownloadTabCleanup();

		this.runner.start();
	}

	public async enqueuePendingItems(
		items: BatchDownloadPendingItemModel[]
	): Promise<void> {
		await enqueuePendingItems(
			items,
			setDownloadsShelfEnabledSafe,
			setQueuedBatchDownloadItems,
			openOrFocusDownloadsTab,
			getQueuedBatchDownloadItems,
			() => this.runner.scheduleBatchTick()
		);
	}

	public scheduleTick(): void {
		this.runner.scheduleBatchTick();
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

	public async ensureShelfResetIfIdle(): Promise<void> {
		const hasActive = await hasActiveItems();
		if (!hasActive) {
			setDownloadsShelfEnabledSafe(true);
		}
	}
}
