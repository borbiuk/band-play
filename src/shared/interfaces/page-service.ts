import { PlaybackPitchAction } from '../enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../enums/playback-speed-action';
import { ConfigModel } from '../models/config-model';

/**
 * Interface defining the contract for page-specific services.
 * Each page service (Bandcamp, SoundCloud) must implement this interface
 * to provide consistent functionality across different music streaming platforms.
 */
export interface PageService {
	/** Service configuration containing user preferences and settings */
	config: ConfigModel;

	/**
	 * Check if this service should handle the given URL.
	 * @param url - The URL to check
	 * @returns True if this service should handle the URL, false otherwise
	 */
	isServiceUrl(url: string): boolean;

	/**
	 * Initialize and save available tracks on the current page.
	 * Should be called when the page loads or when tracks change.
	 */
	initTracks(): void;

	/**
	 * Clear the tracks list of the service.
	 * Used when navigating away from the page or resetting state.
	 */
	resetTracks(): void;

	/**
	 * Attempt to play the next track if autoplay is enabled.
	 * Should check configuration and current playback state.
	 */
	tryAutoplay(): void;

	/**
	 * Playlist Control Methods
	 */

	/**
	 * Play the next or previous track in the playlist.
	 * @param next - True to play next track, false to play previous track
	 */
	playNextTrack(next: boolean): void;

	/**
	 * Play a specific track by its index in the available tracks list.
	 * @param index - Zero-based index of the track to play
	 */
	playTrackByIndex(index: number): void;

	/**
	 * Playback Control Methods
	 */

	/**
	 * Toggle play/pause state of the current track.
	 */
	playPause(): void;

	/**
	 * Seek forward or backward in the current track.
	 * @param forward - True to seek forward, false to seek backward
	 */
	seekForward(forward: boolean): void;

	/**
	 * Set the playback position to a specific percentage of the track.
	 * @param percentage - Percentage of track duration (0-100)
	 */
	seekToPercentage(percentage: number): void;

	/**
	 * Adjust the playback speed of the current track.
	 * @param code - Action to perform (increase, decrease, or reset speed)
	 */
	speedPlayback(code: PlaybackSpeedAction): void;

	/**
	 * Control auto-pitch preservation functionality.
	 * @param code - Action to perform (switch or reset auto-pitch)
	 */
	switchPreservesPitch(code: PlaybackPitchAction): void;

	/**
	 * Utility Methods
	 */

	/**
	 * Open the current track in a new browser tab.
	 * @param active - Whether the new tab should be focused/active
	 */
	open(active: boolean): void;

	/**
	 * Add or remove the current track from the user's wishlist.
	 */
	addToWishlist(): void;
}
