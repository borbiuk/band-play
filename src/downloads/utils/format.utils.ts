/**
 * Formats a size in megabytes: "512 MB" or "1.4 GB".
 *
 * @param mb - Size in megabytes.
 * @returns The text.
 */
export const formatSizeMb = (mb: number): string => {
	if (mb >= 1024) {
		return `${(mb / 1024).toFixed(1)} GB`;
	}

	return `${Math.max(Math.round(mb), 1)} MB`;
};

/**
 * Formats a speed: "18.4 MB/s" or "640 KB/s".
 *
 * @param mbPerSec - Speed in megabytes per second.
 * @returns The text.
 */
export const formatSpeed = (mbPerSec: number): string => {
	if (mbPerSec >= 1) {
		return `${mbPerSec.toFixed(1)} MB/s`;
	}

	return `${Math.max(Math.round(mbPerSec * 1024), 1)} KB/s`;
};

/**
 * Formats the time left: "~2 min left".
 *
 * @param seconds - Time left in seconds.
 * @returns The text.
 */
export const formatEta = (seconds: number): string => {
	if (seconds >= 3600) {
		return `~${Math.round(seconds / 3600)} h left`;
	}

	if (seconds >= 60) {
		return `~${Math.round(seconds / 60)} min left`;
	}

	return `~${Math.max(Math.round(seconds), 1)} s left`;
};
