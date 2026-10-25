import { expect, test } from '@playwright/test';
import { BatchDownloadFormat } from '@shared/enums';

import { BatchDownloadPendingItemModel } from '../../src/shared/models/batch-download/batch-download-pending-item-model';
import { FakeLocalStorage, installChrome } from '../helpers/fake-chrome';

type Actions = typeof import('../../src/background/batch-download/actions');

let restoreChrome: (() => void) | undefined;

test.afterEach(() => {
	restoreChrome?.();
	restoreChrome = undefined;
});

/** What `enqueuePendingItems` did, with the stored data it ran against. */
interface Run {
	queued: BatchDownloadPendingItemModel[];
	openedTab: boolean;
	scheduledTick: boolean;
	stored: Record<string, unknown>;
}

/**
 * Runs `enqueuePendingItems` against a fake storage. The module reads `chrome` while it loads,
 * so the fake global is installed before the import.
 */
async function enqueue(
	stored: Record<string, unknown>,
	items: BatchDownloadPendingItemModel[],
	format?: BatchDownloadFormat
): Promise<Run> {
	const storage = new FakeLocalStorage();
	storage.seed(stored);
	// A test can run several batches: put the original global back before the next fake goes in
	restoreChrome?.();
	restoreChrome = installChrome(storage.toChrome());
	const { enqueuePendingItems }: Actions =
		await import('../../src/background/batch-download/actions');

	const run: Run = {
		queued: [],
		openedTab: false,
		scheduledTick: false,
		stored: {},
	};
	await enqueuePendingItems(
		items,
		format,
		() => void 0,
		async (appended) => {
			run.queued.push(...appended);
		},
		async () => {
			run.openedTab = true;
			return 1;
		},
		() => {
			run.scheduledTick = true;
		}
	);
	run.stored = storage.dump();
	return run;
}

const item = (id: string): BatchDownloadPendingItemModel => ({
	id,
	title: `Release ${id}`,
	url: `https://bandcamp.com/download?id=${id}`,
});

test.describe('enqueuePendingItems', () => {
	test('should queue every item and open the downloads tab by default', async () => {
		const run = await enqueue({}, [item('1'), item('2')]);

		expect(run.queued.map((x) => x.sourceId)).toEqual(['1', '2']);
		expect(run.openedTab).toBe(true);
		expect(run.scheduledTick).toBe(true);
	});

	test('should start the queue without opening the downloads tab when the setting is off', async () => {
		const run = await enqueue({ batchDownloadOpenPage: false }, [
			item('1'),
		]);

		expect(run.queued).toHaveLength(1);
		expect(run.openedTab).toBe(false);
		expect(run.scheduledTick).toBe(true);
	});

	test('should leave out a release downloaded in the same format', async () => {
		const run = await enqueue(
			{
				batchDownloadSkipDownloaded: true,
				batchDownloadFormat: 'flac',
				batchDownloadHistory: { '1::flac': 1000 },
			},
			[item('1'), item('2')]
		);

		expect(run.queued.map((x) => x.sourceId)).toEqual(['2']);
	});

	test('should keep a release that was downloaded in another format', async () => {
		const run = await enqueue(
			{
				batchDownloadSkipDownloaded: true,
				batchDownloadFormat: 'flac',
				batchDownloadHistory: { '1::mp3-320': 1000 },
			},
			[item('1')]
		);

		expect(run.queued.map((x) => x.sourceId)).toEqual(['1']);
	});

	test('should compare with the format chosen for this batch', async () => {
		const run = await enqueue(
			{
				batchDownloadSkipDownloaded: true,
				batchDownloadFormat: 'flac',
				batchDownloadHistory: { '1::mp3-320': 1000 },
			},
			[item('1')],
			BatchDownloadFormat.Mp3320
		);

		expect(run.queued).toHaveLength(0);
		expect(run.openedTab).toBe(false);
		expect(run.scheduledTick).toBe(false);
	});

	test('should keep downloaded releases when the skip setting is off', async () => {
		const run = await enqueue(
			{ batchDownloadHistory: { '1::wav': 1000 } },
			[item('1')]
		);

		expect(run.queued).toHaveLength(1);
	});

	test('should mark the batch for a notification only when the setting is on', async () => {
		const off = await enqueue({}, [item('1')]);
		const on = await enqueue({ batchDownloadNotify: true }, [item('1')]);

		expect('batchDownloadNotifyPending' in off.stored).toBe(false);
		expect(typeof on.stored.batchDownloadNotifyPending).toBe('number');
	});
});
