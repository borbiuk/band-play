import React, { ReactNode } from 'react';

export interface StepperProps {
	// The value part: a read-only text or an input, with an optional unit.
	children: ReactNode;

	// Called by the minus button.
	onDecrease: () => void;

	// Called by the plus button.
	onIncrease: () => void;

	// Accessible name of the group.
	ariaLabel: string;

	// Accessible name of the minus button.
	decreaseLabel?: string;

	// Accessible name of the plus button.
	increaseLabel?: string;

	// Disables the minus button, for example at the lowest value.
	decreaseDisabled?: boolean;

	// Disables the plus button, for example at the highest value.
	increaseDisabled?: boolean;
}

const stepButtonClassName =
	'w-8 cursor-pointer border-0 bg-transparent text-base text-ink-700 hover:bg-aqua-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua-500 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Minus and plus buttons around a value.
 *
 * @param {StepperProps} props - The props of component.
 */
export const Stepper = ({
	children,
	onDecrease,
	onIncrease,
	ariaLabel,
	decreaseLabel = 'Decrease',
	increaseLabel = 'Increase',
	decreaseDisabled,
	increaseDisabled,
}: StepperProps) => {
	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className="inline-flex h-8 items-stretch overflow-hidden rounded-ctl border border-line-strong bg-white focus-within:border-aqua-500 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-aqua-500 has-[input:focus-visible]:ring-offset-2"
		>
			<button
				type="button"
				aria-label={decreaseLabel}
				className={stepButtonClassName}
				disabled={decreaseDisabled}
				onClick={onDecrease}
			>
				&minus;
			</button>
			<div className="flex min-w-[62px] items-center justify-center gap-[3px] border-x border-line px-2 font-semibold tabular-nums">
				{children}
			</div>
			<button
				type="button"
				aria-label={increaseLabel}
				className={stepButtonClassName}
				disabled={increaseDisabled}
				onClick={onIncrease}
			>
				+
			</button>
		</div>
	);
};
