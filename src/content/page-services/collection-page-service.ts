import { PageService } from '../../shared/interfaces/page-service';
import { TrackModel } from '../../shared/models/track-model';
import { MessageService } from '../../shared/services/message-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { convertTimeStringToSeconds } from '../../shared/utils/utils.time';
import { BasePageService } from './base/base-page-service';

// Service to handle 'collection' and 'wishlist' pages.
export class CollectionPageService
	extends BasePageService
	implements PageService
{
	private currentUrl: string;

	constructor(protected messageService: MessageService) {
		super(messageService);
	}

	isServiceUrl(url: string): boolean {
		this.currentUrl = url;
		const collectionPageRegex =
			/^https:\/\/bandcamp\.com\/[a-zA-Z0-9-_]+(?:\/wishlist)?$/;
		return collectionPageRegex.test(url.split('?')[0]);
	}

	playPause(): void {
		document.querySelector<HTMLElement>('.playpause')?.click();
	}

	playNextTrack(next: boolean): boolean {
		const nextTrackToPlay = this.getNextTrack(next);
		if (notExist(nextTrackToPlay)) {
			return false;
		}

		nextTrackToPlay.element.querySelector('a')?.click();

		if (this.config.autoscroll) {
			nextTrackToPlay.element.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}

		return true;
	}

	playNextTrackWithPercentage(): void {
		const percentage = this.calculateTimePercentage();
		if (this.playNextTrack(true)) {
			setTimeout(() => {
				this.setPlayback(percentage);
			}, 300);
		}
	}

	playTrackByIndex(index: number): void {
		if (index < 0 || index >= this.tracks.length) {
			return;
		}

		const track = this.tracks[index];
		track.element.querySelector('a')?.click();
		if (this.config.autoscroll) {
			track.element.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}
	}

	movePlayback(forward: boolean): void {
		const percentage = this.calculateTimePercentage(
			forward ? this.config.playbackStep : -this.config.playbackStep
		);
		this.setPlayback(percentage);
	}

	setPlayback(percentage: number): void {
		const control = document.querySelector('.progress-bar');
		if (notExist(control)) {
			return;
		}

		const rect = control.getBoundingClientRect();
		const x = rect.left + rect.width * (percentage / 100);
		const clickEvent = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: x,
			clientY: rect.top + rect.height / 2, // Middle of the element vertically
		});

		// Dispatch the event to the seek control outer element
		control.dispatchEvent(clickEvent);
	}

	tryAutoplay(): void {
		const progress = this.getPlayingTrackProgress();
		if (exist(progress) && progress >= 99.5) {
			this.playNextTrack(true);
		}
	}

	initTracks(): void {
		this.clickShowAllTracks();

		const collectionId = this.currentUrl.includes('/wishlist')
			? 'wishlist-grid'
			: 'collection-grid';

		const allTracksOnPage = document
			.getElementById(collectionId)
			?.querySelectorAll('[data-tralbumid]');
		if (
			notExist(allTracksOnPage) ||
			this.tracks.length === allTracksOnPage?.length
		) {
			return;
		}

		this.tracks = Array.from(allTracksOnPage)
			.filter((x) => exist(x.getAttribute('data-trackid'))) // not released tracks
			.map((x) => ({
				id: x.getAttribute('data-tralbumid'),
				element: x,
			}));
	}

	open(): void {
		const nowPlayingId = this.getNowPlayingTrackId();
		if (notExist(nowPlayingId)) {
			return;
		}

		const nowPlayingIndex = this.getTrackIndex(nowPlayingId);
		if (nowPlayingIndex === -1) {
			return;
		}

		const itemUrl = this.tracks[nowPlayingIndex].element
			.querySelector('.item-link')
			.getAttribute('href');
		this.createNewTab(itemUrl);
	}

	addToWishlist(): void {
		const nowPlayingId = this.getNowPlayingTrackId();
		if (notExist(nowPlayingId)) {
			return;
		}

		const buttonContainer = document.getElementById(
			`collect-item_${nowPlayingId}`
		);
		if (notExist(buttonContainer)) {
			return;
		}

		if (
			buttonContainer.parentElement.parentElement.classList.contains(
				'wishlisted'
			)
		) {
			buttonContainer
				.querySelector<HTMLElement>('.wishlisted-msg')
				.click();
		} else {
			buttonContainer.querySelector<HTMLElement>('.wishlist-msg').click();
		}
	}

	private getNowPlayingTrackId(): string {
		return document
			.querySelector('div[data-collect-item]')
			?.getAttribute('data-collect-item')
			?.substring(1);
	}

	private getPlayingTrackProgress(): number {
		const left =
			document.querySelector<HTMLElement>('div.seek-control')?.style
				?.left;
		return notExist(left) ? null : parseFloat(left);
	}

	private getNextTrack(next: boolean): TrackModel {
		const nowPlayingId = this.getNowPlayingTrackId();
		if (notExist(nowPlayingId)) {
			return this.config.playFirst && this.tracks.length > 0
				? this.tracks[0]
				: null;
		}

		let nowPlayingIndex = this.getTrackIndex(nowPlayingId);

		if (nowPlayingIndex === -1) {
			this.initTracks();
			nowPlayingIndex = this.getTrackIndex(nowPlayingId);
		}

		if (
			nowPlayingIndex === -1 ||
			nowPlayingIndex === this.tracks.length - 1
		) {
			return this.config.playFirst && this.tracks.length > 0
				? this.tracks[0]
				: null;
		}

		if (!next && nowPlayingIndex === 0) {
			return null;
		}

		return this.tracks[nowPlayingIndex + (next ? 1 : -1)];
	}

	private clickShowAllTracks(): boolean {
		const showNextButton =
			document.querySelectorAll<HTMLElement>('.show-more');
		if (notExist(showNextButton)) {
			return false;
		}

		showNextButton.forEach((x) => x.click());
		return true;
	}

	// Function to calculate the playback percentage of the current track.
	private calculateTimePercentage(add = 0): number {
		// Retrieve the time strings
		const durationStr = document.querySelector(
			'.pos-dur [data-bind="text: durationStr"]'
		)?.textContent;
		const positionStr = document.querySelector(
			'.pos-dur [data-bind="text: positionStr"]'
		)?.textContent;

		// Convert time strings to seconds
		const durationInSeconds = convertTimeStringToSeconds(durationStr);
		let positionInSeconds = convertTimeStringToSeconds(positionStr) + add;
		if (positionInSeconds < 0) {
			positionInSeconds = 0;
		} else if (positionInSeconds > durationInSeconds) {
			positionInSeconds = durationInSeconds;
		}

		// Calculate the percentage
		return (positionInSeconds / durationInSeconds) * 100;
	}
}
