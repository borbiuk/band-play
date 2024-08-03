export interface PlaylistControl {
	// Play next track.
	playNextTrack(next: boolean): void;

	// Play track by index of available tracks on current page.
	playTrackByIndex(index: number): void;
}
