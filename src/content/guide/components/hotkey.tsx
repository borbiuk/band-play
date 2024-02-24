import React from 'react';

/**
 * Hotkey component for displaying an image representing a keyboard key along with a title and description.
 *
 * @param {string} fileName - The file name of the keyboard key image.
 * @param {string} title - The title or label associated with the hotkey.
 * @param {string} description - The description explaining the functionality of the hotkey.
 */
export const Hotkey = ({ fileName, title, description }) => {
	const getKeyImageUrl = (path: string) =>
		chrome.runtime.getURL(`./assets/keys/${path}`);

	return (
		<div className="flex min-w-56 flex-row items-start gap-x-2 lg:min-w-80 lg:gap-x-4">
			<img
				src={getKeyImageUrl(fileName)}
				alt={fileName}
				className="h-10 w-10"
			/>
			<div className="flex flex-col">
				<span className="text-sm font-medium text-gray-800">
					{title}
				</span>
				<span className="text-xs font-normal text-gray-600">
					{description}
				</span>
			</div>
		</div>
	);
};
