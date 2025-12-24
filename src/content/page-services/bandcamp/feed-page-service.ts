import { PageService } from '@shared/interfaces';
import EventEmitter from '@shared/services/event-emitter';
import visitedService from '@shared/services/visited-service';
import { exist, notExist } from '@shared/utils';

import { BaseBandcampPageService } from './base/base-bandcamp-page-service';
import { renderPlayer } from './feed-player/feed-player';

// Service to handle 'feed' page.
export class FeedPageService
	extends BaseBandcampPageService
	implements PageService
{
	public isPreviousTrackAvailable: boolean = false;
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

		const nextIndex =
			this.tracks
				.map(({ element }, index) => ({ element, index }))
				.find(({ element }) => element === this.nowPlaying.element)
				.index + (next ? 1 : -1);

		this.playTrackByIndex(nextIndex);
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
		playPauseButton.click();
		if (this.config.autoscroll) {
			playPauseButton.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}
	}

	initTracks(): void {
		setTimeout(() => this.updateVisitedHighlighting(), 0);

		const collectionId = 'story-list';
		const itemIdSelector = 'data-tralbumid';

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
			.map((x) => ({
				id: x.getAttribute(itemIdSelector),
				element: x,
			}))
			.filter((x) => exist(x.id));

		this.tracks.forEach(({ element }) => {
			const playButton =
				element.querySelector<HTMLElement>('.play-button');

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

			playButton.removeEventListener('click', setNowPlaying);
			playButton.addEventListener('click', setNowPlaying);
		});
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
