import { isPlainObject, notExist } from '@shared/utils';

/**
 * Records the filename Chrome chose for each of the extension's own downloads.
 *
 * `downloads.onDeterminingFilename` reports the target name before Chrome adds " (n)" for an existing
 * file, so the runner can tell a real duplicate ("x (1).zip" because "x.zip" exists) from a title that
 * ends with a number. The map is kept in chrome.storage.session to survive MV3 service worker restarts.
 * Firefox has no onDeterminingFilename: nothing is recorded there and the runner checks the downloads list.
 * The filename itself is never changed: the server name is kept.
 */

const EXPECTED_FILENAMES_KEY = 'batchDownloadExpectedFilenames';
const MAX_EXPECTED_FILENAMES = 500;

const isDeterminingFilenameAvailable =
	typeof chrome.downloads?.onDeterminingFilename !== 'undefined';
const isSessionStorageAvailable =
	typeof chrome.storage?.session !== 'undefined';

// Final pre-uniquify basename per browser download id, recorded while Chrome
// determines the filename. Insertion order doubles as LRU order: oldest entries are evicted first.
let expectedFilenames = new Map<number, string>();
let isHydrated = !isSessionStorageAvailable;
let hydration: Promise<void> = null;

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
				const data = await chrome.storage.session.get(
					EXPECTED_FILENAMES_KEY
				);
				const rawExpected = data?.[EXPECTED_FILENAMES_KEY] as unknown;
				if (isPlainObject(rawExpected)) {
					// Entries recorded before hydration finished win over the persisted (older) ones.
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

/** Extracts the basename from an absolute or relative download path. */
export const toBaseFileName = (filename?: string): string => {
	return (filename || '').split('/').pop()?.split('\\').pop() || '';
};

const recordExpectedFilename = (downloadId: number, fileName: string): void => {
	if (!fileName) {
		return;
	}

	expectedFilenames.delete(downloadId);
	expectedFilenames.set(downloadId, fileName);

	while (expectedFilenames.size > MAX_EXPECTED_FILENAMES) {
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
export const registerExpectedFilenameRecorder = (): void => {
	if (!isDeterminingFilenameAvailable) {
		return;
	}

	chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
		// Leave the user's own downloads alone: nothing is recorded
		if (item.byExtensionId !== chrome.runtime.id) {
			return false;
		}

		const respond = (): void => {
			// item.filename is the pre-uniquify target name: remember it so duplicate
			// detection can compare it with the final name. The name itself is kept.
			recordExpectedFilename(item.id, toBaseFileName(item.filename));
			suggest();
		};

		if (isHydrated) {
			respond();
			return false;
		}

		// Respond asynchronously once the persisted map is loaded.
		hydrate()
			.then(respond)
			.catch(() => respond());
		return true;
	});
};
