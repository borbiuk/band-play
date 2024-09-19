import React from 'react';
import { exist } from '../../../shared/utils/utils.common';
import { Page } from '../models/Page';
import { AvailablePages } from './available-pages';

/**
 * Hotkey component for displaying an image representing a keyboard key along with a title and description.
 *
 * @param {Array} icons - An array of objects containing the icon file name and an optional delimiter.
 * @param {string} title - The title or label associated with the hotkey.
 * @param {string} description - The description explaining the functionality of the hotkey.
 * @param {Page[]} [pages] - Optional available pages of the hotkey.
 */
export const Hotkey = ({
	icons,
	title,
	description,
	pages,
}: {
	icons: { icon: string; delimiter?: string }[];
	title: string;
	description: string;
	pages?: Page[];
}) => {
	const getKeyImageUrl = (path: string) =>
		chrome.runtime.getURL(`./assets/keys/${path}`);

	return (
		<div className="flex w-full flex-row items-start justify-between gap-x-1 xl:gap-x-2">
			<div className="flex flex-row items-start gap-x-1 lg:gap-x-3.5">
				{/* Icons */}
				<div className="flex min-h-8 flex-row gap-x-1 align-middle">
					{icons.map(({ icon, delimiter }, index) => (
						<React.Fragment key={icon}>
							<img
								src={getKeyImageUrl(icon)}
								alt={icon}
								className="max-h-8 min-h-8"
							/>
							{exist(delimiter) && index < icons.length - 1 && (
								<span className="mx-1 text-3xl font-semibold tracking-tighter text-gray-800">
									{delimiter}
								</span>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Content */}
				<div className="flex flex-col">
					<span className="whitespace-nowrap text-base font-semibold text-band-900">
						{title}
					</span>
					<span className="text-sm font-normal text-gray-800">
						{description}
					</span>
				</div>
			</div>

			{pages && (
				<div className="flex h-10 items-center">
					<AvailablePages pages={pages} />
				</div>
			)}
		</div>
	);
};
