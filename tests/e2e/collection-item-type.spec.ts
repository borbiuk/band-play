import { Locator, Page } from '@playwright/test';

import { openBandcamp, SYNTHETIC_PAGES } from './fixtures/bandcamp';
import { expect, test } from './fixtures/extension';
import { feature } from './fixtures/labels';

/** The six releases of the synthetic collection and wishlist pages and their kind. */
const ITEMS = [
	{ title: 'Laser Cut', badge: 'Album' },
	{ title: 'Night Signal', badge: 'Track' },
	{ title: 'Glass Garden', badge: 'Album' },
	{ title: 'Low Tide', badge: 'Album' },
	{ title: 'Soft Machines', badge: 'Track' },
	{ title: 'Paper Moons', badge: 'Album' },
];

/**
 * The badges on the cover of a release, found by its title.
 *
 * @param page - The collection or wishlist page.
 * @param title - The release title.
 */
const badgesOf = (page: Page, title: string) =>
	page
		.getByRole('listitem')
		.filter({ hasText: title })
		.locator('.collection-item-art-container')
		.getByText(/^(Album|Track)$/);

/**
 * How far a badge is from the left, right and bottom edge of its cover, in pixels.
 *
 * @param badge - A badge that sits in the cover of a release.
 */
const edgesOf = (badge: Locator) =>
	badge.evaluate((element) => {
		const cover = element.parentElement.getBoundingClientRect();
		const box = element.getBoundingClientRect();

		return {
			left: Math.round(box.left - cover.left),
			right: Math.round(cover.right - box.right),
			bottom: Math.round(cover.bottom - box.bottom),
		};
	});

/**
 * Puts a release into the player bar the way Bandcamp does: the bar holds `data-collect-item`
 * with a letter in front of the release id.
 *
 * @param page - The collection or wishlist page.
 * @param id - The release id, for example `1002`.
 */
const playInBar = (page: Page, id: string) =>
	page.evaluate((releaseId) => {
		document.querySelector('div[data-collect-item]')?.remove();
		const bar = document.createElement('div');
		bar.setAttribute('data-collect-item', `a${releaseId}`);
		document.body.appendChild(bar);
	}, id);

test.describe('item type badge', feature('item-type-badge'), () => {
	// The badge exists only in the alternative design
	test.beforeEach(async ({ storage }) => {
		await storage.set({ alternativeDesign: true });
	});

	const PAGES = [
		{ name: 'collection', url: SYNTHETIC_PAGES.collection },
		{ name: 'wishlist', url: SYNTHETIC_PAGES.wishlist },
	];

	for (const { name, url } of PAGES) {
		test(`should show one album or track badge on each cover of the ${name} page`, async ({
			page,
		}) => {
			await openBandcamp(page, url);

			for (const { title, badge } of ITEMS) {
				await expect(badgesOf(page, title)).toHaveText([badge]);
			}
		});
	}

	test('should put the badge in the bottom left corner and show it only while the item is hovered', async ({
		page,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.collection);
		const badge = badgesOf(page, 'Laser Cut');

		await expect(badge).toHaveCSS('opacity', '0');
		expect(await edgesOf(badge)).toMatchObject({ left: 8, bottom: 8 });

		await page.getByText('Laser Cut', { exact: true }).hover();
		await expect(badge).toHaveCSS('opacity', '1');
		await expect(badgesOf(page, 'Night Signal')).toHaveCSS('opacity', '0');

		await page.mouse.move(0, 0);
		await expect(badge).toHaveCSS('opacity', '0');
	});

	test('should keep the badge of the item that plays visible without the pointer', async ({
		page,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.collection);

		await playInBar(page, '1002');
		await expect(badgesOf(page, 'Night Signal')).toHaveCSS('opacity', '1');
		await expect(badgesOf(page, 'Laser Cut')).toHaveCSS('opacity', '0');

		// Another item starts: the first one is hidden again
		await playInBar(page, '1003');
		await expect(badgesOf(page, 'Glass Garden')).toHaveCSS('opacity', '1');
		await expect(badgesOf(page, 'Night Signal')).toHaveCSS('opacity', '0');
	});

	test('should keep the badge of the item with the class playing that Bandcamp sets', async ({
		page,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.collection);
		await expect(badgesOf(page, 'Night Signal')).toHaveCSS('opacity', '0');

		await page.evaluate(() => {
			document
				.getElementById('collection-item-container_1002')
				.classList.add('playing');
		});

		await expect(badgesOf(page, 'Night Signal')).toHaveCSS('opacity', '1');
		await expect(badgesOf(page, 'Laser Cut')).toHaveCSS('opacity', '0');
	});

	test('should mark an item loaded later once and skip an unknown kind', async ({
		page,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.wishlist);
		await expect(badgesOf(page, 'Laser Cut')).toHaveText(['Album']);

		// Items that Bandcamp adds after "view all": a track and one with an unknown kind
		await page.evaluate(() => {
			const grid = document.getElementById('wishlist-grid');
			const addItem = (id: string, type: string, title: string) => {
				const copy = grid.firstElementChild.cloneNode(
					true
				) as HTMLElement;
				copy.id = `collection-item-container_${id}`;
				copy.setAttribute('data-tralbumid', id);
				copy.setAttribute('data-trackid', `6${id.slice(1)}`);
				copy.setAttribute('data-tralbumtype', type);
				copy.removeAttribute('data-band-play-item-type');
				copy.querySelector('.band-play-item-type-badge').remove();
				copy.querySelector('.collection-item-title').textContent =
					title;
				grid.appendChild(copy);
			};
			addItem('1007', 't', 'Late Item');
			addItem('1008', 'x', 'Odd Item');
		});

		await expect(badgesOf(page, 'Late Item')).toHaveText(['Track']);
		await expect(
			page.locator('#wishlist-grid [data-band-play-item-type="none"]')
		).toHaveCount(1);
		await expect(badgesOf(page, 'Odd Item')).toHaveCount(0);
		await expect(badgesOf(page, 'Laser Cut')).toHaveText(['Album']);
	});
});

test.describe('alternative design', feature('alternative-design'), () => {
	/**
	 * The section under the title of a release (favorite track, "appears in", edit links), found by the title.
	 *
	 * @param page - The collection or wishlist page.
	 * @param title - The release title.
	 */
	const detailsOf = (page: Page, title: string) =>
		page
			.getByRole('listitem')
			.filter({ hasText: title })
			.locator('.collection-item-details-container');

	test('should show no badge and keep the section under the title by default', async ({
		page,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.collection);
		await page.getByText('Laser Cut', { exact: true }).hover();

		await expect(badgesOf(page, 'Laser Cut')).toBeHidden();
		await expect(detailsOf(page, 'Laser Cut')).toBeVisible();
	});

	for (const { name, url } of [
		{ name: 'collection', url: SYNTHETIC_PAGES.collection },
		{ name: 'wishlist', url: SYNTHETIC_PAGES.wishlist },
	]) {
		test(`should show the badge and hide the section under the title on the ${name} page`, async ({
			page,
			storage,
		}) => {
			await storage.set({ alternativeDesign: true });
			await openBandcamp(page, url);
			await page.getByText('Laser Cut', { exact: true }).hover();

			await expect(badgesOf(page, 'Laser Cut')).toBeVisible();
			await expect(detailsOf(page, 'Laser Cut')).toBeHidden();
			// The title and the artist stay
			await expect(
				page.getByText('Laser Cut', { exact: true })
			).toBeVisible();
		});
	}

	test('should let a card take the height of its content instead of the fixed minimum of Bandcamp', async ({
		page,
		storage,
	}) => {
		const heightOf = (title: string) =>
			page
				.getByRole('listitem')
				.filter({ hasText: title })
				.evaluate((element) => element.getBoundingClientRect().height);

		// The pages of Bandcamp give every card a minimum height of 360px
		await openBandcamp(page, SYNTHETIC_PAGES.collection);
		expect(await heightOf('Laser Cut')).toBeGreaterThanOrEqual(360);

		await storage.set({ alternativeDesign: true });
		await expect.poll(() => heightOf('Laser Cut')).toBeLessThan(300);

		await storage.set({ alternativeDesign: false });
		await expect
			.poll(() => heightOf('Laser Cut'))
			.toBeGreaterThanOrEqual(360);
	});

	test('should follow the setting without a page reload', async ({
		page,
		storage,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.collection);
		await expect(detailsOf(page, 'Laser Cut')).toBeVisible();

		await storage.set({ alternativeDesign: true });
		await expect(detailsOf(page, 'Laser Cut')).toBeHidden();

		await storage.set({ alternativeDesign: false });
		await expect(detailsOf(page, 'Laser Cut')).toBeVisible();
		await expect(badgesOf(page, 'Laser Cut')).toBeHidden();
	});
});
