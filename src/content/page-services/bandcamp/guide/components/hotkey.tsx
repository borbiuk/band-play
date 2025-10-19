import React from 'react';

import { Page } from '../enums/page';

import { AvailablePages } from './available-pages';

/**
 * Hotkey component for displaying a visual representation of a keyboard key along with a title and description.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.fileName - The name of the file representing the keyboard key image (e.g., an icon).
 * @param {string} props.title - The title or label to identify the keyboard shortcut or hotkey.
 * @param {string} props.description - A detailed description explaining the functionality of the hotkey.
 * @param {Page[]} props.pages - An array of available pages or contexts where the hotkey is applicable.
 *
 * @returns {JSX.Element} The rendered Hotkey component.
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
			<div className="flex min-w-44 flex-row items-start gap-x-1 lg:gap-x-3.5">
				<img
					src={getKeyImageUrl(fileName)}
					alt={fileName}
					className="h-11 w-11"
				/>
				<div className="flex flex-col">
					<span className="text-base font-semibold text-band-900">
						{title}
					</span>
					<span className="text-sm font-normal text-gray-800">
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
