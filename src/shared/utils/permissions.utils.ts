/** The optional permission needed for the "batch finished" notification. */
const NOTIFICATIONS: chrome.permissions.Permissions = {
	permissions: ['notifications'],
};

/**
 * Whether the optional `notifications` permission is granted.
 *
 * @returns True when notifications can be shown.
 */
export const hasNotificationsPermission = (): Promise<boolean> =>
	chrome.permissions.contains(NOTIFICATIONS);

/**
 * Asks the user for the optional `notifications` permission.
 * It must be called directly from a user action (a click on a switch), otherwise the browser refuses.
 *
 * @returns True when the permission was granted.
 */
export const requestNotificationsPermission = (): Promise<boolean> =>
	chrome.permissions.request(NOTIFICATIONS);
