// Fails when any dependency in package.json is not pinned to an exact version (x.y.z[-prerelease][+build]).
// npm aliases with an exact version (npm:name@x.y.z) are accepted.
import { readFileSync } from 'node:fs';

const EXACT_VERSION =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
const SECTIONS = [
	'dependencies',
	'devDependencies',
	'optionalDependencies',
	'peerDependencies',
];

const packageJson = JSON.parse(
	readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

const invalid = [];
for (const section of SECTIONS) {
	for (const [name, spec] of Object.entries(packageJson[section] ?? {})) {
		if (!EXACT_VERSION.test(spec.replace(/^npm:(@[^/@]+\/)?[^@]+@/, ''))) {
			invalid.push(`${section}: ${name}@${spec}`);
		}
	}
}

if (invalid.length > 0) {
	console.error('These dependencies are not pinned to an exact version:');
	for (const line of invalid) {
		console.error(`  ${line}`);
	}
	process.exit(1);
}

console.log('All dependencies are pinned to exact versions.');
