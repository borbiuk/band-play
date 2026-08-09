import { IconButton } from '@shared/components/button';
import { MessageCode } from '@shared/enums';
import { BatchDownloadItemIdMessage } from '@shared/models/messages';
import messageService from '@shared/services/message-service';
import {
	CheckCircle2,
	Circle,
	Download,
	PauseCircle,
	Play,
	Copy,
	XCircle,
	FolderOpen,
	RotateCcw,
	Trash2,
} from 'lucide-react';
import React from 'react';
import { Tooltip } from 'react-tooltip';

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
};

const statusIconByStatus: Record<
	DownloadStatus,
	{ icon: React.ElementType; className: string }
> = {
	[DownloadStatus.Pending]: { icon: Circle, className: 'text-gray-400' },
	[DownloadStatus.Downloading]: { icon: Download, className: 'text-sky-500' },
	[DownloadStatus.Paused]: {
		icon: PauseCircle,
		className: 'text-yellow-500',
	},
	[DownloadStatus.Duplicate]: { icon: Copy, className: 'text-amber-500' },
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
	status: DownloadStatus;
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

	const canRetry =
		(item.type === DownloadType.Pending &&
			item.status === DownloadStatus.Failed) ||
		(item.type === DownloadType.Single &&
			item.status === DownloadStatus.Failed);
	const canResume =
		item.type === DownloadType.Single &&
		(item.status === DownloadStatus.Paused ||
			item.status === DownloadStatus.Duplicate);

	const canShowInFolder =
		item.type === DownloadType.Single &&
		item.status === DownloadStatus.Completed &&
		typeof item.download.browserDownloadId !== 'undefined';

	const showInFolderLabel = navigator.platform.includes('Mac')
		? 'Show in Finder'
		: 'Show in folder';

	const iconClass = 'h-4 w-4';
	const showTooltipId = `downloads-show-${item.id}`;
	const removeTooltipId = `downloads-remove-${item.id}`;
	const retryTooltipId = `downloads-retry-${item.id}`;
	const resumeTooltipId = `downloads-resume-${item.id}`;
	const coverArtUrl = item.coverArtUrl;
	const statusForDisplay =
		item.status === DownloadStatus.Queued ||
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
				<div className="grid grid-cols-4 justify-items-center gap-5">
					{/* Slot 1: Show in folder */}
					{canShowInFolder ? (
						<div className="flex w-11 justify-center">
							<IconButton
								dataTooltipId={showTooltipId}
								title={showInFolderLabel}
								ariaLabel={showInFolderLabel}
								onClick={async () => {
									messageService
										.sendToBackground<BatchDownloadItemIdMessage>(
											{
												code: MessageCode.BatchDownloadShowInFolder,
												data: { id: item.id },
											}
										)
										.catch(() => void 0);
								}}
								icon={<FolderOpen className={iconClass} />}
							/>
							<Tooltip
								id={showTooltipId}
								className="!z-[9999] max-w-32"
								variant="light"
								place="top"
								opacity={1}
								offset={6}
								delayShow={100}
							>
								<span className="text-sm text-gray-900">
									{showInFolderLabel}
								</span>
							</Tooltip>
						</div>
					) : (
						<div className="invisible flex w-11 justify-center">
							<IconButton
								ariaHidden
								tabIndex={-1}
								disabled
								icon={<FolderOpen className={iconClass} />}
							/>
						</div>
					)}

					{/* Slot 2: Remove */}
					<div className="flex w-11 justify-center">
						<IconButton
							dataTooltipId={removeTooltipId}
							title="Remove"
							ariaLabel="Remove"
							onClick={async () => {
								onRemove(item.id);
							}}
							icon={<Trash2 className={iconClass} />}
						/>
						<Tooltip
							id={removeTooltipId}
							className="!z-[9999] max-w-32"
							variant="light"
							place="top"
							opacity={1}
							offset={6}
							delayShow={100}
						>
							<span className="text-sm text-gray-900">
								Remove
							</span>
						</Tooltip>
					</div>

					{/* Slot 3: Resume */}
					{canResume ? (
						<div className="flex w-11 justify-center">
							<IconButton
								dataTooltipId={resumeTooltipId}
								title="Resume"
								ariaLabel="Resume"
								onClick={async () => {
									onResume(item.id);
								}}
								icon={<Play className={iconClass} />}
							/>
							<Tooltip
								id={resumeTooltipId}
								className="!z-[9999] max-w-32"
								variant="light"
								place="top"
								opacity={1}
								offset={6}
								delayShow={100}
							>
								<span className="text-sm text-gray-900">
									Resume
								</span>
							</Tooltip>
						</div>
					) : (
						<div className="invisible flex w-11 justify-center">
							<IconButton
								ariaHidden
								tabIndex={-1}
								disabled
								icon={<Play className={iconClass} />}
							/>
						</div>
					)}

					{/* Slot 4: Retry */}
					{canRetry ? (
						<div className="flex w-11 justify-center">
							<IconButton
								dataTooltipId={retryTooltipId}
								title="Retry"
								ariaLabel="Retry"
								onClick={async () => {
									onRetry(item.id);
								}}
								icon={<RotateCcw className={iconClass} />}
							/>
							<Tooltip
								id={retryTooltipId}
								className="!z-[9999] max-w-32"
								variant="light"
								place="top"
								opacity={1}
								offset={6}
								delayShow={100}
							>
								<span className="text-sm text-gray-900">
									Retry
								</span>
							</Tooltip>
						</div>
					) : (
						<div className="invisible flex w-11 justify-center">
							<IconButton
								ariaHidden
								tabIndex={-1}
								disabled
								icon={<RotateCcw className={iconClass} />}
							/>
						</div>
					)}
				</div>
			</td>
		</tr>
	);
};
