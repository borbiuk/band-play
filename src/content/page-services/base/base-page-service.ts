import { PageService } from '../../../shared/interfaces/page-service';
import { ConfigModel } from '../../../shared/models/config-model';
import { TrackModel } from '../../../shared/models/track-model';
import { MessageService } from '../../../shared/services/message-service';

export abstract class BasePageService implements PageService {

	config: ConfigModel;
	tracks: TrackModel[] = [];

	protected constructor(
		protected readonly messageService: MessageService
	) {
	}

	addToWishlist(): void {
	}

	checkUrl(url: string): boolean {
		return false;
	}

	initTracks(): void {
	}

	move(forward: boolean): void {
	}

	open(): void {
	}

	play(index: number): void {
	}

	playNextTrack(next: boolean): void {
	}

	playNextTrackWithPercentage(): void {
	}

	playPause(): void {
	}

	playPercentage(percentage: number): void {
	}

	tryAutoplay(): void {
	}
	
	protected getTrackIndex(trackId: string) {
		return this.tracks.findIndex((x) => x.id === trackId);
	}
}
