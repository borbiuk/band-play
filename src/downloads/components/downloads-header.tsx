import { Range, Select } from '@shared/components/ui';
import { BatchDownloadFormat } from '@shared/enums';
import { batchDownloadFormatLabel } from '@shared/enums/batch-download-format';
import { UpdateConfig } from '@shared/hooks/use-config';
import { ConfigModel } from '@shared/models/config-model';
import React from 'react';

export interface DownloadsHeaderProps {
	// The settings the header edits (format and concurrency).
	config: ConfigModel;

	// Saves one setting.
	update: UpdateConfig;
}

/**
 * Brand and the two batch settings (format and parallel downloads).
 *
 * @param {DownloadsHeaderProps} props - The props of component.
 */
export const DownloadsHeader = ({ config, update }: DownloadsHeaderProps) => {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex items-center gap-2.5">
				<img
					src="./../assets/logo-128.png"
					alt=""
					className="-my-2 -ml-1 h-[52px] w-[52px]"
				/>
				<div>
					<div className="text-base font-bold leading-[1.1] tracking-[-0.01em]">
						Band Play
					</div>
					<div className="text-xs text-ink-500">Downloads</div>
				</div>
			</div>
			<div
				role="group"
				aria-label="Batch settings"
				className="flex flex-wrap items-center gap-2"
			>
				<label className="flex h-9 items-center gap-2 rounded-menu border border-line bg-white/70 pl-3 pr-2.5 text-xs font-semibold text-ink-500">
					Format
					<Select
						small
						className="w-[104px]"
						value={config.batchDownloadFormat}
						onChange={(event) =>
							update(
								'batchDownloadFormat',
								event.target.value as BatchDownloadFormat
							)
						}
					>
						{(
							Object.values(
								BatchDownloadFormat
							) as BatchDownloadFormat[]
						).map((value) => (
							<option key={value} value={value}>
								{batchDownloadFormatLabel[value]}
							</option>
						))}
					</Select>
				</label>
				<label className="flex h-9 items-center gap-2 rounded-menu border border-line bg-white/70 pl-3 pr-2.5 text-xs font-semibold text-ink-500">
					Parallel
					<span className="w-[110px]">
						<Range
							ariaLabel="Parallel downloads (1-15)"
							min={1}
							max={15}
							value={config.batchDownloadConcurrency}
							onChange={(value) =>
								update('batchDownloadConcurrency', value)
							}
						/>
					</span>
					<output className="min-w-4 text-right font-bold tabular-nums text-ink-900">
						{config.batchDownloadConcurrency}
					</output>
				</label>
			</div>
		</div>
	);
};
