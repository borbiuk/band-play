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
