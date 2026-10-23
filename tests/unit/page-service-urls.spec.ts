import { expect, test } from '@playwright/test';

import { AlbumPageService } from '../../src/content/page-services/bandcamp/album-page-service';
import { CollectionPageService } from '../../src/content/page-services/bandcamp/collection-page-service';
import { DiscoverPageService } from '../../src/content/page-services/bandcamp/discover-page-service';

// FeedPageService is not covered: its isServiceUrl renders the React feed player as a side effect.

test.describe('AlbumPageService.isServiceUrl', () => {
	const CASES: { url: string; expected: boolean }[] = [
		{ url: 'https://band.bandcamp.com/album/first-album', expected: true },
		{ url: 'https://band.bandcamp.com/track/first-song', expected: true },
		{
			url: 'https://band.bandcamp.com/album/first-album?from=fanpub',
			expected: true,
		},
		{
			url: 'https://music.example.com/album/custom-domain',
			expected: true,
		},
		{ url: 'https://band.bandcamp.com/', expected: false },
		{ url: 'https://band.bandcamp.com/music', expected: false },
		{ url: 'https://bandcamp.com/discover', expected: false },
	];

	for (const c of CASES) {
		test(`should return ${c.expected} for ${c.url}`, () => {
			expect(new AlbumPageService().isServiceUrl(c.url)).toBe(c.expected);
		});
	}
});

test.describe('DiscoverPageService.isServiceUrl', () => {
	const CASES: { url: string; expected: boolean }[] = [
		{ url: 'https://bandcamp.com/discover', expected: true },
		{
			url: 'https://bandcamp.com/discover/electronic?tags=house',
			expected: true,
		},
		{ url: 'https://bandcamp.com/feed', expected: false },
		{ url: 'https://bandcamp.com/fan_name', expected: false },
		{ url: 'https://band.bandcamp.com/album/first-album', expected: false },
	];

	for (const c of CASES) {
		test(`should return ${c.expected} for ${c.url}`, () => {
			expect(new DiscoverPageService().isServiceUrl(c.url)).toBe(
				c.expected
			);
		});
	}
});

test.describe('CollectionPageService.isServiceUrl', () => {
	const CASES: { url: string; expected: boolean }[] = [
		{ url: 'https://bandcamp.com/fan_name', expected: true },
		{ url: 'https://bandcamp.com/fan-name-2', expected: true },
		{ url: 'https://bandcamp.com/fan_name/wishlist', expected: true },
		{ url: 'https://bandcamp.com/fan_name?from=menubar', expected: true },
		{
			url: 'https://bandcamp.com/fan_name/wishlist?from=menubar',
			expected: true,
		},
		{ url: 'https://bandcamp.com/fan_name/following', expected: false },
		{
			url: 'https://bandcamp.com/fan_name/wishlist/extra',
			expected: false,
		},
		{ url: 'https://bandcamp.com/', expected: false },
		{ url: 'http://bandcamp.com/fan_name', expected: false },
		{ url: 'https://band.bandcamp.com/fan_name', expected: false },
		{ url: 'https://bandcamp.com/fan.name', expected: false },
	];

	for (const c of CASES) {
		test(`should return ${c.expected} for ${c.url}`, () => {
			expect(new CollectionPageService().isServiceUrl(c.url)).toBe(
				c.expected
			);
		});
	}
});
