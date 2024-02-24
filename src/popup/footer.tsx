import React from 'react';
import { MessageCode } from '../shared/enums/message-code';
import { MessageService } from '../shared/services/message-service';
import { Button } from './button';

export const Footer = () => {
	const openGitHub = () =>
		window.open('https://github.com/borbiuk/band-play', '_blank');

	const openBuyBeACoffee = () =>
		window.open('https://www.buymeacoffee.com/borbiuk', '_blank');

	const openExtensionPage = () =>
		window.open(
			'https://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh/reviews',
			'_blank'
		);

	const messageService: MessageService = new MessageService();
	const showGuide = async (): Promise<void> => {
		chrome.tabs
			.query({ active: true, currentWindow: true })
			.then(async (tabs) => {
				await messageService.sendToContent(tabs[0].id, {
					code: MessageCode.ShowGuide,
				});
			});
	};

	const openMyBandcamp = () =>
		window.open('https://bandcamp.com/borbiuk', '_blank');

	return (
		<div className="flex flex-col gap-y-3">
			<Button
				onClick={openGitHub}
				text="GitHub"
				icon="./../assets/github.png"
			/>
			<Button
				onClick={openBuyBeACoffee}
				text="Donate"
				icon="./../assets/buymeacoffee.png"
			/>
			<Button
				onClick={openExtensionPage}
				text="Rate extension"
				icon="./../assets/rate.png"
			/>
			<Button
				onClick={openMyBandcamp}
				text="My bandcamp"
				icon="./../assets/bandcamp.png"
			/>
			<Button
				onClick={showGuide}
				text="Show Guide"
				icon="./../assets/guide.png"
			/>
		</div>
	);
};
