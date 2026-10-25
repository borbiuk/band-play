import { BatchDownloadItemModel } from '../models/batch-download/batch-download-item-model';

/**
 * Turns the raw stored value of `batchDownloadItems` into the list.
 *
 * @param raw - The stored value, of any shape.
 * @returns The stored list, or an empty list when the value is not a list.
 */
export const toBatchDownloadItems = (raw: unknown): BatchDownloadItemModel[] =>
	Array.isArray(raw) ? (raw as BatchDownloadItemModel[]) : [];
