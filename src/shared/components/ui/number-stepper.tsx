import React, { useState } from 'react';

import { Stepper } from './stepper';

export interface NumberStepperProps {
	// The element id of the number field.
	id?: string;

	// Current value.
	value: number;

	// Lowest value.
	min: number;

	// Highest value.
	max: number;

	// Unit shown after the number, for example "sec".
	unit?: string;

	// Accessible name of the field; the buttons are named "Decrease ..." and "Increase ...".
	ariaLabel: string;

	// Called with the new value when the user changes it (never when the component renders).
	onChange: (value: number) => void;

	// Next value for a button press; the default is one step.
	step?: (value: number, direction: 1 | -1) => number;
}

const oneStep = (value: number, direction: 1 | -1): number => value + direction;

/**
 * A number with minus and plus buttons. Typing is allowed: a valid number in range is saved at once,
 * an out-of-range one is clamped when the field loses focus.
 *
 * @param {NumberStepperProps} props - The props of component.
 */
export const NumberStepper = ({
	id,
	value,
	min,
	max,
	unit,
	ariaLabel,
	onChange,
	step = oneStep,
}: NumberStepperProps) => {
	// The text being typed; null while the field shows the saved value
	const [draft, setDraft] = useState<string | null>(null);

	const clamp = (next: number): number => Math.min(max, Math.max(min, next));

	const commit = (next: number): void => {
		if (next !== value) {
			onChange(next);
		}
	};

	return (
		<Stepper
			ariaLabel={ariaLabel}
			decreaseLabel={`Decrease ${ariaLabel.toLowerCase()}`}
			increaseLabel={`Increase ${ariaLabel.toLowerCase()}`}
			decreaseDisabled={value <= min}
			increaseDisabled={value >= max}
			onDecrease={() => commit(clamp(step(value, -1)))}
			onIncrease={() => commit(clamp(step(value, 1)))}
		>
			<input
				id={id}
				type="text"
				inputMode="numeric"
				aria-label={ariaLabel}
				className="w-9 bg-transparent text-center font-semibold tabular-nums outline-none"
				value={draft ?? String(value)}
				onChange={(event) => {
					const text = event.target.value;
					setDraft(text);
					const next = Number(text);
					if (
						text.trim() !== '' &&
						Number.isInteger(next) &&
						next >= min &&
						next <= max
					) {
						commit(next);
					}
				}}
				onBlur={() => {
					const next = Number(draft);
					if (
						draft !== null &&
						draft.trim() !== '' &&
						Number.isFinite(next)
					) {
						commit(clamp(Math.round(next)));
					}
					setDraft(null);
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.currentTarget.blur();
					}
				}}
			/>
			{unit && <small className="font-medium text-ink-500">{unit}</small>}
		</Stepper>
	);
};
