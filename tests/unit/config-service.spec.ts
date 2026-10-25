import { expect, test } from '@playwright/test';
import { BatchDownloadFormat, ShortcutType } from '@shared/enums';
import { ConfigModel } from '@shared/models';
import configService from '@shared/services/config-service';

import { FakeLocalStorage, installChrome } from '../helpers/fake-chrome';

// configService keeps no module state: it reads the `chrome` global on every call, so the
// per-test fake below is all a test needs.

let storage: FakeLocalStorage;
let restoreChrome: () => void;

test.beforeEach(() => {
	storage = new FakeLocalStorage();
	restoreChrome = installChrome(storage.toChrome());
});

test.afterEach(() => {
	restoreChrome();
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
	disabledShortcuts: [],
	mediaKeys: true,
	batchDownloadFormat: BatchDownloadFormat.Wav,
	batchDownloadConcurrency: 8,
	batchDownloadNotify: false,
	batchDownloadOpenPage: true,
	batchDownloadSkipDownloaded: false,
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
			disabledShortcuts: [ShortcutType.PlayPause],
			mediaKeys: false,
			batchDownloadFormat: 'flac',
			batchDownloadConcurrency: 3,
			batchDownloadNotify: true,
			batchDownloadOpenPage: false,
			batchDownloadSkipDownloaded: true,
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
			disabledShortcuts: [ShortcutType.PlayPause],
			mediaKeys: false,
			batchDownloadFormat: BatchDownloadFormat.Flac,
			batchDownloadConcurrency: 3,
			batchDownloadNotify: true,
			batchDownloadOpenPage: false,
			batchDownloadSkipDownloaded: true,
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
			title: 'should convert mediaKeys 0 to false',
			stored: { mediaKeys: 0 },
			expected: { mediaKeys: false },
		},
		{
			title: 'should convert batchDownloadOpenPage 0 to false',
			stored: { batchDownloadOpenPage: 0 },
			expected: { batchDownloadOpenPage: false },
		},
		{
			title: 'should keep only known shortcut types in disabledShortcuts, once each',
			stored: {
				disabledShortcuts: [
					ShortcutType.LoopTrack,
					'Unknown shortcut',
					ShortcutType.LoopTrack,
					42,
					ShortcutType.NextTrack,
				],
			},
			expected: {
				disabledShortcuts: [
					ShortcutType.LoopTrack,
					ShortcutType.NextTrack,
				],
			},
		},
		{
			title: 'should use no disabled shortcuts when disabledShortcuts is not an array',
			stored: { disabledShortcuts: 'Loop track' },
			expected: { disabledShortcuts: [] },
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

		expect(await configService.get('playbackStep')).toBe(45);
	});
});

test.describe('update', () => {
	test('should write the value under its key', async () => {
		await configService.update('loopTrack', true);

		expect(storage.dump()).toEqual({ loopTrack: true });
	});
});

test.describe('resetShortcuts', () => {
	test('should reset shortcuts and enable all of them in one write', async () => {
		storage.seed({
			shortcuts: { [ShortcutType.PlayPause]: '["KeyK"]' },
			disabledShortcuts: [ShortcutType.PlayPause],
			playbackStep: 45,
		});

		await configService.resetShortcuts();

		expect(storage.dump()).toEqual({
			shortcuts: {},
			disabledShortcuts: [],
			playbackStep: 45,
		});
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

test.describe('watch', () => {
	test('should call back with the current config at once, then after each change', async () => {
		storage.seed({ playbackStep: 20 });
		const calls: ConfigModel[] = [];

		configService.watch((config) => calls.push(config));
		await expect
			.poll(() => calls)
			.toEqual([{ ...DEFAULTS, playbackStep: 20 }]);

		storage.emit({ playbackStep: { newValue: 20 } });
		await expect.poll(() => calls.length).toBe(2);
	});

	test('should stop calling back after the returned function runs', async () => {
		const calls: ConfigModel[] = [];

		const stop = configService.watch((config) => calls.push(config));
		await expect.poll(() => calls.length).toBe(1);
		stop();
		storage.emit({ loopTrack: { newValue: true } });
		await flushPromises();

		expect(calls).toHaveLength(1);
	});
});

test.describe('exportSettings', () => {
	test('should export every setting with its default or stored value', async () => {
		storage.seed({ playbackStep: 30, mediaKeys: false });

		expect(await configService.exportSettings()).toEqual({
			format: 'band-play-settings',
			version: 1,
			settings: { ...DEFAULTS, playbackStep: 30, mediaKeys: false },
		});
	});

	test('should not export the visited history or the downloads', async () => {
		storage.seed({
			bp_visited_v1: ['abc'],
			batchDownloadItems: [{ id: '1' }],
		});

		const { settings } = await configService.exportSettings();

		expect(Object.keys(settings).sort()).toEqual(
			Object.keys(DEFAULTS).sort()
		);
	});
});

test.describe('importSettings', () => {
	const file = (settings: unknown, version = 1) => ({
		format: 'band-play-settings',
		version,
		settings,
	});

	test('should store the settings of a file and keep other storage keys', async () => {
		storage.seed({ bp_visited_v1: ['abc'] });

		await configService.importSettings(
			file({ ...DEFAULTS, playbackStep: 45, loopTrack: true })
		);

		expect(await configService.getAll()).toEqual({
			...DEFAULTS,
			playbackStep: 45,
			loopTrack: true,
		});
		expect(storage.dump().bp_visited_v1).toEqual(['abc']);
	});

	test('should check every value like a stored one', async () => {
		await configService.importSettings(
			file({
				playbackStep: 500,
				batchDownloadFormat: 'ogg',
				disabledShortcuts: ['Nope', ShortcutType.PlayPause],
				unknownKey: 1,
			})
		);

		expect(await configService.getAll()).toEqual({
			...DEFAULTS,
			disabledShortcuts: [ShortcutType.PlayPause],
		});
		expect(storage.dump()).not.toHaveProperty('unknownKey');
	});

	const REJECTED: { title: string; content: unknown; message: string }[] = [
		{
			title: 'should reject a value that is not an object',
			content: 'text',
			message: 'This is not a Band Play settings file.',
		},
		{
			title: 'should reject null',
			content: null,
			message: 'This is not a Band Play settings file.',
		},
		{
			title: 'should reject another format',
			content: { format: 'other', version: 1, settings: {} },
			message: 'This is not a Band Play settings file.',
		},
		{
			title: 'should reject an unsupported version',
			content: file({}, 2),
			message: 'This settings file has an unsupported version.',
		},
		{
			title: 'should reject a file without settings',
			content: file(undefined),
			message: 'The settings file has no settings.',
		},
		{
			title: 'should reject settings that are an array',
			content: file([]),
			message: 'The settings file has no settings.',
		},
	];

	for (const c of REJECTED) {
		test(c.title, async () => {
			storage.seed({ playbackStep: 20 });

			await expect(
				configService.importSettings(c.content)
			).rejects.toThrow(c.message);

			// A rejected file changes nothing
			expect(storage.dump()).toEqual({ playbackStep: 20 });
		});
	}
});

test.describe('resetSettings', () => {
	test('should return every setting to its default and keep other storage keys', async () => {
		storage.seed({
			playbackStep: 45,
			mediaKeys: false,
			disabledShortcuts: [ShortcutType.PlayPause],
			bp_visited_v1: ['abc'],
		});

		await configService.resetSettings();

		expect(await configService.getAll()).toEqual(DEFAULTS);
		expect(storage.dump()).toEqual({ bp_visited_v1: ['abc'] });
	});
});
