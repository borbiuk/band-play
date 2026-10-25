import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

// Repository guard: reads the config files from disk, not src code (an exception to testing.md)
const ROOT = path.join(__dirname, '..', '..');

type Manifest = {
	version: string;
	permissions: string[];
	optional_permissions: string[];
	host_permissions: string[];
	background?: { service_worker?: string; scripts?: string[] };
	browser_specific_settings?: {
		gecko: { id: string; strict_min_version: string };
	};
	content_scripts: { matches: string[] }[];
	icons: Record<string, string>;
	action: { default_icon: Record<string, string> };
	web_accessible_resources: { resources: string[] }[];
};

const readJson = (file: string) =>
	JSON.parse(readFileSync(path.join(ROOT, file), 'utf8'));

const chrome: Manifest = readJson('public/manifest.json');
const firefox: Manifest = readJson('public/manifest.firefox.json');
const packageJson = readJson('package.json');

// Permissions that only Chrome has (Firefox does not support them)
const CHROME_ONLY_PERMISSIONS = ['power', 'downloads.shelf', 'downloads.ui'];

// The manifest without the keys that are meant to differ between the two browsers
const withoutIntendedDifferences = (manifest: Manifest) => {
	const {
		background: _background,
		browser_specific_settings: _settings,
		...rest
	} = manifest;
	return {
		...rest,
		permissions: manifest.permissions.filter(
			(permission) => !CHROME_ONLY_PERMISSIONS.includes(permission)
		),
	};
};

test.describe('versions', () => {
	test('should have the same version in both manifests and package.json', () => {
		expect(firefox.version).toBe(chrome.version);
		expect(packageJson.version).toBe(chrome.version);
	});
});

test.describe('manifests', () => {
	test('should differ only in the background, the Gecko settings and the Chrome-only permissions', () => {
		expect(withoutIntendedDifferences(firefox)).toEqual(
			withoutIntendedDifferences(chrome)
		);
	});

	test('should use a service worker in Chrome and background scripts in Firefox', () => {
		expect(chrome.background).toEqual({ service_worker: 'background.js' });
		expect(firefox.background).toEqual({ scripts: ['background.js'] });
	});

	test('should list the Chrome-only permissions in the Chrome manifest only', () => {
		expect(chrome.permissions).toEqual(
			expect.arrayContaining(CHROME_ONLY_PERMISSIONS)
		);
		expect(
			firefox.permissions.filter((permission) =>
				CHROME_ONLY_PERMISSIONS.includes(permission)
			)
		).toEqual([]);
	});

	test('should request exactly these permissions in Chrome', () => {
		expect(chrome.permissions).toEqual([
			'storage',
			'power',
			'downloads',
			'downloads.shelf',
			'downloads.ui',
			'alarms',
		]);
	});

	test('should request exactly these permissions in Firefox', () => {
		expect(firefox.permissions).toEqual(['storage', 'downloads', 'alarms']);
	});

	test('should ask for notifications only as an optional permission', () => {
		expect(chrome.optional_permissions).toEqual(['notifications']);
		expect(firefox.optional_permissions).toEqual(['notifications']);
	});

	test('should match the Bandcamp hosts in both manifests', () => {
		const BANDCAMP_HOSTS = [
			'https://bandcamp.com/*',
			'https://*.bandcamp.com/*',
		];
		expect(chrome.host_permissions).toEqual(BANDCAMP_HOSTS);
		expect(firefox.host_permissions).toEqual(BANDCAMP_HOSTS);
		expect(chrome.content_scripts[0].matches).toEqual(BANDCAMP_HOSTS);
		expect(firefox.content_scripts[0].matches).toEqual(BANDCAMP_HOSTS);
	});

	test('should keep the Firefox add-on id and minimum version', () => {
		expect(firefox.browser_specific_settings).toEqual({
			gecko: {
				id: 'borbiuk.n@gmail.com',
				strict_min_version: '128.0',
				data_collection_permissions: { required: ['none'] },
			},
		});
	});

	test('should reference icon and resource files that exist in public/', () => {
		const files = [
			...Object.values(chrome.icons),
			...Object.values(chrome.action.default_icon),
			...chrome.web_accessible_resources.flatMap(
				(entry) => entry.resources
			),
		];
		const missing = files.filter(
			(file) => !existsSync(path.join(ROOT, 'public', file))
		);
		expect(missing).toEqual([]);
	});
});
