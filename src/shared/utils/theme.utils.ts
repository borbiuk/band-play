import { Theme } from '@shared/enums';
import configService from '@shared/services/config-service';

const DARK_QUERY = '(prefers-color-scheme: dark)';

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
 * The system preference is applied at once, before the settings load, so a dark system shows no light flash;
 * then the page follows the setting and the system preference until it closes.
 */
export const initTheme = (): void => {
	const media = window.matchMedia(DARK_QUERY);
	let theme = Theme.System;

	const apply = (): void => {
		const resolved = resolveTheme(theme, media.matches);
		document.documentElement.dataset.theme = resolved;
		document.documentElement.style.colorScheme = resolved;
	};

	apply();
	media.addEventListener('change', apply);
	configService.watch((config) => {
		theme = config.theme;
		apply();
	});
};
