import React, { ReactNode, useEffect, useId, useRef } from 'react';

import '../../styles/ui.scss';

export interface DialogProps {
	// Whether the dialog is shown.
	open: boolean;

	// Called when the dialog closes (Escape, a click outside or a button inside).
	onClose: () => void;

	// The dialog title.
	title: string;

	// Buttons, aligned to the right.
	actions: ReactNode;

	// The dialog body.
	children?: ReactNode;
}

/**
 * Modal dialog on the native `<dialog>` element, opened with `showModal()` (works in Firefox 128).
 * Escape and a click on the backdrop close it, and focus stays inside.
 *
 * @param {DialogProps} props - The props of component.
 */
export const Dialog = ({
	open,
	onClose,
	title,
	actions,
	children,
}: DialogProps) => {
	const ref = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) {
			return;
		}

		if (open && !dialog.open) {
			dialog.showModal();
			return;
		}

		if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	return (
		<dialog
			ref={ref}
			aria-labelledby={titleId}
			className="bp-dialog w-[340px] max-w-[calc(100vw-32px)] rounded-dialog border border-line bg-white p-0 text-ink-900 shadow-pop"
			onClose={onClose}
			onClick={(event) => {
				// The dialog has no padding of its own, so only a click on the backdrop targets it
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<div className="p-[18px]">
				<h2 id={titleId} className="m-0 mb-1.5 text-[15px] font-bold">
					{title}
				</h2>
				{children && (
					<div className="mb-4 leading-[1.4] text-ink-500">
						{children}
					</div>
				)}
				<div className="flex justify-end gap-2">{actions}</div>
			</div>
		</dialog>
	);
};
