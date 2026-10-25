import { MessageCode } from '@shared/enums';

import { BatchDownloadItemIdMessage } from './batch-download-item-id-message';
import { BatchDownloadItemsMessage } from './batch-download-items-message';
import { BatchDownloadProgressMessage } from './batch-download-progress-message';
import { NewTabMessage } from './new-tab-message';

/** Codes that carry the id of one batch download item. */
export type ItemCommandCode =
	| MessageCode.BatchDownloadRetryItem
	| MessageCode.BatchDownloadResumeItem
	| MessageCode.BatchDownloadPauseItem
	| MessageCode.BatchDownloadCancelItem
	| MessageCode.BatchDownloadDeleteFile
	| MessageCode.BatchDownloadRemoveItem
	| MessageCode.BatchDownloadShowInFolder;

/** Codes that carry no data. */
export type CommandCode =
	| MessageCode.UrlChanged
	| MessageCode.BatchDownloadOpenDownloadsTab
	| MessageCode.BatchDownloadRetryAllFailed
	| MessageCode.BatchDownloadPauseAll
	| MessageCode.BatchDownloadResumeAll
	| MessageCode.BatchDownloadClearCompleted
	| MessageCode.BatchDownloadClearAll;

/**
 * The data of every message code. A new `MessageCode` must be added here: `Message` does not compile without it.
 */
export type MessagePayloads = {
	[MessageCode.CreateNewTab]: NewTabMessage;
	[MessageCode.NewUpdateAvailable]: chrome.runtime.UpdateAvailableDetails;
	[MessageCode.BatchDownloadSendItemsToBackground]: BatchDownloadItemsMessage;
	[MessageCode.BatchDownloadProgressUpdate]: BatchDownloadProgressMessage;
} & Record<ItemCommandCode, BatchDownloadItemIdMessage> &
	Record<CommandCode, undefined>;

/**
 * A message for inter-component communication: a code and the data that belongs to it.
 * Without a type argument it is any message, and `switch (message.code)` narrows `message.data`.
 *
 * @template C - The message code (optional)
 */
export type Message<C extends MessageCode = MessageCode> = {
	[K in C]: {
		/** Message code identifying the type of message */
		code: K;

		/** Data of the code; missing for codes that carry none */
		data?: MessagePayloads[K];
	};
}[C];
