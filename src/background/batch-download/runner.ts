import { BatchDownloadFormat } from '@shared/enums';
import { BatchDownloadFileModel } from '@shared/models/batch-download/batch-download-file-model';
import {
	BatchDownloadItemModel,
	PendingItem,
	SingleItem,
} from '@shared/models/batch-download/batch-download-item-model';
import { DownloadStatus } from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';
import {
	addBatchDownloadHistoryEntries,
	BatchDownloadHistoryEntry,
} from '@shared/services/batch-download-history-service';
import configService from '@shared/services/config-service';
import { exist, notExist } from '@shared/utils';

import {
	BandcampRateLimitError,
	BandcampUnverifiedError,
	parseBandcampDownloads,
} from './bandcamp-parser';
import {
	getExpectedFilename,
	isUniquifiedVariantOf,
	toBaseFileName,
} from './expected-filenames';
import { notifyBatchFinished, takeBatchNotifyPending } from './notify';
import {
	drainQueuedBatchDownloadItems,
	getBatchDownloadItems,
	isRunningBatchDownloadItem,
	patchItem,
	setDownloadsShelfEnabledSafe,
	updateBatchDownloadItems,
	updateParentsProgress,
} from './state';
import {
	applySharedRateLimitPause,
	isOccupyingConcurrencySlot,
	MAX_RATE_LIMIT_ATTEMPTS,
	pickPendingToResolve,
	pickResolvedToStart,
	planNextWake,
	replacePendingWithBundle,
	replacePendingWithSingle,
} from './tick-logic';
import {
	broadcastBatchDownloadProgress,
	isDownloadsUiConnected,
} from './ui-presence';

const MAX_PROGRESS_UPDATE_PER_TICK = 10;

// Periodic alarm that wakes the MV3 service worker while batch work is active,
// so ticking and progress polling recover even if all other events are missed.
// 0.5 is the minimum period since Chrome 120; older versions clamp it to 1.
const WATCHDOG_ALARM_NAME = 'band-play-batch-download-watchdog';
const WATCHDOG_ALARM_PERIOD_MINUTES = 0.5;

// One-shot alarm mirroring long retry backoffs: setTimeout dies with the
// service worker, an alarm fires even after it was shut down in between.
const RETRY_ALARM_NAME = 'band-play-batch-download-retry';
const RETRY_ALARM_MIN_DELAY_MS = 25_000;

const isAlarmsApiAvailable = typeof chrome.alarms !== 'undefined';

// Automatic retries for interrupted/failed downloads: 5s, 10s, 20s.
const MAX_AUTO_RETRIES = 3;
const RETRY_BACKOFF_BASE_MS = 5000;

// Backoff steps after Bandcamp HTTP 429 responses, with ±30% jitter.
const RATE_LIMIT_BACKOFF_MS = [10_000, 15_000, 30_000, 60_000];
const RATE_LIMIT_JITTER = 0.3;

// A "completed" file smaller than this is most likely an HTML error stub.
const MIN_PLAUSIBLE_COMPLETED_BYTES = 16 * 1024;

const withJitter = (ms: number): number => {
	const delta = ms * RATE_LIMIT_JITTER;
	return Math.round(ms - delta + Math.random() * delta * 2);
};

const rateLimitDelayMs = (attempt: number): number => {
	const index = Math.min(
		Math.max(attempt - 1, 0),
		RATE_LIMIT_BACKOFF_MS.length - 1
	);
	return withJitter(RATE_LIMIT_BACKOFF_MS[index]);
};

const autoRetryDelayMs = (attempt: number): number =>
	RETRY_BACKOFF_BASE_MS * 2 ** Math.max(attempt - 1, 0);

export class BatchDownloadRunner {
	private isBatchTickRunning = false;
	private isBatchTickScheduled = false;
	private batchTickTimeoutId: number = null;
	private batchTickDueAt: number = null;

	private downloadsProgressPollerId: number = null;
	private pollingLastProgressByDownloadId: Record<number, number> = {};
	private pollingLastProgressUpdateAt: Record<number, number> = {};
	private isWatchdogAlarmEnsured = false;

	/**
	 * Detects whether the browser uniquified the download's filename because
	 * the target file already existed. Compares against the pre-uniquify name
	 * recorded in onDeterminingFilename when available; otherwise (Firefox,
	 * or after a browser restart) it looks for the file without the " (n)"
	 * suffix in the browser's downloads.
	 */
	private async isUniquifiedDuplicateFile(
		d: chrome.downloads.DownloadItem
	): Promise<boolean> {
		const fileName = toBaseFileName(d.filename);
		if (!fileName) {
			return false;
		}

		const expected = await getExpectedFilename(d.id);
		if (exist(expected)) {
			return isUniquifiedVariantOf(expected, fileName);
		}

		// No recorded name (Firefox, or the entry was evicted): "Album (2).zip" can be a real
		// title, so it is a duplicate only when the browser already has the file without " (n)"
		const match = /^(.*?) ?\(\d+\)(\.[^./\\]+)?$/.exec(d.filename ?? '');
		if (notExist(match)) {
			return false;
		}

		const original = `${match[1]}${match[2] ?? ''}`;
		try {
			const existing = await chrome.downloads.search({
				filename: original,
			});
			return existing.some((x) => x.id !== d.id && x.exists !== false);
		} catch {
			return false;
		}
	}

	/** Shows the "batch finished" notification once, when the setting is on and a batch is waiting for it. */
	private async announceFinishedBatch(
		items: BatchDownloadItemModel[]
	): Promise<void> {
		try {
			const startedAt = await takeBatchNotifyPending();
			if (notExist(startedAt)) {
				return;
			}

			const config = await configService.getAll();
			if (!config.batchDownloadNotify) {
				return;
			}

			const failedCount = items.filter(
				(x) =>
					x.type !== DownloadType.Multiple &&
					x.status === DownloadStatus.Failed
			).length;
			await notifyBatchFinished(startedAt, failedCount);
		} catch (_e) {
			// A missing notification must never stop the queue
		}
	}

	private async pauseIfDuplicateDownload(
		downloadId: number,
		itemId: string,
		attemptsLeft: number = 5
	): Promise<void> {
		await new Promise((resolve) => {
			setTimeout(resolve, 400);
		});

		const results = await chrome.downloads.search({ id: downloadId });
		const d = results[0];
		if (!d) {
			return;
		}

		if (d.state !== 'in_progress') {
			return;
		}

		const items = await getBatchDownloadItems();
		const item = items.find((x) => x.id === itemId);
		if (
			item?.type === DownloadType.Single &&
			item.duplicateResumed === true
		) {
			return;
		}

		if (!d.filename) {
			if (attemptsLeft > 0) {
				this.pauseIfDuplicateDownload(
					downloadId,
					itemId,
					attemptsLeft - 1
				).catch(() => void 0);
			}
			return;
		}

		const isUniquifiedDuplicate = await this.isUniquifiedDuplicateFile(d);
		if (!isUniquifiedDuplicate) {
			if (attemptsLeft > 0) {
				this.pauseIfDuplicateDownload(
					downloadId,
					itemId,
					attemptsLeft - 1
				).catch(() => void 0);
			}
			return;
		}

		try {
			await chrome.downloads.pause(downloadId);
		} catch (_e) {
			return;
		}

		const check = await chrome.downloads.search({ id: downloadId });
		if (!check[0]?.paused) {
			return;
		}

		await this.updateItems((current) =>
			patchItem(current, itemId, DownloadType.Single, (x) => ({
				...x,
				status: DownloadStatus.Duplicate,
			}))
		);
		this.scheduleBatchTickSoon(0);
	}

	private async pauseBrowserDownloadSafe(downloadId: number): Promise<void> {
		try {
			await chrome.downloads.pause(downloadId);
		} catch {
			// The download may already be finished or gone
		}
	}

	private async cancelBrowserDownloadSafe(downloadId: number): Promise<void> {
		try {
			await chrome.downloads.cancel(downloadId);
		} catch {
			// The download may already be finished or gone
		}
	}

	private async updateItems(
		update: (items: BatchDownloadItemModel[]) => BatchDownloadItemModel[]
	): Promise<BatchDownloadItemModel[]> {
		return updateBatchDownloadItems(update);
	}

	/**
	 * Schedules an automatic retry with exponential backoff for a failed
	 * single download, or marks it as failed once attempts are exhausted.
	 */
	private scheduleAutoRetryOrFail(x: SingleItem): BatchDownloadItemModel {
		const attempt = (x.retryCount ?? 0) + 1;
		if (attempt > MAX_AUTO_RETRIES) {
			return { ...x, status: DownloadStatus.Failed };
		}

		// Signed Bandcamp URLs expire: refresh one on the final attempt.
		const needsUrlRefresh =
			(x.needsUrlRefresh === true || attempt === MAX_AUTO_RETRIES) &&
			exist(x.pageUrl);

		return {
			...x,
			status: DownloadStatus.Resolved,
			retryCount: attempt,
			nextRetryAt: Date.now() + autoRetryDelayMs(attempt),
			needsUrlRefresh,
			download: {
				...x.download,
				progress: 0,
				browserDownloadId: undefined,
			},
		};
	}

	/**
	 * Re-resolves the file URL from the item's Bandcamp download page.
	 * Returns the refreshed file model, or null when the item was moved to
	 * a non-startable state (failed / waiting for a backoff).
	 */
	private async refreshDownloadFile(
		item: SingleItem
	): Promise<BatchDownloadFileModel | null> {
		if (notExist(item.pageUrl)) {
			return item.download;
		}

		const config = await configService.getAll();
		const format =
			(item.download.format as BatchDownloadFormat) ??
			config.batchDownloadFormat;

		try {
			const downloads = await parseBandcampDownloads(
				item.pageUrl,
				format
			);
			const match =
				downloads.find((d) => d.id === item.download.id) ??
				(downloads.length === 1 ? downloads[0] : null);

			if (notExist(match)) {
				await this.updateItems((current) =>
					patchItem(current, item.id, DownloadType.Single, (x) => {
						// A pause or cancel while the page was fetched wins
						if (x.status !== DownloadStatus.Resolved) {
							return x;
						}

						return { ...x, status: DownloadStatus.Failed };
					})
				);
				return null;
			}

			const refreshedFile: BatchDownloadFileModel = {
				...item.download,
				url: match.url,
				artist: match.artist,
				itemTitle: match.itemTitle,
				format: match.format,
			};

			await this.updateItems((current) =>
				patchItem(current, item.id, DownloadType.Single, (x) => {
					return {
						...x,
						needsUrlRefresh: false,
						download: { ...x.download, ...refreshedFile },
					};
				})
			);
			return refreshedFile;
		} catch (e) {
			await this.updateItems((current) =>
				patchItem(current, item.id, DownloadType.Single, (x) => {
					// A pause or cancel while the page was fetched wins
					if (x.status !== DownloadStatus.Resolved) {
						return x;
					}

					if (e instanceof BandcampRateLimitError) {
						// Reuse retryCount to bound repeated 429 responses.
						const attempt = (x.retryCount ?? 0) + 1;
						if (attempt > MAX_RATE_LIMIT_ATTEMPTS) {
							return { ...x, status: DownloadStatus.Failed };
						}

						return {
							...x,
							retryCount: attempt,
							nextRetryAt:
								Date.now() +
								Math.max(
									rateLimitDelayMs(attempt),
									e.retryAfterMs ?? 0
								),
						};
					}

					return this.scheduleAutoRetryOrFail(x);
				})
			);
			return null;
		}
	}

	/** Finds top-level items that became Completed between two snapshots. */
	private collectNewlyCompletedHistoryEntries(
		before: BatchDownloadItemModel[],
		after: BatchDownloadItemModel[]
	): BatchDownloadHistoryEntry[] {
		const beforeById = new Map(before.map((x) => [x.id, x] as const));
		const afterById = new Map(after.map((x) => [x.id, x] as const));
		const entries: BatchDownloadHistoryEntry[] = [];

		for (const item of after) {
			if (item.status !== DownloadStatus.Completed) {
				continue;
			}

			if (beforeById.get(item.id)?.status === DownloadStatus.Completed) {
				continue;
			}

			if (notExist(item.sourceId)) {
				continue;
			}

			if (item.type === DownloadType.Single && notExist(item.parentId)) {
				if (exist(item.download.format)) {
					entries.push({
						sourceId: item.sourceId,
						format: item.download.format,
					});
				}
				continue;
			}

			if (item.type === DownloadType.Multiple) {
				const child = item.children
					.map((id) => afterById.get(id))
					.find(
						(x) =>
							x?.type === DownloadType.Single &&
							exist(x.download.format)
					);
				if (
					child?.type === DownloadType.Single &&
					exist(child.download.format)
				) {
					entries.push({
						sourceId: item.sourceId,
						format: child.download.format,
					});
				}
			}
		}

		return entries;
	}

	public start(): void {
		this.registerWatchdogAlarm();

		// In case we got restarted while there is pending work:
		// the poller stops itself when no downloads are active.
		this.scheduleBatchTick();
		this.startDownloadsProgressPoller();

		// Events can be missed while the worker (or the whole browser) was
		// down: reconcile tracked downloads with their real browser state.
		this.reconcileActiveDownloads().catch(() => void 0);
	}

	private registerWatchdogAlarm(): void {
		if (!isAlarmsApiAvailable) {
			return;
		}

		chrome.alarms.onAlarm.addListener((alarm) => {
			if (
				alarm.name !== WATCHDOG_ALARM_NAME &&
				alarm.name !== RETRY_ALARM_NAME
			) {
				return;
			}

			this.reconcileActiveDownloads().catch(() => void 0);
			this.startDownloadsProgressPoller();
			this.scheduleBatchTick();
		});
	}

	/**
	 * Syncs every tracked in-flight item with the real state of its browser
	 * download. Completion/interruption events delivered while the service
	 * worker was shut down (or the browser was closed) are recovered here.
	 */
	private async reconcileActiveDownloads(): Promise<void> {
		const items = await getBatchDownloadItems();
		const tracked = items.filter(
			(x) =>
				x.type === DownloadType.Single &&
				(x.status === DownloadStatus.Downloading ||
					x.status === DownloadStatus.Paused ||
					x.status === DownloadStatus.Duplicate) &&
				exist(x.download.browserDownloadId)
		) as SingleItem[];

		for (const item of tracked) {
			await this.updateProgressForDownloadId(
				item.download.browserDownloadId,
				true
			);
		}
	}

	private ensureWatchdogAlarm(): void {
		if (!isAlarmsApiAvailable || this.isWatchdogAlarmEnsured) {
			return;
		}

		this.isWatchdogAlarmEnsured = true;
		try {
			chrome.alarms
				.create(WATCHDOG_ALARM_NAME, {
					periodInMinutes: WATCHDOG_ALARM_PERIOD_MINUTES,
				})
				.catch(() => void 0);
		} catch (_e) {
			// ignore
		}
	}

	private clearWatchdogAlarm(): void {
		if (!isAlarmsApiAvailable) {
			return;
		}

		this.isWatchdogAlarmEnsured = false;
		try {
			Promise.resolve(chrome.alarms.clear(WATCHDOG_ALARM_NAME)).catch(
				() => void 0
			);
			Promise.resolve(chrome.alarms.clear(RETRY_ALARM_NAME)).catch(
				() => void 0
			);
		} catch (_e) {
			// ignore
		}
	}

	/** Mirrors a long retry backoff with a one-shot alarm (see RETRY_ALARM_NAME). */
	private scheduleRetryAlarm(delayMs: number): void {
		if (!isAlarmsApiAvailable || delayMs < RETRY_ALARM_MIN_DELAY_MS) {
			return;
		}

		try {
			chrome.alarms
				.create(RETRY_ALARM_NAME, {
					when: Date.now() + delayMs,
				})
				.catch(() => void 0);
		} catch (_e) {
			// ignore
		}
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
		const dueAt = Date.now() + delayMs;
		if (exist(this.batchTickTimeoutId)) {
			// Keep the earliest deadline: a long retry backoff must not delay
			// a tick that is needed now (for example after a completed download).
			if (this.batchTickDueAt <= dueAt) {
				return;
			}

			clearTimeout(this.batchTickTimeoutId);
		}

		this.batchTickDueAt = dueAt;
		this.batchTickTimeoutId = setTimeout(() => {
			this.batchTickTimeoutId = null;
			this.batchTickDueAt = null;
			this.scheduleBatchTick();
		}, delayMs) as unknown as number;
	}

	public startDownloadsProgressPoller(): void {
		// Fine-grained progress is only consumed by the downloads page: with
		// no page connected the poller would just keep the worker awake.
		// State transitions still arrive through chrome.downloads.onChanged.
		if (!isDownloadsUiConnected()) {
			return;
		}

		if (exist(this.downloadsProgressPollerId)) {
			return;
		}

		// Force a fresh push for every active download when the UI (re)opens:
		// the page only has the last persisted (transition-time) progress.
		this.pollingLastProgressByDownloadId = {};
		this.pollingLastProgressUpdateAt = {};

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

	/**
	 * Resets transient states left behind by a service worker shutdown.
	 * `Resolving` and `Queued` normally live only inside a single tick, so
	 * finding them at tick start means the previous worker died mid-step.
	 */
	private async recoverStaleTransientItems(
		items: BatchDownloadItemModel[]
	): Promise<BatchDownloadItemModel[]> {
		const staleQueued = items.filter(
			(x) =>
				x.type === DownloadType.Single &&
				x.status === DownloadStatus.Queued
		) as SingleItem[];
		const hasStaleResolving = items.some(
			(x) =>
				x.type === DownloadType.Pending &&
				x.status === DownloadStatus.Resolving
		);

		if (staleQueued.length === 0 && !hasStaleResolving) {
			return items;
		}

		// A Queued item may have actually started before the worker died:
		// adopt the existing browser download instead of starting a second one.
		const adoptedByItemId = new Map<string, number>();
		for (const item of staleQueued) {
			try {
				const results = await chrome.downloads.search({
					url: item.download.url,
					orderBy: ['-startTime'],
					limit: 1,
				});
				const d = results[0];
				if (notExist(d) || d.state === 'interrupted') {
					continue;
				}

				const startedAt = new Date(d.startTime).getTime();
				if (
					exist(item.createdAt) &&
					Number.isFinite(startedAt) &&
					startedAt < item.createdAt
				) {
					// Older download of the same URL: not ours.
					continue;
				}

				adoptedByItemId.set(item.id, d.id);
			} catch (_e) {
				// ignore
			}
		}

		const next = await this.updateItems((current) =>
			current.map((x): BatchDownloadItemModel => {
				if (
					x.type === DownloadType.Pending &&
					x.status === DownloadStatus.Resolving
				) {
					return { ...x, status: DownloadStatus.Pending };
				}

				if (
					x.type === DownloadType.Single &&
					x.status === DownloadStatus.Queued
				) {
					const adoptedDownloadId = adoptedByItemId.get(x.id);
					if (exist(adoptedDownloadId)) {
						return {
							...x,
							status: DownloadStatus.Downloading,
							download: {
								...x.download,
								browserDownloadId: adoptedDownloadId,
							},
						};
					}

					return {
						...x,
						status: DownloadStatus.Resolved,
						download: {
							...x.download,
							browserDownloadId: undefined,
						},
					};
				}

				return x;
			})
		);

		// Adopted downloads may already be finished: reconcile them now.
		for (const downloadId of adoptedByItemId.values()) {
			await this.updateProgressForDownloadId(downloadId, true);
		}

		if (adoptedByItemId.size > 0) {
			return getBatchDownloadItems();
		}

		return next;
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
			let items = await drainQueuedBatchDownloadItems();

			// 1.5) Recover transient states from a mid-tick worker shutdown.
			items = await this.recoverStaleTransientItems(items);

			// 2) Ensure downloads shelf is disabled while there is running work.
			const hasActive = items.some(isRunningBatchDownloadItem);
			if (hasActive) {
				setDownloadsShelfEnabledSafe(false);
				this.ensureWatchdogAlarm();
			}

			// 3) Resolve a few pending items per tick to keep the pipeline filled.
			await this.resolvePendingItems(items);

			// 4) Start downloads up to configured concurrency.
			const concurrency = await this.startResolvedItems();

			// 5) Update parent progress (derived).
			await this.updateItems((current) => updateParentsProgress(current));

			// 6) Re-enable shelf when nothing runs any more (paused and duplicate items wait for the user).
			const finalItems = await getBatchDownloadItems();
			const stillActive = finalItems.some(isRunningBatchDownloadItem);
			if (!stillActive) {
				setDownloadsShelfEnabledSafe(true);
				this.stopDownloadsProgressPoller();
				this.clearWatchdogAlarm();
				await this.announceFinishedBatch(finalItems);
			}

			// 7) Keep ticking while there is work to do (fills concurrency without waiting for completion events).
			this.scheduleNextTick(finalItems, concurrency);

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

	/** Step 7: tick again at once, at the earliest retry time, or not at all (`planNextWake`). */
	private scheduleNextTick(
		finalItems: BatchDownloadItemModel[],
		concurrency: number
	): void {
		const wake = planNextWake(finalItems, concurrency, Date.now());

		if (wake.action === 'tick-now') {
			this.scheduleBatchTickSoon(0);
			return;
		}

		if (wake.action === 'tick-at') {
			this.scheduleBatchTickSoon(wake.delayMs);
			// setTimeout dies with the worker: long backoffs are
			// mirrored by a one-shot alarm that survives shutdown.
			this.scheduleRetryAlarm(wake.delayMs);
		}
	}

	/** Step 3: resolves the releases picked for this tick, one after another. */
	private async resolvePendingItems(
		items: BatchDownloadItemModel[]
	): Promise<void> {
		const configForResolve = await configService.getAll();
		const toResolve = pickPendingToResolve(items, Date.now());

		for (const pending of toResolve) {
			const outcome = await this.resolvePendingItem(
				pending,
				configForResolve.batchDownloadFormat
			);
			if (outcome === 'stop') {
				break;
			}
		}
	}

	/**
	 * Parses the Bandcamp download page of one release and replaces the release with its file or files.
	 *
	 * @returns 'stop' when Bandcamp throttled us (the other releases wait too), else 'next'.
	 */
	private async resolvePendingItem(
		pending: PendingItem,
		defaultFormat: BatchDownloadFormat
	): Promise<'next' | 'stop'> {
		await this.updateItems((current) =>
			patchItem(current, pending.id, DownloadType.Pending, (x) => ({
				...x,
				status: DownloadStatus.Resolving,
			}))
		);

		let downloads: Awaited<ReturnType<typeof parseBandcampDownloads>> = [];
		try {
			downloads = await parseBandcampDownloads(
				pending.url,
				pending.format ?? defaultFormat
			);
		} catch (e) {
			if (e instanceof BandcampUnverifiedError) {
				await this.updateItems((current) =>
					patchItem(
						current,
						pending.id,
						DownloadType.Pending,
						(x) => ({
							...x,
							status: DownloadStatus.Failed,
							failReason: 'unverified',
						})
					)
				);
				return 'next';
			}

			if (e instanceof BandcampRateLimitError) {
				const retryAfterMs = e.retryAfterMs ?? 0;
				await this.updateItems((current) =>
					applySharedRateLimitPause(
						current,
						pending.id,
						Date.now(),
						(attempt) =>
							Math.max(rateLimitDelayMs(attempt), retryAfterMs)
					)
				);
				return 'stop';
			}

			await this.markPendingFailed(pending.id);
			return 'next';
		}

		if (downloads.length === 0) {
			await this.markPendingFailed(pending.id);
			return 'next';
		}

		if (downloads.length === 1) {
			await this.updateItems((current) =>
				replacePendingWithSingle(current, pending, downloads[0])
			);
			return 'next';
		}

		await this.updateItems((current) =>
			replacePendingWithBundle(current, pending, downloads)
		);
		return 'next';
	}

	private async markPendingFailed(id: string): Promise<void> {
		await this.updateItems((current) =>
			patchItem(current, id, DownloadType.Pending, (x) => ({
				...x,
				status: DownloadStatus.Failed,
			}))
		);
	}

	/**
	 * Step 4: starts resolved files while a concurrency slot is free.
	 *
	 * @returns The configured concurrency, which the next-tick decision uses.
	 */
	private async startResolvedItems(): Promise<number> {
		const items = await getBatchDownloadItems();
		const config = await configService.getAll();
		const concurrency = config.batchDownloadConcurrency;

		const countDownloading = items.filter(
			isOccupyingConcurrencySlot
		).length;

		if (countDownloading > 0) {
			// Make sure progress keeps being tracked after a service worker
			// restart, even when no new download can be started.
			this.startDownloadsProgressPoller();
		}

		let available = Math.max(concurrency - countDownloading, 0);
		if (available > 0) {
			const toStart = pickResolvedToStart(items, Date.now());

			for (const item of toStart) {
				if (available <= 0) {
					break;
				}

				if (await this.startResolvedItem(item)) {
					available--;
				}
			}
		}

		return concurrency;
	}

	/**
	 * Starts the browser download of one resolved file.
	 *
	 * @returns Whether the download started and holds a slot now.
	 */
	private async startResolvedItem(item: SingleItem): Promise<boolean> {
		// Retry flows re-resolve the (possibly expired) file URL.
		let downloadFile = item.download;
		if (item.needsUrlRefresh === true) {
			const refreshedFile = await this.refreshDownloadFile(item);
			if (notExist(refreshedFile)) {
				return false;
			}

			downloadFile = refreshedFile;
		}
		const downloadUrl = downloadFile.url;

		// The loop awaits between items: a pause or cancel made meanwhile wins
		let isQueued = false;
		await this.updateItems((current) =>
			patchItem(current, item.id, DownloadType.Single, (x) => {
				if (x.status !== DownloadStatus.Resolved) {
					return x;
				}

				isQueued = true;
				return { ...x, status: DownloadStatus.Queued };
			})
		);
		if (!isQueued) {
			return false;
		}

		let isStarted = false;
		try {
			const downloadId = await chrome.downloads.download({
				url: downloadUrl,
				conflictAction: 'uniquify',
				// A batch must not open a save dialog per file
				saveAs: false,
			});

			// The user may have paused, cancelled or removed the item
			// while chrome.downloads.download() was running.
			let stateAfterStart: DownloadStatus | null = null;
			await this.updateItems((current) =>
				patchItem(current, item.id, DownloadType.Single, (x) => {
					stateAfterStart = x.status;
					if (x.status === DownloadStatus.Paused) {
						// Keep the download, paused, so a resume continues it
						return {
							...x,
							download: {
								...x.download,
								url: downloadUrl,
								browserDownloadId: downloadId,
							},
						};
					}

					if (x.status !== DownloadStatus.Queued) {
						return x;
					}

					return {
						...x,
						status: DownloadStatus.Downloading,
						nextRetryAt: undefined,
						download: {
							...x.download,
							url: downloadUrl,
							browserDownloadId: downloadId,
						},
					};
				})
			);

			if (stateAfterStart === DownloadStatus.Paused) {
				await this.pauseBrowserDownloadSafe(downloadId);
				return false;
			}

			if (stateAfterStart !== DownloadStatus.Queued) {
				await this.cancelBrowserDownloadSafe(downloadId);
				return false;
			}

			isStarted = true;

			this.startDownloadsProgressPoller();
			this.pauseIfDuplicateDownload(downloadId, item.id).catch(
				() => void 0
			);
		} catch (_e) {
			await this.updateItems((current) =>
				patchItem(current, item.id, DownloadType.Single, (x) =>
					this.scheduleAutoRetryOrFail(x)
				)
			);
		}

		return isStarted;
	}

	public async updateProgressForDownloadId(
		downloadId: number,
		bypassThrottle: boolean = false
	): Promise<void> {
		const results = await chrome.downloads.search({ id: downloadId });
		const d = results[0];
		if (!d) {
			return;
		}

		await this.applyDownloadSnapshot(d, bypassThrottle);
	}

	private async applyDownloadSnapshot(
		d: chrome.downloads.DownloadItem,
		bypassThrottle: boolean
	): Promise<void> {
		const downloadId = d.id;
		const now = Date.now();
		const lastAt = this.pollingLastProgressUpdateAt[downloadId] ?? 0;

		// State transitions (complete/interrupted) bypass the throttle: they
		// may be the only event delivered after a service worker restart.
		if (!bypassThrottle && now - lastAt < 250) {
			return;
		}

		this.pollingLastProgressUpdateAt[downloadId] = now;

		const total = Number(d.totalBytes);
		const received = Number(d.bytesReceived);
		const rawCompleted = d.state === 'complete';
		// The browser may report "complete" for a tiny HTML error stub, so
		// verify the saved file looks plausible before trusting completion.
		const completedBytes =
			Number(d.fileSize) > 0 ? Number(d.fileSize) : received;
		const isSuspectMime =
			typeof d.mime === 'string' &&
			d.mime.toLowerCase().includes('text/html');
		const isPlausiblyComplete =
			d.exists !== false &&
			!isSuspectMime &&
			(completedBytes <= 0 ||
				completedBytes >= MIN_PLAUSIBLE_COMPLETED_BYTES);
		const isCompleted = rawCompleted && isPlausiblyComplete;
		const isInterrupted = d.state === 'interrupted';
		const isFailedLike =
			isInterrupted || (rawCompleted && !isPlausiblyComplete);
		// USER_SHUTDOWN (browser closed mid-download) is not a deliberate
		// cancellation: those downloads are resumed or retried below.
		const isUserCanceled = d.error === 'USER_CANCELED';
		const isPaused = d.state === 'in_progress' && d.paused === true;
		const isUniquifiedDuplicate = await this.isUniquifiedDuplicateFile(d);

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

		let scheduleTick = false;
		let restartPoller = false;
		let completedEntries: BatchDownloadHistoryEntry[] = [];
		let progressOnlyUpdate: { id: string; progress: number } = null;

		await updateBatchDownloadItems(async (current) => {
			const trackedItem = current.find(
				(x) =>
					x.type === DownloadType.Single &&
					x.download.browserDownloadId === downloadId
			);
			if (!trackedItem) {
				return current;
			}

			const duplicateResumed =
				trackedItem.type === DownloadType.Single &&
				trackedItem.duplicateResumed === true;
			let didPauseDuplicate = false;
			if (
				isUniquifiedDuplicate &&
				!isPaused &&
				d.state === 'in_progress' &&
				!duplicateResumed
			) {
				try {
					await chrome.downloads.pause(downloadId);
					didPauseDuplicate = true;
				} catch (_e) {
					// ignore
				}
			}

			// An HTML error stub that the browser saved as "complete" is
			// removed, so the retry does not get a uniquified name and pause
			// as a duplicate of the stub
			if (rawCompleted && !isPlausiblyComplete && d.exists !== false) {
				try {
					await chrome.downloads.removeFile(downloadId);
				} catch (_e) {
					// ignore
				}
			}

			// Interrupted downloads the browser can resume from where they
			// stopped (network drop, browser shutdown) are resumed in place
			// instead of re-downloaded. Bounded by the auto-retry budget.
			let resumedInterrupted = false;
			if (
				isInterrupted &&
				!isUserCanceled &&
				d.canResume === true &&
				trackedItem.type === DownloadType.Single &&
				(trackedItem.retryCount ?? 0) < MAX_AUTO_RETRIES
			) {
				try {
					// Re-check inside the serialized write: a concurrent
					// snapshot of the same event may have resumed it already.
					const fresh = (
						await chrome.downloads.search({ id: downloadId })
					)[0];
					if (
						fresh?.state === 'interrupted' &&
						fresh.canResume === true
					) {
						await chrome.downloads.resume(downloadId);
						resumedInterrupted = true;
					} else if (
						fresh?.state === 'in_progress' ||
						fresh?.state === 'complete'
					) {
						resumedInterrupted = true;
					}
				} catch (_e) {
					// Fall through to the regular auto-retry flow.
				}
			}

			let statusChanged = false;
			let progressChanged = false;
			let trackedProgress: number = null;
			let items = current.map((x): BatchDownloadItemModel => {
				if (
					x.type !== DownloadType.Single ||
					x.download.browserDownloadId !== downloadId
				) {
					return x;
				}

				if (isFailedLike) {
					statusChanged = true;
					scheduleTick = true;
					if (isUserCanceled) {
						// Deliberate cancellation must not be retried.
						return { ...x, status: DownloadStatus.Failed };
					}

					if (resumedInterrupted) {
						// The transfer continues in place; count one attempt.
						restartPoller = true;
						return {
							...x,
							status: DownloadStatus.Downloading,
							retryCount: (x.retryCount ?? 0) + 1,
						};
					}

					return this.scheduleAutoRetryOrFail(x);
				}

				let nextStatus = x.status;
				if (isCompleted) {
					nextStatus = DownloadStatus.Completed;
				} else if (
					isUniquifiedDuplicate &&
					(isPaused || didPauseDuplicate) &&
					!x.duplicateResumed
				) {
					nextStatus = DownloadStatus.Duplicate;
					scheduleTick = true;
				} else if (isPaused) {
					nextStatus =
						x.status === DownloadStatus.Duplicate
							? DownloadStatus.Duplicate
							: DownloadStatus.Paused;
				} else if (
					x.status === DownloadStatus.Paused ||
					x.status === DownloadStatus.Duplicate
				) {
					nextStatus = DownloadStatus.Downloading;
				}

				const nextProgress = isCompleted
					? 100
					: hasProgressUpdate
						? Math.max(progress, 0)
						: x.download.progress;

				if (x.status !== nextStatus) {
					statusChanged = true;
					if (nextStatus === DownloadStatus.Downloading) {
						restartPoller = true;
					}
				}

				if (x.download.progress !== nextProgress) {
					progressChanged = true;
					trackedProgress = nextProgress;
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

			if (!statusChanged && !progressChanged) {
				scheduleTick = false;
				return current;
			}

			if (!statusChanged) {
				// Progress-only change: push it to the UI over the port and
				// skip the disk write. Status transitions persist the fresh
				// progress value, so storage stays accurate where it matters.
				scheduleTick = false;
				progressOnlyUpdate = {
					id: trackedItem.id,
					progress: trackedProgress,
				};
				return current;
			}

			items = updateParentsProgress(items);
			completedEntries = this.collectNewlyCompletedHistoryEntries(
				current,
				items
			);
			return items;
		});

		if (exist(progressOnlyUpdate)) {
			broadcastBatchDownloadProgress([progressOnlyUpdate]);
		}

		if (completedEntries.length > 0) {
			addBatchDownloadHistoryEntries(completedEntries).catch(
				() => void 0
			);
		}

		if (restartPoller) {
			this.startDownloadsProgressPoller();
		}

		if (scheduleTick) {
			this.scheduleBatchTickSoon(0);
		}
	}

	private async pollActiveDownloadsProgress(): Promise<void> {
		if (!isDownloadsUiConnected()) {
			this.stopDownloadsProgressPoller();
			return;
		}

		// Only Downloading items produce byte progress; paused items change
		// state through user actions or onChanged events, and polling them
		// here would keep the service worker awake indefinitely.
		const items = await getBatchDownloadItems();
		const active = items.filter(
			(x) =>
				x.type === DownloadType.Single &&
				x.status === DownloadStatus.Downloading
		) as SingleItem[];

		if (active.length === 0) {
			this.stopDownloadsProgressPoller();
			return;
		}

		// One downloads.search per tick instead of one per item.
		let inProgress: chrome.downloads.DownloadItem[];
		try {
			inProgress = await chrome.downloads.search({
				state: 'in_progress',
			});
		} catch (_e) {
			return;
		}

		const byDownloadId = new Map(inProgress.map((d) => [d.id, d] as const));

		// Keep work bounded per tick.
		for (const item of active.slice(0, MAX_PROGRESS_UPDATE_PER_TICK)) {
			const downloadId = item.download.browserDownloadId;
			if (!downloadId) {
				continue;
			}

			const d = byDownloadId.get(downloadId);
			if (exist(d)) {
				await this.applyDownloadSnapshot(d, false);
				continue;
			}

			// Not in-progress anymore: reconcile the terminal state directly.
			await this.updateProgressForDownloadId(downloadId, true);
		}
	}
}
