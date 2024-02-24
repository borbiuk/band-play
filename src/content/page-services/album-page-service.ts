import { MessageCode } from '../../shared/enums/message-code';
import { PageService } from '../../shared/interfaces/page-service';
import { MessageService } from '../../shared/services/message-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { drugElement } from '../../shared/utils/utils.element';
import { convertTimeStringToSeconds } from '../../shared/utils/utils.time';
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
		document.querySelector<HTMLElement>('.playbutton')?.click();
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

	movePlayback(forward: boolean): void {
		// Retrieve the time strings
		const positionStr = document.querySelector('.time_elapsed').textContent;
		const durationStr = document.querySelector('.time_total').textContent;

		// Convert time strings to seconds
		const positionInSeconds = convertTimeStringToSeconds(positionStr);
		const durationInSeconds = convertTimeStringToSeconds(durationStr);

		let nextPositionInSeconds =
			positionInSeconds +
			(forward ? this.config.playbackStep : -this.config.playbackStep);
		if (nextPositionInSeconds < 0) {
			nextPositionInSeconds = 0;
		} else if (nextPositionInSeconds > durationInSeconds) {
			nextPositionInSeconds = durationInSeconds;
		}

		const percentage = (nextPositionInSeconds / durationInSeconds) * 100;
		this.setPlayback(percentage);
	}

	setPlayback(percentage: number): void {
		const control = document.querySelector('.progbar_empty');
		const thumb = document.querySelector('.thumb.ui-draggable');

		const controlRect = control.getBoundingClientRect();
		const thumbRect = thumb.getBoundingClientRect();

		const fromX = thumbRect.left;
		const fromY = thumbRect.top + thumbRect.height / 2;
		const toX =
			controlRect.left +
			(controlRect.width - thumbRect.width) * (percentage / 100);
		const toY = controlRect.top + controlRect.height / 2;

		drugElement(thumb, fromX, fromY, toX, toY);
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
