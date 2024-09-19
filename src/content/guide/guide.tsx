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
			<div className="flex-0 max-w-svw fixed left-1/3 top-1/2 z-[999] m-4 flex max-h-[90vh] -translate-x-1/3 -translate-y-1/2 scale-90 transform select-none flex-col overflow-auto rounded-xl bg-white/50 shadow-2xl shadow-gray-800">
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
						className="absolute right-3 top-3 h-7 w-7 rounded-xl border-0 duration-200 hover:scale-110 hover:cursor-pointer"
						onClick={close}
					>
						<img
							src={getSourceUrl('./assets/close.svg')}
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
								icons={[
									{ icon: 'key-N.svg' },
									{ icon: 'key-B.svg' },
								]}
								title="Next / Previous Track"
								description="Play the next or previous track"
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
								icons={[
									{ icon: 'key-0.svg' },
									{ icon: 'key-9.svg' },
								]}
								title="Start from %"
								description="Initiate playback of the current track from (Number x 10)%"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>

							{/* Move Playback */}
							<Hotkey
								icons={[
									{ icon: 'key-left.svg' },
									{ icon: 'key-right.svg' },
								]}
								title="Rewind / Fast Forward"
								description="Rewind or Fast forward the track by the designated 'Playback step' seconds (click on the extension icon)"
								pages={[Page.Collection, Page.Album, Page.Feed]}
							/>

							{/* Preserve Pitch */}
							<div className="flex flex-row gap-x-4">
								<Hotkey
									icons={[
										{ icon: 'key-up.svg' },
										{ icon: 'key-down.svg' },
									]}
									title="Increase / Decrease Speed"
									description="Increase or Decrease the speed of the playback rate"
								/>

								<Hotkey
									icons={[
										{
											icon: 'key-Shift.svg',
											delimiter: '+',
										},
										{ icon: 'key-up.svg' },
										{ icon: 'key-down.svg' },
									]}
									title="Reset Track Speed"
									description="Reset the speed of the playback rate to default"
									pages={[
										Page.Collection,
										Page.Album,
										Page.Feed,
									]}
								/>
							</div>

							{/* Preserve Pitch */}
							<div className="flex flex-row gap-x-4">
								<Hotkey
									icons={[{ icon: 'key-P.svg' }]}
									title="Switch Pitch Preserving"
									description="Switch the pitch adjustmed of the audio to compensate for changes to the playback rate"
								/>

								<Hotkey
									icons={[
										{
											icon: 'key-Shift.svg',
											delimiter: '+',
										},
										{ icon: 'key-P.svg' },
									]}
									title="Reset Pitch Preserving"
									description="Turn off the pitch adjustmed"
									pages={[
										Page.Collection,
										Page.Album,
										Page.Feed,
									]}
								/>
							</div>
						</div>

						{/* Other */}
						<div className="mb-6 flex flex-col gap-y-4 rounded-xl bg-band-200/90 p-3 shadow-md shadow-gray-400 xl:gap-y-2">
							<span className="-mb-4 -mt-2 text-center text-lg font-medium tracking-wide text-gray-700">
								Utilities
							</span>

							<div className="flex flex-row gap-x-4">
								<Hotkey
									icons={[{ icon: 'key-O.svg' }]}
									title="Open in New Tab"
									description="Open the current track or album in a new browser tab for later listening"
								/>
								<Hotkey
									icons={[{ icon: 'key-L.svg' }]}
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
		</div>
	);
};
