import { MessageCode } from '@shared/enums';
import { ConfigModel } from '@shared/models/config-model';
import messageService from '@shared/services/message-service';
import { notExist } from '@shared/utils';

import { PlaybackPitchAction } from '../../enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../../enums/playback-speed-action';
import { PageService } from '../page-service';

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

	isServiceUrl(_url: string): boolean {
		return false;
	}

	initTracks(): void {}

	resetTracks(): void {}

	tryAutoplay(): void {}

	playNextTrack(_next: boolean): void {}

	playTrackByIndex(_index: number): void {}

	playPause(): void {}

	open(_active: boolean): void {}

	addToWishlist(): void {}

	seekToPercentage(_percentage: number): void {}

	seekForward(_forward: boolean): void {}

	speedPlayback(_code: PlaybackSpeedAction): void {}

	switchPreservesPitch(_code: PlaybackPitchAction): void {}

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
			.sendToBackground({
				code: MessageCode.CreateNewTab,
				data: {
					url,
					active,
				},
			})
			.catch((e) => console.error(e));
	}
}
