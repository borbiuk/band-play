import { MessageCode } from '../../../shared/enums/message-code';
import { PageService } from '../../../shared/interfaces/page-service';
import { ConfigModel } from '../../../shared/models/config-model';
import { TrackModel } from '../../../shared/models/track-model';
import { MessageService } from '../../../shared/services/message-service';
import { notExist } from '../../../shared/utils/utils.common';

export abstract class BasePageService implements PageService {
	config: ConfigModel;
	tracks: TrackModel[] = [];

	protected constructor(protected readonly messageService: MessageService) {}

	isServiceUrl(url: string): boolean {
		return false;
	}

	playPause(): void {
		this.audioOperator<void>((audio) => {
			if (audio.paused) {
				audio.play();
			} else {
				audio.pause();
			}
		});
	}

	playNextTrack(next: boolean): void {}

	initTracks(): void {}

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

	playTrackByIndex(index: number): void {}

	setPlayback(percentage: number): void {
		this.audioOperator<void>((audio) => {
			audio.currentTime = (percentage / 100) * audio.duration;
		});
	}

	tryAutoplay(): void {}

	open(): void {}

	addToWishlist(): void {}

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
		operator: (_: HTMLAudioElement) => TResult
	): TResult {
		const audio: HTMLAudioElement = document.querySelector('audio');
		if (notExist(audio)) {
			return undefined;
		}

		return operator(audio);
	}
}
