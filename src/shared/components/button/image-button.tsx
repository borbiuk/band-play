import React from 'react';
import { Tooltip } from 'react-tooltip';

export interface ImageButtonProps {
	// The unique identifier for the button.
	id: string;

	// The tooltip value.
	tooltip: string;

	// The source URL of the image to be displayed.
	image: string;

	// The callback function to be executed when the button is clicked.
	onClick: () => void;
}

/**
 * ImageButton component for rendering a circular image button with a tooltip.
 *
 * @param {ImageButtonProps} props - The props of component.
 */
export const ImageButton = ({
	id,
	tooltip,
	image,
	onClick,
}: ImageButtonProps) => {
	return (
		<>
			<button
				id={id}
				type="button"
				aria-label={tooltip}
				data-tooltip-id={id}
				className="flex h-9 w-9 justify-center rounded-full outline-none transition-all duration-300 ease-in-out hover:scale-102 hover:cursor-pointer hover:bg-band-400 focus-visible:ring-2 focus-visible:ring-band-700"
				onClick={onClick}
			>
				<img src={image} alt="" className="h-9 p-1" />
			</button>
			<Tooltip
				id={id}
				className="!z-[9999] max-w-32"
				variant="light"
				place="left"
				opacity={1}
				offset={6}
				delayShow={100}
			>
				<span className="text-sm text-gray-900">{tooltip}</span>
			</Tooltip>
		</>
	);
};
