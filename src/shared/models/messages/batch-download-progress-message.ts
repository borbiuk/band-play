/**
 * Message data payload for volatile per-item batch-download progress updates
 * pushed from the background to the downloads page over the UI port.
 * Progress values are percentages (0-100); items are addressed by their
 * batch-download item id (not the browser download id).
 */
export interface BatchDownloadProgressMessage {
	updates: {
		id: string;
		progress: number;
	}[];
}
