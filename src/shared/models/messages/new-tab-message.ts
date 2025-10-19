/**
 * Message data for creating new browser tabs.
 * Used when opening tracks or albums in new tabs.
 */
export interface NewTabMessage {
	/** URL to open in the new tab */
	url: string;

	/** Whether the new tab should be focused/active */
	active: boolean;
}
