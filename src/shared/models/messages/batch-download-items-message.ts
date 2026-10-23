import { BatchDownloadFormat } from '@shared/enums';

import { BatchDownloadPendingItemModel } from '../../../downloads/batch-download-pending-item-model';

/**
 * Message data payload for sending batch-download items.
 */
export interface BatchDownloadItemsMessage {
	items: BatchDownloadPendingItemModel[];
	/** One-off format override for this batch (does not change the default) */
	format?: BatchDownloadFormat;
}
