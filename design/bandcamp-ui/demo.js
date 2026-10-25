// Demo behaviour for the Band Play bar and checkboxes (prototype only; the real UI is React).
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const FORMATS = [
	'MP3 v0',
	'MP3 320',
	'FLAC',
	'AAC',
	'Ogg Vorbis',
	'ALAC',
	'WAV',
	'AIFF',
];
const logo = '../logo/logo-128.png';
const ico = {
	check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
	x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
	down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
	dl: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>',
};
const state = { format: 'WAV', menu: false, loading: null, toast: null };
const hash = location.hash.replace('#', '');
const root = document.createElement('div');
root.id = 'band-play-batch-overlay-root';
document.body.append(root);
const boxes = () => $$('.band-play-batch-checkbox');
const selected = () => boxes().filter((b) => b.checked);

function render() {
	const n = selected().length;
	document.body.classList.toggle('band-play-selecting', n > 0);
	let inner;
	if (state.toast) {
		inner = `<div class="bp-toast">${ico.check}<span>${state.toast} sent to Downloads</span><a class="bp-btn bp-btn--ghost" href="../downloads/downloads.html">Open</a></div>`;
	} else if (state.loading) {
		const { current, target } = state.loading;
		inner = `<div class="bp-bar__progress"><span>Selecting ${current} of ${target}</span><div class="bp-track"><i style="width:${(current / target) * 100}%"></i></div></div>
			<button class="bp-btn" id="bp-stop">Stop</button>`;
	} else {
		inner = `<div class="bp-bar__head">${n ? `<div class="bp-bar__count" aria-live="polite">${n} selected<button class="bp-btn bp-btn--ghost bp-btn--icon" id="bp-clear" aria-label="Clear selection" title="Clear selection">${ico.x}</button></div>` : `<div class="bp-bar__brand"><img src="${logo}" alt=""></div><div class="bp-bar__count"><small>Batch download</small></div>`}</div>
			<div class="bp-bar__sep"></div>
			<button class="bp-btn" id="bp-all">Select all</button>
			<button class="bp-btn" id="bp-new">Select new</button>
			<div class="bp-split" style="position:relative">
				<button class="bp-btn bp-btn--primary" id="bp-dl" ${n ? '' : 'disabled'}>${ico.dl}${n ? `Download ${n}` : 'Download'} <span style="opacity:.75;font-weight:500">${state.format}</span></button>
				<button class="bp-btn bp-btn--primary" id="bp-fmt" ${n ? '' : 'disabled'} aria-haspopup="menu" aria-expanded="${state.menu}" aria-label="Choose format for this batch">${ico.down}</button>
				${state.menu ? `<div class="bp-menu" role="menu"><div class="bp-menu__title">Download as</div>${FORMATS.map((f) => `<button role="menuitemradio" aria-checked="${f === state.format}" data-f="${f}">${f}${f === state.format ? ico.check : ''}</button>`).join('')}</div>` : ''}
			</div>`;
	}
	root.innerHTML = `<div class="bp-bar" role="region" aria-label="Band Play batch download">${inner}</div>`;
	bind();
}
function bind() {
	$('#bp-clear')?.addEventListener('click', () => {
		boxes().forEach((b) => (b.checked = false));
		render();
	});
	$('#bp-new')?.addEventListener('click', () => {
		boxes().forEach(
			(b) =>
				(b.checked = !b
					.closest('li')
					.querySelector('.band-play-downloaded-badge'))
		);
		render();
	});
	$('#bp-all')?.addEventListener('click', () => {
		const target = 847;
		state.loading = { current: 24, target };
		render();
		const t = setInterval(() => {
			if (!state.loading) {
				clearInterval(t);
				return;
			}
			state.loading.current = Math.min(
				target,
				state.loading.current + 90
			);
			if (state.loading.current >= target) {
				clearInterval(t);
				state.loading = null;
				boxes().forEach((b) => (b.checked = true));
			}
			render();
		}, 120);
	});
	$('#bp-stop')?.addEventListener('click', () => {
		state.loading = null;
		render();
	});
	$('#bp-fmt')?.addEventListener('click', () => {
		state.menu = !state.menu;
		render();
	});
	$$('.bp-menu button').forEach((b) =>
		b.addEventListener('click', () => {
			state.format = b.dataset.f;
			state.menu = false;
			render();
		})
	);
	$('#bp-dl')?.addEventListener('click', () => {
		state.toast = `${selected().length} ${selected().length === 1 ? 'release' : 'releases'}`;
		boxes().forEach((b) => (b.checked = false));
		render();
		setTimeout(() => {
			state.toast = null;
			render();
		}, 4000);
	});
}
let last = -1;
boxes().forEach((b, i) =>
	b.addEventListener('click', (e) => {
		if (e.shiftKey && last >= 0) {
			const [a, z] = [Math.min(last, i), Math.max(last, i)];
			boxes()
				.slice(a, z + 1)
				.forEach((x) => (x.checked = b.checked));
		}
		last = i;
		render();
	})
);
document.addEventListener('click', (e) => {
	if (state.menu && !e.target.closest('.bp-split')) {
		state.menu = false;
		render();
	}
});

// Preset states for screenshots
if (['selected', 'menu', 'toast'].includes(hash)) {
	[0, 3, 4].forEach((i) => {
		if (boxes()[i]) boxes()[i].checked = true;
	});
}
if (hash === 'menu') {
	state.menu = true;
}
if (hash === 'toast') {
	boxes().forEach((b) => (b.checked = false));
	state.toast = '3 releases';
}
if (hash === 'loading') {
	state.loading = { current: 120, target: 847 };
}
render();

const sp = new URLSearchParams(location.search);
if (sp.get('scroll')) {
	window.scrollTo(0, Number(sp.get('scroll')));
}
if (sp.has('noplayer')) {
	document.querySelector('.player')?.remove();
}
if (sp.has('barleft')) {
	const st = document.createElement('style');
	st.textContent = '.bp-bar{right:auto;left:16px;bottom:34px;transform:scale(.88);transform-origin:left bottom}';
	document.head.append(st);
}
