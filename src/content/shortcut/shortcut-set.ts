import { exist, isNumeric, notExist, mapShortcutToString } from '@shared/utils';

export class ShortcutSet extends Set<string> {
	public digit: number;

	constructor(values?: string[]) {
		if (notExist(values)) {
			values = [];
		}

		super(values.map((x) => mapShortcutToString(x)));
	}

	add(value: string) {
		if (value.includes('Digit')) {
			this.digit = Number(value.split('Digit')[1]);
		}

		return super.add(mapShortcutToString(value));
	}

	has(value: string): boolean {
		return super.has(mapShortcutToString(value));
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
