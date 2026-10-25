const rootConfig = require('../../../../../tailwind.config.js');

/**
 * Tailwind for the feed player only (`@config` in feed-player.scss). It scans just the player's own file,
 * so the content script carries only the utilities the player uses, not every class of the popup and the
 * downloads page. The tokens are the ones of the root config.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
	...rootConfig,
	content: {
		relative: true,
		files: ['./feed-player.tsx'],
	},
};
