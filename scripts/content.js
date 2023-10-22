let tracks = [];
let nextButtonAdded = false;

const run = () => {
	console.log("[Start]: Band Play");

	clickShowNextButton();

	setInterval(function () {
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
		return;
	}

	nextTrackToPlay.element.querySelector('a')?.click();
	nextTrackToPlay.element.scrollIntoView({
		block: 'center', behavior: 'smooth'
	});
	nextTrackToPlay.played = true;
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

	// random track
	return getRandomTrack();
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


const getRandomTrack = () => {
	let notPlayed = tracks.filter(x => !x.played);
	if (notPlayed.length === 0) {
		tracks.forEach(x => {
			x.played = false;
		});
		notPlayed = tracks;
	}

	const randomTrackIndex = parseInt(Math.random() * (notPlayed.length - 1));
	return notPlayed[randomTrackIndex];
}

const initTracks = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (!notExist(nowPlayingId)) {
		const nowPlayingIndex = getTrackIndex(nowPlayingId);
		if (nowPlayingIndex !== tracks.length - 1) {
			return;
		}
	}

	const allTracksOnPage = document.querySelectorAll('li[data-tralbumid]');
	if (tracks.length === allTracksOnPage.length) {
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
	if (!notExist(showNextButton)) {
		showNextButton.forEach(x => x.click());
		return true;
	}

	return false;
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

const getTrackIndex = (searchId) => tracks.findIndex(x => x.id === searchId);

const notExist = (value) => value === null || value === undefined || value === '';

const getNowPlayingTrackId = () => document.querySelector('div[data-collect-item]')
	?.getAttribute('data-collect-item')
	?.substring(1);

run();
