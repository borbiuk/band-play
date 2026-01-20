/**
 * Supported Bandcamp download formats for batch downloads.
 * Keys are used as stored values; labels are shown in UI.
 */
export enum BatchDownloadFormat {
	Mp3V0 = 'mp3-v0',
	Mp3320 = 'mp3-320',
	Flac = 'flac',
	AacHi = 'aac-hi',
	Vorbis = 'vorbis',
	Alac = 'alac',
	Wav = 'wav',
	AiffLossless = 'aiff-lossless',
}

export const batchDownloadFormatLabel: Record<BatchDownloadFormat, string> = {
	[BatchDownloadFormat.Mp3V0]: 'MP3 v0',
	[BatchDownloadFormat.Mp3320]: 'MP3 320',
	[BatchDownloadFormat.Flac]: 'FLAC',
	[BatchDownloadFormat.AacHi]: 'AAC',
	[BatchDownloadFormat.Vorbis]: 'Ogg Vorbis',
	[BatchDownloadFormat.Alac]: 'ALAC',
	[BatchDownloadFormat.Wav]: 'WAV',
	[BatchDownloadFormat.AiffLossless]: 'AIFF',
};
