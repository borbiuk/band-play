/**
 * Persistent history of completed batch downloads.
 *
 * Entries are keyed by `${sourceId}::${format}` so a release downloaded in
 * MP3 is still offered as "undownloaded" when the user switches to FLAC.
 * Written by the background runner on completion; read by the content script
 * to mark already-downloaded releases on Bandcamp pages.
 */

export const BATCH_DOWNLOAD_HISTORY_KEY = 'batchDownloadHistory';

/** Map of `${sourceId}::${format}` -> completion timestamp (ms). */
export type BatchDownloadHistory = Record<string, number>;

export interface BatchDownloadHistoryEntry {
	sourceId: string;
	format: string;
}

const HISTORY_KEY_SEPARATOR = '::';

export const batchDownloadHistoryKey = (
	sourceId: string,
	format: string
): string => {
	return `${sourceId}${HISTORY_KEY_SEPARATOR}${format}`;
};

/** Extracts source ids downloaded in the given format from a history map. */
export const downloadedSourceIdsForFormat = (
	history: BatchDownloadHistory,
	format: string
): Set<string> => {
	const suffix = `${HISTORY_KEY_SEPARATOR}${format}`;
	const result = new Set<string>();

	for (const key of Object.keys(history)) {
		if (key.endsWith(suffix)) {
			result.add(key.slice(0, -suffix.length));
		}
	}

	return result;
};

export const getBatchDownloadHistory =
	async (): Promise<BatchDownloadHistory> => {
		const data = await chrome.storage.local.get([
			BATCH_DOWNLOAD_HISTORY_KEY,
		]);
		const raw = data[BATCH_DOWNLOAD_HISTORY_KEY] as unknown;
		if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
			return {};
		}

		return raw as BatchDownloadHistory;
	};

// Serializes history writes so concurrent completions don't lose entries.
let historyWriteChain: Promise<unknown> = Promise.resolve();

export const addBatchDownloadHistoryEntries = (
	entries: BatchDownloadHistoryEntry[]
): Promise<void> => {
	if (entries.length === 0) {
		return Promise.resolve();
	}

	const run = async (): Promise<void> => {
		const history = await getBatchDownloadHistory();
		const now = Date.now();
		for (const entry of entries) {
			history[batchDownloadHistoryKey(entry.sourceId, entry.format)] =
				now;
		}
		await chrome.storage.local.set({
			[BATCH_DOWNLOAD_HISTORY_KEY]: history,
		});
	};

	const result = historyWriteChain.then(run, run);
	historyWriteChain = result.catch(() => void 0);
	return result;
};
