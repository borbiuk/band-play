import { PageService } from '../../shared/interfaces/page-service';
import { exist, notExist } from '../../shared/utils/utils.common';
import { BasePageService } from './base/base-page-service';

// Service to handle 'feed' page.
export class FeedPageService extends BasePageService implements PageService {
	// The ID of latest played track on the feed page.
	private lastFeedPlayingTrackId: string;

	// Track ID on the feed page that was paused.
	private feedPauseTrackId: string;

	constructor() {
		super();
	}

	isServiceUrl(url: string): boolean {
		return url.endsWith('/feed') || url.includes('/feed?');
	}

	playPause(): void {
		const playingFeed = document.querySelector('[data-tralbumid].playing');
		const setPausedTrackId = () => {
			if (exist(playingFeed)) {
				this.feedPauseTrackId =
					playingFeed.getAttribute('data-tralbumid');
			} else if (exist(this.feedPauseTrackId)) {
				this.feedPauseTrackId = null;
			}
		};
		this.audioOperator((audio) => {
			audio.removeEventListener('pause', setPausedTrackId);
			audio.addEventListener('pause', setPausedTrackId);
		});

		super.playPause();
	}

	playNextTrack(next: boolean): void {
		const index = () => (next ? 1 : -1);
		const nowPlaying = document.querySelector('[data-tralbumid].playing');
		if (notExist(nowPlaying)) {
			const playPauseButton = exist(this.feedPauseTrackId)
				? this.tracks[
						this.getTrackIndex(this.feedPauseTrackId) + index()
					].element.querySelector<HTMLElement>('.play-button')
				: this.tracks[0].element.querySelector<HTMLElement>(
						'.play-button'
					);
			playPauseButton.click();
			if (this.config.autoscroll) {
				playPauseButton.scrollIntoView({
					block: 'center',
					behavior: 'smooth',
				});
			}
			playPauseButton.onclick = () => {
				this.feedPauseTrackId = this.tracks[0].id;
				this.lastFeedPlayingTrackId = null;
			};
			return;
		}

		const nextPlayPauseButton =
			this.tracks[
				this.getTrackIndex(nowPlaying.getAttribute('data-tralbumid')) +
					index()
			].element.querySelector<HTMLElement>('.play-button');
		nextPlayPauseButton.click();

		if (this.config.autoscroll) {
			nextPlayPauseButton.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}

		nextPlayPauseButton.onclick = () => {
			this.feedPauseTrackId =
				this.tracks[
					this.getTrackIndex(
						nowPlaying.getAttribute('data-tralbumid')
					) + index()
				].id;
			this.lastFeedPlayingTrackId = null;
		};
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

		this.tracks.forEach((x) => {
			x.element.querySelector<HTMLElement>('.play-button').onclick =
				() => {
					this.lastFeedPlayingTrackId = null;
					if (x.element.classList.contains('playing')) {
						this.feedPauseTrackId = x.id;
					}
				};
		});
	}

	tryAutoplay(): void {
		const nowPlaying = document.querySelector('[data-tralbumid].playing');
		if (exist(nowPlaying)) {
			this.lastFeedPlayingTrackId =
				nowPlaying.getAttribute('data-tralbumid');
			return;
		}

		if (notExist(this.lastFeedPlayingTrackId)) {
			return;
		}

		if (exist(this.feedPauseTrackId)) {
			return;
		}

		if (this.config.loopTrack) {
			const trackIndex = this.getTrackIndex(this.lastFeedPlayingTrackId);
			this.playTrackByIndex(trackIndex);
			return;
		}

		this.lastFeedPlayingTrackId =
			this.tracks[this.getTrackIndex(this.lastFeedPlayingTrackId) + 1].id;
		const playPauseButton =
			this.tracks[
				this.getTrackIndex(this.lastFeedPlayingTrackId)
			].element.querySelector<HTMLElement>('.play-button');
		playPauseButton.click();

		if (this.config.autoscroll) {
			playPauseButton.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}
	}

	open(active: boolean): void {
		const playingFeed = document.querySelector('[data-tralbumid].playing');
		if (notExist(playingFeed)) {
			return;
		}

		const itemUrl = playingFeed
			.querySelector('.item-link')
			.getAttribute('href');
		this.createNewTab(itemUrl, active);
	}

	addToWishlist(): void {
		const nowPlaying = document.querySelector('[data-tralbumid].playing');
		if (notExist(nowPlaying)) {
			return;
		}

		const id = `#collect-item_${nowPlaying.getAttribute('data-tralbumid')}`;
		const buttonContainer = nowPlaying.querySelector<HTMLElement>(id);
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
