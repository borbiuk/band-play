import { BatchDownloadItemModel } from '../../downloads/batch-download-item-model';
import { DownloadStatus } from '../../downloads/download-status';
import { DownloadType } from '../../downloads/download-type';

import {
	getBatchDownloadItems,
	setBatchDownloadItems,
	updateParentsProgress,
} from './state';

type ScheduleTick = () => void;

export const registerDownloadsProgressHandling = (
	scheduleBatchTick: ScheduleTick
): void => {
	const lastProgressByDownloadId: Record<number, number> = {};
	const lastProgressUpdateAt: Record<number, number> = {};

	chrome.downloads.onChanged.addListener((delta) => {
		const deltaAny = delta as unknown as {
			id?: number;
			state?: { current?: string };
			bytesReceived?: { current?: number };
			totalBytes?: { current?: number };
		};

		const downloadId = deltaAny.id;
		if (!downloadId) {
			return;
		}

		const updateProgressFromSearch = async (): Promise<void> => {
			const now = Date.now();
			const lastAt = lastProgressUpdateAt[downloadId] ?? 0;
			// Throttle: search() can be expensive if many events fire.
			if (now - lastAt < 250) {
				return;
			}

			lastProgressUpdateAt[downloadId] = now;

			const results = await chrome.downloads.search({ id: downloadId });
			const d = results[0];
			if (!d) {
				return;
			}

			const total = Number(d.totalBytes);
			const received = Number(d.bytesReceived);
			if (!(total > 0) || !(received >= 0)) {
				return;
			}

			let progress = (received / total) * 100;
			if (!Number.isFinite(progress)) {
				return;
			}

			progress = Math.max(0, Math.min(100, progress));

			const prev = lastProgressByDownloadId[downloadId] ?? -1;
			if (Math.abs(progress - prev) < 0.5) {
				return;
			}

			lastProgressByDownloadId[downloadId] = progress;

			let items = await getBatchDownloadItems();
			let changed = false;
			items = items.map((x) => {
				if (
					x.type !== DownloadType.Single ||
					x.download.browserDownloadId !== downloadId
				) {
					return x;
				}

				changed = true;
				return { ...x, download: { ...x.download, progress } };
			});

			if (!changed) {
				return;
			}

			items = updateParentsProgress(items);
			await setBatchDownloadItems(items);
		};

		// Handle completion / failure fast.
		if (
			deltaAny.state &&
			deltaAny.state.current &&
			deltaAny.state.current !== 'in_progress'
		) {
			getBatchDownloadItems()
				.then(async (items) => {
					const match = items.find(
						(x) =>
							x.type === 'single' &&
							x.download.browserDownloadId === downloadId
					) as
						| Extract<BatchDownloadItemModel, { type: 'single' }>
						| undefined;

					if (!match) {
						return;
					}

					let nextStatus: DownloadStatus = DownloadStatus.Failed;
					if (deltaAny.state.current === 'complete') {
						nextStatus = DownloadStatus.Completed;
					}

					let next = items.map((x) => {
						if (
							x.id !== match.id ||
							x.type !== DownloadType.Single
						) {
							return x;
						}

						return {
							...x,
							status: nextStatus,
							download: {
								...x.download,
								progress:
									nextStatus === DownloadStatus.Completed
										? 100
										: x.download.progress,
							},
						};
					});
					next = updateParentsProgress(next);
					await setBatchDownloadItems(next);
					scheduleBatchTick();
				})
				.catch(() => void 0);
			return;
		}

		// Progress updates: use search() for correctness (delta often doesn't contain bytes/total).
		updateProgressFromSearch().catch(() => void 0);
	});
};
