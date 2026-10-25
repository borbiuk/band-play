import { classNames } from '@shared/utils';
import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

import '../../styles/ui.scss';

/** Width: a `w-*` class in `className` wins, otherwise the field fills its parent. */
const widthOf = (className?: string): string =>
	/(^|\s)w-/.test(className ?? '') ? '' : 'w-full';

const fieldClassName =
	'border border-line-strong bg-white px-2.5 text-ink-900 transition-[border-color,box-shadow] duration-150 placeholder:text-ink-500 hover:border-aqua-300 focus-visible:border-aqua-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-aqua-500/20';

export type FieldProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'className'
> & {
	// Extra class names for layout (width, margin).
	className?: string;

	// Smaller field (28 px high).
	small?: boolean;
};

/**
 * Text field. Placeholders use ink-500, the lightest text color that passes AA.
 *
 * @param {FieldProps} props - The props of component.
 */
export const Field = ({ className, small, ...rest }: FieldProps) => {
	return (
		<input
			className={classNames(
				fieldClassName,
				small ? 'h-7 rounded-[9px] text-xs' : 'h-8 rounded-ctl',
				widthOf(className),
				className
			)}
			{...rest}
		/>
	);
};

export type SelectProps = Omit<
	SelectHTMLAttributes<HTMLSelectElement>,
	'className'
> & {
	// Extra class names for layout (width, margin).
	className?: string;

	// Smaller select (28 px high).
	small?: boolean;
};

/**
 * Select with a custom arrow.
 *
 * @param {SelectProps} props - The props of component.
 */
export const Select = ({ className, small, ...rest }: SelectProps) => {
	return (
		<select
			className={classNames(
				fieldClassName,
				'bp-select font-medium',
				small ? 'h-7 rounded-[9px] text-xs' : 'h-8 rounded-ctl',
				widthOf(className),
				className
			)}
			{...rest}
		/>
	);
};
