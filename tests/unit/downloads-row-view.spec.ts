import { expect, test } from '@playwright/test';

import { toRowView } from '../../src/downloads/utils/row-view.utils';
import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { bundle, pending, single } from '../helpers/download-items';

const NOW = 1_000_000;

test.describe('toRowView status', () => {
	const CASES: [string, Parameters<typeof toRowView>[0], string][] = [
		['downloading', single('a', DownloadStatus.Downloading), 'downloading'],
		['queued file', single('a', DownloadStatus.Queued), 'waiting'],
		[
			'resolving release',
			pending('p', DownloadStatus.Resolving),
			'waiting',
		],
		[
			'file waiting for a retry',
			single('a', DownloadStatus.Resolved, { retryCount: 1 }),
			'retrying',
		],
		['paused', single('a', DownloadStatus.Paused), 'paused'],
		['duplicate', single('a', DownloadStatus.Duplicate), 'duplicate'],
		[
			'rate limited release',
			pending('p', DownloadStatus.RateLimited),
			'rate-limited',
		],
		['done', single('a', DownloadStatus.Completed), 'completed'],
		['failed release', pending('p', DownloadStatus.Failed), 'failed'],
	];

	for (const [name, item, status] of CASES) {
		test(`should show ${name} as ${status}`, () => {
			expect(toRowView(item, { now: NOW }).status).toBe(status);
		});
	}
});

test.describe('toRowView bundle', () => {
	test('should show what the files do and count the done ones', () => {
		const files = [
			single('f1', DownloadStatus.Completed, { parentId: 'm' }),
			single('f2', DownloadStatus.Downloading, { parentId: 'm' }),
		];
		const view = toRowView(
			bundle('m', DownloadStatus.Resolved, ['f1', 'f2']),
			{
				now: NOW,
				files,
			}
		);

		expect(view.status).toBe('downloading');
		expect(view.subtitle).toBe('Bundle · 2 downloads · 1 of 2 done');
	});

	test('should show a finished bundle as done and a failed one as failed', () => {
		const done = toRowView(bundle('m', DownloadStatus.Completed), {
			now: NOW,
			files: [],
		});
		const failed = toRowView(bundle('m', DownloadStatus.Failed), {
			now: NOW,
			files: [],
		});

		expect(done.status).toBe('completed');
		expect(failed.status).toBe('failed');
		expect(failed.actions.retry).toBe(true);
	});
});

test.describe('toRowView hints and progress', () => {
	test('should count down the rate limit', () => {
		const view = toRowView(
			pending('p', DownloadStatus.RateLimited, {
				nextRetryAt: NOW + 24_000,
			}),
			{ now: NOW }
		);

		expect(view.hint).toBe('Bandcamp is throttling. Retry in 24 s');
	});

	test('should not show a negative countdown', () => {
		const view = toRowView(
			pending('p', DownloadStatus.RateLimited, {
				nextRetryAt: NOW - 5000,
			}),
			{ now: NOW }
		);

		expect(view.hint).toBe('Bandcamp is throttling. Retry in 0 s');
	});

	test('should explain a duplicate', () => {
		const view = toRowView(single('a', DownloadStatus.Duplicate), {
			now: NOW,
		});

		expect(view.hint).toBe('File already exists. Resume to keep both');
		expect(view.progressTone).toBe('warn');
	});

	test('should explain an unverified account', () => {
		const view = toRowView(
			pending('p', DownloadStatus.Failed, { failReason: 'unverified' }),
			{ now: NOW }
		);

		expect(view.hint).toBe('Email not verified');
	});

	test('should show the size done of the size known', () => {
		const view = toRowView(
			single('a', DownloadStatus.Downloading, {
				progress: 50,
				sizeMb: 200,
			}),
			{ now: NOW }
		);

		expect(view.hint).toBe('100 MB of 200 MB');
		expect(view.progress).toBe(50);
		expect(view.indeterminate).toBe(false);
	});

	test('should pulse while the progress is still zero', () => {
		const view = toRowView(single('a', DownloadStatus.Downloading), {
			now: NOW,
		});

		expect(view.indeterminate).toBe(true);
		expect(view.hint).toBe('Starting…');
	});

	test('should not repeat the progress of a bundle in its hint', () => {
		const view = toRowView(
			bundle('m', DownloadStatus.Resolved, ['f1'], { progress: 40 }),
			{
				now: NOW,
				files: [
					single('f1', DownloadStatus.Downloading, { parentId: 'm' }),
				],
			}
		);

		expect(view.progress).toBe(40);
		expect(view.hint).toBe('');
	});

	test('should have no bar for a finished or waiting row', () => {
		expect(
			toRowView(single('a', DownloadStatus.Completed), { now: NOW })
				.progress
		).toBeNull();
		expect(toRowView(pending('p'), { now: NOW }).progress).toBeNull();
	});

	test('should number a repeated release and describe the file', () => {
		const view = toRowView(
			single('a', DownloadStatus.Completed, {
				itemTitle: 'Night Signal',
				artist: 'Halcyon Grid',
				format: 'flac',
				sizeMb: 184,
			}),
			{ now: NOW, duplicateIndex: 2 }
		);

		expect(view.title).toBe('Night Signal (2)');
		expect(view.subtitle).toBe('Halcyon Grid · FLAC · 184 MB');
	});
});

test.describe('toRowView actions', () => {
	test('should offer pause and cancel for a running file', () => {
		const { actions } = toRowView(single('a', DownloadStatus.Downloading), {
			now: NOW,
		});

		expect(actions).toMatchObject({
			pause: true,
			resume: false,
			retry: false,
			cancel: true,
			showInFolder: false,
		});
	});

	test('should offer resume and cancel for a paused file', () => {
		const { actions } = toRowView(single('a', DownloadStatus.Paused), {
			now: NOW,
		});

		expect(actions).toMatchObject({
			pause: false,
			resume: true,
			cancel: true,
		});
	});

	test('should offer retry for a failed file and no cancel', () => {
		const { actions } = toRowView(single('a', DownloadStatus.Failed), {
			now: NOW,
		});

		expect(actions).toMatchObject({ retry: true, cancel: false });
	});

	test('should offer folder and delete only for a completed file the browser has', () => {
		const withFile = toRowView(
			single('a', DownloadStatus.Completed, {
				download: {
					id: 'f',
					title: 't',
					url: 'u',
					progress: 100,
					browserDownloadId: 7,
				},
			}),
			{ now: NOW }
		).actions;
		const withoutFile = toRowView(single('a', DownloadStatus.Completed), {
			now: NOW,
		}).actions;

		expect(withFile).toMatchObject({
			showInFolder: true,
			deleteFile: true,
		});
		expect(withoutFile).toMatchObject({
			showInFolder: false,
			deleteFile: false,
		});
	});

	test('should use the download page as the link', () => {
		const release = toRowView(pending('p'), { now: NOW }).actions.copyUrl;
		const file = toRowView(
			single('a', DownloadStatus.Completed, {
				pageUrl: 'https://bandcamp.com/download?id=1',
			}),
			{ now: NOW }
		).actions.copyUrl;

		expect(release).toBe('https://bandcamp.com/download?id=p');
		expect(file).toBe('https://bandcamp.com/download?id=1');
	});
});
