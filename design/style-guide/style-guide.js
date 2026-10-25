// Fills the swatches and the contrast table from the real CSS tokens.
const css = getComputedStyle(document.documentElement);
const tok = (n) => css.getPropertyValue('--' + n).trim();
const $ = (s) => document.querySelector(s);

const groups = {
	'#sw-aqua': [['aqua-50', 'Page tint'], ['aqua-100', 'Selected chip, soft fill'], ['aqua-200', 'Borders on tint'], ['aqua-300', 'Hover borders'], ['aqua-400', 'Progress start'], ['aqua-500', 'Brand. Switch, focus, fill'], ['aqua-600', 'Icons on white'], ['aqua-700', 'Primary button, aqua text'], ['aqua-800', 'Hover, text on aqua-100']],
	'#sw-pink': [['pink-100', 'Soft fill'], ['pink-500', 'Dots, donate heart'], ['pink-700', 'Counter badge fill']],
	'#sw-coral': [['coral-100', 'Error and warning fill'], ['coral-500', 'Warning bars, borders'], ['coral-600', 'Hover']],
	'#sw-ink': [['ink-900', 'Primary text'], ['ink-700', 'Secondary text'], ['ink-500', 'Hints, placeholders'], ['ink-400', 'Icons, dividers only'], ['line', 'Hairlines'], ['line-strong', 'Control borders']],
	'#sw-status': [['danger', 'Errors, risky (deep coral)'], ['danger-bg', 'Error fill'], ['warn', 'Warnings (deep coral)'], ['warn-bg', 'Warning fill'], ['success', 'Done'], ['success-bg', 'Done fill']],
};
for (const [sel, list] of Object.entries(groups)) {
	$(sel).innerHTML = list
		.map(([n, use]) => `<div class="sw" style="--c:var(--${n})"><i></i><b>${n}</b><span>${tok(n).toUpperCase()}</span><em>${use}</em></div>`)
		.join('');
}

const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
	const n = parseInt(h.slice(1), 16);
	return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const ratio = (a, b) => {
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
};
const rows = [
	['ink-900 on white', 'Body text', 'ink-900', '#ffffff', 4.5],
	['ink-700 on white', 'Secondary text', 'ink-700', '#ffffff', 4.5],
	['ink-500 on white', 'Hints, placeholders', 'ink-500', '#ffffff', 4.5],
	['ink-500 on aqua-50', 'Hints on tint', 'ink-500', 'aqua-50', 4.5],
	['aqua-700 on white', 'Aqua text', 'aqua-700', '#ffffff', 4.5],
	['aqua-800 on aqua-100', 'Selected chip', 'aqua-800', 'aqua-100', 4.5],
	['white on aqua-700', 'Primary button', '#ffffff', 'aqua-700', 4.5],
	['white on aqua-800', 'Primary button hover', '#ffffff', 'aqua-800', 4.5],
	['white on danger', 'Solid danger button', '#ffffff', 'danger', 4.5],
	['danger on danger-bg', 'Failed pill', 'danger', 'danger-bg', 4.5],
	['warn on warn-bg', 'Warning pill and note', 'warn', 'warn-bg', 4.5],
	['success on success-bg', 'Done pill', 'success', 'success-bg', 4.5],
	['success on white', 'Downloaded badge', 'success', '#ffffff', 4.5],
	['white on pink-700', 'Counter badge', '#ffffff', 'pink-700', 4.5],
	['visited purple on white', 'Visited titles', '#7b1fa2', '#ffffff', 4.5],
	['aqua-500 on white', 'Switch on, focus ring, fills', 'aqua-500', '#ffffff', 3],
	['off-switch outline on white', 'Switch off boundary', '#7f98a3', '#ffffff', 3],
	['ink-400 on white', 'Icons, dividers (not text)', 'ink-400', '#ffffff', 3],
];
const hex = (v) => (v.startsWith('#') ? v : tok(v));
$('#contrast tbody').innerHTML = rows
	.map(([name, use, fg, bg, need]) => {
		const r = ratio(hex(fg), hex(bg));
		const ok = r >= need;
		return `<tr><td>${name}</td><td>${use}</td><td><b>${r.toFixed(2)}:1</b></td><td>${need}:1</td><td><span class="${ok ? 'pass' : 'fail'}">${ok ? 'Pass' : 'Fail'}</span></td></tr>`;
	})
	.join('');

const pills = [['Downloading', 'i-download', 'pill--active'], ['Waiting', 'i-clock', ''], ['Paused', 'i-pause', ''], ['Already exists', 'i-copy', 'pill--warn'], ['Rate limited', 'i-hourglass', 'pill--warn'], ['Done', 'i-check', 'pill--success'], ['Failed', 'i-alert', 'pill--danger']];
$('#pills').innerHTML = pills.map(([l, i, c]) => `<span class="pill ${c}"><svg class="icon"><use href="#${i}"/></svg>${l}</span>`).join('');
document.querySelectorAll('.range').forEach((r) => r.style.setProperty('--pct', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'));
