import React, { useState } from 'react';

export const AnimatedButton = ({ label, onClick }) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		setIsLoading(true);
		onClick();
		setTimeout(() => {
			setIsLoading(false);
		}, 300);
	};

	return (
		<button
			className={`flex h-6 w-full items-center justify-items-center rounded-lg border border-band-200 p-2 outline-none duration-300 ${
				isLoading
					? 'bg-band-500 text-gray-100 hover:bg-band-500'
					: 'bg-band-200 text-black'
			} transition-all ease-in-out hover:scale-105 hover:bg-band-400`}
			onClick={handleClick}
		>
			{/* Text */}
			<span
				className={`w-full transition-all duration-300 ${isLoading ? 'text-gray-200' : 'text-gray-900'}`}
			>
				{label}
			</span>
		</button>
	);
};
