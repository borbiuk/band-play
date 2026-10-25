import React, { ReactNode } from 'react';

import { Button } from './button';
import { Dialog } from './dialog';

export interface ConfirmDialogProps {
	// Whether the dialog is shown.
	open: boolean;

	// Called when the dialog closes: Cancel, Escape, a click outside, or Confirm.
	onClose: () => void;

	// The question.
	title: string;

	// Label of the red confirm button.
	confirmLabel: string;

	// Called when the user confirms; the dialog closes first.
	onConfirm: () => void;

	// What the confirmation does.
	children?: ReactNode;
}

/**
 * A dialog that asks the user to confirm a risky action: Cancel and a red confirm button.
 *
 * @param {ConfirmDialogProps} props - The props of component.
 */
export const ConfirmDialog = ({
	open,
	onClose,
	title,
	confirmLabel,
	onConfirm,
	children,
}: ConfirmDialogProps) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={title}
			actions={
				<>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						variant="dangerSolid"
						onClick={() => {
							onClose();
							onConfirm();
						}}
					>
						{confirmLabel}
					</Button>
				</>
			}
		>
			{children}
		</Dialog>
	);
};
