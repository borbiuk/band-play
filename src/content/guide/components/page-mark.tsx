import React from 'react';
import { Page } from '../models/Page';

export const PageMark = ({ page }: { page: Page }) => {
	const getColor = (page: Page) => {
		switch (page) {
			case Page.Collection:
				return 'bg-lime-500/50';
			case Page.Album:
				return 'bg-green-500/50';
			case Page.Feed:
				return 'bg-sky-500/50';
			case Page.Discover:
				return 'bg-indigo-500/50';
		}
	};
	return <div className={`h-4 w-4 rounded-full ${getColor(page)}`}></div>;
};
