import configService from '@shared/services/config-service';
import { exist, notExist } from '@shared/utils';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
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
	// The audio listeners are added once; they read the current value from the ref
	const seekingRef = useRef(false);
	seekingRef.current = seeking;
	const [trackTitle, setTrackTitle] = useState<string>('');
	const [trackArtist, setTrackArtist] = useState<string>('');
	const [coverArtUrl, setCoverArtUrl] = useState<string>('');
	const [isPlaying, setIsPlaying] = useState<boolean>(false);

	// The player shows only when the setting is on and a track was loaded
	const showSettingRef = useRef(
		feedPageService.config?.showFeedPlayer !== false
	);
	const hasTrackRef = useRef(false);

	useEffect(() => {
		// The player can render before the page service has loaded the config
		configService
			.getAll()
			.then((config) => {
				showSettingRef.current = config.showFeedPlayer;
				setShow(showSettingRef.current && hasTrackRef.current);
			})
			.catch((e) => console.error(e));

		return configService.addListener((newConfig) => {
			showSettingRef.current = newConfig.showFeedPlayer;
			setShow(showSettingRef.current && hasTrackRef.current);
		});
	}, []);

	useEffect(() => {
		const onAudio = (audio: HTMLAudioElement) => {
			if (notExist(audio)) {
				hasTrackRef.current = false;
				setShow(false);
				return;
			}

			// Only this listener: the visited history keeps its own one
			feedPageService.audioEventEmitter.off(onAudio);

			audio.addEventListener('timeupdate', () => {
				if (!seekingRef.current) {
					setCurrentTime(audio.currentTime);
				}
			});

			audio.addEventListener('loadedmetadata', () => {
				setDuration(audio.duration);
				hasTrackRef.current = true;
				setShow(showSettingRef.current);
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
		};
		feedPageService.audioEventEmitter.on(onAudio);
		return () => feedPageService.audioEventEmitter.off(onAudio);
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

	// Space and the arrow keys are the extension's shortcuts: only Enter is handled here
	const onEnter =
		(action: () => void) =>
		(e: React.KeyboardEvent): void => {
			if (e.key !== 'Enter') {
				return;
			}

			e.preventDefault();
			action();
		};

	return (
		show &&
		exist(trackTitle) && (
			<div className="fixed bottom-20 right-10 z-[999] flex h-[80px] w-[500px] select-none flex-row border border-gray-300 bg-white">
				{/* Cover Art */}
				<div
					className={`story flex items-center justify-center ${isPlaying ? 'playing' : 'paused'}`}
				>
					<div
						className="group relative ml-2 flex h-[60px] w-[60px] cursor-pointer items-center justify-center"
						role="button"
						tabIndex={0}
						aria-label={isPlaying ? 'Pause' : 'Play'}
						onKeyDown={onEnter(() => feedPageService.playPause())}
					>
						{coverArtUrl ? (
							<>
								<img
									src={coverArtUrl}
									alt=""
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
								role="slider"
								tabIndex={0}
								aria-label="Seek"
								aria-valuemin={0}
								aria-valuemax={Math.round(duration || 0)}
								aria-valuenow={Math.round(currentTime || 0)}
								aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
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
									alt="Previous track"
									role="button"
									tabIndex={isPreviousTrackAvailable ? 0 : -1}
									aria-disabled={!isPreviousTrackAvailable}
									onKeyDown={onEnter(() => {
										if (isPreviousTrackAvailable) {
											feedPageService.playNextTrack(
												false
											);
										}
									})}
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
									alt="Next track"
									role="button"
									tabIndex={0}
									onKeyDown={onEnter(() =>
										feedPageService.playNextTrack(true)
									)}
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
