import { classNames } from '@shared/utils';
import React, { createContext, ReactNode, useId } from 'react';

/** The id of the hint of the surrounding `SettingRow`, so its control can describe itself with it. */
export const SettingRowHintContext = createContext<string | undefined>(
	undefined
);

export interface CardProps {
	// The card content, usually `SettingRow` elements.
	children: ReactNode;

	// Extra class names for layout.
	className?: string;
}

/**
 * White card with a hairline border and a soft shadow.
 *
 * @param {CardProps} props - The props of component.
 */
export const Card = ({ children, className }: CardProps) => {
	return (
		<div
			className={classNames(
				'overflow-hidden rounded-card border border-line bg-white shadow-card',
				className
			)}
		>
			{children}
		</div>
	);
};

export interface CardTitleProps {
	// The overline text.
	children: ReactNode;
}

/**
 * Small caps title above a card.
 *
 * @param {CardTitleProps} props - The props of component.
 */
export const CardTitle = ({ children }: CardTitleProps) => {
	return (
		<h2 className="mx-1 mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-500">
			{children}
		</h2>
	);
};

export interface SettingRowProps {
	// The main label.
	label: ReactNode;

	// A short explanation under the label.
	hint?: ReactNode;

	// The control on the right (switch, stepper, button).
	children: ReactNode;

	// Red hint for risky settings.
	danger?: boolean;

	// Renders a `<label>` so a click anywhere on the row toggles the control inside.
	asLabel?: boolean;

	// The id of the control the label belongs to.
	htmlFor?: string;
}

/**
 * Row of a settings card: label and hint on the left, control on the right.
 * Rows in the same card are separated by a hairline.
 *
 * @param {SettingRowProps} props - The props of component.
 */
export const SettingRow = ({
	label,
	hint,
	children,
	danger,
	asLabel,
	htmlFor,
}: SettingRowProps) => {
	const hintId = useId();
	const className =
		'flex min-h-12 items-center justify-between gap-3 px-3.5 py-2.5 [&+&]:border-t [&+&]:border-line';
	const content = (
		<>
			<span className="min-w-0">
				<span className="block font-medium text-ink-900">{label}</span>
				{hint && (
					<span
						id={hintId}
						className={classNames(
							'mt-0.5 block text-xs leading-[1.3]',
							danger ? 'text-danger' : 'text-ink-500'
						)}
					>
						{hint}
					</span>
				)}
			</span>
			<SettingRowHintContext.Provider value={hint ? hintId : undefined}>
				{children}
			</SettingRowHintContext.Provider>
		</>
	);

	if (asLabel) {
		return (
			<label
				htmlFor={htmlFor}
				className={classNames(
					className,
					'cursor-pointer hover:bg-aqua-50'
				)}
			>
				{content}
			</label>
		);
	}

	return <div className={className}>{content}</div>;
};
