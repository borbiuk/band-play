import { LabelButton } from '@shared/components/button';
import { BatchDownloadFormat } from '@shared/enums';
import { batchDownloadFormatLabel } from '@shared/enums/batch-download-format';
import React, { useMemo, useState } from 'react';

export type SelectionProgress = {
	current: number;
	target: number;
} | null;

type BatchDownloadOverlayProps = {
	selectedCount: number;
	/** Shown only when the download history is non-empty */
	showSelectUndownloaded: boolean;
	/** Non-null while Select All is auto-loading the full list */
	selectionProgress: SelectionProgress;
	onSelectAllClick: () => Promise<void>;
	onSelectUndownloadedClick: () => Promise<void>;
	onCancelSelectionClick: () => void;
	/** Starts the batch; format overrides the default for this batch only */
	onDownloadClick: (format?: BatchDownloadFormat) => void;
};

export const BatchDownloadOverlay = ({
	selectedCount,
	showSelectUndownloaded,
	selectionProgress,
	onSelectAllClick,
	onSelectUndownloadedClick,
	onCancelSelectionClick,
	onDownloadClick,
}: BatchDownloadOverlayProps) => {
	const [isSelectingAll, setIsSelectingAll] = useState(false);
	const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);

	const downloadLabel = useMemo(() => {
		if (selectedCount === 0) {
			return 'Download';
		}

		return `Download ${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}`;
	}, [selectedCount]);

	const runSelection = async (select: () => Promise<void>) => {
		if (isSelectingAll) {
			return;
		}

		setIsSelectingAll(true);
		try {
			await select();
		} finally {
			setIsSelectingAll(false);
		}
	};

	const selectAllLabel = useMemo(() => {
		if (selectionProgress) {
			const target = selectionProgress.target || '?';
			return `${selectionProgress.current} / ${target} · Stop`;
		}

		if (isSelectingAll) {
			return 'Loading...';
		}

		return 'Select All';
	}, [isSelectingAll, selectionProgress]);

	return (
		<div className="z-100 pointer-events-auto fixed bottom-24 right-4 flex flex-col gap-3 font-sans text-sm text-gray-900">
			<LabelButton
				className="w-36"
				disabled={isSelectingAll && !selectionProgress}
				label={selectAllLabel}
				onClick={async () => {
					if (selectionProgress) {
						onCancelSelectionClick();
						return;
					}

					await runSelection(onSelectAllClick);
				}}
			/>

			{showSelectUndownloaded ? (
				<LabelButton
					className="w-36"
					disabled={isSelectingAll}
					label={isSelectingAll ? 'Loading...' : 'Select New'}
					onClick={async () => {
						await runSelection(onSelectUndownloadedClick);
					}}
				/>
			) : null}

			<div className="relative flex w-36 flex-row gap-1">
				{isFormatMenuOpen ? (
					<div className="absolute bottom-7 right-0 flex w-36 flex-col gap-1 rounded-lg border border-band-200 bg-white p-1 shadow-lg">
						<span className="px-2 py-0.5 text-xs text-gray-500">
							Download as...
						</span>
						{(
							Object.values(
								BatchDownloadFormat
							) as BatchDownloadFormat[]
						).map((format) => (
							<LabelButton
								key={format}
								className="w-full"
								label={batchDownloadFormatLabel[format]}
								onClick={() => {
									setIsFormatMenuOpen(false);
									onDownloadClick(format);
								}}
							/>
						))}
					</div>
				) : null}

				<LabelButton
					className="w-28"
					disabled={selectedCount === 0}
					label={downloadLabel}
					onClick={async () => {
						setIsFormatMenuOpen(false);
						onDownloadClick();
					}}
				/>

				<LabelButton
					className="w-7"
					disabled={selectedCount === 0}
					ariaLabel="Choose download format for this batch"
					label={isFormatMenuOpen ? '▴' : '▾'}
					onClick={() => {
						setIsFormatMenuOpen((open) => !open);
					}}
				/>
			</div>
		</div>
	);
};
