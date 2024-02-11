import { exist, notExist } from '../common/utils';
import { Config } from '../contracts/config';
import { Service, Track } from '../contracts/service';

export class Album implements Service {
	config: Config;
	tracks: Track[] = [];

	playPercentage(percentage: number): void {
		const control = document.querySelector('.progbar_empty');
		const thumb = document.querySelector('.thumb.ui-draggable');

		const controlRect = control.getBoundingClientRect();
		const thumbRect = thumb.getBoundingClientRect();

		const fromX = thumbRect.left;
		const fromY = thumbRect.top + thumbRect.height / 2;
		const toX =
			controlRect.left +
			(controlRect.width - thumbRect.width) * (percentage / 100);
		const toY = controlRect.top + controlRect.height / 2;

		this.drugElement(thumb, fromX, fromY, toX, toY);
	}

	move(forward: boolean): void {
		// Retrieve the time strings
		const positionStr = document.querySelector('.time_elapsed').textContent;
		const durationStr = document.querySelector('.time_total').textContent;

		// Convert time strings to seconds
		const positionInSeconds = this.convertTimeToSeconds(positionStr);
		const durationInSeconds = this.convertTimeToSeconds(durationStr);

		let nextPositionInSeconds =
			positionInSeconds +
			(forward ? this.config.movingStep : -this.config.movingStep);
		if (nextPositionInSeconds < 0) {
			nextPositionInSeconds = 0;
		} else if (nextPositionInSeconds > durationInSeconds) {
			nextPositionInSeconds = durationInSeconds;
		}

		const percentage = (nextPositionInSeconds / durationInSeconds) * 100;
		this.playPercentage(percentage);
	}

	open() {
		const itemUrl = document
			.querySelector('.current_track .title')
			?.querySelector('a')
			?.getAttribute('href');

		if (exist(itemUrl)) {
			chrome.runtime.sendMessage({
				id: 'CREATE_TAB',
				url: window.location.origin + itemUrl,
			}).catch(e => {
				console.error(e);
			});
		}
	}

	checkUrl(url: string): boolean {
		return url.includes('/album/') || url.includes('/track/');
	}

	tryAutoplay() {}

	playPause() {
		document.querySelector<HTMLElement>('.playbutton')?.click();
	}

	playNextTrack(next: boolean) {
		if (next) {
			document.querySelector<HTMLElement>('.nextbutton').click();
			return;
		}

		document.querySelector<HTMLElement>('.prevbutton').click();
	}

	playNextTrackWithPercentage() {}

	play(index: number) {
		if (index < 0) {
			return;
		}

		const playButtons = document.querySelectorAll(
			'td.play-col > a:not(:has(div.play_status.disabled))'
		);
		if (index >= playButtons.length) {
			return;
		}

		playButtons[index].querySelector('div').click();
	}

	initTracks(): void {}

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

	// Drug element.
	private drugElement(
		element: Element,
		fromX: number,
		fromY: number,
		toX: number,
		toY: number
	) {
		const down = new MouseEvent('mousedown', {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: fromX,
			clientY: fromY,
		});

		const move = new MouseEvent('mousemove', {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: toX,
			clientY: toY,
		});

		const up = new MouseEvent('mouseup', {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: toX,
			clientY: toY,
		});

		element.dispatchEvent(down);
		element.dispatchEvent(move);
		element.dispatchEvent(up);
	}
}
