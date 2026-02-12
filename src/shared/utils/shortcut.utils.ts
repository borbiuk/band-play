import { KeyCode } from '@shared/enums';
import { isMac } from '@shared/utils/platfor.utils';

import { isNumeric } from './guard.utils';

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

	const KEY_MAP: Record<string, () => string> = {
		digit: () => KeyCode.Digit,
		meta: () => 'meta',
		alt: () => 'alt',
		control: () => 'control',
	};

	const key = Object.keys(KEY_MAP).find((k) => value.includes(k));

	if (key) {
		return KEY_MAP[key]();
	}

	return value;
};

/**
 * Maps keyboard codes to human-readable symbols and strings.
 * Provides platform-specific representations for modifier keys.
 *
 * @param value - The keyboard code to map
 * @returns Human-readable representation of the key
 */
export const mapToHumanString = (value: string) => {
	const KEY_MAP: Record<string, () => string> = {
		Key: () => value.split('Key')[1],
		Digit: () => 'Digit',
		Meta: () => (isMac() ? '⌘' : '⊞'),
		Alt: () => (isMac() ? '⌥' : 'Alt'),
		Control: () => (isMac() ? '^' : 'Ctrl'),
		Shift: () => '⇧',
		Backspace: () => '⌫',
		CapsLock: () => '⇪',
		ArrowUp: () => '↑',
		ArrowDown: () => '↓',
		ArrowRight: () => '→',
		ArrowLeft: () => '←',
	};

	const key = Object.keys(KEY_MAP).find((k) => value.includes(k));

	if (key) {
		return KEY_MAP[key]();
	}

	if (isNumeric(value)) {
		return 'Digit';
	}

	return value;
};
