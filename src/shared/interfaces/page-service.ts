import { PlaybackPitchAction } from '../enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../enums/playback-speed-action';
import { ConfigModel } from '../models/config-model';

export interface PageService {
	// Service config.
	config: ConfigModel;

	// Check that Service should be used for received URL.
	isServiceUrl(url: string): boolean;

	// Save available tracks on current page.
	initTracks(): void;

	// Clear tracks list of service.
	resetTracks(): void;

	// Play next track if needed.
	tryAutoplay(): void;

	/**
	 * Playlist Control:
	 */

	// Play next track.
	playNextTrack(next: boolean): void;

	// Play track by index of available tracks on current page.
	playTrackByIndex(index: number): void;

	/**
	 * Playback Control:
	 */

	// Play or pause current track.
	playPause(): void;

	// Move the current track playback back or forward.
	seekForward(forward: boolean): void;

	// Set percentage of the current track playback.
	seekToPercentage(percentage: number): void;

	// Increase or decrease a speed of the current track.
	speedPlayback(code: PlaybackSpeedAction): void;

	// Switch pitch preserving.
	switchPreservesPitch(code: PlaybackPitchAction): void;

	/**
	 * Utils:
	 */

	// Open current track in new browser Tab.
	open(active: boolean): void;

	// Add or Remove current track from wishlist.
	addToWishlist(): void;
}
