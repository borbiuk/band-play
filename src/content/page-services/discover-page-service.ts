import { MessageCode } from '../../shared/enums/message-code';
import { PageService } from '../../shared/interfaces/page-service';
import { MessageService } from '../../shared/services/message-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { convertTimeStringToSeconds } from '../../shared/utils/utils.time';
import { BasePageService } from './base/base-page-service';

// Service to handle 'discover' page.
export class DiscoverPageService
	extends BasePageService
	implements PageService
{
	constructor(protected messageService: MessageService) {
		super(messageService);
	}

	isServiceUrl(url: string): boolean {
		return url.includes('/discover');
	}

	playPause(): void {
		let button = document.querySelector('.play-circle-outline-icon');
		if (notExist(button)) {
			button = document.querySelector('.pause-circle-outline-icon');
		}
		button?.parentElement?.click();
	}

	playNextTrack(next: boolean): void {
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

	playTrackByIndex(index: number): void {
		if (index >= 0 && index < this.tracks.length) {
			this.tracks[index].element
				.querySelector<HTMLElement>('div button[aria-label="Play"]')
				.click();
		}
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

	tryAutoplay(): void {
		const progress = this.getPlayingTrackProgress();
		if (exist(progress) && progress >= 99.5) {
			this.playNextTrack(true);
		}
	}

	open(): void {
		const itemUrl =
			document.querySelector<HTMLAnchorElement>('.go-to-album')?.href;
		this.createNewTab(itemUrl);
	}

	private getPlayingTrackProgress(): number {
		// Retrieve the time strings
		const positionStr = document.querySelector(
			'.playback-time.current'
		)?.textContent;
		const durationStr = document.querySelector(
			'.playback-time.total'
		)?.textContent;

		// Convert time strings to seconds
		const positionInSeconds = convertTimeStringToSeconds(positionStr);
		const durationInSeconds = convertTimeStringToSeconds(durationStr);

		return (positionInSeconds / durationInSeconds) * 100;
	}
}
