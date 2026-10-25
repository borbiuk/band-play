import { expect, test } from '@playwright/test';

import {
	isBandcampFileUrl,
	isBandcampUrl,
	isWishlistUrl,
} from '../../src/shared/utils/url.utils';

test.describe('isBandcampUrl', () => {
	const CASES: { url: unknown; expected: boolean }[] = [
		{ url: 'https://bandcamp.com/download?id=1', expected: true },
		{ url: 'https://band.bandcamp.com/album/a', expected: true },
		{ url: 'http://bandcamp.com/download', expected: false },
		{ url: 'https://bandcamp.com.evil.com/download', expected: false },
		{ url: 'https://evilbandcamp.com/download', expected: false },
		{ url: 'https://user@bandcamp.com/download', expected: false },
		{ url: 'https://bandcamp.com:8443/download', expected: false },
		{ url: 'javascript:alert(1)', expected: false },
		{ url: 'https://p4.bcbits.com/f', expected: false },
		{ url: 'not a url', expected: false },
		{ url: undefined, expected: false },
	];

	for (const { url, expected } of CASES) {
		test(`should return ${expected} for ${String(url)}`, () => {
			expect(isBandcampUrl(url)).toBe(expected);
		});
	}
});

test.describe('isBandcampFileUrl', () => {
	const CASES: { url: unknown; expected: boolean }[] = [
		{ url: 'https://p4.bcbits.com/download/1/flac', expected: true },
		{ url: 'https://f4.bcbits.com/img/a1.jpg', expected: true },
		{ url: 'https://popplers5.bandcamp.com/download', expected: true },
		{ url: 'http://p4.bcbits.com/f', expected: false },
		{ url: 'https://bcbits.com.evil.com/f', expected: false },
		{ url: 'data:text/html,hi', expected: false },
		{ url: 42, expected: false },
	];

	for (const { url, expected } of CASES) {
		test(`should return ${expected} for ${String(url)}`, () => {
			expect(isBandcampFileUrl(url)).toBe(expected);
		});
	}
});

test.describe('isWishlistUrl', () => {
	const CASES: { url: string; expected: boolean }[] = [
		{ url: 'https://bandcamp.com/fan/wishlist', expected: true },
		{ url: 'https://bandcamp.com/fan/wishlist/', expected: true },
		{ url: 'https://bandcamp.com/fan/wishlist?sort=a', expected: true },
		{ url: 'https://bandcamp.com/fan', expected: false },
		{ url: 'https://bandcamp.com/wishlist-fan', expected: false },
		{ url: 'https://bandcamp.com/fan?next=/wishlist', expected: false },
		{ url: 'not a url', expected: false },
	];

	for (const { url, expected } of CASES) {
		test(`should return ${expected} for ${url}`, () => {
			expect(isWishlistUrl(url)).toBe(expected);
		});
	}
});
