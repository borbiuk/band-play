import React from 'react';
import { Page } from '../models/Page';
import { PageMark } from './page-mark';

export const AvailablePages = ({ pages }: { pages: Page[] }) => {
	return (
		<div className="ml-1 flex flex-row">
			{Object.keys(Page).map((page, index) =>
				pages.includes(Page[page]) ? (
					<div key={index} className={`-ml-1 z-${100 - index * 10}`}>
						<PageMark page={Page[page]} />
					</div>
				) : (
					<div
						key={index}
						className={`-ml-1 h-4 w-4 z-${100 - index * 10}`}
					></div>
				)
			)}
		</div>
	);
};
