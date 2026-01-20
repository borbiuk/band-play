import { MessageCode } from '@shared/enums';
import { BatchDownloadItemModel } from '../batch-download-item-model';
import { DownloadStatus } from '../download-status';
import { DownloadType } from '../download-type';
import { BatchDownloadItemIdMessage } from '@shared/models/messages';
import messageService from '@shared/services/message-service';
import FolderOpen from 'lucide-react/dist/esm/icons/folder-open';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import React from 'react';
import { Tooltip } from 'react-tooltip';

import { IconButton } from '@shared/components/button';

type Props = {
	item: BatchDownloadItemModel;
	idx: number;
	onRetry: (id: string) => void;
	onRemove: (id: string) => void;
};

export const DownloadItemRow = ({ item, idx, onRetry, onRemove }: Props) => {
	const isDownloading =
		item.type === DownloadType.Single &&
		item.status === DownloadStatus.Downloading;
	const isPaused =
		item.type === DownloadType.Single &&
		item.status === DownloadStatus.Paused;
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

	return (
		<tr className="border-b border-gray-100">
			<td className="p-2 text-xs text-gray-500">{idx + 1}</td>
			<td className="truncate p-2 text-sm text-gray-900">{item.title}</td>
			<td className="p-2 text-sm text-gray-700">{item.status}</td>
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
				<div className="grid grid-cols-3 gap-2">
					{/* Slot 1: Show in folder */}
					{canShowInFolder ? (
						<div>
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
						<div className="invisible">
							<IconButton
								ariaHidden
								tabIndex={-1}
								disabled
								icon={<FolderOpen className={iconClass} />}
							/>
						</div>
					)}

					{/* Slot 2: Remove */}
					<div>
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

					{/* Slot 3: Retry */}
					{canRetry ? (
						<div>
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
						<div className="invisible">
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
