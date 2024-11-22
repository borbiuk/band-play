import React from 'react';
import { Tooltip } from 'react-tooltip';

export interface ButtonOptions {
	// The unique identifier for the button.
	id: string;

	// The tooltip value.
	tooltip: string;

	// The source URL of the icon to be displayed beside the text.
	icon: string;

	// The callback function to be executed when the button is clicked.
	onClick: () => void;
}

/**
 * Button component for rendering a customizable button with text and an optional icon.
 *
 * @param {ButtonOptions} options - The options of component.
 */
export const Button = ({ id, tooltip, icon, onClick }: ButtonOptions) => {
	return (
		<div>
			<button
				id={id}
				data-tooltip-id={id}
				className="flex h-8 w-8 justify-center rounded-full duration-100 hover:cursor-pointer hover:bg-band-400"
				onClick={onClick}
			>
				{/* Icon */}
				<img src={icon} alt="icon" className="h-8 p-1" />
			</button>
			<Tooltip
				id={id}
				className="max-w-32"
				variant="light"
				place="top"
				opacity={1}
				offset={6}
				delayShow={100}
			>
				<span className="text-sm text-gray-900">{tooltip}</span>
			</Tooltip>
		</div>
	);
};
