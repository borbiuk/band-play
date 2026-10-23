import { exist, notExist } from '@shared/utils';

/**
 * Routes desired filenames to chrome.downloads.onDeterminingFilename.
 *
 * The runner registers a template-rendered base name for a download URL
 * before calling chrome.downloads.download(); when Chrome determines the
 * filename, the router suggests `<baseName><server extension>`. The map is
 * persisted in chrome.storage.session so it survives MV3 service worker
 * restarts. On Firefox (no onDeterminingFilename) the router is inactive and
 * server-provided filenames are kept.
 */

const PENDING_FILENAMES_KEY = 'batchDownloadPendingFilenames';
const EXPECTED_FILENAMES_KEY = 'batchDownloadExpectedFilenames';
const MAX_PENDING_FILENAMES = 500;

const isDeterminingFilenameAvailable =
	typeof chrome.downloads?.onDeterminingFilename !== 'undefined';
const isSessionStorageAvailable =
	typeof chrome.storage?.session !== 'undefined';

// Insertion order doubles as LRU order: oldest entries are evicted first.
let pendingFilenames = new Map<string, string>();
// Final pre-uniquify basename per browser download id, recorded while Chrome
// determines the filename. Used to tell real uniquified duplicates ("x (1).zip"
// created because "x.zip" already exists) apart from titles that legitimately
// end with a parenthesized number.
let expectedFilenames = new Map<number, string>();
let isHydrated = !isSessionStorageAvailable;
let hydration: Promise<void> = null;

const persist = async (): Promise<void> => {
	if (!isSessionStorageAvailable) {
		return;
	}

	try {
		await chrome.storage.session.set({
			[PENDING_FILENAMES_KEY]: Object.fromEntries(pendingFilenames),
		});
	} catch (_e) {
		// ignore
	}
};

const persistExpected = async (): Promise<void> => {
	if (!isSessionStorageAvailable) {
		return;
	}

	try {
		await chrome.storage.session.set({
			[EXPECTED_FILENAMES_KEY]: Object.fromEntries(expectedFilenames),
		});
	} catch (_e) {
		// ignore
	}
};

const hydrate = (): Promise<void> => {
	if (isHydrated) {
		return Promise.resolve();
	}

	if (notExist(hydration)) {
		hydration = (async () => {
			try {
				const data = await chrome.storage.session.get([
					PENDING_FILENAMES_KEY,
					EXPECTED_FILENAMES_KEY,
				]);
				const raw = data?.[PENDING_FILENAMES_KEY] as unknown;
				if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
					// Entries registered before hydration finished win over
					// the persisted (older) ones.
					const registeredMeanwhile = pendingFilenames;
					pendingFilenames = new Map(
						Object.entries(raw as Record<string, string>)
					);
					for (const [url, name] of registeredMeanwhile) {
						pendingFilenames.delete(url);
						pendingFilenames.set(url, name);
					}
				}

				const rawExpected = data?.[EXPECTED_FILENAMES_KEY] as unknown;
				if (
					rawExpected &&
					typeof rawExpected === 'object' &&
					!Array.isArray(rawExpected)
				) {
					const recordedMeanwhile = expectedFilenames;
					expectedFilenames = new Map(
						Object.entries(
							rawExpected as Record<string, string>
						).map(([id, name]) => [Number(id), name] as const)
					);
					for (const [id, name] of recordedMeanwhile) {
						expectedFilenames.delete(id);
						expectedFilenames.set(id, name);
					}
				}
			} catch (_e) {
				// ignore
			}

			isHydrated = true;
		})();
	}

	return hydration;
};

export const registerDesiredFilename = async (
	url: string,
	baseName: string
): Promise<void> => {
	await hydrate();

	// Delete before set to refresh the entry's position in the LRU order.
	pendingFilenames.delete(url);
	pendingFilenames.set(url, baseName);

	while (pendingFilenames.size > MAX_PENDING_FILENAMES) {
		const oldest = pendingFilenames.keys().next().value;
		pendingFilenames.delete(oldest);
	}

	await persist();
};

export const unregisterDesiredFilename = async (url: string): Promise<void> => {
	await hydrate();

	if (pendingFilenames.delete(url)) {
		await persist();
	}
};

const takeDesiredFilename = (
	item: chrome.downloads.DownloadItem
): string | null => {
	const key = [item.url, item.finalUrl].find(
		(url) => exist(url) && pendingFilenames.has(url)
	);
	if (notExist(key)) {
		return null;
	}

	const baseName = pendingFilenames.get(key);
	pendingFilenames.delete(key);
	persist().catch(() => void 0);
	return baseName ?? null;
};

/** Extracts the basename from an absolute or relative download path. */
export const toBaseFileName = (filename?: string): string => {
	return (filename || '').split('/').pop()?.split('\\').pop() || '';
};

const inferExtension = (filename?: string): string => {
	const name = toBaseFileName(filename);
	const match = name.match(/(\.[A-Za-z0-9]{1,8})$/);
	if (match) {
		return match[1];
	}

	// Bandcamp bulk downloads default to zip archives.
	return '.zip';
};

const recordExpectedFilename = (downloadId: number, fileName: string): void => {
	if (!fileName) {
		return;
	}

	expectedFilenames.delete(downloadId);
	expectedFilenames.set(downloadId, fileName);

	while (expectedFilenames.size > MAX_PENDING_FILENAMES) {
		const oldest = expectedFilenames.keys().next().value;
		expectedFilenames.delete(oldest);
	}

	persistExpected().catch(() => void 0);
};

/**
 * Returns the pre-uniquify basename recorded for a browser download, or null
 * when unknown (Firefox, or the entry was evicted).
 */
export const getExpectedFilename = async (
	downloadId: number
): Promise<string | null> => {
	await hydrate();

	return expectedFilenames.get(downloadId) ?? null;
};

const escapeRegExp = (value: string): string => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Returns true when `actualBaseName` is a uniquified variant of
 * `expectedBaseName`, i.e. Chrome appended " (n)" before the extension
 * because a file with the expected name already existed.
 */
export const isUniquifiedVariantOf = (
	expectedBaseName: string,
	actualBaseName: string
): boolean => {
	if (!expectedBaseName || !actualBaseName) {
		return false;
	}

	if (actualBaseName === expectedBaseName) {
		return false;
	}

	const extensionMatch = expectedBaseName.match(/(\.[A-Za-z0-9]{1,8})$/);
	const extension = extensionMatch ? extensionMatch[1] : '';
	const stem = extension
		? expectedBaseName.slice(0, -extension.length)
		: expectedBaseName;

	const uniquifiedPattern = new RegExp(
		`^${escapeRegExp(stem)} \\(\\d+\\)${escapeRegExp(extension)}$`
	);
	return uniquifiedPattern.test(actualBaseName);
};

/** Registers the top-level onDeterminingFilename listener (Chrome only). */
export const registerFilenameRouter = (): void => {
	if (!isDeterminingFilenameAvailable) {
		return;
	}

	chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
		// Leave the user's own downloads alone: no renaming, nothing recorded
		if (item.byExtensionId !== chrome.runtime.id) {
			return false;
		}

		const respond = (): void => {
			const baseName = takeDesiredFilename(item);
			if (notExist(baseName)) {
				// item.filename is the pre-uniquify target name: remember it
				// so duplicate detection can compare against the final name.
				recordExpectedFilename(item.id, toBaseFileName(item.filename));
				suggest();
				return;
			}

			const fileName = `${baseName}${inferExtension(item.filename)}`;
			recordExpectedFilename(item.id, fileName);
			suggest({
				filename: fileName,
				conflictAction: 'uniquify',
			});
		};

		if (isHydrated) {
			respond();
			return false;
		}

		// Suggest asynchronously once the persisted map is loaded.
		hydrate()
			.then(respond)
			.catch(() => respond());
		return true;
	});
};
