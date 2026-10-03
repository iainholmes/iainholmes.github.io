// The Atlas basemap: OpenMapTiles-schema vector tiles from OpenFreeMap, drawn in the Atlas palette.
// Provider-specific URLs live here and in maplibre-provider.js only. The UI never sees them.

export const TILES = {
  vector: 'https://tiles.openfreemap.org/planet',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  relief: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
};

export const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · ' +
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> · ' +
  'Data <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>';

const PALETTES = {
  light: {
    bg: '#E6EAE1', wood: '#CFD8CA', park: '#D8DFD1', parkLine: '#7D9180', grass: '#E3E7DC',
    water: '#AFC1C4', waterLine: '#6F8E98', waterText: '#3F5E68',
    road: '#F8F6EF', roadCase: '#C2C7BE', major: '#E3D5B9', majorCase: '#B28A49',
    path: '#3A322A', boundary: '#8E948D',
    text: '#2E2822', textHalo: '#E6EAE1', town: '#221F1C',
    shadow: '#221F1C', highlight: '#F3EFE5',
  },
  traffic: {
    bg: '#1D2A3A', wood: '#283D37', park: '#30443B', parkLine: '#718779', grass: '#28372F',
    water: '#263F50', waterLine: '#587B8B', waterText: '#9EBCC7',
    road: '#65727C', roadCase: '#273544', major: '#89919B', majorCase: '#354454',
    path: '#B4AD97', boundary: '#72818A',
    text: '#C7CFD1', textHalo: '#1D2A3A', town: '#E1DDD3',
    shadow: '#111E2A', highlight: '#7D8984',
  },
};

const FONT = ['Noto Sans Regular'];
const FONT_ITALIC = ['Noto Sans Italic'];

export function atlasStyle(theme = 'light', { relief = false } = {}) {
  const c = PALETTES[theme] || PALETTES.light;
  const sources = {
    omt: { type: 'vector', url: TILES.vector, attribution: ATTRIBUTION },
  };
  // Relief is always defined but only fetched while visible, so turning it off costs nothing.
  sources.relief = { type: 'raster-dem', tiles: TILES.relief, encoding: 'terrarium', tileSize: 256, maxzoom: 13,
    attribution: 'Relief: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Terrain Tiles</a>' };
  // Widths by zoom; `add` widens a casing by a constant (zoom may only appear at the top of an expression).
  const roadWidth = (base, add = 0) => ['interpolate', ['exponential', 1.5], ['zoom'], 8, base * 0.3 + add, 12, base + add, 16, base * 5 + add];
  const layers = [
    { id: 'bg', type: 'background', paint: { 'background-color': c.bg } },
    { id: 'wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', ['get', 'class'], 'wood'],
      paint: { 'fill-color': c.wood, 'fill-opacity': 0.9 } },
    { id: 'grass', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['grass', 'farmland']]],
      paint: { 'fill-color': c.grass, 'fill-opacity': 0.6 } },
    { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park',
      paint: { 'fill-color': c.park, 'fill-opacity': 0.75 } },
    { id: 'park-line', type: 'line', source: 'omt', 'source-layer': 'park', minzoom: 9,
      paint: { 'line-color': c.parkLine, 'line-width': 1, 'line-dasharray': [3, 2], 'line-opacity': 0.7 } },
    { id: 'relief', type: 'hillshade', source: 'relief', layout: { visibility: relief ? 'visible' : 'none' },
      paint: { 'hillshade-shadow-color': c.shadow, 'hillshade-highlight-color': c.highlight,
        'hillshade-accent-color': c.shadow, 'hillshade-exaggeration': 0.85 } },
    { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': c.water } },
    { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway',
      paint: { 'line-color': c.waterLine, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 13, 1.4, 16, 3] } },
    { id: 'boundary', type: 'line', source: 'omt', 'source-layer': 'boundary', filter: ['<=', ['get', 'admin_level'], 4],
      paint: { 'line-color': c.boundary, 'line-width': 1, 'line-dasharray': [4, 2, 1, 2], 'line-opacity': 0.6 } },
    { id: 'road-minor-case', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 11,
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary', 'secondary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.roadCase, 'line-width': roadWidth(1.1, 1) } },
    { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary', 'secondary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.road, 'line-width': roadWidth(1.1) } },
    { id: 'road-major-case', type: 'line', source: 'omt', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.majorCase, 'line-width': roadWidth(1.8, 1.2) } },
    { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.major, 'line-width': roadWidth(1.8) } },
    // Trails: the thing an Atlas for walking must make legible. Ink, dashed, heavier than roads' casing.
    { id: 'trail', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 11,
      filter: ['any', ['==', ['get', 'class'], 'path'], ['==', ['get', 'class'], 'track']],
      paint: { 'line-color': c.path, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1, 14, 2, 17, 3.2],
        'line-dasharray': [2, 1.2] } },
    { id: 'water-name', type: 'symbol', source: 'omt', 'source-layer': 'water_name', minzoom: 10,
      layout: { 'text-field': ['get', 'name'], 'text-font': FONT_ITALIC, 'text-size': 12 },
      paint: { 'text-color': c.waterText, 'text-halo-color': c.textHalo, 'text-halo-width': 1.2 } },
    { id: 'trail-name', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14,
      filter: ['in', ['get', 'class'], ['literal', ['path', 'track']]],
      layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FONT_ITALIC, 'text-size': 11.5 },
      paint: { 'text-color': c.path, 'text-halo-color': c.textHalo, 'text-halo-width': 1.4 } },
    { id: 'place-town', type: 'symbol', source: 'omt', 'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
      layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-transform': 'uppercase', 'text-letter-spacing': 0.12,
        'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 12, 13] },
      paint: { 'text-color': c.town, 'text-halo-color': c.textHalo, 'text-halo-width': 1.6 } },
    { id: 'place-village', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 11,
      filter: ['in', ['get', 'class'], ['literal', ['village', 'hamlet', 'suburb', 'neighbourhood']]],
      layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 11.5 },
      paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.4 } },
  ];
  // Road labels are added only while viewing traffic; the accepted light cartography is unchanged.
  if(theme==='traffic') layers.push({ id:'traffic-road-name',type:'symbol',source:'omt','source-layer':'transportation_name',minzoom:11,
    filter:['in',['get','class'],['literal',['motorway','trunk','primary','secondary','tertiary','minor']]],
    layout:{'symbol-placement':'line','text-field':['coalesce',['get','name'],['get','ref']],'text-font':FONT,'text-size':11},
    paint:{'text-color':c.text,'text-halo-color':c.textHalo,'text-halo-width':1.5} });
  return { version: 8, glyphs: TILES.glyphs, sources, layers, name: 'Rupert Atlas' };
}
