import {
	BatchDownloadItemModel,
	SingleItem,
} from '../models/batch-download/batch-download-item-model';
import { DownloadStatus } from '../models/batch-download/download-status';
import { DownloadType } from '../models/batch-download/download-type';

/** Progress of the whole queue. */
export interface Overall {
	// Downloads in the queue: files and not yet resolved releases (a bundle is its files).
	total: number;

	// Downloads that finished.
	completed: number;

	// Downloads that failed.
	failed: number;

	// Done share, 0 to 100 (weighted by size when every size is known).
	donePct: number;

	// Failed share, 0 to 100.
	failedPct: number;

	// Sum of the known sizes, in megabytes.
	knownSizeMb: number;

	// Megabytes downloaded so far (of the known sizes).
	downloadedMb: number;

	// True when every file has a known size, so the numbers are exact.
	allSizesKnown: boolean;
}

const progressOf = (item: SingleItem): number => {
	if (item.status === DownloadStatus.Completed) {
		return 100;
	}

	const value = item.download.progress;
	return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
};

/**
 * Computes the progress of the whole queue from the list.
 * Releases that are not resolved yet count as one download each, with no progress and an unknown size.
 *
 * @param items - All items of the list.
 * @returns The totals and shares.
 */
export const computeOverall = (items: BatchDownloadItemModel[]): Overall => {
	const singles = items.filter(
		(x): x is SingleItem => x.type === DownloadType.Single
	);
	const pending = items.filter((x) => x.type === DownloadType.Pending);

	const total = singles.length + pending.length;
	const completed = singles.filter(
		(x) => x.status === DownloadStatus.Completed
	).length;
	const failed =
		singles.filter((x) => x.status === DownloadStatus.Failed).length +
		pending.filter((x) => x.status === DownloadStatus.Failed).length;

	const knownSizeMb = singles.reduce(
		(sum, x) => sum + (x.download.sizeMb ?? 0),
		0
	);
	const downloadedMb = singles.reduce(
		(sum, x) => sum + (x.download.sizeMb ?? 0) * (progressOf(x) / 100),
		0
	);
	const allSizesKnown =
		total > 0 &&
		pending.length === 0 &&
		singles.every((x) => x.download.sizeMb !== undefined);

	// Weight by size when every size is known, otherwise a plain average
	let donePct = 0;
	if (total > 0) {
		donePct =
			allSizesKnown && knownSizeMb > 0
				? (downloadedMb / knownSizeMb) * 100
				: singles.reduce((sum, x) => sum + progressOf(x), 0) / total;
	}

	return {
		total,
		completed,
		failed,
		donePct,
		failedPct: total === 0 ? 0 : (failed / total) * 100,
		knownSizeMb,
		downloadedMb,
		allSizesKnown,
	};
};
