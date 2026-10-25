import { batchDownloadFormatLabel } from '@shared/enums/batch-download-format';
import {
	BatchDownloadItemModel,
	MultipleItem,
	SingleItem,
} from '@shared/models/batch-download/batch-download-item-model';
import { DownloadStatus } from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';

import { formatSizeMb } from './format.utils';
import { displayArtist, displayTitle } from './list.utils';

/** What the status pill shows; every kind has its own icon and label. */
export type StatusKind =
	| 'downloading'
	| 'waiting'
	| 'retrying'
	| 'paused'
	| 'duplicate'
	| 'rate-limited'
	| 'completed'
	| 'failed';

/** What the user can do with a row. */
export interface RowActions {
	pause: boolean;
	resume: boolean;
	retry: boolean;
	cancel: boolean;
	showInFolder: boolean;
	deleteFile: boolean;
	// The Bandcamp download page, when known.
	copyUrl: string | undefined;
}

/** Everything a row shows, computed from an item. */
export interface RowView {
	title: string;
	subtitle: string;
	status: StatusKind;
	statusLabel: string;
	hint: string;
	// Progress bar value (0 to 100), or null when the row has no bar.
	progress: number | null;
	indeterminate: boolean;
	progressTone: 'active' | 'paused' | 'warn';
	actions: RowActions;
}

/** The context a row view needs besides the item. */
export interface RowViewContext {
	// The current time (ms), for countdowns.
	now: number;
	// For a bundle: its files, to tell what the bundle is doing.
	files?: SingleItem[];
	// "2" for the second time the same release is queued.
	duplicateIndex?: number;
}

const STATUS_LABELS: Record<StatusKind, string> = {
	downloading: 'Downloading',
	waiting: 'Waiting',
	retrying: 'Retrying',
	paused: 'Paused',
	duplicate: 'Already exists',
	'rate-limited': 'Rate limited',
	completed: 'Done',
	failed: 'Failed',
};

const formatLabel = (format?: string): string => {
	if (!format) {
		return '';
	}

	return (
		(batchDownloadFormatLabel as Record<string, string>)[format] ??
		format.toUpperCase()
	);
};

const seconds = (until: number | undefined, now: number): number | null =>
	until === undefined ? null : Math.max(Math.ceil((until - now) / 1000), 0);

/** What a bundle is doing, from its files. */
const bundleStatus = (item: MultipleItem, files: SingleItem[]): StatusKind => {
	if (item.status === DownloadStatus.Completed) {
		return 'completed';
	}

	if (item.status === DownloadStatus.Failed) {
		return 'failed';
	}

	if (files.some((x) => x.status === DownloadStatus.Downloading)) {
		return 'downloading';
	}

	if (
		files.some(
			(x) =>
				x.status === DownloadStatus.Paused ||
				x.status === DownloadStatus.Duplicate
		)
	) {
		return 'paused';
	}

	return 'waiting';
};

const statusKind = (
	item: BatchDownloadItemModel,
	files: SingleItem[]
): StatusKind => {
	if (item.type === DownloadType.Multiple) {
		return bundleStatus(item, files);
	}

	switch (item.status) {
		case DownloadStatus.Downloading:
			return 'downloading';
		case DownloadStatus.Paused:
			return 'paused';
		case DownloadStatus.Duplicate:
			return 'duplicate';
		case DownloadStatus.RateLimited:
			return 'rate-limited';
		case DownloadStatus.Completed:
			return 'completed';
		case DownloadStatus.Failed:
			return 'failed';
		default:
			// A file waiting after a failed attempt is "retrying", not just "waiting"
			return item.type === DownloadType.Single &&
				item.status === DownloadStatus.Resolved &&
				(item.retryCount ?? 0) > 0
				? 'retrying'
				: 'waiting';
	}
};

const progressOf = (item: BatchDownloadItemModel): number => {
	const value =
		item.type === DownloadType.Multiple
			? item.progress
			: item.type === DownloadType.Single
				? item.download.progress
				: 0;
	return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
};

const sizeMbOf = (item: BatchDownloadItemModel): number | undefined =>
	item.type === DownloadType.Single ? item.download.sizeMb : undefined;

const hintFor = (
	item: BatchDownloadItemModel,
	status: StatusKind,
	context: RowViewContext
): string => {
	const progress = Math.round(progressOf(item));
	const size = sizeMbOf(item);
	const retryIn = seconds(
		item.type === DownloadType.Multiple ? undefined : item.nextRetryAt,
		context.now
	);

	switch (status) {
		case 'downloading':
			if (item.type === DownloadType.Multiple) {
				return '';
			}

			if (progress <= 0) {
				return 'Starting…';
			}

			return size === undefined
				? `${progress}%`
				: `${formatSizeMb((size * progress) / 100)} of ${formatSizeMb(size)}`;
		case 'paused':
			return item.type === DownloadType.Multiple
				? ''
				: `Paused at ${progress}%`;
		case 'duplicate':
			return 'File already exists. Resume to keep both';
		case 'rate-limited':
			return retryIn === null
				? 'Bandcamp is throttling. Retrying soon'
				: `Bandcamp is throttling. Retry in ${retryIn} s`;
		case 'retrying':
			return retryIn === null || retryIn === 0
				? 'Retrying soon'
				: `Retrying in ${retryIn} s`;
		case 'waiting':
			return 'Waiting for a free slot';
		case 'completed':
			if (item.type === DownloadType.Multiple) {
				return 'All files saved';
			}

			return size === undefined ? 'Saved' : formatSizeMb(size);
		default:
			return item.type === DownloadType.Pending &&
				item.failReason === 'unverified'
				? 'Email not verified'
				: 'Download failed. Try again.';
	}
};

const subtitleFor = (
	item: BatchDownloadItemModel,
	context: RowViewContext
): string => {
	if (item.type === DownloadType.Multiple) {
		const files = context.files ?? [];
		const done = files.filter(
			(x) => x.status === DownloadStatus.Completed
		).length;
		return `Bundle · ${files.length} downloads · ${done} of ${files.length} done`;
	}

	if (item.type === DownloadType.Pending) {
		return formatLabel(item.format);
	}

	const size = sizeMbOf(item);
	return [
		displayArtist(item),
		formatLabel(item.download.format),
		size === undefined ? undefined : formatSizeMb(size),
	]
		.filter(Boolean)
		.join(' · ');
};

/**
 * Computes what a row shows and what the user can do with it.
 *
 * @param item - The item.
 * @param context - The time, the files of a bundle and the repeat number.
 * @returns The view of the row.
 */
export const toRowView = (
	item: BatchDownloadItemModel,
	context: RowViewContext
): RowView => {
	const status = statusKind(item, context.files ?? []);
	const isSingle = item.type === DownloadType.Single;
	const single = isSingle ? item : undefined;
	const hasBar =
		status === 'downloading' ||
		status === 'paused' ||
		status === 'duplicate';
	const progress = progressOf(item);

	const hasFileInBrowser =
		single?.status === DownloadStatus.Completed &&
		single.download.browserDownloadId !== undefined;

	return {
		title:
			context.duplicateIndex === undefined
				? displayTitle(item)
				: `${displayTitle(item)} (${context.duplicateIndex})`,
		subtitle: subtitleFor(item, context),
		status,
		statusLabel: STATUS_LABELS[status],
		hint: hintFor(item, status, context),
		progress: hasBar ? progress : null,
		indeterminate: status === 'downloading' && progress <= 0,
		progressTone:
			status === 'paused'
				? 'paused'
				: status === 'duplicate'
					? 'warn'
					: 'active',
		actions: {
			pause: single?.status === DownloadStatus.Downloading,
			resume:
				single?.status === DownloadStatus.Paused ||
				single?.status === DownloadStatus.Duplicate,
			// Retrying a failed bundle re-queues all of its failed files
			retry: item.status === DownloadStatus.Failed,
			cancel:
				single !== undefined &&
				[
					DownloadStatus.Downloading,
					DownloadStatus.Paused,
					DownloadStatus.Duplicate,
					DownloadStatus.Queued,
					DownloadStatus.Resolved,
				].includes(single.status),
			showInFolder: hasFileInBrowser,
			deleteFile: hasFileInBrowser,
			copyUrl:
				item.type === DownloadType.Pending ? item.url : item.pageUrl,
		},
	};
};
