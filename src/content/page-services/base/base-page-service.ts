import {
	MessageCode,
	PlaybackPitchAction,
	PlaybackSpeedAction,
} from '@shared/enums';
import { PageService } from '@shared/interfaces';
import { ConfigModel } from '@shared/models/config-model';
import { NewTabMessage } from '@shared/models/messages';
import messageService from '@shared/services/message-service';
import { notExist } from '@shared/utils';

/**
 * Abstract base class for page-specific services.
 * Provides default implementations for all PageService interface methods
 * and common functionality for creating new tabs.
 *
 * @template TTrackModel - The type of track model used by the service
 */
export abstract class BasePageService<TTrackModel> implements PageService {
	/** Service configuration containing user preferences and settings */
	config: ConfigModel;

	/** Array of tracks available on the current page */
	tracks: TTrackModel[] = [];

	/**
	 * Protected constructor to prevent direct instantiation.
	 * Subclasses should call super() and initialize their specific functionality.
	 */
	protected constructor() {}

	/**
	 * Check if this service should handle the given URL.
	 * Base implementation returns false - subclasses should override.
	 *
	 * @param url - The URL to check
	 * @returns False by default - subclasses should override
	 */
	isServiceUrl(url: string): boolean {
		return false;
	}

	/**
	 * Initialize and save available tracks on the current page.
	 * Base implementation is empty - subclasses should override.
	 */
	initTracks(): void {}

	/**
	 * Clear the tracks list of the service.
	 * Base implementation is empty - subclasses should override.
	 */
	resetTracks(): void {}

	/**
	 * Attempt to play the next track if autoplay is enabled.
	 * Base implementation is empty - subclasses should override.
	 */
	tryAutoplay(): void {}

	/**
	 * Play the next or previous track in the playlist.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param next - True to play next track, false to play previous track
	 */
	playNextTrack(next: boolean): void {}

	/**
	 * Play a specific track by its index in the available tracks list.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param index - Zero-based index of the track to play
	 */
	playTrackByIndex(index: number): void {}

	/**
	 * Toggle play/pause state of the current track.
	 * Base implementation is empty - subclasses should override.
	 */
	playPause(): void {}

	/**
	 * Open the current track in a new browser tab.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param active - Whether the new tab should be focused/active
	 */
	open(active: boolean): void {}

	/**
	 * Add or remove the current track from the user's wishlist.
	 * Base implementation is empty - subclasses should override.
	 */
	addToWishlist(): void {}

	/**
	 * Set the playback position to a specific percentage of the track.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param percentage - Percentage of track duration (0-100)
	 */
	seekToPercentage(percentage: number): void {}

	/**
	 * Seek forward or backward in the current track.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param forward - True to seek forward, false to seek backward
	 */
	seekForward(forward: boolean): void {}

	/**
	 * Adjust the playback speed of the current track.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param code - Action to perform (increase, decrease, or reset speed)
	 */
	speedPlayback(code: PlaybackSpeedAction): void {}

	/**
	 * Control auto-pitch preservation functionality.
	 * Base implementation is empty - subclasses should override.
	 *
	 * @param code - Action to perform (switch or reset auto-pitch)
	 */
	switchPreservesPitch(code: PlaybackPitchAction): void {}

	/**
	 * Protected helper method to create a new browser tab.
	 * Sends a message to the background script to open a new tab.
	 *
	 * @param url - URL to open in the new tab
	 * @param active - Whether the new tab should be focused/active
	 */
	protected createNewTab(url: string, active: boolean): void {
		if (notExist(url)) {
			return;
		}

		messageService
			.sendToBackground<NewTabMessage>({
				code: MessageCode.CreateNewTab,
				data: {
					url,
					active,
				},
			})
			.catch((error) => {
				console.error(error);
			});
	}
}
