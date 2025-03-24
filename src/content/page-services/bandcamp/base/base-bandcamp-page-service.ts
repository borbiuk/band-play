import { PlaybackPitchAction } from '@shared/enums';
import { PlaybackSpeedAction } from '@shared/enums';
import { BandcampTrackModel } from '@shared/models';
import { exist, notExist } from '@shared/utils';
import { BasePageService } from '../../base/base-page-service';

export class BaseBandcampPageService extends BasePageService<BandcampTrackModel> {
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

	audioOperator<TResult>(
		operator: (audio: HTMLAudioElement) => TResult,
		notFoundHandler?: () => TResult
	): TResult {
		let audio: HTMLAudioElement = document.querySelector('audio');
		if (notExist(audio?.src)) {
			audio = this.findAudioElement();

			if (notExist(audio?.src)) {
				return exist(notFoundHandler) ? notFoundHandler() : undefined;
			}
		}

		return operator(audio);
	}

	private findAudioElement(root: any = document) {
		let audio = root.querySelector('audio');
		if (audio) return audio;

		// Recursively check shadow roots
		const elements = root.querySelectorAll('*');
		for (const el of elements) {
			if (el.shadowRoot) {
				audio = this.findAudioElement(el.shadowRoot);
				if (audio) return audio;
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
