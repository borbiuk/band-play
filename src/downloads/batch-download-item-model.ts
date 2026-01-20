import { BatchDownloadFileModel } from './batch-download-file-model';
import { BatchDownloadPendingItemModel } from './batch-download-pending-item-model';
import { DownloadStatus } from './download-status';
import { DownloadType } from './download-type';

export type BatchDownloadItemModel =
	| (BatchDownloadPendingItemModel & {
			type: DownloadType.Pending;
			status:
				| DownloadStatus.Pending
				| DownloadStatus.Queued
				| DownloadStatus.Resolving
				| DownloadStatus.Failed;
	  })
	| {
			id: string;
			title: string;
			type: DownloadType.Single;
			status:
				| DownloadStatus.Resolved
				| DownloadStatus.Queued
				| DownloadStatus.Downloading
				| DownloadStatus.Paused
				| DownloadStatus.Completed
				| DownloadStatus.Failed;
			download: BatchDownloadFileModel;
			parentId?: string;
	  }
	| {
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
	  };
