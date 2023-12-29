
// Checkboxes ids.
const checkBoxes = [
	'autoplay',
	'autoscroll',
	'playFirst',
];

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

document.addEventListener('DOMContentLoaded', () => {

	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		const tabId = tabs[0]?.id;

		// Subscribe on checkboxes changes
		checkBoxes.forEach(checkboxId => {
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

		// Initialize checkbox states from local storage
		chrome.storage.local.get([...checkBoxes, 'movingStep'], (result) => {
			checkBoxes.forEach(checkboxId => {
				const checkBox = document.getElementById(checkboxId);
				checkBox.checked = result[checkboxId] || false;
			});

			document.getElementById('movingStep').value = result['movingStep'] || 10;

			//sendStorageChangedMessage(tabId);
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

});
