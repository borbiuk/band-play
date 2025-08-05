// Check if a value does not exist (undefined, null, NaN, or empty string).
export const notExist = <T>(value: T) =>
	value === undefined ||
	value === null ||
	Number.isNaN(value) ||
	value === '';

// Check if a value exists (not null, undefined, or empty string).
export const exist = <T>(value: T) => !notExist(value);

// Check if a string is a valid number.
export const isNumeric = (value: string) => !isNaN(parseFloat(value));
