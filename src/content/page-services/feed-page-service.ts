import { PageService } from '../../shared/interfaces/page-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { BasePageService } from './base/base-page-service';

// Service to handle 'feed' page.
export class FeedPageService extends BasePageService implements PageService {
	private nowPlaying: Element;

	constructor() {
		super();
	}

	isServiceUrl(url: string): boolean {
		return url.endsWith('/feed') || url.includes('/feed?');
	}

	playNextTrack(next: boolean): void {
		if (notExist(this.nowPlaying)) {
			this.playTrackByIndex(0);
			return;
		}

		const nextIndex =
			this.tracks
				.map(({ element }, index) => ({ element, index }))
				.find(({ element }) => element === this.nowPlaying).index +
			(next ? 1 : -1);

		this.playTrackByIndex(nextIndex);
	}

	playTrackByIndex(index: number): void {
		if (index < 0 || index >= this.tracks.length) {
			return;
		}

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
			playButton.removeEventListener(
				'click',
				() => (this.nowPlaying = element)
			);
			playButton.addEventListener(
				'click',
				() => (this.nowPlaying = element)
			);
		});
	}

	tryAutoplay(): void {
		const progress = this.audioOperator<number>(
			(audio) => (audio.currentTime / audio.duration) * 100
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

		const itemUrl = this.nowPlaying
			.querySelector('.item-link')
			.getAttribute('href');
		this.createNewTab(itemUrl, active);
	}

	addToWishlist(): void {
		if (notExist(this.nowPlaying)) {
			return;
		}

		const id = `#collect-item_${this.nowPlaying.getAttribute('data-tralbumid')}`;
		const buttonContainer = this.nowPlaying.querySelector<HTMLElement>(id);
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
}
