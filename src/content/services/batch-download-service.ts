import { MessageCode } from '@shared/enums';
import { BatchDownloadPendingItemModel } from '../../downloads/batch-download-pending-item-model';
import {
	BatchDownloadItemsMessage,
	MessageModel,
} from '@shared/models/messages';
import messageService from '@shared/services/message-service';
import { exist, notExist } from '@shared/utils';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import { BatchDownloadCheckboxesLayer } from '../components/batch-download-checkboxes-layer';
import { BatchDownloadOverlay } from '../components/batch-download-overlay';

const BATCH_OVERLAY_ROOT_ID = 'band-play-batch-overlay-root';

const CHECKBOX_CLASS = 'band-play-batch-checkbox';
const CHECKBOX_ATTR = 'data-band-play-batch-id';
const PURCHASES_CHECKBOX_MOUNT_ATTR = 'data-band-play-batch-checkbox-mount';

const wait = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const isBandcamp = () => {
	return window.location.hostname.includes('bandcamp.com');
};

type SelectionState = {
	selected: Record<string, BatchDownloadPendingItemModel | null>;
	lastClickedIndex: number;
};

const createInitialState = (): SelectionState => ({
	selected: {},
	lastClickedIndex: 0,
});

const getActiveCheckboxContainer = (): Element | null => {
	return (
		document.querySelector('.grid.active') ||
		document.querySelector('.purchases') ||
		document.body
	);
};

const getAllCheckboxes = (): HTMLInputElement[] => {
	const container = getActiveCheckboxContainer();
	if (notExist(container)) {
		return [];
	}

	return Array.from(container.getElementsByClassName(CHECKBOX_CLASS)).filter(
		(x) => x instanceof HTMLInputElement
	) as HTMLInputElement[];
};

const loadTargetCount = async (
	target: number,
	container: HTMLElement,
	itemClass: string
) => {
	let current = document.getElementsByClassName(itemClass).length;
	let failed = 0;

	while (current < target && failed < 5) {
		container.scrollIntoView(false);
		await wait(2500);

		const amount = document.getElementsByClassName(itemClass).length;
		if (amount === current) {
			failed++;
		} else {
			failed = 0;
			current = amount;
		}
	}
};

const parseCollectionItem = (
	container: Element
): BatchDownloadPendingItemModel | null => {
	const redownloadAnchor = container.querySelector('.redownload-item a');
	if (!(redownloadAnchor instanceof HTMLAnchorElement)) {
		return null;
	}

	const id = container.getAttribute('data-tralbumid');
	if (!id) {
		return null;
	}

	const titleRaw = container
		.querySelector('.collection-item-title')
		?.textContent?.split('\n')[0];
	const artistRaw = container
		.querySelector('.collection-item-artist')
		?.textContent?.replace('by ', '');

	const title =
		`${String(artistRaw || '').trim()} - ${String(titleRaw || '').trim()}`.replace(
			/^\s*-\s*|\s*-\s*$/g,
			''
		);

	return {
		id,
		title: title || id,
		url: redownloadAnchor.href,
	};
};

const parsePurchaseItem = (
	container: Element
): BatchDownloadPendingItemModel | null => {
	const id = container.getAttribute('sale_item_id');
	if (!id) {
		return null;
	}

	const downloadAnchor = container.querySelector('[data-tid="download"]');
	if (!(downloadAnchor instanceof HTMLAnchorElement)) {
		return null;
	}

	const split = container
		.querySelector('.purchases-item-title')
		?.textContent?.split(' by ');

	let title = split ? `${split[1]} - ${split[0]}` : id;
	if (split && !split[1]) {
		title = split[0];
	}

	return {
		id,
		title: String(title || id).trim(),
		url: downloadAnchor.href,
	};
};

const createCheckbox = (
	itemId: string,
	stateRef: { current: SelectionState },
	getItemByCheckbox: (
		checkbox: HTMLInputElement
	) => BatchDownloadPendingItemModel | null,
	onSelectionChanged: () => void
) => {
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.className = CHECKBOX_CLASS;
	checkbox.setAttribute(CHECKBOX_ATTR, itemId);

	checkbox.addEventListener('click', (event: MouseEvent) => {
		const target = event.target;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		const all = getAllCheckboxes();
		const index = all.indexOf(target);

		if ((event.shiftKey || event.metaKey) && all.length > 0) {
			const start = Math.min(index, stateRef.current.lastClickedIndex);
			const end = Math.max(index, stateRef.current.lastClickedIndex);

			for (let i = start; i <= end; i++) {
				const cb = all[i];
				cb.checked = target.checked;

				const id = cb.getAttribute(CHECKBOX_ATTR);
				if (!id) {
					continue;
				}

				const item = getItemByCheckbox(cb);
				stateRef.current.selected[id] =
					cb.checked && exist(item) ? item : null;
			}
		} else {
			const item = getItemByCheckbox(target);
			stateRef.current.selected[itemId] =
				target.checked && exist(item) ? item : null;
			stateRef.current.lastClickedIndex = index;
		}

		onSelectionChanged();
	});

	return checkbox;
};

export class BatchDownloadService {
	private stateRef: { current: SelectionState } = {
		current: createInitialState(),
	};
	private collectionObserver: MutationObserver = null;
	private purchasesObserver: MutationObserver = null;
	private overlayRoot: Root = null;
	private overlayContainer: HTMLElement = null;
	private overlayPage: 'collection' | 'purchases' = null;

	public start(): void {
		if (!isBandcamp()) {
			return;
		}

		this.setupForCurrentPage();

		// Re-init on URL changes (Band Play background sends UrlChanged).
		messageService.addListener(async (message: MessageModel<unknown>) => {
			if (message.code !== MessageCode.UrlChanged) {
				return;
			}

			this.cleanup();
			this.stateRef.current = createInitialState();
			this.setupForCurrentPage();
		});
	}

	private setupForCurrentPage(): void {
		// Purchases page
		if (document.getElementById('oh-container')) {
			this.setupPurchasesPage();
			return;
		}

		// Collection / wishlist page
		if (
			document.getElementById('collection-grid') ||
			document.getElementById('wishlist-grid')
		) {
			this.setupCollectionPage();
			return;
		}
	}

	private setupCollectionPage(): void {
		const container =
			document.getElementById('collection-grid') ||
			document.getElementById('wishlist-grid');

		const searchContainer = document.getElementById(
			'collection-search-grid'
		);

		if (notExist(container)) {
			return;
		}

		if (exist(this.collectionObserver)) {
			this.collectionObserver.disconnect();
		}

		this.collectionObserver = new MutationObserver(() => {
			this.attachCollectionCheckboxes();
		});

		this.collectionObserver.observe(container, {
			childList: true,
			subtree: true,
		});

		if (exist(searchContainer)) {
			this.collectionObserver.observe(searchContainer, {
				childList: true,
				subtree: true,
			});
		}

		this.attachCollectionCheckboxes();
		this.ensureOverlay('collection');
		this.onSelectionChanged();
	}

	private attachCollectionCheckboxes(): void {
		const containers = document.querySelectorAll(
			'[id*="collection-item-container"], .collection-item-container'
		);

		for (const element of containers) {
			const tralbumId = element.getAttribute('data-tralbumid');
			if (!tralbumId) {
				continue;
			}

			// Only items that have a redownload link.
			if (notExist(element.querySelector('.redownload-item'))) {
				continue;
			}

			const host = element as HTMLElement;
			if (getComputedStyle(host).position === 'static') {
				host.style.position = 'relative';
			}
		}

		this.renderOverlay();
	}

	private setupPurchasesPage(): void {
		const container = document.getElementById('oh-container');
		if (notExist(container)) {
			return;
		}

		if (exist(this.purchasesObserver)) {
			this.purchasesObserver.disconnect();
		}

		this.purchasesObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					const element = node as Element;
					if (
						element?.nodeType === 1 &&
						element.classList.contains('purchases-item')
					) {
						this.attachPurchasesCheckbox(element);
					}
				}
			}
		});

		this.purchasesObserver.observe(container, {
			childList: true,
			subtree: true,
		});

		const items = document.getElementsByClassName('purchases-item');
		for (const item of items) {
			this.attachPurchasesCheckbox(item);
		}

		this.ensureOverlay('purchases');
		this.onSelectionChanged();
	}

	private attachPurchasesCheckbox(item: Element): void {
		const toAppend = item.querySelector('[data-tid="links"]');
		if (notExist(toAppend)) {
			return;
		}

		if (toAppend.classList.contains('deleted-badge')) {
			return;
		}

		const id = item.getAttribute('sale_item_id');
		if (!id) {
			return;
		}

		if (
			exist(
				item.querySelector(`[${PURCHASES_CHECKBOX_MOUNT_ATTR}="${id}"]`)
			)
		) {
			return;
		}

		const wrapper = document.createElement('div');
		wrapper.style.display = 'inline-block';
		wrapper.style.paddingRight = '8px';
		wrapper.setAttribute(PURCHASES_CHECKBOX_MOUNT_ATTR, id);

		toAppend.prepend(wrapper);
		this.renderOverlay();
	}

	private ensureOverlay(page: 'collection' | 'purchases'): void {
		this.overlayPage = page;

		if (exist(this.overlayRoot)) {
			this.renderOverlay();
			return;
		}

		let container = document.getElementById(
			BATCH_OVERLAY_ROOT_ID
		) as HTMLElement;
		if (notExist(container)) {
			container = document.createElement('div');
			container.id = BATCH_OVERLAY_ROOT_ID;
			document.body.appendChild(container);
		}

		this.overlayContainer = container;
		this.overlayRoot = createRoot(container);
		this.renderOverlay();
	}

	private renderOverlay(): void {
		if (notExist(this.overlayRoot)) {
			return;
		}

		const selectedCount = Object.values(
			this.stateRef.current.selected
		).filter((x) => exist(x)).length;

		this.overlayRoot.render(
			React.createElement(
				React.StrictMode,
				null,
				React.createElement(
					React.Fragment,
					null,
					React.createElement(BatchDownloadCheckboxesLayer, {
						page: this.overlayPage,
						checkboxClass: CHECKBOX_CLASS,
						onCheckboxClick: (
							itemId,
							target,
							shiftKey,
							metaKey
						) => {
							this.handleCheckboxClick(
								itemId,
								target,
								shiftKey,
								metaKey
							);
						},
					}),
					React.createElement(BatchDownloadOverlay, {
						selectedCount,
						onSelectAllClick: async () => {
							await this.handleSelectAll();
						},
						onDownloadClick: () => {
							this.handleDownload();
						},
					})
				)
			)
		);
	}

	private getItemByCheckbox(
		checkbox: HTMLInputElement
	): BatchDownloadPendingItemModel | null {
		const page = this.overlayPage;
		if (!page) {
			return null;
		}

		if (page === 'collection') {
			const container = checkbox.closest('[data-tralbumid]');
			if (notExist(container)) {
				return null;
			}

			return parseCollectionItem(container);
		}

		const container = checkbox.closest('.purchases-item');
		if (notExist(container)) {
			return null;
		}

		return parsePurchaseItem(container);
	}

	private handleCheckboxClick(
		itemId: string,
		target: HTMLInputElement,
		shiftKey: boolean,
		metaKey: boolean
	): void {
		const all = getAllCheckboxes();
		const index = all.indexOf(target);

		if ((shiftKey || metaKey) && all.length > 0) {
			const start = Math.min(
				index,
				this.stateRef.current.lastClickedIndex
			);
			const end = Math.max(index, this.stateRef.current.lastClickedIndex);

			for (let i = start; i <= end; i++) {
				const cb = all[i];
				cb.checked = target.checked;

				const id = cb.getAttribute(CHECKBOX_ATTR);
				if (!id) {
					continue;
				}

				const item = this.getItemByCheckbox(cb);
				this.stateRef.current.selected[id] =
					cb.checked && exist(item) ? item : null;
			}
		} else {
			const item = this.getItemByCheckbox(target);
			this.stateRef.current.selected[itemId] =
				target.checked && exist(item) ? item : null;
			this.stateRef.current.lastClickedIndex = index;
		}

		this.onSelectionChanged();
	}

	private handleDownload(): void {
		const selected = Object.values(this.stateRef.current.selected).filter(
			(x) => exist(x)
		) as BatchDownloadPendingItemModel[];

		if (selected.length === 0) {
			return;
		}

		messageService
			.sendToBackground<BatchDownloadItemsMessage>({
				code: MessageCode.BatchDownloadSendItemsToBackground,
				data: { items: selected },
			})
			.catch(() => void 0);

		this.stateRef.current.selected = {};

		for (const checkbox of getAllCheckboxes()) {
			checkbox.checked = false;
		}

		this.onSelectionChanged();
	}

	private async handleSelectAll(): Promise<void> {
		const page = this.overlayPage;
		if (!page) {
			return;
		}

		if (page === 'collection') {
			const target = parseInt(
				document.querySelector('#grid-tabs>.active .count')
					?.textContent || '0'
			);

			const showMore = document.querySelector(
				'.expand-container.show-button > button'
			) as HTMLElement;

			const container = (document.getElementById('collection-grid') ||
				document.getElementById('wishlist-grid')) as HTMLElement;

			if (showMore) {
				showMore.click();
			}

			if (target && container) {
				await loadTargetCount(
					target,
					container,
					'collection-item-container'
				);
			}
		}

		if (page === 'purchases') {
			const target = parseInt(
				(
					document.querySelector('.page-items-number')?.parentElement
						?.textContent || ''
				).match(/of (\d+)/)?.[1] || '0'
			);

			const showMore = document.querySelector(
				'.view-all-button'
			) as HTMLElement;
			const container = document.getElementsByClassName(
				'purchases'
			)[0] as HTMLElement;

			if (showMore) {
				showMore.click();
			}

			if (target && container) {
				await loadTargetCount(target, container, 'purchases-item');
			}
		}

		for (const checkbox of getAllCheckboxes()) {
			if (!checkbox.checked) {
				checkbox.click();
			}
		}
	}

	private onSelectionChanged(): void {
		this.renderOverlay();
	}

	private cleanupInjectedUi(): void {
		if (exist(this.overlayRoot)) {
			this.overlayRoot.unmount();
			this.overlayRoot = null;
		}

		if (exist(this.overlayContainer)) {
			this.overlayContainer.remove();
			this.overlayContainer = null;
		}

		Array.from(document.getElementsByClassName(CHECKBOX_CLASS)).forEach(
			(x) => x.remove()
		);

		document
			.querySelectorAll(`[${PURCHASES_CHECKBOX_MOUNT_ATTR}]`)
			.forEach((x) => x.remove());
	}

	private cleanup(): void {
		if (exist(this.collectionObserver)) {
			this.collectionObserver.disconnect();
			this.collectionObserver = null;
		}

		if (exist(this.purchasesObserver)) {
			this.purchasesObserver.disconnect();
			this.purchasesObserver = null;
		}

		this.cleanupInjectedUi();
	}
}
