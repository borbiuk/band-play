import React from 'react';
import { createPortal } from 'react-dom';

type BatchDownloadCheckboxesLayerProps = {
	page: 'collection' | 'purchases' | null;
	checkboxClass: string;
	/** Source ids already downloaded in the current format (history marks) */
	downloadedSourceIds: Set<string>;
	onCheckboxClick: (
		itemId: string,
		target: HTMLInputElement,
		shiftKey: boolean,
		metaKey: boolean
	) => void;
};

const DOWNLOADED_CHECKBOX_CLASS = 'band-play-batch-checkbox-downloaded';

const COLLECTION_SELECTOR =
	'[id*="collection-item-container"], .collection-item-container';

const getCollectionTargets = () => {
	const elements = document.querySelectorAll(COLLECTION_SELECTOR);
	const targets: { id: string; host: HTMLElement; label: string }[] = [];

	for (const element of elements) {
		const tralbumId = element.getAttribute('data-tralbumid');
		if (!tralbumId) {
			continue;
		}

		// Only items that have a redownload link.
		if (!element.querySelector('.redownload-item')) {
			continue;
		}

		const label =
			element
				.querySelector('.collection-item-title')
				?.textContent?.split('\n')[0]
				?.trim() || '';

		targets.push({ id: tralbumId, host: element as HTMLElement, label });
	}

	return targets;
};

const PURCHASES_ITEM_SELECTOR = '.purchases-item';
const PURCHASES_LINKS_SELECTOR = '[data-tid="links"]';

const getPurchasesTargets = () => {
	const items = document.querySelectorAll(PURCHASES_ITEM_SELECTOR);
	const targets: { id: string; mount: HTMLElement; label: string }[] = [];

	for (const item of items) {
		const id = item.getAttribute('sale_item_id');
		if (!id) {
			continue;
		}

		const links = item.querySelector(PURCHASES_LINKS_SELECTOR);
		if (!(links instanceof HTMLElement)) {
			continue;
		}

		const mount = links.querySelector(
			`[data-band-play-batch-checkbox-mount="${id}"]`
		);
		if (!(mount instanceof HTMLElement)) {
			continue;
		}

		const label =
			item.querySelector('.purchases-item-title')?.textContent?.trim() ||
			'';

		targets.push({ id, mount, label });
	}

	return targets;
};

export const BatchDownloadCheckboxesLayer = ({
	page,
	checkboxClass,
	downloadedSourceIds,
	onCheckboxClick,
}: BatchDownloadCheckboxesLayerProps) => {
	if (!page) {
		return null;
	}

	const classNameFor = (id: string): string => {
		if (downloadedSourceIds.has(id)) {
			return `${checkboxClass} ${DOWNLOADED_CHECKBOX_CLASS}`;
		}

		return checkboxClass;
	};

	const titleFor = (id: string): string | undefined => {
		if (downloadedSourceIds.has(id)) {
			return 'Already downloaded';
		}

		return undefined;
	};

	const ariaLabelFor = (id: string, label: string): string => {
		return `Select ${label || `item ${id}`} for download`;
	};

	if (page === 'collection') {
		const targets = getCollectionTargets();
		return (
			<>
				{targets.map(({ id, host, label }) =>
					createPortal(
						<input
							type="checkbox"
							className={classNameFor(id)}
							title={titleFor(id)}
							aria-label={ariaLabelFor(id, label)}
							data-band-play-batch-checkbox="true"
							data-band-play-batch-id={id}
							style={{
								position: 'absolute',
								left: '9px',
								top: '9px',
							}}
							onClick={(event) => {
								const target = event.currentTarget;
								onCheckboxClick(
									id,
									target,
									event.shiftKey,
									event.metaKey
								);
							}}
						/>,
						host,
						id
					)
				)}
			</>
		);
	}

	const targets = getPurchasesTargets();
	return (
		<>
			{targets.map(({ id, mount, label }) =>
				createPortal(
					<input
						type="checkbox"
						className={classNameFor(id)}
						title={titleFor(id)}
						aria-label={ariaLabelFor(id, label)}
						data-band-play-batch-checkbox="true"
						data-band-play-batch-id={id}
						onClick={(event) => {
							const target = event.currentTarget;
							onCheckboxClick(
								id,
								target,
								event.shiftKey,
								event.metaKey
							);
						}}
					/>,
					mount,
					id
				)
			)}
		</>
	);
};
