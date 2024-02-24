import { ConfigModel } from '../models/config-model';
import { TrackModel } from '../models/track-model';
import { PlaybackControl } from './playback-control';
import { PlaylistControl } from './playlist-control';

export interface PageService extends PlaylistControl, PlaybackControl {
	// Service config.
	config: ConfigModel;

	// Initialized tracks.
	tracks: TrackModel[];

	// Check that Service should be used for received URL.
	isServiceUrl(url: string): boolean;

	// Save available tracks on current page.
	initTracks(): void;

	// Play next track if needed.
	tryAutoplay(): void;

	/**
	 * Utils:
	 */

	// Open current track in new browser Tab.
	open(): void;

	// Add or Remove current track from wishlist.
	addToWishlist(): void;
}
