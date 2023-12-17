let tracks = [];
let nextButtonAdded = false;
let feedPauseTrackId = null;
let lastFeedPlayingTrackId = null;

// ------------------------------------------------------------------------------------------------
// Collection & Wishlist
// ------------------------------------------------------------------------------------------------

const tryPlayNextTrack = () => {
	// check progress
	const progress = getPlayingTrackProgress();
	if (notExist(progress) || progress < 99) {
		return;
	}

	playNextTrack();
}

const playNextTrack = () => {
	const nextTrackToPlay = getNextTrack();
	if (notExist(nextTrackToPlay)) {
		return false;
	}

	nextTrackToPlay.element.querySelector('a')?.click();
	nextTrackToPlay.element.scrollIntoView({
		block: 'center', behavior: 'smooth'
	});
	return true
}

const getPlayingTrackProgress = () => {
	const left = document.querySelector('div.seek-control')?.style?.left;

	return notExist(left) ? null : parseFloat(left);
}

const getNextTrack = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (notExist(nowPlayingId)) {
		return tracks.length > 0 ? tracks[0] : null;
	}

	let nowPlayingIndex = getTrackIndex(nowPlayingId);

	// try reload tracks
	if (nowPlayingIndex === -1) {
		initTracks();
		nowPlayingIndex = getTrackIndex(nowPlayingId);
	}

	// not founded OR last
	if (nowPlayingIndex === -1 || nowPlayingIndex === tracks.length - 1) {
		return tracks.length > 0 ? tracks[0] : null;
	}

	return tracks[nowPlayingIndex + 1];
}

const initTracks = () => {
	let collectionsId;
	if (window.location.href.includes('/wishlist')) {
		collectionsId = 'wishlist-grid';
	}
	else if (window.location.href.includes('/feed')) {
		collectionsId = 'story-list'
	}
	else {
		collectionsId = 'collection-grid';
	}

	const allTracksOnPage = document.getElementById(collectionsId)
		?.querySelectorAll('[data-tralbumid]');
	if (notExist(allTracksOnPage) || tracks.length === allTracksOnPage?.length) {
		return;
	}

	console.log(allTracksOnPage.length)

	tracks = Array.from(allTracksOnPage)
		.filter(x => !notExist(x.getAttribute('data-trackid'))) // not released tracks
		.map(x => ({
			id: x.getAttribute('data-tralbumid'),
			element: x
		}));

	console.log(tracks.length);
}


// ------------------------------------------------------------------------------------------------
// Next Track button
// ------------------------------------------------------------------------------------------------

const clickShowNextButton = () => {
	const showNextButton = document.querySelectorAll('.show-more');
	if (notExist(showNextButton)) {
		return false;
	}

	showNextButton.forEach(x => x.click());
	return true;
}

const addPlayNextTrackButtonToPlayer = () => {
	if (nextButtonAdded) {
		return;
	}

	const existedNewButton = document.querySelector('.band-play-next-button');
	if (!notExist(existedNewButton)) {
		return;
	}

	const player = document.querySelector('.transport');
	if (notExist(player)) {
		return;
	}

	const button = getPlayNextTrackButton(() => {
		playNextTrack();
	});

	player.style.width = '105px';
	player.appendChild(button);

	nextButtonAdded = true;
}

const getPlayNextTrackButton = (onClick) => {
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


// ------------------------------------------------------------------------------------------------
// Next track with Percentage
// ------------------------------------------------------------------------------------------------

const playNextTrackWithSavedPercentage = () => {
	let percentage = calculateTimePercentage()
	if (playNextTrack()) {
		console.log("Next button clicked.");

		setTimeout(function () {
			clickAtPercentageWithinSeekControl(percentage)
		}, 500)
	}
}

const calculateTimePercentage = () => {
	function convertTimeToSeconds(timeStr) {
		const parts = timeStr.split(':');
		const minutes = parseInt(parts[0], 10);
		const seconds = parseInt(parts[1], 10);
		return (minutes * 60) + seconds;
	}

	// Retrieve the time strings
	const positionStr = document.querySelector('.pos-dur [data-bind="text: positionStr"]').textContent;
	const durationStr = document.querySelector('.pos-dur [data-bind="text: durationStr"]').textContent;

	// Convert time strings to seconds
	const positionInSeconds = convertTimeToSeconds(positionStr);
	const durationInSeconds = convertTimeToSeconds(durationStr);

	// Calculate the percentage
	return (positionInSeconds / durationInSeconds) * 100;
}

const clickAtPercentageWithinSeekControl = (percentage) => {
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
}


// ------------------------------------------------------------------------------------------------
// Feed
// ------------------------------------------------------------------------------------------------

const tryPlayNextFeedTrack = () => {
	const nowPlaying = document.querySelector('[data-tralbumid].playing');
	if (!notExist(nowPlaying)) {
		lastFeedPlayingTrackId = nowPlaying.getAttribute('data-tralbumid');
		return;
	}

	if (notExist(lastFeedPlayingTrackId)) {
		return;
	}

	if (!notExist(feedPauseTrackId)) {
		return;
	}

	feedPauseTrackId = null;

	lastFeedPlayingTrackId = tracks[getTrackIndex(lastFeedPlayingTrackId) + 1].id;
	const nextFeedTrackButton = tracks[getTrackIndex(lastFeedPlayingTrackId)].element.querySelector('.play-button');
	nextFeedTrackButton.click();
	nextFeedTrackButton.scrollIntoView({
		block: 'center', behavior: 'smooth'
	});
}


// ------------------------------------------------------------------------------------------------
// Utils
// ------------------------------------------------------------------------------------------------

const getTrackIndex = (trackId) => tracks.findIndex(x => x.id === trackId);

const notExist = (value) => value === null || value === undefined || value === '';

const getNowPlayingTrackId = () => document.querySelector('div[data-collect-item]')
	?.getAttribute('data-collect-item')
	?.substring(1);


// ------------------------------------------------------------------------------------------------
// Run
// ------------------------------------------------------------------------------------------------

const main = () => {
	console.log("[Start]: Band Play");

	clickShowNextButton();

	setInterval(() => {
		try {
			addPlayNextTrackButtonToPlayer();

			const url = window.location.pathname;
			if (url.includes('/feed')) {
				tryPlayNextFeedTrack();
			}
			else {
				tryPlayNextTrack();
			}
		} catch (e) {
			console.log(e);
		}
	}, 500);

	initTracks();
	setInterval(() => {
		try {
			initTracks();
		} catch (e) {
			console.log(e);
		}
	}, 2_000);
}
main();

// ------------------------------------------------------------------------------------------------
// Hotkeys & Events
// ------------------------------------------------------------------------------------------------

// Add Play/Pause on 'Space' keydown
document.addEventListener('keydown', function (event) {
	if (event.target?.localName === 'input') {
		return;
	}

	if (event.code === 'Space') {
		event.preventDefault();
		const url = window.location.pathname;
		if (url.includes('/album/') || url.includes('/track/')) {
			document.querySelector('.playbutton')?.click();
		} else if (url.includes('/feed')) {
			const playingFeed = document.querySelector('[data-tralbumid].playing');
			if (!notExist(playingFeed)) {
				playingFeed.querySelector('.play-button').click();
				feedPauseTrackId = playingFeed.getAttribute('data-tralbumid');
			}
			else if (!notExist(feedPauseTrackId)) {
				tracks[getTrackIndex(feedPauseTrackId)].element.querySelector('.play-button').click();
				feedPauseTrackId = null;
			}
		} else {
			document.querySelector('.playpause')?.click();
		}
	} else if (event.key === 'n') {
		playNextTrack()
	} else if (event.key === 'm') {
		playNextTrackWithSavedPercentage()
	}

	return true;
}, false);

// clear data on URL change message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message?.code !== 'URL_CHANGED') {
		return;
	}

	tracks = [];
	clickShowNextButton();
	initTracks();
});
