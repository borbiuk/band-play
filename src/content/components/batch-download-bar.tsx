import { BatchDownloadFormat } from '@shared/enums';
import { batchDownloadFormatLabel } from '@shared/enums/batch-download-format';
import { useDismissOnOutside } from '@shared/hooks/use-dismiss-on-outside';
import React, { useRef, useState } from 'react';

/** Progress of "Select all" while it loads the whole list. */
export type SelectionProgress = {
	current: number;
	target: number;
} | null;

type BatchDownloadBarProps = {
	selectedCount: number;
	/** The format used when the user does not pick one for a batch */
	defaultFormat: BatchDownloadFormat;
	/** Shown only when the download history is not empty */
	showSelectNew: boolean;
	/** Non-null while Select all is loading the full list */
	selectionProgress: SelectionProgress;
	/** The number of releases just sent to the downloads page, shown for a few seconds */
	sentCount: number | null;
	onSelectAllClick: () => Promise<void>;
	onSelectNewClick: () => Promise<void>;
	onClearSelectionClick: () => void;
	onCancelSelectionClick: () => void;
	/** Starts the batch; `format` overrides the default for this batch only */
	onDownloadClick: (format?: BatchDownloadFormat) => void;
	onOpenDownloadsClick: () => void;
};

const Svg = ({ children }: { children: React.ReactNode }) => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		{children}
	</svg>
);

const CheckIcon = () => (
	<Svg>
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</Svg>
);

const formats = Object.values(BatchDownloadFormat) as BatchDownloadFormat[];

/**
 * The Band Play bar on Bandcamp collection and purchases pages: select all or the new releases, the
 * format of the batch and the Download button. One state at a time: idle, some selected, loading the
 * whole list, and "sent to downloads".
 *
 * @param {BatchDownloadBarProps} props - The props of component.
 */
export const BatchDownloadBar = ({
	selectedCount,
	defaultFormat,
	showSelectNew,
	selectionProgress,
	sentCount,
	onSelectAllClick,
	onSelectNewClick,
	onClearSelectionClick,
	onCancelSelectionClick,
	onDownloadClick,
	onOpenDownloadsClick,
}: BatchDownloadBarProps) => {
	const [isBusy, setIsBusy] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// The format picked for the next batch; it falls back to the default after the batch starts
	const [pickedFormat, setPickedFormat] =
		useState<BatchDownloadFormat | null>(null);
	const split = useRef<HTMLDivElement>(null);

	const format = pickedFormat ?? defaultFormat;

	useDismissOnOutside(split, isMenuOpen, () => setIsMenuOpen(false));

	const runSelection = async (select: () => Promise<void>) => {
		if (isBusy) {
			return;
		}

		setIsBusy(true);
		try {
			await select();
		} finally {
			setIsBusy(false);
		}
	};

	const download = () => {
		setIsMenuOpen(false);
		onDownloadClick(pickedFormat ?? undefined);
		setPickedFormat(null);
	};

	let content: React.ReactNode;
	if (sentCount !== null) {
		content = (
			<div className="bp-toast" role="status">
				<CheckIcon />
				<span>
					{sentCount} {sentCount === 1 ? 'release' : 'releases'} sent
					to Downloads
				</span>
				<button
					type="button"
					className="bp-btn bp-btn--ghost"
					onClick={onOpenDownloadsClick}
				>
					Open
				</button>
			</div>
		);
	} else if (selectionProgress !== null) {
		const { current, target } = selectionProgress;
		content = (
			<>
				<div className="bp-bar__progress">
					<span>
						Selecting {current} of {target || '?'}
					</span>
					<div className="bp-track">
						<i
							style={{
								width: `${target ? Math.min((current / target) * 100, 100) : 0}%`,
							}}
						/>
					</div>
				</div>
				<button
					type="button"
					className="bp-btn"
					onClick={onCancelSelectionClick}
				>
					Stop
				</button>
			</>
		);
	} else {
		content = (
			<>
				<div className="bp-bar__head">
					{selectedCount > 0 ? (
						<div className="bp-bar__count" aria-live="polite">
							{selectedCount} selected
							<button
								type="button"
								className="bp-btn bp-btn--ghost bp-btn--icon"
								aria-label="Clear selection"
								title="Clear selection"
								onClick={onClearSelectionClick}
							>
								<Svg>
									<path d="M6 6l12 12M18 6 6 18" />
								</Svg>
							</button>
						</div>
					) : (
						<>
							<div className="bp-bar__brand">
								<img
									src={chrome.runtime.getURL(
										'assets/logo-128.png'
									)}
									alt=""
								/>
							</div>
							<div className="bp-bar__count">
								<small>Batch download</small>
							</div>
						</>
					)}
				</div>
				<div className="bp-bar__sep" />
				<button
					type="button"
					className="bp-btn"
					disabled={isBusy}
					onClick={() => runSelection(onSelectAllClick)}
				>
					Select all
				</button>
				{showSelectNew && (
					<button
						type="button"
						className="bp-btn"
						disabled={isBusy}
						onClick={() => runSelection(onSelectNewClick)}
					>
						Select new
					</button>
				)}
				<div
					className="bp-split"
					ref={split}
					style={{ position: 'relative' }}
				>
					<button
						type="button"
						className="bp-btn bp-btn--primary"
						disabled={selectedCount === 0}
						onClick={download}
					>
						<Svg>
							<path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
						</Svg>
						{selectedCount > 0
							? `Download ${selectedCount}`
							: 'Download'}{' '}
						<span style={{ opacity: 0.75, fontWeight: 500 }}>
							{batchDownloadFormatLabel[format]}
						</span>
					</button>
					<button
						type="button"
						className="bp-btn bp-btn--primary"
						aria-haspopup="menu"
						aria-expanded={isMenuOpen}
						aria-label="Choose download format for this batch"
						disabled={selectedCount === 0}
						onClick={() => setIsMenuOpen((open) => !open)}
					>
						<Svg>
							<path d="m6 9 6 6 6-6" />
						</Svg>
					</button>
					{isMenuOpen && (
						<div className="bp-menu" role="menu">
							<div className="bp-menu__title">Download as</div>
							{formats.map((value) => (
								<button
									key={value}
									type="button"
									role="menuitemradio"
									aria-checked={value === format}
									onClick={() => {
										setPickedFormat(value);
										setIsMenuOpen(false);
									}}
								>
									{batchDownloadFormatLabel[value]}
									{value === format && <CheckIcon />}
								</button>
							))}
						</div>
					)}
				</div>
			</>
		);
	}

	return (
		<div
			className="bp-bar"
			role="region"
			aria-label="Band Play batch download"
		>
			{content}
		</div>
	);
};
