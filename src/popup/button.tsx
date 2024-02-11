import React from 'react';

export const Button = ({ text, icon, onClick }) => {
	return (
		<button
			className="bg-band-300 hover:bg-band-400 hover:cursor-pointer w-full h-8 flex flex-row items-center rounded-xl gap-x-2 px-2 duration-300"
			onClick={onClick}
		>
			<img
				src={icon}
				alt="buymeacoffee logo"
				className="h-6 w-6"
			/>
			<span className="flex justify-center w-full font-normal text-sm text-nowrap text-gray-900">
				{text}
			</span>
		</button>
	);
};
