import { PageService } from '../../shared/interfaces/page-service';
import { MessageService } from '../../shared/services/message-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { BasePageService } from './base/base-page-service';

// Service to handle 'album' and 'track' pages.
export class AlbumPageService extends BasePageService implements PageService {
	constructor(protected messageService: MessageService) {
		super(messageService);
	}

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

	open(): void {
		const itemUrl = document
			.querySelector('.current_track .title')
			?.querySelector('a')
			?.getAttribute('href');
		if (exist(itemUrl)) {
			this.createNewTab(window.location.origin + itemUrl);
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
