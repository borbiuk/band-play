import React from 'react';
import { MessageCode } from '@shared/enums/message-code';
import messageService from '@shared/services/message-service';
import { Button } from './internal/button';

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

	const showGuide = async (): Promise<void> => {
		await messageService.sendToActiveContent({
			code: MessageCode.ShowGuide,
		});
	};

	const openMyBandcamp = () =>
		window.open('https://bandcamp.com/borbiuk', '_blank');

	return (
		<div className="flex flex-row justify-between rounded-xl border border-band-200 bg-band-200 p-0.5">
			<Button
				id="GitHub"
				onClick={openGitHub}
				tooltip="GitHub"
				icon="./../assets/github.png"
			/>
			<Button
				id="Donate"
				onClick={openBuyBeACoffee}
				tooltip="Donate"
				icon="./../assets/buymeacoffee.png"
			/>
			<Button
				id="RateExtension"
				onClick={openExtensionPage}
				tooltip="Rate extension"
				icon="./../assets/rate.png"
			/>
			<Button
				id="MyBandcamp"
				onClick={openMyBandcamp}
				tooltip="My bandcamp"
				icon="./../assets/bandcamp.png"
			/>
			<Button
				id="ShowGuide"
				onClick={showGuide}
				tooltip="Show Guide"
				icon="./../assets/guide.png"
			/>
		</div>
	);
};
