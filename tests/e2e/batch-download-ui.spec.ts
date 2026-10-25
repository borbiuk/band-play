import { Page } from '@playwright/test';

import { openBandcamp, SYNTHETIC_PAGES } from './fixtures/bandcamp';
import { expect, test } from './fixtures/extension';

const BAR_NAME = 'Band Play batch download';

/**
 * The Band Play bar of the page.
 *
 * @param page - A Bandcamp page with the extension.
 */
const bar = (page: Page) => page.getByRole('region', { name: BAR_NAME });

/**
 * The checkbox of a collection item, found by the release it belongs to.
 *
 * @param page - The collection page.
 * @param title - The release title.
 */
const checkboxOf = (page: Page, title: string) =>
	page.getByRole('checkbox', { name: `Select ${title} for download` });

/**
 * Ticks the checkbox of a release the way a user does: it shows on hover, then it is clicked.
 *
 * @param page - The collection page.
 * @param title - The release title.
 * @param modifiers - Keys held during the click, for example Shift.
 */
async function pick(
	page: Page,
	title: string,
	modifiers: ('Shift' | 'Meta')[] = []
): Promise<void> {
	await page.getByText(title, { exact: true }).hover();
	await checkboxOf(page, title).click({ modifiers });
}

test.describe('on the collection page', () => {
	test.beforeEach(async ({ page }) => {
		await openBandcamp(page, SYNTHETIC_PAGES.collection);
	});

	test('should show the bar with Download off until something is selected', async ({
		page,
	}) => {
		await expect(bar(page)).toContainText('Batch download');
		await expect(
			bar(page).getByRole('button', { name: /^Download/ })
		).toBeDisabled();
		await expect(
			bar(page).getByRole('button', { name: 'Select new' })
		).toBeHidden();
	});

	test('should show a checkbox on hover and keep all of them while something is selected', async ({
		page,
	}) => {
		const first = checkboxOf(page, 'Laser Cut');
		const second = checkboxOf(page, 'Night Signal');
		await expect(first).toHaveCSS('opacity', '0');

		await page.getByText('Laser Cut').hover();
		await expect(first).toHaveCSS('opacity', '1');

		await first.check();
		await page.mouse.move(0, 0);

		await expect(first).toBeChecked();
		await expect(second).toHaveCSS('opacity', '1');
		await expect(page.locator('body')).toHaveClass(/band-play-selecting/);
		await expect(bar(page)).toContainText('1 selected');
		await expect(
			bar(page).getByRole('button', { name: /^Download 1/ })
		).toBeEnabled();

		await bar(page)
			.getByRole('button', { name: 'Clear selection' })
			.click();

		await expect(first).not.toBeChecked();
		await expect(page.locator('body')).not.toHaveClass(
			/band-play-selecting/
		);
	});

	test('should select a range with Shift and everything with Select all', async ({
		page,
	}) => {
		await pick(page, 'Laser Cut');
		await pick(page, 'Glass Garden', ['Shift']);

		await expect(bar(page)).toContainText('3 selected');

		await bar(page)
			.getByRole('button', { name: 'Clear selection' })
			.click();
		await bar(page).getByRole('button', { name: 'Select all' }).click();

		await expect(bar(page)).toContainText('6 selected');
	});

	test('should let the user pick the format of one batch', async ({
		page,
	}) => {
		await pick(page, 'Laser Cut');
		await expect(bar(page)).toContainText('WAV');

		await bar(page)
			.getByRole('button', {
				name: 'Choose download format for this batch',
			})
			.click();
		await bar(page).getByRole('menuitemradio', { name: 'FLAC' }).click();

		await expect(
			bar(page).getByRole('button', { name: /^Download 1/ })
		).toContainText('FLAC');
	});

	test('should send the selected releases and confirm it in the bar', async ({
		page,
		storage,
	}) => {
		await storage.set({ batchDownloadOpenPage: false });
		await pick(page, 'Laser Cut');
		await pick(page, 'Night Signal');

		await bar(page)
			.getByRole('button', { name: /^Download 2/ })
			.click();

		await expect(bar(page)).toContainText('2 releases sent to Downloads');
		await expect
			.poll(async () => {
				const items = (await storage.get('batchDownloadItems')) as
					{ title: string }[] | undefined;
				return items?.map((x) => x.title).sort();
			})
			.toEqual([
				'BAUGRUPPE90 - Laser Cut',
				'Halcyon Grid - Night Signal',
			]);
		await expect(checkboxOf(page, 'Laser Cut')).not.toBeChecked();
	});

	test('should add the donate and rate tabs with icons', async ({ page }) => {
		const donate = page.locator('#band-play-tab-donate');
		const rate = page.locator('#band-play-tab-rate');

		await expect(donate).toContainText('donate');
		await expect(rate).toContainText('rate');
		await expect(donate.locator('svg')).toHaveCount(1);
		await expect(rate.locator('svg')).toHaveCount(1);
	});
});

test.describe('on the collection page with a download history', () => {
	test('should mark downloaded releases and select only the new ones', async ({
		page,
		storage,
	}) => {
		await storage.set({
			batchDownloadHistory: { '1001::wav': 1000, '1002::flac': 1000 },
		});
		await openBandcamp(page, SYNTHETIC_PAGES.collection);

		// Only the release downloaded in the current format (WAV) is marked
		await expect(page.getByText('Downloaded', { exact: true })).toHaveCount(
			1
		);
		await expect(
			bar(page).getByRole('button', { name: 'Select new' })
		).toBeVisible();

		await bar(page).getByRole('button', { name: 'Select new' }).click();

		await expect(bar(page)).toContainText('5 selected');
		await expect(checkboxOf(page, 'Laser Cut')).not.toBeChecked();
	});
});

test('should add nothing on the wishlist', async ({ page }) => {
	await openBandcamp(page, SYNTHETIC_PAGES.wishlist);

	await expect(page.locator('#wishlist-grid')).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(bar(page)).toHaveCount(0);
});

test.describe('on the purchases page', () => {
	test('should add a checkbox to every purchase and the bar', async ({
		page,
	}) => {
		await openBandcamp(page, SYNTHETIC_PAGES.purchases);

		await expect(page.getByRole('checkbox')).toHaveCount(4);
		await expect(bar(page)).toBeVisible();

		await page
			.getByRole('checkbox', {
				name: 'Select Laser Cut by BAUGRUPPE90 for download',
			})
			.check();

		await expect(bar(page)).toContainText('1 selected');
	});
});
