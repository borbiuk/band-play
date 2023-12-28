// Stored tracks on current page.
let tracks = [];

// Flag to track whether the next button has been added to the player.
let nextButtonAdded = false;

// Track ID on the feed page that was paused.
let feedPauseTrackId = null;

// The ID of latest played track on the feed page.
let lastFeedPlayingTrackId = null;

// Enable autoplay on all pages.
let autoplay = true;

// Enable autoscroll to track that was start playing.
let autoscroll = true;

// Play first track on the page when error occurred.
let playFirst = true;

// Object to handle 'collection' and 'wishlist' pages.
const collection = {

	// Check that url is a 'collection' or 'wishlist' page url.
	checkUrl: (url) => {
		const collectionPageRegex = /^https?:\/\/(?:[^./?#]+\.)?bandcamp\.com\/[^/?#]+(?:\/wishlist)?$/i;
		return collectionPageRegex.test(url.split('?'));
	},

	// Check if the current track has played more than 99% and play the next track if so.
	tryAutoplay: () => {
		const progress = collection.getPlayingTrackProgress();
		if (utils.exist(progress) && progress >= 99) {
			collection.playNextTrack();
		}
	},

	// Play the next track in the collection.
	playNextTrack: () => {
		const nextTrackToPlay = collection.getNextTrack();
		if (utils.notExist(nextTrackToPlay)) {
			return false;
		}

		nextTrackToPlay.element.querySelector('a')?.click();

		if (autoscroll) {
			nextTrackToPlay.element.scrollIntoView({block: 'center', behavior: 'smooth'});
		}

		return true;
	},

	// Get the progress of the currently playing track.
	getPlayingTrackProgress: () => {
		const left = document.querySelector('div.seek-control')?.style?.left;
		return utils.notExist(left) ? null : parseFloat(left);
	},

	// Get the next track to be played in the collection.
	getNextTrack: () => {
		const nowPlayingId = collection.getNowPlayingTrackId();
		if (utils.notExist(nowPlayingId)) {
			return playFirst && tracks.length > 0 ? tracks[0] : null;
		}

		let nowPlayingIndex = utils.getTrackIndex(nowPlayingId);

		if (nowPlayingIndex === -1) {
			initTracks();
			nowPlayingIndex = utils.getTrackIndex(nowPlayingId);
		}

		if (nowPlayingIndex === -1 || nowPlayingIndex === tracks.length - 1) {
			return playFirst && tracks.length > 0 ? tracks[0] : null;
		}

		return tracks[nowPlayingIndex + 1];
	},

	// Play or Pause current track in the collection.
	playPause: () => {
		document.querySelector('.playpause')?.click();
	},

	// Get the ID of the currently playing track.
	getNowPlayingTrackId: () => document.querySelector('div[data-collect-item]')
		?.getAttribute('data-collect-item')
		?.substring(1),

	// Object to control the percentage of the track being played.
	percentage: {
		// Function to play the next track considering the saved playback percentage.
		playNextTrack: () => {
			let percentage = collection.percentage.calculateTimePercentage()
			if (collection.playNextTrack()) {
				setTimeout(() => {
					collection.percentage.click(percentage)
				}, 500);
			}
		},

		// Function to simulate a click at a specific percentage within the seek control.
		click: (percentage) => {
			// Get the seek control outer element
			const seekControlOuter = document.querySelector('.seek-control-outer');

			if (seekControlOuter) {
				// Calculate the x-coordinate for the click event based on the percentage
				const rect = seekControlOuter.getBoundingClientRect();
				const x = rect.left + (rect.width * (percentage / 100));

				// Create a new click event
				const clickEvent = new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					view: window,
					clientX: x,
					clientY: rect.top + (rect.height / 2) // Middle of the element vertically
				});

				// Dispatch the event to the seek control outer element
				seekControlOuter.dispatchEvent(clickEvent);
			}
		},

		// Function to calculate the playback percentage of the current track
		calculateTimePercentage: () => {
			const convertTimeToSeconds = (timeStr) => {
				const parts = timeStr.split(':');
				const minutes = parseInt(parts[0], 10);
				const seconds = parseInt(parts[1], 10);
				return (minutes * 60) + seconds;
			};

			// Retrieve the time strings
			const positionStr = document.querySelector('.pos-dur [data-bind="text: positionStr"]').textContent;
			const durationStr = document.querySelector('.pos-dur [data-bind="text: durationStr"]').textContent;

			// Convert time strings to seconds
			const positionInSeconds = convertTimeToSeconds(positionStr);
			const durationInSeconds = convertTimeToSeconds(durationStr);

			// Calculate the percentage
			return (positionInSeconds / durationInSeconds) * 100;
		}
	},

	// Object to handle the next track button functionalities.
	nextTrackButton: {

		// Click the next track button.
		click: () => {
			const showNextButton = document.querySelectorAll('.show-more');
			if (utils.notExist(showNextButton)) {
				return false;
			}

			showNextButton.forEach(x => x.click());
			return true;
		},

		// Add the next track button to the player.
		addToPlayer: () => {
			if (nextButtonAdded) {
				return;
			}

			const existedNewButton = document.querySelector('.band-play-next-button');
			if (utils.exist(existedNewButton)) {
				return;
			}

			const player = document.querySelector('.transport');
			if (utils.notExist(player)) {
				return;
			}

			const button = collection.nextTrackButton.addClickListener(() => {
				collection.playNextTrack();
			});

			player.style.width = '105px';
			player.appendChild(button);

			nextButtonAdded = true;
		},

		// Add click listener to the next track button.
		addClickListener: (onClick) => {
			const button = document.createElement('button');
			button.className = 'band-play-next-button';
			button.style.cssText = `
				height: 26px;
				margin-top: -8px;
				border: none;
				background: none;
			`;

			const image = document.createElement('img');
			image.src = chrome.runtime.getURL('assets/button.png');
			image.style.cssText = `
				height: 100%;
				margin-bottom: -5px;
			`;

			button.appendChild(image);

			// on hover
			button.addEventListener('mouseenter', () => {
				button.style.transform = 'scale(1.07)';
			});
			button.addEventListener('mouseleave', () => {
				button.style.transform = 'scale(1)';
			});

			// on click
			button.addEventListener('click', () => {
				onClick();

				// animation
				button.style.transform = 'scale(1.2)';
				setTimeout(() => {
					button.style.transform = 'scale(1)';
				}, 200);
			});

			return button;
		}
	}
};

const album = {

	// Check that url is a album or track page url.
	checkUrl: (url) => {
		return url.includes('/album/') || url.includes('/track/');
	},

	playNextTrack: () => {
		document.querySelector('.nextbutton').click();
	},

	playPause: () => {
		document.querySelector('.playbutton')?.click();
	},

	percentage: {
		click: (percentage) => {
			const control = document.querySelector('.progbar_empty');
			const thumb = document.querySelector('.thumb.ui-draggable');

			const controlRect = control.getBoundingClientRect();
			const thumbRect = thumb.getBoundingClientRect();

			const fromX = thumbRect.left;
			const fromY = thumbRect.top + (thumbRect.height / 2);
			const toX = controlRect.left + (controlRect.width * (percentage / 100)) - (thumbRect.width / 2);
			const toY = controlRect.top + (controlRect.height / 2);

			utils.drugElement(thumb, fromX, fromY, toX, toY);
		},
	}
};

// Function to initialize tracks based on the current page.
const initTracks = () => {
	let collectionsId;
	const url = window.location.href;
	if (collection.checkUrl(url)) {
		collectionsId = url.includes('/wishlist')
			? 'wishlist-grid'
			: 'collection-grid';
	}
	else if (feed.checkUrl(url)){
		collectionsId = 'story-list'
	}
	else {
		return;
	}

	const allTracksOnPage = document.getElementById(collectionsId)
		?.querySelectorAll('[data-tralbumid]');
	if (utils.notExist(allTracksOnPage) || tracks.length === allTracksOnPage?.length) {
		return;
	}

	tracks = Array.from(allTracksOnPage)
		.filter(x => utils.exist(x.getAttribute('data-trackid'))) // not released tracks
		.map(x => ({
			id: x.getAttribute('data-tralbumid'),
			element: x
		}));

	if (feed.checkUrl(url)) {
		tracks.forEach(x => {
			x.element.querySelector('.play-button').onclick = () => {
				lastFeedPlayingTrackId = null;
				if (!x.element.classList.contains('playing')) {
					feedPauseTrackId = x.id;
				}
			}
		});
	}
}

// Object to handle 'feed' page.
const feed = {

	// Check that url is a 'feed' page url.
	checkUrl: (url) => {
		return url.endsWith('/feed') || url.includes('/feed?')
	},

	// Try to play the next track in the feed.
	tryAutoplay: () => {
		const nowPlaying = document.querySelector('[data-tralbumid].playing');
		if (utils.exist(nowPlaying)) {
			lastFeedPlayingTrackId = nowPlaying.getAttribute('data-tralbumid');
			return;
		}

		if (utils.notExist(lastFeedPlayingTrackId)) {
			return;
		}

		if (utils.exist(feedPauseTrackId)) {
			return;
		}

		feedPauseTrackId = null;

		lastFeedPlayingTrackId = tracks[utils.getTrackIndex(lastFeedPlayingTrackId) + 1].id;
		const playPauseButton = tracks[utils.getTrackIndex(lastFeedPlayingTrackId)].element.querySelector('.play-button');
		playPauseButton.click();

		if (autoscroll) {
			playPauseButton.scrollIntoView({
				block: 'center', behavior: 'smooth'
			});
		}
	},

	// Play the next track in the feed.
	playNextTrack: () => {
		const nowPlaying = document.querySelector('[data-tralbumid].playing');
		if (utils.notExist(nowPlaying)) {
			const playPauseButton = utils.exist(feedPauseTrackId)
				? tracks[utils.getTrackIndex(feedPauseTrackId) + 1].element.querySelector('.play-button')
				: tracks[0].element.querySelector('.play-button');
			playPauseButton.click();
			if (autoscroll) {
				playPauseButton.scrollIntoView({
					block: 'center', behavior: 'smooth'
				});
			}
			playPauseButton.onclick = () => {
				feedPauseTrackId = playFirst ? tracks[0].id : null;
				lastFeedPlayingTrackId = null;
			}
			return;
		}

		const nextPlayPauseButton = tracks[utils.getTrackIndex(nowPlaying.getAttribute('data-tralbumid')) + 1].element.querySelector('.play-button');
		nextPlayPauseButton.click();
		if (autoscroll) {
			nextPlayPauseButton.scrollIntoView({
				block: 'center', behavior: 'smooth'
			});
		}
		nextPlayPauseButton.onclick = () => {
			feedPauseTrackId = tracks[utils.getTrackIndex(nowPlaying.getAttribute('data-tralbumid')) + 1].id;
			lastFeedPlayingTrackId = null;
		}
	},

	// Play or Pause current track in the feed.
	playPause: () => {
		const playingFeed = document.querySelector('[data-tralbumid].playing');
		if (utils.exist(playingFeed)) {
			playingFeed.querySelector('.play-button').click();
			feedPauseTrackId = playingFeed.getAttribute('data-tralbumid');
		} else if (utils.exist(feedPauseTrackId)) {
			tracks[utils.getTrackIndex(feedPauseTrackId)].element.querySelector('.play-button').click();
			feedPauseTrackId = null;
		}
	}
};

// Utility functions used across the codebase.
const utils = {

	// Get the index of a track by its ID in the tracks array.
	getTrackIndex: (trackId) => tracks.findIndex(x => x.id === trackId),

	// Check if a value does not exist (null, undefined, or empty string).
	notExist: (value) => value === null || value === undefined || value === '',

	// Check if a value exists (not null, undefined, or empty string).
	exist: (value) => !utils.notExist(value),

	// Drug element.
	drugElement: (element, fromX, fromY, toX, toY) => {
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
	},
};

// Main function to start the application.
const main = () => {
	console.log("[Start]: Band Play");

	collection.nextTrackButton.click();

	// Main execution loop for track playback and initialization
	setInterval(() => {
		try {
			collection.nextTrackButton.addToPlayer();

			if (!autoplay) {
				return;
			}

			const url = window.location.href;
			if (feed.checkUrl(url)) {
				feed.tryAutoplay();
			} else if (collection.checkUrl(url)){
				collection.tryAutoplay();
			}
		} catch (e) {
			console.log(e);
		}
	}, 300);

	// Initialization loop to refresh tracks periodically
	initTracks();
	setInterval(() => {
		try {
			initTracks();
		} catch (e) {
			console.log(e);
		}
	}, 1_000);
}
main();

// Event listeners for keyboard shortcuts.
document.addEventListener('keydown', (event) => {
	if (event.target?.localName === 'input') {
		return;
	}

	const url = window.location.href;
	if (event.code === 'Space') { // Play/Pause current track on the 'Space' keydown
		event.preventDefault();

		if (album.checkUrl(url)) {
			album.playPause();
		}
		else if (feed.checkUrl(url)) {
			feed.playPause();
		}
		else if (collection.checkUrl(url)) {
			collection.playPause();
		}
	} else if (event.code === 'KeyN') { // Play the next track on the 'N' keydown
		if (album.checkUrl(url)) {
			album.playNextTrack();
		}
		else if (feed.checkUrl(url)) {
			feed.playNextTrack();
		}
		else if (collection.checkUrl(url)) {
			collection.playNextTrack()
		}
	} else if (event.code === 'KeyM') { // Play the next track with currently played percentage on the 'M' keydown
		if (collection.checkUrl(url)) {
			collection.percentage.playNextTrack();
		}
	} else if (event.code.startsWith('Digit')) { // Play the current track with percentage on the 'Digit' keydown
		const percentage = Number(event.code.split('Digit')[1]) * 10;

		if (album.checkUrl(url)) {
			album.percentage.click(percentage);
		}
		else if (collection.checkUrl(url)) {
			event.preventDefault();
			collection.percentage.click(percentage);
		}
	}

	return true;
}, false);

// Event listeners for Chrome messages.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

	// clear data on URL change message
	if (message?.code === 'URL_CHANGED') {
		tracks = [];
		collection.nextTrackButton.click();
		initTracks();

		return;
	}

	if (message?.code === 'STORAGE_CHANGED') {
		chrome.storage.local.get(['autoplay', 'autoscroll', 'playFirst'], (result) => {
			autoplay = result.autoplay;
			autoscroll = result.autoscroll;
			playFirst = result.playFirst;
		});
	}
});

// Init configuration form local storage.
chrome.storage.local.get(['autoscroll', 'playFirst'], (result) => {
	autoscroll = result.autoscroll;
	playFirst = result.playFirst;
});
