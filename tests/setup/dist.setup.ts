import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const ROOT = path.join(__dirname, '..', '..');

// e2e and live load dist/; building it here keeps every run (npm scripts, a plain `playwright test`,
// the Playwright test agents) on the current sources
/** A production webpack build of all four entries takes up to about a minute on a CI runner */
const BUILD_TIMEOUT_MS = 120_000;

test('should build dist/ from the current sources', () => {
	test.setTimeout(BUILD_TIMEOUT_MS);

	execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'pipe' });

	const manifest = JSON.parse(
		readFileSync(path.join(ROOT, 'dist', 'manifest.json'), 'utf8')
	);
	const packageJson = JSON.parse(
		readFileSync(path.join(ROOT, 'package.json'), 'utf8')
	);
	expect(manifest.version).toBe(packageJson.version);
});
