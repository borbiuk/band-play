import { BatchDownloadFileModel } from '../../downloads/batch-download-file-model';

const ILLEGAL_FILENAME_CHARS = /[<>:"/\\|?*%]/g;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
// NBSP family, zero-width and BiDi control characters (RLO filename spoofing).
const INVISIBLE_CHARS = /[\u00a0\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g;
const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const MAX_COMPONENT_LENGTH = 120;

const TOKEN_PATTERN = /\{(\w+)\}/g;

export interface FilenameTemplateData {
	artist?: string;
	title?: string;
	format?: string;
}

/** True when the template contains the {title} token. */
export const hasTitleToken = (template: string): boolean =>
	String(template ?? '').includes('{title}');

/** Makes a single path segment safe for chrome.downloads filenames. */
export const sanitizeFilenameComponent = (value: string): string => {
	let result = String(value ?? '')
		.replace(CONTROL_CHARS, '')
		.replace(INVISIBLE_CHARS, ' ')
		.replace(ILLEGAL_FILENAME_CHARS, '_')
		.trim()
		// Leading dots create hidden files; trailing dots/spaces break Windows.
		.replace(/^\.+/, '')
		.replace(/[.\s]+$/, '');

	if (WINDOWS_RESERVED_NAMES.test(result)) {
		result = `_${result}`;
	}

	if (result.length > MAX_COMPONENT_LENGTH) {
		result = result.slice(0, MAX_COMPONENT_LENGTH).trim();
	}

	return result;
};

/**
 * Renders a filename template ({artist}, {title}, {format} tokens; '/' is a
 * folder separator). Token values are sanitized per segment, so data can
 * never introduce extra folders or path traversal. Returns null when the
 * rendered result has no usable segments.
 */
export const renderFilenameTemplate = (
	template: string,
	data: FilenameTemplateData
): string | null => {
	const values: Record<string, string> = {
		artist: data.artist ?? '',
		title: data.title ?? '',
		format: data.format ?? '',
	};

	const segments = String(template)
		.split('/')
		.map((segment) =>
			sanitizeFilenameComponent(
				segment.replace(TOKEN_PATTERN, (match, token: string) => {
					if (!(token in values)) {
						// Unknown tokens are kept as-is.
						return match;
					}

					return values[token];
				})
			)
		)
		.filter(
			(segment) =>
				segment.length > 0 && segment !== '.' && segment !== '..'
		);

	if (segments.length === 0) {
		return null;
	}

	return segments.join('/');
};

/**
 * Renders the configured template for a resolved download.
 * Returns null when the template is empty (feature disabled), has no {title}
 * token or produces nothing usable — the browser then keeps the
 * server-provided filename. Without {title} different releases get the same
 * name, and every later file would look like a duplicate of the first one.
 */
export const renderConfiguredFilename = (
	template: string,
	download: BatchDownloadFileModel
): string | null => {
	const trimmed = String(template ?? '').trim();
	if (!trimmed) {
		return null;
	}

	if (!hasTitleToken(trimmed)) {
		return null;
	}

	return renderFilenameTemplate(trimmed, {
		artist: download.artist,
		title: download.itemTitle ?? download.title,
		format: download.format,
	});
};
