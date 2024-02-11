import React, { useEffect, useState } from 'react';

export const NumberInput = ({ id, label, defaultValue, min, max, onChange }) => {

	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		onChange(id, value);
	}, [value]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(event.target.value);
		if (isNaN(newValue)) {
			return;
		}

		if (newValue > max) {
			setValue(max);
		} else if (newValue < min) {
			setValue(min);
		} else {
			setValue(newValue);
		}
	};

	const handleDecrement = () => {
		setValue(Math.max(min, value - 1));
	};

	const handleIncrement = () => {
		setValue(Math.min(max, value + 1));
	};

	return (
		<div className="w-full">
			<label htmlFor={`${id}-number-input`} className="pl-7 -ml-0.5 block mb-1 text-sm text-gray-900">{label}</label>
			<div className="relative flex items-center">
				<button
					type="button"
					id={`${id}-decrement-button`}
					className="bg-band-300 hover:bg-band-400 duration-300 border border-band-200 rounded-s-lg p-2 h-8 outline-none"
					onClick={handleDecrement}
				>
					<svg className="w-3 h-3 text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
					</svg>
				</button>
				<input
					type="number"
					id={`${id}-number-input`}
					min={min}
					max={max}
					value={value}
					className="bg-band-100 border-y border-band-200 h-8 text-center text-gray-900 text-base font-medium outline-none block w-full py-2.5 tabular-nums"
					placeholder={max}
					onChange={handleChange}
					required
				/>
				<button
					type="button"
					id={`${id}-increment-button`}
					className="bg-band-300 hover:bg-band-400 duration-300 border border-band-200 rounded-e-lg p-2 h-8 outline-none"
					onClick={handleIncrement}
				>
					<svg className="w-3 h-3 text-gray-900 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
					</svg>
				</button>
			</div>
		</div>
	);
};
