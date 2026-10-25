import {
	Button,
	Card,
	ConfirmDialog,
	Field,
	Kbd,
	Switch,
} from '@shared/components/ui';
import { ShortcutType } from '@shared/enums';
import configService from '@shared/services/config-service';
import { Pencil, RotateCcw, Search } from 'lucide-react';
import React, { useState } from 'react';

import { toKeyLabels } from '../../utils/shortcut-recorder.utils';
import { ShortcutEditDialog } from '../shortcut-edit-dialog';

import { TabProps } from './types';

/**
 * Shortcuts tab: search, a scrolling list with an edit button and a switch per shortcut, and Reset.
 *
 * @param {TabProps} props - The props of component.
 */
export const ShortcutsTab = ({ config, update }: TabProps) => {
	const [query, setQuery] = useState('');
	const [editing, setEditing] = useState<ShortcutType | null>(null);
	const [isResetOpen, setIsResetOpen] = useState(false);

	const defaults = configService.defaultShortcuts();
	const types = (Object.values(ShortcutType) as ShortcutType[]).filter(
		(type) => type.toLowerCase().includes(query.trim().toLowerCase())
	);

	const toggle = (type: ShortcutType, enabled: boolean) => {
		const others = config.disabledShortcuts.filter((x) => x !== type);
		update('disabledShortcuts', enabled ? others : [...others, type]);
	};

	// An empty object means "every default"; the screen follows the storage change
	const resetAll = () => {
		configService.resetShortcuts().catch((e) => console.error(e));
	};

	return (
		<div className="flex h-full flex-col gap-3.5">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search
						size={16}
						aria-hidden="true"
						className="absolute left-2.5 top-2 text-ink-400"
					/>
					<Field
						type="search"
						className="pl-8"
						placeholder="Search shortcuts"
						aria-label="Search shortcuts"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</div>
				<Button
					small
					className="h-8"
					onClick={() => setIsResetOpen(true)}
				>
					<RotateCcw size={15} aria-hidden="true" />
					Reset
				</Button>
			</div>

			<Card className="min-h-0 flex-1 overflow-y-auto">
				<ul
					aria-label="Keyboard shortcuts"
					className="m-0 list-none p-0"
				>
					{types.map((type) => {
						const enabled =
							!config.disabledShortcuts.includes(type);
						const keys = JSON.parse(
							config.shortcuts[type]
						) as string[];
						const isChanged =
							config.shortcuts[type] !== defaults[type];
						return (
							<li
								key={type}
								className="grid min-h-[46px] grid-cols-[1fr_auto_28px_38px] items-center gap-2.5 px-3.5 py-1.5 [&+&]:border-t [&+&]:border-line"
							>
								<span
									className={`flex min-w-0 items-center gap-1.5 font-medium ${
										enabled
											? ''
											: 'text-ink-500 line-through decoration-line-strong'
									}`}
								>
									<span>{type}</span>
									{isChanged && (
										<span
											role="img"
											aria-label="Changed from the default"
											title="Changed from the default"
											className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500"
										/>
									)}
								</span>
								<span
									className={`flex gap-1 ${enabled ? '' : 'opacity-45'}`}
								>
									{toKeyLabels(type, keys).map(
										(label, index) => (
											<Kbd key={`${label}-${index}`}>
												{label}
											</Kbd>
										)
									)}
								</span>
								<Button
									small
									icon
									variant="ghost"
									aria-label={`Change shortcut for ${type}`}
									disabled={!enabled}
									onClick={() => setEditing(type)}
								>
									<Pencil size={15} aria-hidden="true" />
								</Button>
								<Switch
									ariaLabel={`Enable ${type}`}
									checked={enabled}
									onChange={(value) => toggle(type, value)}
								/>
							</li>
						);
					})}
				</ul>
			</Card>
			<p className="m-0 mx-1 -mt-1 text-xs leading-[1.3] text-ink-500">
				Browser shortcuts such as ⌘T or ⌘W cannot be used. A dot marks a
				changed key.
			</p>

			<ShortcutEditDialog
				type={editing}
				config={config}
				update={update}
				onClose={() => setEditing(null)}
			/>

			<ConfirmDialog
				open={isResetOpen}
				onClose={() => setIsResetOpen(false)}
				title="Reset all shortcuts?"
				confirmLabel="Reset shortcuts"
				onConfirm={resetAll}
			>
				Every shortcut goes back to its default key and is switched on.
			</ConfirmDialog>
		</div>
	);
};
