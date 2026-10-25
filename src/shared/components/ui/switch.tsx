import { classNames } from '@shared/utils';
import React, { ChangeEvent, useContext } from 'react';

import { SettingRowHintContext } from './card';

export interface SwitchProps {
	// The element id (also used by labels).
	id?: string;

	// Whether the switch is on.
	checked: boolean;

	// Called with the new value when the user changes the switch.
	onChange: (checked: boolean) => void;

	// Accessible name when there is no visible label.
	ariaLabel?: string;

	// Red "on" color for risky settings.
	danger?: boolean;

	// Whether the switch is disabled.
	disabled?: boolean;
}

/**
 * On/off switch. A native checkbox with `role="switch"`: the `switch` attribute is not in Chrome or Firefox.
 * It only reports user changes, so nothing is written when it renders.
 *
 * @param {SwitchProps} props - The props of component.
 */
export const Switch = ({
	id,
	checked,
	onChange,
	ariaLabel,
	danger,
	disabled,
}: SwitchProps) => {
	// The hint of the row the switch sits in is its description
	const hintId = useContext(SettingRowHintContext);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked);
	};

	return (
		<input
			id={id}
			type="checkbox"
			role="switch"
			aria-label={ariaLabel}
			aria-describedby={hintId}
			checked={checked}
			disabled={disabled}
			onChange={handleChange}
			className={classNames(
				"relative m-0 h-[22px] w-[38px] shrink-0 cursor-pointer appearance-none rounded-full bg-[#c3d6de] shadow-[inset_0_0_0_1.5px_#7f98a3] transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.28)] after:transition-transform after:duration-200 after:content-[''] checked:bg-gradient-to-b checked:shadow-none checked:after:translate-x-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				danger
					? 'checked:from-coral-500 checked:to-danger'
					: 'checked:from-[#3db6d8] checked:to-aqua-500'
			)}
		/>
	);
};
