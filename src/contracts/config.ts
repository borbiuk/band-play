export interface Config {

	// Enable autoplay on all pages.
	autoplay: boolean;

	// Enable autoscroll to track that was start playing.
	autoscroll: boolean;

	// Play first track on the page when error occurred.
	playFirst: boolean;

	// Step of track moving in seconds.
	movingStep: number;
}
