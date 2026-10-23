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
