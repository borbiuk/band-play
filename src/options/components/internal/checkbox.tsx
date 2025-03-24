import React, { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { ConfigModel } from '@shared/models/config-model';

export interface CheckBoxOptions {
	// The unique identifier for the checkbox.
	id: keyof ConfigModel;

	// The label for the checkbox.
	label: string;

	// The tooltip value.
	tooltip: string;

	// The default value for the checkbox.
	defaultValue: boolean;

	// The callback function to be executed when the value changes.
	onChange: (id: string, isChecked: boolean) => void;
}

/**
 * Checkbox component for handling boolean input with a checkbox.
 *
 * @param {CheckBoxOptions} options - The options of component.
 */
export const Checkbox = ({
	id,
	label,
	tooltip,
	defaultValue,
	onChange,
}: CheckBoxOptions) => {
	const [isChecked, setIsChecked] = useState(defaultValue);

	useEffect(() => {
		onChange(id, isChecked);
	}, [isChecked]);

	return (
		<div>
			<label
				className="inline-flex h-6 w-full cursor-pointer items-center rounded-full hover:cursor-pointer"
				htmlFor={id}
				data-tooltip-id={id}
			>
				<div className="relative flex items-center">
					<input
						type="checkbox"
						className="before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-900/20 bg-gray-900/10 transition-all duration-300 before:absolute before:left-2/4 before:top-2/4 before:block before:h-12 before:w-12 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:bg-band-500 before:opacity-0 before:transition-opacity checked:border-b-band-700 checked:bg-band-700 checked:before:bg-band-700 hover:scale-115 hover:before:opacity-0"
						id={id}
						checked={isChecked}
						onChange={() => setIsChecked(!isChecked)}
					/>
					<span className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-gray-100 opacity-0 transition-opacity peer-checked:opacity-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-3.5 w-3.5"
							viewBox="0 0 20 20"
							fill="currentColor"
							stroke="currentColor"
						>
							<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
						</svg>
					</span>
				</div>

				<span className="pl-1.5 text-sm text-gray-900">{label}</span>
			</label>
			<Tooltip
				id={id}
				className="max-w-40"
				variant="light"
				place="top"
				opacity={1}
				offset={1}
				delayShow={200}
			>
				<span className="text-xs text-gray-900">{tooltip}</span>
			</Tooltip>
		</div>
	);
};
