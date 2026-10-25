import { classNames } from '@shared/utils';
import React, { KeyboardEvent, useRef } from 'react';

export interface TabItem<T extends string> {
	// The tab id.
	id: T;

	// The tab label.
	label: string;

	// A small dot for "something is running here".
	dot?: boolean;

	// Text for the dot, read by screen readers.
	dotLabel?: string;
}

export interface TabsProps<T extends string> {
	// The tabs.
	items: TabItem<T>[];

	// The selected tab.
	selected: T;

	// Called when the user selects a tab.
	onSelect: (id: T) => void;

	// Accessible name of the tab list.
	ariaLabel: string;
}

/** Id of the tab button, also used by the panel's `aria-labelledby`. */
export const tabId = (id: string): string => `tab-${id}`;

/** Id of the panel of a tab. */
export const panelId = (id: string): string => `panel-${id}`;

/**
 * Text tab list with an underline on the selected tab, with arrow key, Home and End navigation (the selected tab is the only one in the tab order).
 *
 * @param {TabsProps} props - The props of component.
 */
export const Tabs = <T extends string>({
	items,
	selected,
	onSelect,
	ariaLabel,
}: TabsProps<T>) => {
	const refs = useRef<Record<string, HTMLButtonElement | null>>({});

	const select = (id: T) => {
		onSelect(id);
		refs.current[id]?.focus();
	};

	const handleKeyDown = (event: KeyboardEvent, index: number) => {
		const last = items.length - 1;
		const targets: Record<string, number> = {
			ArrowRight: index === last ? 0 : index + 1,
			ArrowLeft: index === 0 ? last : index - 1,
			Home: 0,
			End: last,
		};
		if (!(event.key in targets)) {
			return;
		}

		event.preventDefault();
		select(items[targets[event.key]].id);
	};

	return (
		<div
			role="tablist"
			aria-label={ariaLabel}
			className="grid grid-cols-4 border-b border-line"
		>
			{items.map((item, index) => {
				const isSelected = item.id === selected;
				return (
					<button
						key={item.id}
						ref={(element) => {
							refs.current[item.id] = element;
						}}
						type="button"
						role="tab"
						id={tabId(item.id)}
						aria-selected={isSelected}
						aria-controls={
							isSelected ? panelId(item.id) : undefined
						}
						tabIndex={isSelected ? 0 : -1}
						onClick={() => onSelect(item.id)}
						onKeyDown={(event) => handleKeyDown(event, index)}
						className={classNames(
							'relative -mb-px flex h-9 cursor-pointer items-center justify-center border-0 border-b-2 bg-transparent text-[13px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aqua-500',
							isSelected
								? 'border-aqua-500 text-ink-900'
								: 'border-transparent text-ink-500 hover:text-ink-900'
						)}
					>
						<span className="relative inline-flex">
							{item.label}
							{item.dot && (
								<span
									role="img"
									aria-label={item.dotLabel}
									className="absolute -right-2.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-pink-500"
								/>
							)}
						</span>
					</button>
				);
			})}
		</div>
	);
};
