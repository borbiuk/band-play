import { PageService } from '@shared/interfaces';
import { exist, notExist } from '@shared/utils';
import { BasePageService } from '../base/base-page-service';

export class SoundCloudDiscoverPageService
	extends BasePageService<HTMLElement>
	implements PageService
{
	constructor() {
		super();
	}

	tryAutoplay(): void {}

	open(active: boolean): void {
		const href = document
			.querySelector('a.playbackSoundBadge__titleLink')
			?.getAttribute('href');

		if (exist(href)) {
			const url = new URL(href, 'https://soundcloud.com');
			this.createNewTab(url.href, active);
		}
	}

	addToWishlist(): void {
		const button = document.querySelector<HTMLButtonElement>(
			'button.playbackSoundBadge__like'
		);

		if (exist(button)) {
			button.click();
		}
	}

	playPause(): void {}

	playTrackByIndex(index: number): void {
		if (index < 0 || index >= this.tracks.length) {
			return;
		}

		const track = this.tracks[index];
		track
			.querySelector('div.playableTile__playButton')
			.querySelector('a')
			?.click();

		if (this.config.autoscroll) {
			track.scrollIntoView({
				block: 'center',
				behavior: 'smooth',
			});
		}
	}

	isServiceUrl(url: string): boolean {
		return url.includes('soundcloud.com/');
	}

	playNextTrack(next: boolean): void {
		const selector = next
			? 'button.playControls__next'
			: 'button.playControls__prev';

		const button = document.querySelector<HTMLButtonElement>(selector);

		if (exist(button)) {
			button.click();
		}
	}

	initTracks(): void {
		const allTracksOnPage = document
			.querySelector('ul.lazyLoadingList__list')
			?.querySelectorAll('li');

		if (
			notExist(allTracksOnPage) ||
			this.tracks.length === allTracksOnPage?.length
		) {
			return;
		}

		this.tracks = Array.from(allTracksOnPage);
	}
}
