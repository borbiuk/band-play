/*
	See Google Chrome Extension documentation:
	Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
*/

import { initGuide } from './page-services/bandcamp/guide/guide';
import { PageServiceWorker } from './services/page-service-worker';
import { UserInputService } from './services/user-input-service';

/**
 * Main content script entry point for the Bandcamp Play extension.
 * Initializes all core services and components that run on music streaming pages.
 *
 * This script is injected into Bandcamp and SoundCloud pages to provide
 * enhanced playback controls and keyboard shortcuts.
 */

// setup services:
/** Service worker that manages page-specific services and handles page type detection */
const serviceWorker = new PageServiceWorker();

/** Service that handles user input and keyboard shortcuts */
const userInputService = new UserInputService();

// run core services:
serviceWorker.start();
userInputService.start(serviceWorker);

// add Guide to the DOM
initGuide();
