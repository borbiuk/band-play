import React from 'react';
import { Page } from '../models/Page';
import { PageMark } from './page-mark';

export const PagesNote = () => {
	return (
		<div className="flex flex-row justify-around gap-x-2 rounded-xl bg-band-200/75 py-2 text-sm font-medium text-gray-800 shadow-md shadow-gray-400 duration-300">
			<div className="flex flex-row items-center gap-x-1">
				<PageMark page={Page.Collection} />
				<span className="mb-[1px]">{Page.Collection}</span>
			</div>

			<div className="flex flex-row items-center gap-x-1">
				<PageMark page={Page.Album} />
				<span className="mb-[1px]"> {Page.Album} </span>
			</div>

			<div className="flex flex-row items-center gap-x-1">
				<PageMark page={Page.Feed} />
				<span className="mb-[1px]">{Page.Feed}</span>
			</div>

			<div className="flex flex-row items-center gap-x-1">
				<PageMark page={Page.Discover} />
				<span className="mb-[1px]">{Page.Discover}</span>
			</div>
		</div>
	);
};
