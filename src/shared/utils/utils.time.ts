// Convert time string (00:00) to seconds.
import { notExist } from './utils.common';

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
