import { Theme } from '@shared/enums';
import configService from '@shared/services/config-service';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * `localStorage` key with a copy of the last `theme` setting. `chrome.storage` is async, so the copy lets the
 * first frame use the stored theme (the popup and the downloads page share the extension origin).
 */
const THEME_CACHE_KEY = 'bp_theme';

/** The cached `theme` setting, or `System` when there is none or `localStorage` is not available. */
export const readCachedTheme = (): Theme => {
	try {
		const cached = window.localStorage.getItem(THEME_CACHE_KEY) as Theme;
		if (Object.values(Theme).includes(cached)) {
			return cached;
		}
	} catch {
		// Storage blocked: fall back to the system preference
	}

	return Theme.System;
};

/** Keeps a copy of the `theme` setting for the next page load. */
const writeCachedTheme = (theme: Theme): void => {
	try {
		window.localStorage.setItem(THEME_CACHE_KEY, theme);
	} catch {
		// Storage blocked: the next load starts from the system preference
	}
};

/**
 * The theme to show for a stored setting: `System` follows the browser or system preference.
 *
 * @param theme - The stored `theme` setting
 * @param prefersDark - Whether `prefers-color-scheme: dark` matches
 */
export const resolveTheme = (
	theme: Theme,
	prefersDark: boolean
): Theme.Light | Theme.Dark => {
	if (theme === Theme.System) {
		return prefersDark ? Theme.Dark : Theme.Light;
	}

	return theme;
};

/**
 * Applies the `theme` setting to an extension page (the popup, the downloads page): sets
 * `data-theme` and `color-scheme` on `<html>`, which switch the color tokens (see `theme.scss`).
 * The cached setting (or the system preference) is applied at once, before the settings load, so the first frame
 * has the right theme; then the page follows the setting and the system preference until it closes.
 */
export const initTheme = (): void => {
	const media = window.matchMedia(DARK_QUERY);
	let theme = readCachedTheme();

	const apply = (): void => {
		const resolved = resolveTheme(theme, media.matches);
		document.documentElement.dataset.theme = resolved;
		document.documentElement.style.colorScheme = resolved;
	};

	apply();
	media.addEventListener('change', apply);
	configService.watch((config) => {
		theme = config.theme;
		writeCachedTheme(theme);
		apply();
	});
};
