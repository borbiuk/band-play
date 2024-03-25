import React from 'react';

export interface ButtonOptions {
	// The text content of the button.
	text: string;

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
export const Button = ({ text, icon, onClick }: ButtonOptions) => {
	return (
		<button
			className="group flex h-8 w-full flex-row items-center gap-x-2 rounded-xl bg-band-200 px-2 duration-300 hover:scale-105 hover:cursor-pointer hover:bg-band-400"
			onClick={onClick}
		>
			<img
				src={icon}
				alt="buymeacoffee logo"
				className="h-6 w-6 duration-300 group-hover:scale-105"
			/>
			<span className="flex w-full justify-center text-nowrap text-sm font-normal text-gray-900 duration-300 group-hover:scale-110">
				{text}
			</span>
		</button>
	);
};
