import { DONATE_URL, getRateUrl } from '@shared/constants/links';
import { exist, isWishlistUrl, notExist } from '@shared/utils';

import { BandcampTrackModel } from '../../models/bandcamp-track-model';
import { PageService } from '../page-service';

import { BaseBandcampPageService } from './base/base-bandcamp-page-service';

// Service to handle 'collection' and 'wishlist' pages.
export class CollectionPageService
	extends BaseBandcampPageService
	implements PageService
{
	private isWishlist: boolean;
	private collectionShowAllItemsClicked: boolean = false;
	private wishlistShowAllItemsClicked: boolean = false;
	private externalTabsInjected: boolean = false;

	constructor() {
		super();
	}

	isServiceUrl(url: string): boolean {
		this.isWishlist = isWishlistUrl(url);
		const collectionPageRegex =
			/^https:\/\/bandcamp\.com\/[a-zA-Z0-9-_]+(?:\/wishlist)?$/;
		return collectionPageRegex.test(url.split('?')[0]);
	}

	playPause(): void {
		this.audioOperator<void>(
			(audio: HTMLAudioElement) => {
				if (audio.paused) {
					audio.play().catch((e) => console.error(e));
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

		this.clickAndReveal(
			nextTrackToPlay.element.querySelector('a'),
			nextTrackToPlay.element
		);

		return true;
	}

	playTrackByIndex(index: number): void {
		if (index < 0 || index >= this.tracks.length) {
			return;
		}

		const track = this.tracks[index];
		this.clickAndReveal(track.element.querySelector('a'), track.element);
	}

	initTracks(): void {
		setTimeout(async () => {
			this.injectExternalTabs();
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
			allTracksOnPage.length === 0 ||
			(this.tracks.length === allTracksOnPage.length &&
				this.tracks[0]?.id ===
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

	private injectExternalTabs(): void {
		if (this.externalTabsInjected) {
			return;
		}

		const tabs = document.getElementById('grid-tabs');
		if (notExist(tabs)) {
			return;
		}

		const donateTabId = 'band-play-tab-donate';
		const rateTabId = 'band-play-tab-rate';

		if (exist(document.getElementById(donateTabId))) {
			this.externalTabsInjected = true;
			return;
		}

		const rateUrl = getRateUrl();

		const svgNamespace = 'http://www.w3.org/2000/svg';
		// A small stroke icon before the title (the colors are in batch-download.scss)
		const createIcon = (paths: string[]): SVGSVGElement => {
			const svg = document.createElementNS(svgNamespace, 'svg');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('aria-hidden', 'true');
			for (const d of paths) {
				const path = document.createElementNS(svgNamespace, 'path');
				path.setAttribute('d', d);
				svg.appendChild(path);
			}

			return svg;
		};

		const createExternalTab = (
			id: string,
			title: string,
			url: string,
			icon: SVGSVGElement
		) => {
			const li = document.createElement('li');
			li.id = id;
			li.classList.add('band-play-external-tab');
			li.setAttribute('role', 'button');
			li.setAttribute('tabindex', '0');

			const titleSpan = document.createElement('span');
			titleSpan.className = 'tab-title';

			titleSpan.appendChild(icon);
			titleSpan.appendChild(document.createTextNode(title));
			li.appendChild(titleSpan);

			const open = (event: Event) => {
				event.preventDefault();
				event.stopPropagation();
				this.createNewTab(url, true);
			};

			li.addEventListener('click', open);
			li.addEventListener('keydown', (event: KeyboardEvent) => {
				if (event.key !== 'Enter' && event.key !== ' ') {
					return;
				}
				open(event);
			});

			return li;
		};

		const heart = createIcon([
			'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z',
		]);
		const star = createIcon([
			'M12 2.5 15.1 8.8 22 9.8 17 14.7 18.2 21.5 12 18.2 5.8 21.5 7 14.7 2 9.8 8.9 8.8z',
		]);
		const donateTab = createExternalTab(
			donateTabId,
			'donate',
			DONATE_URL,
			heart
		);

		tabs.appendChild(donateTab);

		// Firefox has no store page to rate on
		if (exist(rateUrl)) {
			tabs.appendChild(
				createExternalTab(rateTabId, 'rate', rateUrl, star)
			);
		}

		this.externalTabsInjected = true;
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

		this.toggleWishlist(buttonContainer);
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
