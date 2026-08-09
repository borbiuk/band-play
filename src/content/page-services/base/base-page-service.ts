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
	config: ConfigModel;

	/** Array of tracks available on the current page */
	tracks: TTrackModel[] = [];

	protected constructor() {}

	isServiceUrl(url: string): boolean {
		return false;
	}

	initTracks(): void {}

	resetTracks(): void {}

	tryAutoplay(): void {}

	playNextTrack(next: boolean): void {}

	playTrackByIndex(index: number): void {}

	playPause(): void {}

	open(active: boolean): void {}

	addToWishlist(): void {}

	seekToPercentage(percentage: number): void {}

	seekForward(forward: boolean): void {}

	speedPlayback(code: PlaybackSpeedAction): void {}

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
			.catch((e) => console.error(e));
	}
}
