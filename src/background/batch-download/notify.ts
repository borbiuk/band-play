import { getBatchDownloadHistory } from '@shared/services/batch-download-history-service';

/**
 * "A batch is waiting to be announced": the time it started. Set when a batch is queued and the
 * notification setting is on, cleared when the notification is shown. It lives in storage.local,
 * because the MV3 service worker can stop at any time between the start and the end of a batch.
 */
const PENDING_KEY = 'batchDownloadNotifyPending';

/** True when the optional `notifications` permission is granted (the API is missing otherwise). */
const isNotificationsAvailable = (): boolean =>
	typeof chrome.notifications !== 'undefined';

/** Remembers that the batch started now should be announced when it finishes. */
export const markBatchNotifyPending = async (): Promise<void> => {
	await chrome.storage.local.set({ [PENDING_KEY]: Date.now() });
};

/**
 * Returns the start time of the batch to announce and clears the mark, or null when none is waiting.
 * Reading and clearing together means a batch is announced once, however often the runner idles.
 */
export const takeBatchNotifyPending = async (): Promise<number | null> => {
	const data = await chrome.storage.local.get(PENDING_KEY);
	const startedAt = data[PENDING_KEY] as unknown;
	if (typeof startedAt !== 'number') {
		return null;
	}

	await chrome.storage.local.remove(PENDING_KEY);
	return startedAt;
};

/**
 * Shows "N releases downloaded" for a finished batch.
 *
 * @param startedAt - When the batch started; only history entries after it count.
 * @param failedCount - Number of failed downloads in the list.
 */
export const notifyBatchFinished = async (
	startedAt: number,
	failedCount: number
): Promise<void> => {
	if (!isNotificationsAvailable()) {
		return;
	}

	const history = await getBatchDownloadHistory();
	const completed = Object.values(history).filter(
		(completedAt) => completedAt >= startedAt
	).length;
	if (completed === 0 && failedCount === 0) {
		return;
	}

	const parts = [
		`${completed} ${completed === 1 ? 'release' : 'releases'} downloaded`,
	];
	if (failedCount > 0) {
		parts.push(`${failedCount} failed`);
	}

	await chrome.notifications.create({
		type: 'basic',
		iconUrl: chrome.runtime.getURL('assets/logo-128.png'),
		title: 'Band Play',
		message: parts.join(', '),
	});
};
