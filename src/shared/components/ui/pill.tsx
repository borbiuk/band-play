import { classNames } from '@shared/utils';
import React, { ReactNode } from 'react';

export type PillTone = 'neutral' | 'active' | 'success' | 'warn' | 'danger';

export interface PillProps {
	// Color of the pill.
	tone?: PillTone;

	// Icon shown before the label, about 13 px (a status is never shown by color alone).
	icon?: ReactNode;

	// The status label.
	children: ReactNode;
}

const tones: Record<PillTone, string> = {
	neutral: 'bg-[#eaf0f3] text-ink-700',
	active: 'bg-aqua-100 text-aqua-800',
	success: 'bg-success-bg text-success',
	warn: 'bg-warn-bg text-warn',
	danger: 'bg-danger-bg text-danger',
};

/**
 * Status pill with an icon and a label.
 *
 * @param {PillProps} props - The props of component.
 */
export const Pill = ({ tone = 'neutral', icon, children }: PillProps) => {
	return (
		<span
			className={classNames(
				'inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full pl-1.5 pr-2 text-xs font-semibold [&>svg]:h-[13px] [&>svg]:w-[13px]',
				tones[tone]
			)}
		>
			{icon}
			{children}
		</span>
	);
};
