import { BatchDownloadFormat } from '@shared/enums';
import { BatchDownloadFileModel } from '@shared/models/batch-download/batch-download-file-model';
import { isBandcampFileUrl, isBandcampUrl } from '@shared/utils';

/** The part of one item of the `data-blob` of a download page that is read here. */
interface DownloadBlobItem {
	killed?: number;
	item_id?: number | string;
	sale_id?: number | string;
	artist?: string;
	title?: string;
	downloads?: Record<string, { url?: string; size_mb?: unknown } | undefined>;
}

/** The part of the `data-blob` of a download page that is read here. */
interface DownloadBlob {
	digital_items?: unknown;
	identities?: { fan?: { verified?: boolean } };
}

const FETCH_TIMEOUT_MS = 15000;

/** The longest `Retry-After` delay that is respected. */
const MAX_RETRY_AFTER_MS = 10 * 60 * 1000;

/** Thrown when Bandcamp responds with HTTP 429 (too many requests). */
export class BandcampRateLimitError extends Error {
	/** Delay from the `Retry-After` header in milliseconds, when Bandcamp sent one. */
	public readonly retryAfterMs?: number;

	constructor(retryAfterMs?: number) {
		super('Bandcamp rate limit (HTTP 429)');
		this.name = 'BandcampRateLimitError';
		this.retryAfterMs = retryAfterMs;
	}
}

/** Reads `Retry-After` (delta seconds or an HTTP date) as a capped delay in milliseconds. */
const parseRetryAfterMs = (header: string | null): number | undefined => {
	if (!header) {
		return undefined;
	}

	const value = header.trim();
	let delayMs: number;
	if (/^\d+$/.test(value)) {
		delayMs = Number.parseInt(value, 10) * 1000;
	} else {
		const date = Date.parse(value);
		if (Number.isNaN(date)) {
			return undefined;
		}

		delayMs = date - Date.now();
	}

	return Math.min(Math.max(delayMs, 0), MAX_RETRY_AFTER_MS);
};

/** Thrown when Bandcamp refuses downloads because the account email is unverified. */
export class BandcampUnverifiedError extends Error {
	constructor() {
		super('Bandcamp account email is not verified');
		this.name = 'BandcampUnverifiedError';
	}
}

/** Parses Bandcamp size strings like "290.7MB" / "1.2GB" into megabytes. */
const parseSizeMb = (raw: unknown): number | undefined => {
	if (typeof raw !== 'string') {
		return undefined;
	}

	const match = raw.trim().match(/^([\d.]+)\s*(KB|MB|GB)?$/i);
	if (!match) {
		return undefined;
	}

	const value = Number.parseFloat(match[1]);
	if (!Number.isFinite(value)) {
		return undefined;
	}

	const unit = (match[2] || 'MB').toUpperCase();
	if (unit === 'GB') {
		return value * 1024;
	}

	if (unit === 'KB') {
		return value / 1024;
	}

	return value;
};

const decodeHtmlAttribute = (value: string): string => {
	return (
		value
			.replaceAll('&quot;', '"')
			.replaceAll('&#34;', '"')
			.replaceAll('&#39;', "'")
			.replaceAll('&apos;', "'")
			.replaceAll('&lt;', '<')
			.replaceAll('&gt;', '>')
			// Last, so an escaped entity such as "&amp;lt;" is decoded only once
			.replaceAll('&amp;', '&')
	);
};

const getDataBlob = (html: string): string | null => {
	// DOMParser is not available in MV3 service workers, so we use a regex-based
	// extractor that works in both extension pages and background.
	const match = html.match(
		/<[^>]*\bid=["']pagedata["'][^>]*\bdata-blob=(["'])([\s\S]*?)\1/i
	);
	if (!match) {
		return null;
	}

	return decodeHtmlAttribute(match[2]);
};

export const parseBandcampDownloads = async (
	pageUrl: string,
	format: BatchDownloadFormat
): Promise<BatchDownloadFileModel[]> => {
	// The URL comes from the page: only Bandcamp pages are fetched
	if (!isBandcampUrl(pageUrl)) {
		throw new Error('Not a Bandcamp download page URL');
	}

	// The timeout covers the headers and the body
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	let html: string;
	try {
		const response = await fetch(pageUrl, { signal: controller.signal });

		if (response.status === 429) {
			throw new BandcampRateLimitError(
				parseRetryAfterMs(response.headers.get('Retry-After'))
			);
		}

		if (!response.ok) {
			throw new Error(
				`Bandcamp page fetch failed (HTTP ${response.status})`
			);
		}

		// A redirect must stay on Bandcamp
		if (response.url && !isBandcampUrl(response.url)) {
			throw new Error('Bandcamp page redirected to another site');
		}

		html = await response.text();
	} finally {
		clearTimeout(timeoutId);
	}

	const blob = getDataBlob(html);
	if (!blob) {
		return [];
	}

	let json: DownloadBlob;
	try {
		json = JSON.parse(blob);
	} catch (_e) {
		return [];
	}

	const items: (DownloadBlobItem | null)[] = Array.isArray(
		json?.digital_items
	)
		? json.digital_items
		: [];

	const downloads: BatchDownloadFileModel[] = [];

	for (const item of items) {
		if (!item) {
			continue;
		}

		if (item.killed === 1) {
			continue;
		}

		const itemDownloads = item.downloads;
		if (!itemDownloads) {
			continue;
		}

		const url = itemDownloads?.[format]?.url;
		if (!url || !isBandcampFileUrl(url)) {
			continue;
		}

		const id = (item.item_id || item.sale_id)?.toString();
		if (!id) {
			continue;
		}

		const artist = String(item.artist || '').trim();
		const title = String(item.title || '').trim();

		const displayTitle =
			artist && title ? `${artist} - ${title}` : artist || title || id;

		downloads.push({
			id,
			title: displayTitle,
			url: String(url),
			progress: 0,
			artist,
			itemTitle: title,
			format,
			sizeMb: parseSizeMb(itemDownloads?.[format]?.size_mb),
		});
	}

	if (
		downloads.length === 0 &&
		json?.identities?.fan?.verified === false &&
		items.length > 0
	) {
		// Bandcamp withholds download URLs until the account email is verified.
		throw new BandcampUnverifiedError();
	}

	return downloads;
};
