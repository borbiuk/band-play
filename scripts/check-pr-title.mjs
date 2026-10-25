// Checks the title of a pull request. The workflow passes the title in the PR_TITLE environment variable.
// Rules: starts with an upper-case letter, at most 72 characters, no trailing period,
// and not a work-in-progress or fixup/squash title. The imperative mood cannot be checked by a script.
const MAX_LENGTH = 72;
const FORBIDDEN_PREFIXES = ['WIP', 'fixup!', 'squash!'];

const title = process.env.PR_TITLE;
const problems = [];

if (title === undefined) {
	console.error('The PR_TITLE environment variable is not set.');
	process.exit(1);
}

if (!/^[A-Z]/.test(title)) {
	problems.push('The title must start with an upper-case letter.');
}
if (title.length > MAX_LENGTH) {
	problems.push(
		`The title has ${title.length} characters, the limit is ${MAX_LENGTH}.`
	);
}
if (title.endsWith('.')) {
	problems.push('The title must not end with a period.');
}
if (FORBIDDEN_PREFIXES.some((prefix) => title.startsWith(prefix))) {
	problems.push(
		`The title must not start with ${FORBIDDEN_PREFIXES.join(', ')}.`
	);
}

if (problems.length > 0) {
	console.error(
		`The pull request title "${title}" does not follow the rules:`
	);
	for (const problem of problems) {
		console.error(`  ${problem}`);
	}
	process.exit(1);
}

console.log('The pull request title follows the rules.');
