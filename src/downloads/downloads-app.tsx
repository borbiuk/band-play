import { BatchDownloadInline } from '@shared/components/batch-download';
import { LabelButton } from '@shared/components/button';
import { ExternalLinksInline } from '@shared/components/external-links';
import { MessageCode, PortName } from '@shared/enums';
import { ConfigModel } from '@shared/models/config-model';
import {
	BatchDownloadItemIdMessage,
	BatchDownloadProgressMessage,
	MessageModel,
} from '@shared/models/messages';
import configService from '@shared/services/config-service';
import messageService from '@shared/services/message-service';
import { exist, notExist } from '@shared/utils';
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
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { BatchDownloadItemModel } from './batch-download-item-model';
import { DownloadItemRow } from './components/download-item-row';
import { DownloadStatus } from './download-status';
import { DownloadType } from './download-type';

const BATCH_DOWNLOAD_ITEMS_KEY = 'batchDownloadItems';

// Windowed rendering: rows have a fixed height (h-16), so only the visible
// slice is rendered once the list grows beyond the threshold.
const WINDOWED_THRESHOLD = 100;
const ROW_HEIGHT = 64;
const WINDOW_OVERSCAN = 10;

// Speed / ETA sampling for the overall progress readout.
const RATE_SAMPLE_INTERVAL_MS = 1000;
const RATE_SAMPLE_WINDOW_MS = 5000;
const RATE_MIN_WINDOW_MS = 3000;

const formatSizeMb = (mb: number): string => {
	if (mb >= 1024) {
		return `${(mb / 1024).toFixed(1)} GB`;
	}

	return `${Math.max(Math.round(mb), 1)} MB`;
};

const formatSpeed = (mbPerSec: number): string => {
	if (mbPerSec >= 1) {
		return `${mbPerSec.toFixed(1)} MB/s`;
	}

	return `${Math.max(Math.round(mbPerSec * 1024), 1)} KB/s`;
};

const formatEta = (seconds: number): string => {
	if (seconds >= 3600) {
		return `~${Math.round(seconds / 3600)} h left`;
	}

	if (seconds >= 60) {
		return `~${Math.round(seconds / 60)} min left`;
	}

	return `~${Math.max(Math.round(seconds), 1)} s left`;
};

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

	const [{ items: storedItems }, dispatch] = useReducer(
		downloadsReducer,
		initialState
	);

	// Volatile per-item progress pushed by the background over the UI port.
	// Persisted items only carry progress captured at status transitions.
	const [liveProgress, setLiveProgress] = useState(
		{} as Record<string, number>
	);

	const items = useMemo(() => {
		return storedItems.map((x): BatchDownloadItemModel => {
			if (x.type !== DownloadType.Single) {
				return x;
			}

			const live = liveProgress[x.id];
			if (notExist(live)) {
				return x;
			}

			if (x.status === DownloadStatus.Downloading) {
				if (x.download.progress === live) {
					return x;
				}

				return { ...x, download: { ...x.download, progress: live } };
			}

			if (
				x.status === DownloadStatus.Paused ||
				x.status === DownloadStatus.Duplicate
			) {
				// The persisted value was captured at the pause transition
				// and can be fresher than the last pushed live value.
				const progress = Math.max(x.download.progress ?? 0, live);
				if (x.download.progress === progress) {
					return x;
				}

				return { ...x, download: { ...x.download, progress } };
			}

			return x;
		});
	}, [storedItems, liveProgress]);

	useEffect(() => {
		configService
			.getAll()
			.then((x) => {
				setConfig(x);
			})
			.catch((e) => console.error(e));

		return configService.addListener((x) => {
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

	// Long-lived port to the background: signals that this page is open (the
	// background runs its fine-grained progress poller only then) and carries
	// volatile progress updates that are not written to storage.
	useEffect(() => {
		let port: chrome.runtime.Port = null;
		let reconnectTimeoutId: number = null;
		let disposed = false;

		const scheduleReconnect = () => {
			if (disposed || exist(reconnectTimeoutId)) {
				return;
			}

			reconnectTimeoutId = setTimeout(() => {
				reconnectTimeoutId = null;
				connect();
			}, 1000) as unknown as number;
		};

		const connect = () => {
			if (disposed) {
				return;
			}

			try {
				port = chrome.runtime.connect({
					name: PortName.BatchDownloadUi,
				});
			} catch {
				port = null;
				scheduleReconnect();
				return;
			}

			port.onMessage.addListener(
				(message: MessageModel<BatchDownloadProgressMessage>) => {
					if (
						message?.code !==
						MessageCode.BatchDownloadProgressUpdate
					) {
						return;
					}

					const updates = message.data?.updates;
					if (!Array.isArray(updates) || updates.length === 0) {
						return;
					}

					setLiveProgress((prev) => {
						const next = { ...prev };
						for (const update of updates) {
							if (
								exist(update?.id) &&
								Number.isFinite(update.progress)
							) {
								next[update.id] = update.progress;
							}
						}
						return next;
					});
				}
			);

			// The MV3 service worker can be stopped at any moment, which
			// disconnects the port: reconnect so the background keeps
			// polling progress while this page stays open.
			port.onDisconnect.addListener(() => {
				port = null;
				scheduleReconnect();
			});
		};

		connect();

		return () => {
			disposed = true;
			if (exist(reconnectTimeoutId)) {
				clearTimeout(reconnectTimeoutId);
			}

			try {
				port?.disconnect();
			} catch {
				// ignore
			}
		};
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
					x.status !== DownloadStatus.Completed &&
					x.status !== DownloadStatus.Failed)
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

	const hasUnverifiedFailure = items.some(
		(x) =>
			x.type === DownloadType.Pending &&
			x.status === DownloadStatus.Failed &&
			x.failReason === 'unverified'
	);

	const overall = useMemo(() => {
		const singles = items.filter(
			(x) => x.type === DownloadType.Single
		) as Extract<BatchDownloadItemModel, { type: DownloadType.Single }>[];

		const total = singles.length;
		const completed = singles.filter(
			(x) => x.status === DownloadStatus.Completed
		).length;
		const failed = singles.filter(
			(x) => x.status === DownloadStatus.Failed
		).length;

		const progressOf = (
			x: Extract<BatchDownloadItemModel, { type: DownloadType.Single }>
		) => {
			if (x.status === DownloadStatus.Completed) {
				return 100;
			}

			const value = x.download.progress;
			return Number.isFinite(value)
				? Math.min(Math.max(value, 0), 100)
				: 0;
		};

		const knownSizeMb = singles.reduce(
			(sum, x) => sum + (x.download.sizeMb ?? 0),
			0
		);
		const downloadedMb = singles.reduce(
			(sum, x) => sum + (x.download.sizeMb ?? 0) * (progressOf(x) / 100),
			0
		);
		const allSizesKnown =
			total > 0 && singles.every((x) => exist(x.download.sizeMb));

		// Weight by size when every size is known, otherwise plain average.
		const donePct =
			total === 0
				? 0
				: allSizesKnown && knownSizeMb > 0
					? (downloadedMb / knownSizeMb) * 100
					: singles.reduce((sum, x) => sum + progressOf(x), 0) /
						total;
		const failedPct = total === 0 ? 0 : (failed / total) * 100;

		return {
			total,
			completed,
			failed,
			donePct,
			failedPct,
			knownSizeMb,
			downloadedMb,
			allSizesKnown,
		};
	}, [items]);

	const [rate, setRate] = useState(
		null as { speedMbPerSec: number; etaSec: number }
	);
	const rateSamplesRef = useRef([] as { t: number; mb: number }[]);
	const overallRef = useRef(overall);
	overallRef.current = overall;

	useEffect(() => {
		if (!hasDownloading) {
			rateSamplesRef.current = [];
			setRate(null);
			return undefined;
		}

		const intervalId = setInterval(() => {
			const now = Date.now();
			const samples = rateSamplesRef.current;
			samples.push({ t: now, mb: overallRef.current.downloadedMb });
			while (
				samples.length > 0 &&
				now - samples[0].t > RATE_SAMPLE_WINDOW_MS
			) {
				samples.shift();
			}

			const windowMs = samples.length > 1 ? now - samples[0].t : 0;
			if (windowMs < RATE_MIN_WINDOW_MS) {
				setRate(null);
				return;
			}

			const deltaMb = overallRef.current.downloadedMb - samples[0].mb;
			const speedMbPerSec = deltaMb / (windowMs / 1000);
			if (speedMbPerSec <= 0) {
				setRate(null);
				return;
			}

			const remainingMb = Math.max(
				overallRef.current.knownSizeMb -
					overallRef.current.downloadedMb,
				0
			);
			setRate({ speedMbPerSec, etaSec: remainingMb / speedMbPerSec });
		}, RATE_SAMPLE_INTERVAL_MS);

		return () => clearInterval(intervalId);
	}, [hasDownloading]);

	useEffect(() => {
		if (overall.total === 0 || queuedCount === 0) {
			document.title = 'BandPlay Downloads';
			return;
		}

		const pct = Math.round(overall.donePct);
		const pausedSuffix = !hasDownloading && hasPaused ? ' paused' : '';
		document.title = `BandPlay · ${pct}%${pausedSuffix}`;
	}, [
		overall.donePct,
		overall.total,
		queuedCount,
		hasDownloading,
		hasPaused,
	]);
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

	const tableWrapRef = useRef(null as HTMLDivElement);
	const [rowWindow, setRowWindow] = useState({
		start: 0,
		end: WINDOWED_THRESHOLD,
	});
	const isWindowed = sortedItems.length > WINDOWED_THRESHOLD;

	useEffect(() => {
		if (!isWindowed) {
			return undefined;
		}

		let rafId = 0;
		const update = () => {
			rafId = 0;
			const wrap = tableWrapRef.current;
			if (!wrap) {
				return;
			}

			const top = wrap.getBoundingClientRect().top;
			const start = Math.max(
				Math.floor(-top / ROW_HEIGHT) - WINDOW_OVERSCAN,
				0
			);
			const visibleCount =
				Math.ceil(window.innerHeight / ROW_HEIGHT) +
				WINDOW_OVERSCAN * 2;
			setRowWindow((prev) => {
				const end = Math.min(start + visibleCount, sortedItems.length);
				if (prev.start === start && prev.end === end) {
					return prev;
				}

				return { start, end };
			});
		};

		const onScroll = () => {
			if (!rafId) {
				rafId = requestAnimationFrame(update);
			}
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (rafId) {
				cancelAnimationFrame(rafId);
			}
		};
	}, [isWindowed, sortedItems.length]);

	const visibleItems = isWindowed
		? sortedItems.slice(rowWindow.start, rowWindow.end)
		: sortedItems;
	const windowOffset = isWindowed ? rowWindow.start : 0;
	const topSpacerHeight = windowOffset * ROW_HEIGHT;
	const bottomSpacerHeight = isWindowed
		? Math.max(sortedItems.length - rowWindow.end, 0) * ROW_HEIGHT
		: 0;

	const sendItemCommand = (code: MessageCode, itemId: string) => {
		messageService
			.sendToBackground<BatchDownloadItemIdMessage>({
				code,
				data: { id: itemId },
			})
			.catch(() => void 0);
	};

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

			{hasUnverifiedFailure && (
				<div
					role="alert"
					className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
				>
					Bandcamp requires a verified email address before it allows
					downloads. Check your inbox, verify your account, then use
					&quot;Retry failed&quot;.
				</div>
			)}

			{hasItems && (
				<div className="mt-4">
					<div className="flex items-center justify-between text-sm text-gray-600">
						<span role="status">
							{`Downloaded ${overall.completed} of ${overall.total}`}
							{overall.failed > 0 && (
								<span className="text-red-500">{` · ${overall.failed} failed`}</span>
							)}
						</span>
						<span className="tabular-nums">
							{overall.knownSizeMb > 0 &&
								`${overall.allSizesKnown ? '' : '~'}${formatSizeMb(overall.downloadedMb)} / ${formatSizeMb(overall.knownSizeMb)}`}
							{rate &&
								` · ${formatSpeed(rate.speedMbPerSec)} · ${formatEta(rate.etaSec)}`}
						</span>
					</div>
					<div
						className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-gray-100"
						role="progressbar"
						aria-label="Overall download progress"
						aria-valuenow={Math.round(overall.donePct)}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div
							className="h-2 bg-band-500"
							style={{ width: `${overall.donePct}%` }}
						/>
						<div
							className="h-2 bg-red-400"
							style={{
								width: `${Math.min(
									overall.failedPct,
									Math.max(100 - overall.donePct, 0)
								)}%`,
							}}
						/>
					</div>
				</div>
			)}

			<div
				ref={tableWrapRef}
				className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
			>
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
							<th className="w-56 p-2 text-left text-xs font-semibold text-gray-600">
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

						{topSpacerHeight > 0 && (
							<tr
								aria-hidden="true"
								style={{ height: topSpacerHeight }}
							/>
						)}

						{visibleItems.map((item, idx) => (
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
										: windowOffset + idx + 1
								}
								showTitleGroup={showTitleGroup}
								titleGroupLetter={
									titleGroupById.get(item.id) ?? ''
								}
								showStatusIcon={showStatusIcon}
								onRetry={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadRetryItem,
										itemId
									);
								}}
								onResume={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadResumeItem,
										itemId
									);
								}}
								onPause={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadPauseItem,
										itemId
									);
								}}
								onCancel={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadCancelItem,
										itemId
									);
								}}
								onDeleteFile={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadDeleteFile,
										itemId
									);
								}}
								onShowInFolder={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadShowInFolder,
										itemId
									);
								}}
								onRemove={(itemId) => {
									sendItemCommand(
										MessageCode.BatchDownloadRemoveItem,
										itemId
									);
								}}
							/>
						))}

						{bottomSpacerHeight > 0 && (
							<tr
								aria-hidden="true"
								style={{ height: bottomSpacerHeight }}
							/>
						)}
					</tbody>
				</table>
			</div>

			<span className="absolute right-1 top-1 z-10 -mr-16 text-end text-[10px] text-gray-500">
				by borbiuk
			</span>
		</div>
	);
};
