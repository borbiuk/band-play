import { useEffect, useRef, useState } from 'react';

/** How often the downloaded size is sampled, the span the speed is averaged over, and the least span needed. */
const SAMPLE_INTERVAL_MS = 1000;
const SAMPLE_WINDOW_MS = 5000;
const MIN_WINDOW_MS = 3000;

export interface TransferRate {
	// Megabytes per second.
	speedMbPerSec: number;

	// Seconds until the known sizes are done.
	etaSec: number;
}

/**
 * Speed and time left, from how fast the downloaded size grows over the last seconds.
 *
 * @param isDownloading - Whether anything is downloading; the samples reset when it stops.
 * @param downloadedMb - Megabytes downloaded so far.
 * @param knownSizeMb - Sum of the known sizes.
 * @returns The rate, or null while it cannot be told yet.
 */
export const useTransferRate = (
	isDownloading: boolean,
	downloadedMb: number,
	knownSizeMb: number
): TransferRate | null => {
	const [rate, setRate] = useState<TransferRate | null>(null);
	const samples = useRef<{ t: number; mb: number }[]>([]);
	const latest = useRef({ downloadedMb, knownSizeMb });
	latest.current = { downloadedMb, knownSizeMb };

	useEffect(() => {
		if (!isDownloading) {
			samples.current = [];
			setRate(null);
			return undefined;
		}

		const intervalId = window.setInterval(() => {
			const now = Date.now();
			const list = samples.current;
			list.push({ t: now, mb: latest.current.downloadedMb });
			while (list.length > 0 && now - list[0].t > SAMPLE_WINDOW_MS) {
				list.shift();
			}

			const windowMs = list.length > 1 ? now - list[0].t : 0;
			if (windowMs < MIN_WINDOW_MS) {
				setRate(null);
				return;
			}

			const speedMbPerSec =
				(latest.current.downloadedMb - list[0].mb) / (windowMs / 1000);
			if (speedMbPerSec <= 0) {
				setRate(null);
				return;
			}

			const remainingMb = Math.max(
				latest.current.knownSizeMb - latest.current.downloadedMb,
				0
			);
			setRate({ speedMbPerSec, etaSec: remainingMb / speedMbPerSec });
		}, SAMPLE_INTERVAL_MS);

		return () => window.clearInterval(intervalId);
	}, [isDownloading]);

	return rate;
};
