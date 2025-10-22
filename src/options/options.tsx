import React from 'react';
import { createRoot } from 'react-dom/client';

import './options.scss';
import { Configuration } from './components/configuration';
import { Footer } from './components/footer';
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
		<div className="relative flex w-52 select-none flex-col justify-center gap-y-6 overflow-hidden bg-band-100/35 p-3 pb-4 align-middle">
			{/* Header */}
			<div className="mb-1 ml-2 flex w-full flex-row items-center gap-y-1.5 transition-all duration-300 ease-in-out hover:scale-102">
				<img
					src="./../assets/logo-128.png"
					alt="Bandplay logo"
					className="h-12 w-12 rounded-full shadow-xl shadow-gray-300"
				/>
				<span className="ml-2 text-2xl font-medium text-gray-800">
					BandPlay
				</span>
			</div>

			<Configuration />

			<ShortcutInput />

			<Footer />
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
