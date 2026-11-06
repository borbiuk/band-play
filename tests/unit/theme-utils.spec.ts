import { expect, test } from '@playwright/test';
import { Theme } from '@shared/enums';
import { resolveTheme } from '@shared/utils/theme.utils';

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
