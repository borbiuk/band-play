import {
	BatchDownloadItemModel,
	SingleItem,
} from '@shared/models/batch-download/batch-download-item-model';
import { DownloadStatus } from '@shared/models/batch-download/download-status';
import { DownloadType } from '@shared/models/batch-download/download-type';

/** The filter groups of the list. */
export type StatusGroup = 'active' | 'paused' | 'failed' | 'done';
export type FilterKey = 'all' | StatusGroup;
export type SortKey = 'queue' | 'title' | 'status';

/** A row of the list: an item, and whether it is a file of an open bundle. */
export interface RowEntry {
	item: BatchDownloadItemModel;
	depth: 0 | 1;
}

/** Search and sort state of the list. */
export interface ListQuery {
	filter: FilterKey;
	query: string;
	sort: SortKey;
	// Bundle ids that are folded; a bundle is open unless it is here.
	collapsed: ReadonlySet<string>;
}

/** Order of the "Status" sort: what needs attention first. */
const STATUS_ORDER: DownloadStatus[] = [
	DownloadStatus.Failed,
	DownloadStatus.Downloading,
	DownloadStatus.RateLimited,
	DownloadStatus.Resolving,
	DownloadStatus.Queued,
	DownloadStatus.Resolved,
	DownloadStatus.Pending,
	DownloadStatus.Paused,
	DownloadStatus.Duplicate,
	DownloadStatus.Completed,
];

/**
 * The filter group of a status.
 *
 * @param status - An item status.
 * @returns Active (waiting or running), paused, failed or done.
 */
export const statusGroup = (status: DownloadStatus): StatusGroup => {
	switch (status) {
		case DownloadStatus.Paused:
		case DownloadStatus.Duplicate:
			return 'paused';
		case DownloadStatus.Failed:
			return 'failed';
		case DownloadStatus.Completed:
			return 'done';
		default:
			return 'active';
	}
};

/**
 * The title to show: a file shows the release title without the artist prefix when it is known.
 *
 * @param item - An item.
 * @returns The title.
 */
export const displayTitle = (item: BatchDownloadItemModel): string =>
	item.type === DownloadType.Single && item.download.itemTitle
		? item.download.itemTitle
		: item.title;

/**
 * The artist of a file, if Bandcamp reported it.
 *
 * @param item - An item.
 * @returns The artist, or undefined.
 */
export const displayArtist = (
	item: BatchDownloadItemModel
): string | undefined =>
	item.type === DownloadType.Single ? item.download.artist : undefined;

/** The default order: newest batch first, then the collection order, then the stored order. */
const defaultComparer = (items: BatchDownloadItemModel[]) => {
	const positionById = new Map(items.map((item, index) => [item.id, index]));
	const sequence = (item: BatchDownloadItemModel): number =>
		item.collectionIndex ?? (positionById.get(item.id) ?? 0) + 1;

	return (a: BatchDownloadItemModel, b: BatchDownloadItemModel): number =>
		(b.createdAt ?? 0) - (a.createdAt ?? 0) ||
		sequence(a) - sequence(b) ||
		(positionById.get(a.id) ?? 0) - (positionById.get(b.id) ?? 0);
};

/**
 * Numbers a release that was queued more than once ("Title (2)"), in the default order.
 *
 * @param items - All items.
 * @returns The number per item id; only items of a repeated release are in it.
 */
export const duplicateIndexById = (
	items: BatchDownloadItemModel[]
): Map<string, number> => {
	const counts = new Map<string, number>();
	for (const item of items) {
		if (item.sourceId) {
			counts.set(item.sourceId, (counts.get(item.sourceId) ?? 0) + 1);
		}
	}

	const result = new Map<string, number>();
	const seen = new Map<string, number>();
	for (const item of [...items].sort(defaultComparer(items))) {
		if (!item.sourceId || (counts.get(item.sourceId) ?? 0) <= 1) {
			continue;
		}

		const next = (seen.get(item.sourceId) ?? 0) + 1;
		seen.set(item.sourceId, next);
		result.set(item.id, next);
	}

	return result;
};

/** Files of a bundle by the bundle id, and the rows that are not files of a known bundle. */
const splitBundles = (items: BatchDownloadItemModel[]) => {
	const bundleIds = new Set(
		items.filter((x) => x.type === DownloadType.Multiple).map((x) => x.id)
	);
	const filesOf = new Map<string, SingleItem[]>();
	const topLevel: BatchDownloadItemModel[] = [];

	for (const item of items) {
		if (
			item.type === DownloadType.Single &&
			item.parentId !== undefined &&
			bundleIds.has(item.parentId)
		) {
			const files = filesOf.get(item.parentId);
			if (files) {
				files.push(item);
			} else {
				filesOf.set(item.parentId, [item]);
			}

			continue;
		}

		topLevel.push(item);
	}

	return { filesOf, topLevel };
};

/**
 * The files of every bundle, each list in the default order. Computed once per list, not once per row.
 *
 * @param items - All items.
 * @returns The files by the bundle (`Multiple`) id; a bundle without files is not in it.
 */
export const bundleFiles = (
	items: BatchDownloadItemModel[]
): Map<string, SingleItem[]> => {
	const { filesOf } = splitBundles(items);
	const comparer = defaultComparer(items);
	for (const files of filesOf.values()) {
		files.sort(comparer);
	}

	return filesOf;
};

/**
 * The files of a bundle, in the default order.
 *
 * @param items - All items.
 * @param bundleId - The bundle (`Multiple`) id.
 * @returns The files.
 */
export const filesOfBundle = (
	items: BatchDownloadItemModel[],
	bundleId: string
): SingleItem[] => bundleFiles(items).get(bundleId) ?? [];

const matchesQuery = (item: BatchDownloadItemModel, query: string): boolean => {
	if (query === '') {
		return true;
	}

	return `${displayTitle(item)} ${displayArtist(item) ?? ''} ${item.title}`
		.toLowerCase()
		.includes(query);
};

/**
 * Counts per filter over the top-level rows: a bundle counts once.
 *
 * @param items - All items.
 * @returns The count for every filter key.
 */
export const countByFilter = (
	items: BatchDownloadItemModel[]
): Record<FilterKey, number> => {
	const counts: Record<FilterKey, number> = {
		all: 0,
		active: 0,
		paused: 0,
		failed: 0,
		done: 0,
	};
	for (const item of splitBundles(items).topLevel) {
		counts.all++;
		counts[statusGroup(item.status)]++;
	}

	return counts;
};

/**
 * Builds the rows to show: filtered, searched and sorted top-level items, each bundle followed by its files
 * unless it is folded.
 *
 * @param items - All items.
 * @param options - The filter, the search text, the sort and the folded bundles.
 * @returns The rows, in display order.
 */
export const buildRows = (
	items: BatchDownloadItemModel[],
	options: ListQuery
): RowEntry[] => {
	const { filesOf, topLevel } = splitBundles(items);
	const compareDefault = defaultComparer(items);
	const query = options.query.trim().toLowerCase();

	const matches = (item: BatchDownloadItemModel): boolean => {
		const files = filesOf.get(item.id) ?? [];
		const inGroup =
			options.filter === 'all' ||
			statusGroup(item.status) === options.filter ||
			files.some((x) => statusGroup(x.status) === options.filter);
		return (
			inGroup &&
			(matchesQuery(item, query) ||
				files.some((x) => matchesQuery(x, query)))
		);
	};

	const sorted = topLevel.filter(matches).sort((a, b) => {
		if (options.sort === 'title') {
			const byTitle = displayTitle(a).localeCompare(
				displayTitle(b),
				undefined,
				{ sensitivity: 'base' }
			);
			return byTitle || compareDefault(a, b);
		}

		if (options.sort === 'status') {
			const byStatus =
				STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
			return byStatus || compareDefault(a, b);
		}

		return compareDefault(a, b);
	});

	const rows: RowEntry[] = [];
	for (const item of sorted) {
		rows.push({ item, depth: 0 });
		if (
			item.type === DownloadType.Multiple &&
			!options.collapsed.has(item.id)
		) {
			for (const file of (filesOf.get(item.id) ?? []).sort(
				compareDefault
			)) {
				rows.push({ item: file, depth: 1 });
			}
		}
	}

	return rows;
};
