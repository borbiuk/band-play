import { expect, test } from '@playwright/test';
import { isPlainObject } from '@shared/utils';

test.describe('isPlainObject', () => {
	const CASES: [string, unknown, boolean][] = [
		['an empty object', {}, true],
		['an object with keys', { a: 1 }, true],
		['an array', [], false],
		['null', null, false],
		['undefined', undefined, false],
		['a string', 'text', false],
		['a number', 42, false],
	];

	for (const [title, value, expected] of CASES) {
		test(`should return ${expected} for ${title}`, () => {
			expect(isPlainObject(value)).toBe(expected);
		});
	}
});
