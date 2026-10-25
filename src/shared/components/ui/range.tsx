import React, { CSSProperties } from 'react';

import '../../styles/ui.scss';

export interface RangeProps {
	// The element id.
	id?: string;

	// Current value.
	value: number;

	// Lowest value.
	min: number;

	// Highest value.
	max: number;

	// Called with the new value when the user moves the slider.
	onChange: (value: number) => void;

	// Accessible name when there is no visible label.
	ariaLabel?: string;
}

/**
 * Slider with a filled track.
 *
 * @param {RangeProps} props - The props of component.
 */
export const Range = ({
	id,
	value,
	min,
	max,
	onChange,
	ariaLabel,
}: RangeProps) => {
	const percent = ((value - min) / (max - min)) * 100;

	return (
		<input
			id={id}
			type="range"
			className="bp-range"
			style={{ '--bp-pct': `${percent}%` } as CSSProperties}
			aria-label={ariaLabel}
			min={min}
			max={max}
			value={value}
			onChange={(event) => onChange(Number(event.target.value))}
		/>
	);
};
