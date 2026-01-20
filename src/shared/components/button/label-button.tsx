import React, { ReactNode } from 'react';

export interface LabelButtonProps {
	// The label displayed inside the button.
	label?: string;

	// The button content.
	children?: ReactNode;

	// The callback function to be executed when the button is clicked.
	onClick?: () => void;

	// Whether the button is disabled.
	disabled?: boolean;

	// Optional aria-label.
	ariaLabel?: string;

	// Optional width class name (e.g., w-32).
	className?: string;
}

/**
 * LabelButton component for rendering a labeled button.
 *
 * @param {LabelButtonProps} props - The props of a component.
 */
export const LabelButton = ({
	label,
	children,
	onClick,
	disabled,
	ariaLabel,
	className,
}: LabelButtonProps) => {
	const baseClassName =
		'flex items-center justify-center rounded-lg outline-none transition-all duration-300 ease-in-out h-6 border border-band-200 bg-band-200 px-3 text-gray-900';

	return (
		<button
			aria-label={ariaLabel}
			disabled={disabled}
			className={`${baseClassName} ${className ?? ''} ${
				disabled
					? 'opacity-50 hover:scale-100 hover:cursor-not-allowed'
					: 'opacity-100 hover:scale-105 hover:cursor-pointer hover:bg-band-400'
			}`}
			onClick={onClick}
		>
			{children ? (
				children
			) : (
				<span className="whitespace-nowrap">{label}</span>
			)}
		</button>
	);
};
