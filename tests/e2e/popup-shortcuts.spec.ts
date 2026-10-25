import { Page } from '@playwright/test';
import { ShortcutType } from '@shared/enums';

import { expect, test } from './fixtures/extension';

/**
 * Opens the Shortcuts tab and the change dialog of one shortcut.
 *
 * @param popup - The settings page.
 * @param type - The shortcut to change.
 */
async function openEditDialog(popup: Page, type: ShortcutType): Promise<void> {
	await popup.getByRole('tab', { name: 'Shortcuts' }).click();
	await popup
		.getByRole('button', { name: `Change shortcut for ${type}` })
		.click();
}

test('should record and save a new combination for a shortcut', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await openEditDialog(popup, ShortcutType.PlayPause);
	const field = popup.getByRole('textbox', { name: 'Key combination' });
	await expect(field).toHaveValue('Space');

	await field.press('Shift+KeyK');
	await expect(field).toHaveValue('⇧ + K');
	await popup.getByRole('button', { name: 'Save' }).click();

	await expect
		.poll(async () =>
			JSON.parse(
				((await storage.get('shortcuts')) as Record<string, string>)[
					ShortcutType.PlayPause
				]
			)
		)
		.toEqual(['Shift', 'KeyK']);
	await expect(popup.getByRole('dialog')).toBeHidden();
	await expect(
		popup.getByRole('img', { name: 'Changed from the default' })
	).toHaveCount(1);
});

test('should refuse a combination that another shortcut uses', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await openEditDialog(popup, ShortcutType.PlayPause);

	// N is the default of "Next track"
	await popup.getByRole('textbox', { name: 'Key combination' }).press('KeyN');

	await expect(popup.getByRole('alert')).toHaveText(
		`Already used by "${ShortcutType.NextTrack}". Pick another key.`
	);
	await expect(popup.getByRole('button', { name: 'Save' })).toBeDisabled();
	expect(await storage.get('shortcuts')).toBeUndefined();
});

test('should accept the key of a shortcut that is switched off', async ({
	openOptions,
	storage,
}) => {
	await storage.set({ disabledShortcuts: [ShortcutType.NextTrack] });
	const popup = await openOptions();
	await openEditDialog(popup, ShortcutType.PlayPause);

	await popup.getByRole('textbox', { name: 'Key combination' }).press('KeyN');

	await expect(popup.getByRole('button', { name: 'Save' })).toBeEnabled();
	await expect(popup.getByRole('alert')).toBeEmpty();
});

test('should refuse a combination the browser uses', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await openEditDialog(popup, ShortcutType.PlayPause);

	await popup
		.getByRole('textbox', { name: 'Key combination' })
		.press('Control+KeyP');

	await expect(popup.getByRole('alert')).toHaveText(
		'The browser uses this combination. Pick another key.'
	);
	await expect(popup.getByRole('button', { name: 'Save' })).toBeDisabled();
	expect(await storage.get('shortcuts')).toBeUndefined();
});

test('should keep Save off until a combination is recorded', async ({
	openOptions,
}) => {
	const popup = await openOptions();
	await openEditDialog(popup, ShortcutType.PlayPause);

	await expect(popup.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('should reset a shortcut to its default combination', async ({
	openOptions,
	storage,
}) => {
	await storage.set({
		shortcuts: { [ShortcutType.PlayPause]: JSON.stringify(['KeyK']) },
	});
	const popup = await openOptions();
	await openEditDialog(popup, ShortcutType.PlayPause);
	await expect(
		popup.getByRole('textbox', { name: 'Key combination' })
	).toHaveValue('K');

	await popup.getByRole('button', { name: 'Use default' }).click();

	// An empty combination is stored as "use the default"
	await expect
		.poll(
			async () =>
				((await storage.get('shortcuts')) as Record<string, string>)[
					ShortcutType.PlayPause
				]
		)
		.toBe('[]');
	await expect(popup.getByRole('dialog')).toBeHidden();
});

test('should switch a shortcut off and on', async ({
	openOptions,
	storage,
}) => {
	const popup = await openOptions();
	await popup.getByRole('tab', { name: 'Shortcuts' }).click();
	const toggle = popup.getByRole('switch', {
		name: `Enable ${ShortcutType.LoopTrack}`,
	});
	await expect(toggle).toBeChecked();

	await toggle.click();

	await expect(toggle).not.toBeChecked();
	await expect
		.poll(() => storage.get('disabledShortcuts'))
		.toEqual([ShortcutType.LoopTrack]);
	await expect(
		popup.getByRole('button', {
			name: `Change shortcut for ${ShortcutType.LoopTrack}`,
		})
	).toBeDisabled();

	await toggle.click();

	await expect.poll(() => storage.get('disabledShortcuts')).toEqual([]);
});

test('should reset all shortcuts and switch them on after a confirmation', async ({
	openOptions,
	storage,
}) => {
	await storage.set({
		shortcuts: { [ShortcutType.PlayPause]: JSON.stringify(['KeyK']) },
		disabledShortcuts: [ShortcutType.LoopTrack],
	});
	const popup = await openOptions();
	await popup.getByRole('tab', { name: 'Shortcuts' }).click();

	await popup.getByRole('button', { name: 'Reset', exact: true }).click();
	await popup
		.getByRole('dialog', { name: 'Reset all shortcuts?' })
		.getByRole('button', { name: 'Reset shortcuts' })
		.click();

	await expect.poll(() => storage.get('shortcuts')).toEqual({});
	await expect.poll(() => storage.get('disabledShortcuts')).toEqual([]);
	await expect(
		popup.getByRole('switch', { name: `Enable ${ShortcutType.LoopTrack}` })
	).toBeChecked();
});

test('should filter the shortcut list by the search text', async ({
	openOptions,
}) => {
	const popup = await openOptions();
	await popup.getByRole('tab', { name: 'Shortcuts' }).click();

	await popup
		.getByRole('searchbox', { name: 'Search shortcuts' })
		.fill('wish');

	await expect(popup.getByRole('listitem')).toHaveCount(1);
	await expect(popup.getByRole('listitem')).toContainText(
		ShortcutType.AddToWishlist
	);
});
