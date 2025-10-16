import { MessageCode } from '@shared/enums/message-code';
import messageService from '@shared/services/message-service';
import React from 'react';

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
		await messageService.sendToActiveContent<boolean>({
			code: MessageCode.ShowGuide,
			data: true,
		});
	};

	return (
		<div className="-mt-2 flex flex-row justify-between rounded-xl border border-band-200 bg-band-200 p-0.5 px-2">
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
				id="ShowGuide"
				onClick={showGuide}
				tooltip="Show Guide"
				icon="./../assets/guide.png"
			/>
		</div>
	);
};
