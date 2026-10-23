import { BatchDownloadFormat } from '@shared/enums';
import { batchDownloadFormatLabel } from '@shared/enums/batch-download-format';
import { ConfigModel } from '@shared/models/config-model';
import configService from '@shared/services/config-service';
import { notExist } from '@shared/utils/guard.utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';

/** Autosave delay of the filename template field. */
const TEMPLATE_SAVE_DELAY_MS = 300;

/** Renaming needs downloads.onDeterminingFilename, which Firefox does not have. */
const isFilenameTemplateSupported =
	typeof chrome.downloads?.onDeterminingFilename !== 'undefined';

/**
 * Batch download settings UI for integrating Batchcamp-like configuration
 * into the Band Play options panel.
 */
type BatchDownloadControlsProps = {
	controlsClassName: string;
};

export const BatchDownloadControls = ({
	controlsClassName,
}: BatchDownloadControlsProps) => {
	const [config, setConfig] = useState(null as ConfigModel);
	const [templateDraft, setTemplateDraft] = useState(null as string);
	// Text typed but not saved yet, and its save timer
	const pendingTemplate = useRef<string | null>(null);
	const templateSaveTimer = useRef<number | null>(null);

	useEffect(() => {
		configService
			.getAll()
			.then((x) => {
				setConfig(x);
			})
			.catch((e) => console.error(e));

		configService.addListener((x) => {
			setConfig(x);
		});
	}, []);

	const updateStorage = async (key: keyof ConfigModel, value: unknown) => {
		await configService.update(key, value);
	};

	const saveTemplateNow = useCallback((): void => {
		if (templateSaveTimer.current !== null) {
			window.clearTimeout(templateSaveTimer.current);
			templateSaveTimer.current = null;
		}

		if (pendingTemplate.current === null) {
			return;
		}

		const value = pendingTemplate.current.trim();
		pendingTemplate.current = null;
		configService
			.update('batchDownloadFilenameTemplate', value)
			.catch(() => void 0);
	}, []);

	// The popup closes when it loses focus: save the typed text right away
	useEffect(() => {
		window.addEventListener('pagehide', saveTemplateNow);
		return () => {
			window.removeEventListener('pagehide', saveTemplateNow);
			saveTemplateNow();
		};
	}, [saveTemplateNow]);

	if (notExist(config)) {
		return <div>...</div>;
	}

	return (
		<div className="flex flex-col gap-y-2">
			<div className={controlsClassName}>
				{/* Format */}
				<div className="w-full">
					<Tooltip
						id="batchDownloadFormat"
						className="!z-[9999] max-w-40"
						variant="light"
						place="top"
						opacity={1}
						offset={1}
						delayShow={200}
					>
						<span className="text-xs text-gray-900">
							Default format used for batch downloads on Bandcamp
						</span>
					</Tooltip>

					<select
						id="batchDownloadFormat"
						data-tooltip-id="batchDownloadFormat"
						className="block h-6 w-full cursor-pointer truncate rounded-md border border-band-200 bg-band-100 pl-2 text-left text-sm font-normal tabular-nums text-gray-900 outline-none"
						value={config.batchDownloadFormat}
						onChange={(e) =>
							updateStorage(
								'batchDownloadFormat',
								e.target.value as BatchDownloadFormat
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
					</select>
				</div>

				{/* Concurrency */}
				<div className="w-full">
					<Tooltip
						id="batchDownloadConcurrency"
						className="!z-[9999] max-w-40"
						variant="light"
						place="top"
						opacity={1}
						offset={1}
						delayShow={200}
					>
						<span className="text-xs text-gray-900">
							How many files can download simultaneously (1-15)
						</span>
					</Tooltip>

					<div className="flex items-center">
						<input
							id="batchDownloadConcurrency"
							data-tooltip-id="batchDownloadConcurrency"
							type="range"
							min={1}
							max={15}
							value={config.batchDownloadConcurrency}
							className="h-6 w-full cursor-pointer accent-band-500"
							onChange={(e) =>
								updateStorage(
									'batchDownloadConcurrency',
									Number(e.target.value)
								)
							}
						/>
						<span className="ml-2 w-6 text-center text-sm font-normal tabular-nums text-gray-900">
							{config.batchDownloadConcurrency}
						</span>
					</div>
				</div>
			</div>

			{/* Filename template (Chrome only) */}
			{isFilenameTemplateSupported && (
				<div className="w-full">
					<Tooltip
						id="batchDownloadFilenameTemplate"
						className="!z-[9999] max-w-52"
						variant="light"
						place="top"
						opacity={1}
						offset={1}
						delayShow={200}
					>
						<span className="text-xs text-gray-900">
							Filename template: {'{artist}'}, {'{title}'} and{' '}
							{'{format}'} tokens; {'"/"'} creates folders (e.g.{' '}
							{'{artist}/{artist} - {title}'}). Leave empty to
							keep original filenames. The template must contain{' '}
							{'{title}'}, otherwise it is not used.
						</span>
					</Tooltip>

					<input
						id="batchDownloadFilenameTemplate"
						data-tooltip-id="batchDownloadFilenameTemplate"
						type="text"
						spellCheck={false}
						placeholder="Filename template"
						className="block h-6 w-full rounded-md border border-band-200 bg-band-100 px-2 text-left text-sm font-normal text-gray-900 outline-none placeholder:text-gray-400"
						value={
							templateDraft ??
							config.batchDownloadFilenameTemplate ??
							''
						}
						onChange={(e) => {
							setTemplateDraft(e.target.value);
							pendingTemplate.current = e.target.value;
							if (templateSaveTimer.current !== null) {
								window.clearTimeout(templateSaveTimer.current);
							}

							templateSaveTimer.current = window.setTimeout(
								saveTemplateNow,
								TEMPLATE_SAVE_DELAY_MS
							);
						}}
						onBlur={() => {
							saveTemplateNow();
							setTemplateDraft(null);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.currentTarget.blur();
							}
						}}
					/>
				</div>
			)}
		</div>
	);
};

export const BatchDownloadInline = () => {
	return (
		<BatchDownloadControls controlsClassName="flex flex-col gap-y-3 sm:flex-row sm:items-start sm:gap-x-6" />
	);
};
