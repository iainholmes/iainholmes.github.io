// The only file that knows about MapLibre. It implements the Atlas map-provider interface:
//
//   const map = await createMap(el, { base, theme, bounds, relief, tileUrlOverride })
//   map.setMarkers(features)       // GeoJSON Features: properties { id, name, status: recommended|walked|planned|register }
//   map.setRoutes(features)        // LineStrings: properties { id, status: walked|suggested }
//   map.fit(bounds) · map.focus(id) · map.select(id) · map.setRelief(bool)
//   map.on('select', fn(id)) · map.on('trouble', fn(message)) · map.destroy()
//
// createMap rejects with an Error whose .reason is one of: nowebgl · offline · script · style · timeout · tiles.
// Swapping MapLibre, tile hosts or adding a routing layer happens here, not in the UI.

import { atlasStyle } from './style.js';

const VERSION = '5.24.0';
const LOAD_TIMEOUT_MS = 12000;

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function fail(reason, message) { const e = new Error(message); e.reason = reason; return e; }

let scriptPromise = null;
function loadLibrary(base) {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = `${base}vendor/maplibre-gl-${VERSION}/maplibre-gl.css`;
      document.head.append(css);
      const s = document.createElement('script');
      s.src = `${base}vendor/maplibre-gl-${VERSION}/maplibre-gl.js`;
      s.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(fail('script', 'Map library did not initialise'));
      s.onerror = () => reject(fail('script', 'Map library failed to load'));
      document.head.append(s);
    });
  }
  return scriptPromise;
}

/* Marker shapes, drawn once on canvas. Shape carries the state, colour only supports it. */
function markerImage(kind, dpr) {
  const S = 26 * dpr, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); const m = S / 2; const r = 8.2 * dpr;
  const INK = '#221F1C', PAPER = '#EFE2C8', OCHRE = '#B88430', PINE = '#3E422A', SLATE = '#40616A';
  g.lineJoin = 'round';
  if (kind === 'recommended' || kind === 'recommended-sel') {
    g.beginPath(); g.arc(m, m, r + (kind.endsWith('sel') ? 2 * dpr : 0), 0, Math.PI * 2);
    g.fillStyle = OCHRE; g.fill(); g.lineWidth = 2.4 * dpr; g.strokeStyle = INK; g.stroke();
  } else if (kind === 'walked' || kind === 'walked-sel') {
    g.beginPath(); g.arc(m, m, r + (kind.endsWith('sel') ? 2 * dpr : 0), 0, Math.PI * 2);
    g.fillStyle = PINE; g.fill(); g.lineWidth = 2.2 * dpr; g.strokeStyle = PAPER; g.stroke();
    g.beginPath(); g.moveTo(m - 4 * dpr, m); g.lineTo(m - 1 * dpr, m + 3.4 * dpr); g.lineTo(m + 4.6 * dpr, m - 3.6 * dpr);
    g.lineWidth = 2.4 * dpr; g.strokeStyle = PAPER; g.stroke();
  } else if (kind === 'planned' || kind === 'planned-sel') {
    const q = r + 1.5 * dpr + (kind.endsWith('sel') ? 2 * dpr : 0);
    g.beginPath(); g.moveTo(m, m - q); g.lineTo(m + q, m); g.lineTo(m, m + q); g.lineTo(m - q, m); g.closePath();
    g.fillStyle = PAPER; g.fill(); g.lineWidth = 2.6 * dpr; g.strokeStyle = SLATE; g.stroke();
  } else { // register: small ink ring
    g.beginPath(); g.arc(m, m, r * 0.62 + (kind.endsWith('sel') ? 2 * dpr : 0), 0, Math.PI * 2);
    g.fillStyle = PAPER; g.fill(); g.lineWidth = 2 * dpr; g.strokeStyle = INK; g.stroke();
  }
  return { width: S, height: S, data: g.getImageData(0, 0, S, S).data };
}

const TAP_RADIUS = 22; // px each side: a 44×44 target around every pin, as iOS guidelines ask

export async function createMap(el, { base = '', theme = 'light', bounds, relief = false, tileUrlOverride = null, touch = false } = {}) {
  if (!hasWebGL()) throw fail('nowebgl', 'WebGL unavailable');
  if (navigator.onLine === false) throw fail('offline', 'Offline');
  const maplibregl = await loadLibrary(base);

  const style = atlasStyle(theme, { relief });
  if (tileUrlOverride) style.sources.omt.url = tileUrlOverride;

  const map = new maplibregl.Map({
    container: el, style, bounds, fitBoundsOptions: { padding: 48 },
    // On touch screens the map sits inside a scrolling page: one finger scrolls the page, two move the map.
    attributionControl: false, cooperativeGestures: touch, dragRotate: false, pitchWithRotate: false,
    maxZoom: 17, minZoom: 5,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');

  const handlers = { select: [], trouble: [] };
  const emit = (t, v) => handlers[t].forEach(fn => fn(v));

  await new Promise((resolve, reject) => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; reject(fail('timeout', 'Map did not finish loading')); } }, LOAD_TIMEOUT_MS);
    map.once('load', () => { if (!done) { done = true; clearTimeout(t); resolve(); } });
    map.on('error', e => {
      const text = String(e?.error?.message || '') + ' ' + String(e?.error?.url || '');
      if (!done && /^layers\[|^sources\.|style/i.test(String(e?.error?.message || ''))) {
        done = true; clearTimeout(t); reject(fail('style', `Map style rejected: ${e.error.message}`));
      } else if (!done && (e?.sourceId === 'omt' || /\/planet\b/.test(text) || (tileUrlOverride && text.includes(tileUrlOverride)))) {
        done = true; clearTimeout(t); reject(fail('tiles', 'Map tiles failed to load'));
      } else if (done) {
        emit('trouble', 'Some map tiles failed to load.');
      }
    });
  }).catch(err => { map.remove(); throw err; });

  const dpr = Math.min(3, Math.ceil(window.devicePixelRatio || 1));
  for (const k of ['recommended', 'walked', 'planned', 'register']) {
    map.addImage(`m-${k}`, markerImage(k, dpr), { pixelRatio: dpr });
    map.addImage(`m-${k}-sel`, markerImage(`${k}-sel`, dpr), { pixelRatio: dpr });
  }
  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource('routes', { type: 'geojson', data: empty });
  map.addSource('marks', { type: 'geojson', data: empty, promoteId: 'id' });
  map.addLayer({ id: 'route-line', type: 'line', source: 'routes',
    paint: { 'line-color': '#1E3547', 'line-width': 3, 'line-dasharray': ['case', ['==', ['get', 'status'], 'walked'], ['literal', [1, 0]], ['literal', [2, 1.2]]] } });
  const statusOrder = ['match', ['get', 'status'], 'recommended', 3, 'walked', 2, 'planned', 1, 0];
  map.addLayer({ id: 'marks', type: 'symbol', source: 'marks',
    layout: {
      'icon-image': ['concat', 'm-', ['get', 'status']], 'icon-allow-overlap': true, 'symbol-sort-key': ['-', 0, statusOrder],
      'text-field': ['step', ['zoom'], '', 9, ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 12.5,
      'text-offset': [1.1, 0], 'text-anchor': 'left', 'text-optional': true,
    },
    paint: { 'text-color': theme === 'dark' ? '#EADCC3' : '#221F1C', 'text-halo-color': theme === 'dark' ? '#13232C' : '#EFE2C8', 'text-halo-width': 1.6 } });
  map.addLayer({ id: 'marks-sel', type: 'symbol', source: 'marks', filter: ['==', ['get', 'id'], ''],
    layout: { 'icon-image': ['concat', 'm-', ['get', 'status'], '-sel'], 'icon-allow-overlap': true, 'icon-size': 1.25 } });

  // Hit-test a 44×44 box around the tap rather than the drawn 20px icon, and take the nearest pin.
  map.on('click', e => {
    const { x, y } = e.point;
    const hits = map.queryRenderedFeatures([[x - TAP_RADIUS, y - TAP_RADIUS], [x + TAP_RADIUS, y + TAP_RADIUS]], { layers: ['marks'] });
    if (!hits.length) { emit('select', null); return; }
    const ranked = hits.map(f => { const p = map.project(f.geometry.coordinates); return { f, p, d: (p.x - x) ** 2 + (p.y - y) ** 2 }; })
      .sort((a, b) => a.d - b.d);
    // Two pins drawn almost on top of each other (e.g. Occoneechee and the Riverwalk at the regional view):
    // a finger can't choose between them, so zoom in on the pair instead of guessing.
    if (ranked.length > 1 && Math.hypot(ranked[0].p.x - ranked[1].p.x, ranked[0].p.y - ranked[1].p.y) < 16 && map.getZoom() < 15) {
      const pts = ranked.filter(r => Math.hypot(r.p.x - ranked[0].p.x, r.p.y - ranked[0].p.y) < 16).map(r => r.f.geometry.coordinates);
      const lngs = pts.map(c => c[0]), lats = pts.map(c => c[1]);
      map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 90, maxZoom: 15, duration: 600 });
      return;
    }
    emit('select', ranked[0].f.properties.id);
  });
  map.on('mouseenter', 'marks', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'marks', () => { map.getCanvas().style.cursor = ''; });

  let marks = [];
  const api = {
    raw: map,
    setMarkers(features) { marks = features; map.getSource('marks').setData({ type: 'FeatureCollection', features }); },
    setRoutes(features) { map.getSource('routes').setData({ type: 'FeatureCollection', features }); },
    fit(b, opts = {}) { map.fitBounds(b, { padding: 48, duration: 600, ...opts }); },
    select(id) { map.setFilter('marks-sel', ['==', ['get', 'id'], id || '']); },
    focus(id) {
      const f = marks.find(m => m.properties.id === id); if (!f) return;
      api.select(id);
      map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 11), duration: 700 });
    },
    setRelief(on) { map.setLayoutProperty('relief', 'visibility', on ? 'visible' : 'none'); },
    on(type, fn) { handlers[type]?.push(fn); return api; },
    destroy() { map.remove(); },
  };
  return api;
}
