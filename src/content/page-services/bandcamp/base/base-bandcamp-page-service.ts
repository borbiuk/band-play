import { exist, notExist } from '@shared/utils';

import { PlaybackPitchAction } from '../../../enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../../../enums/playback-speed-action';
import { BandcampTrackModel } from '../../../models/bandcamp-track-model';
import EventEmitter from '../../../services/event-emitter';
import visitedService from '../../../services/visited-service';
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
				audio.play().catch((e) => console.error(e));
			} else {
				audio.pause();
			}
		});
	}

	seekToPercentage(percentage: number): void {
		this.audioOperator<void>((audio: HTMLAudioElement) => {
			if (
				Number.isFinite(audio.duration) &&
				Number.isFinite(percentage)
			) {
				const newTime = (percentage / 100) * audio.duration;
				if (Number.isFinite(newTime)) {
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
		notFoundOperator?: () => TResult
	): TResult {
		let audio: HTMLAudioElement = document.querySelector('audio');
		if (notExist(audio?.src)) {
			audio = this.findAudioElement();

			if (notExist(audio?.src)) {
				this.audioEventEmitter.emit(null);
				return exist(notFoundOperator) ? notFoundOperator() : undefined;
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

	/**
	 * Progress of the playing track in percent. A service whose page does not expose a usable
	 * audio element overrides it.
	 */
	protected getPlaybackProgress(): number {
		return this.audioOperator<number>(
			(audio: HTMLAudioElement) =>
				(audio.currentTime / audio.duration) * 100
		);
	}

	/** Once the track is over: repeats it when loop is on, else plays the next one. */
	tryAutoplay(): void {
		if (!this.autoplayNeeded(this.getPlaybackProgress())) {
			return;
		}

		if (this.config.loopTrack) {
			this.seekToPercentage(0);
			return;
		}

		this.playNextTrack(true);
	}

	/**
	 * Clicks a play control and, when autoscroll is on, scrolls to it (or to another element).
	 *
	 * @param clickable - The control to click.
	 * @param revealTarget - The element to scroll to; the control itself by default.
	 */
	protected clickAndReveal(
		clickable: HTMLElement | null | undefined,
		revealTarget: Element | null | undefined = clickable
	): void {
		clickable?.click();
		if (this.config.autoscroll) {
			revealTarget?.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}
	}

	/**
	 * Adds an item to the wishlist or removes it, with the item's own Bandcamp buttons.
	 *
	 * @param buttonContainer - The `#collect-item_<id>` element of the item.
	 */
	protected toggleWishlist(buttonContainer: HTMLElement): void {
		const isWishlisted =
			buttonContainer.parentElement.parentElement.classList.contains(
				'wishlisted'
			);
		buttonContainer
			.querySelector<HTMLElement>(
				isWishlisted ? '.wishlisted-msg' : '.wishlist-msg'
			)
			?.click();
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
