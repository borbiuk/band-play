import { IconButton } from '@shared/components/button';
import { exist } from '@shared/utils';
import {
	CheckCircle2,
	Circle,
	Clock3,
	Copy,
	Download,
	FileX,
	FolderOpen,
	Link,
	Pause,
	PauseCircle,
	Play,
	RotateCcw,
	Trash2,
	X,
	XCircle,
} from 'lucide-react';
import React from 'react';

import { BatchDownloadItemModel } from '../batch-download-item-model';
import { DownloadStatus } from '../download-status';
import { DownloadType } from '../download-type';

type Props = {
	item: BatchDownloadItemModel;
	displayTitle?: string;
	idx: number;
	showTitleGroup: boolean;
	titleGroupLetter: string;
	showStatusIcon: boolean;
	onRetry: (id: string) => void;
	onRemove: (id: string) => void;
	onResume: (id: string) => void;
	onPause: (id: string) => void;
	onCancel: (id: string) => void;
	onDeleteFile: (id: string) => void;
	onShowInFolder: (id: string) => void;
};

type DisplayStatus = DownloadStatus | 'retrying';

const statusIconByStatus: Record<
	DisplayStatus,
	{ icon: React.ElementType; className: string }
> = {
	[DownloadStatus.Pending]: { icon: Circle, className: 'text-gray-400' },
	[DownloadStatus.Downloading]: { icon: Download, className: 'text-sky-500' },
	[DownloadStatus.Paused]: {
		icon: PauseCircle,
		className: 'text-yellow-500',
	},
	[DownloadStatus.Duplicate]: { icon: Copy, className: 'text-amber-500' },
	[DownloadStatus.RateLimited]: {
		icon: Clock3,
		className: 'text-orange-500',
	},
	retrying: { icon: RotateCcw, className: 'text-sky-500' },
	[DownloadStatus.Completed]: {
		icon: CheckCircle2,
		className: 'text-emerald-500',
	},
	[DownloadStatus.Failed]: { icon: XCircle, className: 'text-red-500' },
	[DownloadStatus.Queued]: { icon: Circle, className: 'text-gray-400' },
	[DownloadStatus.Resolving]: { icon: Circle, className: 'text-gray-400' },
	[DownloadStatus.Resolved]: { icon: Circle, className: 'text-gray-400' },
};

const TitleCell = ({
	title,
	letter,
	isActive,
}: {
	title: string;
	letter: string;
	isActive: boolean;
}) => {
	return (
		<div className="relative pl-7">
			<span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
				{isActive ? letter : ''}
			</span>
			<span className="block truncate">{title}</span>
		</div>
	);
};

const StatusCell = ({
	status,
	showIcon,
	icon,
	iconClassName,
}: {
	status: DisplayStatus;
	showIcon: boolean;
	icon?: React.ElementType;
	iconClassName?: string;
}) => {
	const Icon = icon;
	return (
		<div className="relative pl-7">
			<span className="absolute left-0 top-1/2 -translate-y-1/2">
				{showIcon && Icon ? (
					<Icon className={`h-4 w-4 ${iconClassName || ''}`} />
				) : null}
			</span>
			<span>{status}</span>
		</div>
	);
};

const ActionSlot = ({
	visible,
	title,
	icon,
	onClick,
}: {
	visible: boolean;
	title: string;
	icon: React.ReactNode;
	onClick: () => void;
}) => {
	if (!visible) {
		return (
			<div className="invisible flex w-9 justify-center">
				<IconButton ariaHidden tabIndex={-1} disabled icon={icon} />
			</div>
		);
	}

	return (
		<div className="flex w-9 justify-center">
			<IconButton
				title={title}
				ariaLabel={title}
				onClick={onClick}
				icon={icon}
			/>
		</div>
	);
};

export const DownloadItemRow = ({
	item,
	displayTitle,
	idx,
	showTitleGroup,
	titleGroupLetter,
	showStatusIcon,
	onRetry,
	onRemove,
	onResume,
	onPause,
	onCancel,
	onDeleteFile,
	onShowInFolder,
}: Props) => {
	const isDownloading =
		item.type === DownloadType.Single &&
		item.status === DownloadStatus.Downloading;
	const isPaused =
		item.type === DownloadType.Single &&
		(item.status === DownloadStatus.Paused ||
			item.status === DownloadStatus.Duplicate);
	const progress =
		item.type === DownloadType.Multiple
			? item.progress
			: item.type === DownloadType.Single
				? item.download.progress
				: 0;

	// Failed items of every type are retryable: retrying a failed Multiple
	// parent re-queues all of its failed children.
	const canRetry = item.status === DownloadStatus.Failed;
	const canResume =
		item.type === DownloadType.Single &&
		(item.status === DownloadStatus.Paused ||
			item.status === DownloadStatus.Duplicate);
	const canPause = isDownloading;
	const canCancel =
		item.type === DownloadType.Single &&
		(item.status === DownloadStatus.Downloading ||
			item.status === DownloadStatus.Paused ||
			item.status === DownloadStatus.Duplicate ||
			item.status === DownloadStatus.Queued ||
			item.status === DownloadStatus.Resolved);
	const canShowInFolder =
		item.type === DownloadType.Single &&
		item.status === DownloadStatus.Completed &&
		typeof item.download.browserDownloadId !== 'undefined';
	const canDeleteFile = canShowInFolder;

	const bandcampUrl =
		item.type === DownloadType.Pending ? item.url : item.pageUrl;

	const showInFolderLabel = navigator.platform.includes('Mac')
		? 'Show in Finder'
		: 'Show in folder';

	const iconClass = 'h-4 w-4';
	const coverArtUrl = item.coverArtUrl;

	// Distinguish a scheduled automatic retry from an ordinary queued item.
	const isRetryScheduled =
		item.type === DownloadType.Single &&
		item.status === DownloadStatus.Resolved &&
		(item.retryCount ?? 0) > 0;
	const statusForDisplay: DisplayStatus = isRetryScheduled
		? 'retrying'
		: item.status === DownloadStatus.Queued ||
			  item.status === DownloadStatus.Resolved ||
			  item.status === DownloadStatus.Resolving
			? DownloadStatus.Pending
			: item.status;
	const statusIconConfig = statusIconByStatus[statusForDisplay];
	const StatusIcon = statusIconConfig?.icon;

	return (
		<tr className="band-play-download-row h-16 border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
			<td className="p-2 text-xs text-gray-500">{idx}</td>
			<td className="p-2">
				<div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
					{coverArtUrl ? (
						<img
							src={coverArtUrl}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : null}
				</div>
			</td>
			<td className="p-2 text-sm text-gray-900">
				<TitleCell
					title={displayTitle || item.title}
					letter={showTitleGroup ? titleGroupLetter : ''}
					isActive={showTitleGroup}
				/>
			</td>
			<td className="p-2 text-sm text-gray-700">
				<StatusCell
					status={statusForDisplay}
					showIcon={showStatusIcon}
					icon={StatusIcon}
					iconClassName={statusIconConfig?.className}
				/>
			</td>
			<td className="p-2">
				<div className="h-2 w-full rounded-full bg-gray-100">
					<div
						className={`h-2 rounded-full bg-band-500 ${
							isPaused ? 'band-play-progress-paused' : ''
						} ${
							isDownloading &&
							(progress <= 0 || Number.isNaN(progress))
								? 'band-play-progress-indeterminate'
								: ''
						}`}
						style={{
							width:
								isDownloading &&
								(progress <= 0 || Number.isNaN(progress))
									? '100%'
									: `${Math.min(Math.max(Number.isNaN(progress) ? 0 : progress, 0), 100)}%`,
						}}
					/>
				</div>
			</td>
			<td className="p-2">
				<div className="grid grid-cols-5 justify-items-center gap-2">
					{/* Slot 1: Pause / Resume */}
					{canResume ? (
						<ActionSlot
							visible
							title="Resume"
							icon={<Play className={iconClass} />}
							onClick={() => {
								onResume(item.id);
							}}
						/>
					) : (
						<ActionSlot
							visible={canPause}
							title="Pause"
							icon={<Pause className={iconClass} />}
							onClick={() => {
								onPause(item.id);
							}}
						/>
					)}

					{/* Slot 2: Show in folder / Cancel */}
					{canShowInFolder ? (
						<ActionSlot
							visible
							title={showInFolderLabel}
							icon={<FolderOpen className={iconClass} />}
							onClick={() => {
								onShowInFolder(item.id);
							}}
						/>
					) : (
						<ActionSlot
							visible={canCancel}
							title="Cancel"
							icon={<X className={iconClass} />}
							onClick={() => {
								onCancel(item.id);
							}}
						/>
					)}

					{/* Slot 3: Copy Bandcamp URL */}
					<ActionSlot
						visible={exist(bandcampUrl)}
						title="Copy Bandcamp URL"
						icon={<Link className={iconClass} />}
						onClick={() => {
							navigator.clipboard
								.writeText(bandcampUrl)
								.catch(() => void 0);
						}}
					/>

					{/* Slot 4: Retry / Delete file */}
					{canRetry ? (
						<ActionSlot
							visible
							title="Retry"
							icon={<RotateCcw className={iconClass} />}
							onClick={() => {
								onRetry(item.id);
							}}
						/>
					) : (
						<ActionSlot
							visible={canDeleteFile}
							title="Delete file from disk"
							icon={<FileX className={iconClass} />}
							onClick={() => {
								// The file is removed from disk for good
								if (
									!window.confirm(
										'Delete the downloaded file from disk? This cannot be undone.'
									)
								) {
									return;
								}

								onDeleteFile(item.id);
							}}
						/>
					)}

					{/* Slot 5: Remove */}
					<ActionSlot
						visible
						title="Remove"
						icon={<Trash2 className={iconClass} />}
						onClick={() => {
							onRemove(item.id);
						}}
					/>
				</div>
			</td>
		</tr>
	);
};
