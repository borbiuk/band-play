import React from 'react';
import { ConfigService } from '../common/config-service';
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

	const configService: ConfigService = new ConfigService();
	const showGuide = async (): Promise<void> => {
		await configService.update('showGuide', true);
	}

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
