import { defineConfig } from '@playwright/test';

import { ExtensionOptions } from './tests/e2e/fixtures/extension';

/**
 * Playwright projects:
 * - unit: pure logic from src, no browser.
 * - e2e: the built extension (dist/) in Playwright's bundled Chromium, Bandcamp pages served from snapshots, no network.
 * - live: smoke checks against real bandcamp.com. Defined only when BAND_PLAY_LIVE is set (npm run test:live),
 *   so a plain `playwright test` never reaches the network.
 * - dist: builds dist/ before e2e or live run (a setup project, so unit-only runs skip the build).
 * Allure results are written only when BAND_PLAY_ALLURE is set (npm run test:allure).
 */
export default defineConfig<ExtensionOptions>({
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	// Flaky tests are fixed, not retried
	retries: 0,
	// In CI a hanging run ends as a test failure before the job timeout cancels the job, so the report is still uploaded
	globalTimeout: process.env.CI ? 10 * 60_000 : undefined,
	// Fixed parallelism in CI, so run times do not depend on the runner's core count
	workers: process.env.CI ? 2 : undefined,
	reporter: [
		['list'],
		['html', { open: 'never' }],
		...(process.env.CI ? [['github'] as const] : []),
		// Only the master report workflow and `npm run test:allure` set BAND_PLAY_ALLURE, so pull requests write no Allure results
		...(process.env.BAND_PLAY_ALLURE
			? [
					[
						'allure-playwright',
						{
							resultsDir: 'allure-results',
							environmentInfo: {
								node_version: process.version,
								os_platform: process.platform,
							},
						},
					] as const,
				]
			: []),
	],
	use: {
		trace: 'retain-on-failure',
	},
	projects: [
		{
			name: 'unit',
			testDir: './tests/unit',
		},
		{
			name: 'dist',
			testDir: './tests/setup',
			testMatch: /dist\.setup\.ts/,
		},
		{
			name: 'e2e',
			testDir: './tests/e2e',
			dependencies: ['dist'],
		},
		...(process.env.BAND_PLAY_LIVE
			? [
					{
						name: 'live',
						testDir: './tests/live',
						dependencies: ['dist'],
						use: { bandcampRoutes: 'live' as const },
					},
				]
			: []),
	],
});
