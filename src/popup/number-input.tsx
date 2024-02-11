import React, { useEffect, useState } from 'react';

export const NumberInput = ({
	id,
	label,
	defaultValue,
	min,
	max,
	onChange,
}) => {
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

	const handleDecrement = () => setValue(Math.max(min, value - 1));

	const handleIncrement = () => setValue(Math.min(max, value + 1));

	return (
		<div className="w-full">
			<label
				htmlFor={`${id}-number-input`}
				className="mb-1 block cursor-pointer pl-7 text-sm text-gray-900 -ml-0.5"
			>
				{label}
			</label>
			<div className="relative flex items-center">
				<button
					type="button"
					id={`${id}-decrement-button`}
					className="h-8 border p-2 outline-none duration-300 bg-band-300 border-band-200 rounded-s-lg hover:bg-band-400 hover:scale-110"
					onClick={handleDecrement}
				>
					<svg
						className="h-3 w-3 text-gray-900"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 18 2"
					>
						<path stroke="currentColor" d="M1 1h16" />
					</svg>
				</button>
				<input
					type="number"
					id={`${id}-number-input`}
					min={min}
					max={max}
					value={value}
					className="block h-8 w-full border-y text-center text-base font-medium tabular-nums text-gray-900 outline-none bg-band-100 border-band-200 py-2.5"
					placeholder={max}
					onChange={handleChange}
					required
				/>
				<button
					type="button"
					id={`${id}-increment-button`}
					className="h-8 border p-2 outline-none duration-300 bg-band-300 border-band-200 rounded-e-lg hover:bg-band-400 hover:scale-110"
					onClick={handleIncrement}
				>
					<svg
						className="h-3 w-3 text-gray-900"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 18 18"
					>
						<path stroke="currentColor" d="M9 1v16M1 9h16" />
					</svg>
				</button>
			</div>
		</div>
	);
};
