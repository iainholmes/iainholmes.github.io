import { validPoint } from './routing.js';

export const TRAFFIC_FRESH_MS = 5 * 60 * 1000;
export const TRAFFIC_COLORS = Object.freeze({
  normal: '#C98B4B', mild: '#DEA953', moderate: '#D47742',
  heavy: '#C36360', severe: '#C36360', closure: '#963D48', unknown: '#A9B3B8',
});
export function trafficAvailable(config, origin) {
  return config?.provider === 'mapbox' && /^pk\.[\w-]+\.[\w-]+$/.test(config.publicToken || '') && config.allowedOrigins?.includes(origin);
}
// Numeric boundaries are Atlas display bins, not invented measurements. Null stays unknown.
export function congestionLevel(value, category) {
  if(value === null) return 'unknown';
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100) {
    return value === 0 ? 'normal' : value < 40 ? 'mild' : value < 60 ? 'moderate' : value < 80 ? 'heavy' : 'severe';
  }
  return ({ low: 'normal', moderate: 'moderate', heavy: 'heavy', severe: 'severe' })[category] || 'unknown';
}
export function trafficProviderLabel(result) {
  if (!Number.isFinite(result.typicalSeconds)) return 'Live Traffic';
  const delta = Math.round((result.seconds - result.typicalSeconds) / 60);
  return 'Live Traffic · ' + (delta > 0 ? `+${delta} min vs typical` : delta < 0 ? `${delta} min vs typical` : 'Typical travel time');
}
export function parseTrafficRoute(data, fetchedAt = Date.now()) {
  const route = data?.routes?.[0], coords = route?.geometry?.coordinates, leg = route?.legs?.[0];
  // Atlas requests exactly two endpoints: one leg, with annotations indexed to the full geometry.
  if (data?.code !== 'Ok' || route?.geometry?.type !== 'LineString' || !Array.isArray(coords) || coords.length < 2 || coords.length > 100000 ||
      !coords.every(p => Array.isArray(p) && validPoint({ lng: p[0], lat: p[1] })) ||
      !Number.isFinite(route.duration) || route.duration < 0 || !Number.isFinite(route.distance) || route.distance < 0 || route.legs?.length !== 1) {
    throw Error('Live traffic returned no usable route.');
  }
  const count = coords.length - 1, annotation = leg.annotation || {};
  for (const key of ['congestion', 'congestion_numeric']) if (annotation[key] != null && (!Array.isArray(annotation[key]) || annotation[key].length !== count)) throw Error('Live traffic segment geometry did not match.');
  const levels = Array.from({ length: count }, (_, i) => congestionLevel(annotation.congestion_numeric?.[i], annotation.congestion?.[i]));
  const range = v => Number.isInteger(v.geometry_index_start) && Number.isInteger(v.geometry_index_end) && v.geometry_index_start >= 0 && v.geometry_index_end >= v.geometry_index_start && v.geometry_index_end < coords.length;
  for (const closure of leg.closures || []) {
    if (!range(closure)) throw Error('Live traffic closure geometry did not match.');
    for (let i = closure.geometry_index_start; i < closure.geometry_index_end; i++) levels[i] = 'closure';
  }
  const incidents = (leg.incidents || []).filter(range).map(v => ({
    coordinates: coords[v.geometry_index_start],
    description: String(v.description || v.type || 'Route incident').replaceAll('_', ' ').slice(0, 320),
    closed: v.closed === true || v.type === 'road_closure',
    start: v.geometry_index_start, end: v.geometry_index_end,
  }));
  for (const v of incidents.filter(v => v.closed)) for (let i = v.start; i < v.end; i++) levels[i] = 'closure';
  const features = [];
  for (let start = 0; start < count;) {
    let end = start + 1; while (end < count && levels[end] === levels[start]) end++;
    features.push({ type: 'Feature', properties: { status: 'planned', traffic: levels[start] }, geometry: { type: 'LineString', coordinates: coords.slice(start, end + 1) } });
    start = end;
  }
  return {
    feature: { type: 'Feature', properties: { status: 'planned' }, geometry: route.geometry }, features, incidents,
    traffic: true, fetchedAt, seconds: route.duration,
    typicalSeconds: Number.isFinite(route.duration_typical) && route.duration_typical >= 0 ? route.duration_typical : null,
    minutes: Math.max(1, Math.round(route.duration / 60)), miles: (route.distance / 1609.344).toFixed(1),
    unknownSegments: levels.filter(v => v === 'unknown').length,
  };
}
export async function trafficRoute(from, to, { config, origin, signal, request = fetch, now = Date.now } = {}) {
  if (!validPoint(from) || !validPoint(to)) throw Error('Check both locations.');
  if (!trafficAvailable(config, origin)) throw Error('Live traffic is not configured for this site.');
  const endpoints = [from, to].map(p => `${p.lng},${p.lat}`).join(';');
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${endpoints}`);
  url.search = new URLSearchParams({ access_token: config.publicToken, overview: 'full', geometries: 'geojson', steps: 'false', alternatives: 'false', depart_at: 'now', annotations: 'congestion,congestion_numeric,closure' });
  // Origin-only Referer is required by restricted public tokens; no route, query or address leaks via it.
  // Neither HTTP cache nor browser storage retains provider results.
  const response = await request(url.href, { signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'origin' });
  if (!response.ok) throw Error('Live traffic is temporarily unavailable.');
  return parseTrafficRoute(await response.json(), now());
}
