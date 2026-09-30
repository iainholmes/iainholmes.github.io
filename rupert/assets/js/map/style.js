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
    bg: '#D7DDD1', wood: '#E3DDBF', park: '#DDD9B8', parkLine: '#8F9269', grass: '#E6DDBE',
    water: '#AFC1C4', waterLine: '#6F8E98', waterText: '#3F5E68',
    road: '#FBF4E4', roadCase: '#C9B28E', major: '#EACB91', majorCase: '#B88430',
    path: '#3A322A', boundary: '#8C7B66',
    text: '#2E2822', textHalo: '#D7DDD1', town: '#221F1C',
    shadow: '#221F1C', highlight: '#FFF6E2',
  },
  dark: {
    bg: '#21363B', wood: '#18302F', park: '#1B3330', parkLine: '#4E6A58', grass: '#17292F',
    water: '#0B1820', waterLine: '#3F6A78', waterText: '#86A8B1',
    road: '#2B3D47', roadCase: '#1B2C35', major: '#5C4A2A', majorCase: '#8E6A2E',
    path: '#D8C8AA', boundary: '#5E6F76',
    text: '#EADCC3', textHalo: '#21363B', town: '#F3E8D2',
    shadow: '#000000', highlight: '#3A5563',
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
  return { version: 8, glyphs: TILES.glyphs, sources, layers, name: `Rupert Atlas ${theme}` };
}
