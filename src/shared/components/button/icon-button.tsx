import React, { ReactNode } from 'react';

export interface IconButtonProps {
	// The icon element to be displayed.
	icon: ReactNode;

	// The callback function to be executed when the button is clicked.
	onClick?: () => void;

	// Whether the button is disabled.
	disabled?: boolean;

	// Button type attribute.
	type?: 'button' | 'submit' | 'reset';

	// Optional title attribute.
	title?: string;

	// Optional aria-label.
	ariaLabel?: string;

	// Optional aria-hidden.
	ariaHidden?: boolean;

	// Optional tab index.
	tabIndex?: number;

	// Optional tooltip id override.
	dataTooltipId?: string;
}

/**
 * IconButton component for rendering a circular icon button.
 *
 * @param {IconButtonProps} props - The props of component.
 */
export const IconButton = ({
	icon,
	onClick,
	disabled,
	type = 'button',
	title,
	ariaLabel,
	ariaHidden,
	tabIndex,
	dataTooltipId,
}: IconButtonProps) => {
	const baseClassName =
		'flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs transition-all duration-300 ease-in-out hover:scale-102 hover:cursor-pointer hover:bg-gray-50';

	return (
		<button
			type={type}
			data-tooltip-id={dataTooltipId}
			title={title}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			tabIndex={tabIndex}
			disabled={disabled}
			className={`${baseClassName} ${
				disabled
					? 'opacity-50 hover:scale-100 hover:cursor-not-allowed'
					: ''
			}`}
			onClick={onClick}
		>
			{icon}
		</button>
	);
};
