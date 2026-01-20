import { LabelButton } from '@shared/components/button';
import React, { useMemo, useState } from 'react';

type BatchDownloadOverlayProps = {
	selectedCount: number;
	onSelectAllClick: () => Promise<void>;
	onDownloadClick: () => void;
};

export const BatchDownloadOverlay = ({
	selectedCount,
	onSelectAllClick,
	onDownloadClick,
}: BatchDownloadOverlayProps) => {
	const [isSelectingAll, setIsSelectingAll] = useState(false);

	const downloadLabel = useMemo(() => {
		if (selectedCount === 0) {
			return 'Download';
		}

		return `Download ${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}`;
	}, [selectedCount]);

	return (
		<div className="z-100 pointer-events-auto fixed bottom-24 right-4 flex flex-col gap-3 font-sans text-sm text-gray-900">
			<LabelButton
				className="w-36"
				disabled={isSelectingAll}
				label={isSelectingAll ? 'Loading...' : 'Select All'}
				onClick={async () => {
					if (isSelectingAll) {
						return;
					}

					setIsSelectingAll(true);
					try {
						await onSelectAllClick();
					} finally {
						setIsSelectingAll(false);
					}
				}}
			/>

			<LabelButton
				className="w-36"
				disabled={selectedCount === 0}
				label={downloadLabel}
				onClick={async () => {
					onDownloadClick();
				}}
			/>
		</div>
	);
};
