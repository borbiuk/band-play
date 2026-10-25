import { BatchDownloadFileModel } from '@shared/models/batch-download/batch-download-file-model';
import {
	BatchDownloadItemModel,
	PendingItem,
	SingleItem,
} from '@shared/models/batch-download/batch-download-item-model';
import { DownloadStatus } from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';
import { exist, notExist } from '@shared/utils';

import { toChildrenIds } from './state';

/**
 * The decisions of a runner tick that need no browser API: which items to resolve or start, how the list
 * changes after a page was parsed, and when to tick next. The runner does the calls (`chrome.downloads`,
 * the Bandcamp fetch, the alarms) and applies these results.
 */

/** How many pending releases one tick resolves, to keep the pipeline filled without a burst of requests. */
export const MAX_PENDING_RESOLVE_PER_TICK = 3;

/** After this many HTTP 429 responses in a row a release fails. */
export const MAX_RATE_LIMIT_ATTEMPTS = 8;

/**
 * True for a file that holds a concurrency slot. A paused file holds one only when its browser download
 * exists; one paused before it started has nothing to resume and must not block the queue.
 *
 * @param x - An item.
 * @returns Whether the item occupies a slot.
 */
export const isOccupyingConcurrencySlot = (
	x: BatchDownloadItemModel
): boolean => {
	if (x.type !== DownloadType.Single) {
		return false;
	}

	return (
		x.status === DownloadStatus.Downloading ||
		(x.status === DownloadStatus.Paused &&
			exist(x.download.browserDownloadId))
	);
};

/**
 * The releases to resolve in this tick: pending ones, and rate-limited ones whose backoff has elapsed.
 *
 * @param items - The list.
 * @param now - The current time in milliseconds.
 * @returns At most `MAX_PENDING_RESOLVE_PER_TICK` releases, in list order.
 */
export const pickPendingToResolve = (
	items: BatchDownloadItemModel[],
	now: number
): PendingItem[] =>
	items
		.filter((x) => {
			if (x.type !== DownloadType.Pending) {
				return false;
			}

			if (x.status === DownloadStatus.Pending) {
				return true;
			}

			// Rate-limited items resolve again once the backoff elapsed.
			return (
				x.status === DownloadStatus.RateLimited &&
				(notExist(x.nextRetryAt) || x.nextRetryAt <= now)
			);
		})
		.slice(0, MAX_PENDING_RESOLVE_PER_TICK) as PendingItem[];

/**
 * The files that can start now: resolved ones that do not wait for a retry time.
 *
 * @param items - The list.
 * @param now - The current time in milliseconds.
 * @returns The files, in list order.
 */
export const pickResolvedToStart = (
	items: BatchDownloadItemModel[],
	now: number
): SingleItem[] =>
	items.filter(
		(x) =>
			x.type === DownloadType.Single &&
			x.status === DownloadStatus.Resolved &&
			(notExist(x.nextRetryAt) || x.nextRetryAt <= now)
	) as SingleItem[];

/**
 * Replaces a release with its only file.
 *
 * @param current - The list.
 * @param pending - The release that was resolved.
 * @param download - Its file.
 * @returns The new list.
 */
export const replacePendingWithSingle = (
	current: BatchDownloadItemModel[],
	pending: PendingItem,
	download: BatchDownloadFileModel
): BatchDownloadItemModel[] =>
	current.map((x) => {
		if (x.id !== pending.id) {
			return x;
		}

		return {
			id: pending.id,
			title: pending.title,
			coverArtUrl: pending.coverArtUrl,
			collectionIndex: pending.collectionIndex,
			createdAt: pending.createdAt,
			sourceId: pending.sourceId ?? pending.id,
			type: DownloadType.Single,
			status: DownloadStatus.Resolved,
			pageUrl: pending.url,
			download: { ...download, progress: 0 },
		};
	});

/**
 * Replaces a release with a bundle (the parent) and its files, which follow it in the list.
 * Nothing changes when the release is no longer being resolved: Remove or Clear all during the page fetch wins.
 *
 * @param current - The list.
 * @param pending - The release that was resolved.
 * @param downloads - Its files.
 * @returns The new list, or `current` itself when the release is gone.
 */
export const replacePendingWithBundle = (
	current: BatchDownloadItemModel[],
	pending: PendingItem,
	downloads: BatchDownloadFileModel[]
): BatchDownloadItemModel[] => {
	const stillResolving = current.some(
		(x) =>
			x.id === pending.id &&
			x.type === DownloadType.Pending &&
			x.status === DownloadStatus.Resolving
	);
	if (!stillResolving) {
		return current;
	}

	const { coverArtUrl, collectionIndex, createdAt } = pending;
	const withoutParent = current.filter((x) => x.id !== pending.id);
	const childItems: BatchDownloadItemModel[] = downloads.map((d) => ({
		id: `${pending.id}:${d.id}`,
		title: d.title,
		coverArtUrl,
		collectionIndex,
		createdAt,
		sourceId: d.id,
		type: DownloadType.Single,
		status: DownloadStatus.Resolved,
		parentId: pending.id,
		pageUrl: pending.url,
		download: { ...d, progress: 0 },
	}));
	const parent: BatchDownloadItemModel = {
		id: pending.id,
		title: pending.title,
		coverArtUrl,
		collectionIndex,
		createdAt,
		sourceId: pending.sourceId ?? pending.id,
		type: DownloadType.Multiple,
		status: DownloadStatus.Resolved,
		progress: 0,
		children: toChildrenIds(downloads, pending.id),
		pageUrl: pending.url,
	};

	return [...withoutParent, parent, ...childItems];
};

/**
 * One shared pause after Bandcamp answered HTTP 429: the other pending releases wait too (without using
 * their own attempts), so Bandcamp is not asked again while it throttles. The release that was rejected
 * counts the attempt and fails after `MAX_RATE_LIMIT_ATTEMPTS`.
 *
 * @param current - The list.
 * @param pendingId - The id of the release that was rejected.
 * @param now - The current time in milliseconds.
 * @param delayForAttempt - The wait in milliseconds after the given attempt.
 * @returns The new list.
 */
export const applySharedRateLimitPause = (
	current: BatchDownloadItemModel[],
	pendingId: string,
	now: number,
	delayForAttempt: (attempt: number) => number
): BatchDownloadItemModel[] => {
	const failing = current.find(
		(x) => x.id === pendingId && x.type === DownloadType.Pending
	);
	const attempt =
		((failing as { rateLimitAttempt?: number })?.rateLimitAttempt ?? 0) + 1;
	const pauseUntil = now + delayForAttempt(attempt);

	return current.map((x): BatchDownloadItemModel => {
		if (x.type !== DownloadType.Pending) {
			return x;
		}

		if (x.id !== pendingId) {
			return x.status === DownloadStatus.Pending
				? {
						...x,
						status: DownloadStatus.RateLimited,
						nextRetryAt: pauseUntil,
					}
				: x;
		}

		if (attempt > MAX_RATE_LIMIT_ATTEMPTS) {
			return { ...x, status: DownloadStatus.Failed };
		}

		return {
			...x,
			status: DownloadStatus.RateLimited,
			rateLimitAttempt: attempt,
			nextRetryAt: pauseUntil,
		};
	});
};

/** When the runner ticks next. */
export type NextWake =
	| { action: 'tick-now' }
	| { action: 'tick-at'; delayMs: number }
	| { action: 'none' };

/**
 * Decides when to tick again, from the list at the end of a tick.
 *
 * @param items - The list at the end of the tick.
 * @param concurrency - How many downloads may run at once.
 * @param now - The current time in milliseconds.
 * @returns Tick now while there is work and a free slot, else at the earliest retry time, else never.
 */
export const planNextWake = (
	items: BatchDownloadItemModel[],
	concurrency: number,
	now: number
): NextWake => {
	const hasPending = items.some(
		(x) =>
			x.type === DownloadType.Pending &&
			x.status === DownloadStatus.Pending
	);
	const hasResolvedSingles = pickResolvedToStart(items, now).length > 0;
	// The same "occupied slot" definition as when starting, otherwise the tick keeps
	// rescheduling itself when paused items hold every slot.
	const busyNow = items.filter(isOccupyingConcurrencySlot).length;
	const hasCapacity = busyNow < concurrency;

	if ((hasPending || hasResolvedSingles) && hasCapacity) {
		return { action: 'tick-now' };
	}

	// Wake up when the earliest scheduled retry backoff elapses.
	const retryTimestamps = items
		.map((x) => {
			if (
				x.type === DownloadType.Pending &&
				x.status === DownloadStatus.RateLimited
			) {
				return x.nextRetryAt ?? now;
			}

			if (
				x.type === DownloadType.Single &&
				x.status === DownloadStatus.Resolved &&
				exist(x.nextRetryAt) &&
				x.nextRetryAt > now
			) {
				return x.nextRetryAt;
			}

			return null;
		})
		.filter((x): x is number => exist(x));

	if (retryTimestamps.length === 0) {
		return { action: 'none' };
	}

	return {
		action: 'tick-at',
		delayMs: Math.max(Math.min(...retryTimestamps) - now, 0),
	};
};
