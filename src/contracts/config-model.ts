export interface ConfigModel {
	// Enable autoplay on all pages.
	autoplay: boolean;

	// Enable autoscroll to track that was start playing.
	autoscroll: boolean;

	// Prevents the display from being turned off or dimmed, or the system from sleeping in response to user inactivity.
	keepAwake: boolean;

	// Play first track on the page when error occurred.
	playFirst: boolean;

	// Step of track moving in seconds.
	playbackStep: number;

	// Define if guid is showing.
	showGuide: boolean;
}
