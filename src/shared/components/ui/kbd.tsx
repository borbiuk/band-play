import React, { ReactNode } from 'react';

export interface KbdProps {
	// The key label.
	children: ReactNode;
}

/**
 * Key cap for a keyboard shortcut.
 *
 * @param {KbdProps} props - The props of component.
 */
export const Kbd = ({ children }: KbdProps) => {
	return (
		<kbd className="inline-grid h-6 min-w-6 place-items-center rounded-[7px] border border-b-2 border-line-strong bg-gradient-to-b from-white to-[#f3f8fa] px-1.5 font-ui text-xs font-semibold leading-none text-ink-700">
			{children}
		</kbd>
	);
};
