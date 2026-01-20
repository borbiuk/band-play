import React, { useEffect, useState } from 'react';

export interface PlaybackStepInputOptions {
	// The unique identifier for the input.
	id: string;

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
 * @param {PlaybackStepInputOptions} options - The options of component.
 */
export const PlaybackStepInput = ({
	id,
	defaultValue,
	min,
	max,
	suffix,
	onChange,
}: PlaybackStepInputOptions) => {
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

	const round = (value: number, direction: 'increment' | 'decrement') => {
		const remainder = value % 5;

		if (remainder === 0) {
			return value + (direction === 'increment' ? 5 : -5);
		}

		return direction === 'increment'
			? value + (5 - remainder)
			: value - remainder;
	};

	const handleIncrement = () =>
		setValue(Math.min(max, round(value, 'increment')));
	const handleDecrement = () =>
		setValue(Math.max(min, round(value, 'decrement')));

	return (
		<div className="w-full">
			<div className="relative flex items-center">
				{/* Decrement button */}
				<button
					type="button"
					id={`${id}-decrement-button`}
					className="h-6 rounded-s-lg border border-band-200 bg-band-200 px-2 pt-1 outline-none duration-300 hover:scale-110 hover:bg-band-400"
					onClick={handleDecrement}
				>
					<svg
						className="h-3 w-3 text-gray-900"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 18 9"
					>
						<path stroke="currentColor" d="M1 1h16" />
					</svg>
				</button>

				{/* Input */}
				<div className="relative h-6 w-full">
					<input
						type="number"
						id={`${id}-number-input`}
						min={min}
						max={max}
						value={value}
						className="block h-full w-full border-y border-band-200 bg-band-100 text-center text-sm font-normal tabular-nums text-gray-900 outline-none"
						placeholder={max.toString()}
						onChange={handleChange}
						required
					/>
					<span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">
						{suffix}
					</span>
				</div>

				{/* Increment button */}
				<button
					type="button"
					id={`${id}-increment-button`}
					className="h-6 rounded-e-lg border border-band-200 bg-band-200 px-2 outline-none duration-300 hover:scale-110 hover:bg-band-400"
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
