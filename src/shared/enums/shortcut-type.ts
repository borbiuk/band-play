/**
 * Enumeration of all available keyboard shortcuts in the extension.
 * Each value represents a user-friendly description of the shortcut's function.
 */
export enum ShortcutType {
	/* Playlist */
	/** Play or pause the current track */
	PlayPause = 'Play/Pause',
	/** Play the previous track in the playlist */
	PreviousTrack = 'Play previous track',
	/** Play the next track in the playlist */
	NextTrack = 'Play next track',
	/** Play a specific track by its index number */
	PlayTrackByIndex = 'Play track by index',
	/** Toggle looping of the current track */
	LoopTrack = 'Loop track',

	/* Playback */
	/** Increase the playback speed */
	PlaybackSpeedIncrease = 'Increase playback speed',
	/** Decrease the playback speed */
	PlaybackSpeedDecrease = 'Decrease playback speed',
	/** Reset the playback speed to normal */
	PlaybackSpeedReset = 'Reset playback speed',

	/** Toggle auto-pitch preservation */
	AutoPitchSwitch = 'Switch Auto-Pitch',
	/** Reset auto-pitch settings */
	AutoPitchReset = 'Reset Auto-Pitch',

	/** Seek forward in the current track */
	SeekForward = 'Seek forward',
	/** Seek backward in the current track */
	SeekBackward = 'Seek backward',

	/** Set playback progress to a specific percentage */
	SeekToPercentage = 'Set playback progress',

	/* Common */
	/** Open the current track in a new tab */
	OpenInNewTab = 'Open in new tab',
	/** Open the current track in a new tab and focus on it */
	OpenInNewTabWithFocus = 'Open in new tab with focus',

	/** Add or remove the current track from the wishlist */
	AddToWishlist = 'Add/Remove from Wishlist',
}
