// Checks the Markdown files of the repository without network access and without dependencies.
// 1. Every relative link points to an existing file or folder.
// 2. The `## ` headings of RELEASE_NOTES.md are versions, unique and newest first,
//    and the newest one is the version in public/manifest.json.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const RELEASE_NOTES = 'RELEASE_NOTES.md';
const MANIFEST = 'public/manifest.json';

const errors = [];

// Removes fenced code blocks and inline code, so links and headings inside code are ignored
const stripCode = (text) =>
	text
		.replace(/^[ \t]*(```|~~~).*?^[ \t]*\1[ \t]*$/gms, '')
		.replace(/`[^`\n]*`/g, '');

// Markdown files tracked by git or not ignored (new files included), without deleted ones
const listMarkdownFiles = () =>
	execFileSync(
		'git',
		[
			'ls-files',
			'--cached',
			'--others',
			'--exclude-standard',
			'--',
			'*.md',
		],
		{ cwd: ROOT, encoding: 'utf8' }
	)
		.split('\n')
		.filter((file) => file !== '' && existsSync(path.join(ROOT, file)));

// Returns the link targets of the file, without URLs, anchors and mail links
const relativeTargets = (text) => {
	const targets = [];
	for (const match of stripCode(text).matchAll(
		/\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g
	)) {
		const target = match[1];
		if (/^(https?:|mailto:|#)/.test(target) || target.includes('://')) {
			continue;
		}
		targets.push(target.split('#')[0].split('?')[0]);
	}
	return targets;
};

const files = listMarkdownFiles();
let linkCount = 0;

for (const file of files) {
	const text = readFileSync(path.join(ROOT, file), 'utf8');
	for (const target of relativeTargets(text)) {
		linkCount += 1;
		const resolved = path.resolve(
			ROOT,
			path.dirname(file),
			decodeURI(target)
		);
		if (!existsSync(resolved)) {
			errors.push(`${file}: broken link "${target}"`);
		}
	}
}

// Compares two versions x.y.z: a negative number when a is older than b
const compareVersions = (a, b) => {
	const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
	const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
	return aMajor - bMajor || aMinor - bMinor || aPatch - bPatch;
};

const headings = stripCode(readFileSync(path.join(ROOT, RELEASE_NOTES), 'utf8'))
	.split('\n')
	.filter((line) => line.startsWith('## '))
	.map((line) => line.slice(3).trim());

const seen = new Set();
for (const heading of headings) {
	if (!/^\d+\.\d+\.\d+$/.test(heading)) {
		errors.push(
			`${RELEASE_NOTES}: heading "${heading}" is not a version x.y.z`
		);
	}
	if (seen.has(heading)) {
		errors.push(`${RELEASE_NOTES}: heading "${heading}" appears twice`);
	}
	seen.add(heading);
}

const versions = headings.filter((heading) => /^\d+\.\d+\.\d+$/.test(heading));
for (let index = 1; index < versions.length; index += 1) {
	if (compareVersions(versions[index - 1], versions[index]) <= 0) {
		errors.push(
			`${RELEASE_NOTES}: ${versions[index - 1]} must be newer than ${versions[index]}`
		);
	}
}

const manifestVersion = JSON.parse(
	readFileSync(path.join(ROOT, MANIFEST), 'utf8')
).version;
if (versions[0] !== manifestVersion) {
	errors.push(
		`${RELEASE_NOTES}: the newest heading is "${versions[0]}", but ${MANIFEST} has "${manifestVersion}"`
	);
}

if (errors.length > 0) {
	console.error('The docs check failed:');
	for (const error of errors) {
		console.error(`  ${error}`);
	}
	process.exit(1);
}

console.log(
	`The docs check passed: ${linkCount} relative links in ${files.length} Markdown files, ${versions.length} release headings.`
);
