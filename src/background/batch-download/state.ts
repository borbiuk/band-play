import { BatchDownloadItemModel } from '../../downloads/batch-download-item-model';
import { BatchDownloadPendingItemModel } from '../../downloads/batch-download-pending-item-model';
import { DownloadStatus } from '../../downloads/download-status';
import { DownloadType } from '../../downloads/download-type';
import { exist } from '@shared/utils';

export const BATCH_DOWNLOAD_TAB_ID_KEY = 'batchDownloadTabId';
export const BATCH_DOWNLOAD_QUEUED_ITEMS_KEY = 'batchDownloadQueuedItems';
export const BATCH_DOWNLOAD_ITEMS_KEY = 'batchDownloadItems';

const isDownloadsShelfAvailable =
	typeof chrome.downloads?.setShelfEnabled !== 'undefined';

export type QueuedItems = BatchDownloadPendingItemModel[];

export const uniqById = (items: BatchDownloadPendingItemModel[]) => {
	const map = new Map<string, BatchDownloadPendingItemModel>();
	for (const item of items) {
		if (!item?.id) {
			continue;
		}
		if (!map.has(item.id)) {
			map.set(item.id, item);
		}
	}
	return Array.from(map.values());
};

export const createPendingItem = (
	x: BatchDownloadPendingItemModel
): BatchDownloadItemModel => {
	return {
		...x,
		type: DownloadType.Pending,
		status: DownloadStatus.Pending,
	};
};

export const toChildrenIds = (downloads: { id: string }[]) =>
	downloads.map((x) => x.id);

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
	return x.status !== DownloadStatus.Completed;
};

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

export const setBatchDownloadItems = async (
	items: BatchDownloadItemModel[]
): Promise<void> => {
	await chrome.storage.local.set({ [BATCH_DOWNLOAD_ITEMS_KEY]: items });
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

export const setQueuedBatchDownloadItems = async (
	items: QueuedItems
): Promise<void> => {
	await chrome.storage.local.set({
		[BATCH_DOWNLOAD_QUEUED_ITEMS_KEY]: items,
	});
};

export const mergePendingIntoState = (
	current: BatchDownloadItemModel[],
	pending: BatchDownloadPendingItemModel[]
): BatchDownloadItemModel[] => {
	const existingIds = new Set(current.map((x) => x.id));
	const next = [...current];
	for (const item of uniqById(pending)) {
		if (!existingIds.has(item.id)) {
			next.push(createPendingItem(item));
		}
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
		const progress = Math.max((completed / children.length) * 100, 0);
		const allCompleted = completed === children.length;
		const nextStatus = allCompleted
			? DownloadStatus.Completed
			: item.status;

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
	if (!isDownloadsShelfAvailable) {
		return;
	}

	try {
		chrome.downloads.setShelfEnabled(enabled);
	} catch (_e) {
		// ignore
	}
};
