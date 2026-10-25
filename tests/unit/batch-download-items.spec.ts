import { expect, test } from '@playwright/test';

import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { DownloadType } from '../../src/shared/models/batch-download/download-type';
import { bundle, pending, single } from '../helpers/download-items';
import { FakeLocalStorage, installChrome } from '../helpers/fake-chrome';

type State = typeof import('../../src/background/batch-download/state');
type Actions = typeof import('../../src/background/batch-download/actions');

/**
 * Loads the batch download modules. They read `chrome` while they load, so a fake global is
 * installed for the imports only.
 */
async function load(): Promise<{ state: State; actions: Actions }> {
	const restoreChrome = installChrome(new FakeLocalStorage().toChrome());

	try {
		return {
			state: await import('../../src/background/batch-download/state'),
			actions:
				await import('../../src/background/batch-download/actions'),
		};
	} finally {
		restoreChrome();
	}
}

test.describe('patchItem', () => {
	test('should change only the item with that id and type and keep the others as they are', async () => {
		const { state } = await load();
		const items = [
			single('a'),
			single('b'),
			pending('c', DownloadStatus.Pending),
		];

		const result = state.patchItem(
			items,
			'b',
			DownloadType.Single,
			(x) => ({ ...x, status: DownloadStatus.Paused })
		);

		expect(result[1].status).toBe(DownloadStatus.Paused);
		expect(result[0]).toBe(items[0]);
		expect(result[2]).toBe(items[2]);
		expect(result).not.toBe(items);
	});

	test('should leave an item of another type with the same id alone', async () => {
		const { state } = await load();
		const items = [pending('a', DownloadStatus.Pending)];
		let called = false;

		const result = state.patchItem(items, 'a', DownloadType.Single, (x) => {
			called = true;
			return x;
		});

		expect(called).toBe(false);
		expect(result[0]).toBe(items[0]);
	});

	test('should not call the patch for an unknown id', async () => {
		const { state } = await load();
		const items = [single('a')];
		let called = false;

		state.patchItem(items, 'missing', DownloadType.Single, (x) => {
			called = true;
			return x;
		});

		expect(called).toBe(false);
	});

	test('should keep the item when the patch returns it unchanged', async () => {
		const { state } = await load();
		const items = [single('a', DownloadStatus.Completed)];

		const result = state.patchItem(
			items,
			'a',
			DownloadType.Single,
			(x) => x
		);

		expect(result[0]).toBe(items[0]);
	});

	test('should patch a bundle', async () => {
		const { state } = await load();
		const items = [bundle('m', DownloadStatus.Resolved, ['a'])];

		const result = state.patchItem(
			items,
			'm',
			DownloadType.Multiple,
			(x) => ({ ...x, progress: 50 })
		);

		expect(result[0]).toMatchObject({ id: 'm', progress: 50 });
	});
});

test.describe('resumedSingle', () => {
	const CASES: {
		title: string;
		status: DownloadStatus.Paused | DownloadStatus.Duplicate;
		browserDownloadId: number | undefined;
		duplicateResumed: boolean | undefined;
		expectedStatus: DownloadStatus;
		expectedDuplicateResumed: boolean | undefined;
	}[] = [
		{
			title: 'a duplicate with a browser download continues it and is marked as resumed',
			status: DownloadStatus.Duplicate,
			browserDownloadId: 5,
			duplicateResumed: undefined,
			expectedStatus: DownloadStatus.Downloading,
			expectedDuplicateResumed: true,
		},
		{
			title: 'a paused file with a browser download continues it',
			status: DownloadStatus.Paused,
			browserDownloadId: 5,
			duplicateResumed: undefined,
			expectedStatus: DownloadStatus.Downloading,
			expectedDuplicateResumed: undefined,
		},
		{
			title: 'a paused file without a browser download waits to be started',
			status: DownloadStatus.Paused,
			browserDownloadId: undefined,
			duplicateResumed: undefined,
			expectedStatus: DownloadStatus.Resolved,
			expectedDuplicateResumed: undefined,
		},
		{
			title: 'a duplicate without a browser download waits to be started and is marked as resumed',
			status: DownloadStatus.Duplicate,
			browserDownloadId: undefined,
			duplicateResumed: undefined,
			expectedStatus: DownloadStatus.Resolved,
			expectedDuplicateResumed: true,
		},
		{
			title: 'a paused file keeps an earlier resumed mark',
			status: DownloadStatus.Paused,
			browserDownloadId: 5,
			duplicateResumed: true,
			expectedStatus: DownloadStatus.Downloading,
			expectedDuplicateResumed: true,
		},
	];

	for (const c of CASES) {
		test(`should handle ${c.title}`, async () => {
			const { actions } = await load();
			const file = single('a', c.status, {
				duplicateResumed: c.duplicateResumed,
				download: { browserDownloadId: c.browserDownloadId },
			});

			const resumed = actions.resumedSingle(file);

			expect(resumed.status).toBe(c.expectedStatus);
			expect(resumed.duplicateResumed).toBe(c.expectedDuplicateResumed);
			expect(resumed.download.browserDownloadId).toBe(
				c.browserDownloadId
			);
		});
	}
});
