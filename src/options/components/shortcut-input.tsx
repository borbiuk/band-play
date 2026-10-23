import { LabelButton } from '@shared/components/button';
import { ShortcutType } from '@shared/enums';
import { ConfigModel, ShortcutConfig } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { exist, notExist } from '@shared/utils/guard.utils';
import {
	mapShortcutToString,
	mapToHumanString,
} from '@shared/utils/shortcut.utils';
import React, { ChangeEvent, useEffect, useState } from 'react';

/** Physical modifier keys (`event.code`); they are read from the event flags instead. */
const MODIFIER_CODES = [
	'ShiftLeft',
	'ShiftRight',
	'ControlLeft',
	'ControlRight',
	'AltLeft',
	'AltRight',
	'MetaLeft',
	'MetaRight',
];

/**
 * Keys that browsers and text fields use with Control / Meta: copy, paste, cut, select all,
 * undo, redo, find, print, save, tabs, reload, address bar, windows, history, bookmarks,
 * downloads, developer tools, switch to tab 1–9 and zoom.
 */
const CONTROL_META_RESERVED_CODES = [
	'KeyA',
	'KeyB',
	'KeyC',
	'KeyD',
	'KeyE',
	'KeyF',
	'KeyG',
	'KeyH',
	'KeyI',
	'KeyJ',
	'KeyK',
	'KeyL',
	'KeyN',
	'KeyO',
	'KeyP',
	'KeyQ',
	'KeyR',
	'KeyS',
	'KeyT',
	'KeyU',
	'KeyV',
	'KeyW',
	'KeyX',
	'KeyY',
	'KeyZ',
	'Digit0',
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Equal',
	'Minus',
	'Tab',
	'Space',
	'PageUp',
	'PageDown',
	'F4',
];

/** Keys the browser takes even without a modifier (reload, full screen, developer tools). */
const ALWAYS_RESERVED_CODES = ['F5', 'F11', 'F12'];

/** Keys Alt uses for the address bar, menus and the home page on Windows and Linux. */
const ALT_RESERVED_CODES = [
	'ArrowLeft',
	'ArrowRight',
	'KeyD',
	'KeyE',
	'KeyF',
	'Home',
];

/** The combination of a key press: held modifiers first, then the main key (if any). */
const toCombination = (
	event: React.KeyboardEvent<HTMLInputElement>
): string[] => {
	const keys: string[] = [];
	if (event.ctrlKey) {
		keys.push('Control');
	}

	if (event.metaKey) {
		keys.push('Meta');
	}

	if (event.altKey) {
		keys.push('Alt');
	}

	if (event.shiftKey) {
		keys.push('Shift');
	}

	if (!MODIFIER_CODES.includes(event.code)) {
		keys.push(event.code);
	}

	return keys;
};

/** True when the combination has a key that is not a modifier. */
const hasMainKey = (keys: string[]): boolean =>
	keys.some((x) => !['Control', 'Meta', 'Alt', 'Shift'].includes(x));

/** True when the browser uses the combination (it would never reach the page). */
const isReservedByBrowser = (keys: string[]): boolean => {
	const main = keys.find(
		(x) => !['Control', 'Meta', 'Alt', 'Shift'].includes(x)
	);
	if (
		(keys.includes('Control') || keys.includes('Meta')) &&
		CONTROL_META_RESERVED_CODES.includes(main)
	) {
		return true;
	}

	if (ALWAYS_RESERVED_CODES.includes(main)) {
		return true;
	}

	return keys.includes('Alt') && ALT_RESERVED_CODES.includes(main);
};

/** Normalized form of a combination, the same one the content script compares. */
const normalize = (keys: string[]): string =>
	keys
		.map((x) => mapShortcutToString(x))
		.sort()
		.join('+');

/** The other shortcut that already uses the combination, if any. */
const findConflict = (
	config: ShortcutConfig,
	shortcutType: ShortcutType,
	keys: string[]
): ShortcutType | undefined =>
	Object.values(ShortcutType).find(
		(type) =>
			type !== shortcutType &&
			normalize(JSON.parse(config[type]) as string[]) === normalize(keys)
	);

const toHumanString = (keys: string[]): string =>
	keys.map((x) => mapToHumanString(x)).join(' + ');

/**
 * ShortcutInput component for managing keyboard shortcuts configuration.
 *
 * This component provides a UI for users to:
 * - View all available keyboard shortcuts
 * - Record a new key combination for one of them and save it
 * - Reset a shortcut to its default combination
 *
 * @returns JSX element containing the shortcut configuration interface
 */
export const ShortcutInput = () => {
	/** Current shortcuts configuration */
	const [config, setConfig] = useState<ShortcutConfig>(null);

	/** Currently selected shortcut type for editing */
	const [shortcutType, setShortcutType] = useState<ShortcutType>(null);

	/** Recorded combination; null while nothing new was recorded */
	const [recordedKeys, setRecordedKeys] = useState<string[] | null>(null);

	/** Modifiers held while recording, shown before the main key is pressed */
	const [heldKeys, setHeldKeys] = useState<string[]>([]);

	/** Result of the last save or reset */
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');

	// Init Config and subscribe on it changes
	useEffect(() => {
		const updateConfig = ({ shortcuts }: ConfigModel) => {
			setConfig(shortcuts);
		};

		configService.getAll().then(updateConfig, () => void 0);
		configService.addListener(updateConfig);
	}, []);

	const savedKeys =
		exist(config) && exist(shortcutType)
			? (JSON.parse(config[shortcutType]) as string[])
			: [];

	let shortcutValue = toHumanString(savedKeys);
	if (heldKeys.length > 0) {
		shortcutValue = toHumanString(heldKeys);
	} else if (exist(recordedKeys)) {
		shortcutValue = toHumanString(recordedKeys);
	}

	const clearMessages = () => {
		setStatus('');
		setError('');
	};

	const updateShortcutType = (event: ChangeEvent<HTMLSelectElement>) => {
		setShortcutType(event.target.value as ShortcutType);
		setRecordedKeys(null);
		setHeldKeys([]);
		clearMessages();
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// Tab moves the focus on; it is never recorded
		if (event.code === 'Tab') {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		clearMessages();

		// Escape cancels the recording
		if (event.code === 'Escape') {
			setRecordedKeys(null);
			setHeldKeys([]);
			return;
		}

		// Some input methods and virtual keyboards send no physical key
		if (!event.code) {
			return;
		}

		const keys = toCombination(event);
		if (!hasMainKey(keys)) {
			setHeldKeys(keys);
			return;
		}

		setHeldKeys([]);
		setRecordedKeys(keys);
	};

	const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		// Releasing a modifier before the main key cancels the live preview
		setHeldKeys((keys) => (keys.length > 0 ? toCombination(event) : keys));
	};

	const saveShortcut = async () => {
		clearMessages();
		if (notExist(shortcutType) || notExist(config)) {
			return;
		}

		if (notExist(recordedKeys)) {
			setError('Press a key combination first.');
			return;
		}

		if (isReservedByBrowser(recordedKeys)) {
			setError('The browser uses this combination. Choose another one.');
			return;
		}

		const conflict = findConflict(config, shortcutType, recordedKeys);
		if (exist(conflict)) {
			setError(`"${conflict}" already uses this combination.`);
			return;
		}

		try {
			await configService.update('shortcuts', {
				...config,
				[shortcutType]: JSON.stringify(recordedKeys),
			});
			setRecordedKeys(null);
			setStatus(`${shortcutType} saved.`);
		} catch {
			setError('Could not save the shortcut.');
		}
	};

	// An empty combination is stored as "use the default"
	const resetShortcut = async () => {
		clearMessages();
		setRecordedKeys(null);
		setHeldKeys([]);
		if (notExist(shortcutType) || notExist(config)) {
			return;
		}

		const defaultKeys = JSON.parse(
			configService.defaultShortcuts()[shortcutType]
		) as string[];
		const conflict = findConflict(config, shortcutType, defaultKeys);
		if (exist(conflict)) {
			setError(
				`"${conflict}" uses the default combination now. Change it first.`
			);
			return;
		}

		try {
			await configService.update('shortcuts', {
				...config,
				[shortcutType]: JSON.stringify([]),
			});
			setStatus(`${shortcutType} reset to the default.`);
		} catch {
			setError('Could not reset the shortcut.');
		}
	};

	return (
		<div className="relative flex h-full flex-col gap-y-2 rounded-xl border border-gray-300 p-2 pt-4 shadow-md shadow-gray-300">
			<span className="absolute left-1 z-20 -mt-8 rounded-xl p-1 text-base text-gray-500 backdrop-blur-sm">
				Shortcuts
			</span>

			{/* Dropdown for Shortcut Names */}
			<select
				id={'shortcut-type'}
				aria-label="Shortcut to change"
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
				aria-label="Key combination"
				readOnly
				className="block h-6 w-full rounded-md border border-band-200 bg-band-100 px-2 text-center text-sm font-normal tabular-nums text-gray-900 outline-none"
				value={shortcutValue}
				disabled={!shortcutType}
				placeholder="Press keys for shortcut"
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onBlur={() => setHeldKeys([])}
			/>

			<div className="flex w-full flex-row gap-2 pt-1.5">
				<LabelButton
					className="w-full"
					label="Save"
					disabled={!shortcutType}
					onClick={saveShortcut}
				/>
				<LabelButton
					className="w-full"
					label="Reset"
					ariaLabel="Reset to the default combination"
					disabled={!shortcutType}
					onClick={resetShortcut}
				/>
			</div>

			<span role="status" className="min-h-4 text-xs text-gray-600">
				{status}
			</span>
			<span role="alert" className="min-h-4 text-xs text-red-700">
				{error}
			</span>
		</div>
	);
};
