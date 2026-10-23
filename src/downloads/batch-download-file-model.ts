export interface BatchDownloadFileModel {
	id: string;
	title: string;
	url: string;
	progress: number;
	browserDownloadId?: number;
	/** Artist name as reported by Bandcamp (used by the filename template) */
	artist?: string;
	/** Release title without the artist prefix (used by the filename template) */
	itemTitle?: string;
	/** Download format the URL was resolved for (e.g. 'flac') */
	format?: string;
	/** Approximate file size in megabytes, as reported by Bandcamp */
	sizeMb?: number;
}
