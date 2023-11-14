let tracks = [];
let nextButtonAdded = false;

const run = () => {
	console.log("[Start]: Band Play");

	clickShowNextButton();

	setInterval(function () {
		const url = window.location.pathname;
		if (url.includes('/album/') || url.includes('/track/')) {
			return;
		}

		try {
			initTracks();
			tryPlayNextTrack();
			addPlayNextTrackButtonToPlayer();
		} catch (e) {
			console.error(e);
		}
	}, 500);
}

const tryPlayNextTrack = () => {
	// check progress
	const progress = getPlayingTrackProgress();
	if (notExist(progress) || progress < 99) {
		return;
	}

	playNextTrack();
}

const playNextTrack = () => {
	const nextTrackToPlay = getTrackToPlay();
	if (notExist(nextTrackToPlay)) {
		return false;
	}

	nextTrackToPlay.element.querySelector('a')?.click();
	nextTrackToPlay.element.scrollIntoView({
		block: 'center', behavior: 'smooth'
	});
	nextTrackToPlay.played = true;
	return true
}

const getPlayingTrackProgress = () => {
	const left = document.querySelector('div.seek-control')?.style?.left;

	return notExist(left) ? null : parseFloat(left);
}

const getTrackToPlay = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (notExist(nowPlayingId)) {
		return null;
	}

	// track from document
	const nextTrack = getNextTrack(nowPlayingId);
	if (!notExist(nextTrack)) {
		return nextTrack;
	}

	return getFirsNotPlayedTrack();
}

const getNextTrack = (nowPlayingId) => {
	let nowPlayingIndex = getTrackIndex(nowPlayingId);

	// try reload tracks
	if (nowPlayingIndex === -1) {
		initTracks();
		nowPlayingIndex = getTrackIndex(nowPlayingId);
	}

	// not founded OR last
	if (nowPlayingIndex === -1 || nowPlayingIndex === tracks.length - 1) {
		return null;
	}

	return tracks[nowPlayingIndex + 1];
}


const getFirsNotPlayedTrack = () => {
	const firstNotPlayed = tracks.find(x => !x.played);
	if (!notExist(firstNotPlayed)) {
		return firstNotPlayed;
	}

	tracks.forEach(x => {
		x.played = false;
	});

	return tracks[0];
}

const initTracks = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (!notExist(nowPlayingId)) {
		const nowPlayingIndex = getTrackIndex(nowPlayingId);
		if (nowPlayingIndex !== tracks.length - 1) {
			return;
		}
	}

	const collectionsId = window.location.href.includes('/wishlist')
		? 'wishlist-grid'
		: 'collection-grid';
	const allTracksOnPage = document.getElementById(collectionsId)
		?.querySelectorAll('li[data-tralbumid]');
	if (tracks.length === allTracksOnPage?.length) {
		return;
	}

	const newTracks = Array.from(allTracksOnPage)
		.map(x => ({
			id: x.getAttribute('data-tralbumid'),
			element: x,
			canBePlayed: !notExist(x.getAttribute('data-trackid')),
			played: false
		}))
		.filter(({canBePlayed}) => canBePlayed)
		.filter(({id}) => getTrackIndex(id) === -1);

	tracks = [...tracks, ...newTracks];
}

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

const playNextTrackWithSavedPercentage = () => {
	let percentage = calculateTimePercentage()
	if (playNextTrack()) {
		console.log("Next button clicked.");

		setTimeout(function () {
			clickAtPercentageWithinSeekControl(percentage)
		}, 500)
	}
}

const getTrackIndex = (searchId) => tracks.findIndex(x => x.id === searchId);

const notExist = (value) => value === null || value === undefined || value === '';

const getNowPlayingTrackId = () => document.querySelector('div[data-collect-item]')
	?.getAttribute('data-collect-item')
	?.substring(1);

run();


// Add Play/Pause on 'Space' keydown
document.addEventListener('keydown', function (event) {
	if (event.target?.localName === 'input') {
		return;
	}
	switch (event.code) {
		case 'Space':
			event.preventDefault();

			// TODO: add handling of play/pause on track and album pages
			// const {href} = window.location;
			// if (href.includes('/track/') || href.includes('/album/')) {
			// 	document.querySelector('a[role="button"]')?.click();
			// 	return;
			// }

			const url = window.location.pathname;
			if (url.includes('/album/') || url.includes('/track/')) {
				document.querySelector('.playbutton')?.click();
			} else {
				document.querySelector('.playpause')?.click();
			}
			break
	}

	switch (event.key) {
		case 'n':
			playNextTrack()
			break
		case 'm':
			playNextTrackWithSavedPercentage()
			break
	}
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
