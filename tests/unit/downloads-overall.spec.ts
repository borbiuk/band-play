import { expect, test } from '@playwright/test';

import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { computeOverall } from '../../src/shared/utils/batch-download-overall.utils';
import { bundle, pending, single } from '../helpers/download-items';

test.describe('computeOverall', () => {
	test('should return zeros for an empty list', () => {
		expect(computeOverall([])).toEqual({
			total: 0,
			completed: 0,
			failed: 0,
			donePct: 0,
			failedPct: 0,
			knownSizeMb: 0,
			downloadedMb: 0,
			allSizesKnown: false,
		});
	});

	test('should weight the progress by size when every size is known', () => {
		const overall = computeOverall([
			single('a', DownloadStatus.Completed, { sizeMb: 300 }),
			single('b', DownloadStatus.Downloading, {
				sizeMb: 100,
				progress: 50,
			}),
		]);

		expect(overall.total).toBe(2);
		expect(overall.completed).toBe(1);
		expect(overall.allSizesKnown).toBe(true);
		expect(overall.knownSizeMb).toBe(400);
		expect(overall.downloadedMb).toBe(350);
		expect(overall.donePct).toBeCloseTo(87.5, 5);
	});

	test('should use a plain average when a size is unknown', () => {
		const overall = computeOverall([
			single('a', DownloadStatus.Completed),
			single('b', DownloadStatus.Downloading, { progress: 50 }),
		]);

		expect(overall.allSizesKnown).toBe(false);
		expect(overall.donePct).toBeCloseTo(75, 5);
	});

	test('should count a release that is not resolved yet as one download without progress', () => {
		const overall = computeOverall([
			single('a', DownloadStatus.Completed, { sizeMb: 100 }),
			pending('p'),
		]);

		expect(overall.total).toBe(2);
		expect(overall.allSizesKnown).toBe(false);
		expect(overall.donePct).toBeCloseTo(50, 5);
	});

	test('should count failed files and failed releases, and leave bundles out', () => {
		const overall = computeOverall([
			single('a', DownloadStatus.Failed),
			pending('p', DownloadStatus.Failed),
			bundle('m', DownloadStatus.Failed, ['a']),
			single('b', DownloadStatus.Completed),
		]);

		expect(overall.total).toBe(3);
		expect(overall.failed).toBe(2);
		expect(overall.failedPct).toBeCloseTo((2 / 3) * 100, 5);
	});

	test('should treat a progress that is not a number as zero and clamp it', () => {
		const overall = computeOverall([
			single('a', DownloadStatus.Downloading, { progress: Number.NaN }),
			single('b', DownloadStatus.Downloading, { progress: 250 }),
		]);

		expect(overall.donePct).toBeCloseTo(50, 5);
	});
});
