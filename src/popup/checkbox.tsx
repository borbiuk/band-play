import React, { useEffect, useState } from 'react';

export const Checkbox = ({ id, label, defaultValue, onChange }) => {
	const [isChecked, setIsChecked] = useState(defaultValue);

	useEffect(() => {
		onChange(id, isChecked);
	}, [isChecked]);

	return (
		<label className="inline-flex items-center rounded-full cursor-pointer h-6" htmlFor={id}>
			<div className="relative flex items-center">
				<input
					type="checkbox"
					className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-900/20 bg-gray-900/10 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-band-500 before:opacity-0 before:transition-opacity checked:border-b-band-700 checked:bg-band-700 checked:before:bg-band-700 hover:scale-110 hover:before:opacity-0 duration-300"
					id={id}
					checked={isChecked}
					onChange={() => setIsChecked(!isChecked)}
				/>
				<span
					className="absolute text-gray-100 transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-3.5 w-3.5"
						viewBox="0 0 20 20"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="1"
					>
						<path
							fill-rule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						></path>
					</svg>
				</span>
			</div>

			<span className="pl-1.5 text-sm text-gray-900">{label}</span>
		</label>
	);
};
