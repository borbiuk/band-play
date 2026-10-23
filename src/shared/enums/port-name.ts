/**
 * Enumeration of long-lived connection (chrome.runtime.connect) port names.
 */
export enum PortName {
	/** Downloads page <-> background: signals UI presence and carries volatile progress updates */
	BatchDownloadUi = 'band-play-batch-download-ui',
}
