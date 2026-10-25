/** A class name part: a string, or a falsy value that is skipped. */
export type ClassNamePart = string | false | null | undefined;

/**
 * Joins class name parts, skipping the falsy ones.
 *
 * @param parts - Class names or falsy values.
 * @returns A single class name string.
 */
export const classNames = (...parts: ClassNamePart[]): string =>
	parts.filter(Boolean).join(' ');
