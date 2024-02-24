import { MessageCode } from '../../../shared/enums/message-code';
import { PageService } from '../../../shared/interfaces/page-service';
import { ConfigModel } from '../../../shared/models/config-model';
import { TrackModel } from '../../../shared/models/track-model';
import { MessageService } from '../../../shared/services/message-service';
import { notExist } from '../../../shared/utils/utils.common';

export abstract class BasePageService implements PageService {
	config: ConfigModel;
	tracks: TrackModel[] = [];

	protected constructor(protected readonly messageService: MessageService) {}

	isServiceUrl(url: string): boolean {
		return false;
	}

	playPause(): void {}

	playNextTrack(next: boolean): void {}

	playNextTrackWithPercentage(): void {}

	initTracks(): void {}

	movePlayback(forward: boolean): void {}

	playTrackByIndex(index: number): void {}

	setPlayback(percentage: number): void {}

	tryAutoplay(): void {}

	open(): void {}

	addToWishlist(): void {}

	protected getTrackIndex(trackId: string) {
		return this.tracks.findIndex(({ id }: TrackModel) => id === trackId);
	}

	protected createNewTab(url: string): void {
		if (notExist(url)) {
			return;
		}

		this.messageService
			.sendToBackground<string>({
				code: MessageCode.CreateNewTab,
				data: url,
			})
			.catch((error) => {
				console.error(error);
			});
	}
}
