import { BatchDownloadControls } from '@shared/components/batch-download';
import { MessageCode } from '@shared/enums/message-code';
import messageService from '@shared/services/message-service';
import React, { useEffect, useState } from 'react';

import { BatchDownloadItemModel } from '../../downloads/batch-download-item-model';
import { DownloadStatus } from '../../downloads/download-status';
import { DownloadType } from '../../downloads/download-type';

import { LabelButton } from '@shared/components/button';

const BATCH_DOWNLOAD_ITEMS_KEY = 'batchDownloadItems';

const hasActiveDownloads = (items: BatchDownloadItemModel[]): boolean => {
	for (const x of items) {
		if (x.type === DownloadType.Pending) {
			if (x.status !== DownloadStatus.Failed) {
				return true;
			}
		}

		if (x.type === DownloadType.Single) {
			if (
				x.status !== DownloadStatus.Completed &&
				x.status !== DownloadStatus.Failed
			) {
				return true;
			}
		}

		if (x.type === DownloadType.Multiple) {
			if (x.status !== DownloadStatus.Completed) {
				return true;
			}
		}
	}

	return false;
};

export const BatchDownload = () => {
	const [showOpenDownloads, setShowOpenDownloads] = useState(false);

	useEffect(() => {
		const load = async () => {
			const data = await chrome.storage.local.get([
				BATCH_DOWNLOAD_ITEMS_KEY,
			]);
			const raw = data[BATCH_DOWNLOAD_ITEMS_KEY] as unknown;
			const items = Array.isArray(raw)
				? (raw as BatchDownloadItemModel[])
				: [];
			setShowOpenDownloads(hasActiveDownloads(items));
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

		chrome.storage.local.onChanged.addListener(onChanged);
		return () => chrome.storage.local.onChanged.removeListener(onChanged);
	}, []);

	return (
		<div className="relative flex flex-col gap-y-2 rounded-xl border border-gray-300 p-2 pt-4 shadow-md shadow-gray-300">
			<span className="absolute left-1 z-20 -mt-8 rounded-xl p-1 text-base text-gray-500 backdrop-blur-sm">
				Downloads
			</span>

			{showOpenDownloads && (
				<LabelButton
					label="Open downloads"
					onClick={() => {
						messageService
							.sendToBackground({
								code: MessageCode.BatchDownloadOpenDownloadsTab,
							})
							.catch(() => void 0);
					}}
				/>
			)}

			<BatchDownloadControls controlsClassName="flex flex-col gap-y-2" />
		</div>
	);
};
