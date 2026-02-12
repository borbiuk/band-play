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
					| DownloadStatus.Failed;
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
	  });
