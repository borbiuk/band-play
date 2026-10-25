const hasHost = (hostname: string, domain: string): boolean =>
	hostname === domain || hostname.endsWith(`.${domain}`);

const parseHttpsUrl = (value: unknown): URL | null => {
	if (typeof value !== 'string') {
		return null;
	}

	try {
		const url = new URL(value);
		if (url.protocol !== 'https:' || url.username || url.password) {
			return null;
		}

		if (url.port) {
			return null;
		}

		return url;
	} catch {
		return null;
	}
};

/**
 * Check if a value is an https URL of `bandcamp.com` or one of its subdomains.
 *
 * @param value - The value to check
 * @returns True for a Bandcamp page URL, false otherwise
 */
export const isBandcampUrl = (value: unknown): boolean => {
	const url = parseHttpsUrl(value);
	return !!url && hasHost(url.hostname, 'bandcamp.com');
};

/**
 * Check if a value is an https URL of Bandcamp or its CDN (`bcbits.com`).
 *
 * @param value - The value to check
 * @returns True for a Bandcamp file or image URL, false otherwise
 */
export const isBandcampFileUrl = (value: unknown): boolean => {
	const url = parseHttpsUrl(value);
	return (
		!!url &&
		(hasHost(url.hostname, 'bandcamp.com') ||
			hasHost(url.hostname, 'bcbits.com'))
	);
};

/**
 * Check if a URL is a Bandcamp wishlist page (the path ends with `/wishlist`).
 *
 * @param value - The URL to check
 * @returns True for a wishlist page, false otherwise
 */
export const isWishlistUrl = (value: string): boolean => {
	try {
		return new URL(value).pathname
			.replace(/\/+$/, '')
			.endsWith('/wishlist');
	} catch {
		return false;
	}
};
