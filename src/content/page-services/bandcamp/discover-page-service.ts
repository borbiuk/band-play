import { PlaybackPitchAction } from '@shared/enums';
import { PageService } from '@shared/interfaces';
import { notExist, convertTimeStringToSeconds } from '@shared/utils';

import { BaseBandcampPageService } from './base/base-bandcamp-page-service';

// Service to handle 'discover' page.
export class DiscoverPageService
	extends BaseBandcampPageService
	implements PageService
{
	constructor() {
		super();
	}

	isServiceUrl(url: string): boolean {
		return url.includes('/discover');
	}

	playPause() {
		const button = document.querySelector<HTMLButtonElement>(
			'.player-top > button.play-pause-button'
		);
		button?.click();
	}

	playNextTrack(next: boolean): void {
		const current = document
			.querySelector('[aria-label="Pause"]')
			.parentElement.parentElement.parentElement.getAttribute(
				'data-test'
			);
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

		const nextTrackPlayButton =
			this.tracks[
				nowPlayingIndex + (next ? 1 : -1)
			].element.querySelector<HTMLButtonElement>('.play-pause-button');
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
				.querySelector<HTMLButtonElement>('.play-pause-button')
				.click();
		}
	}

	initTracks(): void {
		setTimeout(() => this.updateVisitedHighlighting(), 0);

		const list = document.querySelectorAll('.results-grid-item');
		if (notExist(list) || list.length === this.tracks.length) {
			return;
		}

		this.tracks = Array.from(list).map((x) => ({
			id: x.getAttribute('data-test'),
			element: x,
		}));
	}

	tryAutoplay(): void {
		const progress = this.getPlayingTrackProgress();
		if (!this.autoplayNeeded(progress)) {
			return;
		}

		if (this.config.loopTrack) {
			this.seekToPercentage(0);
			return;
		}

		this.playNextTrack(true);
	}

	open(active: boolean): void {
		const itemUrl =
			document.querySelector<HTMLAnchorElement>('.buy-button')?.href;
		this.createNewTab(itemUrl, active);
	}

	addToWishlist(): void {
		document.querySelector<HTMLButtonElement>('.wishlist-button')?.click();
	}

	switchPreservesPitch(_: PlaybackPitchAction): void {
		return;
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
