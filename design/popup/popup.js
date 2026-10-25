// Prototype behaviour only. The real popup keeps its React components.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

if (location.search.includes('embed')) {
	document.documentElement.classList.add('embed');
}

// Tabs (roving tabindex, arrow keys)
const tabs = $$('.tab');
function selectTab(tab, focus = false) {
	tabs.forEach((t) => {
		const on = t === tab;
		t.setAttribute('aria-selected', String(on));
		t.tabIndex = on ? 0 : -1;
		$('#' + t.getAttribute('aria-controls')).hidden = !on;
	});
	$('#scroll').scrollTop = 0;
	if (focus) {
		tab.focus();
	}
}
tabs.forEach((tab, i) => {
	tab.addEventListener('click', () => selectTab(tab));
	tab.addEventListener('keydown', (e) => {
		const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
		if (move) {
			e.preventDefault();
			selectTab(tabs[(i + move + tabs.length) % tabs.length], true);
		}
		if (e.key === 'Home') {
			e.preventDefault();
			selectTab(tabs[0], true);
		}
		if (e.key === 'End') {
			e.preventDefault();
			selectTab(tabs[tabs.length - 1], true);
		}
	});
});
const hash = location.hash.replace('#', '');
if (hash && $('#tab-' + hash)) {
	selectTab($('#tab-' + hash));
}

// Seek step stepper
let step = 10;
function setStep(v) {
	step = Math.min(120, Math.max(1, v));
	$('#step-value').firstChild.nodeValue = step;
}
$('#step-minus').addEventListener('click', () =>
	setStep(step % 5 === 0 ? step - 5 : Math.floor(step / 5) * 5)
);
$('#step-plus').addEventListener('click', () =>
	setStep(Math.floor(step / 5) * 5 + 5)
);

// Range with filled track
const conc = $('#conc');
function paintRange() {
	const pct = ((conc.value - conc.min) / (conc.max - conc.min)) * 100;
	conc.style.setProperty('--pct', pct + '%');
	$('#conc-out').textContent = conc.value;
}
conc.addEventListener('input', paintRange);
paintRange();

// Confirm dialogs (native <dialog>; JS showModal keeps Firefox 128 working)
$$('[data-dialog]').forEach((b) =>
	b.addEventListener('click', () => $('#' + b.dataset.dialog).showModal())
);
$$('dialog [data-close]').forEach((b) =>
	b.addEventListener('click', () => b.closest('dialog').close())
);
$$('dialog').forEach((d) =>
	d.addEventListener('click', (e) => {
		if (e.target === d) {
			d.close();
		}
	})
);

// Shortcuts: name, keys, changed from default, enabled
const shortcuts = [
	['Play/Pause', ['Space'], false, true],
	['Play previous track', ['B'], false, true],
	['Play next track', ['N'], false, true],
	['Play track by index', ['⇧', '1–9'], false, true],
	['Loop track', ['⇧', 'V'], false, true],
	['Increase playback speed', ['↑'], false, true],
	['Decrease playback speed', ['↓'], false, true],
	['Reset playback speed', ['⇧', '↓'], false, true],
	['Switch Auto-Pitch', ['P'], false, true],
	['Reset Auto-Pitch', ['⇧', 'P'], false, false],
	['Seek forward', ['→'], false, true],
	['Seek backward', ['←'], false, true],
	['Set playback progress', ['0–9'], false, true],
	['Open in new tab', ['O'], true, true],
	['Open with focus', ['⇧', 'O'], false, true],
	['Add to wishlist', ['L'], false, true],
];
const list = $('#sc-list');
const kbd = (k) => `<kbd class="kbd">${k}</kbd>`;
function renderList() {
	const filter = $('#sc-search').value.toLowerCase();
	const top = list.scrollTop;
	list.innerHTML = '';
	shortcuts
		.filter(([n]) => n.toLowerCase().includes(filter))
		.forEach((item) => {
			const [name, keys, custom, on] = item;
			const row = document.createElement('div');
			row.className = 'sc' + (on ? '' : ' is-off');
			row.innerHTML = `
				<span class="sc__name"><span>${name}</span>${custom ? '<span class="sc__custom" title="Changed from default"></span>' : ''}</span>
				<span class="sc__keys">${keys.map(kbd).join('')}</span>
				<button class="btn btn--ghost btn--icon btn--sm sc__edit" type="button" aria-label="Change shortcut for ${name}" style="width:28px;padding:0" ${on ? '' : 'disabled'}><svg class="icon"><use href="#i-edit"/></svg></button>
				<input class="switch" type="checkbox" role="switch" aria-label="Enable ${name}" ${on ? 'checked' : ''} />`;
			$('.sc__edit', row).addEventListener('click', () => openEdit(item));
			$('.switch', row).addEventListener('change', (e) => {
				item[3] = e.target.checked;
				renderList();
			});
			list.append(row);
		});
	list.scrollTop = top;
}
$('#sc-search').addEventListener('input', renderList);
renderList();

// Edit dialog: record keys, show errors, Cancel / Save
const symbol = {
	ArrowUp: '↑',
	ArrowDown: '↓',
	ArrowLeft: '←',
	ArrowRight: '→',
	' ': 'Space',
};
const dlg = $('#dlg-edit');
const rec = $('#recorder');
const save = $('#dlg-edit-save');
let editing = null;
let combo = null;

function showError(text) {
	$('#dlg-edit-error').hidden = !text;
	$('#dlg-edit-error-text').innerHTML = text || '';
	rec.classList.toggle('is-error', Boolean(text));
	save.disabled = Boolean(text) || !combo;
}
function openEdit(item) {
	editing = item;
	combo = null;
	$('#dlg-edit-name').textContent = item[0];
	rec.value = '';
	showError('');
	dlg.showModal();
	rec.focus();
}
rec.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		return;
	}
	e.preventDefault();
	if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
		return;
	}
	const parts = [];
	if (e.metaKey) parts.push('⌘');
	if (e.ctrlKey) parts.push('Ctrl');
	if (e.altKey) parts.push('⌥');
	if (e.shiftKey) parts.push('⇧');
	parts.push(symbol[e.key] || e.key.toUpperCase());
	combo = parts;
	rec.value = parts.join(' ');
	// A disabled shortcut never fires, so it does not block a key
	const used = shortcuts.find(
		([n, k, , on]) =>
			on && n !== editing[0] && k.join('+') === parts.join('+')
	);
	const reserved =
		e.metaKey && ['T', 'W', 'N', 'R', 'L'].includes(e.key.toUpperCase());
	showError(
		used
			? `Already used by <b>${used[0]}</b>. Pick another key.`
			: reserved
				? 'The browser reserves this combination. Pick another key.'
				: ''
	);
});
$('#dlg-edit-cancel').addEventListener('click', () => dlg.close());
save.addEventListener('click', () => {
	editing[1] = combo;
	editing[2] = true;
	dlg.close();
	renderList();
});
dlg.addEventListener('click', (e) => {
	if (e.target === dlg) {
		dlg.close();
	}
});
