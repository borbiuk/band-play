import { exist, notExist } from '../common/utils';
import { Config } from '../contracts/config';
import { Service, Track } from '../contracts/service';

export class Discover implements Service {
	config: Config;
	tracks: Track[] = [];

	checkUrl(url: string): boolean {
		return url.includes('/discover');
	}

	initTracks(): void {
		const list = document.querySelectorAll('.swipe-carousel');
		if (notExist(list) || list.length === this.tracks.length) {
			return;
		}

		this.tracks = Array.from(list).map((x) => ({
			id: x.id,
			element: x,
		}));
	}

	tryAutoplay() {
		const progress = this.getPlayingTrackProgress();
		if (exist(progress) && progress >= 99.5) {
			this.playNextTrack(true);
		}
	}

	play(index: number) {
		if (index >= 0 && index < this.tracks.length) {
			this.tracks[index].element
				.querySelector<HTMLElement>('div button[aria-label="Play"]')
				.click();
		}
	}

	playNextTrack(next: boolean) {
		const current = document.querySelector(
			'.swipe-carousel div button[aria-label="Pause"]'
		).parentElement.parentElement.id;
		if (notExist(current)) {
			return;
		}

		const nowPlayingIndex = this.tracks.findIndex((x) => x.id === current);
		if (nowPlayingIndex === -1 || nowPlayingIndex >= this.tracks.length) {
			return;
		}

		if (nowPlayingIndex === 0 && !next) {
			return;
		}

		const nextTrackPlayButton = this.tracks[
			nowPlayingIndex + (next ? 1 : -1)
		].element.querySelector<HTMLElement>('div button[aria-label="Play"]');
		nextTrackPlayButton.click();

		if (this.config.autoscroll) {
			nextTrackPlayButton.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}
	}

	playNextTrackWithPercentage() {}

	playPause() {
		let button = document.querySelector('.play-circle-outline-icon');
		if (notExist(button)) {
			button = document.querySelector('.pause-circle-outline-icon');
		}
		button?.parentElement?.click();
	}

	playPercentage(_: number): void {}

	move(_: boolean): void {}

	open(): void {
		const itemUrl =
			document.querySelector<HTMLAnchorElement>('.go-to-album')?.href;
		if (exist(itemUrl)) {
			chrome.runtime.sendMessage({ id: 'CREATE_TAB', url: itemUrl });
		}
	}

	private getPlayingTrackProgress() {
		// Retrieve the time strings
		const positionStr = document.querySelector(
			'.playback-time.current'
		)?.textContent;
		const durationStr = document.querySelector(
			'.playback-time.total'
		)?.textContent;

		// Convert time strings to seconds
		const positionInSeconds = this.convertTimeToSeconds(positionStr);
		const durationInSeconds = this.convertTimeToSeconds(durationStr);

		return (positionInSeconds / durationInSeconds) * 100;
	}

	// Convert time string (00:00) to seconds.
	private convertTimeToSeconds(timeStr: string) {
		if (notExist(timeStr)) {
			return 0;
		}

		const parts = timeStr.split(':');
		if (parts.length < 2) {
			return 0;
		}

		const minutes = parseInt(parts[0], 10);
		const seconds = parseInt(parts[1], 10);
		return minutes * 60 + seconds;
	}
}
