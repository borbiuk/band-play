import configService from '@shared/services/config-service';
import { notExist } from '@shared/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

import './feed-player.scss';
import { FeedPageService } from '../feed-page-service';

// Global variable to store the React root
let globalPlayerRoot: Root = null;

export const renderPlayer = (feedPageService: FeedPageService) => {
	const playerContainerId = 'band-play_player-container';

	let container = document.getElementById(playerContainerId);
	if (!container) {
		container = document.createElement('div');
		container.id = playerContainerId;
		document.body.append(container);
	}

	// Create or reuse React root
	if (notExist(globalPlayerRoot)) {
		globalPlayerRoot = createRoot(container);
	}

	globalPlayerRoot.render(
		<React.StrictMode>
			<FeedPlayer feedPageService={feedPageService} />
		</React.StrictMode>
	);
};

export const FeedPlayer = ({
	feedPageService,
}: {
	feedPageService: FeedPageService;
}) => {
	const prevNextImageUrl = useMemo(
		() => chrome.runtime.getURL('./assets/nextprev.png'),
		[]
	);

	const [show, setShow] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(1);
	const [bufferEnd, setBufferEnd] = useState<number>(0);
	const [progressWidth, setProgressWidth] = useState<string>('0.00%');
	const [bufferWidth, setBufferWidth] = useState<string>('0.00%');
	const [isPreviousTrackAvailable, setIsPreviousTrackAvailable] =
		useState<boolean>(false);
	const [seeking, setSeeking] = useState(false);
	const [trackTitle, setTrackTitle] = useState<string>('');
	const [trackArtist, setTrackArtist] = useState<string>('');
	const [coverArtUrl, setCoverArtUrl] = useState<string>('');
	const [isPlaying, setIsPlaying] = useState<boolean>(false);

	useEffect(() => {
		setShow(feedPageService.config.showFeedPlayer);
		configService.addListener((newConfig) => {
			setShow(newConfig.showFeedPlayer);
		});
	}, []);

	useEffect(() => {
		feedPageService.audioEventEmitter.on((audio: HTMLAudioElement) => {
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

			audio.addEventListener('play', () => {
				setIsPlaying(true);
			});

			audio.addEventListener('pause', () => {
				setIsPlaying(false);
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
		const listener = ({
			title,
			artist,
			coverArtUrl,
		}: {
			title: string;
			artist: string;
			coverArtUrl: string;
		}) => {
			setTrackTitle(title ?? '');
			setTrackArtist(artist ?? '');
			setCoverArtUrl(coverArtUrl ?? '');
			setIsPreviousTrackAvailable(
				feedPageService.isPreviousTrackAvailable
			);
		};

		const current = feedPageService.getNowPlayingInfo?.();
		if (current) {
			setTrackTitle(current.title ?? '');
			setTrackArtist(current.artist ?? '');
			setCoverArtUrl(current.coverArtUrl ?? '');
			setIsPreviousTrackAvailable(
				feedPageService.isPreviousTrackAvailable
			);
		}

		feedPageService.nowPlayingEventEmitter?.on(listener);
		return () => {
			feedPageService.nowPlayingEventEmitter?.off(listener);
		};
	}, [feedPageService]);

	useEffect(() => {
		setProgressWidth(`${((currentTime / duration) * 100).toFixed(2)}%`);
	}, [currentTime, duration]);

	useEffect(() => {
		setBufferWidth(`${((bufferEnd / duration) * 100).toFixed(2)}%`);
	}, [bufferEnd, duration]);

	const formatTime = useCallback((time: number): string => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60)
			.toString()
			.padStart(2, '0');
		return `${minutes}:${seconds}`;
	}, []);

	const trackName = useMemo(
		() =>
			trackArtist ? `${trackTitle} — ${trackArtist}` : trackTitle || '',
		[trackArtist, trackTitle]
	);

	const handleSeek = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const progressBar = e.currentTarget;
			const rect = progressBar.getBoundingClientRect();

			// Calculate the click position as a percentage
			const clickPosition = e.clientX - rect.left;
			const percentage = (clickPosition / rect.width) * 100;

			// Call the FeedPageService method to seek to the clicked position
			feedPageService.seekToPercentage(percentage);
		},
		[feedPageService]
	);

	return (
		show && (
			<div className="fixed bottom-20 right-10 z-[999] flex h-[80px] w-[500px] select-none flex-row border border-gray-300 bg-white">
				{/* Cover Art */}
				<div
					className={`story flex items-center justify-center ${isPlaying ? 'playing' : 'paused'}`}
				>
					<div className="group relative ml-2 flex h-[60px] w-[60px] cursor-pointer items-center justify-center">
						{coverArtUrl ? (
							<>
								<img
									src={coverArtUrl}
									alt="Track cover art"
									className="h-full w-full object-cover"
									onClick={() => feedPageService.playPause()}
								/>
								{/* Play/Pause overlay */}
								<div
									className="cover-art-overlay"
									onClick={() => feedPageService.playPause()}
								>
									<div className="play-icon"></div>
								</div>
							</>
						) : (
							<div
								className="flex h-full w-full items-center justify-center bg-black bg-opacity-75"
								onClick={() => feedPageService.playPause()}
							>
								<div className="play-icon"></div>
							</div>
						)}
					</div>
				</div>

				{/* Player */}
				<div className="col col-8-15 progress-transportflex h-full w-full items-center pl-2 pr-4">
					<div className="flex h-full w-full flex-col justify-center">
						<div className="info flex w-full flex-row justify-between gap-x-2">
							{/* Track name */}
							<div className="title">
								<a onClick={() => feedPageService.playPause()}>
									<span>{trackName}</span>
								</a>
							</div>

							{/* Duration */}
							<div className="-mr-1.5 flex flex-row">
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
							<div className="transport mt-0.5 flex flex-row gap-x-[8px]">
								<img
									src={prevNextImageUrl}
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
									src={prevNextImageUrl}
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
