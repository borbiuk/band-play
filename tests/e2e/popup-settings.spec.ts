import { expect, test } from './fixtures/extension';

test('should write only the setting the user changes and show it again', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	const autoscroll = popup.getByRole('checkbox', { name: 'Autoscroll' });
	await expect(autoscroll).toBeChecked();
	// The playback step loads its own copy of the settings
	await expect(popup.locator('#playbackStep-number-input')).toHaveValue('10');

	await autoscroll.click();

	await expect(autoscroll).not.toBeChecked();
	await expect.poll(() => storage.get('autoscroll')).toBe(false);
	// The checkboxes and the playback step used to write their value back when the popup opened
	expect(await storage.get('autoplay')).toBeUndefined();
	expect(await storage.get('playbackStep')).toBeUndefined();

	await popup.reload();
	await expect(
		popup.getByRole('checkbox', { name: 'Autoscroll' })
	).not.toBeChecked();
});

test('should save the filename template while the user types', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();

	await popup
		.getByPlaceholder('Filename template')
		.fill('{artist} - {title}');

	// Saved after a short pause, without leaving the field
	await expect
		.poll(() => storage.get('batchDownloadFilenameTemplate'))
		.toBe('{artist} - {title}');
	await popup.reload();
	await expect(popup.getByPlaceholder('Filename template')).toHaveValue(
		'{artist} - {title}'
	);
});
