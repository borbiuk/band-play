import React from 'react';
import { createRoot } from 'react-dom/client';
import './../style.scss';
import { Configuration } from './configuration';
import { Footer } from './footer';

const Popup = () => {
	return (
		<div className="relative flex w-52 flex-col justify-center gap-y-6 overflow-hidden p-4 pb-6 align-middle bg-band-100">
			{/* Header */}
			<div className="flex w-full flex-col items-center gap-y-1">
				<img
					src="./../assets/logo-128.png"
					alt="Bandplay logo"
					className="h-20 w-20 rounded-full shadow-xl"
				/>
				<span className="z-10 -mt-1 text-2xl font-medium text-gray-900">
					BandPlay
				</span>
			</div>

			<Configuration />

			<Footer />
		</div>
	);
};

const root = createRoot(document.getElementById('root')!);

root.render(
	<React.StrictMode>
		<Popup />
	</React.StrictMode>
);
