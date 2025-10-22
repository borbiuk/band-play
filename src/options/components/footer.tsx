import { MessageCode } from '@shared/enums/message-code';
import messageService from '@shared/services/message-service';
import React from 'react';

import { Button } from './internal/button';

/**
 * Footer component containing action buttons for external links.
 *
 * This component provides buttons for:
 * - GitHub repository link
 * - Donation link (Buy Me a Coffee)
 * - Chrome Web Store rating page
 *
 * @returns JSX element containing the footer with action buttons
 */
export const Footer = () => {
	/**
	 * Opens the GitHub repository in a new tab.
	 */
	const openGitHub = () =>
		window.open('https://github.com/borbiuk/band-play', '_blank');

	/**
	 * Opens the Buy Me a Coffee donation page in a new tab.
	 */
	const openBuyBeACoffee = () =>
		window.open('https://www.buymeacoffee.com/borbiuk', '_blank');

	/**
	 * Opens the Chrome Web Store rating page in a new tab.
	 */
	const openExtensionPage = () =>
		window.open(
			'https://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh/reviews',
			'_blank'
		);

	return (
		<div className="-mt-2 flex flex-row justify-between rounded-xl border border-band-100 bg-band-100 p-2 px-3.5">
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
		</div>
	);
};
