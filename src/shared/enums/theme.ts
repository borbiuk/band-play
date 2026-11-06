/**
 * Color theme of the popup and the downloads page.
 * `System` follows the browser or system setting (`prefers-color-scheme`).
 */
export enum Theme {
	System = 'system',
	Light = 'light',
	Dark = 'dark',
}

export const themeLabel: Record<Theme, string> = {
	[Theme.System]: 'System',
	[Theme.Light]: 'Light',
	[Theme.Dark]: 'Dark',
};
