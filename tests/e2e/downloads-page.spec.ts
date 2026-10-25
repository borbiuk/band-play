import { Page } from '@playwright/test';

import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { bundle, pending, single } from '../helpers/download-items';

import { expect, test } from './fixtures/extension';

/** A completed file the browser still has. */
const completed = (n: number, title = `Release ${n}`) =>
	single(`s${n}`, DownloadStatus.Completed, {
		title: `Halcyon Grid - ${title}`,
		createdAt: 1_000_000 - n,
		collectionIndex: n,
		progress: 100,
		sizeMb: 100 + n,
		artist: 'Halcyon Grid',
		itemTitle: title,
		format: 'flac',
		download: {
			id: `f${n}`,
			title,
			url: 'https://popplers5.bandcamp.com/download/x',
			browserDownloadId: 100 + n,
		},
	});

/** A file that is paused (the runner leaves it alone until the user resumes it). */
const paused = (n: number, title: string) => ({
	...completed(n, title),
	status: DownloadStatus.Paused as const,
	download: { ...completed(n, title).download, progress: 40 },
});

const FAILED = {
	...completed(50, 'Low Tide'),
	status: DownloadStatus.Failed as const,
	download: { ...completed(50, 'Low Tide').download, progress: 0 },
};

/** A release that waits for a retry far in the future, so the runner does not touch it. */
const rateLimited = pending('p60', DownloadStatus.RateLimited, {
	title: 'Rate Limited Release',
	url: 'https://bandcamp.com/download?id=60',
	nextRetryAt: Date.now() + 3_600_000,
	createdAt: 1_000_000 - 60,
});

const BUNDLE = bundle('m70', DownloadStatus.Completed, ['s71', 's72'], {
	title: 'Quiet Harbor: Discography Bundle',
	progress: 100,
	createdAt: 1_000_000 - 70,
});

/**
 * Opens the downloads page.
 *
 * @param page - A tab of the test browser.
 * @param extensionId - Id of the loaded extension.
 */
async function openDownloads(page: Page, extensionId: string): Promise<void> {
	await page.goto(`chrome-extension://${extensionId}/downloads.html`);
}

test('should show the empty state with the steps to start a batch', async ({
	page,
	extensionId,
}) => {
	await openDownloads(page, extensionId);

	await expect(
		page.getByRole('heading', { name: 'Nothing to download yet' })
	).toBeVisible();
	await expect(
		page.getByRole('link', { name: 'Open Bandcamp' })
	).toBeVisible();
	await expect(
		page.getByRole('group', { name: 'Filter by status' })
	).toBeHidden();
});

test('should show the overall progress and the rows of the list', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [completed(1), completed(2), FAILED],
	});
	await openDownloads(page, extensionId);

	await expect(
		page.getByRole('region', { name: 'Overall progress' })
	).toContainText('2 of 3 downloaded');
	await expect(
		page.getByRole('region', { name: 'Overall progress' })
	).toContainText('1 failed');
	const list = page.getByRole('list', { name: 'Downloads' });
	await expect(list.getByRole('listitem')).toHaveCount(3);
	await expect(list).toContainText('Halcyon Grid · FLAC · 101 MB');
	await expect(list.getByRole('button', { name: 'Retry' })).toHaveCount(1);
});

test('should filter by status and show the counts', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [completed(1), paused(2, 'Torque Motion'), FAILED],
	});
	await openDownloads(page, extensionId);
	const filters = page.getByRole('group', { name: 'Filter by status' });

	await expect(filters.getByRole('button', { name: 'All 3' })).toBeVisible();
	await expect(
		filters.getByRole('button', { name: 'Paused 1' })
	).toBeVisible();
	await expect(
		filters.getByRole('button', { name: 'Failed 1' })
	).toBeVisible();

	await filters.getByRole('button', { name: 'Failed 1' }).click();

	const list = page.getByRole('list', { name: 'Downloads' });
	await expect(list.getByRole('listitem')).toHaveCount(1);
	await expect(list).toContainText('Low Tide');
});

test('should search by title and artist and say when nothing matches', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [
			completed(1, 'Night Signal'),
			completed(2, 'Low Tide'),
		],
	});
	await openDownloads(page, extensionId);
	const search = page.getByRole('searchbox', { name: 'Search downloads' });
	const list = page.getByRole('list', { name: 'Downloads' });

	await search.fill('night');
	await expect(list.getByRole('listitem')).toHaveCount(1);

	await search.fill('nothing like this');
	await expect(page.getByText('No matches')).toBeVisible();
});

test('should sort by title', async ({ page, extensionId, storage }) => {
	await storage.set({
		batchDownloadItems: [completed(1, 'Beta'), completed(2, 'Alpha')],
	});
	await openDownloads(page, extensionId);

	await page.getByRole('combobox', { name: 'Sort by' }).selectOption('title');

	await expect(
		page.getByRole('list', { name: 'Downloads' }).getByRole('listitem')
	).toContainText(['Alpha', 'Beta']);
});

test('should fold and unfold the files of a bundle', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [
			BUNDLE,
			{ ...completed(71, 'Slow Orbit'), parentId: 'm70' },
			{ ...completed(72, 'Cold Harbor'), parentId: 'm70' },
		],
	});
	await openDownloads(page, extensionId);
	const list = page.getByRole('list', { name: 'Downloads' });
	await expect(list.getByRole('listitem')).toHaveCount(3);
	await expect(list).toContainText('Bundle · 2 downloads · 2 of 2 done');

	await list
		.getByRole('button', { name: 'Fold Quiet Harbor: Discography Bundle' })
		.click();
	await expect(list.getByRole('listitem')).toHaveCount(1);

	await page.getByRole('button', { name: 'Unfold all bundles' }).click();
	await expect(list.getByRole('listitem')).toHaveCount(3);
});

test('should explain a rate limit and a pause in the row', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [rateLimited, paused(2, 'Torque Motion')],
	});
	await openDownloads(page, extensionId);
	const list = page.getByRole('list', { name: 'Downloads' });

	await expect(list).toContainText('Rate limited');
	await expect(list).toContainText(/Bandcamp is throttling\. Retry in \d+ s/);
	await expect(list).toContainText('Paused at 40%');
	await expect(
		page.getByRole('button', { name: 'Resume all' })
	).toBeEnabled();
});

test('should warn when Bandcamp wants a verified email', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [
			{
				...rateLimited,
				status: 'failed',
				failReason: 'unverified',
				nextRetryAt: undefined,
			},
		],
	});
	await openDownloads(page, extensionId);

	await expect(
		page.getByText('Bandcamp requires a verified email')
	).toBeVisible();
	await expect(page.getByRole('list', { name: 'Downloads' })).toContainText(
		'Email not verified'
	);
});

test('should clear the completed downloads from the menu', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: [completed(1), paused(2, 'Torque Motion')],
	});
	await openDownloads(page, extensionId);

	await page.getByRole('button', { name: 'More actions' }).click();
	await page.getByRole('menuitem', { name: 'Clear completed' }).click();

	await expect
		.poll(async () =>
			((await storage.get('batchDownloadItems')) as { id: string }[]).map(
				(x) => x.id
			)
		)
		.toEqual(['s2']);
});

test('should ask before clearing the whole list', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({ batchDownloadItems: [completed(1), completed(2)] });
	await openDownloads(page, extensionId);

	await page.getByRole('button', { name: 'More actions' }).click();
	await page.getByRole('menuitem', { name: 'Clear all…' }).click();
	const dialog = page.getByRole('dialog', { name: 'Clear all downloads?' });
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	expect((await storage.get('batchDownloadItems')) as unknown[]).toHaveLength(
		2
	);

	await page.getByRole('button', { name: 'More actions' }).click();
	await page.getByRole('menuitem', { name: 'Clear all…' }).click();
	await dialog.getByRole('button', { name: 'Clear all' }).click();

	await expect.poll(() => storage.get('batchDownloadItems')).toEqual([]);
	await expect(
		page.getByRole('heading', { name: 'Nothing to download yet' })
	).toBeVisible();
});

test('should ask before deleting a file from disk', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({ batchDownloadItems: [completed(1)] });
	await openDownloads(page, extensionId);

	await page.getByRole('button', { name: 'Delete file from disk' }).click();

	await expect(
		page.getByRole('dialog', { name: 'Delete the file from disk?' })
	).toBeVisible();
	await page
		.getByRole('dialog', { name: 'Delete the file from disk?' })
		.getByRole('button', { name: 'Cancel' })
		.click();
	await expect(
		page.getByRole('dialog', { name: 'Delete the file from disk?' })
	).toBeHidden();
});

test('should save the batch settings of the header', async ({
	page,
	extensionId,
	storage,
}) => {
	await openDownloads(page, extensionId);

	await page.getByLabel('Format').selectOption('FLAC');

	await expect.poll(() => storage.get('batchDownloadFormat')).toBe('flac');
	// Opening the page writes nothing else
	expect(await storage.get('batchDownloadConcurrency')).toBeUndefined();
});

test('should render only a window of a long list and never scroll sideways', async ({
	page,
	extensionId,
	storage,
}) => {
	await storage.set({
		batchDownloadItems: Array.from({ length: 300 }, (_, i) =>
			completed(i + 1)
		),
	});
	await openDownloads(page, extensionId);

	const rows = page
		.getByRole('list', { name: 'Downloads' })
		.getByRole('listitem');
	await expect(rows).not.toHaveCount(0);
	expect(await rows.count()).toBeLessThan(80);

	const widths = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		client: document.documentElement.clientWidth,
	}));
	expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});
