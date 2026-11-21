import { Page } from '@playwright/test';

import { openBandcamp, SYNTHETIC_PAGES } from './fixtures/bandcamp';
import { expect, test } from './fixtures/extension';
import { feature } from './fixtures/labels';

const BAR_NAME = 'Band Play batch download';

/**
 * The Band Play bar of the page.
 *
 * @param page - A Bandcamp page with the extension.
 */
const bar = (page: Page) => page.getByRole('region', { name: BAR_NAME });

/**
 * The logo button that stands for the closed bar.
 *
 * @param page - A Bandcamp page with the extension.
 */
const launcher = (page: Page) =>
	page.getByRole('button', { name: 'Batch download' });

/**
 * Opens the bar the way a user does, with a click on the logo.
 *
 * @param page - A Bandcamp page with the extension.
 */
async function openBar(page: Page): Promise<void> {
	await launcher(page).click();
	await expect(bar(page)).toBeVisible();
}

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

	test(
		'should show only the logo, and open the bar with Download off on a click',
		feature('batch-bar'),
		async ({ page }) => {
			// Closed: only the logo, with a tooltip and a pointer cursor
			await expect(launcher(page)).toBeVisible();
			await expect(launcher(page)).toHaveAttribute(
				'title',
				'Batch download'
			);
			await expect(launcher(page)).toHaveCSS('cursor', 'pointer');
			await expect(bar(page)).toHaveCount(0);

			await openBar(page);

			// The bar grows out of the logo with an animation
			await expect(bar(page)).toHaveCSS('animation-name', 'bp-bar-open');
			await expect(launcher(page)).toHaveCount(0);
			await expect(bar(page)).toContainText('Batch download');
			await expect(
				bar(page).getByRole('button', { name: /^Download/ })
			).toBeDisabled();
			await expect(
				bar(page).getByRole('button', { name: 'Select new' })
			).toBeHidden();
		}
	);

	test(
		'should collapse the bar back to the logo',
		feature('batch-bar'),
		async ({ page }) => {
			await openBar(page);

			await bar(page)
				.getByRole('button', { name: 'Collapse to the logo' })
				.click();

			await expect(bar(page)).toHaveCount(0);
			await expect(launcher(page)).toBeVisible();
		}
	);

	test(
		'should show a checkbox on hover and keep all of them while something is selected',
		feature('batch-select'),
		async ({ page }) => {
			const first = checkboxOf(page, 'Laser Cut');
			const second = checkboxOf(page, 'Night Signal');
			await expect(first).toHaveCSS('opacity', '0');

			await page.getByText('Laser Cut').hover();
			await expect(first).toHaveCSS('opacity', '1');

			await first.check();
			await page.mouse.move(0, 0);

			await expect(first).toBeChecked();
			await expect(second).toHaveCSS('opacity', '1');
			await expect(page.locator('body')).toHaveClass(
				/band-play-selecting/
			);
			// The closed bar keeps the selection in view as a number on the logo
			await expect(launcher(page)).toHaveAccessibleName(
				'Batch download, 1 selected'
			);

			await openBar(page);
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
		}
	);

	test(
		'should size the checkbox like the drag button of Bandcamp and keep it in the top left corner',
		feature('batch-select'),
		async ({ page }) => {
			// Bandcamp's own drag button is 31px, 8px from the corner of the cover, and its inputs are content-box
			await page.addStyleTag({
				content: 'input[type="checkbox"] { box-sizing: content-box; }',
			});
			const box = await checkboxOf(page, 'Laser Cut').evaluate(
				(element) => {
					const host = element.closest('.collection-item-container');
					const rect = element.getBoundingClientRect();
					const hostRect = host.getBoundingClientRect();

					return {
						width: rect.width,
						height: rect.height,
						left: Math.round(rect.left - hostRect.left - 1),
						top: Math.round(rect.top - hostRect.top - 1),
					};
				}
			);

			// The 1px is the transparent border of the item
			expect(box).toEqual({ width: 31, height: 31, left: 8, top: 8 });
		}
	);

	test(
		'should select a range with Shift and everything with Select all',
		feature('batch-select'),
		async ({ page }) => {
			await pick(page, 'Laser Cut');
			await pick(page, 'Glass Garden', ['Shift']);

			await openBar(page);
			await expect(bar(page)).toContainText('3 selected');

			await bar(page)
				.getByRole('button', { name: 'Clear selection' })
				.click();
			await bar(page).getByRole('button', { name: 'Select all' }).click();

			await expect(bar(page)).toContainText('6 selected');
		}
	);

	test(
		'should let the user pick the format of one batch',
		feature('batch-format'),
		async ({ page }) => {
			await pick(page, 'Laser Cut');
			await openBar(page);
			await expect(bar(page)).toContainText('WAV');

			await bar(page)
				.getByRole('button', {
					name: 'Choose download format for this batch',
				})
				.click();
			await bar(page)
				.getByRole('menuitemradio', { name: 'FLAC' })
				.click();

			await expect(
				bar(page).getByRole('button', { name: /^Download 1/ })
			).toContainText('FLAC');
		}
	);

	test(
		'should send the selected releases and confirm it in the bar',
		feature('batch-send'),
		async ({ page, storage }) => {
			await storage.set({ batchDownloadOpenPage: false });
			await pick(page, 'Laser Cut');
			await pick(page, 'Night Signal');
			await openBar(page);

			await bar(page)
				.getByRole('button', { name: /^Download 2/ })
				.click();

			await expect(bar(page)).toContainText(
				'2 releases sent to Downloads'
			);
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
		}
	);

	test(
		'should add the donate and rate tabs with icons',
		feature('batch-bar'),
		async ({ page }) => {
			const donate = page.locator('#band-play-tab-donate');
			const rate = page.locator('#band-play-tab-rate');

			await expect(donate).toContainText('donate');
			await expect(rate).toContainText('rate');
			await expect(donate.locator('svg')).toHaveCount(1);
			await expect(rate.locator('svg')).toHaveCount(1);
		}
	);
});

test.describe('on the collection page with a download history', () => {
	test(
		'should mark downloaded releases and select only the new ones',
		feature('batch-history'),
		async ({ page, storage }) => {
			await storage.set({
				batchDownloadHistory: { '1001::wav': 1000, '1002::flac': 1000 },
			});
			await openBandcamp(page, SYNTHETIC_PAGES.collection);

			// Only the release downloaded in the current format (WAV) is marked
			await expect(
				page.getByText('Downloaded', { exact: true })
			).toHaveCount(1);
			await openBar(page);
			await expect(
				bar(page).getByRole('button', { name: 'Select new' })
			).toBeVisible();

			await bar(page).getByRole('button', { name: 'Select new' }).click();

			await expect(bar(page)).toContainText('5 selected');
			await expect(checkboxOf(page, 'Laser Cut')).not.toBeChecked();
		}
	);
});

test.describe('the downloaded badge on the collection page', () => {
	test(
		'should sit in the bottom right corner and show only on hover or for the item that plays',
		feature('batch-history'),
		async ({ page, storage }) => {
			await storage.set({ batchDownloadHistory: { '1001::wav': 1000 } });
			await openBandcamp(page, SYNTHETIC_PAGES.collection);
			const badge = page.getByText('Downloaded', { exact: true });

			await expect(badge).toHaveCSS('opacity', '0');
			expect(
				await badge.evaluate((element) => {
					const cover = element.parentElement.getBoundingClientRect();
					const box = element.getBoundingClientRect();

					return {
						right: Math.round(cover.right - box.right),
						bottom: Math.round(cover.bottom - box.bottom),
					};
				})
			).toEqual({ right: 8, bottom: 8 });

			await page.getByText('Laser Cut', { exact: true }).hover();
			await expect(badge).toHaveCSS('opacity', '1');

			await page.mouse.move(0, 0);
			await expect(badge).toHaveCSS('opacity', '0');

			await page.evaluate(() => {
				const bar = document.createElement('div');
				bar.setAttribute('data-collect-item', 'a1001');
				document.body.appendChild(bar);
			});
			await expect(badge).toHaveCSS('opacity', '1');
		}
	);
});

test(
	'should add nothing on the wishlist',
	feature('batch-pages-scope'),
	async ({ page }) => {
		await openBandcamp(page, SYNTHETIC_PAGES.wishlist);

		await expect(page.locator('#wishlist-grid')).toBeVisible();
		await expect(page.getByRole('checkbox')).toHaveCount(0);
		await expect(bar(page)).toHaveCount(0);
		await expect(launcher(page)).toHaveCount(0);
	}
);

test.describe('on the purchases page', () => {
	test(
		'should add a checkbox to every purchase and the bar',
		feature('batch-pages-scope'),
		async ({ page }) => {
			await openBandcamp(page, SYNTHETIC_PAGES.purchases);

			await expect(page.getByRole('checkbox')).toHaveCount(4);
			await expect(launcher(page)).toBeVisible();

			await page
				.getByRole('checkbox', {
					name: 'Select Laser Cut by BAUGRUPPE90 for download',
				})
				.check();

			await openBar(page);
			await expect(bar(page)).toContainText('1 selected');
		}
	);
});
