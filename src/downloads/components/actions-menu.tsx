import { Button } from '@shared/components/ui';
import { useDismissOnOutside } from '@shared/hooks/use-dismiss-on-outside';
import { CheckCheck, Ellipsis, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface ActionsMenuProps {
	// Clear the finished downloads from the list.
	onClearCompleted: () => void;

	// Whether there are finished downloads to clear.
	canClearCompleted: boolean;

	// Ask to clear the whole list (the page confirms first).
	onClearAll: () => void;
}

/**
 * The "..." menu with the clearing actions. Escape and a click outside close it.
 *
 * @param {ActionsMenuProps} props - The props of component.
 */
export const ActionsMenu = ({
	onClearCompleted,
	canClearCompleted,
	onClearAll,
}: ActionsMenuProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const root = useRef<HTMLDivElement>(null);
	const firstItem = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (isOpen) {
			firstItem.current?.focus();
		}
	}, [isOpen]);

	useDismissOnOutside(root, isOpen, (reason) => {
		setIsOpen(false);
		// Escape returns the focus to the button that opened the menu
		if (reason === 'escape') {
			root.current?.querySelector('button')?.focus();
		}
	});

	const itemClass =
		'flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-left font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45';

	return (
		<div ref={root} className="relative">
			<Button
				small
				icon
				aria-haspopup="menu"
				aria-expanded={isOpen}
				aria-label="More actions"
				onClick={() => setIsOpen((open) => !open)}
			>
				<Ellipsis size={16} aria-hidden="true" />
			</Button>
			{isOpen && (
				<div
					role="menu"
					className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[190px] rounded-menu border border-line bg-white p-[5px] shadow-pop"
				>
					<button
						ref={firstItem}
						type="button"
						role="menuitem"
						disabled={!canClearCompleted}
						className={`${itemClass} hover:bg-aqua-50 focus-visible:bg-aqua-50`}
						onClick={() => {
							setIsOpen(false);
							onClearCompleted();
						}}
					>
						<CheckCheck size={16} aria-hidden="true" />
						Clear completed
					</button>
					<button
						type="button"
						role="menuitem"
						className={`${itemClass} text-danger hover:bg-danger-bg focus-visible:bg-danger-bg`}
						onClick={() => {
							setIsOpen(false);
							onClearAll();
						}}
					>
						<Trash2 size={16} aria-hidden="true" />
						Clear all…
					</button>
				</div>
			)}
		</div>
	);
};
