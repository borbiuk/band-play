import { BatchDownloadFileModel } from '../../src/shared/models/batch-download/batch-download-file-model';
import {
	MultipleItem,
	PendingItem,
	SingleItem,
} from '../../src/shared/models/batch-download/batch-download-item-model';
import { DownloadStatus } from '../../src/shared/models/batch-download/download-status';
import { DownloadType } from '../../src/shared/models/batch-download/download-type';

type Single = SingleItem;
type Pending = PendingItem;
type Multiple = MultipleItem;

/** A downloading file; `overrides` change any field, and `download` changes fields of the file. */
export const single = (
	id: string,
	status: Single['status'] = DownloadStatus.Downloading,
	overrides: Partial<Omit<Single, 'download'>> & {
		progress?: number;
		sizeMb?: number;
		artist?: string;
		itemTitle?: string;
		format?: string;
		download?: Partial<BatchDownloadFileModel>;
	} = {}
): Single => {
	const { progress, sizeMb, artist, itemTitle, format, download, ...rest } =
		overrides;
	return {
		id,
		title: `Artist - ${id}`,
		type: DownloadType.Single,
		status,
		download: {
			id: `file-${id}`,
			title: `Artist - ${id}`,
			url: `https://popplers5.bandcamp.com/download/${id}`,
			progress: progress ?? 0,
			sizeMb,
			artist,
			itemTitle,
			format,
			...download,
		},
		...rest,
	};
};

/** A release that is not resolved yet. */
export const pending = (
	id: string,
	status: Pending['status'] = DownloadStatus.Pending,
	overrides: Partial<Pending> = {}
): Pending => ({
	id,
	title: `Pending ${id}`,
	type: DownloadType.Pending,
	url: `https://bandcamp.com/download?id=${id}`,
	status,
	...overrides,
});

/** A bundle of files. */
export const bundle = (
	id: string,
	status: Multiple['status'] = DownloadStatus.Resolved,
	children: string[] = [],
	overrides: Partial<Multiple> = {}
): Multiple => ({
	id,
	title: `Bundle ${id}`,
	type: DownloadType.Multiple,
	status,
	progress: 0,
	children,
	...overrides,
});
