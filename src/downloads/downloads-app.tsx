import { BatchDownloadInline } from '@shared/components/batch-download';
import { LabelButton } from '@shared/components/button';
import { ExternalLinksInline } from '@shared/components/external-links';
import { MessageCode } from '@shared/enums';
import { ConfigModel } from '@shared/models/config-model';
import { BatchDownloadItemIdMessage } from '@shared/models/messages';
import configService from '@shared/services/config-service';
import messageService from '@shared/services/message-service';
import { notExist } from '@shared/utils';
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	CheckCheck,
	Pause,
	Play,
	RotateCcw,
	Trash2,
} from 'lucide-react';
import React, { useEffect, useMemo, useReducer, useState } from 'react';

import { BatchDownloadItemModel } from './batch-download-item-model';
import { DownloadItemRow } from './components/download-item-row';
import { DownloadStatus } from './download-status';
import { DownloadType } from './download-type';

const BATCH_DOWNLOAD_ITEMS_KEY = 'batchDownloadItems';

type DownloadsState = {
	items: BatchDownloadItemModel[];
};

type SortKey = 'index' | 'title' | 'status' | null;
type SortDirection = 'asc' | 'desc' | null;

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
	const [sort, setSort] = useState<{
		key: SortKey;
		direction: SortDirection;
	}>({ key: null, direction: null });

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

	const hasDownloading = items.some(
		(x) =>
			x.type === DownloadType.Single &&
			x.status === DownloadStatus.Downloading
	);

	const hasPaused = items.some(
		(x) =>
			x.type === DownloadType.Single && x.status === DownloadStatus.Paused
	);
	const hasDuplicate = items.some(
		(x) =>
			x.type === DownloadType.Single &&
			x.status === DownloadStatus.Duplicate
	);

	const hasCompleted = items.some(
		(x) => x.status === DownloadStatus.Completed
	);

	const hasItems = items.length > 0;
	const baseOrderInfo = useMemo(() => {
		const orderById = new Map(items.map((item, index) => [item.id, index]));
		const getSequence = (item: BatchDownloadItemModel) =>
			item.collectionIndex ?? (orderById.get(item.id) ?? 0) + 1;
		const getCreatedAt = (item: BatchDownloadItemModel) =>
			item.createdAt ?? 0;

		const compareDefault = (
			a: BatchDownloadItemModel,
			b: BatchDownloadItemModel
		) => {
			const dateDiff = getCreatedAt(b) - getCreatedAt(a);
			if (dateDiff !== 0) {
				return dateDiff;
			}

			const seqDiff = getSequence(a) - getSequence(b);
			if (seqDiff !== 0) {
				return seqDiff;
			}

			return (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0);
		};

		const baseOrder = [...items].sort(compareDefault);
		const sequenceById = new Map<string, number>();
		baseOrder.forEach((item, index) => {
			sequenceById.set(item.id, index + 1);
		});

		return {
			orderById,
			getSequence,
			getCreatedAt,
			compareDefault,
			baseOrder,
			sequenceById,
		};
	}, [items]);

	const duplicateIndexById = useMemo(() => {
		const counts = new Map<string, number>();
		for (const item of items) {
			if (!item.sourceId) {
				continue;
			}
			counts.set(item.sourceId, (counts.get(item.sourceId) ?? 0) + 1);
		}

		const map = new Map<string, number>();
		const seen = new Map<string, number>();
		for (const item of baseOrderInfo.baseOrder) {
			if (!item.sourceId) {
				continue;
			}

			if ((counts.get(item.sourceId) ?? 0) <= 1) {
				continue;
			}

			const next = (seen.get(item.sourceId) ?? 0) + 1;
			seen.set(item.sourceId, next);
			map.set(item.id, next);
		}

		return map;
	}, [baseOrderInfo.baseOrder, items]);

	const sortedItems = useMemo(() => {
		const compareIndex = (
			a: BatchDownloadItemModel,
			b: BatchDownloadItemModel
		) =>
			(baseOrderInfo.sequenceById.get(a.id) ?? 0) -
			(baseOrderInfo.sequenceById.get(b.id) ?? 0);
		const compareTitle = (
			a: BatchDownloadItemModel,
			b: BatchDownloadItemModel
		) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
		const compareStatus = (
			a: BatchDownloadItemModel,
			b: BatchDownloadItemModel
		) =>
			String(a.status).localeCompare(String(b.status), undefined, {
				sensitivity: 'base',
			});

		const next = [...items];
		if (!sort.key || !sort.direction) {
			return [...baseOrderInfo.baseOrder];
		}

		const direction = sort.direction === 'asc' ? 1 : -1;
		const compare =
			sort.key === 'title'
				? compareTitle
				: sort.key === 'status'
					? compareStatus
					: compareIndex;
		return next.sort((a, b) => {
			const diff = compare(a, b);
			if (diff !== 0) {
				return diff * direction;
			}

			return baseOrderInfo.compareDefault(a, b);
		});
	}, [baseOrderInfo, items, sort]);
	const showTitleGroup = sort.key === 'title' && sort.direction !== null;
	const showStatusIcon = sort.key === 'status' && sort.direction !== null;
	const titleGroupById = useMemo(() => {
		const map = new Map<string, string>();
		if (!showTitleGroup) {
			return map;
		}

		let lastLetter = '';
		for (const item of sortedItems) {
			const letter = String(item.title || '')
				.trim()
				.charAt(0)
				.toUpperCase();
			const nextLetter = letter || '#';
			if (nextLetter !== lastLetter) {
				map.set(item.id, nextLetter);
				lastLetter = nextLetter;
			} else {
				map.set(item.id, '');
			}
		}

		return map;
	}, [showTitleGroup, sortedItems]);

	if (notExist(config)) {
		return (
			<div className="flex h-screen items-center justify-center">...</div>
		);
	}

	const toggleSort = (key: Exclude<SortKey, null>) => {
		setSort((current) => {
			if (current.key !== key) {
				return { key, direction: 'desc' };
			}

			if (current.direction === 'desc') {
				return { key, direction: 'asc' };
			}

			if (current.direction === 'asc') {
				return { key: null, direction: null };
			}

			return { key, direction: 'desc' };
		});
	};

	const getSortIcon = (key: Exclude<SortKey, null>) => {
		if (sort.key !== key || !sort.direction) {
			return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
		}

		if (sort.direction === 'asc') {
			return <ArrowUp className="h-3.5 w-3.5 text-gray-600" />;
		}

		return <ArrowDown className="h-3.5 w-3.5 text-gray-600" />;
	};

	return (
		<div className="container relative mx-auto px-4 py-4 md:px-36 md:pb-20">
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
						disabled={!hasPaused && !hasDuplicate}
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
								<button
									type="button"
									className="flex items-center gap-1 text-left"
									onClick={() => toggleSort('index')}
								>
									<span>#</span>
									{getSortIcon('index')}
								</button>
							</th>
							<th
								className="w-16 p-2 text-left text-xs font-semibold text-gray-600"
								aria-hidden="true"
							></th>
							<th className="p-2 pl-8 text-left text-xs font-semibold text-gray-600">
								<button
									type="button"
									className="flex items-center gap-1 text-left"
									onClick={() => toggleSort('title')}
								>
									<span>Title</span>
									{getSortIcon('title')}
								</button>
							</th>
							<th className="w-28 p-2 pl-8 text-left text-xs font-semibold text-gray-600">
								<button
									type="button"
									className="flex items-center gap-1 text-left"
									onClick={() => toggleSort('status')}
								>
									<span>Status</span>
									{getSortIcon('status')}
								</button>
							</th>
							<th className="w-40 p-2 text-left text-xs font-semibold text-gray-600">
								Progress
							</th>
							<th className="w-44 p-2 text-left text-xs font-semibold text-gray-600">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{items.length === 0 && (
							<tr className="h-80">
								<td colSpan={6} className="p-2">
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

						{sortedItems.map((item, idx) => (
							<DownloadItemRow
								key={item.id}
								item={item}
								displayTitle={
									duplicateIndexById.has(item.id)
										? `${item.title} (${duplicateIndexById.get(item.id)})`
										: item.title
								}
								idx={
									baseOrderInfo.sequenceById.get(item.id)
										? baseOrderInfo.baseOrder.length -
											baseOrderInfo.sequenceById.get(
												item.id
											) +
											1
										: idx + 1
								}
								showTitleGroup={showTitleGroup}
								titleGroupLetter={
									titleGroupById.get(item.id) ?? ''
								}
								showStatusIcon={showStatusIcon}
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
								onResume={(itemId) => {
									messageService
										.sendToBackground<BatchDownloadItemIdMessage>(
											{
												code: MessageCode.BatchDownloadResumeItem,
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
