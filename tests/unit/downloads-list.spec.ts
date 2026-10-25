import { expect, test } from '@playwright/test';

import {
	buildRows,
	bundleFiles,
	countByFilter,
	duplicateIndexById,
	filesOfBundle,
	ListQuery,
	statusGroup,
} from '../../src/downloads/utils/list.utils';
import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { bundle, pending, single } from '../helpers/download-items';

const ALL: ListQuery = {
	filter: 'all',
	query: '',
	sort: 'queue',
	collapsed: new Set(),
};

const ids = (rows: { item: { id: string } }[]) => rows.map((x) => x.item.id);

test.describe('statusGroup', () => {
	const CASES: [DownloadStatus, string][] = [
		[DownloadStatus.Pending, 'active'],
		[DownloadStatus.Queued, 'active'],
		[DownloadStatus.Resolving, 'active'],
		[DownloadStatus.Resolved, 'active'],
		[DownloadStatus.Downloading, 'active'],
		[DownloadStatus.RateLimited, 'active'],
		[DownloadStatus.Paused, 'paused'],
		[DownloadStatus.Duplicate, 'paused'],
		[DownloadStatus.Failed, 'failed'],
		[DownloadStatus.Completed, 'done'],
	];

	for (const [status, group] of CASES) {
		test(`should put ${status} in the ${group} group`, () => {
			expect(statusGroup(status)).toBe(group);
		});
	}
});

test.describe('countByFilter', () => {
	test('should count the top-level rows once, a bundle as one', () => {
		const items = [
			single('a', DownloadStatus.Downloading),
			single('b', DownloadStatus.Paused),
			single('c', DownloadStatus.Failed),
			single('d', DownloadStatus.Completed),
			bundle('m', DownloadStatus.Resolved, ['f1', 'f2']),
			single('f1', DownloadStatus.Completed, { parentId: 'm' }),
			single('f2', DownloadStatus.Downloading, { parentId: 'm' }),
		];

		expect(countByFilter(items)).toEqual({
			all: 5,
			active: 2,
			paused: 1,
			failed: 1,
			done: 1,
		});
	});
});

test.describe('buildRows', () => {
	test('should order by the newest batch first, then by the collection order', () => {
		const items = [
			single('old', DownloadStatus.Completed, { createdAt: 100 }),
			single('new-2', DownloadStatus.Completed, {
				createdAt: 200,
				collectionIndex: 2,
			}),
			single('new-1', DownloadStatus.Completed, {
				createdAt: 200,
				collectionIndex: 1,
			}),
		];

		expect(ids(buildRows(items, ALL))).toEqual(['new-1', 'new-2', 'old']);
	});

	test('should filter by group', () => {
		const items = [
			single('a', DownloadStatus.Downloading),
			single('b', DownloadStatus.Failed),
		];

		expect(ids(buildRows(items, { ...ALL, filter: 'failed' }))).toEqual([
			'b',
		]);
	});

	test('should search the title and the artist, ignoring case', () => {
		const items = [
			single('a', DownloadStatus.Completed, {
				itemTitle: 'Night Signal',
				artist: 'Halcyon Grid',
			}),
			single('b', DownloadStatus.Completed, {
				itemTitle: 'Low Tide',
				artist: 'The Ferries',
			}),
		];

		expect(ids(buildRows(items, { ...ALL, query: 'HALCYON' }))).toEqual([
			'a',
		]);
		expect(ids(buildRows(items, { ...ALL, query: ' tide ' }))).toEqual([
			'b',
		]);
	});

	test('should sort by title ignoring case', () => {
		const items = [
			single('a', DownloadStatus.Completed, { itemTitle: 'b-side' }),
			single('b', DownloadStatus.Completed, { itemTitle: 'A-side' }),
		];

		expect(ids(buildRows(items, { ...ALL, sort: 'title' }))).toEqual([
			'b',
			'a',
		]);
	});

	test('should sort by status with failed first and done last', () => {
		const items = [
			single('done', DownloadStatus.Completed),
			single('paused', DownloadStatus.Paused),
			single('failed', DownloadStatus.Failed),
			single('running', DownloadStatus.Downloading),
		];

		expect(ids(buildRows(items, { ...ALL, sort: 'status' }))).toEqual([
			'failed',
			'running',
			'paused',
			'done',
		]);
	});

	test('should show the files of an open bundle one level deeper and hide them when it is folded', () => {
		const items = [
			bundle('m', DownloadStatus.Resolved, ['f1', 'f2'], {
				createdAt: 10,
			}),
			single('f1', DownloadStatus.Completed, { parentId: 'm' }),
			single('f2', DownloadStatus.Downloading, { parentId: 'm' }),
			single('x', DownloadStatus.Completed, { createdAt: 1 }),
		];

		const open = buildRows(items, ALL);
		expect(open.map((x) => [x.item.id, x.depth])).toEqual([
			['m', 0],
			['f1', 1],
			['f2', 1],
			['x', 0],
		]);

		const folded = buildRows(items, { ...ALL, collapsed: new Set(['m']) });
		expect(ids(folded)).toEqual(['m', 'x']);
	});

	test('should keep a bundle when one of its files matches the filter or the search', () => {
		const items = [
			bundle('m', DownloadStatus.Resolved, ['f1']),
			single('f1', DownloadStatus.Failed, {
				parentId: 'm',
				itemTitle: 'Hidden Track',
			}),
		];

		expect(ids(buildRows(items, { ...ALL, filter: 'failed' }))).toContain(
			'm'
		);
		expect(ids(buildRows(items, { ...ALL, query: 'hidden' }))).toContain(
			'm'
		);
	});

	test('should show a file of a missing bundle as a normal row', () => {
		const items = [
			single('f1', DownloadStatus.Completed, { parentId: 'gone' }),
		];

		expect(buildRows(items, ALL).map((x) => x.depth)).toEqual([0]);
	});
});

test.describe('filesOfBundle', () => {
	test('should return only the files of that bundle', () => {
		const items = [
			bundle('m', DownloadStatus.Resolved, ['f1']),
			single('f1', DownloadStatus.Completed, { parentId: 'm' }),
			single('x', DownloadStatus.Completed),
		];

		expect(filesOfBundle(items, 'm').map((x) => x.id)).toEqual(['f1']);
		expect(filesOfBundle(items, 'none')).toEqual([]);
	});
});

test.describe('bundleFiles', () => {
	test('should return the files of every bundle in the default order', () => {
		const items = [
			bundle('m1', DownloadStatus.Resolved, ['a', 'b']),
			bundle('m2', DownloadStatus.Resolved, ['c']),
			single('a', DownloadStatus.Completed, {
				parentId: 'm1',
				createdAt: 1,
			}),
			single('b', DownloadStatus.Completed, {
				parentId: 'm1',
				createdAt: 2,
			}),
			single('c', DownloadStatus.Completed, { parentId: 'm2' }),
			single('x', DownloadStatus.Completed),
		];

		const files = bundleFiles(items);

		// The newest batch first
		expect(files.get('m1')?.map((x) => x.id)).toEqual(['b', 'a']);
		expect(files.get('m2')?.map((x) => x.id)).toEqual(['c']);
		expect(files.has('x')).toBe(false);
	});

	test('should leave out a bundle without files and a file of an unknown bundle', () => {
		const items = [
			bundle('m1'),
			single('a', DownloadStatus.Completed, { parentId: 'gone' }),
		];

		expect(bundleFiles(items).size).toBe(0);
	});
});

test.describe('duplicateIndexById', () => {
	test('should number a release queued twice, oldest first, and leave single ones alone', () => {
		const items = [
			single('a', DownloadStatus.Completed, {
				sourceId: 'r1',
				createdAt: 200,
			}),
			single('b', DownloadStatus.Completed, {
				sourceId: 'r1',
				createdAt: 100,
			}),
			single('c', DownloadStatus.Completed, { sourceId: 'r2' }),
			pending('p'),
		];

		const numbers = duplicateIndexById(items);

		// The newest comes first in the default order, so it gets number 1
		expect(numbers.get('a')).toBe(1);
		expect(numbers.get('b')).toBe(2);
		expect(numbers.has('c')).toBe(false);
		expect(numbers.has('p')).toBe(false);
	});
});
