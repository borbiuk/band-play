export interface PlaybackControl {
	// Move current track playback back or forward.
	movePlayback(forward: boolean): void;

	// Set percentage of current track playback.
	setPlayback(percentage: number): void;
}
