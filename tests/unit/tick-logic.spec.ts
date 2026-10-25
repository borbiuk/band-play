import { expect, test } from '@playwright/test';

import { BatchDownloadFileModel } from '../../src/shared/models/batch-download/batch-download-file-model';
import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { DownloadType } from '../../src/shared/models/batch-download/download-type';
import { bundle, pending, single } from '../helpers/download-items';
import { FakeLocalStorage, installChrome } from '../helpers/fake-chrome';

type TickLogic =
	typeof import('../../src/background/batch-download/tick-logic');

const NOW = 1_000_000;

/** The module reads `chrome` through `state.ts` while it loads, so a fake global is installed for the import only. */
async function load(): Promise<TickLogic> {
	const restoreChrome = installChrome(new FakeLocalStorage().toChrome());

	try {
		return await import('../../src/background/batch-download/tick-logic');
	} finally {
		restoreChrome();
	}
}

const file = (id: string): BatchDownloadFileModel => ({
	id,
	title: `File ${id}`,
	url: `https://popplers5.bandcamp.com/download/${id}`,
	progress: 7,
});

const ids = (items: { id: string }[]): string[] => items.map((x) => x.id);

test.describe('pickPendingToResolve', () => {
	test('should pick pending releases and rate-limited ones whose backoff elapsed', async () => {
		const { pickPendingToResolve } = await load();
		const items = [
			pending('a', DownloadStatus.Pending),
			pending('b', DownloadStatus.RateLimited, { nextRetryAt: NOW - 1 }),
			pending('c', DownloadStatus.RateLimited, { nextRetryAt: NOW }),
			pending('d', DownloadStatus.RateLimited),
		];

		expect(ids(pickPendingToResolve(items, NOW))).toEqual(['a', 'b', 'c']);
	});

	test('should skip a backoff that has not elapsed and every other status or type', async () => {
		const { pickPendingToResolve } = await load();
		const items = [
			pending('wait', DownloadStatus.RateLimited, {
				nextRetryAt: NOW + 1,
			}),
			pending('busy', DownloadStatus.Resolving),
			pending('failed', DownloadStatus.Failed),
			pending('queued', DownloadStatus.Queued),
			single('file', DownloadStatus.Resolved),
			bundle('bundle'),
		];

		expect(pickPendingToResolve(items, NOW)).toEqual([]);
	});

	test('should pick at most three releases, in list order', async () => {
		const { pickPendingToResolve } = await load();
		const items = ['a', 'b', 'c', 'd', 'e'].map((id) => pending(id));

		expect(ids(pickPendingToResolve(items, NOW))).toEqual(['a', 'b', 'c']);
	});
});

test.describe('pickResolvedToStart', () => {
	test('should pick resolved files that do not wait for a retry time', async () => {
		const { pickResolvedToStart } = await load();
		const items = [
			single('a', DownloadStatus.Resolved),
			single('b', DownloadStatus.Resolved, { nextRetryAt: NOW }),
			single('c', DownloadStatus.Resolved, { nextRetryAt: NOW + 1 }),
			single('d', DownloadStatus.Paused),
			single('e', DownloadStatus.Queued),
			pending('f', DownloadStatus.Pending),
		];

		expect(ids(pickResolvedToStart(items, NOW))).toEqual(['a', 'b']);
	});
});

test.describe('isOccupyingConcurrencySlot', () => {
	const CASES: {
		title: string;
		item: Parameters<TickLogic['isOccupyingConcurrencySlot']>[0];
		expected: boolean;
	}[] = [
		{
			title: 'a downloading file',
			item: single('a', DownloadStatus.Downloading),
			expected: true,
		},
		{
			title: 'a paused file with a browser download',
			item: single('a', DownloadStatus.Paused, {
				download: { browserDownloadId: 5 },
			}),
			expected: true,
		},
		{
			title: 'a paused file that never started',
			item: single('a', DownloadStatus.Paused),
			expected: false,
		},
		{
			title: 'a resolved file',
			item: single('a', DownloadStatus.Resolved),
			expected: false,
		},
		{
			title: 'a pending release',
			item: pending('a'),
			expected: false,
		},
		{
			title: 'a bundle',
			item: bundle('a'),
			expected: false,
		},
	];

	for (const c of CASES) {
		test(`should return ${c.expected} for ${c.title}`, async () => {
			const { isOccupyingConcurrencySlot } = await load();

			expect(isOccupyingConcurrencySlot(c.item)).toBe(c.expected);
		});
	}
});

test.describe('replacePendingWithSingle', () => {
	test('should replace the release with its file and keep the other items', async () => {
		const { replacePendingWithSingle } = await load();
		const release = pending('p', DownloadStatus.Resolving, {
			coverArtUrl: 'https://f4.bcbits.com/img/cover.jpg',
			collectionIndex: 3,
			createdAt: 42,
		});
		const other = single('other');

		const result = replacePendingWithSingle(
			[other, release],
			release,
			file('f1')
		);

		expect(result[0]).toBe(other);
		expect(result[1]).toEqual({
			id: 'p',
			title: release.title,
			coverArtUrl: 'https://f4.bcbits.com/img/cover.jpg',
			collectionIndex: 3,
			createdAt: 42,
			sourceId: 'p',
			type: DownloadType.Single,
			status: DownloadStatus.Resolved,
			pageUrl: release.url,
			download: { ...file('f1'), progress: 0 },
		});
	});

	test('should keep the source id of the release', async () => {
		const { replacePendingWithSingle } = await load();
		const release = pending('p-1', DownloadStatus.Resolving, {
			sourceId: 'p',
		});

		const [result] = replacePendingWithSingle(
			[release],
			release,
			file('f1')
		);

		expect(result.sourceId).toBe('p');
	});
});

test.describe('replacePendingWithBundle', () => {
	test('should replace the release with a parent and its files after the other items', async () => {
		const { replacePendingWithBundle } = await load();
		const release = pending('p', DownloadStatus.Resolving, {
			createdAt: 42,
		});
		const other = single('other');

		const result = replacePendingWithBundle([release, other], release, [
			file('f1'),
			file('f2'),
		]);

		expect(ids(result)).toEqual(['other', 'p', 'p:f1', 'p:f2']);
		expect(result[1]).toMatchObject({
			type: DownloadType.Multiple,
			status: DownloadStatus.Resolved,
			progress: 0,
			children: ['p:f1', 'p:f2'],
			sourceId: 'p',
			pageUrl: release.url,
		});
		expect(result[2]).toMatchObject({
			type: DownloadType.Single,
			status: DownloadStatus.Resolved,
			parentId: 'p',
			sourceId: 'f1',
			createdAt: 42,
			download: { id: 'f1', progress: 0 },
		});
	});

	test('should change nothing when the release is no longer being resolved', async () => {
		const { replacePendingWithBundle } = await load();
		const release = pending('p', DownloadStatus.Resolving);

		const removed = [single('other')];
		const requeued = [pending('p', DownloadStatus.Pending)];

		expect(replacePendingWithBundle(removed, release, [file('f1')])).toBe(
			removed
		);
		expect(replacePendingWithBundle(requeued, release, [file('f1')])).toBe(
			requeued
		);
	});
});

test.describe('applySharedRateLimitPause', () => {
	const delay = (attempt: number) => attempt * 1000;

	test('should rate-limit the rejected release and make the other pending ones wait too', async () => {
		const { applySharedRateLimitPause } = await load();
		const items = [
			pending('rejected', DownloadStatus.Resolving),
			pending('waiting', DownloadStatus.Pending),
			pending('failed', DownloadStatus.Failed),
			single('file', DownloadStatus.Downloading),
		];

		const result = applySharedRateLimitPause(items, 'rejected', NOW, delay);

		expect(result[0]).toMatchObject({
			status: DownloadStatus.RateLimited,
			rateLimitAttempt: 1,
			nextRetryAt: NOW + 1000,
		});
		expect(result[1]).toMatchObject({
			status: DownloadStatus.RateLimited,
			nextRetryAt: NOW + 1000,
		});
		expect(result[1]).not.toHaveProperty('rateLimitAttempt');
		expect(result[2]).toBe(items[2]);
		expect(result[3]).toBe(items[3]);
	});

	test('should count the attempts of the rejected release', async () => {
		const { applySharedRateLimitPause } = await load();
		const items = [
			pending('rejected', DownloadStatus.Resolving, {
				rateLimitAttempt: 2,
			}),
		];

		const [result] = applySharedRateLimitPause(
			items,
			'rejected',
			NOW,
			delay
		);

		expect(result).toMatchObject({
			status: DownloadStatus.RateLimited,
			rateLimitAttempt: 3,
			nextRetryAt: NOW + 3000,
		});
	});

	test('should fail the release after too many attempts', async () => {
		const { applySharedRateLimitPause, MAX_RATE_LIMIT_ATTEMPTS } =
			await load();
		const items = [
			pending('rejected', DownloadStatus.Resolving, {
				rateLimitAttempt: MAX_RATE_LIMIT_ATTEMPTS,
			}),
		];

		const [result] = applySharedRateLimitPause(
			items,
			'rejected',
			NOW,
			delay
		);

		expect(result.status).toBe(DownloadStatus.Failed);
	});
});

test.describe('planNextWake', () => {
	test('should tick at once while there is work and a free slot', async () => {
		const { planNextWake } = await load();

		expect(
			planNextWake([pending('a', DownloadStatus.Pending)], 2, NOW)
		).toEqual({ action: 'tick-now' });
		expect(
			planNextWake([single('a', DownloadStatus.Resolved)], 2, NOW)
		).toEqual({ action: 'tick-now' });
	});

	test('should not tick when every slot is taken, also by a paused file that has a browser download', async () => {
		const { planNextWake } = await load();
		const items = [
			single('running', DownloadStatus.Downloading),
			single('paused', DownloadStatus.Paused, {
				download: { browserDownloadId: 5 },
			}),
			single('waiting', DownloadStatus.Resolved),
		];

		expect(planNextWake(items, 2, NOW)).toEqual({ action: 'none' });
	});

	test('should tick at the earliest retry time', async () => {
		const { planNextWake } = await load();
		const items = [
			pending('limited', DownloadStatus.RateLimited, {
				nextRetryAt: NOW + 30_000,
			}),
			single('later', DownloadStatus.Resolved, {
				nextRetryAt: NOW + 10_000,
			}),
		];

		expect(planNextWake(items, 2, NOW)).toEqual({
			action: 'tick-at',
			delayMs: 10_000,
		});
	});

	test('should not wait for a rate-limited release whose backoff already elapsed', async () => {
		const { planNextWake } = await load();
		const items = [
			pending('limited', DownloadStatus.RateLimited, {
				nextRetryAt: NOW - 5,
			}),
		];

		expect(planNextWake(items, 2, NOW)).toEqual({
			action: 'tick-at',
			delayMs: 0,
		});
	});

	test('should do nothing when there is no work', async () => {
		const { planNextWake } = await load();
		const items = [
			single('done', DownloadStatus.Completed),
			single('failed', DownloadStatus.Failed),
		];

		expect(planNextWake([], 2, NOW)).toEqual({ action: 'none' });
		expect(planNextWake(items, 2, NOW)).toEqual({ action: 'none' });
	});
});
