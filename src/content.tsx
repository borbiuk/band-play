import { initGuide } from './guide/guide';
import { listenHotkeys } from './services/hotkey-listener';
import { PageServiceWorker } from './services/page-service-worker';

const serviceWorker: PageServiceWorker = new PageServiceWorker();
serviceWorker.start();

listenHotkeys(serviceWorker);

initGuide();
