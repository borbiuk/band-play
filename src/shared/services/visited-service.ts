import { BandcampTrackModel } from '@shared/models/bandcamp-track-model';
import { exist, notExist } from '@shared/utils';

/**
 * Service responsible for tracking and highlighting previously visited/listened to items.
 * Uses chrome.storage.local (already permitted) and avoids the history API or new permissions.
 */
class VisitedService {
	/** Storage key used in chrome.storage.local */
	private readonly storageKey: string = 'bp_visited_v1';

	/** Debounce buffer for pending writes */
	private readonly pendingToPersist: Set<string> = new Set<string>();

	/** Track audio elements we already bound to */
	private readonly boundAudios: WeakSet<HTMLAudioElement> = new WeakSet();

	/** Track elements we already bound click handlers to */
	private readonly boundElements: WeakSet<Element> = new WeakSet();

	/** In-memory cache of visited hashes to minimize storage reads */
	private visitedCache: Set<string> = null;

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
			if (
				exist(element) &&
				element.classList.contains('band-play-visited')
			) {
				element.classList.remove('band-play-visited');
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

				const markFromContext = () =>
					this.markCurrentBandcampContextVisited().catch(
						() => void 0
					);
				audio.addEventListener('playing', markFromContext, {
					passive: true,
				});
				audio.addEventListener('play', markFromContext, {
					passive: true,
				});
				// timeupdate fires frequently; use it as a fallback, but only once per audio due to boundAudios guard
				const onFirstProgress = async () => {
					await markFromContext();
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
					if ((e as any).button === 1) {
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
		if (!element.classList.contains('band-play-visited')) {
			element.classList.add('band-play-visited');
		}
	}

	/**
	 * Read visited set from storage with in-memory cache.
	 */
	private async getVisited(): Promise<Set<string>> {
		if (exist(this.visitedCache)) {
			return this.visitedCache;
		}
		return new Promise<Set<string>>((resolve) => {
			chrome.storage.local.get([this.storageKey], (result) => {
				const arr: Array<string> = Array.isArray(
					result?.[this.storageKey]
				)
					? (result[this.storageKey] as Array<string>)
					: [];
				this.visitedCache = new Set<string>(arr);
				resolve(this.visitedCache);
			});
		});
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
		this.pendingToPersist.clear();
		const visited = await this.getVisited();
		const arr = Array.from(visited);
		await new Promise<void>((resolve) => {
			chrome.storage.local.set({ [this.storageKey]: arr }, () =>
				resolve()
			);
		});
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
