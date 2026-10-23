/**
 * Enumeration of message codes used for inter-component communication.
 * Each code represents a specific type of message that can be sent between
 * background scripts, content scripts, and popup UI.
 */
export enum MessageCode {
	/** Request to create a new browser tab */
	CreateNewTab = 'band-play-CreateNewTab',
	/** Notification that a new extension update is available */
	NewUpdateAvailable = 'band-play-NewUpdateAvailable',
	/** Notification that the page URL has changed */
	UrlChanged = 'band-play-UrlChanged',
	/** Batch download: content -> background (send selected items) */
	BatchDownloadSendItemsToBackground = 'band-play-BatchDownloadSendItemsToBackground',
	/** Batch download: popup/downloads -> background (open or focus downloads tab) */
	BatchDownloadOpenDownloadsTab = 'band-play-BatchDownloadOpenDownloadsTab',
	/** Batch download: downloads -> background (retry single failed item) */
	BatchDownloadRetryItem = 'band-play-BatchDownloadRetryItem',
	/** Batch download: downloads -> background (retry all failed items) */
	BatchDownloadRetryAllFailed = 'band-play-BatchDownloadRetryAllFailed',
	/** Batch download: downloads -> background (pause all active downloads) */
	BatchDownloadPauseAll = 'band-play-BatchDownloadPauseAll',
	/** Batch download: downloads -> background (resume all paused downloads) */
	BatchDownloadResumeAll = 'band-play-BatchDownloadResumeAll',
	/** Batch download: downloads -> background (resume single paused/duplicate item) */
	BatchDownloadResumeItem = 'band-play-BatchDownloadResumeItem',
	/** Batch download: downloads -> background (pause single downloading item) */
	BatchDownloadPauseItem = 'band-play-BatchDownloadPauseItem',
	/** Batch download: downloads -> background (cancel single active item, keep it in the list as failed) */
	BatchDownloadCancelItem = 'band-play-BatchDownloadCancelItem',
	/** Batch download: downloads -> background (delete a completed file from disk) */
	BatchDownloadDeleteFile = 'band-play-BatchDownloadDeleteFile',
	/** Batch download: downloads -> background (clear all completed items) */
	BatchDownloadClearCompleted = 'band-play-BatchDownloadClearCompleted',
	/** Batch download: downloads -> background (clear all items and cancel underlying chrome downloads if needed) */
	BatchDownloadClearAll = 'band-play-BatchDownloadClearAll',
	/** Batch download: downloads -> background (remove item and cancel underlying chrome downloads if needed) */
	BatchDownloadRemoveItem = 'band-play-BatchDownloadRemoveItem',
	/** Batch download: downloads -> background (reveal downloaded file in system file manager) */
	BatchDownloadShowInFolder = 'band-play-BatchDownloadShowInFolder',
	/** Batch download: background -> downloads page (volatile per-item progress pushed over the UI port) */
	BatchDownloadProgressUpdate = 'band-play-BatchDownloadProgressUpdate',
}
