import { PageService } from '@shared/interfaces';
import { exist, notExist } from '@shared/utils';

import { BaseBandcampPageService } from './base/base-bandcamp-page-service';

// Service to handle 'album' and 'track' pages.
export class AlbumPageService
	extends BaseBandcampPageService
	implements PageService
{
	constructor() {
		super();
	}

	initTracks(): void {}

	isServiceUrl(url: string): boolean {
		return url.includes('/album/') || url.includes('/track/');
	}

	playPause(): void {
		this.audioOperator<void>(
			(audio) => {
				if (audio.paused) {
					audio.play();
				} else {
					audio.pause();
				}
			},
			() => document.querySelector<HTMLElement>('.playbutton')?.click()
		);
	}

	playNextTrack(next: boolean): void {
		if (next) {
			document.querySelector<HTMLElement>('.nextbutton').click();
			return;
		}

		document.querySelector<HTMLElement>('.prevbutton').click();
	}

	playTrackByIndex(index: number): void {
		if (index < 0) {
			return;
		}

		const playButtons = document.querySelectorAll(
			'td.play-col > a:not(:has(div.play_status.disabled))'
		);
		if (index >= playButtons.length) {
			return;
		}

		playButtons[index].querySelector('div').click();
	}

	tryAutoplay(): void {
		if (!this.config.loopTrack) {
			return;
		}

		const progress = this.audioOperator<number>(
			(audio) => (audio.currentTime / audio.duration) * 100
		);

		if (this.autoplayNeeded(progress)) {
			this.seekToPercentage(0);
		}
	}

	open(active: boolean): void {
		const itemUrl = document
			.querySelector('.current_track .title')
			?.querySelector('a')
			?.getAttribute('href');
		if (exist(itemUrl)) {
			this.createNewTab(window.location.origin + itemUrl, active);
		}
	}

	addToWishlist(): void {
		const buttonContainer = document.getElementById('collect-item');
		if (notExist(buttonContainer)) {
			return;
		}

		if (buttonContainer.classList.contains('wishlist')) {
			document.getElementById('wishlist-msg').click();
		} else if (buttonContainer.classList.contains('wishlisted')) {
			document.getElementById('wishlisted-msg')?.click();
		}
	}
}
