import { PageService } from '@shared/interfaces';
import { ShortcutSet } from './shortcut-set';
import { ShortcutType } from './shortcut-type';

export class ShortcutHandler {
	public set: ShortcutSet;

	constructor(
		public type: ShortcutType,
		public handle: (service: PageService, combination: ShortcutSet) => void
	) {}

	public set combination(value: string[]) {
		this.set = new ShortcutSet(value);
	}
}
