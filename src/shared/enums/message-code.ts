/**
 * Enumeration of message codes used for inter-component communication.
 * Each code represents a specific type of message that can be sent between
 * background scripts, content scripts, and popup UI.
 */
export enum MessageCode {
	/** Request to create a new browser tab */
	CreateNewTab = 'band-play-CreateNewTab',
	/** Notification that a new extension update is available */
	NewUpdateAvailable = 'band-play-NewUpdateAvailable',
	/** Notification that the page URL has changed */
	UrlChanged = 'band-play-UrlChanged',
}
