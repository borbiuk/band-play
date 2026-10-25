import { Button, Chip, Field, Select } from '@shared/components/ui';
import {
	ChevronsDownUp,
	ChevronsUpDown,
	Pause,
	Play,
	RotateCcw,
	Search,
} from 'lucide-react';
import React from 'react';

import { FilterKey, SortKey } from '../utils/list.utils';

import { ActionsMenu } from './actions-menu';

const FILTERS: { key: FilterKey; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'active', label: 'Active' },
	{ key: 'paused', label: 'Paused' },
	{ key: 'failed', label: 'Failed' },
	{ key: 'done', label: 'Done' },
];

export interface ControlsBarProps {
	// The selected filter, and the count of each.
	filter: FilterKey;
	counts: Record<FilterKey, number>;
	onFilter: (filter: FilterKey) => void;

	// The search text.
	query: string;
	onQuery: (query: string) => void;

	// The sort.
	sort: SortKey;
	onSort: (sort: SortKey) => void;

	// Fold or unfold all bundles; hidden when there is no bundle.
	hasBundles: boolean;
	allUnfolded: boolean;
	onToggleBundles: () => void;

	// The main action: pause while something downloads, otherwise resume; off when neither applies.
	mainAction: 'pause' | 'resume' | null;
	onMainAction: () => void;

	// Retry all failed; hidden when nothing failed.
	failedCount: number;
	onRetryFailed: () => void;

	// The menu.
	canClearCompleted: boolean;
	onClearCompleted: () => void;
	onClearAll: () => void;
}

/**
 * Filters, search, sort and the actions for the whole list.
 *
 * @param {ControlsBarProps} props - The props of component.
 */
export const ControlsBar = (props: ControlsBarProps) => {
	const isPause = props.mainAction === 'pause';
	return (
		<div className="mt-2.5 flex flex-wrap items-center gap-2">
			<div
				role="group"
				aria-label="Filter by status"
				className="flex flex-wrap gap-1.5"
			>
				{FILTERS.map(({ key, label }) => (
					<Chip
						key={key}
						pressed={props.filter === key}
						count={props.counts[key]}
						danger={key === 'failed'}
						onClick={() => props.onFilter(key)}
					>
						{label}
					</Chip>
				))}
			</div>
			<div className="relative w-[190px] max-[1100px]:w-[150px] min-[1100px]:w-[190px]">
				<Search
					size={15}
					aria-hidden="true"
					className="absolute left-[9px] top-1.5 text-ink-400"
				/>
				<Field
					small
					type="search"
					className="pl-[29px]"
					placeholder="Search downloads"
					aria-label="Search downloads"
					value={props.query}
					onChange={(event) => props.onQuery(event.target.value)}
				/>
			</div>
			<Select
				small
				className="w-[136px]"
				aria-label="Sort by"
				value={props.sort}
				onChange={(event) =>
					props.onSort(event.target.value as SortKey)
				}
			>
				<option value="queue">Queue order</option>
				<option value="title">Title A–Z</option>
				<option value="status">Status</option>
			</Select>
			{props.hasBundles && (
				<Button
					small
					icon
					variant="ghost"
					title={
						props.allUnfolded
							? 'Fold all bundles'
							: 'Unfold all bundles'
					}
					aria-label={
						props.allUnfolded
							? 'Fold all bundles'
							: 'Unfold all bundles'
					}
					onClick={props.onToggleBundles}
				>
					{props.allUnfolded ? (
						<ChevronsDownUp size={16} aria-hidden="true" />
					) : (
						<ChevronsUpDown size={16} aria-hidden="true" />
					)}
				</Button>
			)}

			<div className="ml-auto flex items-center gap-2">
				<Button
					small
					variant="primary"
					disabled={props.mainAction === null}
					onClick={props.onMainAction}
				>
					{isPause ? (
						<Pause size={15} aria-hidden="true" />
					) : (
						<Play size={15} aria-hidden="true" />
					)}
					{isPause ? 'Pause all' : 'Resume all'}
				</Button>
				{props.failedCount > 0 && (
					<Button small onClick={props.onRetryFailed}>
						<RotateCcw size={15} aria-hidden="true" />
						Retry failed
						<span className="ml-0.5 inline-flex h-[18px] items-center rounded-full bg-danger-bg px-[7px] text-[11px] font-bold text-danger">
							{props.failedCount}
						</span>
					</Button>
				)}
				<ActionsMenu
					canClearCompleted={props.canClearCompleted}
					onClearCompleted={props.onClearCompleted}
					onClearAll={props.onClearAll}
				/>
			</div>
		</div>
	);
};
