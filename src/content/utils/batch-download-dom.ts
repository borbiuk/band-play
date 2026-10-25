/**
 * The Bandcamp markup that batch download depends on, and the elements it adds itself.
 * Both the batch download service and the checkboxes layer use these, so a change of Bandcamp's markup
 * is fixed in one place ([bandcamp-dom.md](../../../.claude/rules/bandcamp-dom.md)).
 */

/** A collection item container. */
export const COLLECTION_ITEM_SELECTOR =
	'[id*="collection-item-container"], .collection-item-container';

/** Marks a collection item that has a link to download it again. */
export const REDOWNLOAD_ITEM_SELECTOR = '.redownload-item';

export const COLLECTION_TITLE_SELECTOR = '.collection-item-title';

export const PURCHASES_ITEM_CLASS = 'purchases-item';
export const PURCHASES_ITEM_SELECTOR = `.${PURCHASES_ITEM_CLASS}`;
export const PURCHASES_LINKS_SELECTOR = '[data-tid="links"]';
export const PURCHASES_TITLE_SELECTOR = '.purchases-item-title';

/** Attribute of the element where the checkbox of a purchase is rendered; its value is the sale id. */
export const PURCHASES_CHECKBOX_MOUNT_ATTR =
	'data-band-play-batch-checkbox-mount';

/** The "Downloaded" badge next to the checkbox of a release that is in the history. */
export const DOWNLOADED_BADGE_CLASS = 'band-play-downloaded-badge';

/**
 * The collection items that can be downloaded again: they have an id and a download link
 * (items you do not own, such as wishlist ones, have none).
 *
 * @returns The item containers of the current page.
 */
export const getDownloadableCollectionItems = (): HTMLElement[] =>
	Array.from(
		document.querySelectorAll<HTMLElement>(COLLECTION_ITEM_SELECTOR)
	).filter(
		(element) =>
			!!element.getAttribute('data-tralbumid') &&
			element.querySelector(REDOWNLOAD_ITEM_SELECTOR) !== null
	);

/**
 * Makes a static element positioned, so something can be placed inside it.
 *
 * @param element - The element to position.
 */
export const ensurePositioned = (element: HTMLElement): void => {
	if (getComputedStyle(element).position === 'static') {
		element.style.position = 'relative';
	}
};
