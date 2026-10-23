import { expect, test } from '@playwright/test';

import {
	FilenameTemplateData,
	hasTitleToken,
	renderConfiguredFilename,
	renderFilenameTemplate,
	sanitizeFilenameComponent,
} from '../../src/background/batch-download/filename';
import { BatchDownloadFileModel } from '../../src/downloads/batch-download-file-model';

test.describe('hasTitleToken', () => {
	const CASES: { template: string; expected: boolean }[] = [
		{ template: '{artist} - {title}', expected: true },
		{ template: '{title}', expected: true },
		{ template: '{artist}', expected: false },
		{ template: '{Title}', expected: false },
		{ template: 'title', expected: false },
		{ template: '', expected: false },
	];

	for (const c of CASES) {
		test(`should return ${c.expected} for "${c.template}"`, () => {
			expect(hasTitleToken(c.template)).toBe(c.expected);
		});
	}

	test('should return false for undefined', () => {
		expect(hasTitleToken(undefined)).toBe(false);
	});
});

test.describe('sanitizeFilenameComponent', () => {
	const CASES: { title: string; input: string; expected: string }[] = [
		{
			title: 'should keep a plain name',
			input: 'Artist - Album',
			expected: 'Artist - Album',
		},
		{
			title: 'should replace every illegal character with _',
			input: 'a<b>c:d"e/f\\g|h?i*j%k',
			expected: 'a_b_c_d_e_f_g_h_i_j_k',
		},
		{
			title: 'should remove control characters',
			input: 'a\u0000b\u001fc\u007fd\ne',
			expected: 'abcde',
		},
		{
			title: 'should replace zero-width and no-break spaces with a space',
			input: 'a\u200bb\u00a0c\ufeffd',
			expected: 'a b c d',
		},
		{
			title: 'should remove a leading right-to-left override',
			input: '\u202eevil',
			expected: 'evil',
		},
		{
			title: 'should replace an inner BiDi control with a space',
			input: 'song\u202egpj.exe',
			expected: 'song gpj.exe',
		},
		{
			title: 'should remove leading dots',
			input: '..hidden',
			expected: 'hidden',
		},
		{
			title: 'should remove trailing dots and spaces',
			input: 'name. . ',
			expected: 'name',
		},
		{
			title: 'should return an empty string for only dots',
			input: '...',
			expected: '',
		},
		{
			title: 'should trim spaces',
			input: '  name  ',
			expected: 'name',
		},
		{
			title: 'should prefix the reserved name CON',
			input: 'CON',
			expected: '_CON',
		},
		{
			title: 'should prefix the reserved name com1 in lower case',
			input: 'com1',
			expected: '_com1',
		},
		{
			title: 'should prefix the reserved name LPT9',
			input: 'LPT9',
			expected: '_LPT9',
		},
		{
			title: 'should keep a name that only starts with a reserved name',
			input: 'Console',
			expected: 'Console',
		},
		{
			title: 'should keep a name of exactly 120 characters',
			input: 'a'.repeat(120),
			expected: 'a'.repeat(120),
		},
		{
			title: 'should cut a name of 121 characters to 120',
			input: 'a'.repeat(121),
			expected: 'a'.repeat(120),
		},
		{
			title: 'should trim a space left at the cut',
			input: `${'a'.repeat(119)} bcd`,
			expected: 'a'.repeat(119),
		},
	];

	for (const c of CASES) {
		test(c.title, () => {
			expect(sanitizeFilenameComponent(c.input)).toBe(c.expected);
		});
	}

	test('should return an empty string for undefined', () => {
		expect(sanitizeFilenameComponent(undefined)).toBe('');
	});

	test('should not end with a dot after the cut', () => {
		expect(sanitizeFilenameComponent(`${'a'.repeat(119)}.bcd`)).toBe(
			'a'.repeat(119)
		);
	});
});

test.describe('renderFilenameTemplate', () => {
	const DATA: FilenameTemplateData = {
		artist: 'Band',
		title: 'Album',
		format: 'flac',
	};

	const CASES: {
		title: string;
		template: string;
		data: FilenameTemplateData;
		expected: string | null;
	}[] = [
		{
			title: 'should replace every token',
			template: '{artist} - {title} [{format}]',
			data: DATA,
			expected: 'Band - Album [flac]',
		},
		{
			title: 'should create folders from /',
			template: '{artist}/{title}',
			data: DATA,
			expected: 'Band/Album',
		},
		{
			title: 'should drop empty segments of //',
			template: '{artist}//{title}',
			data: DATA,
			expected: 'Band/Album',
		},
		{
			title: 'should drop a .. segment of the template',
			template: '../{artist}/../{title}',
			data: DATA,
			expected: 'Band/Album',
		},
		{
			title: 'should drop a . segment of the template',
			template: './{title}',
			data: DATA,
			expected: 'Album',
		},
		{
			title: 'should not create a folder from a / in a value',
			template: '{artist}/{title}',
			data: { artist: 'AC/DC', title: 'Back/In/Black' },
			expected: 'AC_DC/Back_In_Black',
		},
		{
			title: 'should not create a parent path from a .. value',
			template: '{artist}/{title}',
			data: { artist: '..', title: 'Album' },
			expected: 'Album',
		},
		{
			title: 'should keep an unknown token',
			template: '{year} {title}',
			data: DATA,
			expected: '{year} Album',
		},
		{
			title: 'should render a missing value as empty',
			template: '{artist} {title}',
			data: { title: 'Album' },
			expected: 'Album',
		},
		{
			title: 'should sanitize each segment',
			template: 'CON/{title}.',
			data: DATA,
			expected: '_CON/Album',
		},
		{
			title: 'should return null for an empty template',
			template: '',
			data: DATA,
			expected: null,
		},
		{
			title: 'should return null for only separators',
			template: '/ /',
			data: DATA,
			expected: null,
		},
		{
			title: 'should return null when every value is empty',
			template: '{artist}/{title}',
			data: {},
			expected: null,
		},
	];

	for (const c of CASES) {
		test(c.title, () => {
			expect(renderFilenameTemplate(c.template, c.data)).toBe(c.expected);
		});
	}
});

test.describe('renderConfiguredFilename', () => {
	/** A resolved download whose itemTitle and title differ */
	const DOWNLOAD: BatchDownloadFileModel = {
		id: '42',
		title: 'Band - Album',
		url: 'https://example.invalid/download/42',
		progress: 0,
		artist: 'Band',
		itemTitle: 'Album',
		format: 'flac',
	};

	const CASES: {
		title: string;
		template: string;
		download: BatchDownloadFileModel;
		expected: string | null;
	}[] = [
		{
			title: 'should return null for an empty template',
			template: '',
			download: DOWNLOAD,
			expected: null,
		},
		{
			title: 'should return null for a template of spaces',
			template: '   ',
			download: DOWNLOAD,
			expected: null,
		},
		{
			title: 'should return null for a template without {title}',
			template: '{artist} [{format}]',
			download: DOWNLOAD,
			expected: null,
		},
		{
			title: 'should use itemTitle over title',
			template: '{artist}/{title} [{format}]',
			download: DOWNLOAD,
			expected: 'Band/Album [flac]',
		},
		{
			title: 'should use title when itemTitle is missing',
			template: '{title}',
			download: { ...DOWNLOAD, itemTitle: undefined },
			expected: 'Band - Album',
		},
		{
			title: 'should trim the template',
			template: '  {title}  ',
			download: DOWNLOAD,
			expected: 'Album',
		},
		{
			title: 'should return null when the title renders empty',
			template: '{title}',
			download: { ...DOWNLOAD, itemTitle: '...' },
			expected: null,
		},
	];

	for (const c of CASES) {
		test(c.title, () => {
			expect(renderConfiguredFilename(c.template, c.download)).toBe(
				c.expected
			);
		});
	}
});
