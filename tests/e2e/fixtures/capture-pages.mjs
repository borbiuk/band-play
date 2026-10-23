// Saves the Bandcamp pages the e2e tests use (npm run test:snapshots; needs network).
// The server HTML already holds the player markup (play, next and previous buttons, the track
// list). Bandcamp's own scripts are removed: the tests have no network, and the page must not
// change while a test runs. The <audio> element Bandcamp's player creates is added by the tests.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PAGES_DIR = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'pages'
);

/** Pages to capture: snapshot file per URL */
const PAGES = {
	album: 'https://baugruppe90.bandcamp.com/album/laser-cut',
	track: 'https://baugruppe90.bandcamp.com/track/body-drift',
	// An artist home page: Bandcamp, but no page service of the extension
	artist: 'https://baugruppe90.bandcamp.com/',
};

/** Markup each snapshot must contain, so a markup change fails here and not in a test */
const REQUIRED_MARKUP = {
	album: [
		'class="playbutton',
		'class="nextbutton',
		'class="prevbutton',
		'play-col',
	],
	track: ['class="playbutton', 'class="nextbutton', 'class="prevbutton'],
	artist: [],
};

const USER_AGENT =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/**
 * Removes scripts, script preloads and inline event handlers.
 *
 * @param {string} html - Page HTML as the server sent it.
 * @returns {string} HTML without anything that runs.
 */
function stripScripts(html) {
	return html
		.replace(/<script\b[\s\S]*?<\/script>/gi, '')
		.replace(/<link\b[^>]*\bas=["']script["'][^>]*>/gi, '')
		.replace(/\son[a-z]+="[^"]*"/gi, '');
}

/**
 * Removes every <div> whose opening tag contains `marker`, with all its content.
 *
 * @param {string} html - Page HTML.
 * @param {string} marker - Text of the opening tag, such as `id="collectors-data"`.
 * @returns {string} HTML without those elements.
 */
function removeDivs(html, marker) {
	let result = html;
	for (;;) {
		const markerIndex = result.indexOf(marker);
		if (markerIndex === -1) {
			return result;
		}

		const start = result.lastIndexOf('<div', markerIndex);
		const tags = /<div\b|<\/div>/gi;
		tags.lastIndex = start;
		let depth = 0;
		let end = -1;
		for (let match = tags.exec(result); match; match = tags.exec(result)) {
			depth += match[0] === '</div>' ? -1 : 1;
			if (depth === 0) {
				end = match.index + match[0].length;
				break;
			}
		}
		if (start === -1 || end === -1) {
			throw new Error(`Could not remove the element with ${marker}`);
		}

		result = result.slice(0, start) + result.slice(end);
	}
}

/**
 * Removes data about people the tests do not need: the fans who bought the album ("supported
 * by", their names and ids) and the country of the computer that captured the page.
 *
 * @param {string} html - Page HTML.
 * @returns {string} HTML without personal data.
 */
function stripPersonalData(html) {
	const result = removeDivs(
		removeDivs(html, 'id="collectors-data"'),
		'class="collected-by'
	)
		// Other data attributes with fan lists (for example the "shown_thumbs" of the album data)
		.replace(/\sdata-[a-z-]+="[^"]*fan_id[^"]*"/g, '')
		.replace(
			/(ip_location_country_code&quot;:)&quot;[A-Z]*&quot;/g,
			'$1&quot;&quot;'
		);
	if (/fan_id|class="collected-by/.test(result)) {
		throw new Error('The snapshot still contains fan data');
	}

	return result;
}

mkdirSync(PAGES_DIR, { recursive: true });

const indexPath = path.join(PAGES_DIR, 'index.json');
const previous = (() => {
	try {
		return JSON.parse(readFileSync(indexPath, 'utf8'));
	} catch {
		return { pages: {} };
	}
})();

const index = { pages: {} };
for (const [name, url] of Object.entries(PAGES)) {
	const response = await fetch(url, {
		headers: { 'user-agent': USER_AGENT, 'accept-language': 'en' },
	});
	if (!response.ok) {
		throw new Error(`${url}: HTTP ${response.status}`);
	}

	const html = await response.text();
	for (const markup of REQUIRED_MARKUP[name]) {
		if (!html.includes(markup)) {
			throw new Error(`${url}: the page has no ${markup}`);
		}
	}

	const file = `${name}.html`;
	writeFileSync(
		path.join(PAGES_DIR, file),
		stripPersonalData(stripScripts(html))
	);
	const { host, pathname } = new URL(url);
	index.pages[host + pathname] = file;
	console.log(`Saved ${url} as ${file}`);
}

writeFileSync(indexPath, `${JSON.stringify(index, null, '\t')}\n`);
if (JSON.stringify(previous.pages) !== JSON.stringify(index.pages)) {
	console.log('The page list changed.');
}
