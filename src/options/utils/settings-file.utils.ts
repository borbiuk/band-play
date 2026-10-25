import configService from '@shared/services/config-service';

/** Name of the exported settings file. */
export const SETTINGS_FILE_NAME = 'band-play-settings.json';

/**
 * Saves the settings as a JSON file through the browser's download.
 *
 * @returns A promise that resolves when the download starts.
 */
export const exportSettingsFile = async (): Promise<void> => {
	const file = await configService.exportSettings();
	const blob = new Blob([JSON.stringify(file, null, 2)], {
		type: 'application/json',
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = SETTINGS_FILE_NAME;
	document.body.append(link);
	link.click();
	link.remove();
	// The download has started by the time the next task runs
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Reads a settings file chosen by the user and applies it.
 *
 * @param file - The chosen file.
 * @throws Error with a message for the user when the file cannot be used.
 */
export const importSettingsFile = async (file: File): Promise<void> => {
	let content: unknown;
	try {
		content = JSON.parse(await file.text());
	} catch {
		throw new Error('This is not a Band Play settings file.');
	}

	await configService.importSettings(content);
};
