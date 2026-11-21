import { notExist } from '@shared/utils';

import { ensurePositioned } from './batch-download-dom';

/** The kind of a collection or wishlist item. */
export type CollectionItemType = 'album' | 'track';

/** The grids whose items get a badge. */
const GRID_IDS = ['collection-grid', 'wishlist-grid'];

/**
 * Set on an item once it was handled, so it is not scanned again: the kind of the item,
 * or "none" when Bandcamp gave an unknown kind.
 */
const ITEM_TYPE_MARK_ATTR = 'data-band-play-item-type';

/**
 * Items that tell their kind and were not handled yet.
 * Bandcamp sets `data-tralbumtype` to "a" (album) or "t" (track) on each item.
 * The item link is not used: a track item often links to its album page.
 */
const UNMARKED_ITEM_SELECTOR = `.collection-item-container[data-tralbumtype]:not([${ITEM_TYPE_MARK_ATTR}])`;

/** The cover of an item; the real pages have it and it is made positioned in item-type.scss. */
const COVER_SELECTOR = '.collection-item-art-container';

export const ITEM_TYPE_BADGE_CLASS = 'band-play-item-type-badge';

/**
 * Set on the item that plays now, so item-type.scss can keep its badges visible without the pointer.
 */
export const PLAYING_ITEM_ATTR = 'data-band-play-playing';

/**
 * Set on `<html>` while the setting "Alternative design" is on. item-type.scss shows the
 * "Album" / "Track" badges and hides the section under the titles only then.
 */
export const ALTERNATIVE_DESIGN_ATTR = 'data-band-play-alt-design';

/**
 * Turns the alternative design of the collection and wishlist pages on or off.
 * Safe to call often: the attribute is only touched when the setting changed.
 *
 * @param enabled - The value of the setting `alternativeDesign`.
 */
export const applyAlternativeDesign = (enabled: boolean): void => {
	document.documentElement.toggleAttribute(ALTERNATIVE_DESIGN_ATTR, enabled);
};

/**
 * Maps the value of Bandcamp's `data-tralbumtype` attribute to the item kind.
 *
 * @param value - The attribute value.
 * @returns The item kind, or null for an unknown value.
 */
export const parseTralbumType = (
	value: string | null | undefined
): CollectionItemType | null => {
	if (value === 'a') {
		return 'album';
	}

	if (value === 't') {
		return 'track';
	}

	return null;
};

/**
 * Finds the element the badge is placed in.
 *
 * @param item - The collection item.
 * @returns The cover element, or null when the item has no cover yet.
 */
const getCover = (item: HTMLElement): HTMLElement | null => {
	const cover = item.querySelector<HTMLElement>(COVER_SELECTOR);
	if (cover) {
		return cover;
	}

	// Fallback for other markup: its position is not known from CSS, so it is checked here
	const fallback = item.querySelector<HTMLElement>(
		'img.collection-item-art'
	)?.parentElement;
	if (notExist(fallback)) {
		return null;
	}

	ensurePositioned(fallback);

	return fallback;
};

/**
 * Marks the item that plays now with `data-band-play-playing` and clears the mark from the others.
 * The item that is in the player counts as playing, also while it is paused.
 * Safe to call often: it changes the DOM only when the playing item changes.
 *
 * @param nowPlayingId - The `data-tralbumid` of the item in the player, or nothing when the player has none.
 */
export const markPlayingCollectionItem = (
	nowPlayingId: string | null | undefined
): void => {
	for (const gridId of GRID_IDS) {
		const grid = document.getElementById(gridId);
		if (notExist(grid)) {
			continue;
		}

		const marked = grid.querySelectorAll<HTMLElement>(
			`[${PLAYING_ITEM_ATTR}]`
		);
		for (const item of Array.from(marked)) {
			if (item.getAttribute('data-tralbumid') !== nowPlayingId) {
				item.removeAttribute(PLAYING_ITEM_ATTR);
			}
		}

		if (notExist(nowPlayingId) || nowPlayingId === '') {
			continue;
		}

		const playing = Array.from(
			grid.querySelectorAll<HTMLElement>('.collection-item-container')
		).find((item) => item.getAttribute('data-tralbumid') === nowPlayingId);
		if (notExist(playing) || playing.hasAttribute(PLAYING_ITEM_ATTR)) {
			continue;
		}

		playing.setAttribute(PLAYING_ITEM_ATTR, '');
	}
};

/**
 * Adds an "Album" or "Track" badge to the cover of every collection and wishlist item that was not handled yet.
 * Safe to call again: items loaded later get their badge, the others are skipped.
 */
export const markCollectionItemTypes = (): void => {
	for (const gridId of GRID_IDS) {
		const grid = document.getElementById(gridId);
		if (notExist(grid)) {
			continue;
		}

		const items = grid.querySelectorAll<HTMLElement>(
			UNMARKED_ITEM_SELECTOR
		);

		for (const item of Array.from(items)) {
			const type = parseTralbumType(
				item.getAttribute('data-tralbumtype')
			);
			if (type === null) {
				item.setAttribute(ITEM_TYPE_MARK_ATTR, 'none');
				continue;
			}

			// No cover yet: the item is left unmarked and tried again on the next call
			const cover = getCover(item);
			if (notExist(cover)) {
				continue;
			}

			const badge = document.createElement('span');
			badge.className = `${ITEM_TYPE_BADGE_CLASS} ${ITEM_TYPE_BADGE_CLASS}--${type}`;
			badge.textContent = type === 'album' ? 'Album' : 'Track';
			cover.appendChild(badge);

			item.setAttribute(ITEM_TYPE_MARK_ATTR, type);
		}
	}
};
