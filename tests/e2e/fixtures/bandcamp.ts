import { readFileSync } from 'node:fs';
import path from 'node:path';

import { BrowserContext, Page } from '@playwright/test';

const PAGES_DIR = path.join(__dirname, 'pages');

/** pages/index.json, written by capture-pages.mjs */
interface SnapshotIndex {
	/** Snapshot file per host + path */
	pages: Record<string, string>;
}

const INDEX: SnapshotIndex = JSON.parse(
	readFileSync(path.join(PAGES_DIR, 'index.json'), 'utf8')
);

/** Bandcamp pages that have a snapshot */
export const PAGES = {
	album: 'https://baugruppe90.bandcamp.com/album/laser-cut',
	track: 'https://baugruppe90.bandcamp.com/track/body-drift',
	/** Bandcamp, but no page service of the extension */
	artist: 'https://baugruppe90.bandcamp.com/',
} as const;

/**
 * Pages written by hand for what snapshots cannot give (they need a signed-in account): a collection with
 * download links, a wishlist and a purchases page. They live in `fixtures/synthetic/`, are not touched by
 * the snapshot capture, and keep only the markup the extension reads.
 */
export const SYNTHETIC_PAGES = {
	collection: 'https://bandcamp.com/borbuk',
	wishlist: 'https://bandcamp.com/borbuk/wishlist',
	purchases: 'https://bandcamp.com/yourpurchases',
} as const;

const SYNTHETIC_FILES: Record<string, string> = {
	'bandcamp.com/borbuk': 'collection.html',
	'bandcamp.com/borbuk/wishlist': 'wishlist.html',
	'bandcamp.com/yourpurchases': 'purchases.html',
};

const SYNTHETIC_DIR = path.join(__dirname, 'synthetic');

/** URL of the silent audio the tests play instead of a Bandcamp stream */
export const AUDIO_URL = 'https://t4.bcbits.com/stream/band-play-test.wav';

/** Title of the second track of the album page (live tests; the album does not change) */
export const ALBUM_SECOND_TRACK = 'Torque Motion';

/** Length of the silent audio in seconds */
export const AUDIO_SECONDS = 120;

/** Hosts whose static resources snapshots reference; aborted without a report */
const STATIC_HOSTS = /(^|\.)(bcbits\.com|bandcamp\.com|stripe\.com)$/;

/** Resource types of those static resources; documents, fetch and XHR are always reported */
const STATIC_TYPES = new Set(['stylesheet', 'image', 'font', 'media']);

/**
 * A silent mono WAV file (8 kHz, 8 bit).
 *
 * @param seconds - Length of the audio.
 */
function silentWav(seconds: number): Buffer {
	const sampleRate = 8000;
	const dataSize = sampleRate * seconds;
	const buffer = Buffer.alloc(44 + dataSize, 0x80);
	buffer.write('RIFF', 0);
	buffer.writeUInt32LE(36 + dataSize, 4);
	buffer.write('WAVE', 8);
	buffer.write('fmt ', 12);
	buffer.writeUInt32LE(16, 16);
	// PCM, one channel
	buffer.writeUInt16LE(1, 20);
	buffer.writeUInt16LE(1, 22);
	buffer.writeUInt32LE(sampleRate, 24);
	buffer.writeUInt32LE(sampleRate, 28);
	buffer.writeUInt16LE(1, 32);
	buffer.writeUInt16LE(8, 34);
	buffer.write('data', 36);
	buffer.writeUInt32LE(dataSize, 40);
	return buffer;
}

const SILENT_WAV = silentWav(AUDIO_SECONDS);

/**
 * Serves the Bandcamp pages from the saved snapshots and the test audio, and keeps every other
 * host offline. The page URL stays real, so the content script (matches https://*.bandcamp.com/*)
 * is injected as usual.
 *
 * @param context - Browser context of the test.
 * @returns URLs the test requested that no snapshot or rule covers; the fixture fails the test when it is not empty.
 */
export async function routeBandcamp(
	context: BrowserContext
): Promise<string[]> {
	const unplanned: string[] = [];

	await context.route('**/*', async (route) => {
		const url = new URL(route.request().url());

		// The context route also sees the extension's own files (options.js, icons)
		if (url.protocol === 'chrome-extension:' || url.protocol === 'data:') {
			await route.continue();
			return;
		}

		if (url.href === AUDIO_URL) {
			// Media can only seek when the server answers range requests
			const range = /bytes=(\d+)-(\d*)/.exec(
				route.request().headers()['range'] ?? ''
			);
			const start = range ? Number(range[1]) : 0;
			const end = range?.[2] ? Number(range[2]) : SILENT_WAV.length - 1;
			await route.fulfill({
				status: range ? 206 : 200,
				contentType: 'audio/wav',
				headers: {
					'accept-ranges': 'bytes',
					...(range
						? {
								'content-range': `bytes ${start}-${end}/${SILENT_WAV.length}`,
							}
						: {}),
				},
				body: SILENT_WAV.subarray(start, end + 1),
			});
			return;
		}

		// The download pages the background fetches for a batch: an empty page, so the batch fails at once
		if (url.host === 'bandcamp.com' && url.pathname === '/download') {
			await route.fulfill({
				status: 200,
				contentType: 'text/html; charset=utf-8',
				body: '<!doctype html><title>Download</title>',
			});
			return;
		}

		const syntheticFile = SYNTHETIC_FILES[url.host + url.pathname];
		if (syntheticFile && route.request().resourceType() === 'document') {
			await route.fulfill({
				status: 200,
				contentType: 'text/html; charset=utf-8',
				body: readFileSync(
					path.join(SYNTHETIC_DIR, syntheticFile),
					'utf8'
				),
			});
			return;
		}

		const file = INDEX.pages[url.host + url.pathname];
		if (file && route.request().resourceType() === 'document') {
			await route.fulfill({
				status: 200,
				contentType: 'text/html; charset=utf-8',
				body: readFileSync(path.join(PAGES_DIR, file), 'utf8'),
			});
			return;
		}

		// No network in e2e: known static resources are dropped quietly, anything else is reported
		const type = route.request().resourceType();
		// Favicons (the cover art) load with the type "other"
		const isStatic =
			STATIC_HOSTS.test(url.hostname) &&
			(STATIC_TYPES.has(type) ||
				(type === 'other' && url.pathname.startsWith('/img/')));
		if (!isStatic) {
			unplanned.push(url.href);
		}
		await route.abort('blockedbyclient');
	});

	return unplanned;
}

/**
 * Opens a snapshot page and waits until the content script has loaded the settings.
 *
 * @param page - Page of the test.
 * @param url - One of PAGES.
 */
export async function openBandcamp(page: Page, url: string): Promise<void> {
	await page.goto(url);
	await page
		.locator('html[data-band-play="ready"]')
		.waitFor({ state: 'attached' });
}

/**
 * Adds the <audio> element Bandcamp's player creates, with the silent test audio, and waits
 * until its length is known.
 *
 * @param page - Page of the test, on a snapshot.
 */
export async function addPlayerAudio(page: Page): Promise<void> {
	await page.evaluate(async (src) => {
		const audio = document.createElement('audio');
		audio.src = src;
		document.body.append(audio);
		await new Promise<void>((resolve, reject) => {
			audio.addEventListener('loadedmetadata', () => resolve(), {
				once: true,
			});
			audio.addEventListener(
				'error',
				() => reject(new Error('No audio')),
				{
					once: true,
				}
			);
		});
	}, AUDIO_URL);
}

/** State of the page's <audio> element */
export interface AudioState {
	paused: boolean;
	currentTime: number;
	playbackRate: number;
	preservesPitch: boolean;
}

/**
 * Reads the state of the page's <audio> element.
 *
 * @param page - Page of the test, after addPlayerAudio.
 */
export function readAudio(page: Page): Promise<AudioState> {
	return page.evaluate(() => {
		const audio = document.querySelector('audio');
		if (!audio) {
			throw new Error('The page has no <audio> element');
		}

		return {
			paused: audio.paused,
			currentTime: audio.currentTime,
			playbackRate: audio.playbackRate,
			preservesPitch: audio.preservesPitch,
		};
	});
}

/** A keydown that reached `window` in the bubble phase */
export interface KeyRecord {
	code: string;
	defaultPrevented: boolean;
}

/**
 * Starts recording keydown events that reach `window` in the bubble phase; returns a reader.
 * The extension handles a shortcut in the capture phase and prevents its default, so a recorded
 * key with `defaultPrevented: false` proves the extension left it to the page.
 *
 * @param page - Page of the test.
 */
export async function recordKeys(
	page: Page
): Promise<() => Promise<KeyRecord[]>> {
	await page.evaluate(() => {
		const records: KeyRecord[] = [];
		(window as unknown as { bandPlayKeys: KeyRecord[] }).bandPlayKeys =
			records;
		window.addEventListener('keydown', (event) => {
			records.push({
				code: event.code,
				defaultPrevented: event.defaultPrevented,
			});
		});
	});
	return () =>
		page.evaluate(
			() =>
				(window as unknown as { bandPlayKeys: KeyRecord[] })
					.bandPlayKeys
		);
}
