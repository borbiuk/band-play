import { notExist } from '@shared/utils';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './feed-player.scss';
import { FeedPageService } from '../feed-page-service';

export const switchPlayer = (
	show: boolean,
	feedPageService: FeedPageService
) => {
	const guideContainerId = 'band-play_player-container';

	if (show) {
		const guideContainer = document.createElement('div');
		guideContainer.id = guideContainerId;
		document.body.append(guideContainer);

		const root = createRoot(document.getElementById(guideContainerId));
		root.render(
			<React.StrictMode>
				<FeedPlayer feedPageService={feedPageService} />
			</React.StrictMode>
		);
	} else {
		const guideContainer = document.getElementById(guideContainerId);
		if (guideContainer) {
			guideContainer.remove();
		}
	}
};

export const FeedPlayer = ({
	feedPageService,
}: {
	feedPageService: FeedPageService;
}) => {
	const prevNextImageUrl = () =>
		chrome.runtime.getURL('./assets/nextprev.png');

	const [show, setShow] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(1);
	const [bufferEnd, setBufferEnd] = useState<number>(0);
	const [progressWidth, setProgressWidth] = useState<string>('0.00%');
	const [bufferWidth, setBufferWidth] = useState<string>('0.00%');
	const [isPreviousTrackAvailable, setIsPreviousTrackAvailable] =
		useState<boolean>(false);
	const [seeking, setSeeking] = useState(false);

	useEffect(() => {
		feedPageService.audioEventEmitter.on((audio) => {
			if (notExist(audio)) {
				setShow(false);
				return;
			}

			feedPageService.audioEventEmitter.removeAllListeners();

			audio.addEventListener('timeupdate', () => {
				if (!seeking) {
					setCurrentTime(audio.currentTime);
				}
			});

			audio.addEventListener('loadedmetadata', (e) => {
				setDuration(audio.duration);
				setShow(true);
			});

			audio.addEventListener('progress', () => {
				try {
					const bufferedEnd = audio.buffered.end(
						audio.buffered.length - 1
					);
					setBufferEnd(bufferedEnd);
				} catch {
					setBufferEnd(0);
				}
			});

			setIsPreviousTrackAvailable(
				feedPageService.isPreviousTrackAvailable
			);
		});
	}, []);

	useEffect(() => {
		setProgressWidth(`${((currentTime / duration) * 100).toFixed(2)}%`);
	}, [currentTime, duration]);

	useEffect(() => {
		setBufferWidth(`${((bufferEnd / duration) * 100).toFixed(2)}%`);
	}, [bufferEnd, duration]);

	const formatTime = (time: number): string => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60)
			.toString()
			.padStart(2, '0');
		return `${minutes}:${seconds}`;
	};

	const trackName = 'Out of Sorts - Reverse Groove (Manami Remix)';

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		const progressBar = e.currentTarget;
		const rect = progressBar.getBoundingClientRect();

		// Calculate the click position as a percentage
		const clickPosition = e.clientX - rect.left;
		const percentage = (clickPosition / rect.width) * 100;

		// Call the FeedPageService method to seek to the clicked position
		feedPageService.seekToPercentage(percentage);
	};

	return (
		show && (
			<div className="fixed bottom-20 right-10 z-[999] flex h-[64px] w-[500px] select-none flex-row rounded-sm bg-white">
				{/* Play/Pause button */}
				<div className="paused playing story">
					<div className="play-button bottom-[8px] left-[8px]">
						<div className="play-icon"></div>
					</div>
				</div>

				{/* Player */}
				<div className="col col-7-15 progress-transport ml-[64px] flex h-[50px] w-full pl-2 pr-4">
					<div className="info-progress w-full">
						<div className="info flex w-full flex-row justify-between gap-x-2 pt-[16px]">
							{/* Track name */}
							<div className="title">
								<a onClick={() => feedPageService.playPause()}>
									<span>{trackName}</span>
								</a>
							</div>

							{/* Duration */}
							<div className="pos-dur">
								<span>{formatTime(currentTime)}</span> /{' '}
								<span>{formatTime(duration)}</span>
							</div>
						</div>

						<div className="mt-[8px] flex w-full flex-row justify-between gap-x-2">
							{/* Playback */}
							<div
								className="progress-bar relative"
								onClick={handleSeek}
								onMouseDown={() => setSeeking(true)}
								onMouseUp={() => setSeeking(false)}
							>
								<div
									className="progress absolute"
									style={{
										width: progressWidth,
										visibility: seeking
											? 'hidden'
											: 'visible',
									}}
								></div>
								<div
									className="buffer absolute"
									style={{ width: bufferWidth }}
								></div>
							</div>

							{/* Previous/Next track buttons */}
							<div className="transport flex flex-row gap-x-[8px]">
								<img
									src={prevNextImageUrl()}
									alt="Play previous track"
									className={`-mr-[20px] h-[12px] w-[40px] ${isPreviousTrackAvailable ? 'hover:cursor-pointer' : ''}`}
									style={{
										clipPath: 'inset(0 50% 0 0)',
										filter: isPreviousTrackAvailable
											? 'none'
											: 'grayscale(100%)',
										opacity: isPreviousTrackAvailable
											? 1
											: 0.5,
									}}
									onClick={() => {
										if (isPreviousTrackAvailable) {
											feedPageService.playNextTrack(
												false
											);
										}
									}}
								></img>
								<img
									src={prevNextImageUrl()}
									alt="Play next track"
									className="-ml-[20px] h-[12px] w-[40px] hover:cursor-pointer"
									style={{
										clipPath: 'inset(0 0 0 50%)',
									}}
									onClick={() =>
										feedPageService.playNextTrack(true)
									}
								></img>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	);
};
