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

// Step of track moving in seconds.
let movingStep = 10;

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
			const control = document.querySelector('.progress-bar');
			if (utils.notExist(control)) {
				return;
			}

			const rect = control.getBoundingClientRect();
			const x = rect.left + (rect.width * (percentage / 100));
			const clickEvent = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window,
				clientX: x,
				clientY: rect.top + (rect.height / 2) // Middle of the element vertically
			});

			// Dispatch the event to the seek control outer element
			control.dispatchEvent(clickEvent);
		},

		// Function to calculate the playback percentage of the current track.
		calculateTimePercentage: (add = 0) => {

			// Retrieve the time strings
			const durationStr = document.querySelector('.pos-dur [data-bind="text: durationStr"]').textContent;
			const positionStr = document.querySelector('.pos-dur [data-bind="text: positionStr"]').textContent;

			// Convert time strings to seconds
			const durationInSeconds = utils.convertTimeToSeconds(durationStr);
			let positionInSeconds = utils.convertTimeToSeconds(positionStr) + add;
			if (positionInSeconds < 0) {
				positionInSeconds = 0;
			}
			else if (positionInSeconds > durationInSeconds) {
				positionInSeconds = durationInSeconds;
			}

			// Calculate the percentage
			return (positionInSeconds / durationInSeconds) * 100;
		},

		// Move track back or forward on 'movingStep' seconds.
		move: (forward) => {
			const percentage = collection.percentage.calculateTimePercentage(forward ? movingStep : -movingStep);
			collection.percentage.click(percentage);
		},
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

	// Check that url is an album or track page url.
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
			const toX = controlRect.left + ((controlRect.width - thumbRect.width) * (percentage / 100));
			const toY = controlRect.top + (controlRect.height / 2);

			utils.drugElement(thumb, fromX, fromY, toX, toY);
		},

		move: (forward) => {

			// Retrieve the time strings
			const positionStr = document.querySelector('.time_elapsed').textContent;
			const durationStr = document.querySelector('.time_total').textContent;

			// Convert time strings to seconds
			const positionInSeconds = utils.convertTimeToSeconds(positionStr);
			const durationInSeconds = utils.convertTimeToSeconds(durationStr);

			let nextPositionInSeconds = positionInSeconds + (forward ? movingStep : -movingStep);
			if (nextPositionInSeconds < 0) {
				nextPositionInSeconds = 0;
			}
			else if (nextPositionInSeconds > durationInSeconds) {
				nextPositionInSeconds = durationInSeconds;
			}

			const percentage = (nextPositionInSeconds / durationInSeconds) * 100;
			album.percentage.click(percentage);
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

	// Convert time string (00:00) to seconds.
	convertTimeToSeconds: (timeStr) => {
		const parts = timeStr.split(':');
		const minutes = parseInt(parts[0], 10);
		const seconds = parseInt(parts[1], 10);
		return (minutes * 60) + seconds;
	},

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
		return true;
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
	else if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
		const forward = event.code === 'ArrowRight';

		if (album.checkUrl(url)) {
			album.percentage.move(forward);
		}
		else if (collection.checkUrl(url)) {
			collection.percentage.move(forward);
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
		chrome.storage.local.get(['autoplay', 'autoscroll', 'playFirst', 'movingStep'], (result) => {
			autoplay = Boolean(result.autoplay);
			autoscroll = Boolean(result.autoscroll);
			playFirst = Boolean(result.playFirst);
			movingStep = Number(result.movingStep);
		});
	}
});

// Init configuration form local storage.
chrome.storage.local.get(['autoplay', 'autoscroll', 'playFirst', 'movingStep'], (result) => {
	autoplay = Boolean(result.autoplay);
	autoscroll = Boolean(result.autoscroll);
	playFirst = Boolean(result.playFirst);
	movingStep = Number(result.movingStep);
});

// #####################################################################################################################
//
// #####################################################################################################################


const BandcampVolume = {
	_range: null, // Input range slider (object)
	_audioTags: [], // Audio tags (object array)
	_volSpeaker: null, // Speaker button  (object)
	_lastVol: 0.85, // Last saved volume (float)
	_muteValue: null, // volSpeaker next volume (float)
	_saveVol: null, // Whether or not to save volume (bool)
	_slider_change: function (newVolume) // Set the audio players to slider value (on event)
	{
		// Set every audio tag's volume to the new volume
		for (let i = 0; i < this._audioTags.length; i++) {
			this._audioTags[i].volume = newVolume;
		}

		// Set the speaker icon to the new volume
		this._volSpeaker_set(newVolume);
	},
	_setVolume: function (newVolume) {
		// Set every audio tag's volume to the new volume
		for (let i = 0; i < this._audioTags.length; i++) {
			this._audioTags[i].volume = newVolume;
		}

		// Set the slider to the new volume (For when Mute / Un-Mute button is pressed)
		this._range.value = newVolume;

		// Set the speaker icon to the new volume
		this._volSpeaker_set(newVolume);

		// Put it in Chrome's local storage for global persistance if the save volume option is enabled
		if (this._saveVol) chrome.storage.local.set({"volume": newVolume});

		// If action was 'Mute', set 'Un-Mute' value to the 'last volume' (previous volume before muting)
		if (newVolume === 0) {
			this._muteValue = this._lastVol;
			// If changed to something above '0', set the 'mute' value to '0' and save new volume as the new 'last volume'
		} else if (newVolume > 0) {
			this._muteValue = 0;
			this._lastVol = newVolume;
		}
	},
	_auto_set: function () // On page load set initial volume
	{
		const bcv = this;
		// Set the volume on page load to either the last stored volume or the default volume of the audio players
		chrome.storage.local.get("volume", function (items) {
			let newVolume = items["volume"] || bcv._audioTags[0].volume;

			// JS doesn't distinguish '0' and 'false' unless you tell it to, so make sure it's not just been muted instead of not being set
			if (items["volume"] === 0) newVolume = 0;

			// Set the audio players to the initial volume
			for (let i = 0; i < bcv._audioTags.length; i++) {
				bcv._audioTags[i].volume = newVolume;
			}

			// Set the slider to the initial volume
			bcv._range.value = newVolume;

			// Set the speaker icon to the initial volume
			bcv._volSpeaker_set(newVolume);

			// If initial volume is above '0' set the 'mute' value to '0' and set the 'last volume' to the initial volume
			if (newVolume > 0) {
				bcv._lastVol = newVolume;
				bcv._muteValue = 0;
				// Otherwise set 'Un-Mute' value to default '0.85' and the 'last volume' will automatically set once Un-Muted
			} else {
				bcv._muteValue = 0.85;
			}
		});
	},
	_volSpeaker_set: function (newVolume) // Set speaker button icon based on volume level
	{
		// Set a base class so the string doesn't need to be repeated 4 times
		const classBase = "BandcampVolume_speaker BandcampVolume_icon_volume_";

		// If Un-Muting (or at least changing the volume without setting to '0') set the speaker button's title to 'Mute'
		if (newVolume > 0) {
			this._volSpeaker.title = "Mute";

			// Set class according to volume level
			if (newVolume > 0.66) {
				this._volSpeaker.className = classBase + "high";
			} else if (newVolume > 0.33) {
				this._volSpeaker.className = classBase + "med";
			} else if (newVolume > 0) {
				this._volSpeaker.className = classBase + "low";
			}

			// If Muting, set the speaker button title to 'Mute'
		} else if (newVolume === 0) {
			this._volSpeaker.className = classBase + "mute";
			this._volSpeaker.title = "Un-Mute";
		}
	},
	_this_page: function () // Return the identified page name
	{
		// If there is no Artist or Label subdomain
		if (document.URL.match(/\/bandcamp.com\//g) == "/bandcamp.com/") {
			if (document.getElementsByTagName("title")[0].text == "Bandcamp")
				return "home"; // Homepage (/)
			else if (document.getElementsByTagName("title")[0].text.match(/Discover/g) == "Discover")
				return "discover"; // Discover Page (/discover)
			else if (document.getElementsByTagName("title")[0].text.match(/Music/g) == "Music")
				return "feed"; // User Feed (/username/feed)
			else if (document.getElementsByTagName("title")[0].text.match(/collection/g) == "collection")
				return "collection"; // User Collection (/username)

			// If there is an Artist or Label subdomain
		} else {
			return "user"; // Album, Artist or Label page
		}

		return null;
	},
	_containerResize: function () // Set volume slider location based on bandcamp page container width
	{
		// Container is different on the homepage than on every other page, so find out which page it is
		let wrapper;
		if (this._this_page() === "home") {
			wrapper = document.getElementsByClassName("home-bd")[0];
		} else {
			wrapper = document.getElementById("centerWrapper");
		}

		// Find the page containers width and set the slider outer container to that width
		const wrapper_style = (wrapper.currentStyle || window.getComputedStyle(wrapper, null));
		const outerContainer = document.getElementsByClassName("BandcampVolume_outer_container")[0];
		outerContainer.style.width = wrapper_style.width;
	},
	_updateSavedVolume: function (saveVol) {
		this._saveVol = saveVol;
		if (saveVol) {
			chrome.storage.local.set({"volume": this._lastVol});
		} else {
			chrome.storage.local.clear();
		}
	},
	load: function () // Main function
	{
		// Make document variable as some functions need it this way (but use this variable for every call instead of 'this')
		const bcv = this;

		// Check to see if the options have updated since the last page load (If they have, they will not apply until the page has finished loading - this is due to chrome.storage being asynchronous)
		window.addEventListener("load", function () {
			chrome.storage.sync.get(items => {
				if (items.saveVolume !== null && items.saveVolume !== undefined) {
					bcv._updateSavedVolume(items.saveVolume);
				}
			});
		});
		//
		// Listen to see if the volume is changed in chrome.storage, or if the options are updated in chrome.storage.
		chrome.storage.onChanged.addListener((changes, name) => {
			if (changes.saveVolume != null && name === "sync") {
				bcv._updateSavedVolume(changes.saveVolume.newValue);
			}
		});

		// Find all audio players on the current page and put into object array
		bcv._audioTags = Array.prototype.slice.call(document.getElementsByTagName("audio"));

		// If there are no audio players then don't display Bandcamp Volume
		if (bcv._audioTags.length === 0) {
			return
		}

		// Find out which page is loaded
		const page = bcv._this_page();

		// Retrieve last saved options from localStorage (Saving them in localStorage means they can be loaded synchronously, and then applied while the page is still loading)
		// The default settings are both true unless the localStorage values are set or the chrome.storage value is updated (This will auto update localStorage and the local variable via _syncVolOptions)
		//bcv._saveVol = localStorage.getItem("saveVolume") || true

		// Create input slider and set attributes
		bcv._range = document.createElement("input");
		bcv._range.className = "BandcampVolume_range";
		bcv._range.type = "range";
		bcv._range.max = 1;
		bcv._range.step = 0.01;
		bcv._range.min = 0;

		// Listen for if the slider value is changed, set the audio volume and chrome storage value accordingly
		// (An 'input' event fires the moment the slider changes value, a 'change' event only fires when slider is un-clicked)
		// If we stored the value on 'input' event, this screws up the chrome.storage event listener, as you're trying to change the value while chrome is also trying to change the value
		bcv._range.addEventListener("input", event => {
			bcv._slider_change(event.target.value);
		});

		bcv._range.addEventListener("change", event => {
			bcv._setVolume(event.target.value);
		});

		// Create speaker button and place in object variable
		bcv._volSpeaker = document.createElement("button");
		bcv._volSpeaker.type = "button";

		// Auto set initial volume and objects
		bcv._auto_set();

		// Listen for if the speaker button is clicked, if so set the audio volume to the muteValue variable and put it in chrome storage
		bcv._volSpeaker.addEventListener("click", () => {
			bcv._setVolume(bcv._muteValue);
		});


		// Create main container div for volume slider and append the speaker button & volume slider to it
		const volumeContainer = document.createElement("div");
		volumeContainer.appendChild(bcv._volSpeaker);
		volumeContainer.appendChild(bcv._range);

		// If current page is an Album, Artist or Label page then set styles and insert slider accordingly
		if (page === "user") {
			volumeContainer.className = "BandcampVolume_user_container";

			const desktop_view = document.getElementsByClassName("inline_player")[0];
			desktop_view.querySelector("tr:first-child td:first-child").setAttribute("rowspan", "3");

			const row = document.createElement("tr");
			const col = row.appendChild(document.createElement("td"));
			col.setAttribute("colspan", "3");
			col.appendChild(volumeContainer);

			// Inject Bandcamp Volume into page
			desktop_view.querySelector("tbody").appendChild(row);

			// If current page is any other page then set styles and insert slider accordingly
		} else {
			bcv._range.className = bcv._range.className + " BandcampVolume_range_home";

			volumeContainer.className = "BandcampVolume_container";

			const outerContainer = document.createElement("div");
			outerContainer.className = "BandcampVolume_outer_container";

			const innerContainer = document.createElement("div");
			innerContainer.className = "BandcampVolume_inner_container";

			const volHover = document.createElement("div");
			volHover.className = "BandcampVolume_hoverBox";
			volHover.className = volHover.className + " icon-volume";

			innerContainer.appendChild(volumeContainer);
			innerContainer.appendChild(volHover);
			outerContainer.appendChild(innerContainer);

			// Set wrapper to append to based on type of container (As mentioned before, the homepage has a different container than the other pages)
			let wrapper = page === "home"
				? document.getElementsByClassName("home-bd")[0]
				: document.getElementById("centerWrapper");

			// Inject Bandcamp Volume into page
			wrapper.appendChild(outerContainer);

			// Make sure slider outer container is the same width as the page container, and listen to see if the page container changes width
			bcv._containerResize();
			window.addEventListener("resize", () => {
				bcv._containerResize();
			});
		}
	}
};

BandcampVolume.load();
