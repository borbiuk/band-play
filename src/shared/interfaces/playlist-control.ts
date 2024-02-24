export interface PlaylistControl {
	// Play or Pause current track.
	playPause(): void;

	// Play next track.
	playNextTrack(next: boolean): void;

	// Play next track with saving of playback percentage.
	playNextTrackWithPercentage(): void;

	// Play track by index of available tracks on current page.
	playTrackByIndex(index: number): void;
}
