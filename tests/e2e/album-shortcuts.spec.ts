import {
	addPlayerAudio,
	openBandcamp,
	PAGES,
	readAudio,
	recordKeys,
} from './fixtures/bandcamp';
import { expect, test } from './fixtures/extension';

// The album and the track page share one page service
for (const [name, url] of [
	['album', PAGES.album],
	['track', PAGES.track],
] as const) {
	test(`should start and pause playback with Space on the ${name} page`, async ({
		page,
	}) => {
		await openBandcamp(page, url);
		await addPlayerAudio(page);

		await page.keyboard.press('Space');
		await expect
			.poll(async () => (await readAudio(page)).paused)
			.toBe(false);

		await page.keyboard.press('Space');
		await expect
			.poll(async () => (await readAudio(page)).paused)
			.toBe(true);
	});
}

test.describe('on the album page', () => {
	test.beforeEach(async ({ page }) => {
		await openBandcamp(page, PAGES.album);
		await addPlayerAudio(page);
	});

	test('should seek forward and back by the default step of 10 seconds', async ({
		page,
	}) => {
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
		await expect
			.poll(async () => (await readAudio(page)).currentTime)
			.toBeCloseTo(20, 3);

		await page.keyboard.press('ArrowLeft');
		await expect
			.poll(async () => (await readAudio(page)).currentTime)
			.toBeCloseTo(10, 3);
	});

	test('should change the speed with the arrow keys and reset it with Shift+ArrowDown', async ({
		page,
	}) => {
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowUp');
		await expect
			.poll(async () => (await readAudio(page)).playbackRate)
			.toBeCloseTo(1.02, 5);

		await page.keyboard.press('ArrowDown');
		await expect
			.poll(async () => (await readAudio(page)).playbackRate)
			.toBeCloseTo(1.01, 5);

		await page.keyboard.press('Shift+ArrowDown');
		await expect
			.poll(async () => (await readAudio(page)).playbackRate)
			.toBe(1);
	});

	test('should switch the pitch correction with P and turn it off with Shift+P', async ({
		page,
	}) => {
		// Chromium corrects the pitch by default
		expect((await readAudio(page)).preservesPitch).toBe(true);

		await page.keyboard.press('KeyP');
		await expect
			.poll(async () => (await readAudio(page)).preservesPitch)
			.toBe(false);

		await page.keyboard.press('KeyP');
		await expect
			.poll(async () => (await readAudio(page)).preservesPitch)
			.toBe(true);

		await page.keyboard.press('Shift+KeyP');
		await expect
			.poll(async () => (await readAudio(page)).preservesPitch)
			.toBe(false);
	});

	test('should leave a combination with Control to the page and the browser', async ({
		page,
	}) => {
		const readKeys = await recordKeys(page);

		await page.keyboard.press('Control+ArrowRight');

		await expect.poll(readKeys).toEqual([
			{ code: 'ControlLeft', defaultPrevented: false },
			{ code: 'ArrowRight', defaultPrevented: false },
		]);
		expect((await readAudio(page)).currentTime).toBeCloseTo(0, 3);
	});

	test('should not take Space while the user types in a text field', async ({
		page,
	}) => {
		await page.evaluate(() => {
			const field = document.createElement('input');
			field.setAttribute('aria-label', 'Test field');
			document.body.prepend(field);
		});
		const field = page.getByRole('textbox', { name: 'Test field' });

		await field.press('Space');

		await expect(field).toHaveValue(' ');
		expect((await readAudio(page)).paused).toBe(true);
	});
});
