import {
	Badge,
	Card,
	CardTitle,
	Range,
	Select,
	SettingRow,
	Switch,
	SwitchRow,
} from '@shared/components/ui';
import { BatchDownloadFormat } from '@shared/enums';
import { batchDownloadFormatLabel } from '@shared/enums/batch-download-format';
import { MessageCode } from '@shared/enums/message-code';
import messageService from '@shared/services/message-service';
import {
	hasNotificationsPermission,
	requestNotificationsPermission,
} from '@shared/utils';
import { ChevronRight, Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useDownloadSummary } from '../../hooks/use-download-summary';

import { TabProps } from './types';

const openDownloads = () => {
	messageService.post({ code: MessageCode.BatchDownloadOpenDownloadsTab });
};

/**
 * Downloads tab: the downloads page shortcut and the batch download settings. It fits the popup without scrolling.
 *
 * @param {TabProps} props - The props of component.
 */
export const DownloadsTab = ({ config, update }: TabProps) => {
	const summary = useDownloadSummary();
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [isNotifyBlocked, setIsNotifyBlocked] = useState(false);

	useEffect(() => {
		hasNotificationsPermission()
			.then(setHasPermission)
			.catch(() => setHasPermission(false));
	}, []);

	// The setting counts only while the browser still allows notifications
	const isNotifyOn = config.batchDownloadNotify && hasPermission === true;

	const changeNotify = (value: boolean) => {
		if (!value) {
			update('batchDownloadNotify', false);
			return;
		}

		// The permission prompt must start from this click, so it is asked before anything is awaited
		requestNotificationsPermission()
			.then((granted) => {
				setHasPermission(granted);
				setIsNotifyBlocked(!granted);
				if (granted) {
					update('batchDownloadNotify', true);
				}
			})
			.catch(() => setIsNotifyBlocked(true));
	};

	const active = summary?.active ?? 0;
	const subtitle =
		summary === null || summary.total === 0
			? 'Nothing downloaded yet'
			: `${summary.done} of ${summary.total} done${active > 0 ? ` · ${active} active` : ''}`;

	return (
		<div className="flex flex-col gap-3">
			<button
				type="button"
				onClick={openDownloads}
				className="flex w-full cursor-pointer items-center gap-3 rounded-card border border-aqua-200 bg-gradient-to-b from-white to-aqua-50 px-3.5 py-2 text-left shadow-card transition-colors hover:border-aqua-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500 focus-visible:ring-offset-2"
			>
				<span className="grid h-[34px] w-[34px] place-items-center rounded-ctl bg-aqua-700 text-white">
					<Download size={16} aria-hidden="true" />
				</span>
				<span className="flex-1">
					<span className="block font-semibold">Open downloads</span>
					<span className="block text-xs text-ink-500">
						{subtitle}
					</span>
				</span>
				{active > 0 && <Badge tone="accent">{active}</Badge>}
				<ChevronRight
					size={16}
					className="text-ink-400"
					aria-hidden="true"
				/>
			</button>

			<div>
				<CardTitle>Batch download</CardTitle>
				<Card>
					<SettingRow
						asLabel
						htmlFor="batchDownloadFormat"
						label="File format"
					>
						<Select
							id="batchDownloadFormat"
							className="w-[140px]"
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
					</SettingRow>
					<SettingRow
						asLabel
						htmlFor="batchDownloadConcurrency"
						label="Parallel downloads"
						hint="Lower it if Bandcamp throttles"
					>
						<div className="grid w-[150px] grid-cols-[1fr_28px] items-center gap-2">
							<Range
								id="batchDownloadConcurrency"
								ariaLabel="Parallel downloads (1-15)"
								min={1}
								max={15}
								value={config.batchDownloadConcurrency}
								onChange={(value) =>
									update('batchDownloadConcurrency', value)
								}
							/>
							<output
								htmlFor="batchDownloadConcurrency"
								className="text-right font-bold tabular-nums"
							>
								{config.batchDownloadConcurrency}
							</output>
						</div>
					</SettingRow>
					<SettingRow
						asLabel
						danger={isNotifyBlocked}
						label="Notify when finished"
						hint={
							isNotifyBlocked
								? 'Allow notifications for this extension in the browser'
								: 'One notification per batch'
						}
					>
						<Switch
							ariaLabel="Notify when finished"
							checked={isNotifyOn}
							onChange={changeNotify}
						/>
					</SettingRow>
					<SwitchRow
						label="Open downloads page"
						hint="When a batch starts"
						checked={config.batchDownloadOpenPage}
						onChange={(value) =>
							update('batchDownloadOpenPage', value)
						}
					/>
					<SwitchRow
						label="Skip already downloaded"
						hint="Same release in the same format"
						checked={config.batchDownloadSkipDownloaded}
						onChange={(value) =>
							update('batchDownloadSkipDownloaded', value)
						}
					/>
				</Card>
			</div>
		</div>
	);
};
