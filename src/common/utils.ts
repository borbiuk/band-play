// Check if a value does not exist (null, undefined, or empty string).
export const notExist = <T>(value: T) =>
	value === undefined || value === null || value === '';

// Check if a value exists (not null, undefined, or empty string).
export const exist = <T>(value: T) => !notExist(value);

// Function to define that keyboard event should be handled as hotkey of extension.
export const isHotKey = (event: KeyboardEvent) => {
	const targetName = (event.target as HTMLElement)?.localName;
	if (['input', 'textarea'].includes(targetName)) {
		return false;
	}

	if (event.ctrlKey) {
		return false;
	}

	if (event.shiftKey) {
		return event.code.startsWith('Digit');
	} else {
		return (
			event.code.startsWith('Digit') ||
			[
				'Space',
				'KeyN',
				'KeyB',
				'KeyM',
				'KeyL',
				'ArrowRight',
				'ArrowLeft',
				'KeyO',
			].includes(event.code)
		);
	}
};
