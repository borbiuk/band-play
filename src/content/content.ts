/*
	See Google Chrome Extension documentation:
	Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
*/

import { ConfigService } from '../shared/services/config-service';
import { MessageService } from '../shared/services/message-service';
import { initGuide } from './guide/guide';
import { PageServiceWorker } from './services/page-service-worker';
import { UserInputService } from './services/user-input-service';

// setup additional services:
const configService = new ConfigService();
const messageService = new MessageService();

// setup code services:
const serviceWorker = new PageServiceWorker(configService, messageService);
const userInputService = new UserInputService(configService, serviceWorker);

// run core services:
serviceWorker.start();
userInputService.start();

// add Guide to the DOM
initGuide();
