import { PlaybackPitchAction, PlaybackSpeedAction } from '@shared/enums';
import { BandcampTrackModel } from '@shared/models';
import EventEmitter from '@shared/services/event-emitter';
import visitedService from '@shared/services/visited-service';
import { exist, notExist } from '@shared/utils';

import { BasePageService } from '../../base/base-page-service';

/**
 * Base class for all Bandcamp page services.
 *
 * This class provides common functionality for Bandcamp-specific page services including:
 * - Audio element management and event handling
 * - Playback control operations (play/pause, seek, speed, pitch)
 * - Track navigation and playlist management
 * - Common Bandcamp-specific utilities
 *
 * All Bandcamp page services should extend this class to inherit shared functionality.
 */
export class BaseBandcampPageService extends BasePageService<BandcampTrackModel> {
	/** Event emitter for audio element events */
	public audioEventEmitter: EventEmitter<HTMLAudioElement> =
		new EventEmitter();
	/** Guard to ensure visited audio binding is attached once per service instance */
	private visitedBindingInitialized: boolean = false;

	protected constructor() {
		super();
		this.bindVisitedAudioOnce();
	}

	/**
	 * Highlight or unhighlight tracks depending on config.highlightVisited.
	 * Should be called by concrete services at the end of initTracks().
	 */
	protected async updateVisitedHighlighting(): Promise<void> {
		if (notExist(this.tracks) || this.tracks.length === 0) {
			return;
		}
		if (this.config?.highlightVisited) {
			await visitedService
				.highlightBandcampTracks(this.tracks)
				.catch(() => void 0);
			return;
		}
		visitedService.unhighlightBandcampTracks(this.tracks);
	}

	playPause(): void {
		this.audioOperator<void>((audio: HTMLAudioElement) => {
			if (audio.paused) {
				audio.play();
			} else {
				audio.pause();
			}
		});
	}

	seekToPercentage(percentage: number): void {
		this.audioOperator<void>((audio: HTMLAudioElement) => {
			if (isFinite(audio.duration) && isFinite(percentage)) {
				const newTime = (percentage / 100) * audio.duration;
				if (isFinite(newTime)) {
					audio.currentTime = newTime;
				}
			}
		});
	}

	seekForward(forward: boolean): void {
		this.audioOperator<void>((audio: HTMLAudioElement) => {
			let nextPositionInSeconds =
				audio.currentTime +
				(forward
					? this.config.playbackStep
					: -this.config.playbackStep);
			if (nextPositionInSeconds < 0) {
				nextPositionInSeconds = 0;
			} else if (nextPositionInSeconds > audio.duration) {
				nextPositionInSeconds = audio.duration;
			}

			const percentage = (nextPositionInSeconds / audio.duration) * 100;
			this.seekToPercentage(percentage);
		});
	}

	speedPlayback(code: PlaybackSpeedAction): void {
		this.audioOperator((audio: HTMLAudioElement) => {
			if (code === PlaybackSpeedAction.Reset) {
				audio.playbackRate = 1;
			} else if (code === PlaybackSpeedAction.Increase) {
				audio.playbackRate += 0.01;
			} else if (code === PlaybackSpeedAction.Decrease) {
				audio.playbackRate -= 0.01;
			}
		});
	}

	switchPreservesPitch(code: PlaybackPitchAction): void {
		this.audioOperator((audio: HTMLAudioElement) => {
			audio.preservesPitch =
				code === PlaybackPitchAction.Switch
					? !audio.preservesPitch
					: false;
		});
	}

	private bindVisitedAudioOnce(): void {
		if (this.visitedBindingInitialized) {
			return;
		}
		this.visitedBindingInitialized = true;
		visitedService.bindBandcampAudio(() => this.audioEventEmitter);
	}

	audioOperator<TResult>(
		operator: (audio: HTMLAudioElement) => TResult,
		notFoundHandler?: () => TResult
	): TResult {
		let audio: HTMLAudioElement = document.querySelector('audio');
		if (notExist(audio?.src)) {
			audio = this.findAudioElement();

			if (notExist(audio?.src)) {
				this.audioEventEmitter.emit(null);
				return exist(notFoundHandler) ? notFoundHandler() : undefined;
			}
		}

		this.audioEventEmitter.emit(audio);
		return operator(audio);
	}

	private findAudioElement(root: any = document) {
		let audio = root.querySelector('audio');
		if (exist(audio)) {
			return audio;
		}

		// Recursively check shadow roots
		const elements = root.querySelectorAll('*');
		for (const el of elements) {
			if (el.shadowRoot) {
				audio = this.findAudioElement(el.shadowRoot);
				if (exist(audio)) {
					return audio;
				}
			}
		}
		return null;
	}

	protected autoplayNeeded(progress: number): boolean {
		return exist(progress) && progress >= 99.5;
	}

	protected getTrackIndex(trackId: string) {
		return this.tracks.findIndex(
			({ id }: BandcampTrackModel) => id === trackId
		);
	}
}
