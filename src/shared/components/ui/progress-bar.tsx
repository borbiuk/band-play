import { classNames } from '@shared/utils';
import React from 'react';

export type ProgressTone = 'active' | 'paused' | 'warn';

export interface ProgressBarProps {
	// Done share, 0 to 100.
	value: number;

	// Failed share, 0 to 100, drawn after the done part (summary bars).
	failedValue?: number;

	// Color of the done part: aqua, grey (paused) or amber (needs attention).
	tone?: ProgressTone;

	// Taller bar for the summary.
	large?: boolean;

	// The progress is not known yet: the bar is full and pulses.
	indeterminate?: boolean;

	// Accessible name.
	ariaLabel: string;
}

const tones: Record<ProgressTone, string> = {
	active: 'bg-gradient-to-r from-aqua-400 to-aqua-500',
	paused: 'bg-[#9db0b8]',
	warn: 'bg-coral-500',
};

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

/**
 * Progress bar for a single download or for the whole queue.
 *
 * @param {ProgressBarProps} props - The props of component.
 */
export const ProgressBar = ({
	value,
	failedValue = 0,
	tone = 'active',
	large,
	indeterminate,
	ariaLabel,
}: ProgressBarProps) => {
	const done = clamp(value);
	const failed = Math.min(clamp(failedValue), 100 - done);

	return (
		<div
			role="progressbar"
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={indeterminate ? undefined : Math.round(done)}
			className={classNames(
				'flex overflow-hidden rounded-full bg-[#d9e8ee]',
				large ? 'h-2' : 'h-1.5'
			)}
		>
			<i
				className={classNames(
					'block h-full rounded-full transition-[width] duration-[400ms] ease-out',
					tones[tone],
					indeterminate && 'animate-pulse motion-reduce:animate-none'
				)}
				style={{ width: indeterminate ? '100%' : `${done}%` }}
			/>
			{failed > 0 && (
				<i
					className="block h-full bg-[#e26b61]"
					style={{ width: `${failed}%` }}
				/>
			)}
		</div>
	);
};
