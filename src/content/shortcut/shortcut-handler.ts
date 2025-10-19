import { ShortcutType } from '@shared/enums';
import { PageService } from '@shared/interfaces';

import { ShortcutSet } from './shortcut-set';

/**
 * Handler for keyboard shortcuts that maps key combinations to actions.
 *
 * This class represents a single keyboard shortcut configuration and
 * provides the mechanism to execute the associated action when the
 * shortcut is triggered.
 */
export class ShortcutHandler {
	/** The set of keys that make up this shortcut combination */
	public set: ShortcutSet;

	/**
	 * Creates a new shortcut handler.
	 *
	 * @param type - The type of shortcut this handler manages
	 * @param handle - Function to execute when the shortcut is triggered
	 */
	constructor(
		public type: ShortcutType,
		public handle: (service: PageService, combination: ShortcutSet) => void
	) {}

	/**
	 * Sets the key combination for this shortcut handler.
	 *
	 * @param value - Array of key codes that make up the shortcut
	 */
	public set combination(value: string[]) {
		this.set = new ShortcutSet(value);
	}
}
