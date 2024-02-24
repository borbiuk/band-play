import React, { useState } from 'react';
import './guide.scss';
import { createRoot } from 'react-dom/client';
import { MessageCode } from '../../shared/enums/message-code';
import { MessageService } from '../../shared/services/message-service';
import { Hotkey } from './hotkey';

export const initGuide = () => {
	const guideContainerId = 'band-play_guide-container';
	const guideContainer = document.createElement('div');
	guideContainer.id = guideContainerId;
	document.body.append(guideContainer);

	const root = createRoot(document.getElementById(guideContainerId));
	root.render(
		<React.StrictMode>
			<Guide />
		</React.StrictMode>
	);
};

/**
 * Guide component representing the user guide for the Chrome extension.
 */
export const Guide = () => {
	const [isDisplayed, setIsDisplayed] = useState(false);

	// open guide when on pop-up button click.
	const messageService = new MessageService();
	messageService.addListener((message) => {
		if (message.code === MessageCode.ShowGuide) {
			setIsDisplayed(true);
		}
	});

	// close guide.
	const close = async (): Promise<void> => {
		setIsDisplayed(false);
	};

	const getSourceUrl = (path: string) => chrome.runtime.getURL(path);

	return (
		<div className={isDisplayed ? '' : 'hidden'}>
			<div className="fixed top-1/2 left-1/2 m-8 flex -translate-x-1/2 -translate-y-1/2 transform flex-col rounded-xl border-2 shadow-2xl shadow-gray-700 z-[999] flex-0 bg-band-100 border-band-100 max-h-svw max-w-svw">
				{/* Header */}
				<div className="flex w-full flex-col items-center gap-y-1 pt-3">
					<img
						src={getSourceUrl('./assets/logo-128.png')}
						alt="Bandplay logo"
						className="h-16 w-16 rounded-full shadow-xl"
					/>
					<span className="z-10 -mt-1 text-xl font-medium text-gray-900">
						BandPlay
					</span>
				</div>

				{/* Close Button */}
				<button
					className="absolute top-1 right-1 h-6 w-6 rounded-xl border duration-200 border-band-100 hover:scale-110 hover:cursor-pointer"
					onClick={close}
				>
					<img
						src={getSourceUrl('./assets/close.png')}
						alt="close guide"
					/>
				</button>

				{/* Content */}
				<div className="flex flex-row gap-x-2 gap-y-6 px-3 pt-4 pb-6 text-md lg:flex-col lg:pt-2">
					{/* Playlist control */}
					<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 shadow-md shadow-gray-300 duration-300 bg-band-200 hover:scale-101">
						<span className="absolute left-1 z-20 -mt-7 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
							Playlist control
						</span>

						<Hotkey
							fileName="key-N.png"
							title="Next Track"
							description="Play the next track on feed, collection, wishlist, and album pages"
						/>
						<Hotkey
							fileName="key-M.png"
							title="Next Track with Playback Save"
							description="Similar to 'N' hotkey, but with the added feature of saving playback progress"
						/>
						<Hotkey
							fileName="key-B.png"
							title="Previous Track"
							description="Play the previous track, akin to the 'N' hotkey"
						/>
					</div>

					{/* Playback control */}
					<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 shadow-md shadow-gray-300 duration-300 bg-band-200 hover:scale-101">
						<span className="absolute left-1 z-20 -mt-7 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
							Track playback control
						</span>

						<Hotkey
							fileName="key-0.png"
							title="Start from Begin"
							description="Initiate playback of the current track from the beginning"
						/>
						<Hotkey
							fileName="key-9.png"
							title="Start from 90%"
							description="Begin playback from the 90% mark of the total track time. Use any digit key from 0 to 9 for different percentages"
						/>
						<Hotkey
							fileName="key-left.png"
							title="Rewind"
							description="Rewind the track by the specified 'Playback step' seconds (click on the extension icon)"
						/>
						<Hotkey
							fileName="key-right.png"
							title="Fast Forward"
							description="Fast forward the track by the designated 'Playback step' seconds (click on the extension icon)"
						/>
					</div>

					{/* Other */}
					<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 shadow-md shadow-gray-300 duration-300 bg-band-200 hover:scale-101">
						<span className="absolute left-1 z-20 -mt-7 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
							Utilities
						</span>

						<Hotkey
							fileName="key-O.png"
							title="Open in New Tab"
							description="Press 'O' to open the current track or album in a new browser tab for later listening"
						/>
						<Hotkey
							fileName="key-L.png"
							title="Add/Remove from Wishlist"
							description="Add or remove an album from your wishlist, or a track if you are on an album pagee"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
