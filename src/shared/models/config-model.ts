import { ShortcutType } from '@shared/enums';

export type ShortcutConfig = {
	[key in ShortcutType]: string;
};

export interface ConfigModel {
	// Enable autoplay on all pages.
	autoplay: boolean;

	// Enable autoscroll to track that was start playing.
	autoscroll: boolean;

	// Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity.
	keepAwake: boolean;

	// Step of track moving in seconds.
	playbackStep: number;

	loopTrack: boolean;

	showFeedPlayer: boolean;

	shortcuts: ShortcutConfig;
}
