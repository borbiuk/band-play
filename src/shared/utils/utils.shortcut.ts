import { KeyCode } from '@shared/enums';

import { isNumeric } from './utils.common';

/**
 * Maps a shortcut string to a standardized format.
 * Normalizes key names and handles special cases.
 *
 * @param value - The shortcut string to normalize
 * @returns Normalized shortcut string
 */
export const mapShortcutToString = (value: string): string => {
	value = value.toLowerCase();

	if (value.includes(KeyCode.Shift.toLowerCase())) {
		return KeyCode.Shift.toLowerCase();
	}

	if (value.includes('digit')) {
		return KeyCode.Digit;
	}
	if (value.includes('meta')) {
		value = 'meta';
	}
	if (value.includes('alt')) {
		value = 'alt';
	}
	if (value.includes('control')) {
		value = 'control';
	}

	return value;
};

/**
 * Checks if the current platform is macOS.
 *
 * @returns True if running on macOS, false otherwise
 */
const isMac = () => navigator.platform.toLowerCase().includes('mac');

/**
 * Maps keyboard codes to human-readable symbols and strings.
 * Provides platform-specific representations for modifier keys.
 *
 * @param value - The keyboard code to map
 * @returns Human-readable representation of the key
 */
export const mapToHumanString = (value: string) => {
	if (value.includes('Key')) {
		return value.split('Key')[1];
	}

	if (value.includes('Digit') || isNumeric(value)) {
		return 'Digit';
	}

	if (value.includes('Meta')) {
		return isMac() ? '⌘' : '⊞';
	}

	if (value.includes('Alt')) {
		return isMac() ? '⌥' : 'Alt';
	}

	if (value.includes('Control')) {
		return isMac() ? '^' : 'Ctrl';
	}

	if (value.includes('Shift')) {
		return '⇧';
	}

	if (value.includes('Backspace')) {
		return '⌫';
	}

	if (value.includes('CapsLock')) {
		return '⇪';
	}

	if (value.includes('ArrowUp')) {
		return '↑';
	}

	if (value.includes('ArrowDow')) {
		return '↓';
	}

	if (value.includes('ArrowRight')) {
		return '→';
	}

	if (value.includes('ArrowLeft')) {
		return '←';
	}

	return value;
};
