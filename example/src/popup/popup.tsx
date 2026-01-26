import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './popup.scss';
import Button from '@shared/components/button';
import { MessageType, type PageInfo } from '@shared/messages';

const PopupApp = () => {
	const [lastPage, setLastPage] = useState<PageInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		chrome.runtime.sendMessage(
			{ type: MessageType.PopupGetLastPage },
			(response) => {
				if (response?.lastPage) {
					setLastPage(response.lastPage);
				}

				setIsLoading(false);
			}
		);
	}, []);

	useEffect(() => {
		const port = chrome.runtime.connect({ name: 'popup-connection' });

		port.onMessage.addListener((message) => {
			if (message.type !== MessageType.BackgroundPortPong) {
				return;
			}

			setIsConnected(true);
		});

		port.postMessage({ type: MessageType.PopupPortPing });

		return () => {
			port.disconnect();
		};
	}, []);

	const handleHighlight = () => {
		chrome.runtime.sendMessage({ type: MessageType.PopupHighlight });
	};

	const handleOpenTab = () => {
		chrome.runtime.sendMessage({ type: MessageType.PopupOpenTab });
	};

	return (
		<div className="ext-flex ext-w-80 ext-flex-col ext-gap-4 ext-bg-white ext-p-4">
			<div>
				<div className="ext-text-sm ext-font-semibold ext-text-slate-900">
					Extension popup
				</div>
				<div className="ext-mt-1 ext-text-xs ext-text-slate-600">
					This popup talks to background and content.
				</div>
			</div>

			<div className="ext-rounded-md ext-border ext-border-slate-200 ext-bg-slate-50 ext-p-3">
				<div className="ext-text-xs ext-uppercase ext-tracking-wide ext-text-slate-500">
					Last visited page
				</div>
				{isLoading ? (
					<div className="ext-mt-2 ext-text-sm ext-text-slate-600">
						Loading...
					</div>
				) : (
					<div className="ext-mt-2 ext-text-sm ext-text-slate-800">
						{lastPage ? lastPage.title : 'No data yet.'}
					</div>
				)}
				<div className="ext-mt-2 ext-text-xs ext-text-slate-500">
					Connection: {isConnected ? 'live' : 'pending'}
				</div>
			</div>

			<div className="ext-flex ext-gap-2">
				<Button label="Highlight headings" onClick={handleHighlight} />
				<Button label="Open extension page" onClick={handleOpenTab} />
			</div>
		</div>
	);
};

const rootElement = document.getElementById('root');

if (rootElement) {
	createRoot(rootElement).render(<PopupApp />);
}
