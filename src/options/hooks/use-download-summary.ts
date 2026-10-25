import { BATCH_DOWNLOAD_ITEMS_KEY } from '@shared/constants/storage-keys';
import { useStorageValue } from '@shared/hooks/use-storage-value';
import { BatchDownloadItemModel } from '@shared/models/batch-download/batch-download-item-model';
import { toBatchDownloadItems } from '@shared/utils/batch-download-items.utils';
import { computeOverall } from '@shared/utils/batch-download-overall.utils';
import { useMemo } from 'react';

export interface DownloadSummary {
	// Downloads in the list (bundles count by their files).
	total: number;

	// Downloads that finished.
	done: number;

	// Downloads that are waiting or running (failed ones are not active).
	active: number;
}

const summarize = (items: BatchDownloadItemModel[]): DownloadSummary => {
	// A bundle counts by its files, as on the downloads page
	const { total, completed, failed } = computeOverall(items);
	return { total, done: completed, active: total - completed - failed };
};

/**
 * Counts of the batch downloads, kept up to date while the popup is open.
 *
 * @returns The summary, or null until it is loaded.
 */
export const useDownloadSummary = (): DownloadSummary | null => {
	const items = useStorageValue(
		BATCH_DOWNLOAD_ITEMS_KEY,
		toBatchDownloadItems
	);

	return useMemo(() => (items === null ? null : summarize(items)), [items]);
};
