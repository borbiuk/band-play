import React from 'react';
import { createPortal } from 'react-dom';

import {
	COLLECTION_TITLE_SELECTOR,
	DOWNLOADED_BADGE_CLASS,
	ensurePositioned,
	getDownloadableCollectionItems,
	PURCHASES_CHECKBOX_MOUNT_ATTR,
	PURCHASES_ITEM_SELECTOR,
	PURCHASES_LINKS_SELECTOR,
	PURCHASES_TITLE_SELECTOR,
} from '../utils/batch-download-dom';

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

/** "Downloaded": a badge next to the checkbox of a release that is already in the history. */
const DownloadedBadge = () => (
	<span
		className={DOWNLOADED_BADGE_CLASS}
		// Marks the badge as ours, so adding it does not start another pass of the observer
		data-band-play-batch-checkbox="badge"
		title="Already downloaded in this format"
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="m5 12.5 4.5 4.5L19 7.5" />
		</svg>
		Downloaded
	</span>
);

/**
 * The element that wraps the cover of a collection item, where the badge sits on the cover corner.
 * It is made positioned when it is not, so the badge can use the cover as its box.
 */
const getCoverElement = (host: HTMLElement): HTMLElement => {
	const cover =
		host.querySelector<HTMLElement>('.collection-item-art-container') ??
		host.querySelector('img.collection-item-art')?.parentElement ??
		host;
	ensurePositioned(cover);

	return cover;
};

const getCollectionTargets = () =>
	getDownloadableCollectionItems().map((element) => ({
		id: element.getAttribute('data-tralbumid'),
		host: element,
		label:
			element
				.querySelector(COLLECTION_TITLE_SELECTOR)
				?.textContent?.split('\n')[0]
				?.trim() || '',
	}));

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
			`[${PURCHASES_CHECKBOX_MOUNT_ATTR}="${id}"]`
		);
		if (!(mount instanceof HTMLElement)) {
			continue;
		}

		const label =
			item.querySelector(PURCHASES_TITLE_SELECTOR)?.textContent?.trim() ||
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

	const ariaLabelFor = (id: string, label: string): string => {
		return `Select ${label || `item ${id}`} for download`;
	};

	const renderCheckbox = (id: string, label: string) => (
		<input
			type="checkbox"
			className={checkboxClass}
			aria-label={ariaLabelFor(id, label)}
			data-band-play-batch-checkbox="true"
			data-band-play-batch-id={id}
			onClick={(event) => {
				const target = event.currentTarget;
				onCheckboxClick(id, target, event.shiftKey, event.metaKey);
			}}
		/>
	);

	if (page === 'collection') {
		const targets = getCollectionTargets();
		return (
			<>
				{targets.map(({ id, host, label }) => (
					<React.Fragment key={id}>
						{createPortal(renderCheckbox(id, label), host, id)}
						{downloadedSourceIds.has(id) &&
							createPortal(
								<DownloadedBadge />,
								getCoverElement(host),
								`${id}-downloaded`
							)}
					</React.Fragment>
				))}
			</>
		);
	}

	const targets = getPurchasesTargets();
	return (
		<>
			{targets.map(({ id, mount, label }) =>
				createPortal(
					<>
						{downloadedSourceIds.has(id) && <DownloadedBadge />}
						{renderCheckbox(id, label)}
					</>,
					mount,
					id
				)
			)}
		</>
	);
};
