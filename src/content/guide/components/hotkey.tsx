import React from 'react';
import { Page } from '../models/Page';
import { AvailablePages } from './available-pages';

/**
 * Hotkey component for displaying an image representing a keyboard key along with a title and description.
 *
 * @param {string} fileName - The file name of the keyboard key image.
 * @param {string} title - The title or label associated with the hotkey.
 * @param {string} description - The description explaining the functionality of the hotkey.
 * @param {Page} pages - Available pages of the hotkey.
 */
export const Hotkey = ({
	fileName,
	title,
	description,
	pages,
}: {
	fileName: string;
	title: string;
	description: string;
	pages: Page[];
}) => {
	const getKeyImageUrl = (path: string) =>
		chrome.runtime.getURL(`./assets/keys/${path}`);

	return (
		<div className="flex flex-row items-start justify-between gap-x-1 xl:gap-x-2">
			<div className="flex min-w-44 flex-row items-start gap-x-1 lg:gap-x-4">
				<img
					src={getKeyImageUrl(fileName)}
					alt={fileName}
					className="h-10 w-10"
				/>
				<div className="flex flex-col">
					<span className="text-sm font-medium text-gray-800">
						{title}
					</span>
					<span className="text-xs font-normal text-gray-700">
						{description}
					</span>
				</div>
			</div>

			<div className="flex h-10 items-center">
				<AvailablePages pages={pages} />
			</div>
		</div>
	);
};
