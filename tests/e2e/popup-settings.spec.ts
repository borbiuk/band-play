import { readFileSync } from 'node:fs';

import { ShortcutType } from '@shared/enums';

import { expect, test } from './fixtures/extension';

test('should write only the setting the user changes and show it again', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await popup.getByRole('tab', { name: 'Page' }).click();
	const autoscroll = popup.getByRole('switch', { name: 'Autoscroll' });
	await expect(autoscroll).toBeChecked();

	await autoscroll.click();

	await expect(autoscroll).not.toBeChecked();
	await expect.poll(() => storage.get('autoscroll')).toBe(false);
	// Opening the popup writes nothing: no other setting was stored
	expect(await storage.get('autoplay')).toBeUndefined();
	expect(await storage.get('playbackStep')).toBeUndefined();
	expect(await storage.get('mediaKeys')).toBeUndefined();

	await popup.reload();
	await popup.getByRole('tab', { name: 'Page' }).click();
	await expect(
		popup.getByRole('switch', { name: 'Autoscroll' })
	).not.toBeChecked();
});

test('should save the playback step typed or stepped by the user', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	const step = popup.getByRole('textbox', {
		name: 'Playback step in seconds',
	});
	await expect(step).toHaveValue('10');

	await popup
		.getByRole('button', { name: 'Increase playback step in seconds' })
		.click();
	await expect(step).toHaveValue('15');
	await expect.poll(() => storage.get('playbackStep')).toBe(15);

	await step.fill('45');
	await expect.poll(() => storage.get('playbackStep')).toBe(45);

	// A value above the limit is clamped when the field loses focus
	await step.fill('500');
	await step.blur();
	await expect(step).toHaveValue('120');
	await expect.poll(() => storage.get('playbackStep')).toBe(120);
});

test('should show every tab and keep the downloads tab free of scrolling', async ({
	openOptions,
}) => {
	const popup = await openOptions();

	for (const name of ['Playback', 'Page', 'Downloads', 'Shortcuts']) {
		await popup.getByRole('tab', { name }).click();
		await expect(popup.getByRole('tab', { name })).toHaveAttribute(
			'aria-selected',
			'true'
		);
	}

	await popup.getByRole('tab', { name: 'Downloads' }).click();
	await expect(
		popup.getByRole('combobox', { name: 'File format' })
	).toBeVisible();
	const main = popup.getByRole('tabpanel');
	const overflow = await main.evaluate(
		(element) => element.scrollHeight - element.clientHeight
	);
	expect(overflow).toBeLessThanOrEqual(0);
});

test('should move between tabs with the arrow keys', async ({
	openOptions,
}) => {
	const popup = await openOptions();

	await popup.getByRole('tab', { name: 'Playback' }).press('ArrowRight');
	await expect(popup.getByRole('tab', { name: 'Page' })).toBeFocused();
	await popup.getByRole('tab', { name: 'Page' }).press('End');
	await expect(popup.getByRole('tab', { name: 'Shortcuts' })).toBeFocused();
	await expect(popup.getByRole('tabpanel')).toBeVisible();
});

test('should save the batch download options only when the user changes them', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await popup.getByRole('tab', { name: 'Downloads' }).click();
	const openDownloads = popup.getByRole('switch', {
		name: 'Open downloads page',
	});
	const skip = popup.getByRole('switch', { name: 'Skip already downloaded' });
	await expect(openDownloads).toBeChecked();
	await expect(skip).not.toBeChecked();

	await skip.click();
	await openDownloads.click();
	const format = popup.getByRole('combobox', { name: 'File format' });
	await format.selectOption('FLAC');

	await expect
		.poll(() => storage.get('batchDownloadSkipDownloaded'))
		.toBe(true);
	await expect.poll(() => storage.get('batchDownloadOpenPage')).toBe(false);
	await expect.poll(() => storage.get('batchDownloadFormat')).toBe('flac');
	expect(await storage.get('batchDownloadConcurrency')).toBeUndefined();
});

test('should clear the visited history after a confirmation', async ({
	openOptions,
	storage,
}) => {
	await storage.set({ bp_visited_v1: ['a', 'b', 'c'] });
	const popup = await openOptions();
	await popup.getByRole('tab', { name: 'Page' }).click();
	await expect(popup.getByText('3 entries', { exact: true })).toBeVisible();

	await popup.getByRole('button', { name: 'Clear' }).click();
	const dialog = popup.getByRole('dialog', {
		name: 'Clear visited history?',
	});
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	expect(await storage.get('bp_visited_v1')).toEqual(['a', 'b', 'c']);

	await popup.getByRole('button', { name: 'Clear' }).click();
	await dialog.getByRole('button', { name: 'Clear history' }).click();

	await expect.poll(() => storage.get('bp_visited_v1')).toBeUndefined();
	await expect(popup.getByText('0 entries', { exact: true })).toBeVisible();
});

test('should reset all settings but keep the visited history', async ({
	openOptions,
	storage,
}) => {
	await storage.set({
		playbackStep: 45,
		mediaKeys: false,
		disabledShortcuts: [ShortcutType.PlayPause],
		bp_visited_v1: ['a'],
	});
	const popup = await openOptions();

	await popup.getByRole('button', { name: 'Reset all' }).click();
	await popup
		.getByRole('dialog', { name: 'Reset all settings?' })
		.getByRole('button', { name: 'Reset all' })
		.click();

	await expect.poll(() => storage.get('playbackStep')).toBeUndefined();
	expect(await storage.get('mediaKeys')).toBeUndefined();
	expect(await storage.get('disabledShortcuts')).toBeUndefined();
	expect(await storage.get('bp_visited_v1')).toEqual(['a']);
	await expect(
		popup.getByRole('textbox', { name: 'Playback step in seconds' })
	).toHaveValue('10');
});

test('should export the settings as a file', async ({
	openOptions,
	storage,
}) => {
	await storage.set({ playbackStep: 45 });
	const popup = await openOptions();

	const download = popup.waitForEvent('download');
	await popup.getByRole('button', { name: 'Export' }).click();
	const file = await download;

	expect(file.suggestedFilename()).toBe('band-play-settings.json');
	const content = JSON.parse(readFileSync((await file.path()) ?? '', 'utf8'));
	expect(content).toMatchObject({
		format: 'band-play-settings',
		version: 1,
		settings: { playbackStep: 45, mediaKeys: true },
	});
});

test('should import settings from a file and refuse a foreign file', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	const input = popup.getByLabel('Settings file');

	await input.setInputFiles({
		name: 'other.json',
		mimeType: 'application/json',
		buffer: Buffer.from(JSON.stringify({ hello: 'world' })),
	});
	await expect(popup.getByRole('alert')).toHaveText(
		'This is not a Band Play settings file.'
	);
	expect(await storage.get('playbackStep')).toBeUndefined();

	await input.setInputFiles({
		name: 'band-play-settings.json',
		mimeType: 'application/json',
		buffer: Buffer.from(
			JSON.stringify({
				format: 'band-play-settings',
				version: 1,
				settings: { playbackStep: 60, loopTrack: true },
			})
		),
	});

	await expect(popup.getByRole('status')).toHaveText('Settings imported');
	await expect.poll(() => storage.get('playbackStep')).toBe(60);
	expect(await storage.get('loopTrack')).toBe(true);
});
