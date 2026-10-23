import { expect, test } from '@playwright/test';

import { ShortcutSet } from '../../src/content/shortcut/shortcut-set';

/**
 * The pressed combination as the content script builds it: an empty set, then add() per key.
 *
 * @param codes - `KeyboardEvent.code` values in press order.
 */
function pressed(codes: string[]): ShortcutSet {
	const set = new ShortcutSet();
	for (const code of codes) {
		set.add(code);
	}
	return set;
}

test.describe('ShortcutSet normalization', () => {
	test('should store normalized keys from the constructor', () => {
		const set = new ShortcutSet(['ShiftLeft', 'KeyP', 'Digit3']);

		expect([...set]).toEqual(['shift', 'keyp', '1']);
	});

	test('should store normalized keys from add', () => {
		const set = pressed(['ControlRight', 'AltLeft', 'KeyB']);

		expect([...set]).toEqual(['control', 'alt', 'keyb']);
	});

	test('should keep one entry for ShiftLeft and ShiftRight', () => {
		const set = pressed(['ShiftLeft', 'ShiftRight']);

		expect([...set]).toEqual(['shift']);
	});

	const HAS_CASES: { stored: string[]; query: string; expected: boolean }[] =
		[
			{ stored: ['Shift'], query: 'ShiftRight', expected: true },
			{ stored: ['KeyP'], query: 'KeyP', expected: true },
			{ stored: ['KeyP'], query: 'keyp', expected: true },
			{ stored: ['Digit3'], query: 'Digit7', expected: true },
			{ stored: ['KeyP'], query: 'KeyB', expected: false },
			{ stored: ['Shift'], query: 'Control', expected: false },
		];

	for (const c of HAS_CASES) {
		test(`should answer has(${c.query}) with ${c.expected} for [${c.stored.join(', ')}]`, () => {
			expect(new ShortcutSet(c.stored).has(c.query)).toBe(c.expected);
		});
	}
});

test.describe('ShortcutSet digit', () => {
	const CASES: { code: string; expected: number }[] = [
		{ code: 'Digit0', expected: 0 },
		{ code: 'Digit3', expected: 3 },
		{ code: 'Digit9', expected: 9 },
	];

	for (const c of CASES) {
		test(`should read digit ${c.expected} from ${c.code}`, () => {
			expect(pressed(['ShiftLeft', c.code]).digit).toBe(c.expected);
		});
	}

	test('should leave digit unset when no digit key was added', () => {
		expect(pressed(['ShiftLeft', 'KeyP']).digit).toBeUndefined();
	});
});

test.describe('ShortcutSet equal', () => {
	const CASES: {
		title: string;
		configured: string[];
		keys: string[];
		expected: boolean;
	}[] = [
		{
			title: 'should match the same single key',
			configured: ['KeyP'],
			keys: ['KeyP'],
			expected: true,
		},
		{
			title: 'should match Shift+KeyP pressed with ShiftRight',
			configured: ['KeyP', 'Shift'],
			keys: ['ShiftRight', 'KeyP'],
			expected: true,
		},
		{
			title: 'should match a configured digit with any pressed digit',
			configured: ['1', 'Shift'],
			keys: ['ShiftLeft', 'Digit7'],
			expected: true,
		},
		{
			title: 'should not match when Shift is pressed in addition',
			configured: ['KeyP'],
			keys: ['ShiftLeft', 'KeyP'],
			expected: false,
		},
		{
			title: 'should not match when Shift is missing',
			configured: ['KeyP', 'Shift'],
			keys: ['KeyP'],
			expected: false,
		},
		{
			title: 'should not match a different key of the same size',
			configured: ['KeyP'],
			keys: ['KeyB'],
			expected: false,
		},
		{
			title: 'should not match a different modifier of the same size',
			configured: ['KeyP', 'Shift'],
			keys: ['ControlLeft', 'KeyP'],
			expected: false,
		},
	];

	for (const c of CASES) {
		test(c.title, () => {
			const configured = new ShortcutSet(c.configured);

			expect(configured.equal(pressed(c.keys))).toBe(c.expected);
		});
	}

	test('should match any numeric key when the set has seen a digit key', () => {
		// A set filled by add('DigitN') has a digit, so an input with another numeric key matches
		const withDigit = pressed(['Digit5']);

		expect(withDigit.equal(new ShortcutSet(['2']))).toBe(true);
	});

	test('should not match another numeric key when the set has no digit', () => {
		const withoutDigit = new ShortcutSet(['1']);

		expect(withoutDigit.equal(new ShortcutSet(['2']))).toBe(false);
	});
});
