import React from 'react';
import { createPortal } from 'react-dom';

type BatchDownloadCheckboxesLayerProps = {
	page: 'collection' | 'purchases' | null;
	checkboxClass: string;
	onCheckboxClick: (
		itemId: string,
		target: HTMLInputElement,
		shiftKey: boolean,
		metaKey: boolean
	) => void;
};

const COLLECTION_SELECTOR =
	'[id*="collection-item-container"], .collection-item-container';

const getCollectionTargets = () => {
	const elements = document.querySelectorAll(COLLECTION_SELECTOR);
	const targets: { id: string; host: HTMLElement }[] = [];

	for (const element of elements) {
		const tralbumId = element.getAttribute('data-tralbumid');
		if (!tralbumId) {
			continue;
		}

		// Only items that have a redownload link.
		if (!element.querySelector('.redownload-item')) {
			continue;
		}

		targets.push({ id: tralbumId, host: element as HTMLElement });
	}

	return targets;
};

const PURCHASES_ITEM_SELECTOR = '.purchases-item';
const PURCHASES_LINKS_SELECTOR = '[data-tid="links"]';

const getPurchasesTargets = () => {
	const items = document.querySelectorAll(PURCHASES_ITEM_SELECTOR);
	const targets: { id: string; mount: HTMLElement }[] = [];

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

		targets.push({ id, mount });
	}

	return targets;
};

export const BatchDownloadCheckboxesLayer = ({
	page,
	checkboxClass,
	onCheckboxClick,
}: BatchDownloadCheckboxesLayerProps) => {
	if (!page) {
		return null;
	}

	if (page === 'collection') {
		const targets = getCollectionTargets();
		return (
			<>
				{targets.map(({ id, host }) =>
					createPortal(
						<input
							type="checkbox"
							className={checkboxClass}
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
			{targets.map(({ id, mount }) =>
				createPortal(
					<input
						type="checkbox"
						className={checkboxClass}
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
