import { Card, ConfirmDialog, glass, Note } from '@shared/components/ui';
import { MessageCode } from '@shared/enums';
import { useConfig } from '@shared/hooks/use-config';
import { BatchDownloadItemModel } from '@shared/models/batch-download/batch-download-item-model';
import {
	DownloadStatus,
	isTerminalStatus,
} from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';
import { CommandCode, ItemCommandCode } from '@shared/models/messages';
import messageService from '@shared/services/message-service';
import { computeOverall } from '@shared/utils/batch-download-overall.utils';
import { CircleAlert } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ControlsBar } from './components/controls-bar';
import { DownloadRow } from './components/download-row';
import { DownloadsFooter } from './components/downloads-footer';
import { DownloadsHeader } from './components/downloads-header';
import { EmptyState } from './components/empty-state';
import { SummaryCard } from './components/summary-card';
import { useDownloads } from './hooks/use-downloads';
import { useNow } from './hooks/use-now';
import { useTransferRate } from './hooks/use-transfer-rate';
import {
	buildRows,
	bundleFiles,
	countByFilter,
	duplicateIndexById,
	FilterKey,
	SortKey,
} from './utils/list.utils';
import { toRowView } from './utils/row-view.utils';

// Windowed rendering: rows have a fixed height (h-16), so only the visible slice is rendered
// once the list grows beyond the threshold.
const WINDOWED_THRESHOLD = 100;
const ROW_HEIGHT = 64;
const WINDOW_OVERSCAN = 10;

/** Sends a command that needs no data to the background. */
const sendCommand = (code: CommandCode) => {
	messageService.post({ code });
};

/** Sends a command about one item to the background. */
const sendItemCommand = (code: ItemCommandCode, id: string) => {
	messageService.post({ code, data: { id } });
};

const isSingleIn = (
	item: BatchDownloadItemModel,
	...statuses: DownloadStatus[]
): boolean =>
	item.type === DownloadType.Single && statuses.includes(item.status);

/**
 * The downloads page: a sticky glass header with the batch settings, the overall progress and the controls,
 * and the list of downloads below it.
 *
 * @returns JSX element of the page.
 */
export const DownloadsApp = () => {
	const { items, isLoaded } = useDownloads();
	const { config, update } = useConfig();

	const [filter, setFilter] = useState<FilterKey>('all');
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<SortKey>('queue');
	const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
	const [isClearAllOpen, setIsClearAllOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<string | null>(null);

	const overall = useMemo(() => computeOverall(items), [items]);
	const counts = useMemo(() => countByFilter(items), [items]);
	const duplicateIndex = useMemo(() => duplicateIndexById(items), [items]);
	const filesByBundle = useMemo(() => bundleFiles(items), [items]);
	const rows = useMemo(
		() => buildRows(items, { filter, query, sort, collapsed }),
		[items, filter, query, sort, collapsed]
	);

	const hasDownloading = items.some((x) =>
		isSingleIn(x, DownloadStatus.Downloading)
	);
	const hasPaused = items.some((x) =>
		isSingleIn(x, DownloadStatus.Paused, DownloadStatus.Duplicate)
	);
	const hasCompleted = items.some(
		(x) => x.status === DownloadStatus.Completed
	);
	const hasUnfinished = items.some((x) => !isTerminalStatus(x.status));
	const failedCount = items.filter(
		(x) =>
			x.type !== DownloadType.Multiple &&
			x.status === DownloadStatus.Failed
	).length;
	const hasUnverifiedFailure = items.some(
		(x) =>
			x.type === DownloadType.Pending &&
			x.status === DownloadStatus.Failed &&
			x.failReason === 'unverified'
	);
	const bundles = items.filter((x) => x.type === DownloadType.Multiple);
	const allUnfolded = bundles.every((x) => !collapsed.has(x.id));

	const rate = useTransferRate(
		hasDownloading,
		overall.downloadedMb,
		overall.knownSizeMb
	);

	// Countdowns ("Retry in 24 s") tick only while some item waits for a retry time
	const now = useNow(
		items.some((x) => x.type !== DownloadType.Multiple && x.nextRetryAt)
	);

	useEffect(() => {
		if (overall.total === 0 || !hasUnfinished) {
			document.title = 'BandPlay Downloads';
			return;
		}

		const pausedSuffix = !hasDownloading && hasPaused ? ' paused' : '';
		document.title = `BandPlay · ${Math.round(overall.donePct)}%${pausedSuffix}`;
	}, [
		overall.donePct,
		overall.total,
		hasUnfinished,
		hasDownloading,
		hasPaused,
	]);

	// Windowing: the page scrolls, so the visible slice follows the top of the list
	const listRef = useRef<HTMLUListElement>(null);
	const [slice, setSlice] = useState({ start: 0, end: WINDOWED_THRESHOLD });
	const isWindowed = rows.length > WINDOWED_THRESHOLD;

	useEffect(() => {
		if (!isWindowed) {
			return undefined;
		}

		let frame = 0;
		const update = () => {
			frame = 0;
			if (!listRef.current) {
				return;
			}

			const top = listRef.current.getBoundingClientRect().top;
			const start = Math.max(
				Math.floor(-top / ROW_HEIGHT) - WINDOW_OVERSCAN,
				0
			);
			const count =
				Math.ceil(window.innerHeight / ROW_HEIGHT) +
				WINDOW_OVERSCAN * 2;
			const end = Math.min(start + count, rows.length);
			setSlice((previous) =>
				previous.start === start && previous.end === end
					? previous
					: { start, end }
			);
		};

		const onScroll = () => {
			if (!frame) {
				frame = requestAnimationFrame(update);
			}
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) {
				cancelAnimationFrame(frame);
			}
		};
	}, [isWindowed, rows.length]);

	const visible = isWindowed ? rows.slice(slice.start, slice.end) : rows;
	const topSpace = isWindowed ? slice.start * ROW_HEIGHT : 0;
	const bottomSpace = isWindowed
		? Math.max(rows.length - slice.end, 0) * ROW_HEIGHT
		: 0;

	const toggleBundle = (id: string) =>
		setCollapsed((current) => {
			const next = new Set(current);
			if (!next.delete(id)) {
				next.add(id);
			}

			return next;
		});

	const toggleAllBundles = () =>
		setCollapsed(
			allUnfolded ? new Set(bundles.map((x) => x.id)) : new Set()
		);

	const clearAll = () => {
		sendCommand(MessageCode.BatchDownloadClearAll);
	};

	const deleteFile = () => {
		if (fileToDelete !== null) {
			sendItemCommand(MessageCode.BatchDownloadDeleteFile, fileToDelete);
		}
	};

	// Wait for the list too, so the empty state does not flash while it loads
	if (config === null || !isLoaded) {
		return (
			<div className="grid h-screen place-items-center text-ink-500">
				...
			</div>
		);
	}

	const hasItems = items.length > 0;
	let mainAction: 'pause' | 'resume' | null = null;
	if (hasDownloading) {
		mainAction = 'pause';
	} else if (hasPaused) {
		mainAction = 'resume';
	}

	return (
		<div className="min-h-screen font-ui text-[13px] text-ink-900">
			<header
				className={`sticky top-0 z-10 border-b border-black/[.08] pb-2.5 pt-3 ${glass}`}
			>
				<div className="mx-auto max-w-[1080px] px-5">
					<DownloadsHeader config={config} update={update} />
					{hasItems && (
						<>
							<SummaryCard overall={overall} rate={rate} />
							<ControlsBar
								filter={filter}
								counts={counts}
								onFilter={setFilter}
								query={query}
								onQuery={setQuery}
								sort={sort}
								onSort={setSort}
								hasBundles={bundles.length > 0}
								allUnfolded={allUnfolded}
								onToggleBundles={toggleAllBundles}
								mainAction={mainAction}
								onMainAction={() =>
									sendCommand(
										mainAction === 'pause'
											? MessageCode.BatchDownloadPauseAll
											: MessageCode.BatchDownloadResumeAll
									)
								}
								failedCount={failedCount}
								onRetryFailed={() =>
									sendCommand(
										MessageCode.BatchDownloadRetryAllFailed
									)
								}
								canClearCompleted={hasCompleted}
								onClearCompleted={() =>
									sendCommand(
										MessageCode.BatchDownloadClearCompleted
									)
								}
								onClearAll={() => setIsClearAllOpen(true)}
							/>
						</>
					)}
				</div>
			</header>

			<main className="mx-auto max-w-[1080px] px-5 pb-2 pt-4">
				{hasUnverifiedFailure && (
					<div className="mb-3">
						<Note icon={<CircleAlert aria-hidden="true" />}>
							Bandcamp requires a verified email address before it
							allows downloads. Check your inbox, verify your
							account, then press <b>Retry failed</b>.
						</Note>
					</div>
				)}

				{hasItems ? (
					<Card className="bg-white/90">
						<ul
							ref={listRef}
							aria-label="Downloads"
							className="m-0 -mt-px list-none p-0"
						>
							{topSpace > 0 && (
								<li
									aria-hidden="true"
									style={{ height: topSpace }}
								/>
							)}
							{visible.map(({ item, depth }) => {
								const files =
									item.type === DownloadType.Multiple
										? (filesByBundle.get(item.id) ?? [])
										: undefined;
								return (
									<DownloadRow
										key={item.id}
										item={item}
										depth={depth}
										isBundle={
											item.type === DownloadType.Multiple
										}
										expanded={!collapsed.has(item.id)}
										view={toRowView(item, {
											now,
											files,
											duplicateIndex: duplicateIndex.get(
												item.id
											),
										})}
										onToggle={toggleBundle}
										onCommand={sendItemCommand}
										onDeleteFile={setFileToDelete}
										onCopyUrl={(url) => {
											navigator.clipboard
												.writeText(url)
												.catch(() => void 0);
										}}
									/>
								);
							})}
							{bottomSpace > 0 && (
								<li
									aria-hidden="true"
									style={{ height: bottomSpace }}
								/>
							)}
						</ul>
						{rows.length === 0 && (
							<div className="flex flex-col items-center gap-1 px-5 py-12 text-ink-500">
								<b className="text-ink-900">No matches</b>
								<span>Try another filter or search.</span>
							</div>
						)}
					</Card>
				) : (
					<EmptyState />
				)}
			</main>

			<DownloadsFooter />

			<ConfirmDialog
				open={isClearAllOpen}
				onClose={() => setIsClearAllOpen(false)}
				title="Clear all downloads?"
				confirmLabel="Clear all"
				onConfirm={clearAll}
			>
				The list will be emptied and active downloads will be cancelled.
				Files already saved stay on your disk.
			</ConfirmDialog>
			<ConfirmDialog
				open={fileToDelete !== null}
				onClose={() => setFileToDelete(null)}
				title="Delete the file from disk?"
				confirmLabel="Delete file"
				onConfirm={deleteFile}
			>
				The downloaded file is removed from your disk. This cannot be
				undone.
			</ConfirmDialog>
		</div>
	);
};
