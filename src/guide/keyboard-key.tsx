import React from 'react';

export const KeyboardKey = ({ fileName }) => {
	const getSourceUrl = (path: string) => chrome.runtime.getURL(`./assets/keys/${path}`);

	return (
		<img
			src={getSourceUrl(fileName)}
			alt={fileName}
			className="h-10 w-10"
		/>
	);
};
