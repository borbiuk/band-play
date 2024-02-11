import React from 'react';

export const Button = ({ text, icon, onClick }) => {
	return (
		<button
			className="flex h-8 w-full flex-row items-center gap-x-2 rounded-xl px-2 duration-300 bg-band-300 group hover:bg-band-400 hover:cursor-pointer"
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
