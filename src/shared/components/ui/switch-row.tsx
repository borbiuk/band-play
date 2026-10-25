import React, { ReactNode } from 'react';

import { SettingRow } from './card';
import { Switch } from './switch';

export interface SwitchRowProps {
	// The label; it is also the accessible name of the switch.
	label: string;

	// A short explanation under the label.
	hint?: ReactNode;

	// Whether the switch is on.
	checked: boolean;

	// Called with the new value when the user changes the switch.
	onChange: (checked: boolean) => void;
}

/**
 * A settings row with a switch on the right; a click anywhere on the row toggles it.
 *
 * @param {SwitchRowProps} props - The props of component.
 */
export const SwitchRow = ({
	label,
	hint,
	checked,
	onChange,
}: SwitchRowProps) => {
	return (
		<SettingRow asLabel label={label} hint={hint}>
			<Switch ariaLabel={label} checked={checked} onChange={onChange} />
		</SettingRow>
	);
};
