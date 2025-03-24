export enum ShortcutType {
	/* Playlist */
	PlayPause = 'Play/Pause',
	PreviousTrack = 'Play previous track',
	NextTrack = 'Play next track',
	PlayTrackByIndex = 'Play track by index',
	LoopTrack = 'Loop track',

	/* Playback */
	PlaybackSpeedIncrease = 'Increase playback speed',
	PlaybackSpeedDecrease = 'Decrease playback speed',
	PlaybackSpeedReset = 'Reset playback speed',

	AutoPitchSwitch = 'Switch Auto-Pitch',
	AutoPitchReset = 'Reset Auto-Pitch',

	SeekForward = 'Seek forward',
	SeekBackward = 'Seek backward',

	SeekToPercentage = 'Set playback progress',

	/* Common */
	OpenInNewTab = 'Open in new tab',
	OpenInNewTabWithFocus = 'Open in new tab with focus',

	AddToWishlist = 'Add/Remove from Wishlist',
}
