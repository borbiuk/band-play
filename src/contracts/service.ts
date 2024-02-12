import { Config } from './config';
import { Track } from './track';

export interface Service {
	config: Config;

	tracks: Track[];

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
}
