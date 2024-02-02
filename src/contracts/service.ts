import { Config } from './config';

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

export interface Track {
	id: string;
	element: Element;
}
