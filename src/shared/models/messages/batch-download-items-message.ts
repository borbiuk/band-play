import { BatchDownloadPendingItemModel } from '../../../downloads/batch-download-pending-item-model';

/**
 * Message data payload for sending batch-download items.
 */
export interface BatchDownloadItemsMessage {
	items: BatchDownloadPendingItemModel[];
}
