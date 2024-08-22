import { MessageCode } from '../../../shared/enums/message-code';
import { PlaybackPitchAction } from '../../../shared/enums/playback-pitch-action';
import { PlaybackSpeedAction } from '../../../shared/enums/playback-speed-action';
import { PageService } from '../../../shared/interfaces/page-service';
import { ConfigModel } from '../../../shared/models/config-model';
import { TrackModel } from '../../../shared/models/track-model';
import { MessageService } from '../../../shared/services/message-service';
import { exist, notExist } from '../../../shared/utils/utils.common';

export abstract class BasePageService implements PageService {
	config: ConfigModel;
	tracks: TrackModel[] = [];

	protected constructor(protected readonly messageService: MessageService) {}

	isServiceUrl(url: string): boolean {
		return false;
	}

	initTracks(): void {}

	tryAutoplay(): void {}

	open(): void {}

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

	setPlayback(percentage: number): void {
		this.audioOperator<void>((audio) => {
			audio.currentTime = (percentage / 100) * audio.duration;
		});
	}

	movePlayback(forward: boolean): void {
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
			this.setPlayback(percentage);
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

	protected getTrackIndex(trackId: string) {
		return this.tracks.findIndex(({ id }: TrackModel) => id === trackId);
	}

	protected createNewTab(url: string): void {
		if (notExist(url)) {
			return;
		}

		this.messageService
			.sendToBackground<string>({
				code: MessageCode.CreateNewTab,
				data: url,
			})
			.catch((error) => {
				console.error(error);
			});
	}

	protected audioOperator<TResult>(
		operator: (audio: HTMLAudioElement) => TResult,
		notFoundHandler?: () => TResult
	): TResult {
		const audio: HTMLAudioElement = document.querySelector('audio');
		if (notExist(audio?.src)) {
			return exist(notFoundHandler) ? notFoundHandler() : undefined;
		}

		return operator(audio);
	}
}
