
// Checkboxes ids.
const checkBoxes = {
	autoplay: true,
	autoscroll: true,
	playFirst:  false
}

const checkBoxesIds = Object.keys(checkBoxes);

// Update local storage.
const updateStorage = (key, value) => {
	chrome.storage.local.set({[key]: value});
};

// Send Chrome event about local storage changes.
const sendStorageChangedMessage = (tabId) => {
	chrome.tabs.sendMessage(tabId, {
		code: 'STORAGE_CHANGED',
	});
};

// Configure the config button animations.
const configButton = () => {
	const button = document.getElementById('toggleButton');
	const menu = document.querySelector('.menu');

	button.addEventListener('click', () => {
		menu.classList.toggle('hidden');
		button.classList.toggle('rotated');
	});
};

// Set defaults
const updateConfig = (result) => {
	result.autoplay = utils.exist(result.autoplay) ? Boolean(result.autoplay): true;
	result.autoscroll = utils.exist(result.autoscroll) ? Boolean(result.autoscroll): true;
	result.playFirst = Boolean(result.playFirst);
	result.movingStep = Number(result.movingStep);
	if (isNaN(result.movingStep)) {
		result.movingStep = 10;
	}
	
	console.log(result);
};

// Utility functions used across the codebase.
const utils = {

	// Check if a value does not exist (null, undefined, or empty string).
	notExist: (value) => value === null || value === undefined || value === '',

	// Check if a value exists (not null, undefined, or empty string).
	exist: (value) => !utils.notExist(value),
};

document.addEventListener('DOMContentLoaded', () => {

	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		const tabId = tabs[0]?.id;

		// Subscribe on checkboxes changes
		checkBoxesIds.forEach(checkboxId => {
			const checkBox = document.getElementById(checkboxId);
			checkBox.addEventListener('change', () => {
				updateStorage(checkboxId, Boolean(checkBox.checked));
				sendStorageChangedMessage(tabId);
			});
		});

		// Subscribe on step changes
		const stepInput = document.getElementById('movingStep');
		stepInput.addEventListener('change', (event) => {
			let value = parseInt(event.target.value);
			if (value < 5) {
				event.target.value = 5;
			} else if (value > 60) {
				event.target.value = 60;
			}

			updateStorage('movingStep', Number(event.target.value));
			sendStorageChangedMessage(tabId);
		});

		// Initialize checkbox states from local storage or set default
		chrome.storage.local.get([...checkBoxesIds, 'movingStep'], (result) => {
			updateConfig(result)
			checkBoxesIds.forEach(checkboxId => {
				const checkBox = document.getElementById(checkboxId);
				checkBox.checked = result[checkboxId] || false;
			});

			document.getElementById('movingStep').value = result['movingStep'] || 10;
		});
	});

	const githubButton = document.getElementById('github');
	githubButton.addEventListener('click', () => {
		window.open('https://github.com/borbiuk/band-play', '_blank');
	});

	const buymeacoffeButton = document.getElementById('buymeacoffe');
	buymeacoffeButton.addEventListener('click', () => {
		window.open('https://www.buymeacoffee.com/borbiuk', '_blank');
	});

	const rateButton = document.getElementById('rate');
	rateButton.addEventListener('click', () => {
		window.open('https://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh/reviews', '_blank');
	});

	configButton();

});
