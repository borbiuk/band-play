import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every second while `enabled` (for countdowns).
 *
 * @param enabled - Whether the time should keep ticking.
 * @returns The time in milliseconds.
 */
export const useNow = (enabled: boolean): number => {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!enabled) {
			return undefined;
		}

		setNow(Date.now());
		const id = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, [enabled]);

	return now;
};
