import { ProgressBar } from '@shared/components/ui';
import { Overall } from '@shared/utils/batch-download-overall.utils';
import React from 'react';

import { TransferRate } from '../hooks/use-transfer-rate';
import { formatEta, formatSizeMb, formatSpeed } from '../utils/format.utils';

export interface SummaryCardProps {
	// Progress of the whole queue.
	overall: Overall;

	// Speed and time left, or null while unknown.
	rate: TransferRate | null;
}

/**
 * Card with "N of M downloaded", the size, the speed and the overall progress bar.
 *
 * @param {SummaryCardProps} props - The props of component.
 */
export const SummaryCard = ({ overall, rate }: SummaryCardProps) => {
	const sizes =
		overall.knownSizeMb > 0
			? `${overall.allSizesKnown ? '' : '~'}${formatSizeMb(overall.downloadedMb)} of ${formatSizeMb(overall.knownSizeMb)}`
			: '';
	const meta = [
		sizes,
		rate ? formatSpeed(rate.speedMbPerSec) : '',
		rate ? formatEta(rate.etaSec) : '',
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<section
			aria-label="Overall progress"
			className="mt-3 rounded-card border border-line bg-white/80 px-3.5 pb-3.5 pt-3 shadow-card"
		>
			<div className="mb-2 flex items-baseline justify-between gap-4">
				<div className="text-[15px] text-ink-700">
					<b className="text-xl tabular-nums text-ink-900">
						{overall.completed}
					</b>{' '}
					of{' '}
					<b className="text-xl tabular-nums text-ink-900">
						{overall.total}
					</b>{' '}
					downloaded
					{overall.failed > 0 && (
						<span className="ml-2.5 text-xs font-semibold text-danger">
							{overall.failed} failed
						</span>
					)}
				</div>
				<div className="text-right text-xs tabular-nums text-ink-500">
					{meta}
				</div>
			</div>
			<ProgressBar
				large
				ariaLabel="Overall progress"
				value={overall.donePct}
				failedValue={overall.failedPct}
			/>
		</section>
	);
};
