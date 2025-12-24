import { PageService } from '@shared/interfaces';
import { BandcampTrackModel } from '@shared/models';
import { exist, notExist } from '@shared/utils';

import { BaseBandcampPageService } from './base/base-bandcamp-page-service';

// Service to handle 'collection' and 'wishlist' pages.
export class CollectionPageService
	extends BaseBandcampPageService
	implements PageService
{
	private isWishlist: boolean;
	private collectionShowAllItemsClicked: boolean = false;
	private wishlistShowAllItemsClicked: boolean = false;

	constructor() {
		super();
	}

	isServiceUrl(url: string): boolean {
		this.isWishlist = url.includes('/wishlist');
		const collectionPageRegex =
			/^https:\/\/bandcamp\.com\/[a-zA-Z0-9-_]+(?:\/wishlist)?$/;
		return collectionPageRegex.test(url.split('?')[0]);
	}

	playPause(): void {
		this.audioOperator<void>(
			(audio: HTMLAudioElement) => {
				if (audio.paused) {
					audio.play();
				} else {
					audio.pause();
				}
			},
			() => this.playTrackByIndex(0)
		);
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

	tryAutoplay(): void {
		const progress = this.audioOperator<number>(
			(audio: HTMLAudioElement) =>
				(audio.currentTime / audio.duration) * 100
		);
		if (!this.autoplayNeeded(progress)) {
			return;
		}

		if (this.config.loopTrack) {
			this.seekToPercentage(0);
			return;
		}

		this.playNextTrack(true);
	}

	initTracks(): void {
		setTimeout(async () => {
			this.clickShowAllItems();
			await this.updateVisitedHighlighting();
		}, 0);

		const collectionId = this.isWishlist
			? 'wishlist-grid'
			: 'collection-grid';

		const allTracksOnPage = document
			.getElementById(collectionId)
			?.querySelectorAll('[data-tralbumid]');
		if (
			notExist(allTracksOnPage) ||
			(this.tracks.length === allTracksOnPage?.length &&
				this.tracks[0].id ===
					allTracksOnPage[0].getAttribute('data-tralbumid'))
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

	open(active: boolean): void {
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
		this.createNewTab(itemUrl, active);
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

	private getNextTrack(next: boolean): BandcampTrackModel {
		const nowPlayingId = this.getNowPlayingTrackId();
		if (notExist(nowPlayingId)) {
			return this.tracks.length > 0 ? this.tracks[0] : null;
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
			return this.tracks.length > 0 ? this.tracks[0] : null;
		}

		if (!next && nowPlayingIndex === 0) {
			return null;
		}

		return this.tracks[nowPlayingIndex + (next ? 1 : -1)];
	}

	private clickShowAllItems(): void {
		if (
			(this.isWishlist && this.wishlistShowAllItemsClicked) ||
			(!this.isWishlist && this.collectionShowAllItemsClicked)
		) {
			return;
		}

		const buttonsList =
			document.querySelectorAll<HTMLElement>('.show-more');
		if (notExist(buttonsList)) {
			return;
		}

		buttonsList.forEach((button) => {
			if (exist(button.getAttribute('band-play-clicked'))) {
				return;
			}

			button.addEventListener('click', (event: MouseEvent) =>
				event.stopPropagation()
			);
			button.click();
			button.setAttribute('band-play-clicked', '');

			if (this.isWishlist) {
				this.wishlistShowAllItemsClicked = true;
			} else {
				this.collectionShowAllItemsClicked = true;
			}
		});
	}
}
