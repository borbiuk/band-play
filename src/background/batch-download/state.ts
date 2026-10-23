import { exist } from '@shared/utils';

import { BatchDownloadItemModel } from '../../downloads/batch-download-item-model';
import { BatchDownloadPendingItemModel } from '../../downloads/batch-download-pending-item-model';
import { DownloadStatus } from '../../downloads/download-status';
import { DownloadType } from '../../downloads/download-type';

export const BATCH_DOWNLOAD_TAB_ID_KEY = 'batchDownloadTabId';
export const BATCH_DOWNLOAD_QUEUED_ITEMS_KEY = 'batchDownloadQueuedItems';
export const BATCH_DOWNLOAD_ITEMS_KEY = 'batchDownloadItems';

// setShelfEnabled is deprecated since Chrome 117 in favor of setUiOptions.
const isDownloadsUiOptionsAvailable =
	typeof chrome.downloads?.setUiOptions !== 'undefined';
const isDownloadsShelfAvailable =
	typeof chrome.downloads?.setShelfEnabled !== 'undefined';

export type QueuedItems = BatchDownloadPendingItemModel[];

export const createPendingItem = (
	x: BatchDownloadPendingItemModel
): BatchDownloadItemModel => {
	return {
		...x,
		type: DownloadType.Pending,
		status: DownloadStatus.Pending,
	};
};

export const toChildrenIds = (downloads: { id: string }[], parentId: string) =>
	downloads.map((x) => `${parentId}:${x.id}`);

export const getBatchDownloadTabId = async (): Promise<number | null> => {
	const data = await chrome.storage.local.get([BATCH_DOWNLOAD_TAB_ID_KEY]);
	const raw = data[BATCH_DOWNLOAD_TAB_ID_KEY] as unknown;
	const id = Number(raw);

	if (Number.isNaN(id)) {
		return null;
	}

	return id;
};

export const setBatchDownloadTabId = async (
	tabId: number | null
): Promise<void> => {
	await chrome.storage.local.set({ [BATCH_DOWNLOAD_TAB_ID_KEY]: tabId });
};

export const isActiveBatchDownloadItem = (
	x: BatchDownloadItemModel
): boolean => {
	if (x.type === DownloadType.Pending) {
		return x.status !== DownloadStatus.Failed;
	}

	if (x.type === DownloadType.Single) {
		return (
			x.status !== DownloadStatus.Completed &&
			x.status !== DownloadStatus.Failed
		);
	}

	// multiple
	return (
		x.status !== DownloadStatus.Completed &&
		x.status !== DownloadStatus.Failed
	);
};

/**
 * True for an item the extension is working on. Paused and Duplicate items wait for the user:
 * they do not keep the browser's download UI off or the watchdog alarm running.
 */
export const isRunningBatchDownloadItem = (
	x: BatchDownloadItemModel
): boolean =>
	isActiveBatchDownloadItem(x) &&
	x.status !== DownloadStatus.Paused &&
	x.status !== DownloadStatus.Duplicate;

export const getBatchDownloadItems = async (): Promise<
	BatchDownloadItemModel[]
> => {
	const data = await chrome.storage.local.get([BATCH_DOWNLOAD_ITEMS_KEY]);
	const raw = data[BATCH_DOWNLOAD_ITEMS_KEY] as unknown;
	if (!Array.isArray(raw)) {
		return [];
	}
	return raw as BatchDownloadItemModel[];
};

const setBatchDownloadItems = async (
	items: BatchDownloadItemModel[]
): Promise<void> => {
	await chrome.storage.local.set({ [BATCH_DOWNLOAD_ITEMS_KEY]: items });
};

// Serializes every mutation of the batch-download storage keys: concurrent
// read-modify-write cycles (runner tick, progress poller, user actions)
// would otherwise overwrite each other's changes.
let stateWriteChain: Promise<unknown> = Promise.resolve();

const enqueueStateWrite = <T>(run: () => Promise<T>): Promise<T> => {
	const result = stateWriteChain.then(run, run);
	stateWriteChain = result.catch(() => void 0);
	return result;
};

export const updateBatchDownloadItems = (
	update: (
		items: BatchDownloadItemModel[]
	) => BatchDownloadItemModel[] | Promise<BatchDownloadItemModel[]>
): Promise<BatchDownloadItemModel[]> => {
	return enqueueStateWrite(async () => {
		const current = await getBatchDownloadItems();
		const next = await update(current);
		if (next !== current) {
			await setBatchDownloadItems(next);
		}
		return next;
	});
};

export const getQueuedBatchDownloadItems = async (): Promise<QueuedItems> => {
	const data = await chrome.storage.local.get([
		BATCH_DOWNLOAD_QUEUED_ITEMS_KEY,
	]);
	const items = (data[BATCH_DOWNLOAD_QUEUED_ITEMS_KEY] || []) as QueuedItems;

	if (!Array.isArray(items)) {
		return [];
	}

	return items;
};

const setQueuedBatchDownloadItems = async (
	items: QueuedItems
): Promise<void> => {
	await chrome.storage.local.set({
		[BATCH_DOWNLOAD_QUEUED_ITEMS_KEY]: items,
	});
};

/**
 * Appends new pending items to the queue, skipping releases that are already
 * queued or still actively processed (dedup by sourceId). Completed and
 * failed releases can be re-added deliberately.
 */
export const appendQueuedBatchDownloadItems = (
	items: QueuedItems
): Promise<void> => {
	return enqueueStateWrite(async () => {
		const existingQueued = await getQueuedBatchDownloadItems();
		const existingItems = await getBatchDownloadItems();

		const activeSourceIds = new Set<string>();
		for (const queued of existingQueued) {
			activeSourceIds.add(queued.sourceId ?? queued.id);
		}
		for (const item of existingItems) {
			if (!isActiveBatchDownloadItem(item)) {
				continue;
			}

			// Children carry digital-item ids; dedup only on top-level items.
			if (item.type === DownloadType.Single && exist(item.parentId)) {
				continue;
			}

			if (exist(item.sourceId)) {
				activeSourceIds.add(item.sourceId);
			}
		}

		const fresh = items.filter(
			(x) => !activeSourceIds.has(x.sourceId ?? x.id)
		);
		if (fresh.length === 0) {
			return;
		}

		await setQueuedBatchDownloadItems([...existingQueued, ...fresh]);
	});
};

// Atomically merges queued items into the persisted items and clears the queue.
export const drainQueuedBatchDownloadItems = (): Promise<
	BatchDownloadItemModel[]
> => {
	return enqueueStateWrite(async () => {
		const queued = await getQueuedBatchDownloadItems();
		const current = await getBatchDownloadItems();
		if (queued.length === 0) {
			return current;
		}

		const merged = mergePendingIntoState(current, queued);
		await setQueuedBatchDownloadItems([]);
		await setBatchDownloadItems(merged);
		return merged;
	});
};

export const mergePendingIntoState = (
	current: BatchDownloadItemModel[],
	pending: BatchDownloadPendingItemModel[]
): BatchDownloadItemModel[] => {
	const existingIds = new Set(current.map((x) => x.id));
	const next = [...current];
	for (const item of pending) {
		if (existingIds.has(item.id)) {
			continue;
		}
		next.push(createPendingItem(item));
	}
	return next;
};

export const updateParentsProgress = (
	items: BatchDownloadItemModel[]
): BatchDownloadItemModel[] => {
	const map = new Map(items.map((x) => [x.id, x] as const));
	let changed = false;

	for (const item of items) {
		if (item.type !== DownloadType.Multiple) {
			continue;
		}

		const children = item.children
			.map((id) => map.get(id))
			.filter((x) => exist(x)) as BatchDownloadItemModel[];

		if (children.length === 0) {
			continue;
		}

		const completed = children.filter(
			(x) =>
				x.type === DownloadType.Single &&
				x.status === DownloadStatus.Completed
		).length;
		const failed = children.filter(
			(x) =>
				x.type === DownloadType.Single &&
				x.status === DownloadStatus.Failed
		).length;
		const progress = Math.max((completed / children.length) * 100, 0);
		const allCompleted = completed === children.length;
		const allTerminal = completed + failed === children.length;

		let nextStatus = item.status;
		if (allCompleted) {
			nextStatus = DownloadStatus.Completed;
		} else if (allTerminal) {
			// Every child finished and at least one of them failed.
			nextStatus = DownloadStatus.Failed;
		} else if (item.status === DownloadStatus.Failed) {
			// A failed child was re-queued (retry): the parent is active again.
			nextStatus = DownloadStatus.Resolved;
		}

		if (item.progress !== progress || item.status !== nextStatus) {
			map.set(item.id, { ...item, progress, status: nextStatus });
			changed = true;
		}
	}

	if (!changed) {
		return items;
	}

	return Array.from(map.values());
};

export const setDownloadsShelfEnabledSafe = (enabled: boolean) => {
	if (isDownloadsUiOptionsAvailable) {
		try {
			// Re-enabling fails via runtime.lastError when another extension
			// keeps the download UI disabled; that is fine to ignore.
			Promise.resolve(chrome.downloads.setUiOptions({ enabled })).catch(
				() => void 0
			);
		} catch (_e) {
			// ignore
		}
		return;
	}

	if (!isDownloadsShelfAvailable) {
		return;
	}

	try {
		chrome.downloads.setShelfEnabled(enabled);
	} catch (_e) {
		// ignore
	}
};
