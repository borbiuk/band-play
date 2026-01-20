import { notExist } from './guard.utils';

/**
 * Convert time string in MM:SS format to total seconds.
 *
 * @param value - Time string in MM:SS format (e.g., "3:45")
 * @returns Total seconds, or 0 if the input is invalid
 */
export const convertTimeStringToSeconds = (value: string): number => {
	if (notExist(value)) {
		return 0;
	}

	const parts = value.split(':');
	if (parts.length < 2) {
		return 0;
	}

	const minutes = parseInt(parts[0], 10);
	const seconds = parseInt(parts[1], 10);
	return minutes * 60 + seconds;
};
