/*
	See Google Chrome Extension documentation:
	Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
*/

import { initGuide } from './page-services/bandcamp/guide/guide';
import { PageServiceWorker } from './services/page-service-worker';
import { UserInputService } from './services/user-input-service';

// setup services:
const serviceWorker = new PageServiceWorker();
const userInputService = new UserInputService();

// run core services:
serviceWorker.start();
userInputService.start(serviceWorker);

// add Guide to the DOM
initGuide();
