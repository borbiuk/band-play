import { MessageCode } from '@shared/enums/message-code';
import messageService from '@shared/services/message-service';
import React from 'react';

import { Button } from './internal/button';

/**
 * Footer component containing action buttons for external links and guide.
 *
 * This component provides buttons for:
 * - GitHub repository link
 * - Donation link (Buy Me a Coffee)
 * - Chrome Web Store rating page
 * - Interactive guide display
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

	/**
	 * Shows the interactive guide by sending a message to the content script.
	 *
	 * @returns Promise that resolves when the message is sent
	 */
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
