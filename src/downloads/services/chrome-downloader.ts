import { BatchDownloadFileModel } from '../batch-download-file-model';

export type DownloadResultStatus = 'completed' | 'failed';

const waitForDownloadToComplete = (
	downloadId: number
): Promise<DownloadResultStatus> =>
	new Promise((resolve) => {
		const onChanged = (delta: chrome.downloads.DownloadDelta) => {
			if (delta.id !== downloadId) {
				return;
			}

			if (!delta.state) {
				return;
			}

			if (delta.state.current === 'in_progress') {
				return;
			}

			chrome.downloads.onChanged.removeListener(onChanged);
			resolve(
				delta.state.current === 'complete' ? 'completed' : 'failed'
			);
		};

		chrome.downloads.onChanged.addListener(onChanged);
	});

export const startChromeDownload = async (
	download: BatchDownloadFileModel,
	onStarted?: (downloadId: number) => void
): Promise<{ status: DownloadResultStatus; downloadId?: number }> => {
	try {
		const downloadId = await chrome.downloads.download({
			url: download.url,
			conflictAction: 'uniquify',
		});

		if (onStarted) {
			onStarted(downloadId);
		}

		const status = await waitForDownloadToComplete(downloadId);
		return { status, downloadId };
	} catch (_e) {
		return { status: 'failed' };
	}
};
