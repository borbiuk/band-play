import { expect, test } from '@playwright/test';

import {
	type CollectionItemType,
	parseTralbumType,
} from '../../src/content/utils/collection-item-type';

test.describe('parseTralbumType', () => {
	const CASES: {
		value: string | null | undefined;
		expected: CollectionItemType | null;
	}[] = [
		{ value: 'a', expected: 'album' },
		{ value: 't', expected: 'track' },
		{ value: 'A', expected: null },
		{ value: 'p', expected: null },
		{ value: '', expected: null },
		{ value: null, expected: null },
		{ value: undefined, expected: null },
	];

	for (const { value, expected } of CASES) {
		test(`should return ${String(expected)} for ${JSON.stringify(value)}`, () => {
			expect(parseTralbumType(value)).toBe(expected);
		});
	}
});
