import { expect, test } from '@playwright/test';
import { BatchDownloadFormat } from '@shared/enums';

import {
	BandcampRateLimitError,
	BandcampUnverifiedError,
	parseBandcampDownloads,
} from '../../src/downloads/services/bandcamp-parser';

const PAGE_URL = 'https://bandcamp.com/download?id=1&sig=abc';

/**
 * A download page as Bandcamp serves it: the data blob is JSON in the `data-blob`
 * attribute of `#pagedata`, HTML-escaped.
 *
 * @param blob - The page data.
 */
function downloadPage(blob: unknown): string {
	const attribute = JSON.stringify(blob)
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;');
	return `<html><body><div id="pagedata" data-blob="${attribute}"></div></body></html>`;
}

/** Requests the fake fetch received */
type FetchCall = { url: string; signal: AbortSignal | undefined };

/**
 * Replaces `fetch` for one test with a fake that answers every request with the given
 * body and status.
 *
 * @returns The list of received requests.
 */
function useFetch(): (body: string, status?: number) => FetchCall[] {
	let original: typeof fetch;

	test.beforeEach(() => {
		original = globalThis.fetch;
	});

	test.afterEach(() => {
		globalThis.fetch = original;
	});

	return (body: string, status = 200): FetchCall[] => {
		const calls: FetchCall[] = [];
		globalThis.fetch = async (
			input: string | URL | Request,
			init?: RequestInit
		): Promise<Response> => {
			calls.push({ url: String(input), signal: init?.signal });
			return new Response(body, { status });
		};
		return calls;
	};
}

const respond = useFetch();

test.describe('parseBandcampDownloads', () => {
	test('should request the page URL with an abort signal', async () => {
		const calls = respond(downloadPage({ digital_items: [] }));

		await parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac);

		expect(calls).toHaveLength(1);
		expect(calls[0].url).toBe(PAGE_URL);
		expect(calls[0].signal).toBeInstanceOf(AbortSignal);
	});

	test('should return one download per item with a URL for the format', async () => {
		respond(
			downloadPage({
				digital_items: [
					{
						item_id: 101,
						artist: ' Band ',
						title: ' Album ',
						downloads: {
							flac: {
								url: 'https://p4.bcbits.com/download/101/flac',
								size_mb: '290.7MB',
							},
							'mp3-320': {
								url: 'https://p4.bcbits.com/download/101/mp3',
								size_mb: '98MB',
							},
						},
					},
					{
						sale_id: 202,
						artist: 'Rock & Roll "Crew"',
						title: 'Live <1999>',
						downloads: {
							flac: {
								url: 'https://p4.bcbits.com/download/202/flac?a=1&b=2',
								size_mb: '1.5GB',
							},
						},
					},
				],
			})
		);

		const downloads = await parseBandcampDownloads(
			PAGE_URL,
			BatchDownloadFormat.Flac
		);

		expect(downloads).toEqual([
			{
				id: '101',
				title: 'Band - Album',
				url: 'https://p4.bcbits.com/download/101/flac',
				progress: 0,
				artist: 'Band',
				itemTitle: 'Album',
				format: 'flac',
				sizeMb: 290.7,
			},
			{
				id: '202',
				title: 'Rock & Roll "Crew" - Live <1999>',
				url: 'https://p4.bcbits.com/download/202/flac?a=1&b=2',
				progress: 0,
				artist: 'Rock & Roll "Crew"',
				itemTitle: 'Live <1999>',
				format: 'flac',
				sizeMb: 1536,
			},
		]);
	});

	test('should skip killed items, items without the format and items without an id', async () => {
		const flac = { flac: { url: 'https://p4.bcbits.com/download/flac' } };
		respond(
			downloadPage({
				digital_items: [
					null,
					{ item_id: 1, title: 'Killed', killed: 1, downloads: flac },
					{ item_id: 2, title: 'No downloads' },
					{
						item_id: 3,
						title: 'Other format',
						downloads: { wav: { url: 'https://p4.bcbits.com/w' } },
					},
					{ item_id: 4, title: 'Empty URL', downloads: { flac: {} } },
					{ title: 'No id', downloads: flac },
					{ item_id: 5, title: 'Kept', downloads: flac },
				],
			})
		);

		const downloads = await parseBandcampDownloads(
			PAGE_URL,
			BatchDownloadFormat.Flac
		);

		expect(downloads).toEqual([
			{
				id: '5',
				title: 'Kept',
				url: 'https://p4.bcbits.com/download/flac',
				progress: 0,
				artist: '',
				itemTitle: 'Kept',
				format: 'flac',
				sizeMb: undefined,
			},
		]);
	});

	const TITLE_CASES: {
		title: string;
		item: Record<string, unknown>;
		expected: { title: string; artist: string; itemTitle: string };
	}[] = [
		{
			title: 'should use the artist alone when the title is missing',
			item: { artist: 'Band' },
			expected: { title: 'Band', artist: 'Band', itemTitle: '' },
		},
		{
			title: 'should use the title alone when the artist is missing',
			item: { title: 'Album' },
			expected: { title: 'Album', artist: '', itemTitle: 'Album' },
		},
		{
			title: 'should use the id when artist and title are missing',
			item: {},
			expected: { title: '7', artist: '', itemTitle: '' },
		},
	];

	for (const c of TITLE_CASES) {
		test(c.title, async () => {
			respond(
				downloadPage({
					digital_items: [
						{
							item_id: 7,
							...c.item,
							downloads: {
								flac: { url: 'https://p4.bcbits.com/f' },
							},
						},
					],
				})
			);

			const downloads = await parseBandcampDownloads(
				PAGE_URL,
				BatchDownloadFormat.Flac
			);

			expect(downloads).toEqual([
				{
					id: '7',
					url: 'https://p4.bcbits.com/f',
					progress: 0,
					format: 'flac',
					sizeMb: undefined,
					...c.expected,
				},
			]);
		});
	}

	const SIZE_CASES: { size: unknown; expected: number | undefined }[] = [
		{ size: '290.7MB', expected: 290.7 },
		{ size: '1.5GB', expected: 1536 },
		{ size: '512KB', expected: 0.5 },
		{ size: '12 mb', expected: 12 },
		{ size: '12', expected: 12 },
		{ size: 'big', expected: undefined },
		{ size: 300, expected: undefined },
	];

	for (const c of SIZE_CASES) {
		test(`should read size ${JSON.stringify(c.size)} as ${c.expected} MB`, async () => {
			respond(
				downloadPage({
					digital_items: [
						{
							item_id: 8,
							title: 'Album',
							downloads: {
								flac: {
									url: 'https://p4.bcbits.com/f',
									size_mb: c.size,
								},
							},
						},
					],
				})
			);

			const [download] = await parseBandcampDownloads(
				PAGE_URL,
				BatchDownloadFormat.Flac
			);

			expect(download.sizeMb).toBe(c.expected);
		});
	}

	test('should return no downloads for a page without #pagedata', async () => {
		respond('<html><body><p>Sign in</p></body></html>');

		expect(
			await parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).toEqual([]);
	});

	test('should return no downloads for a corrupt data blob', async () => {
		respond(
			'<div id="pagedata" data-blob="{&quot;digital_items&quot;:"></div>'
		);

		expect(
			await parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).toEqual([]);
	});

	test('should read a data blob in single quotes', async () => {
		respond(
			'<div id=\'pagedata\' data-blob=\'{"digital_items":[{"item_id":9,"title":"It&#39;s","downloads":{"flac":{"url":"https://p4.bcbits.com/f"}}}]}\'></div>'
		);

		expect(
			await parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).toEqual([
			{
				id: '9',
				title: "It's",
				url: 'https://p4.bcbits.com/f',
				progress: 0,
				artist: '',
				itemTitle: "It's",
				format: 'flac',
				sizeMb: undefined,
			},
		]);
	});

	test('should keep a literal entity text in a title', async () => {
		// "&amp;lt;" is decoded once, to the text "&lt;"
		respond(
			downloadPage({
				digital_items: [
					{
						item_id: 10,
						title: 'I &lt;3 Synths',
						downloads: { flac: { url: 'https://p4.bcbits.com/f' } },
					},
				],
			})
		);

		const [download] = await parseBandcampDownloads(
			PAGE_URL,
			BatchDownloadFormat.Flac
		);

		expect(download.itemTitle).toBe('I &lt;3 Synths');
	});

	test('should throw BandcampRateLimitError for HTTP 429', async () => {
		respond('Too many requests', 429);

		await expect(
			parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).rejects.toThrow(BandcampRateLimitError);
	});

	test('should throw with the status for HTTP 500', async () => {
		respond('Server error', 500);

		await expect(
			parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).rejects.toThrow('Bandcamp page fetch failed (HTTP 500)');
	});

	test('should throw BandcampUnverifiedError when an unverified account gets no URLs', async () => {
		respond(
			downloadPage({
				digital_items: [{ item_id: 1, title: 'Album', downloads: {} }],
				identities: { fan: { verified: false } },
			})
		);

		await expect(
			parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).rejects.toThrow(BandcampUnverifiedError);
	});

	test('should return no downloads when a verified account gets no URLs', async () => {
		respond(
			downloadPage({
				digital_items: [{ item_id: 1, title: 'Album', downloads: {} }],
				identities: { fan: { verified: true } },
			})
		);

		expect(
			await parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).toEqual([]);
	});

	test('should return no downloads for an unverified account without items', async () => {
		respond(
			downloadPage({
				digital_items: [],
				identities: { fan: { verified: false } },
			})
		);

		expect(
			await parseBandcampDownloads(PAGE_URL, BatchDownloadFormat.Flac)
		).toEqual([]);
	});
});
