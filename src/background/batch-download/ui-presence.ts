import { MessageCode, PortName } from '@shared/enums';
import { BatchDownloadProgressMessage, Message } from '@shared/models/messages';
import { exist } from '@shared/utils';

/**
 * Tracks whether the downloads page is currently open, via long-lived
 * chrome.runtime.connect ports the page opens on mount.
 *
 * The background uses this to run the fine-grained progress poller only while
 * someone is actually looking at the progress, and to push volatile progress
 * values over the port instead of writing them to chrome.storage.local.
 * The port set lives in service worker memory: when the worker restarts the
 * page reconnects, which re-populates it.
 */

const connectedUiPorts = new Set<chrome.runtime.Port>();
let onUiConnected: (() => void) | null = null;

/** Registers the top-level onConnect listener for downloads UI ports. */
export const registerDownloadsUiPresence = (
	onConnectedCallback: () => void
): void => {
	onUiConnected = onConnectedCallback;

	chrome.runtime.onConnect.addListener((port) => {
		if (port.name !== PortName.BatchDownloadUi) {
			return;
		}

		connectedUiPorts.add(port);
		port.onDisconnect.addListener(() => {
			connectedUiPorts.delete(port);
		});

		if (exist(onUiConnected)) {
			onUiConnected();
		}
	});
};

export const isDownloadsUiConnected = (): boolean => {
	return connectedUiPorts.size > 0;
};

/** Pushes volatile progress updates to every connected downloads page. */
export const broadcastBatchDownloadProgress = (
	updates: BatchDownloadProgressMessage['updates']
): void => {
	if (updates.length === 0 || connectedUiPorts.size === 0) {
		return;
	}

	const message: Message<MessageCode.BatchDownloadProgressUpdate> = {
		code: MessageCode.BatchDownloadProgressUpdate,
		data: { updates },
	};

	for (const port of connectedUiPorts) {
		try {
			port.postMessage(message);
		} catch {
			// The page is gone but onDisconnect did not fire yet.
			connectedUiPorts.delete(port);
		}
	}
};
