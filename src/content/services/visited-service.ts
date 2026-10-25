import { VISITED_STORAGE_KEY } from '@shared/services/visited-history';
import { exist, notExist } from '@shared/utils';

import { BandcampTrackModel } from '../models/bandcamp-track-model';

/** Class of a visited release or track (see content/styles/visited.scss). */
const VISITED_CLASS = 'band-play-visited';

/** Most visited items kept (about 0.7 MB of the 10 MB storage.local quota). */
const MAX_VISITED_ENTRIES = 50_000;

/**
 * Service responsible for tracking and highlighting previously visited/listened to items.
 * Uses chrome.storage.local (already permitted) and avoids the history API or new permissions.
 */
class VisitedService {
	/** Storage key used in chrome.storage.local */
	private readonly storageKey: string = VISITED_STORAGE_KEY;

	/** Debounce buffer for pending writes */
	private readonly pendingToPersist: Set<string> = new Set<string>();

	/** Track audio elements we already bound to */
	private readonly boundAudios: WeakSet<HTMLAudioElement> = new WeakSet();

	/** Track elements we already bound click handlers to */
	private readonly boundElements: WeakSet<Element> = new WeakSet();

	/** In-memory cache of visited hashes to minimize storage reads */
	private visitedCache: Set<string> = null;

	/** Grows when the cache gets new hashes; elements are checked again after that */
	private visitedVersion: number = 0;

	/** The cache version and id each element was last checked with */
	private readonly checkedElements: WeakMap<Element, string> = new WeakMap();

	/** Debounce timer id */
	private persistTimerId: number = null;

	/**
	 * Public: Highlight Bandcamp track elements that were previously visited.
	 * Also attaches click listeners to record visits when users open items.
	 */
	public async highlightBandcampTracks(
		tracks: Array<BandcampTrackModel>
	): Promise<void> {
		if (notExist(tracks) || tracks.length === 0) {
			return;
		}

		const visited = await this.getVisited();
		for (const { id, element } of tracks) {
			if (notExist(element)) {
				continue;
			}

			// The page services call this every 300 ms: skip what is already checked
			const checkKey = `${this.visitedVersion}|${id}`;
			if (this.checkedElements.get(element) === checkKey) {
				continue;
			}

			this.checkedElements.set(element, checkKey);

			// Compute candidate hashes for this element
			const candidateHashes =
				this.generateBandcampCandidateHashesForElement(id, element);
			const isVisited = candidateHashes.some((hash) => visited.has(hash));
			if (isVisited) {
				this.applyVisitedClass(element);
			}

			this.attachOpenListeners(element);
		}
	}

	/**
	 * Public: Remove highlight from provided Bandcamp track elements.
	 */
	public unhighlightBandcampTracks(tracks: Array<BandcampTrackModel>): void {
		if (notExist(tracks) || tracks.length === 0) {
			return;
		}
		for (const { element } of tracks) {
			if (exist(element)) {
				this.checkedElements.delete(element);
			}

			if (exist(element) && element.classList.contains(VISITED_CLASS)) {
				element.classList.remove(VISITED_CLASS);
			}
		}
	}

	/**
	 * Public: Mark Bandcamp item by tralbum id as visited.
	 */
	public async markBandcampTralbumIdVisited(id: string): Promise<void> {
		if (notExist(id)) {
			return;
		}
		const hash = this.hashKey(this.makeTralbumKey(id));
		await this.markVisitedMany([hash]);
	}

	/**
	 * Public: Bind to Bandcamp audio to mark the current page item as visited when playback starts.
	 * Safe to call multiple times; binding is idempotent per audio element.
	 */
	public bindBandcampAudio(
		getAudioEmitter: () => {
			on: (cb: (audio: HTMLAudioElement) => void) => void;
		}
	): void {
		try {
			const emitter = getAudioEmitter?.();
			if (notExist(emitter) || notExist(emitter.on)) {
				return;
			}
			emitter.on((audio: HTMLAudioElement) => {
				if (notExist(audio) || this.boundAudios.has(audio)) {
					return;
				}
				this.boundAudios.add(audio);

				const markFromContext = (): void => {
					this.markCurrentBandcampContextVisited().catch(
						() => void 0
					);
				};
				audio.addEventListener('playing', markFromContext, {
					passive: true,
				});
				audio.addEventListener('play', markFromContext, {
					passive: true,
				});
				// timeupdate fires frequently; use it as a fallback, but only once per audio due to boundAudios guard
				const onFirstProgress = (): void => {
					markFromContext();
					audio.removeEventListener('timeupdate', onFirstProgress);
				};
				audio.addEventListener('timeupdate', onFirstProgress, {
					passive: true,
				});
			});
		} catch {
			// no-op
		}
	}

	/**
	 * Public: Mark the current Bandcamp page as visited based on DOM context.
	 * Attempts to capture both tralbum id and canonical path.
	 */
	public async markCurrentBandcampContextVisited(): Promise<void> {
		const hashes: Array<string> = [];

		// Try tralbum id from any element carrying data-tralbumid
		const tralbumEl = document.querySelector('[data-tralbumid]');
		const tralbumId = tralbumEl?.getAttribute('data-tralbumid');
		if (exist(tralbumId)) {
			hashes.push(this.hashKey(this.makeTralbumKey(tralbumId)));
		}

		// Try a collect-item container used widely on Bandcamp
		const collect = document.querySelector('div[data-collect-item]');
		const collectId = collect
			?.getAttribute('data-collect-item')
			?.replace(/^./, ''); // remove prefix if any
		if (exist(collectId)) {
			hashes.push(this.hashKey(this.makeTralbumKey(collectId)));
		}

		// Fallback to a canonical path
		const url = this.tryExtractCanonicalUrl() ?? window.location.href;
		try {
			const u = new URL(url, window.location.origin);
			hashes.push(this.hashKey(this.makeUrlKey(u.pathname)));
		} catch {
			// ignore invalid URL
		}

		if (hashes.length === 0) {
			return;
		}
		await this.markVisitedMany(hashes);
	}

	/**
	 * Attach click/middle-click listeners to an item element to record visits.
	 * Idempotent per element.
	 */
	private attachOpenListeners(element: Element): void {
		if (this.boundElements.has(element)) {
			return;
		}
		this.boundElements.add(element);

		const handler = (href: string) => {
			const keys: Array<string> = [];
			try {
				const u = new URL(href, window.location.origin);
				keys.push(this.hashKey(this.makeUrlKey(u.pathname)));
			} catch {
				// ignore invalid
			}
			const tralbumId = element.getAttribute('data-tralbumid');
			if (exist(tralbumId)) {
				keys.push(this.hashKey(this.makeTralbumKey(tralbumId)));
			}
			this.markVisitedMany(keys).catch(() => void 0);
		};

		const anchor = this.findBandcampAnchor(element);
		if (exist(anchor)) {
			anchor.addEventListener('click', () => handler(anchor.href), {
				passive: true,
			});
			anchor.addEventListener(
				'auxclick',
				(e: MouseEvent) => {
					if (e.button === 1) {
						handler(anchor.href);
					}
				},
				{ passive: true }
			);
		}
	}

	/**
	 * Find an anchor pointing to an album / track within an item element.
	 */
	private findBandcampAnchor(element: Element): HTMLAnchorElement {
		return (
			element.querySelector<HTMLAnchorElement>('a.item-link') ||
			element.querySelector<HTMLAnchorElement>('a.buy-button') ||
			element.querySelector<HTMLAnchorElement>('a[href*="/album/"]') ||
			element.querySelector<HTMLAnchorElement>('a[href*="/track/"]')
		);
	}

	/**
	 * Generate candidate hashes for matching an item by its element and known id.
	 */
	private generateBandcampCandidateHashesForElement(
		id: string,
		element: Element
	): Array<string> {
		const hashes: Array<string> = [];
		if (exist(id)) {
			// Sometimes ids include non-numeric tokens; accept as-is
			hashes.push(this.hashKey(this.makeTralbumKey(id)));
		}

		const tralbumId = element.getAttribute('data-tralbumid');
		if (exist(tralbumId)) {
			hashes.push(this.hashKey(this.makeTralbumKey(tralbumId)));
		}

		const anchor = this.findBandcampAnchor(element);
		if (exist(anchor)) {
			try {
				const u = new URL(anchor.href, window.location.origin);
				hashes.push(this.hashKey(this.makeUrlKey(u.pathname)));
			} catch {
				// ignore
			}
		}

		return hashes;
	}

	/**
	 * Apply the visited class to the root element.
	 */
	private applyVisitedClass(element: Element): void {
		if (!element.classList.contains(VISITED_CLASS)) {
			element.classList.add(VISITED_CLASS);
		}
	}

	/**
	 * Reads the visited hashes stored by all tabs.
	 */
	private async readStoredVisited(): Promise<Array<string>> {
		const result = await chrome.storage.local.get([this.storageKey]);
		const value: unknown = result?.[this.storageKey];
		return Array.isArray(value)
			? value.filter((x): x is string => typeof x === 'string')
			: [];
	}

	/**
	 * Read visited set from storage with in-memory cache.
	 * The cache follows the writes of other Bandcamp tabs.
	 */
	private async getVisited(): Promise<Set<string>> {
		if (exist(this.visitedCache)) {
			return this.visitedCache;
		}

		const stored = await this.readStoredVisited();
		if (notExist(this.visitedCache)) {
			this.visitedCache = new Set<string>(stored);
			chrome.storage.local.onChanged.addListener((changes) => {
				if (!(this.storageKey in changes)) {
					return;
				}

				const value: unknown = changes[this.storageKey].newValue;
				// The history was cleared (from the popup): forget the cache and the pending writes,
				// otherwise this tab would write the old hashes back
				if (!Array.isArray(value) || value.length === 0) {
					this.visitedCache.clear();
					this.pendingToPersist.clear();
					this.visitedVersion++;
					document
						.querySelectorAll(`.${VISITED_CLASS}`)
						.forEach((element) =>
							element.classList.remove(VISITED_CLASS)
						);
					return;
				}

				for (const hash of value) {
					if (typeof hash === 'string') {
						this.visitedCache.add(hash);
					}
				}

				this.visitedVersion++;
			});
		}

		return this.visitedCache;
	}

	/**
	 * Persist new hashes with simple debouncing to reduce writes.
	 */
	private async markVisitedMany(hashes: Array<string>): Promise<void> {
		if (notExist(hashes) || hashes.length === 0) {
			return;
		}
		const visited = await this.getVisited();
		let changed = false;
		for (const h of hashes) {
			if (exist(h) && !visited.has(h)) {
				visited.add(h);
				this.pendingToPersist.add(h);
				changed = true;
				this.visitedVersion++;
			}
		}
		if (!changed) {
			return;
		}
		this.schedulePersist();
	}

	private schedulePersist(): void {
		if (exist(this.persistTimerId)) {
			return;
		}
		this.persistTimerId = window.setTimeout(() => {
			this.persistTimerId = null;
			this.flushPersist().catch(() => void 0);
		}, 800);
	}

	private async flushPersist(): Promise<void> {
		if (this.pendingToPersist.size === 0) {
			return;
		}

		// Read the current list again: another tab may have added hashes since this tab
		// loaded it, and writing the cached copy would drop them
		const pending = Array.from(this.pendingToPersist);
		const merged = new Set<string>(await this.readStoredVisited());
		for (const hash of pending) {
			merged.add(hash);
		}

		// Keep the newest entries only, so the list cannot fill the storage
		const all = Array.from(merged);
		const kept =
			all.length > MAX_VISITED_ENTRIES
				? all.slice(all.length - MAX_VISITED_ENTRIES)
				: all;
		await chrome.storage.local.set({ [this.storageKey]: kept });
		for (const hash of pending) {
			this.pendingToPersist.delete(hash);
		}
	}

	/**
	 * Compute a compact, deterministic 53-bit hash (cyrb53) and encode in base36 to minimize space.
	 */
	private hashKey(input: string): string {
		let h1 = 0xdeadbeef ^ input.length;
		let h2 = 0x41c6ce57 ^ input.length;
		for (let i = 0, ch; i < input.length; i++) {
			ch = input.codePointAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1 =
			Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
			Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		h2 =
			Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
			Math.imul(h1 ^ (h1 >>> 13), 3266489909);
		const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
		return hash.toString(36);
	}

	private makeTralbumKey(id: string): string {
		return `bc|tralbum|${id}`;
	}

	private makeUrlKey(pathname: string): string {
		return `bc|url|${pathname}`;
	}

	/**
	 * Try to extract canonical URL from the page metadata.
	 */
	private tryExtractCanonicalUrl(): string {
		const link = document.querySelector<HTMLLinkElement>(
			'link[rel="canonical"]'
		);
		return link?.href ?? null;
	}
}

const visitedService = new VisitedService();
export default visitedService;
