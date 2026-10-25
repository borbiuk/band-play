import { ShortcutType } from '@shared/enums';
import { ShortcutConfig } from '@shared/models/config-model';
import {
	mapShortcutToString,
	mapToHumanString,
} from '@shared/utils/shortcut.utils';

/** Physical modifier keys (`event.code`); they are read from the event flags instead. */
const MODIFIER_CODES = [
	'ShiftLeft',
	'ShiftRight',
	'ControlLeft',
	'ControlRight',
	'AltLeft',
	'AltRight',
	'MetaLeft',
	'MetaRight',
];

const MODIFIERS = ['Control', 'Meta', 'Alt', 'Shift'];

/**
 * Keys that browsers and text fields use with Control / Meta: copy, paste, cut, select all,
 * undo, redo, find, print, save, tabs, reload, address bar, windows, history, bookmarks,
 * downloads, developer tools, switch to tab 1–9 and zoom.
 */
const CONTROL_META_RESERVED_CODES = [
	// KeyM is not reserved
	...'ABCDEFGHIJKLNOPQRSTUVWXYZ'.split('').map((x) => `Key${x}`),
	...'0123456789'.split('').map((x) => `Digit${x}`),
	'Equal',
	'Minus',
	'Tab',
	'Space',
	'PageUp',
	'PageDown',
	'F4',
];

/** Keys the browser takes even without a modifier (reload, full screen, developer tools). */
const ALWAYS_RESERVED_CODES = ['F5', 'F11', 'F12'];

/** Keys Alt uses for the address bar, menus and the home page on Windows and Linux. */
const ALT_RESERVED_CODES = [
	'ArrowLeft',
	'ArrowRight',
	'KeyD',
	'KeyE',
	'KeyF',
	'Home',
];

/** The part of a key event the recorder reads. */
export interface KeyEventLike {
	code: string;
	ctrlKey: boolean;
	metaKey: boolean;
	altKey: boolean;
	shiftKey: boolean;
}

/**
 * The combination of a key press: held modifiers first, then the main key (if any).
 *
 * @param event - A keydown or keyup event.
 * @returns The key codes of the combination.
 */
export const toCombination = (event: KeyEventLike): string[] => {
	const keys: string[] = [];
	if (event.ctrlKey) {
		keys.push('Control');
	}

	if (event.metaKey) {
		keys.push('Meta');
	}

	if (event.altKey) {
		keys.push('Alt');
	}

	if (event.shiftKey) {
		keys.push('Shift');
	}

	if (!MODIFIER_CODES.includes(event.code)) {
		keys.push(event.code);
	}

	return keys;
};

/** True when the combination has a key that is not a modifier. */
export const hasMainKey = (keys: string[]): boolean =>
	keys.some((x) => !MODIFIERS.includes(x));

/** True when the browser uses the combination (it would never reach the page). */
export const isReservedByBrowser = (keys: string[]): boolean => {
	const main = keys.find((x) => !MODIFIERS.includes(x));
	if (
		(keys.includes('Control') || keys.includes('Meta')) &&
		CONTROL_META_RESERVED_CODES.includes(main)
	) {
		return true;
	}

	if (ALWAYS_RESERVED_CODES.includes(main)) {
		return true;
	}

	return keys.includes('Alt') && ALT_RESERVED_CODES.includes(main);
};

/** Normalized form of a combination, the same one the content script compares. */
const normalize = (keys: string[]): string =>
	keys
		.map((x) => mapShortcutToString(x))
		.sort()
		.join('+');

/**
 * The other shortcut that already uses the combination, if any.
 * A shortcut the user switched off does not count: it never runs.
 *
 * @param shortcuts - The stored combinations of all shortcuts.
 * @param disabled - The shortcuts that are switched off.
 * @param type - The shortcut being changed.
 * @param keys - The combination to check.
 * @returns The conflicting shortcut, or undefined.
 */
export const findConflict = (
	shortcuts: ShortcutConfig,
	disabled: ShortcutType[],
	type: ShortcutType,
	keys: string[]
): ShortcutType | undefined =>
	Object.values(ShortcutType).find(
		(other) =>
			other !== type &&
			!disabled.includes(other) &&
			normalize(JSON.parse(shortcuts[other]) as string[]) ===
				normalize(keys)
	);

/** Modifiers in a fixed order, then the main key, so a combination always reads the same. */
export const sortKeys = (keys: string[]): string[] => [
	...MODIFIERS.filter((x) => keys.includes(x)),
	...keys.filter((x) => !MODIFIERS.includes(x)),
];

/**
 * The key caps of a combination.
 *
 * @param type - The shortcut: its digit key means a range (1–9 or 0–9).
 * @param keys - The key codes.
 * @returns One label per key cap.
 */
export const toKeyLabels = (type: ShortcutType, keys: string[]): string[] =>
	sortKeys(keys).map((key) => {
		const label = mapToHumanString(key);
		if (label !== 'Digit') {
			return label;
		}

		return type === ShortcutType.PlayTrackByIndex ? '1–9' : '0–9';
	});

/** The combination as one text, for the recorder field. */
export const toHumanString = (keys: string[]): string =>
	sortKeys(keys)
		.map((x) => mapToHumanString(x))
		.join(' + ');
