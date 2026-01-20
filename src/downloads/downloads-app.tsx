import { BatchDownloadInline } from '@shared/components/batch-download';
import { LabelButton } from '@shared/components/button';
import { ExternalLinksInline } from '@shared/components/external-links';
import { MessageCode } from '@shared/enums';
import { ConfigModel } from '@shared/models/config-model';
import { BatchDownloadItemIdMessage } from '@shared/models/messages';
import configService from '@shared/services/config-service';
import messageService from '@shared/services/message-service';
import { notExist } from '@shared/utils';
import { CheckCheck, Pause, Play, RotateCcw, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useReducer, useState } from 'react';

import { BatchDownloadItemModel } from './batch-download-item-model';
import { DownloadItemRow } from './components/download-item-row';
import { DownloadStatus } from './download-status';
import { DownloadType } from './download-type';

const BATCH_DOWNLOAD_ITEMS_KEY = 'batchDownloadItems';

type DownloadsState = {
	items: BatchDownloadItemModel[];
};

type DownloadsAction = {
	type: 'state/setItems';
	items: BatchDownloadItemModel[];
};

const initialState: DownloadsState = {
	items: [],
};

const downloadsReducer = (
	state: DownloadsState,
	action: DownloadsAction
): DownloadsState => {
	if (action.type === 'state/setItems') {
		return { ...state, items: action.items };
	}

	return state;
};

export const DownloadsApp = () => {
	const [config, setConfig] = useState(null as ConfigModel);

	const [{ items }, dispatch] = useReducer(downloadsReducer, initialState);

	useEffect(() => {
		configService.getAll().then((x) => {
			setConfig(x);
		});

		configService.addListener((x) => {
			setConfig(x);
		});
	}, []);

	useEffect(() => {
		const load = async () => {
			const data = await chrome.storage.local.get([
				BATCH_DOWNLOAD_ITEMS_KEY,
			]);
			const raw = data[BATCH_DOWNLOAD_ITEMS_KEY] as unknown;
			const nextItems = Array.isArray(raw)
				? (raw as BatchDownloadItemModel[])
				: [];
			dispatch({ type: 'state/setItems', items: nextItems });
		};

		load().catch(() => void 0);

		const onChanged: Parameters<
			typeof chrome.storage.local.onChanged.addListener
		>[0] = (changes) => {
			if (!changes[BATCH_DOWNLOAD_ITEMS_KEY]) {
				return;
			}

			load().catch(() => void 0);
		};

		chrome.storage.onChanged.addListener(onChanged);
		return () => chrome.storage.onChanged.removeListener(onChanged);
	}, []);

	const queuedCount = useMemo(() => {
		return items.filter(
			(x) =>
				(x.type === DownloadType.Pending &&
					x.status !== DownloadStatus.Failed) ||
				(x.type === DownloadType.Single &&
					x.status !== DownloadStatus.Completed &&
					x.status !== DownloadStatus.Failed) ||
				(x.type === DownloadType.Multiple &&
					x.status !== DownloadStatus.Completed)
		).length;
	}, [items]);

	const failedItems = useMemo(() => {
		return items.filter(
			(x) =>
				(x.type === DownloadType.Pending &&
					x.status === DownloadStatus.Failed) ||
				(x.type === DownloadType.Single &&
					x.status === DownloadStatus.Failed)
		);
	}, [items]);

	const retryFailed = () => {
		messageService
			.sendToBackground({
				code: MessageCode.BatchDownloadRetryAllFailed,
			})
			.catch(() => void 0);
	};

	const pauseAll = () => {
		messageService
			.sendToBackground({
				code: MessageCode.BatchDownloadPauseAll,
			})
			.catch(() => void 0);
	};

	const resumeAll = () => {
		messageService
			.sendToBackground({
				code: MessageCode.BatchDownloadResumeAll,
			})
			.catch(() => void 0);
	};

	const clearAll = () => {
		messageService
			.sendToBackground({
				code: MessageCode.BatchDownloadClearAll,
			})
			.catch(() => void 0);
	};

	const clearCompleted = () => {
		messageService
			.sendToBackground({
				code: MessageCode.BatchDownloadClearCompleted,
			})
			.catch(() => void 0);
	};

	if (notExist(config)) {
		return (
			<div className="flex h-screen items-center justify-center">...</div>
		);
	}

	const hasDownloading = items.some(
		(x) =>
			x.type === DownloadType.Single &&
			x.status === DownloadStatus.Downloading
	);

	const hasPaused = items.some(
		(x) =>
			x.type === DownloadType.Single && x.status === DownloadStatus.Paused
	);

	const hasCompleted = items.some(
		(x) => x.status === DownloadStatus.Completed
	);

	const hasItems = items.length > 0;

	return (
		<div className="container relative mx-auto px-4 py-4">
			{/* Header */}
			<div className="mt-4 flex w-full flex-row items-center justify-between gap-6">
				<div className="flex flex-row items-center gap-1.5 transition-all duration-300 ease-in-out hover:scale-102">
					<img
						src="./../assets/logo-128.png"
						alt="Bandplay logo"
						className="h-12 w-12 rounded-full shadow-xl shadow-gray-300"
					/>
					<div className="ml-2 flex flex-col">
						<span className="text-2xl font-medium text-gray-800">
							BandPlay
						</span>
						<span className="-mt-1.5 text-xl font-medium text-gray-500">
							Downloads
						</span>
					</div>
				</div>

				<BatchDownloadInline />

				<ExternalLinksInline />
			</div>

			<div className="mt-10 flex items-center">
				<div className="flex grow items-center gap-x-2">
					<span className="font-semibold text-gray-800">
						Remaining
					</span>
					<span className="rounded-full bg-band-500 px-2 py-0.5 text-sm text-white">
						{queuedCount}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<LabelButton
						onClick={clearAll}
						disabled={!hasItems}
						ariaLabel="Clear all"
					>
						<span className="flex items-center gap-2">
							<Trash2 className="h-4 w-4" />
							<span>Clear all</span>
						</span>
					</LabelButton>

					<LabelButton
						onClick={pauseAll}
						disabled={!hasDownloading}
						ariaLabel="Pause all"
					>
						<span className="flex items-center gap-2">
							<Pause className="h-4 w-4" />
							<span>Pause all</span>
						</span>
					</LabelButton>

					<LabelButton
						onClick={resumeAll}
						disabled={!hasPaused}
						ariaLabel="Resume all"
					>
						<span className="flex items-center gap-2">
							<Play className="h-4 w-4" />
							<span>Resume all</span>
						</span>
					</LabelButton>

					<LabelButton
						onClick={retryFailed}
						disabled={failedItems.length === 0}
						ariaLabel="Retry failed"
					>
						<span className="flex items-center gap-2">
							<RotateCcw className="h-4 w-4" />
							<span>Retry failed</span>
						</span>
					</LabelButton>

					<LabelButton
						onClick={clearCompleted}
						disabled={!hasCompleted}
						ariaLabel="Clear completed"
					>
						<span className="flex items-center gap-2">
							<CheckCheck className="h-4 w-4" />
							<span>Clear completed</span>
						</span>
					</LabelButton>
				</div>
			</div>

			<div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
				<table className="w-full table-fixed">
					<thead className="border-b border-gray-200 bg-gray-50">
						<tr>
							<th className="w-7 p-2 text-left text-xs font-semibold text-gray-600">
								#
							</th>
							<th className="p-2 text-left text-xs font-semibold text-gray-600">
								Title
							</th>
							<th className="w-28 p-2 text-left text-xs font-semibold text-gray-600">
								Status
							</th>
							<th className="w-40 p-2 text-left text-xs font-semibold text-gray-600">
								Progress
							</th>
							<th className="w-32 p-2 text-left text-xs font-semibold text-gray-600">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{items.length === 0 && (
							<tr className="h-80">
								<td colSpan={5} className="p-2">
									<div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-sm text-gray-500">
										<div className="font-medium text-gray-700">
											No files yet
										</div>
										<div>
											Select tracks on the Collection page
											and click Download.
										</div>
									</div>
								</td>
							</tr>
						)}

						{items.map((item, idx) => (
							<DownloadItemRow
								key={item.id}
								item={item}
								idx={idx}
								onRetry={(itemId) => {
									messageService
										.sendToBackground<BatchDownloadItemIdMessage>(
											{
												code: MessageCode.BatchDownloadRetryItem,
												data: { id: itemId },
											}
										)
										.catch(() => void 0);
								}}
								onRemove={(itemId) => {
									messageService
										.sendToBackground<BatchDownloadItemIdMessage>(
											{
												code: MessageCode.BatchDownloadRemoveItem,
												data: { id: itemId },
											}
										)
										.catch(() => void 0);
								}}
							/>
						))}
					</tbody>
				</table>
			</div>

			<span className="absolute right-1 top-1 z-10 -mr-16 text-end text-[10px] text-gray-500">
				by borbiuk
			</span>
		</div>
	);
};
