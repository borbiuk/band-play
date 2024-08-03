import { initGuide } from './guide/guide';
import { PageServiceWorker } from './services/page-service-worker';
import { UserInputService } from './services/user-input-service';

const serviceWorker: PageServiceWorker = new PageServiceWorker();
serviceWorker.start();

const userInputService: UserInputService = new UserInputService();
userInputService.start(serviceWorker);

initGuide();
