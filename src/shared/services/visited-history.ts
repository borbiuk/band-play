/** Storage key of the visited history (an array of hashes), shared by the content script and the popup. */
export const VISITED_STORAGE_KEY = 'bp_visited_v1';

/**
 * Number of entries in the stored visited history (a release adds several hashes).
 *
 * @param raw - The stored value of `VISITED_STORAGE_KEY`, of any shape.
 * @returns The number of entries, 0 when nothing valid is stored.
 */
export const countVisited = (raw: unknown): number =>
	Array.isArray(raw) ? raw.length : 0;

/**
 * Forgets every visited release and track. Open Bandcamp pages follow the change.
 */
export const clearVisitedHistory = async (): Promise<void> => {
	await chrome.storage.local.remove(VISITED_STORAGE_KEY);
};
