import { exist, isNumeric, notExist, mapShortcutToString } from '@shared/utils';

/**
 * Extended Set class for managing keyboard shortcut combinations.
 *
 * This class provides specialized functionality for handling keyboard shortcuts,
 * including digit key extraction and comparison operations for shortcut matching.
 */
export class ShortcutSet extends Set<string> {
	/** Extracted digit value from digit keys (0-9) */
	public digit: number;

	/**
	 * Creates a new ShortcutSet with normalized key values.
	 *
	 * @param values - Optional array of key codes to initialize the set with
	 */
	constructor(values?: string[]) {
		if (notExist(values)) {
			values = [];
		}

		super(values.map((x) => mapShortcutToString(x)));
	}

	/**
	 * Adds a key to the shortcut set and extracts digit information if applicable.
	 *
	 * @param value - The key code to add
	 * @returns The ShortcutSet instance for chaining
	 */
	add(value: string) {
		if (value.includes('Digit')) {
			this.digit = Number(value.split('Digit')[1]);
		}

		return super.add(mapShortcutToString(value));
	}

	/**
	 * Checks if the set contains a specific key.
	 *
	 * @param value - The key code to check for
	 * @returns True if the key is in the set, false otherwise
	 */
	has(value: string): boolean {
		return super.has(mapShortcutToString(value));
	}

	/**
	 * Deletion is not implemented for ShortcutSet.
	 *
	 * @param _ - Unused parameter
	 * @throws Error indicating the operation is not implemented
	 */
	delete(_: string): boolean {
		throw 'Not implemented';
	}

	/**
	 * Compares this shortcut set with another for equality.
	 * Takes into account digit keys and their numeric values.
	 *
	 * @param inputSet - The ShortcutSet to compare with
	 * @returns True if the sets are equal, false otherwise
	 */
	equal(inputSet: ShortcutSet): boolean {
		return (
			inputSet.size === this.size &&
			[...inputSet].every(
				(x: string) =>
					this.has(x) || (isNumeric(x) && exist(this.digit))
			)
		);
	}
}
