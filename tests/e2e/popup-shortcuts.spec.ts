import { Page } from '@playwright/test';
import { ShortcutType } from '@shared/enums';

import { expect, test } from './fixtures/extension';

/**
 * Picks a shortcut in the popup's shortcut list and waits until its stored combination shows,
 * which also proves the settings are loaded.
 *
 * @param popup - The settings page.
 * @param type - The shortcut to pick.
 * @param shown - The combination the field shows for it.
 */
async function selectShortcut(
	popup: Page,
	type: ShortcutType,
	shown: string
): Promise<void> {
	await popup
		.getByRole('combobox', { name: 'Shortcut to change' })
		.selectOption(type);
	await expect(
		popup.getByRole('textbox', { name: 'Key combination' })
	).toHaveValue(shown);
}

test('should record and save a new combination for a shortcut', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await selectShortcut(popup, ShortcutType.PlayPause, 'Space');
	const field = popup.getByRole('textbox', { name: 'Key combination' });

	await field.press('Shift+KeyK');
	await expect(field).toHaveValue('⇧ + K');
	await popup.getByRole('button', { name: 'Save' }).click();

	await expect(popup.getByRole('status')).toHaveText(
		`${ShortcutType.PlayPause} saved.`
	);
	await expect
		.poll(async () =>
			JSON.parse(
				((await storage.get('shortcuts')) as Record<string, string>)[
					ShortcutType.PlayPause
				]
			)
		)
		.toEqual(['Shift', 'KeyK']);
});

test('should refuse a combination that another shortcut uses', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await selectShortcut(popup, ShortcutType.PlayPause, 'Space');

	// N is the default of "Next track"
	await popup.getByRole('textbox', { name: 'Key combination' }).press('KeyN');
	await popup.getByRole('button', { name: 'Save' }).click();

	await expect(popup.getByRole('alert')).toHaveText(
		`"${ShortcutType.NextTrack}" already uses this combination.`
	);
	expect(await storage.get('shortcuts')).toBeUndefined();
});

test('should refuse a combination the browser uses', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await selectShortcut(popup, ShortcutType.PlayPause, 'Space');

	await popup
		.getByRole('textbox', { name: 'Key combination' })
		.press('Control+KeyP');
	await popup.getByRole('button', { name: 'Save' }).click();

	await expect(popup.getByRole('alert')).toHaveText(
		'The browser uses this combination. Choose another one.'
	);
	expect(await storage.get('shortcuts')).toBeUndefined();
});

test('should ask for a combination before saving', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await selectShortcut(popup, ShortcutType.PlayPause, 'Space');

	await popup.getByRole('button', { name: 'Save' }).click();

	await expect(popup.getByRole('alert')).toHaveText(
		'Press a key combination first.'
	);
	expect(await storage.get('shortcuts')).toBeUndefined();
});

test('should reset a shortcut to its default combination', async ({
	openOptions,
	storage,
}) => {
	await storage.set({
		shortcuts: { [ShortcutType.PlayPause]: JSON.stringify(['KeyK']) },
	});
	const popup = await openOptions();
	await selectShortcut(popup, ShortcutType.PlayPause, 'K');
	const field = popup.getByRole('textbox', { name: 'Key combination' });

	await popup
		.getByRole('button', { name: 'Reset to the default combination' })
		.click();

	await expect(field).toHaveValue('Space');
	await expect(popup.getByRole('status')).toHaveText(
		`${ShortcutType.PlayPause} reset to the default.`
	);
	// An empty combination is stored as "use the default"
	await expect
		.poll(
			async () =>
				((await storage.get('shortcuts')) as Record<string, string>)[
					ShortcutType.PlayPause
				]
		)
		.toBe('[]');
});
