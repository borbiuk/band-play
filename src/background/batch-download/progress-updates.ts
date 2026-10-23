import { exist, notExist } from '@shared/utils';

import { BatchDownloadRunner } from './runner';

/**
 * Registers a top-level chrome.downloads.onChanged listener.
 *
 * Events registered here wake the MV3 service worker, so batch-download
 * progress and completion keep being tracked even after the worker was
 * killed while downloads were still running in the browser.
 */
export const registerDownloadsProgressHandling = (
	runner: BatchDownloadRunner
): void => {
	chrome.downloads.onChanged.addListener((delta) => {
		if (notExist(delta?.id)) {
			return;
		}

		// State transitions (complete/interrupted) must not be throttled
		// away: they may be the only event after a service worker restart.
		const isStateChange = exist(delta.state);
		runner
			.updateProgressForDownloadId(delta.id, isStateChange)
			.catch(() => void 0);
	});
};
