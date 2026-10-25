import { exist, notExist } from '@shared/utils';

import EventEmitter from '../../services/event-emitter';
import visitedService from '../../services/visited-service';
import { PageService } from '../page-service';

import { BaseBandcampPageService } from './base/base-bandcamp-page-service';
import { renderPlayer } from './feed-player/feed-player';

// Service to handle 'feed' page.
export class FeedPageService
	extends BaseBandcampPageService
	implements PageService
{
	public isPreviousTrackAvailable: boolean = false;
	/** Play buttons that already have the "now playing" click listener */
	private readonly boundPlayButtons = new WeakSet<HTMLElement>();
	public nowPlayingEventEmitter: EventEmitter<{
		id: string;
		title: string;
		artist: string;
		coverArtUrl: string;
	}> = new EventEmitter();

	private nowPlaying: {
		element: Element;
		id: string;
		name: string;
		artist: string;
		coverArtUrl: string;
	};

	constructor() {
		super();
	}

	isServiceUrl(url: string): boolean {
		const useService = url.endsWith('/feed') || url.includes('/feed?');
		if (useService) {
			renderPlayer(this);
		}
		return useService;
	}

	playNextTrack(next: boolean): void {
		if (notExist(this.nowPlaying)) {
			this.isPreviousTrackAvailable = false;
			return;
		}

		// The feed may have been rendered again since the track started
		const currentIndex = this.tracks.findIndex(
			({ element }) => element === this.nowPlaying.element
		);
		if (currentIndex < 0) {
			return;
		}

		this.playTrackByIndex(currentIndex + (next ? 1 : -1));
	}

	playTrackByIndex(index: number): void {
		if (index < 0 || index >= this.tracks.length) {
			this.isPreviousTrackAvailable = false;
			return;
		}

		this.isPreviousTrackAvailable = index !== 0;

		const playPauseButton =
			this.tracks[index].element.querySelector<HTMLElement>(
				'.play-button'
			);
		if (notExist(playPauseButton)) {
			return;
		}

		this.clickAndReveal(playPauseButton);
	}

	initTracks(): void {
		setTimeout(() => this.updateVisitedHighlighting(), 0);

		const collectionId = 'story-list';
		const itemIdSelector = 'data-tralbumid';

		const allTracksOnPage = document
			.getElementById(collectionId)
			?.querySelectorAll('[data-tralbumid]');

		// The feed can render a list of the same size again: compare the first and last elements too
		if (
			notExist(allTracksOnPage) ||
			(this.tracks.length === allTracksOnPage.length &&
				this.tracks[0]?.element === allTracksOnPage[0] &&
				this.tracks[this.tracks.length - 1]?.element ===
					allTracksOnPage[allTracksOnPage.length - 1])
		) {
			return;
		}

		this.tracks = Array.from(allTracksOnPage)
			.map((x) => ({
				id: x.getAttribute(itemIdSelector),
				element: x,
			}))
			.filter((x) => exist(x.id));

		this.tracks.forEach(({ element }) => {
			const playButton =
				element.querySelector<HTMLElement>('.play-button');
			// The list is rescanned as the feed grows: bind every button once
			if (notExist(playButton) || this.boundPlayButtons.has(playButton)) {
				return;
			}

			this.boundPlayButtons.add(playButton);

			const setNowPlaying = () => {
				this.nowPlaying = {
					element,
					id: element.getAttribute('data-tralbumid'),
					name: element.querySelector<HTMLElement>(
						'.collection-item-title'
					)?.textContent,
					artist: element.querySelector<HTMLElement>(
						'.collection-item-artist'
					)?.textContent,
					coverArtUrl:
						element.querySelector<HTMLImageElement>(
							'.tralbum-art-large'
						)?.src ||
						element.querySelector<HTMLImageElement>(
							'img[class*="art"]'
						)?.src ||
						element.querySelector<HTMLImageElement>(
							'img[src*="bcbits.com"]'
						)?.src,
				};

				this.nowPlayingEventEmitter.emit({
					id: this.nowPlaying.id,
					title: this.nowPlaying.name,
					artist: this.nowPlaying.artist,
					coverArtUrl: this.nowPlaying.coverArtUrl,
				});

				visitedService
					.markBandcampTralbumIdVisited(this.nowPlaying.id)
					.catch(() => void 0);
			};

			playButton.addEventListener('click', setNowPlaying);
		});
	}

	open(active: boolean): void {
		if (notExist(this.nowPlaying)) {
			return;
		}

		const itemUrl = this.nowPlaying.element
			.querySelector('.item-link')
			.getAttribute('href');
		this.createNewTab(itemUrl, active);
	}

	addToWishlist(): void {
		if (notExist(this.nowPlaying)) {
			return;
		}

		const nowPlayingElement = this.nowPlaying.element;
		const id = `#collect-item_${nowPlayingElement.getAttribute('data-tralbumid')}`;
		const buttonContainer =
			nowPlayingElement.querySelector<HTMLElement>(id);
		if (notExist(buttonContainer)) {
			return;
		}

		this.toggleWishlist(buttonContainer);
	}

	getNowPlayingInfo(): {
		title: string;
		artist: string;
		coverArtUrl: string;
	} {
		if (notExist(this.nowPlaying)) {
			return null;
		}

		return {
			title: this.nowPlaying.name,
			artist: this.nowPlaying.artist,
			coverArtUrl: this.nowPlaying.coverArtUrl,
		};
	}
}
