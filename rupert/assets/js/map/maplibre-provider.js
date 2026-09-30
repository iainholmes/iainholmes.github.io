// The only file that knows about MapLibre. It implements the Atlas map-provider interface:
//
//   const map = await createMap(el, { base, theme, bounds, relief, tileUrlOverride })
//   map.setMarkers(features)       // GeoJSON Features: properties { id, name, status: recommended|walked|planned|register }
//   map.setRoutes(features)        // LineStrings: properties { id, status: walked|suggested }
//   map.fit(bounds) · map.focus(id) · map.select(id) · map.setRelief(bool)
//   map.on('select', fn(id)) · map.on('trouble', fn(message)) · map.on('lost', fn()) · map.destroy()
//   map.diagnostics()              // what the ?qa=1 panel shows: sizes, WebGL, sources, rendered features, errors
//
// createMap resolves only once the map has actually drawn: the container and canvas have a size and
// basemap features are on screen. MapLibre's own 'load' event is not enough (it fires even when the map
// is drawing into a zero-height box, which is how the first iPhone build went blank while reporting "ready").
// It rejects with an Error whose .reason is one of:
//   nowebgl · offline · script · style · timeout · tiles · size (no room to draw) · blank (loaded, nothing drawn) · lost (WebGL context lost)
// The rejection carries .diagnostics for the QA panel.
// Swapping MapLibre, tile hosts or adding a routing layer happens here, not in the UI.

import { atlasStyle } from './style.js';

const VERSION = '5.24.0';
const LOAD_TIMEOUT_MS = 12000;   // style + first tiles
const RENDER_TIMEOUT_MS = 10000; // after 'load', until basemap features are actually on screen

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
    // The stylesheet is awaited too, so MapLibre measures its container after the final layout.
    // It goes in before the Atlas stylesheet, so the Atlas's own rules win any tie.
    const cssReady = new Promise(resolve => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = `${base}vendor/maplibre-gl-${VERSION}/maplibre-gl.css`;
      css.onload = css.onerror = () => resolve();
      const first = document.head.querySelector('link[rel="stylesheet"]');
      first ? first.before(css) : document.head.append(css);
    });
    const jsReady = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${base}vendor/maplibre-gl-${VERSION}/maplibre-gl.js`;
      s.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(fail('script', 'Map library did not initialise'));
      s.onerror = () => reject(fail('script', 'Map library failed to load'));
      document.head.append(s);
    });
    scriptPromise = Promise.all([jsReady, cssReady]).then(([lib]) => lib);
  }
  return scriptPromise;
}

/* Marker shapes, drawn once on canvas. Shape carries the state, colour only supports it. */
function markerImage(kind, dpr) {
  const S = 26 * dpr, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); const m = S / 2; const r = 8.2 * dpr;
  const INK = kind.endsWith('sel') ? '#C98B4B' : '#1D2A3A', PAPER = '#F3EFE5', OCHRE = '#C98B4B', PINE = '#34483B', SLATE = kind.endsWith('sel') ? '#C98B4B' : '#40616A';
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

export async function createMap(el, { base = '', theme = 'light', bounds, relief = false, tileUrlOverride = null, touch = false, travel = false } = {}) {
  if (!hasWebGL()) throw fail('nowebgl', 'WebGL unavailable');
  if (navigator.onLine === false) throw fail('offline', 'Offline');
  const maplibregl = await loadLibrary(base);

  const style = atlasStyle(theme, { relief });
  if(travel){const colors={bg:'#E5E0D5',wood:'#D9DFC9',grass:'#E6E6D6',park:'#CED8C4',water:'#AEC6D0'};for(const layer of style.layers){if(layer.id==='bg')layer.paint['background-color']=colors.bg;else if(colors[layer.id])layer.paint['fill-color']=colors[layer.id];}}
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

  const handlers = { select: [], trouble: [], lost: [] };
  const emit = (t, v) => handlers[t].forEach(fn => fn(v));

  /* ---- instrumentation: kept small, always on, read by diagnostics() ---- */
  const t0 = performance.now();
  const since = () => Math.round(performance.now() - t0);
  const diag = { theme, loadMs: null, drawnMs: null, frames: 0, framesAfterLoad: 0, resizes: 0, contextLost: 0, contextRestored: 0, errors: [] };
  const logError = (text) => { diag.errors.push(`${since()}ms ${text}`.slice(0, 160)); if (diag.errors.length > 8) diag.errors.shift(); };
  map.on('render', () => { diag.frames++; if (diag.loadMs != null) diag.framesAfterLoad++; });
  map.on('resize', () => { diag.resizes++; });
  map.on('webglcontextlost', () => { diag.contextLost++; logError('WebGL context lost'); emit('lost'); });
  map.on('webglcontextrestored', () => { diag.contextRestored++; logError('WebGL context restored'); });
  const basemapLayers = style.layers.filter(l => l.source === 'omt').map(l => l.id);
  const canvasOk = () => { const c = map.getCanvas(); return el.clientWidth > 0 && el.clientHeight > 0 && c.width > 0 && c.height > 0 && c.getBoundingClientRect().height > 0; };
  const drawnFeatures = () => { try { return map.queryRenderedFeatures({ layers: basemapLayers }).length; } catch { return -1; } };
  const glLost = () => { try { return !!map.painter?.context?.gl?.isContextLost?.(); } catch { return false; } };
  const withDiag = (err) => { err.diagnostics = diagnostics(); return err; };

  // Stage 1: MapLibre's 'load' (style parsed, first tiles in).
  await new Promise((resolve, reject) => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; reject(fail('timeout', 'Map did not finish loading')); } }, LOAD_TIMEOUT_MS);
    map.once('load', () => { if (!done) { done = true; clearTimeout(t); diag.loadMs = since(); resolve(); } });
    map.on('error', e => {
      const message = String(e?.error?.message || e?.message || 'error');
      const text = message + ' ' + String(e?.error?.url || '');
      logError(`${e?.sourceId ? e.sourceId + ': ' : ''}${message}`);
      if (!done && /^layers\[|^sources\.|style/i.test(message)) {
        done = true; clearTimeout(t); reject(fail('style', `Map style rejected: ${message}`));
      } else if (!done && (e?.sourceId === 'omt' || /\/planet\b/.test(text) || (tileUrlOverride && text.includes(tileUrlOverride)))) {
        done = true; clearTimeout(t); reject(fail('tiles', 'Map tiles failed to load'));
      } else if (done) {
        emit('trouble', e?.sourceId === 'relief' ? 'Terrain tiles could not load; relief is unavailable.' : 'Some map tiles failed to load.');
      }
    });
  }).catch(err => { withDiag(err); map.remove(); throw err; });

  // Stage 2: proof that something is on screen. The container and canvas must have a real size, the WebGL
  // context must be alive, and the basemap must have features in view. If the box has no size, ask MapLibre
  // to re-measure; if it still has none, or everything loads and nothing is drawn, fail with a reason.
  if (!canvasOk()) map.resize();
  await new Promise((resolve, reject) => {
    let done = false, pending = false;
    const finish = (err) => {
      if (done) return; done = true; clearTimeout(t); map.off('render', onRender); map.off('idle', onIdle);
      err ? reject(err) : resolve();
    };
    const check = (final) => {
      if (done) return;
      if (glLost()) return finish(fail('lost', 'WebGL context lost'));
      if (!canvasOk()) { map.resize(); if (final) finish(fail('size', `Map container has no size (${el.clientWidth}×${el.clientHeight})`)); return; }
      const n = drawnFeatures();
      if (n > 0 && diag.framesAfterLoad > 0) { diag.drawnMs = since(); return finish(); }
      if (final) finish(fail('blank', 'Map loaded but no basemap features were drawn'));
    };
    // 'render' fires every frame while loading; check at most every 250 ms. 'idle' means everything has settled.
    const onRender = () => { if (pending) return; pending = true; setTimeout(() => { pending = false; check(false); }, 250); };
    const onIdle = () => check(true);
    const t = setTimeout(() => check(true), RENDER_TIMEOUT_MS);
    map.on('render', onRender); map.on('idle', onIdle);
    map.triggerRepaint();
  }).catch(err => { withDiag(err); map.remove(); throw err; });

  const dpr = Math.min(3, Math.ceil(window.devicePixelRatio || 1));
  for (const k of ['recommended', 'walked', 'planned', 'register']) {
    map.addImage(`m-${k}`, markerImage(k, dpr), { pixelRatio: dpr });
    map.addImage(`m-${k}-sel`, markerImage(`${k}-sel`, dpr), { pixelRatio: dpr });
  }
  const empty = { type: 'FeatureCollection', features: [] };
  map.addSource('routes', { type: 'geojson', data: empty });
  map.addSource('marks', { type: 'geojson', data: empty, promoteId: 'id' });
  map.addLayer({ id: 'route-halo', type: 'line', source: 'routes', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#F3EFE5', 'line-width': travel ? 7 : 6, 'line-opacity': 0.9 } });
  map.addLayer({ id: 'route-line', type: 'line', source: 'routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#C98B4B', 'line-width': travel ? 3 : 3, 'line-opacity': 0.95 } });
  if(travel){map.setFilter('route-halo',['==',['get','mode'],'drive']);map.setFilter('route-line',['==',['get','mode'],'drive']);for(const [mode,color,dash] of [['air','#40616A',[5,3]],['ferry','#47604D',[2,2]],['rail','#1D2A3A',[1,2]],['walk','#C98B4B',[1,1]]])map.addLayer({id:'transit-'+mode,type:'line',source:'routes',filter:['==',['get','mode'],mode],paint:{'line-color':color,'line-width':2.5,'line-dasharray':dash}});}
  const statusOrder = ['match', ['get', 'status'], 'recommended', 3, 'walked', 2, 'planned', 1, 0];
  map.addLayer({ id: 'marks', type: 'symbol', source: 'marks',
    layout: {
      'icon-image': ['concat', 'm-', ['get', 'status']], 'icon-allow-overlap': true, 'symbol-sort-key': ['-', 0, statusOrder],
      'text-field': '', 'text-size': 12.5,
      'text-offset': [1.1, 0], 'text-anchor': 'left', 'text-optional': true,
    },
    paint: { 'text-color': theme === 'dark' ? '#EADCC3' : '#221F1C', 'text-halo-color': theme === 'dark' ? '#13232C' : '#F3EFE5', 'text-halo-width': 1.6 } });
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

  function diagnostics() {
    const c = (() => { try { return map.getCanvas(); } catch { return null; } })();
    const gl = (() => { try { return map.painter?.context?.gl || null; } catch { return null; } })();
    const cs = (n) => { if (!n) return 'missing'; const s = getComputedStyle(n); return `${s.display}/${s.visibility}/op${s.opacity}`; };
    const ctrl = el.querySelector('.maplibregl-ctrl-top-right'), attrib = el.querySelector('.maplibregl-ctrl-attrib');
    const box = (n) => { if (!n) return 'missing'; const r = n.getBoundingClientRect(); return `${Math.round(r.width)}×${Math.round(r.height)}`; };
    const perLayer = {};
    try { for (const f of map.queryRenderedFeatures()) perLayer[f.layer.id] = (perLayer[f.layer.id] || 0) + 1; } catch {}
    let tilesLoaded = null, omtLoaded = null;
    try { tilesLoaded = map.areTilesLoaded(); omtLoaded = map.isSourceLoaded('omt'); } catch {}
    return {
      ...diag, errors: [...diag.errors],
      container: `${el.clientWidth}×${el.clientHeight} (${getComputedStyle(el).position})`,
      canvasCss: c ? (r => `${Math.round(r.width)}×${Math.round(r.height)}`)(c.getBoundingClientRect()) : 'missing',
      canvasBacking: c ? `${c.width}×${c.height}` : 'missing',
      canvasStyle: cs(c),
      webgl: gl ? `${typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl1'} · lost ${gl.isContextLost()} · maxTex ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}` : 'none',
      omtLoaded, tilesLoaded,
      features: Object.values(perLayer).reduce((a, b) => a + b, 0),
      perLayer,
      controls: `${box(ctrl)} ${cs(ctrl)}`,
      attribution: `${box(attrib)} ${cs(attrib)}`,
      reliefVisible: map.getLayoutProperty('relief', 'visibility'), reliefLoaded: map.isSourceLoaded('relief'),
      zoom: (() => { try { return +map.getZoom().toFixed(2); } catch { return null; } })(),
    };
  }

  let marks = [], homeMarker = null, homePoint = null;
  // Our labels use the self-hosted reading face, independently of third-party tile glyphs.
  const labelLayer=document.createElement('div');labelLayer.className='atlas-label-layer';labelLayer.setAttribute('aria-hidden','true');el.append(labelLayer);
  let labelNodes=[],selectedLabel=null;
  function positionLabels(){const occupied=[];for(const {feature,node} of [...labelNodes].sort((a,b)=>Number(b.feature.properties.id===selectedLabel)-Number(a.feature.properties.id===selectedLabel))){const point=map.project(feature.geometry.coordinates);node.style.left=(point.x+14)+'px';node.style.top=point.y+'px';const width=node.offsetWidth,height=node.offsetHeight;
    const rect={x:point.x+14,y:point.y-height/2,width,height};const fits=map.getZoom()>=9&&rect.x>=0&&rect.y>=0&&rect.x+width<el.clientWidth&&rect.y+height<el.clientHeight&&!occupied.some(b=>rect.x<b.x+b.width&&rect.x+width>b.x&&rect.y<b.y+b.height&&rect.y+height>b.y);
    node.style.visibility=fits?'visible':'hidden';if(fits)occupied.push(rect);
  }}
  map.on('move',positionLabels);map.on('resize',positionLabels);
  const duration = n => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : n;
  const api = {
    raw: map,
    setMarkers(features) { marks = features; map.getSource('marks').setData({ type: 'FeatureCollection', features });labelLayer.replaceChildren();labelNodes=features.map(feature=>{const node=document.createElement('span');node.textContent=feature.properties.name;labelLayer.append(node);return {feature,node};});positionLabels(); },
    setRoutes(features) { map.getSource('routes').setData({ type: 'FeatureCollection', features }); },
    fit(b, opts = {}) { map.fitBounds(b, { padding: 48, duration: duration(600), ...opts }); },
    select(id) { selectedLabel=id;map.setFilter('marks-sel', ['==', ['get', 'id'], id || '']);positionLabels(); },
    focus(id) {
      const f = marks.find(m => m.properties.id === id); if (!f) return;
      api.select(id);
      map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 11), duration: duration(700) });
    },
    setRelief(on) { map.setLayoutProperty('relief', 'visibility', on ? 'visible' : 'none'); map.triggerRepaint(); },
    setHome(point) {
      homePoint = point;
      homeMarker?.remove(); homeMarker = null;
      if (!point) return;
      const icon = document.createElement('div'); icon.className = 'home-marker'; icon.title = 'Home';
      icon.setAttribute('aria-label','Home origin'); icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v9h-6v-6h-4v6H4Z"/></svg>';
      homeMarker = new maplibregl.Marker({ element: icon }).setLngLat([point.lng, point.lat]).addTo(map);
    },
    centerHome() { if (homePoint) map.easeTo({center:[homePoint.lng,homePoint.lat],zoom:10,duration:duration(600)}); else api.fit(bounds); },
    on(type, fn) { handlers[type]?.push(fn); return api; },
    diagnostics,
    destroy() { labelLayer.remove();map.remove(); },
  };
  return api;
}
