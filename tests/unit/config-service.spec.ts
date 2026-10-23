import { expect, test } from '@playwright/test';
import { BatchDownloadFormat, ShortcutType } from '@shared/enums';
import { ConfigModel } from '@shared/models';
import configService from '@shared/services/config-service';

// configService keeps no module state: it reads the `chrome` global on every call, so the
// per-test fake below is all a test needs.

/** Listener of chrome.storage.local.onChanged */
type ChangeListener = (
	changes: Record<string, chrome.storage.StorageChange>
) => void;

/**
 * In-memory stand-in for `chrome.storage.local` and its `onChanged` event: promise API,
 * values cloned on write and read, change events with `oldValue` / `newValue`.
 */
class FakeLocalStorage {
	private readonly items = new Map<string, unknown>();
	private readonly listeners = new Set<ChangeListener>();

	/** Stores a value without a change event, as data written earlier */
	seed(values: Record<string, unknown>): void {
		for (const [key, value] of Object.entries(values)) {
			this.items.set(key, structuredClone(value));
		}
	}

	/** Copy of everything stored */
	dump(): Record<string, unknown> {
		return structuredClone(Object.fromEntries(this.items));
	}

	/** Fires a change event as if another context had changed storage */
	emit(changes: Record<string, chrome.storage.StorageChange>): void {
		for (const listener of this.listeners) {
			listener(structuredClone(changes));
		}
	}

	/** The fake `chrome` global */
	toChrome(): typeof chrome {
		const local = {
			get: async (
				keys?: string | string[] | null
			): Promise<Record<string, unknown>> => {
				await Promise.resolve();
				const names =
					keys === null || keys === undefined
						? [...this.items.keys()]
						: [keys].flat();
				const result: Record<string, unknown> = {};
				for (const name of names) {
					if (this.items.has(name)) {
						result[name] = structuredClone(this.items.get(name));
					}
				}
				return result;
			},
			set: async (values: Record<string, unknown>): Promise<void> => {
				await Promise.resolve();
				const changes: Record<string, chrome.storage.StorageChange> =
					{};
				for (const [name, value] of Object.entries(values)) {
					const change: chrome.storage.StorageChange = {
						newValue: structuredClone(value),
					};
					if (this.items.has(name)) {
						change.oldValue = structuredClone(this.items.get(name));
					}

					this.items.set(name, structuredClone(value));
					changes[name] = change;
				}

				this.emit(changes);
			},
			onChanged: {
				addListener: (listener: ChangeListener): void => {
					this.listeners.add(listener);
				},
				removeListener: (listener: ChangeListener): void => {
					this.listeners.delete(listener);
				},
			},
		};

		return { storage: { local } } as unknown as typeof chrome;
	}
}

let storage: FakeLocalStorage;
let originalChrome: PropertyDescriptor | undefined;

test.beforeEach(() => {
	originalChrome = Object.getOwnPropertyDescriptor(globalThis, 'chrome');
	storage = new FakeLocalStorage();
	Object.defineProperty(globalThis, 'chrome', {
		configurable: true,
		writable: true,
		value: storage.toChrome(),
	});
});

test.afterEach(() => {
	if (originalChrome) {
		Object.defineProperty(globalThis, 'chrome', originalChrome);
	} else {
		Reflect.deleteProperty(globalThis, 'chrome');
	}
});

/** The default key combinations, written out as the oracle */
const DEFAULT_SHORTCUTS: Record<ShortcutType, string> = {
	[ShortcutType.PlaybackSpeedIncrease]: '["ArrowUp"]',
	[ShortcutType.PlaybackSpeedDecrease]: '["ArrowDown"]',
	[ShortcutType.PlaybackSpeedReset]: '["ArrowDown","Shift"]',
	[ShortcutType.AutoPitchSwitch]: '["KeyP"]',
	[ShortcutType.AutoPitchReset]: '["KeyP","Shift"]',
	[ShortcutType.SeekForward]: '["ArrowRight"]',
	[ShortcutType.SeekBackward]: '["ArrowLeft"]',
	[ShortcutType.SeekToPercentage]: '["1"]',
	[ShortcutType.PlayPause]: '["Space"]',
	[ShortcutType.PreviousTrack]: '["KeyB"]',
	[ShortcutType.NextTrack]: '["KeyN"]',
	[ShortcutType.PlayTrackByIndex]: '["1","Shift"]',
	[ShortcutType.LoopTrack]: '["KeyV","Shift"]',
	[ShortcutType.OpenInNewTab]: '["KeyO"]',
	[ShortcutType.OpenInNewTabWithFocus]: '["KeyO","Shift"]',
	[ShortcutType.AddToWishlist]: '["KeyL"]',
};

/** The defaults, written out as the oracle */
const DEFAULTS: ConfigModel = {
	autoplay: true,
	autoscroll: true,
	keepAwake: false,
	highlightVisited: true,
	playbackStep: 10,
	loopTrack: false,
	showFeedPlayer: true,
	shortcuts: DEFAULT_SHORTCUTS,
	batchDownloadFormat: BatchDownloadFormat.Wav,
	batchDownloadConcurrency: 8,
	batchDownloadFilenameTemplate: '',
};

test.describe('getAll', () => {
	test('should return the defaults for an empty storage', async () => {
		expect(await configService.getAll()).toEqual(DEFAULTS);
	});

	test('should return stored values that differ from every default', async () => {
		storage.seed({
			autoplay: false,
			autoscroll: false,
			keepAwake: true,
			highlightVisited: false,
			playbackStep: 30,
			loopTrack: true,
			showFeedPlayer: false,
			batchDownloadFormat: 'flac',
			batchDownloadConcurrency: 3,
			batchDownloadFilenameTemplate: '{artist}/{title}',
		});

		expect(await configService.getAll()).toEqual({
			autoplay: false,
			autoscroll: false,
			keepAwake: true,
			highlightVisited: false,
			playbackStep: 30,
			loopTrack: true,
			showFeedPlayer: false,
			shortcuts: DEFAULT_SHORTCUTS,
			batchDownloadFormat: BatchDownloadFormat.Flac,
			batchDownloadConcurrency: 3,
			batchDownloadFilenameTemplate: '{artist}/{title}',
		});
	});

	test('should not return other keys of storage.local', async () => {
		storage.seed({
			bp_visited_v1: ['abc'],
			batchDownloadItems: [{ id: '1' }],
		});

		expect(await configService.getAll()).toEqual(DEFAULTS);
	});
});

test.describe('getAll validation', () => {
	const CASES: {
		title: string;
		stored: Record<string, unknown>;
		expected: Partial<ConfigModel>;
	}[] = [
		{
			title: 'should use 10 for a non-numeric playbackStep',
			stored: { playbackStep: 'abc' },
			expected: { playbackStep: 10 },
		},
		{
			title: 'should convert a numeric string playbackStep "30" to 30',
			stored: { playbackStep: '30' },
			expected: { playbackStep: 30 },
		},
		{
			title: 'should use 10 for playbackStep 0',
			stored: { playbackStep: 0 },
			expected: { playbackStep: 10 },
		},
		{
			title: 'should keep playbackStep 1',
			stored: { playbackStep: 1 },
			expected: { playbackStep: 1 },
		},
		{
			title: 'should keep playbackStep 90',
			stored: { playbackStep: 90 },
			expected: { playbackStep: 90 },
		},
		{
			title: 'should keep playbackStep 120',
			stored: { playbackStep: 120 },
			expected: { playbackStep: 120 },
		},
		{
			title: 'should use 10 for playbackStep 121',
			stored: { playbackStep: 121 },
			expected: { playbackStep: 10 },
		},
		{
			title: 'should use 8 for batchDownloadConcurrency 0',
			stored: { batchDownloadConcurrency: 0 },
			expected: { batchDownloadConcurrency: 8 },
		},
		{
			title: 'should keep batchDownloadConcurrency 1',
			stored: { batchDownloadConcurrency: 1 },
			expected: { batchDownloadConcurrency: 1 },
		},
		{
			title: 'should keep batchDownloadConcurrency 15',
			stored: { batchDownloadConcurrency: 15 },
			expected: { batchDownloadConcurrency: 15 },
		},
		{
			title: 'should use 8 for batchDownloadConcurrency 16',
			stored: { batchDownloadConcurrency: 16 },
			expected: { batchDownloadConcurrency: 8 },
		},
		{
			title: 'should use 8 for a non-numeric batchDownloadConcurrency',
			stored: { batchDownloadConcurrency: 'many' },
			expected: { batchDownloadConcurrency: 8 },
		},
		{
			title: 'should use wav for an unknown batchDownloadFormat "ogg"',
			stored: { batchDownloadFormat: 'ogg' },
			expected: { batchDownloadFormat: BatchDownloadFormat.Wav },
		},
		{
			title: 'should keep batchDownloadFormat "mp3-320"',
			stored: { batchDownloadFormat: 'mp3-320' },
			expected: { batchDownloadFormat: BatchDownloadFormat.Mp3320 },
		},
		{
			title: 'should convert a numeric batchDownloadFilenameTemplate 42 to "42"',
			stored: { batchDownloadFilenameTemplate: 42 },
			expected: { batchDownloadFilenameTemplate: '42' },
		},
		{
			title: 'should use an empty batchDownloadFilenameTemplate for null',
			stored: { batchDownloadFilenameTemplate: null },
			expected: { batchDownloadFilenameTemplate: '' },
		},
		{
			title: 'should convert autoplay 0 to false',
			stored: { autoplay: 0 },
			expected: { autoplay: false },
		},
		{
			title: 'should convert keepAwake "yes" to true',
			stored: { keepAwake: 'yes' },
			expected: { keepAwake: true },
		},
		{
			title: 'should use the default autoplay true for an empty string',
			stored: { autoplay: '' },
			expected: { autoplay: true },
		},
	];

	for (const c of CASES) {
		test(c.title, async () => {
			storage.seed(c.stored);

			expect(await configService.getAll()).toEqual({
				...DEFAULTS,
				...c.expected,
			});
		});
	}
});

test.describe('getAll shortcuts', () => {
	const CASES: {
		title: string;
		stored: unknown;
		expected: Record<ShortcutType, string>;
	}[] = [
		{
			title: 'should keep a stored valid combination',
			stored: { [ShortcutType.PlayPause]: '["KeyK","Shift"]' },
			expected: {
				...DEFAULT_SHORTCUTS,
				[ShortcutType.PlayPause]: '["KeyK","Shift"]',
			},
		},
		{
			title: 'should use the default for an empty combination []',
			stored: { [ShortcutType.PlayPause]: '[]' },
			expected: DEFAULT_SHORTCUTS,
		},
		{
			title: 'should use the default for corrupt JSON',
			stored: { [ShortcutType.PlayPause]: '["KeyK"' },
			expected: DEFAULT_SHORTCUTS,
		},
		{
			title: 'should use the default for an array of numbers',
			stored: { [ShortcutType.PlayPause]: '[1,2]' },
			expected: DEFAULT_SHORTCUTS,
		},
		{
			title: 'should use the default for a combination that is not a string',
			stored: { [ShortcutType.PlayPause]: ['KeyK'] },
			expected: DEFAULT_SHORTCUTS,
		},
		{
			title: 'should drop unknown keys',
			stored: { 'Unknown shortcut': '["KeyK"]' },
			expected: DEFAULT_SHORTCUTS,
		},
		{
			title: 'should use the defaults for a shortcuts value that is not an object',
			stored: 'broken',
			expected: DEFAULT_SHORTCUTS,
		},
	];

	for (const c of CASES) {
		test(c.title, async () => {
			storage.seed({ shortcuts: c.stored });

			expect((await configService.getAll()).shortcuts).toEqual(
				c.expected
			);
		});
	}
});

test.describe('get', () => {
	test('should return one validated value', async () => {
		storage.seed({ playbackStep: 45 });

		expect(await configService.get<number>('playbackStep')).toBe(45);
	});
});

test.describe('update', () => {
	test('should write the value under its key', async () => {
		await configService.update('loopTrack', true);

		expect(storage.dump()).toEqual({ loopTrack: true });
	});
});

test.describe('defaultShortcuts', () => {
	test('should return the default combinations', () => {
		expect(configService.defaultShortcuts()).toEqual(DEFAULT_SHORTCUTS);
	});

	test('should return a new object on every call', () => {
		const first = configService.defaultShortcuts();
		first[ShortcutType.PlayPause] = '["KeyK"]';

		const second = configService.defaultShortcuts();

		expect(second).not.toBe(first);
		expect(second[ShortcutType.PlayPause]).toBe('["Space"]');
	});
});

/**
 * Waits for one macrotask. The fake storage answers through promises only, so every
 * pending callback of the listener has run when this resolves.
 */
async function flushPromises(): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

test.describe('addListener', () => {
	const CONFIG_KEY_CASES = ['playbackStep', 'shortcuts', 'autoplay'];

	for (const key of CONFIG_KEY_CASES) {
		test(`should call back with the new config when ${key} changed`, async () => {
			const calls: ConfigModel[] = [];
			configService.addListener((config) => calls.push(config));
			storage.seed({ playbackStep: 20 });

			storage.emit({ [key]: { newValue: 1 } });

			await expect
				.poll(() => calls)
				.toEqual([{ ...DEFAULTS, playbackStep: 20 }]);
		});
	}

	const OTHER_KEY_CASES = [
		'bp_visited_v1',
		'batchDownloadItems',
		'batchDownloadHistory',
	];

	for (const key of OTHER_KEY_CASES) {
		test(`should not call back when only ${key} changed`, async () => {
			const calls: ConfigModel[] = [];
			configService.addListener((config) => calls.push(config));

			storage.emit({ [key]: { newValue: 1 } });
			// Positive control: the listener reacts to a config change
			storage.emit({ loopTrack: { newValue: true } });
			await flushPromises();

			expect(calls).toEqual([DEFAULTS]);
		});
	}
});
