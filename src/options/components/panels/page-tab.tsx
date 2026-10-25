import {
	Button,
	Card,
	CardTitle,
	ConfirmDialog,
	SettingRow,
	SwitchRow,
} from '@shared/components/ui';
import { useStorageValue } from '@shared/hooks/use-storage-value';
import {
	clearVisitedHistory,
	countVisited,
	VISITED_STORAGE_KEY,
} from '@shared/services/visited-history';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { TabProps } from './types';

/**
 * Page tab: what the extension does on Bandcamp pages, and the visited history.
 *
 * @param {TabProps} props - The props of component.
 */
export const PageTab = ({ config, update }: TabProps) => {
	const visitedCount = useStorageValue(VISITED_STORAGE_KEY, countVisited);
	const [isClearOpen, setIsClearOpen] = useState(false);

	const clear = () => {
		clearVisitedHistory().catch((e) => console.error(e));
	};

	const count = visitedCount ?? 0;
	// The history stores several hashes per visited release, so the number is not a count of releases
	const countText = `${count.toLocaleString('en-US')} ${count === 1 ? 'entry' : 'entries'}`;

	return (
		<div className="flex flex-col gap-3.5">
			<div>
				<CardTitle>On Bandcamp pages</CardTitle>
				<Card>
					<SwitchRow
						label="Highlight visited"
						hint="Mark releases you have already opened"
						checked={config.highlightVisited}
						onChange={(value) => update('highlightVisited', value)}
					/>
					<div
						aria-hidden="true"
						className="flex gap-3.5 border-t border-line px-3.5 py-2 text-xs"
					>
						<span className="font-bold text-ink-900">
							New release
						</span>
						<span className="font-bold text-[#7b1fa2]">
							Visited release
						</span>
					</div>
					<SwitchRow
						label="Autoscroll"
						hint="Follow the playing item on the page"
						checked={config.autoscroll}
						onChange={(value) => update('autoscroll', value)}
					/>
					<SwitchRow
						label="Feed player"
						hint="Show the mini player on the feed"
						checked={config.showFeedPlayer}
						onChange={(value) => update('showFeedPlayer', value)}
					/>
				</Card>
			</div>

			<div>
				<CardTitle>Visited history</CardTitle>
				<Card>
					<SettingRow
						label={visitedCount === null ? '...' : countText}
						hint="Stored only in this browser"
					>
						<Button
							small
							variant="danger"
							disabled={count === 0}
							onClick={() => setIsClearOpen(true)}
						>
							<Trash2 size={15} aria-hidden="true" />
							Clear
						</Button>
					</SettingRow>
				</Card>
			</div>

			<ConfirmDialog
				open={isClearOpen}
				onClose={() => setIsClearOpen(false)}
				title="Clear visited history?"
				confirmLabel="Clear history"
				onConfirm={clear}
			>
				Visited releases and tracks ({countText}) will no longer be
				highlighted. This cannot be undone.
			</ConfirmDialog>
		</div>
	);
};
