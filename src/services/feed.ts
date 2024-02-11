import { exist, notExist } from '../common/utils';
import { Config } from '../contracts/config';
import { Service, Track } from '../contracts/service';

export class Feed implements Service {
	// The ID of latest played track on the feed page.
	private lastFeedPlayingTrackId: string;

	// Track ID on the feed page that was paused.
	private feedPauseTrackId: string;

	config: Config;
	tracks: Track[] = [];

	checkUrl(url: string): boolean {
		return url.endsWith('/feed') || url.includes('/feed?');
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

	tryAutoplay() {
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

	play(index: number) {
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

	playNextTrack(next: boolean) {
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
				this.feedPauseTrackId = this.config.playFirst
					? this.tracks[0].id
					: null;
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

	playNextTrackWithPercentage() {}

	playPause() {
		const playingFeed = document.querySelector('[data-tralbumid].playing');
		if (exist(playingFeed)) {
			playingFeed.querySelector<HTMLElement>('.play-button').click();
			this.feedPauseTrackId = playingFeed.getAttribute('data-tralbumid');
		} else if (exist(this.feedPauseTrackId)) {
			this.tracks[this.getTrackIndex(this.feedPauseTrackId)].element
				.querySelector<HTMLElement>('.play-button')
				.click();
			this.feedPauseTrackId = null;
		}
	}

	playPercentage(_: number): void {}

	move(_: boolean): void {}

	open(): void {
		const playingFeed = document.querySelector('[data-tralbumid].playing');
		if (notExist(playingFeed)) {
			return;
		}

		const itemUrl = playingFeed
			.querySelector('.item-link')
			.getAttribute('href');
		chrome.runtime
			.sendMessage({ id: 'CREATE_TAB', url: itemUrl })
			.catch((e) => {
				console.error(e);
			});
	}

	private getTrackIndex(trackId: string) {
		return this.tracks.findIndex((x) => x.id === trackId);
	}
}
