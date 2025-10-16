import React from 'react';
import { createRoot } from 'react-dom/client';

import './options.scss';
import { Configuration } from './components/configuration';
import { Footer } from './components/footer';
import { ShortcutInput } from './components/shortcut-input';

/**
 * Options component representing the user interface of the Chrome extension Options.
 */
const Options = () => {
	return (
		<div className="relative flex w-52 select-none flex-col justify-center gap-y-6 overflow-hidden bg-band-100/35 p-3 pb-4 align-middle">
			{/* Header */}
			<div className="flex w-full flex-col items-center gap-y-1">
				<img
					src="./../assets/logo-128.png"
					alt="Bandplay logo"
					className="h-16 w-16 rounded-full shadow-xl"
				/>
				<span className="-mt-1 text-xl font-medium text-gray-900">
					BandPlay
				</span>
			</div>

			<Configuration />

			<ShortcutInput />

			<Footer />
		</div>
	);
};

const root = createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
		<Options />
	</React.StrictMode>
);
