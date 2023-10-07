let tracks = [];

const run = () => {
	console.log("[Start]: Band Play");

	clickShowNextButton();

	setInterval(function () {
		try {
			initTracks();
			playNextTrack();
		} catch (e) {
			console.error(e);
		}
	}, 500);
}

const playNextTrack = () => {
	// check progress
	const progress = getPlayingTrackProgress();
	if (isNullOrUndefined(progress) || progress < 98) {
		return;
	}

	// play next track
	const nextTrackToPlay = getNextTrackToPlay();
	if (!isNullOrUndefined(nextTrackToPlay)) {
		nextTrackToPlay.querySelector('a')?.click();
		nextTrackToPlay.scrollIntoView({
			block: 'center',
			behavior: 'smooth'
		});
	}
}

const getPlayingTrackProgress = () => {
	const divToWatch = document.querySelector('div.seek-control');
	const left = divToWatch?.style?.left;

	return isNullOrUndefined(left)
		? null
		: parseFloat(left);
}

const getNextTrackToPlay = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (nowPlayingId === null) {
		return null;
	}

	// track from document
	const nowPlayingIndex = tracks.findIndex(({id}) => id === nowPlayingId);
	if (nowPlayingIndex !== -1 && nowPlayingIndex !== tracks.length - 1) {
		return tracks[nowPlayingIndex + 1].element;
	}

	// random track
	return getRandomTrack();
}

const getNowPlayingTrackId = () => {
	const nowPlaying = document.querySelector('div[data-collect-item]');
	if (isNullOrUndefined(nowPlaying)) {
		return null;
	}

	return nowPlaying
		.getAttribute('data-collect-item')
		.substring(1);
}

const getRandomTrack = () => {
	const randomTrackIndex = parseInt(Math.random() * (tracks.length - 1));
	return tracks[randomTrackIndex].element;
}

const initTracks = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (!isNullOrUndefined(nowPlayingId)) {
		const nowPlayingIndex = tracks.findIndex(({id}) => id === nowPlayingId);
		if (nowPlayingIndex !== tracks.length - 1) {
			return;
		}
	}

	let allTracksOnPage = document.querySelectorAll('li[data-tralbumid]');
	if (tracks.length === allTracksOnPage.length) {
		return;
	}

	const newTracks = Array.from(allTracksOnPage)
		.map(x => ({
			id: x.getAttribute('data-tralbumid'),
			element: x,
			played: false
		}))
		.filter(({id}) => tracks.findIndex(x => x.id === id) === -1);

	tracks = [...tracks, ...newTracks];
}

const clickShowNextButton = () => {
	const showNextButton = document.querySelectorAll('.show-more');
	if (!isNullOrUndefined(showNextButton)) {
		showNextButton.forEach(x => x.click());
		return true;
	}

	return false;
}

const isNullOrUndefined = (value) => value === null || value === undefined;

run();
