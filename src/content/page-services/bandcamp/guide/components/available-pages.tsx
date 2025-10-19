import React from 'react';

import { Page } from '../enums/page';

import { PageMark } from './page-mark';

export const AvailablePages = ({ pages }: { pages: Page[] }) => {
	return (
		<div className="ml-1 mt-6 flex flex-col lg:mt-0 lg:flex-row">
			{Object.keys(Page).map((page, index) =>
				pages.includes(Page[page]) ? (
					<div
						key={page}
						className={`-mt-1 lg:-ml-1 lg:-mr-0 z-${100 - index * 10}`}
					>
						<PageMark page={Page[page]} />
					</div>
				) : (
					<div
						key={page}
						className={`lg:-ml mt-1 h-4 w-4 lg:-mr-0 z-${100 - index * 10}`}
					></div>
				)
			)}
		</div>
	);
};
