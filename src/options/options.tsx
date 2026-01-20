import { ExternalLinksPopup } from '@shared/components/external-links';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './options.scss';
import { BatchDownload } from './components/batch-download';
import { Configuration } from './components/configuration';
import { PlaybackStep } from './components/playback-step';
import { ShortcutInput } from './components/shortcut-input';

/**
 * Main Options component representing the user interface of the Chrome extension popup.
 *
 * This component renders the extension's popup UI with:
 * - Header with logo and title
 * - Configuration panel for user settings
 * - Shortcut input for keyboard shortcuts
 * - Footer with links and information
 *
 * @returns JSX element containing the complete options interface
 */
const Options = () => {
	return (
		<div className="relative inline-flex select-none flex-col gap-6 overflow-hidden bg-band-100/35 p-3 pb-4 align-middle">
			<div className="flex flex-row items-center justify-between">
				<div className="ml-2 flex w-46 flex-row items-center gap-1.5 transition-all duration-300 ease-in-out hover:scale-102">
					<img
						src="./../assets/logo-128.png"
						alt="Bandplay logo"
						className="h-12 w-12 rounded-full shadow-xl shadow-gray-300"
					/>
					<span className="ml-2 text-2xl font-medium text-gray-800">
						BandPlay
					</span>
				</div>

				<div className="w-46">
					<ExternalLinksPopup />
				</div>
			</div>

			<div className="flex flex-row gap-4">
				<div className="w-46">
					<Configuration />
				</div>

				<div className="flex w-46 flex-col justify-between">
					<BatchDownload />
					<PlaybackStep />
				</div>

				<div className="flex w-46 flex-col justify-between">
					<ShortcutInput />
					<span className="-mb-3 -mr-1 text-end text-[10px] text-gray-500">
						by borbiuk
					</span>
				</div>
			</div>
		</div>
	);
};

/** Root element for React rendering */
const root = createRoot(document.getElementById('root'));

/** Render the Options component in React StrictMode */
root.render(
	<React.StrictMode>
		<Options />
	</React.StrictMode>
);
