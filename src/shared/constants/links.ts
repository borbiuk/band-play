export const GITHUB_URL = 'https://github.com/borbiuk/band-play';

export const DONATE_URL = 'https://www.buymeacoffee.com/borbiuk';

const CHROME_STORE_REVIEWS_URL =
	'https://chromewebstore.google.com/detail/bandcamp-play/nooegmjcddclidfdlibmgcpaahkikmlh/reviews';

/**
 * The page where users rate the extension.
 *
 * @returns The Chrome Web Store reviews page, or null in Firefox, where the extension has no store page yet.
 */
export const getRateUrl = (): string | null =>
	chrome.runtime.getURL('').startsWith('moz-extension:')
		? null
		: CHROME_STORE_REVIEWS_URL;
