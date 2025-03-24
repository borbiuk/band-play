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

export abstract class BasePageService<TTrackModel> implements PageService {
	config: ConfigModel;
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
