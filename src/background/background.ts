/*
	See Google Chrome Extension documentation:
	Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
*/

import { BatchDownloadBackgroundService } from './batch-download/batch-download-background-service';
import { KeepAwakeBackgroundService } from './services/keep-awake-background-service';
import { MessagesBackgroundService } from './services/messages-background-service';
import { UpdateAvailableBackgroundService } from './services/update-available-background-service';
import { UrlChangeBackgroundService } from './services/url-change-background-service';

/**
 * Main background entry point.
 * Starts core background services that run in the extension's service worker.
 *
 * NOTE: Single instance per browser.
 */

/** Manages batch download operations and state in the background */
const batchDownloadService = new BatchDownloadBackgroundService();

/** Handles message communication between different parts of the extension */
const messagesService = new MessagesBackgroundService(batchDownloadService);

/** Detects and handles URL changes in tabs */
const urlChangeService = new UrlChangeBackgroundService();

/** Checks for extension updates and notifies the user */
const updateAvailableService = new UpdateAvailableBackgroundService();

/** Prevents the service worker from going to sleep during active operations */
const keepAwakeService = new KeepAwakeBackgroundService();

// run services:
[
	urlChangeService,
	updateAvailableService,
	keepAwakeService,
	batchDownloadService,
	messagesService,
].forEach((service) => {
	try {
		service.start();
	} catch (e) {
		console.error(e);
	}
});
