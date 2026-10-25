export enum DownloadStatus {
	Pending = 'pending',
	Queued = 'queued',
	Resolving = 'resolving',
	Resolved = 'resolved',
	Downloading = 'downloading',
	Paused = 'paused',
	Duplicate = 'duplicate',
	/** Bandcamp responded with HTTP 429; waiting for the backoff to elapse */
	RateLimited = 'rate-limited',
	Completed = 'completed',
	Failed = 'failed',
}

/** True for a status an item does not leave without a user action: completed or failed. */
export const isTerminalStatus = (status: DownloadStatus): boolean =>
	status === DownloadStatus.Completed || status === DownloadStatus.Failed;

/** True for a status that waits for the user: paused, or a duplicate that waits for Resume. */
export const isPausedStatus = (status: DownloadStatus): boolean =>
	status === DownloadStatus.Paused || status === DownloadStatus.Duplicate;
