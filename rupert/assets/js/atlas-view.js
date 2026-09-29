// Atlas page behaviour. The register is complete without this file; this adds filters, the map, and
// selection kept in step between the two. The map is reached only through map/maplibre-provider.js.
import { createMap } from './map/maplibre-provider.js';

const base = document.body.dataset.base || '';
const data = JSON.parse(document.getElementById('atlas-data')?.textContent || '{"features":[],"bounds":null}');
const rows = [...document.querySelectorAll('.reg-row')];
const stateEl = document.getElementById('map-state');
const msg = document.getElementById('map-msg');
const card = document.getElementById('map-card');
const phone = window.matchMedia('(max-width: 759.98px)');
const params = new URLSearchParams(location.search);
const test = params.get('maptest'); // notiles | nowebgl | offline | slow : failure drills
const perf = (window.__atlasPerf = { start: performance.now() });

let map = null;
let filter = 'all';

/* ---------- QA panel (?qa=1): what a tester on a phone needs to see ---------- */
const qa = { on: params.get('qa') === '1', last: '—' };
let qaEl = null;
function qaRender() {
  if (!qa.on) return;
  if (!qaEl) { qaEl = document.createElement('pre'); qaEl.className = 'qa-panel'; qaEl.setAttribute('aria-live', 'polite'); document.body.append(qaEl); }
  const st = document.getElementById('map-state')?.dataset.state;
  const rel = document.getElementById('relief')?.getAttribute('aria-pressed');
  qaEl.textContent = [
    `map: ${st}${perf.failed ? ' (' + perf.failed + ')' : ''}${perf.ready ? ' · ready ' + perf.ready + ' ms' : ''}`,
    `relief: ${rel ?? 'n/a'} · filter: ${filter}`,
    `viewport: ${innerWidth}×${innerHeight} @${devicePixelRatio}x · touch: ${matchMedia('(pointer: coarse)').matches}`,
    `last tap: ${qa.last}`,
  ].join('\n');
}
window.addEventListener('resize', () => qaRender());

/* ---------- register: filters and selection ---------- */
const filterBox = document.querySelector('.reg-filter');
filterBox.hidden = false;
filterBox.addEventListener('click', e => {
  const b = e.target.closest('button[data-filter]'); if (!b || b.disabled) return;
  filter = b.dataset.filter;
  filterBox.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  applyFilter();
});
function visible(f) { return filter === 'all' || f.properties.status === filter; }
function applyFilter() {
  rows.forEach(r => { r.hidden = !(filter === 'all' || r.dataset.status === filter); });
  document.querySelectorAll('.reg-group').forEach(g => { g.hidden = !g.querySelector('.reg-row:not([hidden])'); });
  map?.setMarkers(data.features.filter(visible));
  qaRender();
}

function select(id, { from } = {}) {
  qa.last = id ? `${from || 'register'} → ${id}` : `${from || '?'} → (none)`; qaRender();
  if (!id) { card.hidden = true; map?.select(null); rows.forEach(r => { r.classList.remove('is-selected'); r.removeAttribute('aria-current'); }); return; }
  rows.forEach(r => { const on = r.dataset.place === id; r.classList.toggle('is-selected', on); on ? r.setAttribute('aria-current', 'true') : r.removeAttribute('aria-current'); });
  const row = rows.find(r => r.dataset.place === id);
  map?.select(id);
  if (from === 'map' && row) {
    if (phone.matches) showCard(id, row); else row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
function showCard(id, row) {
  const el = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls; n.textContent = text; return n; };
  const link = el('a', 'mc-link', 'See in the register'); link.href = `#place-${id}`;
  link.addEventListener('click', e => { e.preventDefault(); row.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.querySelector('.reg-show')?.focus({ preventScroll: true }); });
  const close = el('button', 'mc-close', 'Close'); close.type = 'button'; close.setAttribute('aria-label', 'Close place card');
  close.addEventListener('click', () => select(null));
  card.replaceChildren(close, el('p', 'mc-name', row.querySelector('h4').textContent), el('p', 'mc-status', row.querySelector('.reg-word').textContent), link);
  card.hidden = false;
}

document.querySelector('.atlas-register').addEventListener('click', e => {
  const b = e.target.closest('button[data-show]'); if (!b) return;
  const id = b.dataset.show;
  select(id);
  map?.focus(id);
  if (phone.matches) document.querySelector('.atlas-map').scrollIntoView({ block: 'start', behavior: 'smooth' });
});

/* ---------- the map ---------- */
const MESSAGES = {
  nowebgl: "This browser can't draw the map (WebGL is unavailable). The register lists every place.",
  offline: "You're offline, so the map can't load. The register still works.",
  script: "The map software didn't load. The register lists every place.",
  timeout: "The map tiles didn't arrive in time. The register lists every place.",
  tiles: "The map tiles couldn't be loaded. The register lists every place.",
  style: "The map couldn't be drawn. The register lists every place.",
};

async function start() {
  stateEl.dataset.state = 'loading';
  msg.textContent = 'Loading the map…';
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light' ? 'dark' : 'light';
  // Relief: on by default on wide screens (measured: ~40 KB of terrain per view, no frame-rate cost on desktop),
  // off by default on phones to save data. The viewer's own choice wins.
  let relief = window.matchMedia('(min-width: 1024px)').matches;
  try { const v = localStorage.getItem('rupert-relief'); if (v != null) relief = v === '1'; } catch {}
  try {
    if (test === 'offline') { const e = new Error('offline'); e.reason = 'offline'; throw e; }
    if (test === 'nowebgl') { const e = new Error('nowebgl'); e.reason = 'nowebgl'; throw e; }
    map = await createMap(document.getElementById('map'), {
      base, theme, bounds: data.bounds, relief, touch: window.matchMedia('(pointer: coarse)').matches,
      tileUrlOverride: test === 'notiles' ? 'https://tiles.openfreemap.org/planet-does-not-exist' : null,
    });
    perf.ready = Math.round(performance.now() - perf.start);
    map.setMarkers(data.features.filter(visible));
    map.on('select', id => select(id, { from: 'map' }));
    map.on('trouble', t => { stateEl.dataset.state = 'notice'; msg.textContent = t; });
    stateEl.dataset.state = 'ready'; qaRender();
    msg.textContent = '';
    rows.forEach(r => { r.querySelector('.reg-show').hidden = false; });
    const tools = document.querySelector('.map-tools'); tools.hidden = false;
    const rb = document.getElementById('relief');
    rb.setAttribute('aria-pressed', String(relief));
    rb.addEventListener('click', () => {
      relief = !relief; rb.setAttribute('aria-pressed', String(relief)); map.setRelief(relief);
      try { localStorage.setItem('rupert-relief', relief ? '1' : '0'); } catch {}
    });
    const pre = location.hash.startsWith('#place-') && location.hash.slice(7);
    if (pre) { select(pre); map.focus(pre); }
  } catch (e) {
    perf.failed = e.reason || 'unknown';
    stateEl.dataset.state = 'failed'; qaRender();
    msg.textContent = MESSAGES[e.reason] || MESSAGES.tiles;
    console.warn('Rupert Atlas map:', e.reason || e);
  }
}

// Load the map after the register has painted, so a slow or failed map never delays the list.
if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 800 }); else setTimeout(start, 50);
