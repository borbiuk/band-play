import { BatchDownloadFileModel } from './batch-download-file-model';
import { BatchDownloadPendingItemModel } from './batch-download-pending-item-model';
import { DownloadStatus } from './download-status';
import { DownloadType } from './download-type';

type BatchDownloadItemMeta = {
	coverArtUrl?: string;
	collectionIndex?: number;
	createdAt?: number;
	sourceId?: string;
};

export type BatchDownloadItemModel =
	| (BatchDownloadPendingItemModel &
			BatchDownloadItemMeta & {
				type: DownloadType.Pending;
				status:
					| DownloadStatus.Pending
					| DownloadStatus.Queued
					| DownloadStatus.Resolving
					| DownloadStatus.RateLimited
					| DownloadStatus.Failed;
				/** Timestamp before which the item must not be resolved again */
				nextRetryAt?: number;
				/** Number of consecutive rate-limited resolve attempts */
				rateLimitAttempt?: number;
				/** Machine-readable failure reason (e.g. 'unverified') */
				failReason?: string;
			})
	| (BatchDownloadItemMeta & {
			id: string;
			title: string;
			type: DownloadType.Single;
			status:
				| DownloadStatus.Resolved
				| DownloadStatus.Queued
				| DownloadStatus.Downloading
				| DownloadStatus.Paused
				| DownloadStatus.Duplicate
				| DownloadStatus.Completed
				| DownloadStatus.Failed;
			download: BatchDownloadFileModel;
			parentId?: string;
			/** Set when the user manually resumed a Duplicate item; disables duplicate auto-pause */
			duplicateResumed?: boolean;
			/** Bandcamp download page URL the file URL was resolved from */
			pageUrl?: string;
			/** Number of automatic retries performed after interruptions */
			retryCount?: number;
			/** Timestamp before which the download must not be started again */
			nextRetryAt?: number;
			/** Re-resolve the (possibly expired) file URL from pageUrl before the next start */
			needsUrlRefresh?: boolean;
	  })
	| (BatchDownloadItemMeta & {
			id: string;
			title: string;
			type: DownloadType.Multiple;
			status:
				| DownloadStatus.Resolved
				| DownloadStatus.Queued
				| DownloadStatus.Completed
				| DownloadStatus.Failed;
			progress: number;
			children: string[];
			/** Bandcamp download page URL the children were resolved from */
			pageUrl?: string;
	  });
