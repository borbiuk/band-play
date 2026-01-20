import { BatchDownloadFormat } from '@shared/enums';
import { BatchDownloadFileModel } from '../batch-download-file-model';

const FETCH_TIMEOUT_MS = 15000;

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
	const response = await fetch(pageUrl, { signal: controller.signal });
	clearTimeout(timeoutId);
	const html = await response.text();

	const blob = getDataBlob(html);
	if (!blob) {
		return [];
	}

	let json: any = null;
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
		});
	}

	return downloads;
};
