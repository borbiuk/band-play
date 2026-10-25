import { classNames } from '@shared/utils';
import React, { ReactNode } from 'react';

export type BadgeTone = 'aqua' | 'accent' | 'danger';

export interface BadgeProps {
	// Color of the badge.
	tone?: BadgeTone;

	// The badge content (a short text, a number or an icon with a text).
	children: ReactNode;
}

const tones: Record<BadgeTone, string> = {
	aqua: 'bg-aqua-100 text-aqua-800',
	accent: 'bg-pink-700 text-white',
	danger: 'bg-danger-bg text-danger',
};

/**
 * Small label such as "Chrome", a counter or "Use with care".
 *
 * @param {BadgeProps} props - The props of component.
 */
export const Badge = ({ tone = 'aqua', children }: BadgeProps) => {
	return (
		<span
			className={classNames(
				'inline-flex h-[18px] items-center gap-[3px] whitespace-nowrap rounded-full px-[7px] text-[11px] font-bold',
				tones[tone]
			)}
		>
			{children}
		</span>
	);
};
