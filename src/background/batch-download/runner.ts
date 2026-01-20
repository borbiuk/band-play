import { BatchDownloadItemModel } from '../../downloads/batch-download-item-model';
import { DownloadStatus } from '../../downloads/download-status';
import { DownloadType } from '../../downloads/download-type';
import configService from '@shared/services/config-service';
import { exist, notExist } from '@shared/utils';

import { parseBandcampDownloads } from '../../downloads/services/bandcamp-parser';

import {
	getBatchDownloadItems,
	getQueuedBatchDownloadItems,
	mergePendingIntoState,
	setBatchDownloadItems,
	setDownloadsShelfEnabledSafe,
	setQueuedBatchDownloadItems,
	toChildrenIds,
	updateParentsProgress,
} from './state';

const MAX_PENDING_RESOLVE_PER_TICK = 3;
const MAX_PROGRESS_UPDATE_PER_TICK = 10;

export class BatchDownloadRunner {
	private isBatchTickRunning = false;
	private isBatchTickScheduled = false;
	private batchTickTimeoutId: number = null;

	private downloadsProgressPollerId: number = null;
	private pollingLastProgressByDownloadId: Record<number, number> = {};
	private pollingLastProgressUpdateAt: Record<number, number> = {};

	private async updateItems(
		update: (items: BatchDownloadItemModel[]) => BatchDownloadItemModel[]
	): Promise<BatchDownloadItemModel[]> {
		const current = await getBatchDownloadItems();
		const next = update(current);
		await setBatchDownloadItems(next);
		return next;
	}

	public start(): void {
		// In case we got restarted while there is pending work.
		this.scheduleBatchTick();
	}

	public scheduleBatchTick(): void {
		if (this.isBatchTickRunning) {
			this.isBatchTickScheduled = true;
			return;
		}

		this.isBatchTickScheduled = true;
		this.runBatchTick().catch(() => void 0);
	}

	public scheduleBatchTickSoon(delayMs: number = 0): void {
		if (exist(this.batchTickTimeoutId)) {
			return;
		}

		this.batchTickTimeoutId = setTimeout(() => {
			this.batchTickTimeoutId = null;
			this.scheduleBatchTick();
		}, delayMs) as unknown as number;
	}

	public startDownloadsProgressPoller(): void {
		if (exist(this.downloadsProgressPollerId)) {
			return;
		}

		this.downloadsProgressPollerId = setInterval(() => {
			this.pollActiveDownloadsProgress().catch(() => void 0);
		}, 250) as unknown as number;
	}

	public stopDownloadsProgressPoller(): void {
		if (notExist(this.downloadsProgressPollerId)) {
			return;
		}

		clearInterval(this.downloadsProgressPollerId);
		this.downloadsProgressPollerId = null;
	}

	private async runBatchTick(): Promise<void> {
		if (!this.isBatchTickScheduled) {
			return;
		}

		if (this.isBatchTickRunning) {
			return;
		}

		this.isBatchTickRunning = true;
		this.isBatchTickScheduled = false;

		try {
			// 1) Merge queued items into persisted items and clear queued storage.
			let items = await getBatchDownloadItems();
			const queued = await getQueuedBatchDownloadItems();
			if (queued.length > 0) {
				items = mergePendingIntoState(items, queued);
				await setQueuedBatchDownloadItems([]);
				await setBatchDownloadItems(items);
			}

			// 2) Ensure downloads shelf is disabled while there is active work.
			const hasActive = items.some((x) => {
				if (x.type === DownloadType.Pending) {
					return x.status !== DownloadStatus.Failed;
				}

				if (x.type === DownloadType.Single) {
					return (
						x.status !== DownloadStatus.Completed &&
						x.status !== DownloadStatus.Failed
					);
				}

				return x.status !== DownloadStatus.Completed;
			});
			if (hasActive) {
				setDownloadsShelfEnabledSafe(false);
			}

			// 3) Resolve a few pending items per tick to keep the pipeline filled.
			const configForResolve = await configService.getAll();
			const toResolve = items
				.filter(
					(x) =>
						x.type === DownloadType.Pending &&
						x.status === DownloadStatus.Pending
				)
				.slice(0, MAX_PENDING_RESOLVE_PER_TICK) as Extract<
				BatchDownloadItemModel,
				{ type: DownloadType.Pending }
			>[];

			for (const pending of toResolve) {
				items = await this.updateItems((current) =>
					current.map((x) =>
						x.id === pending.id && x.type === DownloadType.Pending
							? { ...x, status: DownloadStatus.Resolving }
							: x
					)
				);

				let downloads: Awaited<
					ReturnType<typeof parseBandcampDownloads>
				> = [];
				try {
					downloads = await parseBandcampDownloads(
						pending.url,
						configForResolve.batchDownloadFormat
					);
				} catch (_e) {
					items = await this.updateItems((current) =>
						current.map((x) =>
							x.id === pending.id &&
							x.type === DownloadType.Pending
								? { ...x, status: DownloadStatus.Failed }
								: x
						)
					);
					continue;
				}

				if (downloads.length === 0) {
					items = await this.updateItems((current) =>
						current.map((x) =>
							x.id === pending.id &&
							x.type === DownloadType.Pending
								? { ...x, status: DownloadStatus.Failed }
								: x
						)
					);
					continue;
				}

				if (downloads.length === 1) {
					const download = downloads[0];
					items = await this.updateItems((current) =>
						current.map((x) => {
							if (x.id !== pending.id) {
								return x;
							}

							return {
								id: pending.id,
								title: pending.title,
								type: DownloadType.Single,
								status: DownloadStatus.Resolved,
								download: { ...download, progress: 0 },
							};
						})
					);
					continue;
				}

				items = await this.updateItems((current) => {
					const withoutParent = current.filter(
						(x) => x.id !== pending.id
					);
					const childItems: BatchDownloadItemModel[] = downloads.map(
						(d) => ({
							id: d.id,
							title: d.title,
							type: DownloadType.Single,
							status: DownloadStatus.Resolved,
							parentId: pending.id,
							download: { ...d, progress: 0 },
						})
					);
					const parent: BatchDownloadItemModel = {
						id: pending.id,
						title: pending.title,
						type: DownloadType.Multiple,
						status: DownloadStatus.Resolved,
						progress: 0,
						children: toChildrenIds(downloads),
					};
					return [...withoutParent, parent, ...childItems];
				});
			}

			// 4) Start downloads up to configured concurrency.
			items = await getBatchDownloadItems();
			const config = await configService.getAll();
			const concurrency = config.batchDownloadConcurrency;

			const countDownloading = items.filter((x) => {
				if (x.type !== DownloadType.Single) {
					return false;
				}

				return (
					x.status === DownloadStatus.Downloading ||
					x.status === DownloadStatus.Paused
				);
			}).length;

			let available = Math.max(concurrency - countDownloading, 0);
			if (available > 0) {
				const toStart = items.filter(
					(x) =>
						x.type === DownloadType.Single &&
						x.status === DownloadStatus.Resolved
				) as Extract<
					BatchDownloadItemModel,
					{ type: DownloadType.Single }
				>[];

				for (const item of toStart) {
					if (available <= 0) {
						break;
					}

					items = await this.updateItems((current) =>
						current.map((x) =>
							x.id === item.id && x.type === DownloadType.Single
								? { ...x, status: DownloadStatus.Queued }
								: x
						)
					);

					try {
						const downloadId = await chrome.downloads.download({
							url: item.download.url,
							conflictAction: 'uniquify',
						});

						items = await this.updateItems((current) =>
							current.map((x) => {
								if (
									x.id !== item.id ||
									x.type !== DownloadType.Single
								) {
									return x;
								}

								return {
									...x,
									status: DownloadStatus.Downloading,
									download: {
										...x.download,
										browserDownloadId: downloadId,
									},
								};
							})
						);
						available--;

						this.startDownloadsProgressPoller();
					} catch (_e) {
						items = await this.updateItems((current) =>
							current.map((x) =>
								x.id === item.id &&
								x.type === DownloadType.Single
									? { ...x, status: DownloadStatus.Failed }
									: x
							)
						);
					}
				}
			}

			// 5) Update parent progress (derived).
			items = await getBatchDownloadItems();
			const withParents = updateParentsProgress(items);
			if (withParents !== items) {
				await setBatchDownloadItems(withParents);
			}

			// 6) Re-enable shelf when everything is done.
			const finalItems = await getBatchDownloadItems();
			const stillActive = finalItems.some((x) => {
				if (x.type === DownloadType.Pending) {
					return x.status !== DownloadStatus.Failed;
				}

				if (x.type === DownloadType.Single) {
					return (
						x.status !== DownloadStatus.Completed &&
						x.status !== DownloadStatus.Failed
					);
				}

				return x.status !== DownloadStatus.Completed;
			});
			if (!stillActive) {
				setDownloadsShelfEnabledSafe(true);
				this.stopDownloadsProgressPoller();
			}

			// 7) Keep ticking while there is work to do (fills concurrency without waiting for completion events).
			const hasPending = finalItems.some(
				(x) =>
					x.type === DownloadType.Pending &&
					x.status === DownloadStatus.Pending
			);
			const hasResolvedSingles = finalItems.some(
				(x) =>
					x.type === DownloadType.Single &&
					x.status === DownloadStatus.Resolved
			);
			const downloadingNow = finalItems.filter(
				(x) =>
					x.type === DownloadType.Single &&
					x.status === DownloadStatus.Downloading
			).length;
			const hasCapacity = downloadingNow < concurrency;

			if ((hasPending || hasResolvedSingles) && hasCapacity) {
				this.scheduleBatchTickSoon(0);
			}

			// If something scheduled while we ran, run again.
			if (this.isBatchTickScheduled) {
				return;
			}
		} finally {
			this.isBatchTickRunning = false;
			if (this.isBatchTickScheduled) {
				this.runBatchTick().catch(() => void 0);
			}
		}
	}

	private async updateProgressForDownloadId(
		downloadId: number
	): Promise<void> {
		const now = Date.now();
		const lastAt = this.pollingLastProgressUpdateAt[downloadId] ?? 0;

		if (now - lastAt < 250) {
			return;
		}

		this.pollingLastProgressUpdateAt[downloadId] = now;

		const results = await chrome.downloads.search({ id: downloadId });
		const d = results[0];
		if (!d) {
			return;
		}

		const total = Number(d.totalBytes);
		const received = Number(d.bytesReceived);
		const isCompleted = d.state === 'complete';
		const isInterrupted = d.state === 'interrupted';
		const isPaused = d.state === 'in_progress' && d.paused === true;

		const prevProgress =
			this.pollingLastProgressByDownloadId[downloadId] ?? -1;
		let progress = prevProgress;
		let hasComputedProgress = false;
		if (total > 0 && received >= 0) {
			const nextProgress = Math.max(
				0,
				Math.min(100, (received / total) * 100)
			);
			if (Number.isFinite(nextProgress)) {
				progress = nextProgress;
				hasComputedProgress = true;
			}
		}

		const hasProgressUpdate =
			hasComputedProgress &&
			Number.isFinite(progress) &&
			(prevProgress < 0 || Math.abs(progress - prevProgress) >= 0.5);
		if (hasProgressUpdate) {
			this.pollingLastProgressByDownloadId[downloadId] = progress;
		}

		let items = await getBatchDownloadItems();
		let changed = false;
		let scheduleTick = false;

		items = items.map((x) => {
			if (
				x.type !== DownloadType.Single ||
				x.download.browserDownloadId !== downloadId
			) {
				return x;
			}

			let nextStatus = x.status;
			if (isCompleted) {
				nextStatus = DownloadStatus.Completed;
			} else if (isInterrupted) {
				nextStatus = DownloadStatus.Failed;
			} else if (isPaused) {
				nextStatus = DownloadStatus.Paused;
			} else if (x.status === DownloadStatus.Paused) {
				nextStatus = DownloadStatus.Downloading;
			}

			const nextProgress = isCompleted
				? 100
				: hasProgressUpdate
					? Math.max(progress, 0)
					: x.download.progress;

			if (
				x.status !== nextStatus ||
				x.download.progress !== nextProgress
			) {
				changed = true;
			}

			if (
				nextStatus === DownloadStatus.Completed ||
				nextStatus === DownloadStatus.Failed
			) {
				scheduleTick = true;
			}

			return {
				...x,
				status: nextStatus,
				download: { ...x.download, progress: nextProgress },
			};
		});

		if (!changed) {
			return;
		}

		items = updateParentsProgress(items);
		await setBatchDownloadItems(items);

		if (scheduleTick) {
			this.scheduleBatchTickSoon(0);
		}
	}

	private async pollActiveDownloadsProgress(): Promise<void> {
		const items = await getBatchDownloadItems();
		const active = items.filter(
			(x) =>
				x.type === DownloadType.Single &&
				(x.status === DownloadStatus.Downloading ||
					x.status === DownloadStatus.Paused)
		) as Extract<BatchDownloadItemModel, { type: DownloadType.Single }>[];

		if (active.length === 0) {
			this.stopDownloadsProgressPoller();
			return;
		}

		// Keep work bounded per tick.
		for (const item of active.slice(0, MAX_PROGRESS_UPDATE_PER_TICK)) {
			const downloadId = item.download.browserDownloadId;
			if (!downloadId) {
				continue;
			}

			await this.updateProgressForDownloadId(downloadId);
		}
	}
}
