import React from 'react';

/**
 * Button component for rendering a customizable button with text and an optional icon.
 *
 * @param {string} text - The text content of the button.
 * @param {string} icon - The source URL of the icon to be displayed beside the text.
 * @param {Function} onClick - The callback function to be executed when the button is clicked.
 */
export const Button = ({ text, icon, onClick }) => {
	return (
		<button
			className="flex h-8 w-full flex-row items-center gap-x-2 rounded-xl px-2 duration-300 bg-band-300 group hover:bg-band-400 hover:scale-105 hover:cursor-pointer"
			onClick={onClick}
		>
			<img
				src={icon}
				alt="buymeacoffee logo"
				className="h-6 w-6 duration-300 group-hover:scale-105"
			/>
			<span className="flex w-full justify-center text-sm font-normal text-gray-900 duration-300 text-nowrap group-hover:scale-110">
				{text}
			</span>
		</button>
	);
};
