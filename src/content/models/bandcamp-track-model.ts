/**
 * Model representing a track on Bandcamp pages.
 * Contains the track's unique identifier and DOM element reference.
 */
export interface BandcampTrackModel {
	/** Unique identifier for the track */
	id: string;

	/** DOM element representing the track */
	element: Element;
}
