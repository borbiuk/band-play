import { renderErrorOptions } from '@shared/utils/render-error.utils';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './downloads.scss';
import { DownloadsApp } from './downloads-app';

const Downloads = () => {
	return <DownloadsApp />;
};

const container = document.getElementById('root');
const root = createRoot(container, renderErrorOptions(container, 'downloads'));

root.render(
	<React.StrictMode>
		<Downloads />
	</React.StrictMode>
);
