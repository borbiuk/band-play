import React from 'react';

import { ImageButton } from './button';

type ExternalLinksButtonsProps = {
	githubId: string;
	donateId: string;
	rateId: string;
};

const ExternalLinksButtons = ({
	githubId,
	donateId,
	rateId,
}: ExternalLinksButtonsProps) => {
	const openGitHub = () =>
		window.open('https://github.com/borbiuk/band-play', '_blank');
	const openBuyMeACoffee = () =>
		window.open('https://www.buymeacoffee.com/borbiuk', '_blank');
	const openExtensionPage = () =>
		window.open(
			'https://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh/reviews',
			'_blank'
		);

	return (
		<>
			<ImageButton
				id={githubId}
				onClick={openGitHub}
				tooltip="GitHub"
				image="./../assets/github.png"
			/>
			<ImageButton
				id={donateId}
				onClick={openBuyMeACoffee}
				tooltip="Donate"
				image="./../assets/buymeacoffee.png"
			/>
			<ImageButton
				id={rateId}
				onClick={openExtensionPage}
				tooltip="Rate extension"
				image="./../assets/rate.png"
			/>
		</>
	);
};

export const ExternalLinksPopup = () => {
	return (
		<div className="flex flex-row justify-between px-4">
			<ExternalLinksButtons
				githubId="GitHub"
				donateId="Donate"
				rateId="RateExtension"
			/>
		</div>
	);
};

export const ExternalLinksInline = () => {
	return (
		<div className="flex flex-row gap-x-8">
			<ExternalLinksButtons
				githubId="downloads-github"
				donateId="downloads-donate"
				rateId="downloads-rate"
			/>
		</div>
	);
};
