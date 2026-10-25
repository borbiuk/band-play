import { classNames } from '@shared/utils';
import React, { ReactNode } from 'react';

export type NoteTone = 'warn' | 'info';

export interface NoteProps {
	// Color of the note.
	tone?: NoteTone;

	// Icon shown before the text.
	icon?: ReactNode;

	// ARIA role: `alert` for errors, `status` for updates.
	role?: 'alert' | 'status';

	// The note text.
	children: ReactNode;
}

const tones: Record<NoteTone, string> = {
	warn: 'bg-warn-bg text-warn',
	info: 'bg-aqua-50 text-aqua-800',
};

/**
 * Inline message box for warnings and hints.
 *
 * @param {NoteProps} props - The props of component.
 */
export const Note = ({ tone = 'warn', icon, role, children }: NoteProps) => {
	return (
		<div
			role={role}
			className={classNames(
				'flex gap-2 rounded-ctl px-[11px] py-[9px] text-xs leading-[1.35] [&>svg]:mt-px [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
				tones[tone]
			)}
		>
			{icon}
			<span>{children}</span>
		</div>
	);
};
