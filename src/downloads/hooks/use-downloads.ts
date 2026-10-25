import { BATCH_DOWNLOAD_ITEMS_KEY } from '@shared/constants/storage-keys';
import { MessageCode, PortName } from '@shared/enums';
import { useStorageValue } from '@shared/hooks/use-storage-value';
import { BatchDownloadItemModel } from '@shared/models/batch-download/batch-download-item-model';
import { DownloadStatus } from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';
import { Message } from '@shared/models/messages';
import { exist, notExist } from '@shared/utils';
import { toBatchDownloadItems } from '@shared/utils/batch-download-items.utils';
import { useEffect, useMemo, useState } from 'react';

/** Delay before the port is opened again after the service worker stopped. */
const RECONNECT_DELAY_MS = 1000;

/** Puts the volatile progress over the stored value of a file. */
const withLiveProgress = (
	item: BatchDownloadItemModel,
	live: number | undefined
): BatchDownloadItemModel => {
	if (item.type !== DownloadType.Single || notExist(live)) {
		return item;
	}

	if (item.status === DownloadStatus.Downloading) {
		return item.download.progress === live
			? item
			: { ...item, download: { ...item.download, progress: live } };
	}

	if (
		item.status === DownloadStatus.Paused ||
		item.status === DownloadStatus.Duplicate
	) {
		// The stored value was captured at the pause and can be fresher than the last pushed one
		const progress = Math.max(item.download.progress ?? 0, live);
		return item.download.progress === progress
			? item
			: { ...item, download: { ...item.download, progress } };
	}

	return item;
};

/**
 * The batch download list: read from storage and kept up to date, with the live progress the background
 * pushes over a long-lived port. The port also tells the background that this page is open, so it runs its
 * fine-grained progress poller only then. The hook never writes anything.
 *
 * @returns The items with live progress applied, and whether the stored list has been read yet.
 */
export const useDownloads = (): {
	items: BatchDownloadItemModel[];
	isLoaded: boolean;
} => {
	const stored = useStorageValue(
		BATCH_DOWNLOAD_ITEMS_KEY,
		toBatchDownloadItems
	);

	// Volatile per-item progress pushed by the background; stored items only carry progress from status changes
	const [liveProgress, setLiveProgress] = useState<Record<string, number>>(
		{}
	);

	useEffect(() => {
		let port: chrome.runtime.Port | null = null;
		let reconnectTimeoutId: number | null = null;
		let disposed = false;

		const scheduleReconnect = () => {
			if (disposed || exist(reconnectTimeoutId)) {
				return;
			}

			reconnectTimeoutId = window.setTimeout(() => {
				reconnectTimeoutId = null;
				connect();
			}, RECONNECT_DELAY_MS);
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
				(message: Message<MessageCode.BatchDownloadProgressUpdate>) => {
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

					setLiveProgress((previous) => {
						const next = { ...previous };
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

			// The MV3 service worker can stop at any moment, which closes the port: open it again,
			// so the background keeps polling progress while this page stays open
			port.onDisconnect.addListener(() => {
				port = null;
				scheduleReconnect();
			});
		};

		connect();

		return () => {
			disposed = true;
			if (exist(reconnectTimeoutId)) {
				window.clearTimeout(reconnectTimeoutId);
			}

			try {
				port?.disconnect();
			} catch {
				// ignore
			}
		};
	}, []);

	const items = useMemo(
		() =>
			(stored ?? []).map((item) =>
				withLiveProgress(item, liveProgress[item.id])
			),
		[stored, liveProgress]
	);

	return { items, isLoaded: stored !== null };
};
