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
	/** Batch download: downloads tab -> background (tab opened, request queued items) */
	BatchDownloadTabOpened = 'band-play-BatchDownloadTabOpened',
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
	/** Batch download: downloads -> background (clear all completed items) */
	BatchDownloadClearCompleted = 'band-play-BatchDownloadClearCompleted',
	/** Batch download: downloads -> background (clear all items and cancel underlying chrome downloads if needed) */
	BatchDownloadClearAll = 'band-play-BatchDownloadClearAll',
	/** Batch download: downloads -> background (remove item and cancel underlying chrome downloads if needed) */
	BatchDownloadRemoveItem = 'band-play-BatchDownloadRemoveItem',
	/** Batch download: downloads -> background (reveal downloaded file in system file manager) */
	BatchDownloadShowInFolder = 'band-play-BatchDownloadShowInFolder',
}
