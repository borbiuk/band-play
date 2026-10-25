import { BatchDownloadFormat } from '@shared/enums';
import {
	BatchDownloadItemModel,
	SingleItem,
} from '@shared/models/batch-download/batch-download-item-model';
import { BatchDownloadPendingItemModel } from '@shared/models/batch-download/batch-download-pending-item-model';
import { DownloadStatus } from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';
import {
	batchDownloadHistoryKey,
	getBatchDownloadHistory,
} from '@shared/services/batch-download-history-service';
import configService from '@shared/services/config-service';
import { exist, isBandcampFileUrl, isBandcampUrl } from '@shared/utils';

import { markBatchNotifyPending } from './notify';
import {
	getBatchDownloadItems,
	patchItem,
	updateBatchDownloadItems,
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
	await updateBatchDownloadItems(async (current) => {
		const map = new Map(current.map((x) => [x.id, x] as const));
		const item = map.get(id);
		if (!item) {
			return current;
		}

		const toRemove = new Set<string>([id]);
		let items = current;

		// Remove parent + children
		if (item.type === DownloadType.Multiple) {
			item.children.forEach((x) => toRemove.add(x));
		}

		// If removing a child, update parent children list
		if (item.type === DownloadType.Single && item.parentId) {
			const parent = map.get(item.parentId);
			if (parent && parent.type === DownloadType.Multiple) {
				const nextChildren = parent.children.filter(
					(x) => x !== item.id
				);
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
		return updateParentsProgress(items);
	});
	scheduleBatchTick();
};

const resetFailedItemForRetry = (
	x: BatchDownloadItemModel
): BatchDownloadItemModel => {
	if (x.type === DownloadType.Pending && x.status === DownloadStatus.Failed) {
		return {
			...x,
			status: DownloadStatus.Pending,
			rateLimitAttempt: undefined,
			nextRetryAt: undefined,
		};
	}

	if (x.type === DownloadType.Single && x.status === DownloadStatus.Failed) {
		return {
			...x,
			status: DownloadStatus.Resolved,
			retryCount: 0,
			nextRetryAt: undefined,
			// The signed URL likely expired by the time the user retries.
			needsUrlRefresh: exist(x.pageUrl),
			download: {
				...x.download,
				progress: 0,
				browserDownloadId: undefined,
			},
		};
	}

	if (
		x.type === DownloadType.Multiple &&
		x.status === DownloadStatus.Failed
	) {
		// The parent becomes active again; its failed children are reset separately.
		return { ...x, status: DownloadStatus.Resolved };
	}

	return x;
};

export const retryBatchDownloadItem = async (
	id: string,
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems((current) => {
		const target = current.find((x) => x.id === id);
		if (!target) {
			return current;
		}

		const idsToRetry = new Set<string>([id]);

		// Retrying a failed parent retries all of its failed children.
		if (
			target.type === DownloadType.Multiple &&
			target.status === DownloadStatus.Failed
		) {
			target.children.forEach((x) => idsToRetry.add(x));
		}

		return current.map((x) => {
			if (!idsToRetry.has(x.id)) {
				return x;
			}

			return resetFailedItemForRetry(x);
		});
	});
	scheduleBatchTick();
};

export const retryAllFailedBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems((current) =>
		current.map(resetFailedItemForRetry)
	);
	scheduleBatchTick();
};

export const pauseAllBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		for (const x of current) {
			if (x.type !== DownloadType.Single) {
				continue;
			}

			if (x.status !== DownloadStatus.Downloading) {
				continue;
			}

			await pauseChromeDownloadSafe(x.download.browserDownloadId);
		}

		const items = current.map((x): BatchDownloadItemModel => {
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

		return updateParentsProgress(items);
	});
	scheduleBatchTick();
};

/**
 * A paused file, or a duplicate that waited for Resume, after the user resumes it:
 * it continues its browser download, or waits to be started when it has none.
 *
 * @param x - The file.
 * @returns The resumed file.
 */
export const resumedSingle = (x: SingleItem): SingleItem => {
	const duplicateResumed =
		x.status === DownloadStatus.Duplicate ? true : x.duplicateResumed;

	if (x.download.browserDownloadId) {
		return {
			...x,
			status: DownloadStatus.Downloading,
			duplicateResumed,
		};
	}

	return { ...x, status: DownloadStatus.Resolved, duplicateResumed };
};

export const resumeAllBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		for (const x of current) {
			if (x.type !== DownloadType.Single) {
				continue;
			}

			if (
				x.status !== DownloadStatus.Paused &&
				x.status !== DownloadStatus.Duplicate
			) {
				continue;
			}

			await resumeChromeDownloadSafe(x.download.browserDownloadId);
		}

		const items = current.map((x): BatchDownloadItemModel => {
			if (x.type !== DownloadType.Single) {
				return x;
			}

			if (
				x.status !== DownloadStatus.Paused &&
				x.status !== DownloadStatus.Duplicate
			) {
				return x;
			}

			return resumedSingle(x);
		});

		return updateParentsProgress(items);
	});
	scheduleBatchTick();
};

export const pauseBatchDownloadItem = async (
	id: string,
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		const item = current.find((x) => x.id === id);
		if (!item || item.type !== DownloadType.Single) {
			return current;
		}

		if (item.status !== DownloadStatus.Downloading) {
			return current;
		}

		await pauseChromeDownloadSafe(item.download.browserDownloadId);

		const items = patchItem(current, id, DownloadType.Single, (x) => {
			return { ...x, status: DownloadStatus.Paused };
		});

		return updateParentsProgress(items);
	});
	scheduleBatchTick();
};

export const cancelBatchDownloadItem = async (
	id: string,
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		const item = current.find((x) => x.id === id);
		if (!item || item.type !== DownloadType.Single) {
			return current;
		}

		if (
			item.status === DownloadStatus.Completed ||
			item.status === DownloadStatus.Failed
		) {
			return current;
		}

		await cancelChromeDownloadSafe(item.download.browserDownloadId);

		// The item stays in the list as failed so it can be retried later.
		const items = patchItem(current, id, DownloadType.Single, (x) => {
			return {
				...x,
				status: DownloadStatus.Failed,
				download: { ...x.download, browserDownloadId: undefined },
			};
		});

		return updateParentsProgress(items);
	});
	scheduleBatchTick();
};

export const deleteBatchDownloadFile = async (id: string): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		const item = current.find((x) => x.id === id);
		if (!item || item.type !== DownloadType.Single) {
			return current;
		}

		if (item.status !== DownloadStatus.Completed) {
			return current;
		}

		const downloadId = item.download.browserDownloadId;
		if (!downloadId) {
			return current;
		}

		try {
			await chrome.downloads.removeFile(downloadId);
		} catch (_e) {
			return current;
		}

		// Drop the browser download id so file actions disappear from the row.
		return patchItem(current, id, DownloadType.Single, (x) => {
			return {
				...x,
				download: { ...x.download, browserDownloadId: undefined },
			};
		});
	});
};

export const resumeBatchDownloadItem = async (
	id: string,
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		const item = current.find((x) => x.id === id);
		if (!item || item.type !== DownloadType.Single) {
			return current;
		}

		if (
			item.status !== DownloadStatus.Paused &&
			item.status !== DownloadStatus.Duplicate
		) {
			return current;
		}

		if (item.download.browserDownloadId) {
			await resumeChromeDownloadSafe(item.download.browserDownloadId);
		}

		const items = patchItem(
			current,
			item.id,
			DownloadType.Single,
			resumedSingle
		);

		return updateParentsProgress(items);
	});
	scheduleBatchTick();
};

export const clearAllBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems(async (current) => {
		for (const x of current) {
			if (x.type !== DownloadType.Single) {
				continue;
			}

			await cancelChromeDownloadSafe(x.download.browserDownloadId);
		}

		return [];
	});
	scheduleBatchTick();
};

export const clearCompletedBatchDownloads = async (
	scheduleBatchTick: () => void
): Promise<void> => {
	await updateBatchDownloadItems((current) => {
		const map = new Map(current.map((x) => [x.id, x] as const));
		const toRemove = new Set<string>();
		let items = current;

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

			const nextChildren = parent.children.filter(
				(x) => !toRemove.has(x)
			);
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
		return updateParentsProgress(items);
	});
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

export const enqueuePendingItems = async (
	items: BatchDownloadPendingItemModel[],
	format: BatchDownloadFormat | undefined,
	setDownloadsShelfEnabledSafe: (enabled: boolean) => void,
	appendQueuedBatchDownloadItems: (
		items: BatchDownloadPendingItemModel[]
	) => Promise<void>,
	openOrFocusDownloadsTab: () => Promise<number>,
	scheduleBatchTick: () => void
): Promise<void> => {
	if (!items || items.length === 0) {
		return;
	}

	// The items come from the page: only Bandcamp download pages are accepted
	let validItems = items.filter(
		(item) =>
			item &&
			typeof item.id === 'string' &&
			item.id !== '' &&
			isBandcampUrl(item.url)
	);
	if (validItems.length === 0) {
		return;
	}

	const validFormat = Object.values(BatchDownloadFormat).includes(
		format as BatchDownloadFormat
	)
		? format
		: undefined;

	const config = await configService.getAll();

	// "Skip already downloaded": a release downloaded in the same format before is left out
	if (config.batchDownloadSkipDownloaded) {
		const history = await getBatchDownloadHistory();
		validItems = validItems.filter((item) => {
			const itemFormat = Object.values(BatchDownloadFormat).includes(
				item.format as BatchDownloadFormat
			)
				? item.format
				: undefined;
			const key = batchDownloadHistoryKey(
				item.sourceId ?? item.id,
				itemFormat ?? validFormat ?? config.batchDownloadFormat
			);
			return !(key in history);
		});
		if (validItems.length === 0) {
			return;
		}
	}

	setDownloadsShelfEnabledSafe(false);

	// Use chrome.storage.local as a reliable transport channel.
	// (content scripts can send to background; UI reads state from storage.)
	const createdAt = Date.now();
	const normalized = validItems.map((item, index) => {
		const uniqueSuffix = Math.random().toString(36).slice(2, 8);
		const itemFormat = Object.values(BatchDownloadFormat).includes(
			item.format as BatchDownloadFormat
		)
			? item.format
			: undefined;
		return {
			...item,
			coverArtUrl: isBandcampFileUrl(item.coverArtUrl)
				? item.coverArtUrl
				: undefined,
			sourceId: item.sourceId ?? item.id,
			id: `${item.id}-${createdAt}-${index}-${uniqueSuffix}`,
			format: itemFormat ?? validFormat,
		};
	});
	await appendQueuedBatchDownloadItems(normalized);

	if (config.batchDownloadNotify) {
		await markBatchNotifyPending().catch(() => void 0);
	}

	// The queue starts even when the downloads tab cannot be opened or is not wanted
	try {
		if (config.batchDownloadOpenPage) {
			await openOrFocusDownloadsTab();
		}
	} finally {
		scheduleBatchTick();
	}
};
