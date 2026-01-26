# Розробка Google Chrome Extensions: повний практичний огляд (MV3)

## Вступ

Це практичний гайд про те, як влаштовані Chrome Extensions у 2026 році (Manifest V3), як розділяються контексти виконання, як вони спілкуються між собою, як дебажити кожен компонент і як не “вистрілити собі в ногу” стилями та дозволами (permissions).

Я пишу це на базі досвіду отриманого у розробці власного розширення для стрімінгової платформи Bandcamp (назва: **Bandcamp Play**). Ви можете знайти його в Google Web Store за назвою, ним користують вже більше ніж 1.5к користувачів.

## Для кого ця стаття

- Якщо ви вже знаєте JavaScript/TypeScript і хочете **системно зрозуміти архітектуру MV3**.
- Якщо у вашому розширенні є React компоненти які ви відображаєте на інших сайтах і хочете, щоб ваш CSS не ламав сайт, а сайт — ваш UI.
- Якщо вам потрібен Boilerplate Chrome extension

## План статті

1. Що таке Chrome Extension і як він працює в браузері
2. Основні компоненти розширення (manifest, background, content scripts, popup/extension pages)
3. Комунікація між компонентами: одноразові повідомлення і long‑lived ports
4. Chrome API та доступність у компонентах: практичні кейси
5. Debug компонентів: service worker, content script, popup/extension pages, messaging
6. MV3 + React + Tailwind: ізоляція стилів, бандли без hash‑імен
7. Публікація у Web Store: чекліст перед сабмітом та DevOps
8. Підсумки та boilerplate для старту на базі цього репозиторію

## 1. Що таке Google Chrome Extension і як він працює в браузері

Google Chrome Extension — це програма, яка запускається в браузері та може розширювати/автоматизовувати поведінку веб‑сайтів. Розширення має власні файли, власний життєвий цикл і доступ до частини API браузера.

Наразі для Chromium браузерів актуальним є Manifest V3 (MV3) - це платформа на якій працює розширеняя, у ній є свої правила та обмеження. За MV3 розширення є [service worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers). Це означає:

- service worker **не живе постійно**: він прокидається від подій і засинає після обробки;
- стан у памʼяті **ненадійний** (може пропасти між пробудженнями);
- довгі задачі треба або дробити на події, або зберігати прогрес у `chrome.storage`, або виносити в інші контексти.

## 2. Основні компоненти розширення

У MV3 існує кілька середовищ виконання:

- **content script** працює поряд із веб-сторінками і має доступ до DOM (через стандартні Web APIs);
- **service worker** має ширші можливості через `chrome.*` API і реагує на події;
- **extension pages** (popup/options/власні вкладки) дають вам UI, ізольований від сторінки.

### 2.1 `manifest.json`

`manifest.json` — це контракт між вашим кодом і Chrome. [Manifest file format](https://developer.chrome.com/docs/extensions/reference/manifest)

Мінімальний робочий `manifest.json` виглядає так:

```json
{
	"manifest_version": 3,
	"name": "Extension Example",
	"version": "1.0.0"
}
```

Типовий “практичний” manifest для MV3 (background + content script + action/popup) виглядає так:

```json
{
	"manifest_version": 3,
	"name": "Extension Example",
	"version": "1.0.0",
	"description": "Example extension", // обовʼязково для публікації у Web Store
	"icons": {
		"16": "assets/logo-16.png", // логотип роширення із різною роздільною здатністю
		"32": "assets/logo-32.png",
		"48": "assets/logo-48.png",
		"128": "assets/logo-128.png"
	},
	"permissions": ["storage"],
	"host_permissions": ["https://bandcamp.com/*", "https://*.bandcamp.com/*"],
	"background": {
		"service_worker": "background.js" // вхідна точка для service worker
	},
	"content_scripts": [
		{
			"js": ["content.js"], // вхідна точка для content script
			"matches": ["https://bandcamp.com/*", "https://*.bandcamp.com/*"],
			"run_at": "document_idle"
		}
	],
	"action": {
		"default_title": "Extension Example",
		"default_popup": "options.html" // вхідна точка для popup
	}
}
```

Практичні поради щодо дозволів:

- Не використовуйте `matches: ["https://*/*", "http://*/*"]` як “дефолт”. Це майже завжди створює зайві permission warnings і вбиває довіру.
- Якщо вам потрібен доступ тільки після дії користувача, подивіться в бік `activeTab` і/або `optional_permissions`. [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions), [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [Permission warnings](https://developer.chrome.com/docs/extensions/develop/concepts/permission-warnings)

### 2.2 Background (MV3 service worker)

Background у MV3 — це extension service worker. Він обробляє події й координує роботу частин розширення.

Мінімальний приклад: popup надсилає команду → background відкриває вкладку:

```ts
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === 'PopupOpenTab') {
		chrome.tabs.create({ url: chrome.runtime.getURL('tab.html') });
	}
});
```

### 2.3 Content scripts

Content‑скрипти працюють на сторінках, які ви вказали у `matches`. Вони:

- мають доступ до **DOM** через стандартні Web APIs (це не `chrome.dom`, а звичайний `document`, `window`, тощо);
- виконуються **ізольовано** (їхній JS‑контекст відділений від JS сторінки);
- мають доступ лише до частини `chrome.*` API; для решти — messaging. [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

Приклад: зібрати дані з DOM і відправити в background:

```ts
chrome.runtime.sendMessage({
	type: 'ContentPageInfo',
	payload: {
		title: document.title,
		url: window.location.href,
		capturedAt: Date.now(),
	},
});
```

### 2.4 Popup та інші extension pages

Popup задається через `"action"` → `"default_popup"` у `manifest.json`. Popup необовʼязковий: можна мати лише іконку без UI. [Action](https://developer.chrome.com/docs/extensions/reference/api/action)

Приклад: popup надсилає команду в background:

```ts
const handleOpenTab = () => {
	chrome.runtime.sendMessage({ type: 'PopupOpenTab' });
};
```

Extension pages — це ваші HTML‑сторінки розширення (popup/options/власні вкладки). Вони працюють під CSP обмеженнями, тому підхід “підвантажити віддалений скрипт” для розширень не підходить. [Content security policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)

Також важливо: [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs) доступний у service worker та extension pages, але **не** в content scripts

## 3. Комунікація між компонентами

Chrome підтримує:

- одноразові повідомлення (`sendMessage`);
- довгі зʼєднання через port (`connect`).

Детальніше можна прочитати в офіційній документації [Message passing](https://developer.chrome.com/docs/extensions/messaging).

### 3.1 `chrome.runtime.sendMessage()` — одноразові запити між частинами розширення

Підходить для:

- popup → background
- content → background
- background → extension pages

### 3.2 `chrome.tabs.sendMessage()` — одноразове повідомлення в content script конкретної вкладки

Використовується, коли у вас є `tabId` і ви хочете звернутись саме до content script.

```ts
chrome.tabs.sendMessage(activeTabId, {
	type: 'ContentHighlight',
	payload: { color: '#fef08a' },
});
```

### 3.3 `chrome.runtime.connect()` — long‑lived port

Port зручний, коли потрібне постійне зʼєднання між background та UI, наприклад стрімінг window подій до background.

```ts
const port = chrome.runtime.connect({ name: 'ui' });
port.postMessage({ type: 'UiPing' });
```

```ts
chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== 'ui') {
		return;
	}

	port.onMessage.addListener((message) => {
		if (message.type !== 'UiPing') {
			return;
		}

		port.postMessage({ type: 'SwPong' });
	});
});
```

Практичне правило №3: message protocol має бути типовим і стабільним.
Навіть якщо ви не використовуєте повний “RPC”, зробіть мінімум:

- `type` як discriminant;
- `payload` як дані;
- (опційно) `requestId` для співставлення відповіді.

Практика з цього репозиторію: typed‑повідомлення винесені в окремі моделі в `src/shared/models/messages/`, щоб і content script, і background, і UI імпортували один і той самий контракт.

## 4. Chrome API та доступність у компонентах: практичні кейси

Офіційний каталог API: [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/api)

### 4.1 Швидка таблиця “де що працює”

| Що вам треба зробити                     | Найкращий контекст               | Чому                                   |
| ---------------------------------------- | -------------------------------- | -------------------------------------- |
| Прочитати/змінити DOM сторінки           | Content script                   | Має доступ до `document`/`window`      |
| Відкрити вкладку, керувати вкладками     | Service worker / extension pages | Tabs API недоступний у content scripts |
| Зберегти налаштування/стан               | Будь‑який контекст               | Storage API доступний всюди            |
| Запустити завантаження/керувати download | Service worker / extension pages | Потрібен дозвіл і правильний контекст  |

### 4.2 Типові use cases

**Кейс A: “content зібрав дані → background зберіг/відреагував”**

- content script читає DOM і надсилає `ContentPageInfo`;
- background нормалізує дані і пише в `chrome.storage.local`.

**Кейс B: “UI натиснув кнопку → background зробив дію”**

- popup/options надсилає `PopupOpenTab`;
- background робить `chrome.tabs.create(...)`.

## 5. Debug компонентів (плейбук)

Це те, що реально економить години.

### 5.1 Debug service worker (background, MV3)

1. Відкрийте `chrome://extensions`.
2. Увімкніть “Developer mode”.
3. На вашому розширенні знайдіть посилання “Service worker” → відкрийте DevTools.

Практичні поради:

- Логи зникають після “sleep” service worker — це нормально.
- Додавайте явний лог на старт події, щоб бачити, що саме пробудило worker.
- Памʼятайте про `chrome.runtime.lastError` при викликах API, які можуть фейлитись.

Офіційно: [Service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)

### 5.2 Debug content script

1. Відкрийте сторінку, де інʼєктується content script.
2. Відкрийте DevTools цієї сторінки.
3. Дивіться консоль і Sources → “Content scripts” (назви та шлях залежать від браузера/версії).

Офіційно: [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

### 5.3 Debug popup

- Натисніть на іконку розширення, відкрийте popup.
- Далі — інспектіть popup через DevTools (правий клік → Inspect, або через `chrome://extensions` → “Inspect views”).

### 5.4 Debug extension pages (options/власні вкладки)

Якщо ваша сторінка відкривається як окрема вкладка (наприклад `options.html` або кастомна `tab.html`) — дебажиться як звичайна сторінка.

### 5.5 Debug messaging (коли “повідомлення не приходить”)

Найчастіші причини:

- listener не зареєстрований (service worker “спить”, або код не виконався);
- message type не збігається (опечатка/розсинхрон);
- ви надсилаєте повідомлення “не туди” (`runtime.sendMessage` vs `tabs.sendMessage`);
- в content script немає інʼєкції на цій сторінці (не співпадає `matches`);
- ви відповідаєте асинхронно, але не повернули `true` з `onMessage`.

Офіційно: [Message passing](https://developer.chrome.com/docs/extensions/messaging)

## 6. MV3 + React + Tailwind: ізоляція стилів, бандли без hash‑імен

Це дві найчастіші “підводні міни” у реальних розширеннях:

- **імена бандлів** (manifest має посилатись на конкретні файли);
- **CSS‑ізоляція**, якщо ви інʼєктуєте UI в чужий сайт.

### 6.1 Бандли без hash‑імен (manifest має посилатись на точні файли)

У Chrome Extensions manifest посилається на конкретні імена файлів, тому **hashed filenames** зазвичай створюють зайвий біль. Практичний підхід — збирати `background.js`, `content.js`, `options.js`, тощо (без hash).

У цьому репозиторію це зроблено через `output.filename: '[name].js'`, і є кілька entrypoints (options/background/content/downloads) у `webpack/webpack.common.js`:

```js
entry: {
	options: './src/options/options.tsx',
	background: './src/background/background.ts',
	content: './src/content/content.ts',
	downloads: './src/downloads/downloads.tsx'
},
output: {
	filename: '[name].js'
}
```

Офіційний контекст: [Manifest file format](https://developer.chrome.com/docs/extensions/reference/manifest)

### 6.2 React UI в extension pages (popup/options/downloads)

Коли React‑UI живе в **extension pages**, CSS конфлікти з сайтом практично зникають, бо це інший документ (`chrome-extension://...`) і інші стилі.

### 6.3 Tailwind у content script: як не зламати сайт і не зламатися самому

Якщо ви рендерите UI поверх сайту (overlay, плаваюча панель, кастомний плеєр) — Tailwind “base/preflight” може:

- змінити `box-sizing`, `button`, `a`, `*` і зламати чужі стилі;
- або, навпаки, чужі стилі зламають ваш UI.

Практичний рецепт (який добре працює):

- **не інʼєктити `@tailwind base` у content script**;
- інʼєктити лише `@tailwind utilities` і **скоупити** їх на ваш root‑контейнер (за `id` або у shadow root).

Приклад через scss‑скоуп на `#...-root`:

```scss
#my-extension-root,
#my-extension-root * {
	box-sizing: border-box;
	@tailwind utilities;
}
```

Практика з цього репозиторію:

- для overlay в content script Tailwind utilities заскоуплені на root‑контейнер (див. `src/content/styles/batch-download.scss`, id `#band-play-batch-overlay-root`);
- для кастомного плеєра на feed‑сторінках utilities заскоуплені на `#band-play_player-container` (див. `src/content/page-services/bandcamp/feed-player/feed-player.scss`);
- для extension pages (options/downloads) можна безпечно використовувати `@tailwind base; @tailwind utilities;` (див. `src/options/options.scss` і `src/downloads/downloads.scss`), бо це окремий документ `chrome-extension://...`.

Офіційно про content scripts та ізоляцію контексту: [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

## 7. Публікація у Web Store (чекліст)

Перед сабмітом прогляньте це як чекліст — це економить час на ревʼю.

### 7.1 Дозволи

- Запитуйте лише необхідні `permissions` і `host_permissions`.
- Уникайте “широких” патернів, якщо розширення працює тільки на 1–2 доменах.
- Якщо можна — використовуйте `optional_permissions` або `activeTab`.

Офіційно: [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions), [Permission warnings](https://developer.chrome.com/docs/extensions/develop/concepts/permission-warnings)

### 7.2 Remote code та CSP

- Весь код має бути в пакеті розширення.
- Не завантажуйте віддалений JS “після інсталяції”.

Офіційно: [Content security policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)

### 7.3 Версія і збірка

- Підвищіть `version` у `manifest.json`.
- Зберіть production build і переконайтесь, що `manifest.json` посилається на існуючі файли у build‑папці.
- Якщо ви пакуєте реліз у zip, переконайтесь, що всередині архіву лежить саме build‑вміст (зазвичай `dist/`), а не сирці. У цьому репозиторію `npm run zip` викликає `zip.sh`.

## 8. Підсумки та бонус: “шаблон” для швидкого старту

Ось що варто запамʼятати з MV3:

- service worker подієвий і може “заснути” в будь‑який момент;
- DOM‑логіка живе в content scripts;
- “важкі” API (tabs/downloads/etc.) зазвичай зручніше тримати в background/extension pages;
- messaging — це ваш клей, і краще мати типовий message protocol;
- Tailwind у content script треба **ізолювати** (utility‑only + scope), інакше будуть конфлікти.

### Практичний старт на базі цього репозиторію

У репозиторію вже є готові entrypoints і збірка під розширення:

- `npm run watch` — development watch
- `npm run build` — production build
- `npm run zip` — упаковка білда

Після `build` завантажуйте результат як “Load unpacked” (папка `dist`) через `chrome://extensions`.

Посилання для уточнення деталей: [Get started](https://developer.chrome.com/docs/extensions/get-started)
