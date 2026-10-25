// Prototype behaviour only. The real page keeps its React components and the windowed list.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- Sample data ----------
const palette = [
	['#0f172a', '#38bdf8'],
	['#7c2d12', '#fbbf24'],
	['#064e3b', '#34d399'],
	['#312e81', '#a78bfa'],
	['#831843', '#f472b6'],
	['#1e293b', '#e2e8f0'],
	['#713f12', '#fde68a'],
	['#134e4a', '#5eead4'],
];
const coverOf = (i) => {
	const [a, b] = palette[i % palette.length];
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><rect width="44" height="44" fill="${a}"/><circle cx="${14 + ((i * 7) % 20)}" cy="${16 + ((i * 5) % 16)}" r="${9 + (i % 4) * 2}" fill="${b}"/></svg>`;
	return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
};
let seq = 0;
const mk = (title, artist, status, progress, extra = {}) => ({
	id: 'i' + ++seq,
	title,
	artist,
	format: 'WAV',
	sizeMb: 120 + ((seq * 37) % 140),
	status,
	progress,
	cover: seq,
	...extra,
});
let items = [
	mk('Laser Cut', 'BAUGRUPPE90', 'downloading', 62),
	mk('Body Drift', 'BAUGRUPPE90', 'downloading', 18),
	mk('Torque Motion', 'BAUGRUPPE90', 'paused', 40),
	mk('Soft Machines', 'Oto Kain', 'duplicate', 55),
	mk('Rate Limited Release', 'Mira Lowe', 'rate-limited', 0, { retryIn: 24 }),
	mk('Waiting In Queue', 'Dust & Dial', 'pending', 0),
	mk('Low Tide', 'The Ferries', 'failed', 0, {
		reason: 'Download interrupted',
	}),
	{
		id: 'multi',
		title: 'Quiet Harbor: Discography Bundle',
		artist: 'Quiet Harbor',
		format: 'WAV',
		cover: 9,
		multi: true,
		expanded: true,
		children: [],
	},
	mk('Night Signal', 'Halcyon Grid', 'completed', 100),
	mk('Glass Garden', 'Mira Lowe', 'completed', 100),
	mk(
		'Paper Moons: A Very Long Release Title That Does Not Fit In The Row (Deluxe Remastered Edition)',
		'Lumen Choir with a Very Long Artist Name',
		'completed',
		100
	),
	mk('Static Bloom', 'Ana Verde', 'completed', 100),
	mk('Copper Sky', 'Dust & Dial', 'completed', 100),
	mk('Neon Ferns', 'Kiko Rae', 'completed', 100),
	mk('Ghost Index', 'Parallel Lines', 'completed', 100),
	mk('After Rain', 'Mira Lowe', 'completed', 100),
	mk('Tiny Weather', 'Oto Kain', 'completed', 100),
	mk('Cold Harbor', 'The Ferries', 'completed', 100),
];
items.find((i) => i.multi).children = [
	mk('Slow Orbit', 'Quiet Harbor', 'completed', 100, {
		parent: 'multi',
		cover: 9,
	}),
	mk('Cold Harbor', 'Quiet Harbor', 'downloading', 30, {
		parent: 'multi',
		cover: 10,
	}),
	mk('Blue Hours', 'Quiet Harbor', 'resolved', 0, {
		parent: 'multi',
		cover: 11,
	}),
];
const hash = location.hash.replace('#', '');
if (hash === 'empty') {
	items = [];
}
if (hash === 'unverified') {
	items = items
		.filter((i) => !i.multi && i.status !== 'downloading')
		.slice(0, 6)
		.map((i, n) => ({
			...i,
			status: n < 4 ? 'failed' : i.status,
			reason: 'Email not verified',
		}));
}

// ---------- Status model ----------
const ST = {
	downloading: {
		label: 'Downloading',
		icon: 'i-download',
		tone: 'active',
		group: 'active',
	},
	resolving: {
		label: 'Preparing',
		icon: 'i-clock',
		tone: '',
		group: 'active',
	},
	queued: { label: 'Queued', icon: 'i-clock', tone: '', group: 'active' },
	resolved: { label: 'Ready', icon: 'i-clock', tone: '', group: 'active' },
	pending: { label: 'Waiting', icon: 'i-clock', tone: '', group: 'active' },
	'rate-limited': {
		label: 'Rate limited',
		icon: 'i-hourglass',
		tone: 'warn',
		group: 'active',
	},
	paused: { label: 'Paused', icon: 'i-pause', tone: '', group: 'paused' },
	duplicate: {
		label: 'Already exists',
		icon: 'i-copy',
		tone: 'warn',
		group: 'paused',
	},
	completed: {
		label: 'Done',
		icon: 'i-check',
		tone: 'success',
		group: 'done',
	},
	failed: {
		label: 'Failed',
		icon: 'i-alert',
		tone: 'danger',
		group: 'failed',
	},
};
const order = [
	'failed',
	'downloading',
	'rate-limited',
	'resolving',
	'queued',
	'resolved',
	'pending',
	'paused',
	'duplicate',
	'completed',
];

function parentStatus(p) {
	const c = p.children;
	if (c.every((x) => x.status === 'completed')) return 'completed';
	if (c.some((x) => x.status === 'downloading')) return 'downloading';
	if (
		c.some((x) => x.status === 'failed') &&
		c.every((x) => ['failed', 'completed'].includes(x.status))
	)
		return 'failed';
	return 'resolved';
}
function view(i) {
	if (!i.multi) return i;
	const done = i.children.filter((c) => c.status === 'completed').length;
	return {
		...i,
		sizeMb: i.children.reduce((t, c) => t + c.sizeMb, 0),
		status: parentStatus(i),
		progress: Math.round(
			i.children.reduce((s, c) => s + c.progress, 0) / i.children.length
		),
		sub: `Bundle · ${i.children.length} downloads · ${done} of ${i.children.length} done`,
	};
}
const singles = () => items.flatMap((i) => (i.multi ? i.children : [i]));

// ---------- State ----------
const state = { filter: 'all', query: '', sort: 'queue', paused: false };

// ---------- Rendering ----------
const fmtMb = (mb) =>
	mb >= 1000 ? (mb / 1024).toFixed(1) + ' GB' : Math.round(mb) + ' MB';
const icon = (id) => `<svg class="icon"><use href="#${id}"/></svg>`;

function actionsFor(i, child) {
	const a = (cls, ic, label, act) =>
		`<button class="act ${cls}" type="button" data-act="${act}" data-id="${i.id}" title="${label}" aria-label="${label}">${icon(ic)}</button>`;
	switch (i.status) {
		case 'downloading':
			return (
				a('act--main', 'i-pause', 'Pause', 'pause') +
				a('act--secondary act--danger', 'i-x', 'Cancel', 'cancel')
			);
		case 'paused':
		case 'duplicate':
			return (
				a('act--main', 'i-play', 'Resume', 'resume') +
				a('act--secondary act--danger', 'i-x', 'Cancel', 'cancel')
			);
		case 'failed':
			return (
				a('act--main', 'i-retry', 'Retry', 'retry') +
				a('act--secondary act--danger', 'i-trash', 'Remove', 'remove')
			);
		case 'completed':
			return (
				a('act--main', 'i-folder', 'Show in folder', 'folder') +
				a('act--secondary', 'i-link', 'Open release page', 'page') +
				a(
					'act--secondary act--danger',
					'i-file-x',
					'Delete file',
					'delete'
				) +
				a(
					'act--secondary act--danger',
					'i-trash',
					'Remove from list',
					'remove'
				)
			);
		default:
			return a('act--secondary act--danger', 'i-x', 'Remove', 'remove');
	}
}
function statusCell(i) {
	const s = ST[i.status];
	const showBar =
		['downloading', 'paused', 'duplicate', 'rate-limited'].includes(
			i.status
		) && i.status !== 'rate-limited';
	const pct = i.status === 'completed' ? 100 : i.progress;
	const hint = {
		downloading: `${fmtMb(((i.sizeMb || 0) * pct) / 100)} of ${fmtMb(i.sizeMb || 0)}`,
		paused: `Paused at ${pct}%`,
		duplicate: 'File already exists. Resume to keep both',
		'rate-limited': `Bandcamp is throttling. Retry in ${i.retryIn ?? 0} s`,
		pending: 'Waiting for a free slot',
		queued: 'Waiting for a free slot',
		resolving: 'Reading the Bandcamp download page',
		resolved: 'Ready to download',
		failed: i.reason || 'Download interrupted',
		completed: i.multi ? i.sub : fmtMb(i.sizeMb || 0),
	}[i.status];
	const barTone =
		i.status === 'paused'
			? 'bar--paused'
			: i.status === 'duplicate'
				? 'bar--warn'
				: '';
	return `<div class="st">
		<div class="st__line"><span class="pill ${s.tone ? 'pill--' + s.tone : ''}">${icon(s.icon)}${s.label}</span>${showBar || i.status === 'completed' ? `<span class="st__pct">${pct}%</span>` : ''}</div>
		${showBar ? `<div class="bar ${barTone}"><i class="fill" style="width:${pct}%"></i></div>` : ''}
		<div class="st__hint" title="${hint}">${hint}</div>
	</div>`;
}
function rowHtml(raw, child = false) {
	const i = view(raw);
	const sub = i.multi
		? i.sub
		: [i.artist, i.format, fmtMb(i.sizeMb)].filter(Boolean).join(' · ');
	const twist = i.multi
		? `<button class="twist" type="button" aria-expanded="${i.expanded}" aria-label="${i.expanded ? 'Collapse' : 'Expand'} ${i.title}" data-twist="${i.id}">${icon('i-chevron')}</button>`
		: '<span></span>';
	const acts =
		i.multi && i.status === 'completed' ? '' : actionsFor(i, child);
	return `<li class="row-item${child ? ' row-item--child' : ''}" data-id="${i.id}">
		${child ? '<span></span>' : twist}
		<span class="cover" style="background:${coverOf(i.cover)} center/cover"></span>
		<div class="title"><div class="title__name" title="${i.title}">${i.title}</div><div class="title__sub" title="${sub}">${sub}</div></div>
		${statusCell(i)}
		<div class="acts">${acts}</div>
	</li>`;
}
function match(i) {
	const q = state.query.trim().toLowerCase();
	const hit = (x) => !q || `${x.title} ${x.artist}`.toLowerCase().includes(q);
	const v = view(i);
	const groupOk =
		state.filter === 'all' ||
		ST[v.status].group === state.filter ||
		(i.multi &&
			i.children.some((c) => ST[c.status].group === state.filter));
	return groupOk && (hit(i) || (i.multi && i.children.some(hit)));
}
function sorted(list) {
	const l = [...list];
	if (state.sort === 'title')
		l.sort((a, b) => a.title.localeCompare(b.title));
	if (state.sort === 'status')
		l.sort(
			(a, b) =>
				order.indexOf(view(a).status) - order.indexOf(view(b).status)
		);
	return l;
}
function render() {
	const all = singles();
	const has = all.length > 0;
	$('#empty').hidden = has;
	$('#summary').hidden = !has;
	$('#controls').hidden = !has;
	$('#list-card').hidden = !has;
	if (!has) return;

	// Summary
	const done = all.filter((x) => x.status === 'completed').length;
	const failed = all.filter((x) => x.status === 'failed').length;
	const total = all.length;
	const knownMb = all.reduce((s, x) => s + (x.sizeMb || 0), 0);
	const doneMb = all.reduce(
		(s, x) =>
			s +
			((x.sizeMb || 0) * (x.status === 'completed' ? 100 : x.progress)) /
				100,
		0
	);
	const active = all.some((x) => x.status === 'downloading');
	$('#sum-done').textContent = done;
	$('#sum-total').textContent = total;
	$('#sum-fail').hidden = !failed;
	$('#sum-fail').textContent = `${failed} failed`;
	const speed = 18.4;
	$('#sum-meta').textContent =
		`${fmtMb(doneMb)} of ${fmtMb(knownMb)}` +
		(active
			? ` · ${speed.toFixed(1)} MB/s · ${Math.max(1, Math.round((knownMb - doneMb) / speed / 60))} min left`
			: '');
	const donePct = (doneMb / knownMb) * 100;
	const failPct =
		(all
			.filter((x) => x.status === 'failed')
			.reduce((s, x) => s + (x.sizeMb || 0), 0) /
			knownMb) *
		100;
	$('.bar__done', $('#sum-bar')).style.width = donePct + '%';
	$('.bar__fail', $('#sum-bar')).style.width = failPct + '%';
	$('#sum-bar').setAttribute('aria-valuenow', Math.round(donePct));
	$('#banner').hidden = !all.some((x) => x.reason === 'Email not verified');

	// Filters with counts (top-level rows)
	const groups = [
		['all', 'All'],
		['active', 'Active'],
		['paused', 'Paused'],
		['failed', 'Failed'],
		['done', 'Done'],
	];
	const count = (g) =>
		items.filter((i) => g === 'all' || ST[view(i).status].group === g)
			.length;
	$('#filters').innerHTML = groups
		.map(
			([g, label]) =>
				`<button class="chip ${g === 'failed' ? 'chip--danger' : ''}" type="button" aria-pressed="${state.filter === g}" data-filter="${g}">${label}<span class="chip__n">${count(g)}</span></button>`
		)
		.join('');

	// Actions
	const hasDownloading = all.some((x) => x.status === 'downloading');
	const hasPaused = all.some((x) =>
		['paused', 'duplicate'].includes(x.status)
	);
	const main = $('#main-action');
	main.disabled = !hasDownloading && !hasPaused;
	const resume = !hasDownloading && hasPaused;
	main.dataset.mode = resume ? 'resume' : 'pause';
	main.innerHTML = `${icon(resume ? 'i-play' : 'i-pause')}<span>${resume ? 'Resume all' : 'Pause all'}</span>`;
	$('#retry-failed').hidden = !failed;
	$('#retry-count').textContent = failed;
	$('#clear-completed').disabled = !done;

	// Rows
	const list = sorted(items.filter(match));
	$('#rows').innerHTML = list
		.map(
			(i) =>
				rowHtml(i) +
				(i.multi && i.expanded
					? i.children.map((c) => rowHtml(c, true)).join('')
					: '')
		)
		.join('');
	$('#nomatch').hidden = list.length > 0;
	const multis = items.filter((i) => i.multi);
	$('#toggle-all').style.display = multis.length ? '' : 'none';
	const allOpen = multis.every((m) => m.expanded);
	$('#toggle-all').innerHTML = icon(allOpen ? 'i-collapse' : 'i-expand');
	$('#toggle-all').title = $('#toggle-all').ariaLabel = allOpen
		? 'Collapse all bundles'
		: 'Expand all bundles';
}

// ---------- Events ----------
const find = (id) => singles().find((x) => x.id === id);
document.addEventListener('click', (e) => {
	const t = e.target.closest('[data-act],[data-filter],[data-twist]');
	if (!e.target.closest('.menu')) {
		$('#menu').hidden = true;
		$('#menu-btn').setAttribute('aria-expanded', 'false');
	}
	if (!t) return;
	if (t.dataset.filter) {
		state.filter = t.dataset.filter;
		return render();
	}
	if (t.dataset.twist) {
		const m = items.find((i) => i.id === t.dataset.twist);
		m.expanded = !m.expanded;
		return render();
	}
	const id = t.dataset.id;
	const act = t.dataset.act;
	if (id === 'multi') return;
	const it = find(id);
	if (act === 'pause') it.status = 'paused';
	if (act === 'resume') it.status = 'downloading';
	if (act === 'retry') {
		it.status = 'downloading';
		it.progress = 0;
	}
	if (act === 'cancel') it.status = 'failed';
	if (act === 'remove' || act === 'delete') {
		items = items
			.map((i) =>
				i.multi
					? { ...i, children: i.children.filter((c) => c.id !== id) }
					: i
			)
			.filter((i) => i.id !== id && !(i.multi && !i.children.length));
	}
	render();
});
$('#search').addEventListener('input', (e) => {
	state.query = e.target.value;
	render();
});
$('#sort').addEventListener('change', (e) => {
	state.sort = e.target.value;
	render();
});
$('#toggle-all').addEventListener('click', () => {
	const multis = items.filter((i) => i.multi);
	const open = !multis.every((m) => m.expanded);
	multis.forEach((m) => (m.expanded = open));
	render();
});
$('#main-action').addEventListener('click', () => {
	const resume = $('#main-action').dataset.mode === 'resume';
	singles().forEach((x) => {
		if (!resume && x.status === 'downloading') x.status = 'paused';
		else if (resume && ['paused', 'duplicate'].includes(x.status))
			x.status = 'downloading';
	});
	render();
});
$('#retry-failed').addEventListener('click', () => {
	singles().forEach((x) => {
		if (x.status === 'failed') {
			x.status = 'pending';
			x.reason = '';
		}
	});
	render();
});
$('#menu-btn').addEventListener('click', (e) => {
	e.stopPropagation();
	const open = $('#menu').hidden;
	$('#menu').hidden = !open;
	$('#menu-btn').setAttribute('aria-expanded', String(open));
	if (open) $('#clear-completed').focus();
});
$('#menu').addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		$('#menu').hidden = true;
		$('#menu-btn').focus();
	}
});
$('#clear-completed').addEventListener('click', () => {
	items = items.filter((i) =>
		i.multi
			? !i.children.every((c) => c.status === 'completed')
			: i.status !== 'completed'
	);
	items.forEach(
		(i) =>
			i.multi &&
			(i.children = i.children.filter((c) => c.status !== 'completed'))
	);
	$('#menu').hidden = true;
	render();
});
const dlg = $('#dlg-clear');
$('#clear-all').addEventListener('click', () => {
	$('#menu').hidden = true;
	dlg.showModal();
});
$('#dlg-clear-cancel').addEventListener('click', () => dlg.close());
$('#dlg-clear-ok').addEventListener('click', () => {
	items = [];
	dlg.close();
	render();
});
dlg.addEventListener('click', (e) => {
	if (e.target === dlg) dlg.close();
});

const conc = $('#conc');
const paint = () => {
	conc.style.setProperty(
		'--pct',
		((conc.value - conc.min) / (conc.max - conc.min)) * 100 + '%'
	);
	$('#conc-out').textContent = conc.value;
};
conc.addEventListener('input', paint);
paint();

// Live demo: progress and the rate-limit countdown (off when motion is reduced)
if (
	!matchMedia('(prefers-reduced-motion: reduce)').matches &&
	!location.search.includes('static')
) {
	setInterval(() => {
		singles().forEach((x) => {
			if (x.status === 'downloading') {
				x.progress = Math.min(100, x.progress + 1);
				if (x.progress === 100) x.status = 'completed';
			}
			if (x.status === 'rate-limited') {
				x.retryIn = Math.max(0, x.retryIn - 1);
			}
		});
		render();
	}, 1000);
}
render();
