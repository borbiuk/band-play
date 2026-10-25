import { Button, Pill, PillTone, ProgressBar } from '@shared/components/ui';
import { MessageCode } from '@shared/enums';
import { BatchDownloadItemModel } from '@shared/models/batch-download/batch-download-item-model';
import { ItemCommandCode } from '@shared/models/messages';
import { classNames } from '@shared/utils';
import {
	CircleAlert,
	Clock,
	Copy,
	Download,
	FileX,
	FolderOpen,
	Hourglass,
	Link,
	Pause,
	Play,
	RotateCcw,
	Trash2,
	X,
	ChevronRight,
	Check,
} from 'lucide-react';
import React, { ReactNode, useState } from 'react';

import { StatusKind, RowView } from '../utils/row-view.utils';

/** Column sizes: the status and action columns shrink with the window. */
export const ROW_GRID =
	'grid-cols-[22px_44px_minmax(0,1fr)_112px_auto] min-[760px]:grid-cols-[22px_44px_minmax(0,1fr)_190px_112px] min-[960px]:grid-cols-[22px_44px_minmax(0,1fr)_248px_136px]';

const ICON_SIZE = 16;

const STATUS_PILL: Record<StatusKind, { tone: PillTone; icon: ReactNode }> = {
	downloading: { tone: 'active', icon: <Download aria-hidden="true" /> },
	waiting: { tone: 'neutral', icon: <Clock aria-hidden="true" /> },
	retrying: { tone: 'neutral', icon: <RotateCcw aria-hidden="true" /> },
	paused: { tone: 'neutral', icon: <Pause aria-hidden="true" /> },
	duplicate: { tone: 'warn', icon: <Copy aria-hidden="true" /> },
	'rate-limited': { tone: 'warn', icon: <Hourglass aria-hidden="true" /> },
	completed: { tone: 'success', icon: <Check aria-hidden="true" /> },
	failed: { tone: 'danger', icon: <CircleAlert aria-hidden="true" /> },
};

const showInFolderLabel = navigator.platform.includes('Mac')
	? 'Show in Finder'
	: 'Show in folder';

export interface DownloadRowProps {
	// The item of the row.
	item: BatchDownloadItemModel;

	// What the row shows and allows.
	view: RowView;

	// 0 for a release, 1 for a file of a bundle.
	depth: 0 | 1;

	// The row is a bundle: it has a fold toggle.
	isBundle: boolean;

	// The bundle shows its files.
	expanded: boolean;

	// Folds or unfolds a bundle.
	onToggle: (id: string) => void;

	// Sends a command about this row to the background.
	onCommand: (code: ItemCommandCode, id: string) => void;

	// Asks to delete the file from disk (the page confirms first).
	onDeleteFile: (id: string) => void;

	// Copies the Bandcamp download page link.
	onCopyUrl: (url: string) => void;
}

/** The cover art, or a plain tile while it is missing or fails to load. */
const Cover = ({ url, small }: { url?: string; small: boolean }) => {
	const [failed, setFailed] = useState(false);
	return (
		<span
			className={classNames(
				'block shrink-0 overflow-hidden bg-aqua-100 shadow-[inset_0_0_0_1px_rgba(18,38,46,0.08)]',
				small
					? 'h-[34px] w-[34px] justify-self-center rounded-lg'
					: 'h-11 w-11 rounded-ctl'
			)}
		>
			{url && !failed && (
				<img
					src={url}
					alt=""
					className="h-full w-full object-cover"
					onError={() => setFailed(true)}
				/>
			)}
		</span>
	);
};

interface ActionProps {
	// The accessible name and the tooltip.
	label: string;

	// The icon.
	children: ReactNode;

	// Called on click.
	onClick: () => void;

	// Shown only on hover and focus; the first action of a row is always shown.
	secondary?: boolean;

	// Red on hover (cancel, delete, remove).
	danger?: boolean;
}

const Action = ({
	label,
	children,
	onClick,
	secondary,
	danger,
}: ActionProps) => (
	<Button
		icon
		variant={secondary ? (danger ? 'ghostDanger' : 'ghost') : 'default'}
		title={label}
		aria-label={label}
		className={
			secondary
				? 'opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'
				: undefined
		}
		onClick={onClick}
	>
		{children}
	</Button>
);

/**
 * One row of the list: cover, title, status, progress and actions. The height is fixed (64 px) so the
 * list can be windowed. A release shows its main action always and the others on hover or focus.
 *
 * @param {DownloadRowProps} props - The props of component.
 */
export const DownloadRow = ({
	item,
	view,
	depth,
	isBundle,
	expanded,
	onToggle,
	onCommand,
	onDeleteFile,
	onCopyUrl,
}: DownloadRowProps) => {
	const { actions } = view;
	const pill = STATUS_PILL[view.status];
	const id = item.id;
	const cover = item.coverArtUrl;
	const send = (code: ItemCommandCode) => () => onCommand(code, id);

	// The main action comes first in the markup and shows last in the row (`flex-row-reverse`)
	let main: ReactNode = null;
	if (actions.retry) {
		main = (
			<Action
				label="Retry"
				onClick={send(MessageCode.BatchDownloadRetryItem)}
			>
				<RotateCcw size={ICON_SIZE} aria-hidden="true" />
			</Action>
		);
	} else if (actions.resume) {
		main = (
			<Action
				label="Resume"
				onClick={send(MessageCode.BatchDownloadResumeItem)}
			>
				<Play size={ICON_SIZE} aria-hidden="true" />
			</Action>
		);
	} else if (actions.pause) {
		main = (
			<Action
				label="Pause"
				onClick={send(MessageCode.BatchDownloadPauseItem)}
			>
				<Pause size={ICON_SIZE} aria-hidden="true" />
			</Action>
		);
	} else if (actions.showInFolder) {
		main = (
			<Action
				label={showInFolderLabel}
				onClick={send(MessageCode.BatchDownloadShowInFolder)}
			>
				<FolderOpen size={ICON_SIZE} aria-hidden="true" />
			</Action>
		);
	}

	return (
		<li
			className={classNames(
				'group grid h-16 items-center gap-3 border-t border-line pr-3.5 transition-colors duration-150 focus-within:bg-aqua-50 hover:bg-aqua-50',
				ROW_GRID,
				depth === 1 ? 'bg-aqua-50/55 pl-[34px]' : 'pl-2.5'
			)}
		>
			{isBundle ? (
				<button
					type="button"
					aria-expanded={expanded}
					aria-label={`${expanded ? 'Fold' : 'Unfold'} ${view.title}`}
					className="grid h-[22px] w-[22px] cursor-pointer place-items-center rounded-md border-0 bg-transparent text-ink-500 hover:bg-aqua-500/[.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500"
					onClick={() => onToggle(id)}
				>
					<ChevronRight
						size={14}
						aria-hidden="true"
						className={classNames(
							'transition-transform duration-150',
							expanded && 'rotate-90'
						)}
					/>
				</button>
			) : (
				<span aria-hidden="true" />
			)}
			<Cover url={cover} small={depth === 1} />

			<div className="min-w-0">
				<div className="truncate font-semibold" title={view.title}>
					{view.title}
				</div>
				<div
					className="mt-0.5 truncate text-xs text-ink-500"
					title={view.subtitle}
				>
					{view.subtitle}
				</div>
			</div>

			<div className="min-w-0">
				<div className="flex h-[22px] items-center gap-2">
					<Pill tone={pill.tone} icon={pill.icon}>
						{view.statusLabel}
					</Pill>
					{view.progress !== null && !view.indeterminate && (
						<span className="text-xs font-semibold tabular-nums text-ink-700">
							{Math.round(view.progress)}%
						</span>
					)}
				</div>
				{view.progress !== null && (
					<div className="mt-1.5">
						<ProgressBar
							ariaLabel={`${view.title} progress`}
							value={view.progress}
							tone={view.progressTone}
							indeterminate={view.indeterminate}
						/>
					</div>
				)}
				<div
					className="mt-[3px] truncate text-xs tabular-nums text-ink-500 max-[759px]:hidden"
					title={view.hint}
				>
					{view.hint}
				</div>
			</div>

			<div className="flex flex-row-reverse justify-start gap-1">
				{main}
				{actions.cancel && (
					<Action
						secondary
						danger
						label="Cancel"
						onClick={send(MessageCode.BatchDownloadCancelItem)}
					>
						<X size={ICON_SIZE} aria-hidden="true" />
					</Action>
				)}
				{actions.copyUrl && (
					<Action
						secondary
						label="Copy Bandcamp link"
						onClick={() => onCopyUrl(actions.copyUrl as string)}
					>
						<Link size={ICON_SIZE} aria-hidden="true" />
					</Action>
				)}
				{actions.deleteFile && (
					<Action
						secondary
						danger
						label="Delete file from disk"
						onClick={() => onDeleteFile(id)}
					>
						<FileX size={ICON_SIZE} aria-hidden="true" />
					</Action>
				)}
				<Action
					secondary
					danger
					label="Remove from list"
					onClick={send(MessageCode.BatchDownloadRemoveItem)}
				>
					<Trash2 size={ICON_SIZE} aria-hidden="true" />
				</Action>
			</div>
		</li>
	);
};
