import { PlaybackPitchAction } from '../enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../enums/playback-speed-action';

export interface PlaybackControl {
	// Play or pause current track.
	playPause(): void;

	// Move the current track playback back or forward.
	movePlayback(forward: boolean): void;

	// Set percentage of the current track playback.
	setPlayback(percentage: number): void;

	// Increase or decrease a speed of the current track.
	speedPlayback(code: PlaybackSpeedAction): void;

	// Switch pitch preserving.
	switchPreservesPitch(code: PlaybackPitchAction): void;
}
