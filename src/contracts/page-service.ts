import { ConfigModel } from './config-model';
import { TrackModel } from './track-model';

export interface PageService {
	config: ConfigModel;

	tracks: TrackModel[];

	checkUrl(url: string): boolean;

	initTracks(): void;

	tryAutoplay(): void;

	play(index: number): void;

	playNextTrack(next: boolean): void;

	playNextTrackWithPercentage(): void;

	playPause(): void;

	playPercentage(percentage: number): void;

	move(forward: boolean): void;

	open(): void;

	addToWishlist(): void;
}
