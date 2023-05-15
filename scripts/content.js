const run = () => {
	log("[Start]");
	let i = 0;
	setInterval(function () {
		log('[INFO]:\t\t\t- execute cycle [' + i++ + ']');
		try {
			tryPlayNextTrack();
		} catch (e) {
			log(e);
		}
	}, 2000);
}

const tryPlayNextTrack = () => {
	if (getPlayingTrackProgress() < 98) {
		return;
	}

	getNextTrackToPlayElement()?.click();
}

const getPlayingTrackProgress = () => {
	const divToWatch = document.querySelector('div.seek-control');
	const left = divToWatch?.style?.left;

	if (left === undefined || left === null) {
		log('[NOT FOUND]:\t- player');
		return null;
	}

	const leftValue = parseFloat(left);

	log('[INFO]:\t\t\t- track progress(' + leftValue + ')');

	return leftValue;
}

const getNextTrackToPlayElement = () => {
	const nowPlayingId = getNowPlayingTrackId();
	if (nowPlayingId === null) {
		return null;
	}

	const allTracks = document.querySelectorAll('a[data-trackid]');

	for (let i = 0; i < allTracks.length; i++) {
		const id = allTracks[i].getAttribute('data-trackid');
		if (id === nowPlayingId && i !== allTracks.length - 1) {
			log('[INFO]:\t\t\t- Next track index [' + i + ']');
			return allTracks[i + 1];
		}
	}

	const randomTrackIndex = parseInt(Math.random() * (allTracks.length - 1));
	const randomTrack = allTracks[randomTrackIndex];
	if (randomTrack) {
		log('[INFO]:\t\t\t- Next track index [' + randomTrackIndex + ']');
		return randomTrack;
	}

	log('[NOT FOUND]:\t- next track to play');

	return null;
}

const getNowPlayingTrackId = () => {
	const nowPlaying = document.querySelectorAll('div[data-collect-item]');
	if (nowPlaying.length === 0) {
		log('[NOT FOUND]:\t- now playing')
		return null;
	}

	const nowPlayingId = nowPlaying[0]
		.getAttribute('data-collect-item')
		.substring(1);

	log('[INFO]:\t\t\t- Now playing Id = ' + nowPlayingId);

	return nowPlayingId;
}

const log = (message) => {
	console.log('%cAUTOPLAY log: %c' + message, 'background: #202124; color: #1BA0C3', 'background: #202124; color: white');
}

run();
