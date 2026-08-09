/**
 * Basic item selected from Bandcamp pages (collection/purchases) before resolving file URLs.
 */
export interface BatchDownloadPendingItemModel {
	id: string;
	title: string;
	url: string;
	sourceId?: string;
	coverArtUrl?: string;
	collectionIndex?: number;
	createdAt?: number;
}
