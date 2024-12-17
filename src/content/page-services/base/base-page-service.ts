import { MessageCode } from '../../../shared/enums/message-code';
import { PlaybackPitchAction } from '../../../shared/enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../../../shared/enums/playback-speed-action';
import { PageService } from '../../../shared/interfaces/page-service';
import { ConfigModel } from '../../../shared/models/config-model';
import { NewTabMessage } from '../../../shared/models/messages/new-tab-message';
import { TrackModel } from '../../../shared/models/track-model';
import messageService from '../../../shared/services/message-service';
import { exist, notExist } from '../../../shared/utils/utils.common';

export abstract class BasePageService implements PageService {
	config: ConfigModel;
	tracks: TrackModel[] = [];

	protected constructor() {}

	isServiceUrl(url: string): boolean {
		return false;
	}

	initTracks(): void {}

	tryAutoplay(): void {}

	open(focus: boolean): void {}

	addToWishlist(): void {}

	playPause(): void {
		this.audioOperator<void>((audio) => {
			if (audio.paused) {
				audio.play();
			} else {
				audio.pause();
			}
		});
	}

	seekToPercentage(percentage: number): void {
		this.audioOperator<void>((audio) => {
			audio.currentTime = (percentage / 100) * audio.duration;
		});
	}

	seekForward(forward: boolean): void {
		this.audioOperator<void>((audio) => {
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
		this.audioOperator((audio) => {
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
		this.audioOperator((audio) => {
			audio.preservesPitch =
				code === PlaybackPitchAction.Switch
					? !audio.preservesPitch
					: false;
		});
	}

	playNextTrack(next: boolean): void {}

	playTrackByIndex(index: number): void {}

	audioOperator<TResult>(
		operator: (audio: HTMLAudioElement) => TResult,
		notFoundHandler?: () => TResult
	): TResult {
		const audio: HTMLAudioElement = document.querySelector('audio');
		if (notExist(audio?.src)) {
			return exist(notFoundHandler) ? notFoundHandler() : undefined;
		}

		return operator(audio);
	}

	protected autoplayNeeded(progress: number): boolean {
		return exist(progress) && progress >= 99.5;
	}

	protected getTrackIndex(trackId: string) {
		return this.tracks.findIndex(({ id }: TrackModel) => id === trackId);
	}

	protected createNewTab(url: string, active: boolean): void {
		if (notExist(url)) {
			return;
		}

		messageService
			.sendToBackground<NewTabMessage>({
				code: MessageCode.CreateNewTab,
				data: {
					url,
					active,
				},
			})
			.catch((error) => {
				console.error(error);
			});
	}
}
