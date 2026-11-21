import { expect, test } from '@playwright/test';

import {
	appendHistory,
	computeCoverage,
	historyEntry,
	parseHistory,
	toHtml,
	toMarkdown,
	toTrendSvg,
} from '../../scripts/feature-coverage.mjs';

const MAP = {
	epics: { playback: 'Playback', settings: 'Settings' },
	features: {
		seek: { epic: 'playback', title: 'Seek' },
		speed: { epic: 'playback', title: 'Speed' },
		reset: { epic: 'settings', title: 'Reset <all>' },
		'media-keys': {
			epic: 'playback',
			title: 'Media keys',
			skip: 'No hardware keys in Chromium',
		},
	},
};

interface Result {
	name: string;
	status: string;
	start: number;
	stop: number;
	historyId: string;
	labels: { name: string; value: string }[];
}

const result = (
	name: string,
	status: string,
	features: string[],
	overrides: Partial<Result> = {}
): Result => ({
	name,
	status,
	start: 1000,
	stop: 3000,
	historyId: name,
	labels: [
		{ name: 'parentSuite', value: 'e2e' },
		...features.map((value) => ({ name: 'feature', value })),
	],
	...overrides,
});

test.describe('computeCoverage', () => {
	test('should count covered, failing, uncovered and not testable features', () => {
		const coverage = computeCoverage(MAP, [
			result('seeks', 'passed', ['seek']),
			result('seeks again', 'passed', ['seek']),
			result('changes the speed', 'failed', ['speed']),
		]);

		expect(coverage).toEqual({
			totals: {
				features: 4,
				testable: 3,
				covered: 2,
				passing: 1,
				notTestable: 1,
				tests: 3,
				passed: 2,
				failed: 1,
				skipped: 0,
				durationMs: 6000,
			},
			epics: { playback: 'Playback', settings: 'Settings' },
			features: [
				{
					id: 'seek',
					epic: 'playback',
					title: 'Seek',
					tests: 2,
					passed: 2,
					failed: 0,
					skipped: 0,
					state: 'covered',
				},
				{
					id: 'speed',
					epic: 'playback',
					title: 'Speed',
					tests: 1,
					passed: 0,
					failed: 1,
					skipped: 0,
					state: 'failing',
				},
				{
					id: 'reset',
					epic: 'settings',
					title: 'Reset <all>',
					tests: 0,
					passed: 0,
					failed: 0,
					skipped: 0,
					state: 'uncovered',
				},
				{
					id: 'media-keys',
					epic: 'playback',
					title: 'Media keys',
					skip: 'No hardware keys in Chromium',
					tests: 0,
					passed: 0,
					failed: 0,
					skipped: 0,
					state: 'skipped',
				},
			],
			errors: [],
		});
	});

	test('should report a feature that is not in the map and a test without a feature', () => {
		const coverage = computeCoverage(MAP, [
			result('unknown feature', 'passed', ['seekk']),
			result('no feature', 'passed', []),
		]);

		expect(coverage.errors).toEqual([
			'The test "unknown feature" has the feature "seekk" that is not in the coverage map',
			'The test "no feature" has no feature label',
		]);
		expect(coverage.totals.covered).toBe(0);
	});

	test('should count a test with two features once for each feature', () => {
		const coverage = computeCoverage(MAP, [
			result('both', 'passed', ['seek', 'speed']),
		]);

		expect(coverage.totals.tests).toBe(1);
		expect(coverage.totals.covered).toBe(2);
	});

	test('should ignore the results of other projects', () => {
		const coverage = computeCoverage(MAP, [
			result('unit test', 'passed', [], {
				labels: [{ name: 'parentSuite', value: 'unit' }],
			}),
			result('setup', 'passed', [], {
				labels: [{ name: 'parentSuite', value: 'dist' }],
			}),
		]);

		expect(coverage.totals.tests).toBe(0);
		expect(coverage.errors).toEqual([]);
	});

	test('should use the newest attempt of a test', () => {
		const coverage = computeCoverage(MAP, [
			result('flaky', 'failed', ['seek'], { stop: 2000 }),
			result('flaky', 'passed', ['seek'], { stop: 5000 }),
		]);

		expect(coverage.totals.tests).toBe(1);
		expect(coverage.totals.failed).toBe(0);
		expect(coverage.features[0].state).toBe('covered');
	});

	test('should not call a feature covered when its only test is skipped', () => {
		const coverage = computeCoverage(MAP, [
			result('skipped test', 'skipped', ['seek']),
		]);

		expect(coverage.features[0].state).toBe('uncovered');
		expect(coverage.totals.skipped).toBe(1);
	});
});

test.describe('toMarkdown', () => {
	test('should list the summary, the features by epic and the problems', () => {
		const markdown = toMarkdown(
			computeCoverage(MAP, [
				result('seeks', 'passed', ['seek']),
				result('no feature', 'passed', []),
			])
		);

		expect(markdown).toBe(
			[
				'## E2E feature coverage',
				'',
				'**1 of 3 features have e2e tests (33%), 1 pass.** 1 not testable in the Chromium suite.',
				'',
				'Tests: 2 (2 passed, 0 failed, 0 skipped), 4 s of test time.',
				'',
				'### Playback',
				'',
				'| Feature | Tests | Status |',
				'| --- | ---: | --- |',
				'| Seek | 1 | Covered |',
				'| Speed | 0 | No tests |',
				'| Media keys | 0 | Not testable |',
				'',
				'### Settings',
				'',
				'| Feature | Tests | Status |',
				'| --- | ---: | --- |',
				'| Reset <all> | 0 | No tests |',
				'',
				'### Labelling problems',
				'',
				'- The test "no feature" has no feature label',
				'',
			].join('\n')
		);
	});
});

test.describe('toHtml', () => {
	test('should escape the titles and show the reason of a not testable feature', () => {
		const html = toHtml(
			computeCoverage(MAP, [result('seeks', 'passed', ['seek'])])
		);

		expect(html).toContain('<td>Reset &lt;all&gt;</td>');
		expect(html).toContain(
			'<span class="why">No hardware keys in Chromium</span>'
		);
		expect(html).not.toContain('Reset <all>');
	});
});

const entry = (runId: string | null, covered: number) => ({
	date: '2026-10-26T08:00:00.000Z',
	sha: null,
	runId,
	testable: 4,
	covered,
	passing: covered,
	tests: 10,
	failed: 0,
});

test.describe('history', () => {
	test('should take the numbers of one run from the coverage', () => {
		const coverage = computeCoverage(MAP, [
			result('seeks', 'passed', ['seek']),
			result('changes the speed', 'failed', ['speed']),
		]);

		expect(
			historyEntry(coverage, {
				date: '2026-10-26T08:00:00.000Z',
				sha: 'abc',
				runId: '7',
			})
		).toEqual({
			date: '2026-10-26T08:00:00.000Z',
			sha: 'abc',
			runId: '7',
			testable: 3,
			covered: 2,
			passing: 1,
			tests: 2,
			failed: 1,
		});
	});

	test('should skip a broken line when reading the history', () => {
		const text = `${JSON.stringify(entry('1', 1))}\nnot json\n\n${JSON.stringify(entry('2', 2))}\n`;

		expect(parseHistory(text)).toEqual([entry('1', 1), entry('2', 2)]);
	});

	test('should add a run, replace the same run and keep only the newest runs', () => {
		expect(appendHistory([entry('1', 1)], entry('2', 2))).toEqual([
			entry('1', 1),
			entry('2', 2),
		]);
		expect(appendHistory([entry('1', 1)], entry('1', 3))).toEqual([
			entry('1', 3),
		]);
		expect(
			appendHistory([entry('1', 1), entry('2', 2)], entry('3', 3), 2)
		).toEqual([entry('2', 2), entry('3', 3)]);
	});

	test('should not replace a run that has no id', () => {
		expect(appendHistory([entry(null, 1)], entry(null, 2))).toEqual([
			entry(null, 1),
			entry(null, 2),
		]);
	});
});

test.describe('toTrendSvg', () => {
	test('should explain that the trend needs a second run', () => {
		expect(toTrendSvg([entry('1', 1)])).toContain('after the second run');
	});

	test('should draw one point per run with its date and share', () => {
		const svg = toTrendSvg([entry('1', 1), entry('2', 4)]);

		expect(svg).toContain('<polyline points="24.0,93.0 576.0,24.0"');
		expect(svg).toContain(
			'<title>2026-10-26: 4 of 4 features (100%)</title>'
		);
	});
});
