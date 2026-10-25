import { BatchDownloadFormat, MessageCode } from '@shared/enums';
import { BatchDownloadPendingItemModel } from '@shared/models/batch-download/batch-download-pending-item-model';
import {
	BATCH_DOWNLOAD_HISTORY_KEY,
	downloadedSourceIdsForFormat,
	getBatchDownloadHistory,
} from '@shared/services/batch-download-history-service';
import configService from '@shared/services/config-service';
import messageService from '@shared/services/message-service';
import { exist, isWishlistUrl, notExist } from '@shared/utils';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import { BatchDownloadBar } from '../components/batch-download-bar';
import { BatchDownloadCheckboxesLayer } from '../components/batch-download-checkboxes-layer';
import {
	COLLECTION_TITLE_SELECTOR,
	DOWNLOADED_BADGE_CLASS,
	ensurePositioned,
	getDownloadableCollectionItems,
	PURCHASES_CHECKBOX_MOUNT_ATTR,
	PURCHASES_ITEM_CLASS,
	PURCHASES_ITEM_SELECTOR,
	PURCHASES_LINKS_SELECTOR,
	PURCHASES_TITLE_SELECTOR,
	REDOWNLOAD_ITEM_SELECTOR,
} from '../utils/batch-download-dom';

const BATCH_OVERLAY_ROOT_ID = 'band-play-batch-overlay-root';

const CHECKBOX_CLASS = 'band-play-batch-checkbox';

/** Class of the body while something is selected: every checkbox stays visible then. */
const SELECTING_CLASS = 'band-play-selecting';

/** How long "N releases sent to Downloads" stays in the bar. */
const SENT_NOTICE_MS = 4000;

/** The wishlist has nothing to download: no checkboxes and no bar there. */
const isWishlistPage = (): boolean => isWishlistUrl(window.location.href);

/** True when a mutation only adds or removes the checkboxes this service renders. */
const isOwnCheckboxMutation = (record: MutationRecord): boolean =>
	[...record.addedNodes, ...record.removedNodes].every(
		(node) =>
			node instanceof HTMLElement &&
			node.hasAttribute('data-band-play-batch-checkbox')
	);
const CHECKBOX_ATTR = 'data-band-play-batch-id';

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
	// No checkbox clicked yet: the first Shift+click toggles one item
	lastClickedIndex: -1,
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
	itemClass: string,
	onProgress: (current: number) => void,
	isAborted: () => boolean
) => {
	let current = document.getElementsByClassName(itemClass).length;
	let failed = 0;
	onProgress(current);

	while (current < target && failed < 5 && !isAborted()) {
		container.scrollIntoView(false);
		await wait(2500);

		const amount = document.getElementsByClassName(itemClass).length;
		if (amount === current) {
			failed++;
		} else {
			failed = 0;
			current = amount;
		}

		onProgress(current);
	}
};

const parseCollectionItem = (
	container: Element
): BatchDownloadPendingItemModel | null => {
	const redownloadAnchor = container.querySelector(
		`${REDOWNLOAD_ITEM_SELECTOR} a`
	);
	if (!(redownloadAnchor instanceof HTMLAnchorElement)) {
		return null;
	}

	const id = container.getAttribute('data-tralbumid');
	if (!id) {
		return null;
	}

	const titleRaw = container
		.querySelector(COLLECTION_TITLE_SELECTOR)
		?.textContent?.split('\n')[0];
	const artistRaw = container
		.querySelector('.collection-item-artist')
		?.textContent?.replace('by ', '');

	const title =
		`${String(artistRaw || '').trim()} - ${String(titleRaw || '').trim()}`.replace(
			/^\s*-\s*|\s*-\s*$/g,
			''
		);

	const coverArtUrl =
		container
			.querySelector<HTMLImageElement>('img.collection-item-art')
			?.getAttribute('src') ||
		container
			.querySelector<HTMLImageElement>('img[src*="bcbits.com"]')
			?.getAttribute('src') ||
		null;

	return {
		id,
		title: title || id,
		url: redownloadAnchor.href,
		coverArtUrl,
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
		.querySelector(PURCHASES_TITLE_SELECTOR)
		?.textContent?.split(' by ');

	let title = split ? `${split[1]} - ${split[0]}` : id;
	if (split && !split[1]) {
		title = split[0];
	}

	const coverArtUrl =
		container
			.querySelector<HTMLImageElement>('.purchases-item-art img')
			?.getAttribute('src') ||
		container
			.querySelector<HTMLImageElement>('.item-art img')
			?.getAttribute('src') ||
		container
			.querySelector<HTMLImageElement>('img[src*="bcbits.com"]')
			?.getAttribute('src') ||
		undefined;

	return {
		id,
		title: String(title || id).trim(),
		url: downloadAnchor.href,
		coverArtUrl,
	};
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
	private downloadedSourceIds = new Set<string>();
	private defaultFormat: BatchDownloadFormat = BatchDownloadFormat.Wav;
	private selectionProgress: { current: number; target: number } = null;
	private isSelectionAborted = false;
	private sentCount: number | null = null;
	private sentTimerId: number | null = null;

	public start(): void {
		if (!isBandcamp()) {
			return;
		}

		this.setupForCurrentPage();
		this.refreshDownloadedSourceIds().catch(() => void 0);

		// Keep "already downloaded" marks live while downloads complete
		// and when the user switches the preferred format.
		chrome.storage.onChanged.addListener((changes, areaName) => {
			if (areaName !== 'local') {
				return;
			}

			if (
				notExist(changes[BATCH_DOWNLOAD_HISTORY_KEY]) &&
				notExist(changes.batchDownloadFormat)
			) {
				return;
			}

			this.refreshDownloadedSourceIds().catch(() => void 0);
		});

		// Re-init on URL changes (Band Play background sends UrlChanged).
		messageService.addListener(async (message) => {
			if (message.code !== MessageCode.UrlChanged) {
				return;
			}

			this.cleanup();
			this.stateRef.current = createInitialState();
			this.setupForCurrentPage();
		});
	}

	private async refreshDownloadedSourceIds(): Promise<void> {
		const [history, format] = await Promise.all([
			getBatchDownloadHistory(),
			configService.get('batchDownloadFormat'),
		]);

		this.defaultFormat = format;
		this.downloadedSourceIds = downloadedSourceIdsForFormat(
			history,
			String(format)
		);
		this.renderOverlay();
	}

	private setupForCurrentPage(): void {
		// Purchases page
		if (document.getElementById('oh-container')) {
			this.setupPurchasesPage();
			return;
		}

		// Collection page (the wishlist has no downloads: nothing is added there)
		if (
			!isWishlistPage() &&
			(document.getElementById('collection-grid') ||
				document.getElementById('wishlist-grid'))
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

		let scheduled = false;
		this.collectionObserver = new MutationObserver((records) => {
			// The checkboxes are rendered into the observed grid: their own insertions
			// must not start another pass
			if (records.every(isOwnCheckboxMutation)) {
				return;
			}

			// One pass per frame, however many nodes Bandcamp adds
			if (scheduled) {
				return;
			}

			scheduled = true;
			requestAnimationFrame(() => {
				scheduled = false;
				this.attachCollectionCheckboxes();
			});
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
		for (const host of getDownloadableCollectionItems()) {
			ensurePositioned(host);
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
						element.classList.contains(PURCHASES_ITEM_CLASS)
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

		const items = document.getElementsByClassName(PURCHASES_ITEM_CLASS);
		for (const item of items) {
			this.attachPurchasesCheckbox(item);
		}

		this.ensureOverlay('purchases');
		this.onSelectionChanged();
	}

	private attachPurchasesCheckbox(item: Element): void {
		const toAppend = item.querySelector(PURCHASES_LINKS_SELECTOR);
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

		document.body.classList.toggle(SELECTING_CLASS, selectedCount > 0);

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
						downloadedSourceIds: this.downloadedSourceIds,
						onCheckboxClick: (itemId, target, shiftKey) => {
							this.handleCheckboxClick(itemId, target, shiftKey);
						},
					}),
					React.createElement(BatchDownloadBar, {
						selectedCount,
						defaultFormat: this.defaultFormat,
						showSelectNew: this.downloadedSourceIds.size > 0,
						selectionProgress: this.selectionProgress,
						sentCount: this.sentCount,
						onSelectAllClick: async () => {
							await this.handleSelectAll();
						},
						onSelectNewClick: async () => {
							await this.handleSelectAll(true);
						},
						onClearSelectionClick: () => {
							this.clearSelection();
						},
						onCancelSelectionClick: () => {
							this.isSelectionAborted = true;
						},
						onDownloadClick: (format?: BatchDownloadFormat) => {
							this.handleDownload(format);
						},
						onOpenDownloadsClick: () => {
							messageService.post({
								code: MessageCode.BatchDownloadOpenDownloadsTab,
							});
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

		const container = checkbox.closest(PURCHASES_ITEM_SELECTOR);
		if (notExist(container)) {
			return null;
		}

		return parsePurchaseItem(container);
	}

	private handleCheckboxClick(
		itemId: string,
		target: HTMLInputElement,
		shiftKey: boolean
	): void {
		// A new selection replaces the "sent to Downloads" notice
		if (exist(this.sentCount)) {
			this.dismissSentNotice();
		}

		const all = getAllCheckboxes();
		const index = all.indexOf(target);
		const baseCollectionIndex = index >= 0 ? index + 1 : undefined;
		const selectionCreatedAt = Date.now();

		// Shift+click selects the range from the last clicked checkbox; Cmd/Ctrl+click and a
		// click without a known start (another grid, first click) toggle one item
		const lastIndex = this.stateRef.current.lastClickedIndex;
		const hasRangeStart =
			index >= 0 &&
			typeof lastIndex === 'number' &&
			lastIndex >= 0 &&
			lastIndex < all.length;
		if (shiftKey && hasRangeStart) {
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
				this.stateRef.current.selected[id] = cb.checked
					? exist(item)
						? {
								...item,
								collectionIndex: i + 1,
								createdAt: selectionCreatedAt,
							}
						: null
					: null;
			}
		} else {
			const item = this.getItemByCheckbox(target);
			this.stateRef.current.selected[itemId] = target.checked
				? exist(item)
					? {
							...item,
							collectionIndex: baseCollectionIndex,
							createdAt: selectionCreatedAt,
						}
					: null
				: null;
			this.stateRef.current.lastClickedIndex = index;
		}

		this.onSelectionChanged();
	}

	private handleDownload(format?: BatchDownloadFormat): void {
		const selected = Object.values(this.stateRef.current.selected).filter(
			(x) => exist(x)
		);

		if (selected.length === 0) {
			return;
		}

		messageService.post({
			code: MessageCode.BatchDownloadSendItemsToBackground,
			data: { items: selected, format },
		});

		this.showSentNotice(selected.length);
		this.clearSelection();
	}

	/** Unchecks every checkbox and forgets the selection. */
	private clearSelection(): void {
		this.stateRef.current.selected = {};
		this.stateRef.current.lastClickedIndex = -1;

		for (const checkbox of getAllCheckboxes()) {
			checkbox.checked = false;
		}

		this.onSelectionChanged();
	}

	private dismissSentNotice(): void {
		if (exist(this.sentTimerId)) {
			window.clearTimeout(this.sentTimerId);
			this.sentTimerId = null;
		}

		this.sentCount = null;
	}

	/** Shows "N releases sent to Downloads" in the bar for a few seconds. */
	private showSentNotice(count: number): void {
		if (exist(this.sentTimerId)) {
			window.clearTimeout(this.sentTimerId);
		}

		this.sentCount = count;
		this.sentTimerId = window.setTimeout(() => {
			this.sentTimerId = null;
			this.sentCount = null;
			this.renderOverlay();
		}, SENT_NOTICE_MS);
	}

	private async handleSelectAll(
		onlyUndownloaded: boolean = false
	): Promise<void> {
		const page = this.overlayPage;
		if (!page) {
			return;
		}

		this.isSelectionAborted = false;
		const onProgress = (current: number, target: number) => {
			this.selectionProgress = { current, target };
			this.renderOverlay();
		};

		try {
			if (page === 'collection') {
				const target = Number.parseInt(
					document.querySelector('#grid-tabs>.active .count')
						?.textContent || '0'
				);

				const showMore = document.querySelector<HTMLElement>(
					'.expand-container.show-button > button'
				);

				const container =
					document.getElementById('collection-grid') ??
					document.getElementById('wishlist-grid');

				if (showMore) {
					showMore.click();
				}

				if (target && container) {
					await loadTargetCount(
						target,
						container,
						'collection-item-container',
						(current) => onProgress(current, target),
						() => this.isSelectionAborted
					);
				}
			}

			if (page === 'purchases') {
				const target = Number.parseInt(
					(
						document.querySelector('.page-items-number')
							?.parentElement?.textContent || ''
					).match(/of (\d+)/)?.[1] || '0'
				);

				const showMore =
					document.querySelector<HTMLElement>('.view-all-button');
				const container = document.getElementsByClassName(
					'purchases'
				)[0] as HTMLElement;

				if (showMore) {
					showMore.click();
				}

				if (target && container) {
					await loadTargetCount(
						target,
						container,
						PURCHASES_ITEM_CLASS,
						(current) => onProgress(current, target),
						() => this.isSelectionAborted
					);
				}
			}
		} finally {
			this.selectionProgress = null;
			this.renderOverlay();
		}

		// Select whatever is loaded, even after a partial (stopped) load.
		for (const checkbox of getAllCheckboxes()) {
			if (checkbox.checked) {
				continue;
			}

			if (onlyUndownloaded) {
				const id = checkbox.getAttribute(CHECKBOX_ATTR);
				if (exist(id) && this.downloadedSourceIds.has(id)) {
					continue;
				}
			}

			checkbox.click();
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
			.querySelectorAll(`.${DOWNLOADED_BADGE_CLASS}`)
			.forEach((x) => x.remove());
		document.body.classList.remove(SELECTING_CLASS);

		if (exist(this.sentTimerId)) {
			window.clearTimeout(this.sentTimerId);
			this.sentTimerId = null;
		}

		this.sentCount = null;

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
