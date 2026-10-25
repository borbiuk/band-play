// Renders the banner pages to PNG at 2x, then resizes them to the exact store sizes.
// Run from the repo root: node design/banners/export-banners.mjs (needs Playwright Chromium and ImageMagick).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const dir = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(dir, 'out'), { recursive: true });
const jobs = [
	['banner-marquee', 'marquee-1400x560.png', 1400, 560],
	['banner-small', 'small-promo-440x280.png', 440, 280],
];
const browser = await chromium.launch({ channel: 'chromium' });
for (const [name, final, w, h] of jobs) {
	const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: w, height: h } });
	await page.goto('file://' + path.join(dir, name + '.html'));
	await page.waitForTimeout(1200);
	const big = path.join(dir, 'out', name + '@2x.png');
	await page.locator('#banner').screenshot({ path: big });
	await page.close();
	execFileSync('magick', [big, '-filter', 'Lanczos', '-resize', '50%', '-background', 'white', '-alpha', 'remove', '-alpha', 'off', '-depth', '8', path.join(dir, final)]);
}
await browser.close();
