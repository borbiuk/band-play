import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './tab.scss';
import Button from '@shared/components/button';
import { MessageType, type PageInfo } from '@shared/messages';

const TabApp = () => {
	const [lastPage, setLastPage] = useState<PageInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadLastPage = useCallback(() => {
		setIsLoading(true);
		chrome.runtime.sendMessage(
			{ type: MessageType.TabGetLastPage },
			(response) => {
				setLastPage(response?.lastPage || null);
				setIsLoading(false);
			}
		);
	}, []);

	useEffect(() => {
		loadLastPage();
	}, [loadLastPage]);

	const manifest = chrome.runtime.getManifest();

	return (
		<div className="ext-min-h-screen ext-bg-slate-50 ext-p-8">
			<div className="ext-mx-auto ext-flex ext-max-w-2xl ext-flex-col ext-gap-6 ext-rounded-xl ext-bg-white ext-p-6 ext-shadow">
				<div>
					<div className="ext-text-lg ext-font-semibold ext-text-slate-900">
						Extension page
					</div>
					<div className="ext-mt-1 ext-text-sm ext-text-slate-600">
						This is a standalone extension page. Version:{' '}
						{manifest.version}
					</div>
				</div>

				<div className="ext-rounded-md ext-border ext-border-slate-200 ext-bg-slate-50 ext-p-4">
					<div className="ext-text-xs ext-uppercase ext-tracking-wide ext-text-slate-500">
						Last page from content script
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
				</div>

				<Button label="Refresh data" onClick={loadLastPage} />
			</div>
		</div>
	);
};

const rootElement = document.getElementById('root');

if (rootElement) {
	createRoot(rootElement).render(<TabApp />);
}
