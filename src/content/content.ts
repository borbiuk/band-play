/*
	See Google Chrome Extension documentation:
	Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
*/

import { BatchDownloadService } from './services/batch-download-service';
import { PageServiceWorker } from './services/page-service-worker';
import { UserInputService } from './services/user-input-service';
import './styles/visited.scss';
import './styles/batch-download.scss';

/**
 * Main content script entry point.
 * Initializes all core services and components that run on Bandcamp pages.
 */

// setup services:
/** Service worker that manages page-specific services and handles page type detection */
const serviceWorker = new PageServiceWorker();

/** Service that handles user input and keyboard shortcuts */
const userInputService = new UserInputService();

/** Service that injects batch download UI on Bandcamp pages (Batchcamp integration) */
const batchDownloadService = new BatchDownloadService();

// run core services:
Promise.all([serviceWorker.start(), userInputService.start(serviceWorker)])
	.then(() => {
		// The settings are loaded and the shortcuts work (the e2e tests wait for this)
		document.documentElement.setAttribute('data-band-play', 'ready');
	})
	.catch((e) => console.error(e));
batchDownloadService.start();
