import React from 'react';
import { createRoot } from 'react-dom/client';
import './popup.scss';

const Popup = () => {
	// Checkboxes ids.
	const checkBoxes = {
		autoplay: true,
		autoscroll: true,
		playFirst: false,
	};

	const checkBoxesIds = Object.keys(checkBoxes);

	// Update local storage.
	const updateStorage = (key, value) => {
		chrome.storage.local.set({ [key]: value });
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
		result.autoplay = utils.exist(result.autoplay)
			? Boolean(result.autoplay)
			: true;
		result.autoscroll = utils.exist(result.autoscroll)
			? Boolean(result.autoscroll)
			: true;
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
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId = tabs[0]?.id;

			// Subscribe on checkboxes changes
			checkBoxesIds.forEach((checkboxId) => {
				const checkBox = document.getElementById(
					checkboxId
				) as HTMLInputElement;
				checkBox.addEventListener('change', () => {
					updateStorage(checkboxId, Boolean(checkBox.checked));
					sendStorageChangedMessage(tabId);
				});
			});

			// Subscribe on step changes
			const stepInput = document.getElementById('movingStep');
			stepInput.addEventListener('change', (event) => {
				const target = event.target as HTMLInputElement;
				let value = parseInt(target.value);
				if (value < 5) {
					target.value = String(5);
				} else if (value > 60) {
					target.value = String(60);
				}

				updateStorage('movingStep', Number(target.value));
				sendStorageChangedMessage(tabId);
			});

			// Initialize checkbox states from local storage or set default
			chrome.storage.local.get([...checkBoxesIds, 'movingStep'], (result) => {
				updateConfig(result);
				checkBoxesIds.forEach((checkboxId) => {
					const checkBox = document.getElementById(
						checkboxId
					) as HTMLInputElement;
					checkBox.checked = result[checkboxId] || false;
				});

				(document.getElementById('movingStep') as HTMLInputElement).value =
					result['movingStep'] || 10;
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
			window.open(
				'https://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh/reviews',
				'_blank'
			);
		});

		configButton();
	});

	return (
		<div
			className="container"
			style={{
				width: '170px',
				padding: '15px 6px 18px',
				display: 'flex',
				justifyContent: 'start',
				alignItems: 'center',
				flexDirection: 'column',
			}}
		>
			{/* Header */}
			<div className="header" id="logo" style={{ marginBottom: '18px' }}>
				{/* Logo */}
				<img src="./../assets/logo-128.png" alt="Bandplay logo"/>
				<span>BandPlay</span>
			</div>

			{/* Toggle Button */}
			<button id="toggleButton" className="round-button">
				<img
					src="./../assets/configuration.png"
					alt="Configuration Icon"
					style={{ height: '28px !important', marginLeft: '-10px' }}
				/>
			</button>

			{/* Menu */}
			<div className="menu">
				{/* Autoplay */}
				<div className="menu-item" style={{ marginBottom: '6px' }}>
					<input type="checkbox" id="autoplay"/>
					<label htmlFor="autoplay">Autoplay</label>
				</div>

				{/* Autoscroll */}
				<div className="menu-item" style={{ marginBottom: '6px' }}>
					<input type="checkbox" id="autoscroll"/>
					<label htmlFor="autoscroll">Enable auto-scroll</label>
				</div>

				{/* Play first */}
				<div className="menu-item" style={{ marginBottom: '6px' }}>
					<input type="checkbox" id="playFirst"/>
					<label htmlFor="playFirst">Play first when error</label>
				</div>

				{/* Playback moving step */}
				<div className="menu-item" style={{ marginBottom: '12px' }}>
					<input type="number" id="movingStep" min="5" max="60"/>
					<label htmlFor="movingStep">Step in seconds</label>
				</div>
			</div>

			{/* Footer */}
			<div className="footer">
				{/* GitHub */}
				<button
					id="github"
					className="button github"
					style={{ padding: '10px 2px !important', marginBottom: '10px' }}
				>
					<img
						src="./../assets/github.png"
						alt="github logo"
						style={{ height: '32px', marginLeft: '30px' }}
					/>
				</button>

				{/* Buy me a Coffee */}
				<button
					id="buymeacoffe"
					className="button buymeacoffe"
					style={{ marginBottom: '10px' }}
				>
					<img src="./../assets/buymeacoffee.png" alt="buymeacoffee logo"/>
					<span>Buy me a coffee</span>
				</button>

				{/* Rate */}
				<button id="rate" className="button buymeacoffe">
					<img
						src="./../assets/rate.png"
						alt="rate logo"
						style={{ marginLeft: '-4px' }}
					/>
					<span style={{ marginLeft: '24px' }}>Rate</span>
				</button>
			</div>
		</div>
	);
};

const root = createRoot(document.getElementById('root')!);

root.render(
	<React.StrictMode>
		<Popup/>
	</React.StrictMode>
);
