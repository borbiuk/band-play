import { ShortcutType } from '@shared/enums';
import { PageService } from '@shared/interfaces';

import { ShortcutSet } from './shortcut-set';

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
