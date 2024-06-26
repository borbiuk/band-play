import React, { useEffect, useState } from 'react';

export interface NumberInputOptions {
	// The unique identifier for the input.
	id: string;

	// The label for the input.
	label: string;

	// The default value for the input.
	defaultValue: number;

	// The minimum allowed value for the input.
	min: number;

	// The maximum allowed value for the input.
	max: number;

	// The suffix to be displayed next to the input value.
	suffix: string;

	// The callback function to be executed when the value changes.
	onChange: (id: string, value: number) => void;
}

/**
 * NumberInput component for handling numeric input with increment and decrement buttons.
 *
 * @param {NumberInputOptions} options - The options of component.
 */
export const NumberInput = ({
	id,
	label,
	defaultValue,
	min,
	max,
	suffix,
	onChange,
}: NumberInputOptions) => {
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

	const handleDecrement = () => setValue(Math.max(min, value - 5));

	const handleIncrement = () => setValue(Math.min(max, value + 5));

	return (
		<div className="w-full">
			<label
				htmlFor={`${id}-number-input`}
				className="-ml-0.5 mb-1 block cursor-pointer pl-7 text-sm text-gray-900"
			>
				{label}
			</label>
			<div className="relative flex items-center">
				<button
					type="button"
					id={`${id}-decrement-button`}
					className="h-8 rounded-s-lg border border-band-200 bg-band-200 p-2 outline-none duration-300 hover:scale-110 hover:bg-band-400"
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
				<div className="relative h-8 w-full">
					<input
						type="number"
						id={`${id}-number-input`}
						min={min}
						max={max}
						value={value}
						className="block h-full w-full border-y border-band-200 bg-band-100 py-2.5 text-center text-base font-medium tabular-nums text-gray-900 outline-none"
						placeholder={max.toString()}
						onChange={handleChange}
						required
					/>
					<span className="absolute bottom-1 right-2 pt-1 text-xs text-gray-500">
						{suffix}
					</span>
				</div>

				<button
					type="button"
					id={`${id}-increment-button`}
					className="h-8 rounded-e-lg border border-band-200 bg-band-200 p-2 outline-none duration-300 hover:scale-110 hover:bg-band-400"
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
