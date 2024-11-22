import { exist, isNumeric, notExist } from '../../shared/utils/utils.common';
import { mapToString } from '../../shared/utils/utils.shortcut';

export class ShortcutSet extends Set<string> {
	public digit: number;

	constructor(values?: string[]) {
		if (notExist(values)) {
			values = [];
		}

		super(values.map((x) => mapToString(x)));
	}

	add(value: string) {
		if (value.includes('Digit')) {
			this.digit = Number(value.split('Digit')[1]);
		}

		return super.add(mapToString(value));
	}

	has(value: string): boolean {
		return super.has(mapToString(value));
	}

	delete(_: string): boolean {
		throw 'Not implemented';
	}

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
