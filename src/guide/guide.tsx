import React, { useEffect, useState } from 'react';
import './guide.scss';
import { ConfigService } from '../common/config-service';
import { Config } from '../contracts/config';
import { KeyboardKeyDescription } from './keyboard-key-description';

export const Guide = () => {
	const [isDisplayed, setIsDisplayed] = useState(false);

	const configService = new ConfigService();
	configService.addListener((config: Config) => {
		setIsDisplayed(config.showGuide)
	});

	useEffect(() => {
		configService.getAll().then(x => {
			setIsDisplayed(x.showGuide);
		});
	}, []);

	const getSourceUrl = (path: string) => chrome.runtime.getURL(path);

	const close = async (): Promise<void> => {
		await configService.update('showGuide', false);
	}

	return (
		<div className={isDisplayed ? '' : 'hidden'}>
			<div className="fixed top-1/2 left-1/2 z-[999] m-8 flex -translate-x-1/2 -translate-y-1/2 transform flex-col rounded-xl border-2 shadow-2xl shadow-gray-700 flex-0 bg-band-100 border-band-100">
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

				<button
					className="absolute top-1 right-1 h-6 w-6 rounded-xl border border-band-100 hover:scale-110 duration-200 hover:cursor-pointer"
					onClick={close}
				>
					<img
						src={getSourceUrl('./assets/close.png')}
						alt="close guide"
					/>
				</button>

				<div className="flex flex-col gap-y-6 overflow-y-auto text-md pt-6 pb-6 px-3">

					<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 pt-5 shadow-md shadow-gray-300 bg-band-200">

					<span className="absolute left-1 z-20 -mt-9 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
						Playlist control
					</span>

						<KeyboardKeyDescription
							fileName="key-N.png"
							title="Play next track"
							description="Play next track on feed, collection, wishlist and album page"
						/>
						<KeyboardKeyDescription
							fileName="key-M.png"
							title="Play next track with saving of playback"
							description="The same as 'N' hot key, but with saving of playback progress"
						/>
						<KeyboardKeyDescription
							fileName="key-B.png"
							title="Play next track"
							description="The same as 'N' hot key, but play previous track"
						/>
					</div>


					<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 pt-5 shadow-md shadow-gray-300 bg-band-200">

					<span className="absolute left-1 z-20 -mt-9 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
						Track playback control
					</span>

						<KeyboardKeyDescription
							fileName="key-0.png"
							title="Start playing current track from begin"
							description="Move current track playback to the begin"
						/>
						<KeyboardKeyDescription
							fileName="key-9.png"
							title="Start playing current track from 90% of time"
							description="Move current track playback to the 90% of all time, you can use all digits keys from 0 to 9"
						/>
						<KeyboardKeyDescription
							fileName="key-left.png"
							title="Rewind the track"
							description="Rewind the track on 'Playback step' seconds (click on extension icon)"
						/>
						<KeyboardKeyDescription
							fileName="key-right.png"
							title="Fast forward the track"
							description="Fast forward the track on 'Playback step' seconds (click on extension icon)"
						/>
					</div>

					<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-3 pt-5 shadow-md shadow-gray-300 bg-band-200">

					<span className="absolute left-1 z-20 -mt-9 rounded-xl text-base text-gray-500 backdrop-blur-sm p-0.5">
						Utils
					</span>

						<KeyboardKeyDescription
							fileName="key-O.png"
							title="Open track/album in new Tab"
							description="Press 'O' to open track or album in new browser Tab to listen it leter"
						/>
						<KeyboardKeyDescription
							fileName="key-L.png"
							title="Add or remove track/album from wishlist"
							description="Album will be added to your wishlist or track if you are on album page"
						/>
					</div>

				</div>
			</div>
		</div>
		
	);
};
