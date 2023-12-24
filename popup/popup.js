document.addEventListener('DOMContentLoaded', () => {

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const tabId = tabs[0]?.id;

		const autoscrollCheckBox = document.getElementById('autoscroll');
		autoscrollCheckBox.addEventListener('change', () => {
			chrome.storage.local.set({ autoscroll: autoscrollCheckBox.checked });
			chrome.tabs.sendMessage(tabId, {
				code: 'AUTOSCROLL_CHANGED',
			});
		});

		const playFirstCheckBox = document.getElementById('playFirst');
		playFirstCheckBox.addEventListener('change', () => {
			chrome.storage.local.set({ playFirst: playFirstCheckBox.checked });
			chrome.tabs.sendMessage(tabId, {
				code: 'PLAYFIRST_CHANGED',
			});
		});

		// Initialize checkbox states from local storage
		chrome.storage.local.get(['autoscroll', 'playFirst'], (result) => {
			autoscrollCheckBox.checked = result.autoscroll || false;
			playFirstCheckBox.checked = result.playFirst || false;
			chrome.tabs.sendMessage(tabId, {
				code: 'AUTOSCROLL_CHANGED',
			});
			chrome.tabs.sendMessage(tabId, {
				code: 'PLAYFIRST_CHANGED',
			});
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
