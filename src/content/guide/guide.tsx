import React, { useState } from 'react';
import './guide.scss';
import { createRoot } from 'react-dom/client';
import { MessageCode } from '../../shared/enums/message-code';
import { MessageService } from '../../shared/services/message-service';
import { Hotkey } from './components/hotkey';
import { PagesNote } from './components/pages-note';
import { Page } from './models/Page';

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
			<div className="flex-0 max-w-svw fixed left-1/2 top-1/2 z-[999] m-4 flex max-h-[90vh] -translate-x-1/2 -translate-y-1/2 scale-90 transform select-none flex-col overflow-auto rounded-xl bg-white/50 shadow-2xl shadow-gray-800">
				<div className="z-10 flex flex-col">
					{/* Header */}
					<div className="flex w-full flex-col items-center pb-1.5 pt-2.5 xl:pb-2.5 xl:pt-4">
						<img
							src={getSourceUrl('./assets/logo-128.png')}
							alt="Bandplay logo"
							className="z-20 h-16 w-16 rounded-full shadow-xl"
						/>
					</div>

					{/* Close Button */}
					<button
						className="absolute right-1.5 top-1.5 h-7 w-7 rounded-xl border-0 duration-200 hover:scale-110 hover:cursor-pointer"
						onClick={close}
					>
						<img
							src={getSourceUrl('./assets/close.png')}
							alt="close guide"
						/>
					</button>

					<div className="mx-6 mb-4">
						<PagesNote />
					</div>

					{/* Content */}
					<div className="text-md mx-6 mb-4 flex flex-row gap-x-4 gap-y-6 xl:mb-6 xl:flex-col">
						{/* Playlist control */}
						<div className="flex flex-col gap-y-4 rounded-xl bg-band-200/90 p-3 shadow-md shadow-gray-400 xl:gap-y-2">
							<span className="-mb-4 -mt-2 text-center text-lg font-medium tracking-wide text-gray-700">
								Playlist control
							</span>

							<Hotkey
								fileName="key-N.png"
								title="Next Track"
								description="Play the next track"
								pages={[
									Page.Collection,
									Page.Album,
									Page.Feed,
									Page.Discover,
								]}
							/>
							<Hotkey
								fileName="key-B.png"
								title="Previous Track"
								description="Play the previous track"
								pages={[
									Page.Collection,
									Page.Album,
									Page.Feed,
									Page.Discover,
								]}
							/>
						</div>

						{/* Playback control */}
						<div className="flex flex-col gap-y-4 rounded-xl bg-band-200/90 p-3 shadow-md shadow-gray-400 xl:gap-y-2">
							<span className="-mb-4 -mt-2 text-center text-lg font-medium tracking-wide text-gray-700">
								Track playback control
							</span>

							{/* Set Playback */}
							<Hotkey
								fileName="key-0.png"
								title="Start from Begin"
								description="Initiate playback of the current track from the beginning"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>
							<Hotkey
								fileName="key-9.png"
								title="Start from 90%"
								description="Begin playback from the 90% mark of the total track time. Use any digit key from 0 to 9 for different percentages"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>

							{/* Move Playback */}
							<Hotkey
								fileName="key-right.png"
								title="Fast Forward"
								description="Fast forward the track by the designated 'Playback step' seconds (click on the extension icon)"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>
							<Hotkey
								fileName="key-left.png"
								title="Rewind"
								description="Rewind the track by the specified 'Playback step' seconds (click on the extension icon)"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>

							{/* Playback Speed */}
							<Hotkey
								fileName="key-up.png"
								title="Increase Speed"
								description="Increase the speed of the playback rate"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>
							<Hotkey
								fileName="key-down.png"
								title="Decrease Speed"
								description="Decrease the speed of the playback rate"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>

							{/* Preserve Pitch */}
							<Hotkey
								fileName="key-P.png"
								title="Switch Pitch Preserving"
								description="Switch the pitch adjustmed of the audio to compensate for changes to the playback rate"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>
						</div>

						{/* Other */}
						<div className="mb-6 flex flex-col gap-y-4 rounded-xl bg-band-200/90 p-3 shadow-md shadow-gray-400 xl:gap-y-2">
							<span className="-mb-4 -mt-2 text-center text-lg font-medium tracking-wide text-gray-700">
								Utilities
							</span>

							<Hotkey
								fileName="key-O.png"
								title="Open in New Tab"
								description="Press 'O' to open the current track or album in a new browser tab for later listening"
								pages={[
									Page.Collection,
									Page.Album,
									Page.Feed,
									Page.Discover,
								]}
							/>
							<Hotkey
								fileName="key-L.png"
								title="Add/Remove from Wishlist"
								description="Add or remove an album from your wishlist, or a track if you are on an album pagee"
								pages={[
									Page.Collection,
									Page.Album,
									Page.Feed,
									Page.Discover,
								]}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
