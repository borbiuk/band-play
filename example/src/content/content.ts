import { MessageType, type ExtensionMessage } from '@shared/messages';

import './content.scss';

const rootId = 'ext-example-root';

const createPanel = () => {
	const root = document.createElement('div');
	root.id = rootId;
	root.className =
		'ext-fixed ext-bottom-4 ext-right-4 ext-z-[2147483647] ext-w-64 ext-rounded-lg ext-border ext-border-slate-200 ext-bg-white ext-p-3 ext-shadow-lg';

	const title = document.createElement('div');
	title.className = 'ext-text-sm ext-font-semibold ext-text-slate-900';
	title.textContent = 'Content script is active';

	const subtitle = document.createElement('div');
	subtitle.className = 'ext-mt-1 ext-text-xs ext-text-slate-600';
	subtitle.textContent = 'Ready to receive messages from background.';

	root.append(title, subtitle);

	return { root, subtitle };
};

const highlightHeadings = (color: string, subtitle: HTMLDivElement) => {
	const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(
		0,
		3
	);

	if (headings.length === 0) {
		subtitle.textContent = 'No headings found to highlight.';
		return;
	}

	headings.forEach((heading) => {
		heading.style.outline = `2px solid ${color}`;
		heading.style.outlineOffset = '2px';
	});

	subtitle.textContent = `Highlighted headings: ${headings.length}.`;
};

const initContentScript = () => {
	if (document.getElementById(rootId)) {
		return;
	}

	const { root, subtitle } = createPanel();
	document.body.append(root);

	chrome.runtime.sendMessage({
		type: MessageType.ContentPageInfo,
		payload: {
			title: document.title,
			url: window.location.href,
			capturedAt: Date.now(),
		},
	});

	chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
		if (message.type !== MessageType.ContentHighlight) {
			return;
		}

		highlightHeadings(message.payload.color, subtitle);
	});
};

initContentScript();
