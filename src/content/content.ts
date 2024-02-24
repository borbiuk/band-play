import { initGuide } from './guide/guide';
import { listenHotkeys } from './hotkey-listener';
import { PageServiceWorker } from './page-service-worker';

const serviceWorker: PageServiceWorker = new PageServiceWorker();
serviceWorker.start();

listenHotkeys(serviceWorker);

initGuide();
