import { BatchDownloadFormat } from '@shared/enums';

import { BatchDownloadFileModel } from '../batch-download-file-model';

const FETCH_TIMEOUT_MS = 15000;

/** Thrown when Bandcamp responds with HTTP 429 (too many requests). */
export class BandcampRateLimitError extends Error {
	constructor() {
		super('Bandcamp rate limit (HTTP 429)');
		this.name = 'BandcampRateLimitError';
	}
}

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
	return value
		.replaceAll('&quot;', '"')
		.replaceAll('&#34;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&apos;', "'")
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>');
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
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	let response: Response;
	try {
		response = await fetch(pageUrl, { signal: controller.signal });
	} finally {
		clearTimeout(timeoutId);
	}

	if (response.status === 429) {
		throw new BandcampRateLimitError();
	}

	if (!response.ok) {
		throw new Error(`Bandcamp page fetch failed (HTTP ${response.status})`);
	}

	const html = await response.text();

	const blob = getDataBlob(html);
	if (!blob) {
		return [];
	}

	let json: any;
	try {
		json = JSON.parse(blob);
	} catch (_e) {
		return [];
	}

	const items = Array.isArray(json?.digital_items) ? json.digital_items : [];

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
		if (!url) {
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
