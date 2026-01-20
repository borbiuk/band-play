/**
 * Check if a value does not exist (undefined, null, NaN, or empty string).
 *
 * @param value - The value to check
 * @returns True if the value does not exist, false otherwise
 */
export const notExist = <T>(value: T) =>
	value === undefined ||
	value === null ||
	Number.isNaN(value) ||
	value === '';

/**
 * Check if a value exists (not null, undefined, or empty string).
 *
 * @param value - The value to check
 * @returns True if the value exists, false otherwise
 */
export const exist = <T>(value: T) => !notExist(value);

/**
 * Check if a string is a valid number.
 *
 * @param value - The string to check
 * @returns True if the string represents a valid number, false otherwise
 */
export const isNumeric = (value: string) =>
	!Number.isNaN(Number.parseFloat(value));
