import { expect, test } from '@playwright/test';
import { mapShortcutToString, mapToHumanString } from '@shared/utils';

/**
 * Pins the platform that isMac() reads (`navigator.platform`) for every test of the
 * enclosing describe, and restores Node's own navigator afterwards.
 *
 * @param platform - Value of `navigator.platform`.
 */
function usePlatform(platform: string): void {
	let original: PropertyDescriptor | undefined;

	test.beforeEach(() => {
		original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
		Object.defineProperty(globalThis, 'navigator', {
			configurable: true,
			value: { platform, userAgent: '' },
		});
	});

	test.afterEach(() => {
		if (original) {
			Object.defineProperty(globalThis, 'navigator', original);
		} else {
			Reflect.deleteProperty(globalThis, 'navigator');
		}
	});
}

test.describe('mapShortcutToString', () => {
	const CASES: { input: string; expected: string }[] = [
		{ input: 'ShiftLeft', expected: 'shift' },
		{ input: 'ShiftRight', expected: 'shift' },
		{ input: 'Shift', expected: 'shift' },
		{ input: 'ControlLeft', expected: 'control' },
		{ input: 'ControlRight', expected: 'control' },
		{ input: 'Control', expected: 'control' },
		{ input: 'MetaLeft', expected: 'meta' },
		{ input: 'MetaRight', expected: 'meta' },
		{ input: 'AltLeft', expected: 'alt' },
		{ input: 'AltRight', expected: 'alt' },
		// Every digit key maps to the KeyCode.Digit placeholder '1'
		{ input: 'Digit3', expected: '1' },
		{ input: 'Digit0', expected: '1' },
		{ input: 'KeyP', expected: 'keyp' },
		{ input: 'ArrowUp', expected: 'arrowup' },
		{ input: 'Space', expected: 'space' },
		{ input: '1', expected: '1' },
		{ input: 'Numpad3', expected: 'numpad3' },
	];

	for (const c of CASES) {
		test(`should map ${c.input} to ${c.expected}`, () => {
			expect(mapShortcutToString(c.input)).toBe(c.expected);
		});
	}
});

/** Keys that look the same on every platform */
const PLATFORM_FREE_CASES: { input: string; expected: string }[] = [
	{ input: 'KeyP', expected: 'P' },
	{ input: 'Digit3', expected: 'Digit' },
	{ input: '1', expected: 'Digit' },
	{ input: 'Shift', expected: '⇧' },
	{ input: 'ShiftLeft', expected: '⇧' },
	{ input: 'Backspace', expected: '⌫' },
	{ input: 'CapsLock', expected: '⇪' },
	{ input: 'ArrowUp', expected: '↑' },
	{ input: 'ArrowDown', expected: '↓' },
	{ input: 'ArrowRight', expected: '→' },
	{ input: 'ArrowLeft', expected: '←' },
	{ input: 'Space', expected: 'Space' },
];

test.describe('mapToHumanString on macOS', () => {
	usePlatform('MacIntel');

	const CASES: { input: string; expected: string }[] = [
		...PLATFORM_FREE_CASES,
		{ input: 'Meta', expected: '⌘' },
		{ input: 'MetaLeft', expected: '⌘' },
		{ input: 'Alt', expected: '⌥' },
		{ input: 'Control', expected: '^' },
	];

	for (const c of CASES) {
		test(`should show ${c.input} as ${c.expected}`, () => {
			expect(mapToHumanString(c.input)).toBe(c.expected);
		});
	}
});

test.describe('mapToHumanString on Windows', () => {
	usePlatform('Win32');

	const CASES: { input: string; expected: string }[] = [
		...PLATFORM_FREE_CASES,
		{ input: 'Meta', expected: '⊞' },
		{ input: 'MetaLeft', expected: '⊞' },
		{ input: 'Alt', expected: 'Alt' },
		{ input: 'Control', expected: 'Ctrl' },
	];

	for (const c of CASES) {
		test(`should show ${c.input} as ${c.expected}`, () => {
			expect(mapToHumanString(c.input)).toBe(c.expected);
		});
	}
});
