import { classNames } from '@shared/utils';
import React, { ButtonHTMLAttributes } from 'react';

export type ButtonVariant =
	'default' | 'primary' | 'ghost' | 'ghostDanger' | 'danger' | 'dangerSolid';

export interface ButtonProps extends Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'className'
> {
	// Visual style of the button.
	variant?: ButtonVariant;

	// Small size (28 px high).
	small?: boolean;

	// Square icon button: the content is an icon, and `aria-label` is required.
	icon?: boolean;

	// Extra class names for layout (width, margin).
	className?: string;
}

// Padding and size are in one place per kind, so two classes never set the same property
const sizes = {
	md: {
		text: 'h-8 rounded-ctl px-3 text-[13px]',
		icon: 'h-8 w-8 rounded-ctl text-[13px]',
	},
	sm: {
		text: 'h-7 rounded-[9px] px-2.5 text-xs',
		icon: 'h-7 w-7 rounded-[9px] text-xs',
	},
};

const variants: Record<ButtonVariant, string> = {
	default:
		'border-line-strong bg-white text-ink-900 hover:border-aqua-300 hover:bg-aqua-50',
	primary:
		'border-aqua-700 bg-aqua-700 text-white hover:border-aqua-800 hover:bg-aqua-800',
	ghost: 'border-transparent bg-transparent text-ink-700 hover:bg-aqua-500/10',
	ghostDanger:
		'border-transparent bg-transparent text-ink-700 hover:bg-danger-bg hover:text-danger',
	danger: 'border-[#ffcdbd] bg-white text-danger hover:border-[#ffb59e] hover:bg-danger-bg',
	dangerSolid:
		'border-danger bg-danger text-white hover:border-[#9a3412] hover:bg-[#9a3412]',
};

/**
 * Button of the Band Play kit: one primary button per area, outlined danger for destructive actions.
 *
 * @param {ButtonProps} props - The props of component.
 */
export const Button = ({
	variant = 'default',
	small,
	icon,
	className,
	type = 'button',
	...rest
}: ButtonProps) => {
	return (
		<button
			type={type}
			className={classNames(
				'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border font-semibold leading-none transition-[background-color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
				sizes[small ? 'sm' : 'md'][icon ? 'icon' : 'text'],
				variants[variant],
				className
			)}
			{...rest}
		/>
	);
};
