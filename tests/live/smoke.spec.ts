import {
	ALBUM_SECOND_TRACK,
	openBandcamp,
	PAGES,
} from '../e2e/fixtures/bandcamp';
import { expect, test } from '../e2e/fixtures/extension';

// Real bandcamp.com (npm run test:live): Bandcamp's own player creates the <audio> element
test('should start the Bandcamp player with Space on an album page', async ({
	page,
}) => {
	await openBandcamp(page, PAGES.album);

	await page.keyboard.press('Space');

	await expect
		.poll(() =>
			page.evaluate(() => {
				const audio = document.querySelector('audio');
				return audio !== null && !audio.paused;
			})
		)
		.toBe(true);
});

test('should play the second track with Shift+2', async ({ page }) => {
	await openBandcamp(page, PAGES.album);

	await page.keyboard.press('Shift+Digit2');

	await expect(page.locator('.track_info .title')).toHaveText(
		ALBUM_SECOND_TRACK
	);
});
