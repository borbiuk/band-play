import { useEffect, useState } from 'react';

/**
 * A value of `chrome.storage.local`, kept up to date (also when another page changes it) while the
 * component is mounted. The hook never writes anything.
 *
 * @param key - The storage key.
 * @param normalize - Turns the raw stored value (any shape, also a missing one) into `T`; declare it outside the component.
 * @returns The value, or null until it has been read.
 */
export const useStorageValue = <T>(
	key: string,
	normalize: (raw: unknown) => T
): T | null => {
	const [value, setValue] = useState<T | null>(null);

	useEffect(() => {
		const load = async () => {
			const data = await chrome.storage.local.get(key);
			setValue(normalize(data[key]));
		};

		load().catch((e) => console.error(e));

		const onChanged = (
			changes: Record<string, chrome.storage.StorageChange>
		) => {
			if (key in changes) {
				load().catch((e) => console.error(e));
			}
		};

		chrome.storage.local.onChanged.addListener(onChanged);
		return () => chrome.storage.local.onChanged.removeListener(onChanged);
	}, [key, normalize]);

	return value;
};
