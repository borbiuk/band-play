import { BatchDownloadFormat, ShortcutType } from '@shared/enums';

/**
 * Configuration type for keyboard shortcuts.
 * Maps each shortcut type to its corresponding key combination string.
 */
export type ShortcutConfig = {
	[key in ShortcutType]: string;
};

/**
 * Main configuration model for the Bandcamp Play extension.
 * Contains all user preferences and settings.
 */
export interface ConfigModel {
	/** Enable autoplay on all pages */
	autoplay: boolean;

	/** Enable autoscroll to track that was start playing */
	autoscroll: boolean;

	/** Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity */
	keepAwake: boolean;

	/** Highlight already visited/listened albums and tracks on Bandcamp pages */
	highlightVisited: boolean;

	/** Step of track moving in seconds */
	playbackStep: number;

	/** Enable track looping functionality */
	loopTrack: boolean;

	/** Show the custom feed player on Bandcamp feed pages */
	showFeedPlayer: boolean;

	/** Keyboard shortcuts configuration */
	shortcuts: ShortcutConfig;

	/** Preferred download format for batch downloads on Bandcamp */
	batchDownloadFormat: BatchDownloadFormat;

	/** Number of concurrent active downloads for batch downloads */
	batchDownloadConcurrency: number;
}
