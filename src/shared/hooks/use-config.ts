import { ConfigModel } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { useCallback, useEffect, useState } from 'react';

/** Saves one setting. The screen shows the new value at once; nothing is written until this is called. */
export type UpdateConfig = <K extends keyof ConfigModel>(
	key: K,
	value: ConfigModel[K]
) => void;

export interface ConfigState {
	// The settings, or null until they are loaded.
	config: ConfigModel | null;

	// Saves one setting.
	update: UpdateConfig;
}

/**
 * Loads the settings, follows their changes (also from other pages) and saves single keys.
 * Saving happens only from a user action: the hook never writes by itself.
 *
 * @returns The settings and the update function.
 */
export const useConfig = (): ConfigState => {
	const [config, setConfig] = useState<ConfigModel | null>(null);

	useEffect(() => configService.watch(setConfig), []);

	const update = useCallback(
		<K extends keyof ConfigModel>(key: K, value: ConfigModel[K]) => {
			setConfig((current) =>
				current === null ? current : { ...current, [key]: value }
			);
			configService.update(key, value).catch((e) => console.error(e));
		},
		[]
	);

	return { config, update };
};
