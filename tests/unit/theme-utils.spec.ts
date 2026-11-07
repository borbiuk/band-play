import { expect, test } from '@playwright/test';
import { Theme } from '@shared/enums';
import { readCachedTheme, resolveTheme } from '@shared/utils/theme.utils';

test.describe('resolveTheme', () => {
	const CASES = [
		{ theme: Theme.System, prefersDark: true, expected: Theme.Dark },
		{ theme: Theme.System, prefersDark: false, expected: Theme.Light },
		{ theme: Theme.Light, prefersDark: true, expected: Theme.Light },
		{ theme: Theme.Dark, prefersDark: false, expected: Theme.Dark },
	];

	for (const c of CASES) {
		test(`should resolve ${c.theme} to ${c.expected} when the system prefers ${c.prefersDark ? 'dark' : 'light'}`, () => {
			expect(resolveTheme(c.theme, c.prefersDark)).toBe(c.expected);
		});
	}
});

/**
 * Gives every test of the enclosing describe a `window` with the `localStorage` that the test sets,
 * and restores Node's own globals afterwards.
 *
 * @returns Function that sets the `localStorage` of the fake window.
 */
function useWindow(): (localStorage: Pick<Storage, 'getItem'>) => void {
	let original: PropertyDescriptor | undefined;

	test.beforeEach(() => {
		original = Object.getOwnPropertyDescriptor(globalThis, 'window');
	});

	test.afterEach(() => {
		if (original) {
			Object.defineProperty(globalThis, 'window', original);
		} else {
			Reflect.deleteProperty(globalThis, 'window');
		}
	});

	return (localStorage) => {
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: { localStorage },
		});
	};
}

test.describe('readCachedTheme', () => {
	const setLocalStorage = useWindow();

	const CASES: { title: string; cached: string | null; expected: Theme }[] = [
		{
			title: 'should return a cached dark theme',
			cached: 'dark',
			expected: Theme.Dark,
		},
		{
			title: 'should return a cached light theme',
			cached: 'light',
			expected: Theme.Light,
		},
		{
			title: 'should return system when nothing is cached',
			cached: null,
			expected: Theme.System,
		},
		{
			title: 'should return system for an unknown cached value',
			cached: 'sepia',
			expected: Theme.System,
		},
	];

	for (const c of CASES) {
		test(c.title, () => {
			setLocalStorage({
				getItem: (key) => (key === 'bp_theme' ? c.cached : null),
			});

			expect(readCachedTheme()).toBe(c.expected);
		});
	}

	test('should return system when localStorage throws', () => {
		setLocalStorage({
			getItem: () => {
				throw new DOMException('Access denied', 'SecurityError');
			},
		});

		expect(readCachedTheme()).toBe(Theme.System);
	});
});
