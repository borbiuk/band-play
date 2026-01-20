import React from 'react';
import { createRoot } from 'react-dom/client';

import './downloads.scss';
import { DownloadsApp } from './downloads-app';

const Downloads = () => {
	return <DownloadsApp />;
};

const root = createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
		<Downloads />
	</React.StrictMode>
);
