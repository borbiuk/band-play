import { ShortcutType } from '@shared/enums';
import { ConfigModel, ShortcutConfig } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { exist } from '@shared/utils/utils.common';
import { mapToHumanString } from '@shared/utils/utils.shortcut';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { AnimatedButton } from './internal/animation-button';

/**
 * ShortcutInput component for managing keyboard shortcuts configuration.
 *
 * This component provides a UI for users to:
 * - View all available keyboard shortcuts
 * - Edit shortcut key combinations
 * - Save changes to configuration
 * - Reset shortcuts to defaults
 *
 * @returns JSX element containing the shortcut configuration interface
 */
export const ShortcutInput = () => {
	/** Current shortcuts configuration */
	const [config, setConfig] = useState<ShortcutConfig>(null);

	/** Currently selected shortcut type for editing */
	const [shortcutType, setShortcutType] = useState<ShortcutType>(null);

	/** Current shortcut value being edited */
	const [shortcutValue, setShortcutValue] = useState<string>('');

	/** Set of keys currently pressed for shortcut recording */
	const [shortcutKeys, setShortcutKeys] = useState<Set<string>>(new Set());

	/** Reference to track currently pressed keys */
	const currentKeys: Set<string> = useRef<Set<string>>(new Set()).current;

	/** Timeout reference for saving shortcuts with debounce */
	let saveShortcutTimeout: NodeJS.Timeout =
		useRef<NodeJS.Timeout>(null).current;

	// Init Config and subscribe on it changes
	useEffect(() => {
		const updateConfig = ({ shortcuts }: ConfigModel) => {
			setConfig(shortcuts);
		};

		configService.getAll().then(updateConfig);
		configService.addListener(updateConfig);
	}, []);

	// Update shortcut displayed value after Type select or Config update
	useEffect(() => {
		if (exist(config) && exist(shortcutType)) {
			const combination = JSON.parse(config[shortcutType]) as string[];
			const humanShortcutValue = combination
				.map((x: string) => mapToHumanString(x))
				.join(' + ');
			setShortcutValue(humanShortcutValue);
		}
	}, [config, shortcutType]);

	const updateShortcutType = (event: ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value as ShortcutType;
		setShortcutType(value);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		const key = event.code;

		if (currentKeys.size === 0 && exist(shortcutValue)) {
			reset();
		}

		if (!currentKeys.has(key)) {
			currentKeys.add(key);
			setShortcutValue(
				Array.from(currentKeys)
					.map((x) => mapToHumanString(x))
					.join(' + ')
			);
			setShortcutKeys(new Set(currentKeys));
		}

		if (exist(saveShortcutTimeout)) {
			clearTimeout(saveShortcutTimeout);
		}
	};

	const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault();

		const key = event.key;

		if (currentKeys.has(key)) {
			currentKeys.delete(key);
		}

		if (currentKeys.size === 0) {
			saveShortcutTimeout = setTimeout(() => {
				setShortcutValue((prev) => prev); // Keep the current value
			}, 100);
		}
	};

	// Clear shortcut input
	const reset = () => {
		currentKeys.clear();
		setShortcutValue('');
		setShortcutKeys(new Set());
	};

	// Update shortcut combination bt selected Type (if empty default will be saved)
	const saveShortcut = async () => {
		config[shortcutType] = JSON.stringify([...shortcutKeys]);
		await configService.update('shortcuts', config);
	};

	return (
		<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-2 pt-4 shadow-md shadow-gray-300">
			<span className="absolute left-1 z-20 -mt-8 rounded-xl p-1 text-base text-gray-500 backdrop-blur-sm">
				Shortcuts
			</span>

			{/* Dropdown for Shortcut Names */}
			<select
				id={'shortcut-type'}
				className="block h-6 w-full cursor-pointer truncate rounded-md border border-band-200 bg-band-100 pl-2 text-left text-sm font-normal tabular-nums text-gray-900 outline-none"
				value={shortcutType || ''}
				onChange={(event) => updateShortcutType(event)}
			>
				<option value="" disabled>
					Select a shortcut
				</option>
				{Object.values(ShortcutType).map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
			</select>

			{/* Input for Shortcut Update */}
			<input
				id={'shortcut-value'}
				type="text"
				className="text-md block h-8 w-full rounded-md border border-band-200 bg-band-100 py-2.5 text-center font-normal tabular-nums text-gray-900 outline-none"
				value={shortcutValue}
				disabled={!shortcutType}
				placeholder="Press keys for shortcut"
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
			/>

			<div className="flex w-full flex-row justify-around gap-2 pt-2">
				<AnimatedButton label="Save" onClick={saveShortcut} />
				<AnimatedButton label="Reset" onClick={reset} />
			</div>
		</div>
	);
};
