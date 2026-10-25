import { classNames } from '@shared/utils';
import React, { ReactNode } from 'react';

export interface ChipProps {
	// Whether the chip is the selected filter.
	pressed: boolean;

	// Called when the chip is clicked.
	onClick: () => void;

	// The chip label.
	children: ReactNode;

	// Optional counter shown after the label.
	count?: number;

	// Red counter for a "problem" filter such as Failed.
	danger?: boolean;
}

/**
 * Filter chip (a toggle button with `aria-pressed`).
 *
 * @param {ChipProps} props - The props of component.
 */
export const Chip = ({
	pressed,
	onClick,
	children,
	count,
	danger,
}: ChipProps) => {
	return (
		<button
			type="button"
			aria-pressed={pressed}
			onClick={onClick}
			className={classNames(
				'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2',
				pressed
					? 'border-aqua-400 bg-aqua-100 text-aqua-800'
					: 'border-line-strong bg-white text-ink-700 hover:border-aqua-300 hover:bg-aqua-50'
			)}
		>
			{children}
			{count !== undefined && (
				<span
					className={classNames(
						'text-[11px] font-bold tabular-nums',
						pressed
							? 'text-aqua-800'
							: danger
								? 'text-danger'
								: 'text-ink-500'
					)}
				>
					{count}
				</span>
			)}
		</button>
	);
};
