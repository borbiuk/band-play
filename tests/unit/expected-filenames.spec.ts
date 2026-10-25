import { expect, test } from '@playwright/test';

import { installChrome } from '../helpers/fake-chrome';

type ExpectedFilenames =
	typeof import('../../src/background/batch-download/expected-filenames');

/**
 * Loads the expected filenames module. It reads `chrome.downloads` and `chrome.storage` once at load
 * time, so an empty `chrome` global (no downloads API, no session storage) is installed for
 * the import only and the original global is restored right after it.
 */
async function loadModule(): Promise<ExpectedFilenames> {
	const restoreChrome = installChrome({});

	try {
		return await import('../../src/background/batch-download/expected-filenames');
	} finally {
		restoreChrome();
	}
}

test.describe('toBaseFileName', () => {
	const CASES: { input: string | undefined; expected: string }[] = [
		{ input: 'album.zip', expected: 'album.zip' },
		{ input: '/Users/me/Downloads/Band/album.zip', expected: 'album.zip' },
		{ input: 'C:\\Users\\me\\Downloads\\album.zip', expected: 'album.zip' },
		{ input: 'Band/sub\\album.zip', expected: 'album.zip' },
		{ input: 'Band/', expected: '' },
		{ input: '', expected: '' },
		{ input: undefined, expected: '' },
	];

	for (const c of CASES) {
		test(`should return "${c.expected}" for ${JSON.stringify(c.input)}`, async () => {
			const { toBaseFileName } = await loadModule();

			expect(toBaseFileName(c.input)).toBe(c.expected);
		});
	}
});

test.describe('isUniquifiedVariantOf', () => {
	const CASES: { expected: string; actual: string; result: boolean }[] = [
		{ expected: 'album.zip', actual: 'album (1).zip', result: true },
		{ expected: 'album.zip', actual: 'album (12).zip', result: true },
		{ expected: 'Song (1).zip', actual: 'Song (1) (1).zip', result: true },
		{
			expected: 'a.b+c [x].zip',
			actual: 'a.b+c [x] (2).zip',
			result: true,
		},
		{ expected: 'album', actual: 'album (1)', result: true },
		{ expected: 'album.zip', actual: 'album.zip', result: false },
		{ expected: 'album.zip', actual: 'album(1).zip', result: false },
		{ expected: 'album.zip', actual: 'album (x).zip', result: false },
		{ expected: 'album.zip', actual: 'other (1).zip', result: false },
		{ expected: 'album.zip', actual: 'album (1).flac', result: false },
		{ expected: 'Song (1).zip', actual: 'Song (2).zip', result: false },
		{ expected: 'abc.zip', actual: 'aXc (1).zip', result: false },
		{ expected: '', actual: 'album (1).zip', result: false },
		{ expected: 'album.zip', actual: '', result: false },
	];

	for (const c of CASES) {
		test(`should return ${c.result} for "${c.actual}" against "${c.expected}"`, async () => {
			const { isUniquifiedVariantOf } = await loadModule();

			expect(isUniquifiedVariantOf(c.expected, c.actual)).toBe(c.result);
		});
	}
});
