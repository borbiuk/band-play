export interface BatchDownloadFileModel {
	id: string;
	title: string;
	url: string;
	progress: number;
	browserDownloadId?: number;
}
