import { ShortcutType } from '@shared/enums';

import {
	addPlayerAudio,
	openBandcamp,
	PAGES,
	readAudio,
	recordKeys,
} from './fixtures/bandcamp';
import { expect, test } from './fixtures/extension';

test('should seek by a playback step over 60 seconds stored in the settings', async ({
	page,
	storage,
}) => {
	await storage.set({ playbackStep: 90 });
	await openBandcamp(page, PAGES.album);
	await addPlayerAudio(page);

	await page.keyboard.press('ArrowRight');

	await expect
		.poll(async () => (await readAudio(page)).currentTime)
		.toBeCloseTo(90, 3);
});

test('should use a play/pause key combination stored in the settings', async ({
	page,
	storage,
}) => {
	await storage.set({
		shortcuts: { [ShortcutType.PlayPause]: JSON.stringify(['KeyK']) },
	});
	await openBandcamp(page, PAGES.album);
	await addPlayerAudio(page);
	const readKeys = await recordKeys(page);

	await page.keyboard.press('Space');
	await page.keyboard.press('KeyK');

	await expect.poll(async () => (await readAudio(page)).paused).toBe(false);
	await expect.poll(readKeys).toEqual([
		{ code: 'Space', defaultPrevented: false },
		{ code: 'KeyK', defaultPrevented: true },
	]);
});

test('should leave the arrow keys to a Bandcamp page without a player service', async ({
	page,
}) => {
	await openBandcamp(page, PAGES.artist);
	const readKeys = await recordKeys(page);

	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Space');

	await expect.poll(readKeys).toEqual([
		{ code: 'ArrowDown', defaultPrevented: false },
		{ code: 'Space', defaultPrevented: false },
	]);
});
