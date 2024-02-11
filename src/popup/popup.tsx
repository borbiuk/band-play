import React from 'react';
import { createRoot } from 'react-dom/client';
import './../style.scss';
import { Configuration } from './configuration';
import { Footer } from './footer';

const Popup = () => {

	return (
		<div
			className="relative p-4 pb-6 w-52 flex justify-center align-middle flex-col gap-y-6 overflow-hidden"
		>
			{/* Header */}
			<div className="flex flex-col gap-y-1 items-center w-full">
				{/* Logo */}
				<img src="./../assets/logo-128.png" alt="Bandplay logo" className="h-20 w-20"/>
				<span className="text-xl text-gray-900 font-medium -mt-1">BandPlay</span>
			</div>

			<Configuration/>

			<Footer/>
		</div>
	);
};

const root = createRoot(document.getElementById('root')!);

root.render(
	<React.StrictMode>
		<Popup/>
	</React.StrictMode>
);
