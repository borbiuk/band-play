import { BatchDownloadPendingItemModel } from '../../downloads/batch-download-pending-item-model';
import { DownloadStatus } from '../../downloads/download-status';
import { DownloadType } from '../../downloads/download-type';

import {
	getBatchDownloadItems,
	setBatchDownloadItems,
	isActiveBatchDownloadItem,
	updateParentsProgress,
} from './state';

const pauseChromeDownloadSafe = async (downloadId?: number) => {
	if (!downloadId) {
		return;
	}

	try {
		await chrome.downloads.pause(downloadId);
	} catch (_e) {
		// ignore
	}
};

const resumeChromeDownloadSafe = async (downloadId?: number) => {
	if (!downloadId) {
		return;
	}

	try {
		await chrome.downloads.resume(downloadId);
	} catch (_e) {
		// ignore
	}
};

const cancelChromeDownloadSafe = async (downloadId?: number) => {
	if (!downloadId) {
		return;
	}

	try {
		await chrome.downloads.cancel(downloadId);
	} catch (_e) {
		// ignore
	}
};

export const removeBatchDownloadItem = async (
	id: string,
	scheduleBatchTick: () => void
): Promise<void> => {
	let items = await getBatchDownloadItems();
	const map = new Map(items.map((x) => [x.id, x] as const));
	const item = map.get(id);
	if (!item) {
		return;
	}

	const toRemove = new Set<string>([id]);

	// Remove parent + children
	if (item.type === DownloadType.Multiple) {
		item.children.forEach((x) => toRemove.add(x));
	}

	// If removing a child, update parent children list
	if (item.type === DownloadType.Single && item.parentId) {
		const parent = map.get(item.parentId);
		if (parent && parent.type === DownloadType.Multiple) {
			const nextChildren = parent.children.filter((x) => x !== item.id);
			if (nextChildren.length === 0) {
				toRemove.add(parent.id);
			} else {
				items = items.map((x) =>
					x.id === parent.id && x.type === DownloadType.Multiple
						? { ...x, children: nextChildren }
						: x
				);
			}
		}
	}

	for (const x of items) {
		if (!toRemove.has(x.id)) {
			continue;
		}

		if (x.type === DownloadType.Single) {
			await cancelChromeDownloadSafe(x.download.browserDownloadId);
		}
	}

	items = items.filter((x) => !toRemove.has(x.id));
	items = updateParentsProgress(items);
	await setBatchDownloadItems(items);
	scheduleBatchTick();
};

export const retryBatchDownloadItem = async (
	id: string,
	scheduleBatchTick: () => void
): Promise<void> => {
	let items = await getBatchDownloadItems();
	items = items.map((x) => {
		if (x.id !== id) {
			return x;
		}

		if (
			x.type === DownloadType.Pending &&
			x.status === DownloadStatus.Failed
		) {
			return { ...x, status: DownloadStatus.Pending };
		}

		if (
			x.type === DownloadType.Single &&
			x.status === DownloadStatus.Failed
		) {
			return {
				...x,
				status: DownloadStatus.Resolved,
				download: {
					...x.download,
					progress: 0,
					browserDownloadId: undefined,
				},
			};
		}

		return x;
	});
	await setBatchDownloadItems(items);
	scheduleBatchTick();
};

export const retryAllFailedBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	let items = await getBatchDownloadItems();
	items = items.map((x) => {
		if (
			x.type === DownloadType.Pending &&
			x.status === DownloadStatus.Failed
		) {
			return { ...x, status: DownloadStatus.Pending };
		}

		if (
			x.type === DownloadType.Single &&
			x.status === DownloadStatus.Failed
		) {
			return {
				...x,
				status: DownloadStatus.Resolved,
				download: {
					...x.download,
					progress: 0,
					browserDownloadId: undefined,
				},
			};
		}

		return x;
	});
	await setBatchDownloadItems(items);
	scheduleBatchTick();
};

export const pauseAllBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	let items = await getBatchDownloadItems();

	for (const x of items) {
		if (x.type !== DownloadType.Single) {
			continue;
		}

		if (x.status !== DownloadStatus.Downloading) {
			continue;
		}

		await pauseChromeDownloadSafe(x.download.browserDownloadId);
	}

	items = items.map((x) => {
		if (x.type !== DownloadType.Single) {
			return x;
		}

		if (
			x.status !== DownloadStatus.Downloading &&
			x.status !== DownloadStatus.Queued &&
			x.status !== DownloadStatus.Resolved
		) {
			return x;
		}

		return { ...x, status: DownloadStatus.Paused };
	});

	items = updateParentsProgress(items);
	await setBatchDownloadItems(items);
	scheduleBatchTick();
};

export const resumeAllBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	let items = await getBatchDownloadItems();

	for (const x of items) {
		if (x.type !== DownloadType.Single) {
			continue;
		}

		if (x.status !== DownloadStatus.Paused) {
			continue;
		}

		await resumeChromeDownloadSafe(x.download.browserDownloadId);
	}

	items = items.map((x) => {
		if (x.type !== DownloadType.Single) {
			return x;
		}

		if (x.status !== DownloadStatus.Paused) {
			return x;
		}

		if (x.download.browserDownloadId) {
			return { ...x, status: DownloadStatus.Downloading };
		}

		return { ...x, status: DownloadStatus.Resolved };
	});

	items = updateParentsProgress(items);
	await setBatchDownloadItems(items);
	scheduleBatchTick();
};

export const clearAllBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	const items = await getBatchDownloadItems();

	for (const x of items) {
		if (x.type !== DownloadType.Single) {
			continue;
		}

		await cancelChromeDownloadSafe(x.download.browserDownloadId);
	}

	await setBatchDownloadItems([]);
	scheduleBatchTick();
};

export const clearCompletedBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	let items = await getBatchDownloadItems();
	const map = new Map(items.map((x) => [x.id, x] as const));
	const toRemove = new Set<string>();

	for (const item of items) {
		if (item.status !== DownloadStatus.Completed) {
			continue;
		}

		toRemove.add(item.id);

		if (item.type === DownloadType.Multiple) {
			item.children.forEach((x) => toRemove.add(x));
		}
	}

	for (const item of items) {
		if (
			item.type !== DownloadType.Single ||
			!item.parentId ||
			!toRemove.has(item.id)
		) {
			continue;
		}

		const parent = map.get(item.parentId);
		if (!parent || parent.type !== DownloadType.Multiple) {
			continue;
		}

		if (toRemove.has(parent.id)) {
			continue;
		}

		const nextChildren = parent.children.filter((x) => !toRemove.has(x));
		if (nextChildren.length === 0) {
			toRemove.add(parent.id);
		} else {
			items = items.map((x) =>
				x.id === parent.id && x.type === DownloadType.Multiple
					? { ...x, children: nextChildren }
					: x
			);
		}
	}

	items = items.filter((x) => !toRemove.has(x.id));
	items = updateParentsProgress(items);
	await setBatchDownloadItems(items);
	scheduleBatchTick();
};

export const showBatchDownloadInFolder = async (id: string): Promise<void> => {
	const items = await getBatchDownloadItems();
	const item = items.find((x) => x.id === id);

	if (!item) {
		return;
	}

	if (item.type !== DownloadType.Single) {
		return;
	}

	const downloadId = item.download.browserDownloadId;
	if (!downloadId) {
		return;
	}

	try {
		chrome.downloads.show(downloadId);
	} catch (_e) {
		// ignore
	}
};

export const hasActiveItems = async (): Promise<boolean> => {
	const items = await getBatchDownloadItems();
	return items.some(isActiveBatchDownloadItem);
};

export const enqueuePendingItems = async (
	items: BatchDownloadPendingItemModel[],
	setDownloadsShelfEnabledSafe: (enabled: boolean) => void,
	setQueuedBatchDownloadItems: (
		items: BatchDownloadPendingItemModel[]
	) => Promise<void>,
	openOrFocusDownloadsTab: () => Promise<number>,
	getQueuedBatchDownloadItems: () => Promise<BatchDownloadPendingItemModel[]>,
	scheduleBatchTick: () => void
): Promise<void> => {
	if (!items || items.length === 0) {
		return;
	}

	setDownloadsShelfEnabledSafe(false);

	// Use chrome.storage.local as a reliable transport channel.
	// (content scripts can send to background; UI reads state from storage.)
	const existing = await getQueuedBatchDownloadItems();
	await setQueuedBatchDownloadItems([...existing, ...items]);

	await openOrFocusDownloadsTab();
	scheduleBatchTick();
};
