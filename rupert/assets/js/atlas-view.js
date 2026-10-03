import { setupLocation } from './location-view.js';
// Atlas page behaviour. The directory is complete without this file; this adds camera framing, the map, and
// selection kept in step between the two. The map is reached only through map/maplibre-provider.js.
import { frameFeatures, frameMap } from './core/framing.js';
import { createMap } from './map/maplibre-provider.js';

const base = document.body.dataset.base || '';
const data = JSON.parse(document.getElementById('atlas-data')?.textContent || '{"features":[],"bounds":null}');
const rows = [...document.querySelectorAll('.reg-row')];
const stateEl = document.getElementById('map-state');
const msg = document.getElementById('map-msg');
const card = document.getElementById('map-card');
const phone = window.matchMedia('(max-width: 759.98px)');
const params = new URLSearchParams(location.search);
const test = params.get('maptest'); // notiles | nowebgl | offline | nosize : failure drills
const perf = (window.__atlasPerf = { start: performance.now() });

let map = null;
let cameraScope = 'all';
let selectedId = null;
const workspace=document.querySelector('.atlas-body');
const directory=document.querySelector('.atlas-register');
const mapBox=document.querySelector('.atlas-map');
const driveOverlay=document.querySelector('.map-drive-overlay');
new ResizeObserver(()=>mapBox.style.setProperty('--map-overlay-height',Math.ceil(driveOverlay.getBoundingClientRect().height)+'px')).observe(driveOverlay);
function sizeWorkspace() { workspace.style.setProperty('--atlas-directory-height', Math.ceil(directory.getBoundingClientRect().height)+'px'); }
sizeWorkspace();
const directorySize=new ResizeObserver(sizeWorkspace); directorySize.observe(directory);
const canvasSize=new ResizeObserver(()=>map?.resize()); canvasSize.observe(mapBox);
function showWorkspace() { document.querySelector(compactDirectory.matches ? '.atlas-map' : '.atlas-register').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
const locationControls = setupLocation({ getMap: () => map, features: data.features, onClear: () => select(null) });

/* ---------- QA panel (?qa=1): what a tester on a phone needs to see ---------- */
// "ready" now means drawn: MapLibre's 'load' is reported separately, with the evidence that pixels reached
// the screen (sizes, WebGL, sources, rendered features). Tap the panel to shrink or expand it.
const qa = { on: params.get('qa') === '1', last: '—', diag: null };
let qaEl = null;
function geometry(selector) { const r=document.querySelector(selector).getBoundingClientRect();return `${Math.round(r.width)}×${Math.round(r.height)} at ${Math.round(r.x)},${Math.round(r.y)}`; }
function qaRender() {
  if (!qa.on) return;
  if (!qaEl) {
    qaEl = document.createElement('pre'); qaEl.className = 'qa-panel'; qaEl.setAttribute('aria-live', 'off');
    qaEl.addEventListener('click', () => qaEl.classList.toggle('is-compact'));
    document.body.append(qaEl);
  }
  const st = document.getElementById('map-state')?.dataset.state;
  const rel = document.getElementById('relief')?.getAttribute('aria-pressed');
  const d = map?.diagnostics?.() || qa.diag;
  const lines = [
    `map: ${st}${perf.failed ? ' (' + perf.failed + ')' : ''}${perf.ready ? ' · drawn ' + perf.ready + ' ms' : ''}`,
    `relief: ${rel ?? 'n/a'} · camera: ${cameraScope} · markers: ${data.features.length} · theme: ${d?.theme ?? pageTheme()}`,
    `viewport: ${innerWidth}×${innerHeight} @${devicePixelRatio}x · touch: ${matchMedia('(pointer: coarse)').matches}`,
    `last tap: ${qa.last}`,
    `Directory: ${geometry('.atlas-register')} · map: ${geometry('.atlas-map')}`,
    `Directory above map: ${document.querySelector('.atlas-register').getBoundingClientRect().bottom <= document.querySelector('.atlas-map').getBoundingClientRect().top}`,

  ];
  if (d) lines.push(
    `— map diagnostics —`,
    `load event: ${d.loadMs ?? '—'} ms · drawn: ${d.drawnMs ?? '—'} ms · frames ${d.frames} (${d.framesAfterLoad} after load)`,
    `container: ${d.container} · canvas css ${d.canvasCss} · backing ${d.canvasBacking} · ${d.canvasStyle}`,
    `webgl: ${d.webgl} · lost×${d.contextLost} restored×${d.contextRestored}`,
    `terrain: ${d.reliefVisible} · loaded: ${d.reliefLoaded}`,
    `source omt loaded: ${d.omtLoaded} · all tiles loaded: ${d.tilesLoaded} · zoom ${d.zoom}`,
    `features drawn: ${d.features} · ${Object.entries(d.perLayer || {}).map(([k, v]) => k + ' ' + v).join(', ') || 'none'}`,
    `controls: ${d.controls} · attribution: ${d.attribution}`,
    `errors: ${d.errors.length ? '\n  ' + d.errors.join('\n  ') : 'none'}`,
  );
  qaEl.textContent = lines.join('\n');
}
if (qa.on) { window.addEventListener('resize', () => qaRender()); setInterval(qaRender, 1000); }
function pageTheme() { return 'light'; }

/* ---------- Directory: selection; camera scopes are transient, never filters ---------- */
const catalog = document.querySelector('.directory-catalog');
const picker = document.getElementById('place-picker');
const compactDirectory = matchMedia('(max-width: 1023.98px)');
function directoryTreatment() { catalog.open = !compactDirectory.matches; }
directoryTreatment(); compactDirectory.addEventListener('change', directoryTreatment);
picker.addEventListener('change', () => { select(picker.value || null); if(picker.value) map?.focus(picker.value); });
const frameStatus = document.getElementById('frame-status');
const frameButtons = [...document.querySelectorAll('[data-frame]')];
function controlsReady(ready) {
  frameButtons.forEach(b => { b.disabled = !ready || !frameFeatures(data.features, data.regions, b.dataset.frame).length; });
  document.getElementById('relief').disabled = !ready;
  document.getElementById('recenter').disabled = !ready || !locationControls.hasHome();
  if(!ready) frameStatus.textContent='Camera controls become available when the map loads. Published history remains available below.';
}
controlsReady(false);
document.querySelector('.frame-menu').addEventListener('click', e => {
  const b=e.target.closest('[data-frame]'); if(!b || b.disabled) return;
  if(frameMap(map, data.features, data.regions, b.dataset.frame)) {
    cameraScope=b.dataset.frame;
    frameStatus.textContent=`Framed: ${b.textContent}. Every published place remains on the map and in the Directory.`;
    document.querySelectorAll('.frame-menu details').forEach(d=>{d.open=false;});
    document.querySelector('.frame-menu').open=false;
    showWorkspace(); qaRender();
  }
});
// Keep one disclosure open at a time; Escape returns keyboard focus to its summary.
const disclosures=[...document.querySelectorAll('.directory-controls > details, .reg-details')];
disclosures.forEach(d=>{
  d.addEventListener('toggle',()=>{if(d.open) disclosures.filter(x=>x!==d).forEach(x=>{x.open=false;});});
  d.addEventListener('keydown',e=>{if(e.key==='Escape'){d.open=false;d.querySelector('summary').focus();}});
});

function select(id, { from } = {}) {
  // Unknown hashes/picker values are empty state, never a fallback destination.
  if (!data.features.some(f => f.properties.id === id)) id = null;
  qa.last = id ? `${from || 'register'} → ${id}` : `${from || '?'} → (none)`; qaRender();
  selectedId = id; picker.value = id || '';
  card.hidden = true;
  if (!id) { locationControls.clear(); map?.select(null); rows.forEach(r => { r.classList.remove('is-selected'); r.removeAttribute('aria-current'); }); return; }
  rows.forEach(r => { const on = r.dataset.place === id; r.classList.toggle('is-selected', on); on ? r.setAttribute('aria-current', 'true') : r.removeAttribute('aria-current'); });
  const row = rows.find(r => r.dataset.place === id);
  map?.select(id);
  locationControls.select(id);
  if (from === 'map' && row) {
    if (phone.matches) showCard(id, row); else { catalog.open=true; row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
}
function showCard(id, row) {
  const el = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls; n.textContent = text; return n; };
  const link = el('a', 'mc-link', 'See in directory'); link.href = `#place-${id}`;
  link.addEventListener('click', e => { e.preventDefault(); catalog.open=true; row.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.querySelector('.reg-select')?.focus({ preventScroll: true }); });
  const close = el('button', 'mc-close', 'Close'); close.type = 'button'; close.setAttribute('aria-label', 'Close place card');
  close.addEventListener('click', e => { e.stopPropagation(); card.hidden = true; });
  const region=row.closest('.reg-group')?.dataset.region || '';
  const bottom=document.createElement('div');bottom.className='mc-bottom';bottom.append(link);
  if(region) bottom.append(el('span','mc-place-detail',region));
  card.replaceChildren(close, el('p', 'mc-name', row.querySelector('h4').textContent), el('p', 'mc-status', row.querySelector('.reg-word').textContent), bottom);
  card.hidden = false;
}

document.querySelector('.atlas-register').addEventListener('click', e => {
  const b = e.target.closest('button[data-show]'); if (!b) return;
  const id = b.dataset.show;
  select(id);
  map?.focus(id);
  showWorkspace();
});

/* ---------- the map ---------- */
const MESSAGES = {
  nowebgl: "This browser can't draw the map (WebGL is unavailable). The directory lists every place.",
  offline: "You're offline, so the map can't load. The directory still works.",
  script: "The map software didn't load. The directory lists every place.",
  timeout: "The map tiles didn't arrive in time. The directory lists every place.",
  tiles: "The map tiles couldn't be loaded. The directory lists every place.",
  style: "The map couldn't be drawn. The directory lists every place.",
  size: "The map couldn't be drawn on this screen. The directory lists every place.",
  blank: "The map loaded but nothing could be drawn. The directory lists every place.",
  lost: "The map stopped drawing (the browser released its graphics). Reload to try again; the directory lists every place.",
};

async function start() {
  stateEl.dataset.state = 'loading';
  msg.textContent = 'Loading the map…';
  const theme = pageTheme();
  // Relief: on by default on wide screens (measured: ~40 KB of terrain per view, no frame-rate cost on desktop),
  // off by default on phones to save data. The viewer's own choice wins.
  let relief = window.matchMedia('(min-width: 1024px)').matches;
  try { const v = localStorage.getItem('rupert-relief'); if (v != null) relief = v === '1'; } catch {}
  try {
    if (test === 'offline') { const e = new Error('offline'); e.reason = 'offline'; throw e; }
    if (test === 'nowebgl') { const e = new Error('nowebgl'); e.reason = 'nowebgl'; throw e; }
    // Drill for the first-RC iPhone bug: a map box with no height must fail visibly, never report "ready".
    if (test === 'nosize') Object.assign(document.getElementById('map').style, { bottom: 'auto', height: '0px' });
    map = await createMap(document.getElementById('map'), {
      base, theme, bounds: data.bounds, relief, touch: window.matchMedia('(pointer: coarse)').matches,
      tileUrlOverride: test === 'notiles' ? 'https://tiles.openfreemap.org/planet-does-not-exist' : null,
    });
    perf.ready = Math.round(performance.now() - perf.start);
    map.setMarkers(data.features);
    map.on('select', id => select(id, { from: 'map' }));
    map.on('trouble', t => { stateEl.dataset.state = 'notice'; msg.textContent = t; });
    map.on('lost', () => {
      // Safari can drop a WebGL context (memory pressure, backgrounding). Say so rather than leave a frozen or empty box.
      perf.failed = 'lost'; qa.diag = map.diagnostics(); stateEl.dataset.state = 'failed'; msg.textContent = MESSAGES.lost;
      controlsReady(false);
      card.hidden = true; locationControls.clear(); map.destroy(); map = null; qaRender();
    });
    stateEl.dataset.state = 'ready'; map.resize(); locationControls.ready(); qaRender();
    msg.textContent = '';
    controlsReady(true); frameStatus.textContent='Camera framing only; every published place stays in the Directory and on the map.';
    const rb = document.getElementById('relief');
    const reliefLabel = () => { rb.textContent = relief ? 'Relief on' : 'Relief off'; document.querySelector('.atlas-map').dataset.relief = String(relief); };
    reliefLabel();
    rb.setAttribute('aria-pressed', String(relief));
    rb.addEventListener('click', () => {
      relief = !relief; rb.setAttribute('aria-pressed', String(relief)); map.setRelief(relief); reliefLabel();
      try { localStorage.setItem('rupert-relief', relief ? '1' : '0'); } catch {}
    });
    const pre = location.hash.startsWith('#place-') && location.hash.slice(7);
    if (pre) { select(pre); if(selectedId) map.focus(selectedId); }
  } catch (e) {
    perf.failed = e.reason || 'unknown';
    qa.diag = e.diagnostics || null;
    stateEl.dataset.state = 'failed'; controlsReady(false); qaRender();
    msg.textContent = MESSAGES[e.reason] || MESSAGES.tiles;
    console.warn('Rupert Atlas map:', e.reason || e, e.message || '');
  }
}

// Load the map after the directory has painted, so a slow or failed map never delays the list.
if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 800 }); else setTimeout(start, 50);

// Workspace height is owned by CSS, independent of the masthead's document position.
