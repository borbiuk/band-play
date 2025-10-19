/**
 * Enumeration of Bandcamp page types supported by the extension.
 * Used for categorizing different page types and their supported features.
 */
export enum Page {
	/** Collection and Wishlist pages */
	Collection = 'Collection/Wishlist',
	/** Individual album and track pages */
	Album = 'Album/Track',
	/** Bandcamp feed page */
	Feed = 'Feed',
	/** Bandcamp discover page */
	Discover = 'Discover',
}
