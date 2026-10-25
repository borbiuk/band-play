/**
 * Replaces the `chrome` global of the test process (the unit tests run in Node, without a browser).
 *
 * @param value - The fake `chrome` object.
 * @returns A function that puts the original global back; call it from `afterEach`, or right after an `import()` that reads `chrome` while it loads.
 */
export const installChrome = (value: unknown): (() => void) => {
	const original = Object.getOwnPropertyDescriptor(globalThis, 'chrome');
	Object.defineProperty(globalThis, 'chrome', {
		configurable: true,
		writable: true,
		value,
	});

	return () => {
		if (original) {
			Object.defineProperty(globalThis, 'chrome', original);
		} else {
			Reflect.deleteProperty(globalThis, 'chrome');
		}
	};
};

/** Listener of chrome.storage.local.onChanged */
type ChangeListener = (
	changes: Record<string, chrome.storage.StorageChange>
) => void;

/**
 * In-memory stand-in for `chrome.storage.local` and its `onChanged` event: promise API,
 * values cloned on write and read, change events with `oldValue` / `newValue`.
 */
export class FakeLocalStorage {
	private readonly items = new Map<string, unknown>();
	private readonly listeners = new Set<ChangeListener>();

	/** Stores a value without a change event, as data written earlier */
	seed(values: Record<string, unknown>): void {
		for (const [key, value] of Object.entries(values)) {
			this.items.set(key, structuredClone(value));
		}
	}

	/** Copy of everything stored */
	dump(): Record<string, unknown> {
		return structuredClone(Object.fromEntries(this.items));
	}

	/** Fires a change event as if another context had changed storage */
	emit(changes: Record<string, chrome.storage.StorageChange>): void {
		for (const listener of this.listeners) {
			listener(structuredClone(changes));
		}
	}

	/** The fake `chrome` global */
	toChrome(): typeof chrome {
		const local = {
			get: async (
				keys?: string | string[] | null
			): Promise<Record<string, unknown>> => {
				await Promise.resolve();
				const names =
					keys === null || keys === undefined
						? [...this.items.keys()]
						: [keys].flat();
				const result: Record<string, unknown> = {};
				for (const name of names) {
					if (this.items.has(name)) {
						result[name] = structuredClone(this.items.get(name));
					}
				}
				return result;
			},
			set: async (values: Record<string, unknown>): Promise<void> => {
				await Promise.resolve();
				const changes: Record<string, chrome.storage.StorageChange> =
					{};
				for (const [name, value] of Object.entries(values)) {
					const change: chrome.storage.StorageChange = {
						newValue: structuredClone(value),
					};
					if (this.items.has(name)) {
						change.oldValue = structuredClone(this.items.get(name));
					}

					this.items.set(name, structuredClone(value));
					changes[name] = change;
				}

				this.emit(changes);
			},
			remove: async (keys: string | string[]): Promise<void> => {
				await Promise.resolve();
				const changes: Record<string, chrome.storage.StorageChange> =
					{};
				for (const name of [keys].flat()) {
					if (this.items.has(name)) {
						changes[name] = {
							oldValue: structuredClone(this.items.get(name)),
						};
						this.items.delete(name);
					}
				}

				this.emit(changes);
			},
			onChanged: {
				addListener: (listener: ChangeListener): void => {
					this.listeners.add(listener);
				},
				removeListener: (listener: ChangeListener): void => {
					this.listeners.delete(listener);
				},
			},
		};

		return { storage: { local } } as unknown as typeof chrome;
	}
}
