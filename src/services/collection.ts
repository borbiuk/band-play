import { MessageCode } from '../common/message-code';
import { MessageService } from '../common/message-service';
import { exist, notExist } from '../common/utils';
import { Config } from '../contracts/config';

// Service to handle 'collection' and 'wishlist' pages.
import { Service, Track } from '../contracts/service';

export class Collection implements Service {
	private readonly _messageService: MessageService = new MessageService();

	private url: string;

	config: Config;
	tracks: Track[] = [];

	playPercentage(percentage: number): void {
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

	move(forward: boolean): void {
		const percentage = this.calculateTimePercentage(
			forward ? this.config.movingStep : -this.config.movingStep
		);
		this.playPercentage(percentage);
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
		if (exist(itemUrl)) {
			this._messageService
				.sendRuntimeMessage(MessageCode.CreateTab, {
					url: itemUrl,
				})
				.catch((e) => {
					console.error(e);
				});
		}
	}

	tryAutoplay() {
		const progress = this.getPlayingTrackProgress();
		if (exist(progress) && progress >= 99.5) {
			this.playNextTrack(true);
		}
	}

	playPause() {
		document.querySelector<HTMLElement>('.playpause')?.click();
	}

	playNextTrack(next: boolean) {
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

	playNextTrackWithPercentage() {
		const percentage = this.calculateTimePercentage();
		if (this.playNextTrack(true)) {
			setTimeout(() => {
				this.playPercentage(percentage);
			}, 300);
		}
	}

	play(index: number) {
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

	checkUrl(url: string) {
		this.url = url;
		const collectionPageRegex =
			/^https:\/\/bandcamp\.com\/[a-zA-Z0-9]+(?:\/wishlist)?$/;
		return collectionPageRegex.test(url.split('?')[0]);
	}

	private getNextTrack(next: boolean) {
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

	getNowPlayingTrackId() {
		return document
			.querySelector('div[data-collect-item]')
			?.getAttribute('data-collect-item')
			?.substring(1);
	}

	getPlayingTrackProgress() {
		const left =
			document.querySelector<HTMLElement>('div.seek-control')?.style
				?.left;
		return notExist(left) ? null : parseFloat(left);
	}

	initTracks() {
		this.clickShowAllTracks();

		const collectionId = this.url.includes('/wishlist')
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

	private getTrackIndex(trackId: string) {
		return this.tracks.findIndex((x) => x.id === trackId);
	}

	private clickShowAllTracks() {
		const showNextButton =
			document.querySelectorAll<HTMLElement>('.show-more');
		if (notExist(showNextButton)) {
			return false;
		}

		showNextButton.forEach((x) => x.click());
		return true;
	}

	// Function to calculate the playback percentage of the current track.
	private calculateTimePercentage(add = 0) {
		// Retrieve the time strings
		const durationStr = document.querySelector(
			'.pos-dur [data-bind="text: durationStr"]'
		)?.textContent;
		const positionStr = document.querySelector(
			'.pos-dur [data-bind="text: positionStr"]'
		)?.textContent;

		// Convert time strings to seconds
		const durationInSeconds = this.convertTimeToSeconds(durationStr);
		let positionInSeconds = this.convertTimeToSeconds(positionStr) + add;
		if (positionInSeconds < 0) {
			positionInSeconds = 0;
		} else if (positionInSeconds > durationInSeconds) {
			positionInSeconds = durationInSeconds;
		}

		// Calculate the percentage
		return (positionInSeconds / durationInSeconds) * 100;
	}

	// Convert time string (00:00) to seconds.
	private convertTimeToSeconds(timeStr: string) {
		if (notExist(timeStr)) {
			return 0;
		}

		const parts = timeStr.split(':');
		if (parts.length < 2) {
			return 0;
		}

		const minutes = parseInt(parts[0], 10);
		const seconds = parseInt(parts[1], 10);
		return minutes * 60 + seconds;
	}
}
