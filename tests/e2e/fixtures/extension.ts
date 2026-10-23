import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import path from 'node:path';

import { test as base, BrowserContext, chromium, Page } from '@playwright/test';

import { routeBandcamp } from './bandcamp';

/** The Chrome build the tests load; the `dist` setup project rebuilds it before e2e and live */
export const DIST_PATH = path.join(
	realpathSync(path.join(__dirname, '..', '..', '..')),
	'dist'
);

/**
 * Id Chromium gives an unpacked extension on macOS and Linux: SHA-256 of its absolute path,
 * the first 32 hex digits mapped 0-f → a-p. The id is computed, so it does not depend on
 * when the extension's service worker starts.
 *
 * @param extensionPath - Absolute, symlink-free path of the unpacked extension.
 */
export function unpackedExtensionId(extensionPath: string): string {
	const hex = createHash('sha256')
		.update(extensionPath)
		.digest('hex')
		.slice(0, 32);
	return [...hex]
		.map((digit) => String.fromCharCode(97 + parseInt(digit, 16)))
		.join('');
}

/** How long a failed load waits for the extension's service worker, to tell a wrong id from a missing build */
const SERVICE_WORKER_WAIT_MS = 5_000;

export interface ExtensionStorage {
	/** Stores the values in `chrome.storage.local`, as the extension itself writes them */
	set(values: Record<string, unknown>): Promise<void>;
	/** Reads one key of `chrome.storage.local` (`undefined` when nothing is stored) */
	get(key: string): Promise<unknown>;
}

export interface ExtensionOptions {
	/** Snapshot routing for Bandcamp (`snapshots`, e2e), or `live` for the real site (the `live` project) */
	bandcampRoutes: 'snapshots' | 'live';
}

interface ExtensionFixtures {
	extensionId: string;
	/** Opens the settings page (`options.html`) in a new tab */
	openOptions: () => Promise<Page>;
	storage: ExtensionStorage;
}

/**
 * Test with a fresh Chromium profile per test that has the built extension loaded and Bandcamp
 * served from snapshots (or live, in the `live` project). Audio may play without a click. A test
 * fails when the extension logs an error or the page requests a URL that no snapshot covers.
 */
export const test = base.extend<ExtensionFixtures & ExtensionOptions>({
	bandcampRoutes: ['snapshots', { option: true }],

	extensionId: async ({}, use) => {
		await use(unpackedExtensionId(DIST_PATH));
	},

	context: async ({ bandcampRoutes, extensionId, headless }, use) => {
		const context: BrowserContext = await chromium.launchPersistentContext(
			'',
			{
				channel: 'chromium',
				headless,
				args: [
					`--disable-extensions-except=${DIST_PATH}`,
					`--load-extension=${DIST_PATH}`,
					// The extension starts playback from a key press handler; the tests also call play()
					'--autoplay-policy=no-user-gesture-required',
				],
			}
		);

		const extensionOrigin = `chrome-extension://${extensionId}/`;
		const extensionErrors: string[] = [];
		context.on('console', (message) => {
			const source =
				message.location().url || message.page()?.url() || '';
			if (
				message.type() === 'error' &&
				source.startsWith(extensionOrigin)
			) {
				extensionErrors.push(`${message.text()} (${source})`);
			}
		});
		context.on('weberror', (webError) => {
			if (webError.error().stack?.includes(extensionOrigin)) {
				extensionErrors.push(webError.error().message);
			}
		});

		const probe = await context.newPage();
		const manifest = await probe
			.goto(`${extensionOrigin}manifest.json`)
			.catch(() => null);
		if (!manifest?.ok()) {
			// The id is computed: when the extension did load, its service worker shows the real one
			const worker =
				context.serviceWorkers()[0] ??
				(await context
					.waitForEvent('serviceworker', {
						timeout: SERVICE_WORKER_WAIT_MS,
					})
					.catch(() => null));
			const loadedId = worker ? new URL(worker.url()).host : null;
			// Do not leave the browser running until the worker exits
			await context.close();
			throw new Error(
				loadedId && loadedId !== extensionId
					? `The extension loaded with id ${loadedId}, but the tests computed ${extensionId} from ${DIST_PATH}: Chromium's id of unpacked extensions differs on this system`
					: `The extension did not load from ${DIST_PATH} (id ${extensionId}); run npm run build`
			);
		}
		await probe.close();

		const unplanned =
			bandcampRoutes === 'live' ? [] : await routeBandcamp(context);

		await use(context);
		await context.close();

		if (extensionErrors.length > 0) {
			throw new Error(
				`The extension logged errors:\n${extensionErrors.join('\n')}`
			);
		}
		if (unplanned.length > 0) {
			throw new Error(
				`Requests without a snapshot or routing rule:\n${unplanned.join('\n')}`
			);
		}
	},

	page: async ({ context }, use) => {
		await use(context.pages()[0] ?? (await context.newPage()));
	},

	openOptions: async ({ context, extensionId }, use) => {
		await use(async () => {
			const page = await context.newPage();
			await page.goto(`chrome-extension://${extensionId}/options.html`);
			return page;
		});
	},

	storage: async ({ openOptions }, use) => {
		// One extension page gives access to chrome.storage; it is opened on first use
		let extensionPage: Page | undefined;
		const getPage = async (): Promise<Page> => {
			extensionPage ??= await openOptions();
			return extensionPage;
		};

		await use({
			async set(values) {
				const page = await getPage();
				await page.evaluate(
					(items) => chrome.storage.local.set(items),
					values
				);
			},
			async get(key) {
				const page = await getPage();
				return page.evaluate(
					async (name) =>
						(await chrome.storage.local.get(name))[name],
					key
				);
			},
		});
		await extensionPage?.close();
	},
});

export { expect } from '@playwright/test';
