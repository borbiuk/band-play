import { initGuide } from './guide/guide';
import { listenHotkeys, listenNavigator } from './hotkey-listener';
import { PageServiceWorker } from './page-service-worker';

const serviceWorker: PageServiceWorker = new PageServiceWorker();
serviceWorker.start();

listenHotkeys(serviceWorker);
listenNavigator(serviceWorker);

initGuide();
