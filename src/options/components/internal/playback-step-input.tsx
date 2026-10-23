import React, { useState } from 'react';

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

	// The setting is saved by the user's action: opening the popup writes nothing
	const commit = (next: number) => {
		if (next === value) {
			return;
		}

		setValue(next);
		onChange(id, next);
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(event.target.value);
		if (isNaN(newValue)) {
			return;
		}

		if (newValue > max) {
			commit(max);
		} else if (newValue < min) {
			commit(min);
		} else {
			commit(newValue);
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
		commit(Math.min(max, round(value, 'increment')));
	const handleDecrement = () =>
		commit(Math.max(min, round(value, 'decrement')));

	return (
		<div className="w-full">
			<div className="relative flex items-center">
				{/* Decrement button */}
				<button
					type="button"
					id={`${id}-decrement-button`}
					aria-label="Decrease playback step"
					className="h-6 rounded-s-lg border border-band-200 bg-band-200 px-2 pt-1 outline-none duration-300 hover:scale-110 hover:bg-band-400 focus-visible:ring-2 focus-visible:ring-band-700"
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
						aria-label="Playback step in seconds"
						min={min}
						max={max}
						value={value}
						className="block h-full w-full border-y border-band-200 bg-band-100 text-center text-sm font-normal tabular-nums text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-band-700"
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
					aria-label="Increase playback step"
					className="h-6 rounded-e-lg border border-band-200 bg-band-200 px-2 outline-none duration-300 hover:scale-110 hover:bg-band-400 focus-visible:ring-2 focus-visible:ring-band-700"
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
