// Feature coverage of the e2e tests.
// Reads the Allure results (labels `feature`, project name in `parentSuite`) and `tests/coverage-map.json`,
// then writes `coverage.json`, `coverage.md` and `index.html` to the output folder.
//
//   node scripts/feature-coverage.mjs [--results allure-results] [--map tests/coverage-map.json] [--out coverage-report]
//
// Exit code 1 means a broken input or a labelling mistake (a feature that is not in the map, an e2e test without
// a feature, no results at all). Low coverage never fails the run.
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';

const E2E_PROJECT = 'e2e';

const STATE_TITLES = {
	covered: 'Covered',
	failing: 'Failing',
	uncovered: 'No tests',
	skipped: 'Not testable',
};

const labelValues = (result, name) =>
	(result.labels ?? [])
		.filter((label) => label.name === name)
		.map((label) => label.value);

// Allure writes one result per attempt; the newest attempt of a test decides
const latestPerTest = (results) => {
	const latest = new Map();
	for (const result of results) {
		const key = result.historyId ?? result.fullName ?? result.name;
		const known = latest.get(key);
		if (!known || (result.stop ?? 0) >= (known.stop ?? 0)) {
			latest.set(key, result);
		}
	}
	return [...latest.values()];
};

/**
 * Counts the e2e tests of every feature of the map.
 *
 * @param {{ epics: Record<string, string>, features: Record<string, { epic: string, title: string, skip?: string }> }} map
 * @param {{ name?: string, status: string, start?: number, stop?: number, historyId?: string, labels?: { name: string, value: string }[] }[]} results
 */
export const computeCoverage = (map, results) => {
	const e2eResults = latestPerTest(
		results.filter((result) =>
			labelValues(result, 'parentSuite').includes(E2E_PROJECT)
		)
	);

	const errors = [];
	const counts = new Map(
		Object.keys(map.features).map((id) => [
			id,
			{ tests: 0, passed: 0, failed: 0, skipped: 0 },
		])
	);
	let durationMs = 0;

	for (const result of e2eResults) {
		durationMs += Math.max(0, (result.stop ?? 0) - (result.start ?? 0));
		const ids = labelValues(result, 'feature');
		if (ids.length === 0) {
			errors.push(`The test "${result.name}" has no feature label`);
			continue;
		}
		for (const id of ids) {
			const count = counts.get(id);
			if (!count) {
				errors.push(
					`The test "${result.name}" has the feature "${id}" that is not in the coverage map`
				);
				continue;
			}
			count.tests += 1;
			if (result.status === 'passed') {
				count.passed += 1;
			} else if (result.status === 'skipped') {
				count.skipped += 1;
			} else {
				count.failed += 1;
			}
		}
	}

	const features = Object.entries(map.features).map(([id, feature]) => {
		const count = counts.get(id);
		let state = 'uncovered';
		if (feature.skip) {
			state = 'skipped';
		} else if (count.failed > 0) {
			state = 'failing';
		} else if (count.passed > 0) {
			state = 'covered';
		}
		return {
			id,
			epic: feature.epic,
			title: feature.title,
			...(feature.skip ? { skip: feature.skip } : {}),
			...count,
			state,
		};
	});

	const testable = features.filter((feature) => feature.state !== 'skipped');
	const totals = {
		features: features.length,
		testable: testable.length,
		covered: testable.filter(
			(feature) =>
				feature.state === 'covered' || feature.state === 'failing'
		).length,
		passing: testable.filter((feature) => feature.state === 'covered')
			.length,
		notTestable: features.length - testable.length,
		tests: e2eResults.length,
		passed: e2eResults.filter((result) => result.status === 'passed')
			.length,
		failed: e2eResults.filter(
			(result) =>
				result.status !== 'passed' && result.status !== 'skipped'
		).length,
		skipped: e2eResults.filter((result) => result.status === 'skipped')
			.length,
		durationMs,
	};

	return { totals, epics: map.epics, features, errors };
};

const percent = (part, whole) =>
	whole === 0 ? 0 : Math.round((part / whole) * 100);

const formatSeconds = (ms) => `${Math.round(ms / 1000)} s`;

const escapeHtml = (text) =>
	String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

const featuresOfEpic = (coverage, epicId) =>
	coverage.features.filter((feature) => feature.epic === epicId);

const summaryLine = ({ totals }) =>
	`${totals.covered} of ${totals.testable} features have e2e tests (${percent(totals.covered, totals.testable)}%), ${totals.passing} pass`;

/** Markdown for the job summary and the console */
export const toMarkdown = (coverage) => {
	const { totals } = coverage;
	const lines = [
		'## E2E feature coverage',
		'',
		`**${summaryLine(coverage)}.** ${totals.notTestable} not testable in the Chromium suite.`,
		'',
		`Tests: ${totals.tests} (${totals.passed} passed, ${totals.failed} failed, ${totals.skipped} skipped), ${formatSeconds(totals.durationMs)} of test time.`,
		'',
	];
	for (const [epicId, epicTitle] of Object.entries(coverage.epics)) {
		const features = featuresOfEpic(coverage, epicId);
		if (features.length === 0) {
			continue;
		}
		lines.push(
			`### ${epicTitle}`,
			'',
			'| Feature | Tests | Status |',
			'| --- | ---: | --- |'
		);
		for (const feature of features) {
			lines.push(
				`| ${feature.title} | ${feature.tests} | ${STATE_TITLES[feature.state]} |`
			);
		}
		lines.push('');
	}
	if (coverage.errors.length > 0) {
		lines.push('### Labelling problems', '');
		for (const error of coverage.errors) {
			lines.push(`- ${error}`);
		}
		lines.push('');
	}
	return lines.join('\n');
};

const HISTORY_LIMIT = 200;

/** Reads a JSON Lines history; a line that is not valid JSON is skipped */
export const parseHistory = (text) =>
	text
		.split('\n')
		.filter((line) => line.trim() !== '')
		.flatMap((line) => {
			try {
				return [JSON.parse(line)];
			} catch {
				return [];
			}
		});

/** The numbers of one run that the trend keeps */
export const historyEntry = (coverage, { date, sha, runId }) => ({
	date,
	sha: sha ?? null,
	runId: runId ?? null,
	testable: coverage.totals.testable,
	covered: coverage.totals.covered,
	passing: coverage.totals.passing,
	tests: coverage.totals.tests,
	failed: coverage.totals.failed,
});

/** Adds a run to the history, replaces a second entry of the same run and keeps the newest runs */
export const appendHistory = (history, entry, limit = HISTORY_LIMIT) => {
	const rest =
		entry.runId !== null && history.at(-1)?.runId === entry.runId
			? history.slice(0, -1)
			: history;
	return [...rest, entry].slice(-limit);
};

const TREND = { width: 600, height: 140, padding: 24 };

/** Inline SVG line of the share of features with tests, one point per run (empty text before the second run) */
export const toTrendSvg = (history) => {
	if (history.length < 2) {
		return '<p class="why">The trend appears after the second run on master.</p>';
	}
	const { width, height, padding } = TREND;
	const step = (width - 2 * padding) / (history.length - 1);
	const points = history.map((entry, index) => ({
		x: padding + index * step,
		y:
			height -
			padding -
			(percent(entry.covered, entry.testable) / 100) *
				(height - 2 * padding),
		label: `${entry.date.slice(0, 10)}: ${entry.covered} of ${entry.testable} features (${percent(entry.covered, entry.testable)}%)`,
	}));
	const line = points
		.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
		.join(' ');
	const dots = points
		.map(
			(point) =>
				`<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3"><title>${escapeHtml(point.label)}</title></circle>`
		)
		.join('');
	return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Share of features with e2e tests per run" class="trend">
<line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" class="grid"/>
<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="grid"/>
<text x="${padding}" y="${padding - 6}" class="axis">100%</text>
<text x="${padding}" y="${height - 6}" class="axis">0%</text>
<polyline points="${line}" fill="none" class="line"/>
${dots}
</svg>`;
};

/** A static page with the same data, published next to the Allure report */
export const toHtml = (coverage, history = []) => {
	const sections = Object.entries(coverage.epics)
		.map(([epicId, epicTitle]) => {
			const features = featuresOfEpic(coverage, epicId);
			if (features.length === 0) {
				return '';
			}
			const rows = features
				.map(
					(feature) =>
						`<tr class="${feature.state}"><td>${escapeHtml(feature.title)}</td><td class="num">${feature.tests}</td><td>${STATE_TITLES[feature.state]}${feature.skip ? ` <span class="why">${escapeHtml(feature.skip)}</span>` : ''}</td></tr>`
				)
				.join('\n');
			return `<h2>${escapeHtml(epicTitle)}</h2>
<table>
<thead><tr><th>Feature</th><th class="num">Tests</th><th>Status</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`;
		})
		.join('\n');
	const errors =
		coverage.errors.length === 0
			? ''
			: `<h2>Labelling problems</h2>
<ul>
${coverage.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('\n')}
</ul>`;
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Band Play E2E coverage</title>
<style>
:root { --bg: #fff; --fg: #1a1a1a; --muted: #666; --line: #ddd; --ok: #1a7f37; --bad: #cf222e; --none: #9a6700; }
@media (prefers-color-scheme: dark) { :root { --bg: #111; --fg: #eee; --muted: #999; --line: #333; --ok: #3fb950; --bad: #ff7b72; --none: #d29922; } }
body { background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, sans-serif; margin: 0 auto; max-width: 52rem; padding: 1rem; }
table { border-collapse: collapse; width: 100%; margin-bottom: 1.5rem; }
th, td { border-bottom: 1px solid var(--line); padding: 0.35rem 0.5rem; text-align: left; vertical-align: top; }
.num { text-align: right; }
.why { color: var(--muted); font-size: 0.875rem; }
.trend { width: 100%; height: auto; margin-bottom: 1.5rem; }
.trend .grid { stroke: var(--line); }
.trend .axis { fill: var(--muted); font-size: 11px; }
.trend .line { stroke: var(--ok); stroke-width: 2; }
.trend circle { fill: var(--ok); }
tr.covered td:last-child { color: var(--ok); }
tr.failing td:last-child { color: var(--bad); }
tr.uncovered td:last-child { color: var(--none); }
tr.skipped td:last-child { color: var(--muted); }
</style>
</head>
<body>
<h1>E2E feature coverage</h1>
<p><strong>${escapeHtml(summaryLine(coverage))}.</strong> ${coverage.totals.notTestable} not testable in the Chromium suite.</p>
<p>Tests: ${coverage.totals.tests} (${coverage.totals.passed} passed, ${coverage.totals.failed} failed, ${coverage.totals.skipped} skipped), ${formatSeconds(coverage.totals.durationMs)} of test time.</p>
<h2>Trend</h2>
${toTrendSvg(history)}
${sections}
${errors}
</body>
</html>
`;
};

const readArgs = (argv) => {
	const args = {
		results: 'allure-results',
		map: 'tests/coverage-map.json',
		out: 'coverage-report',
		// A JSON Lines file with one line per run on master; read, extended and written back when given
		history: '',
	};
	for (let index = 0; index < argv.length; index += 2) {
		const name = argv[index]?.replace(/^--/, '');
		if (!(name in args) || argv[index + 1] === undefined) {
			throw new Error(`Unknown or incomplete option: ${argv[index]}`);
		}
		args[name] = argv[index + 1];
	}
	return args;
};

const main = () => {
	const args = readArgs(process.argv.slice(2));
	if (!existsSync(args.results)) {
		throw new Error(
			`No Allure results in ${args.results}; run npm run test:allure first`
		);
	}
	const results = readdirSync(args.results)
		.filter((file) => file.endsWith('-result.json'))
		.map((file) =>
			JSON.parse(readFileSync(path.join(args.results, file), 'utf8'))
		);
	const map = JSON.parse(readFileSync(args.map, 'utf8'));
	const coverage = computeCoverage(map, results);
	if (coverage.totals.tests === 0) {
		throw new Error(`No ${E2E_PROJECT} test results in ${args.results}`);
	}

	mkdirSync(args.out, { recursive: true });
	writeFileSync(
		path.join(args.out, 'coverage.json'),
		`${JSON.stringify(coverage, null, '\t')}\n`
	);
	const markdown = toMarkdown(coverage);
	writeFileSync(path.join(args.out, 'coverage.md'), markdown);
	let history = [];
	if (args.history !== '') {
		const known = existsSync(args.history)
			? parseHistory(readFileSync(args.history, 'utf8'))
			: [];
		history = appendHistory(
			known,
			historyEntry(coverage, {
				date: new Date().toISOString(),
				sha: process.env.GITHUB_SHA,
				runId: process.env.GITHUB_RUN_ID,
			})
		);
		mkdirSync(path.dirname(args.history), { recursive: true });
		writeFileSync(
			args.history,
			`${history.map((entry) => JSON.stringify(entry)).join('\n')}\n`
		);
	}
	writeFileSync(path.join(args.out, 'index.html'), toHtml(coverage, history));
	console.log(markdown);

	if (coverage.errors.length > 0) {
		process.exit(1);
	}
};

// Run the command only when this file is started directly; the unit tests import the functions
// (no `import.meta` here: Playwright loads the file as CommonJS in the unit tests)
if (path.basename(process.argv[1] ?? '') === 'feature-coverage.mjs') {
	try {
		main();
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}
