// Check if a value does not exist (null, undefined, or empty string).
export const notExist = <T>(value: T) =>
	value === undefined || value === null || value === '';

// Check if a value exists (not null, undefined, or empty string).
export const exist = <T>(value: T) => !notExist(value);

export const isNumeric = (value: string) => !isNaN(parseFloat(value));
