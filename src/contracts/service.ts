import { Config } from './config';

export interface Service {
	config: Config;

	tracks: Track[];

	checkUrl(url: string): boolean;

	initTracks(): void;

	tryAutoplay(): any;

	play(index: number): any;

	playNextTrack(next: boolean): any;

	playNextTrackWithPercentage(): any;

	playPause(): any;

	playPercentage(percentage: number): void;

	move(forward: boolean): void;

	open(): void;
}

export interface Track {
	id: string;
	element: Element;
}

