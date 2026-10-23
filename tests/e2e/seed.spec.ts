import { openBandcamp, PAGES } from './fixtures/bandcamp';
import { expect, test } from './fixtures/extension';

// Seed for the Playwright test agents (planner, generator, healer): the built extension on a Bandcamp snapshot.
// Coverage of the album page itself is in album-shortcuts.spec.ts.
test('should open the album page snapshot with the extension loaded', async ({
	page,
}) => {
	await openBandcamp(page, PAGES.album);

	await expect(page.locator('html')).toHaveAttribute(
		'data-band-play',
		'ready'
	);
});
