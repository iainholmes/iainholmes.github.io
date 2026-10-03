import { validPoint } from './routing.js';

// Orbis v3 reports affected sections, not observed free-flow coverage of every road.
// Leave unannotated geometry unknown; use only the provider's reported delay magnitude.
const rank = { unknown: 0, mild: 1, moderate: 2, heavy: 3, closure: 4 };
const names = { accident: 'Crash', brokenDownVehicle: 'Broken-down vehicle', dangerousConditions: 'Dangerous conditions', flooding: 'Flooding', fog: 'Fog', ice: 'Ice', jam: 'Traffic jam', laneClosed: 'Lane closed', rain: 'Rain', roadClosed: 'Road closed', roadWorks: 'Road works', wind: 'Wind', unknown: 'Route incident' };
export function tomtomSeverity(section) {
  if (section.iconCategory === 'roadClosed') return 'closure';
  return ({ minor: 'mild', moderate: 'moderate', major: 'heavy' })[section.delayMagnitude] || 'unknown';
}
export function parseTomtomTrafficRoute(data, fetchedAt = Date.now()) {
  const route = data?.routes?.[0], geometry = route?.legs?.[0]?.path, coords = geometry?.coordinates, summary = route?.summary;
  if (route?.legs?.length !== 1 || geometry?.type !== 'LineString' || !Array.isArray(coords) || coords.length < 2 || coords.length > 100000 ||
      !coords.every(p => Array.isArray(p) && p.length === 2 && validPoint({ lng: p[0], lat: p[1] })) ||
      !Number.isFinite(summary?.travelDurationInSeconds) || summary.travelDurationInSeconds < 0 || !Number.isFinite(summary?.lengthInMeters) || summary.lengthInMeters < 0) {
    throw Error('Live traffic returned no usable route.');
  }
  const sections = route.sections?.traffic ?? [];
  if (!Array.isArray(sections) || sections.length > 10000) throw Error('Live traffic segment geometry did not match.');
  const levels = Array(coords.length - 1).fill('unknown'), incidents = [], seen = new Set();
  for (const section of sections) {
    const start = section?.startPathIndex, end = section?.endPathIndex;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end >= coords.length) throw Error('Live traffic segment geometry did not match.');
    const level = tomtomSeverity(section);
    for (let i = start; i < end; i++) if (rank[level] > rank[levels[i]]) levels[i] = level;
    const incidentKey = section.eventId || JSON.stringify([start, end, section.iconCategory]);
    if (!seen.has(incidentKey)) {
      seen.add(incidentKey);
      const delay = section.delayDurationInSeconds;
      const duration = Number.isFinite(delay) && delay > 0 ? (delay < 60 ? 'under 1 min delay' : `${Math.round(delay / 60)} min delay`) : '';
      incidents.push({ coordinates: coords[start], start, end, closed: level === 'closure', description: [names[section.iconCategory] || 'Route incident', duration].filter(Boolean).join(' · ') });
    }
  }
  const features = [];
  for (let start = 0; start < levels.length;) {
    let end = start + 1; while (end < levels.length && levels[end] === levels[start]) end++;
    features.push({ type: 'Feature', properties: { status: 'planned', traffic: levels[start] }, geometry: { type: 'LineString', coordinates: coords.slice(start, end + 1) } });
    start = end;
  }
  return {
    feature: { type: 'Feature', properties: { status: 'planned' }, geometry }, features, incidents,
    provider: 'tomtom', traffic: true, fetchedAt, seconds: summary.travelDurationInSeconds, typicalSeconds: null,
    delaySeconds: Number.isFinite(summary.trafficDelayDurationInSeconds) && summary.trafficDelayDurationInSeconds >= 0 ? summary.trafficDelayDurationInSeconds : null,
    minutes: Math.max(1, Math.round(summary.travelDurationInSeconds / 60)), miles: (summary.lengthInMeters / 1609.344).toFixed(1),
    unknownSegments: levels.filter(v => v === 'unknown').length,
  };
}
export async function tomtomTrafficRoute(from, to, { config, signal, request = fetch, now = Date.now } = {}) {
  const options = { signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'origin' };
  const headers = { 'TomTom-Api-Key': config.apiKey, 'TomTom-Api-Version': '3', 'Content-Type': 'application/json', Attributes: 'routes.summary,routes.legs.path,routes.sections.traffic' };
  const response = await request('https://api.tomtom.com/maps/orbis/routing/routes/calculate', {
    ...options, method: 'POST', headers,
    body: JSON.stringify({ routePlanningLocations: { origin: { type: 'Point', coordinates: [from.lng, from.lat] }, destination: { type: 'Point', coordinates: [to.lng, to.lat] } }, travelMode: 'car', routeType: 'fast', traffic: 'live' }),
  });
  if (!response.ok) throw Error('Live traffic is temporarily unavailable.');
  const result = parseTomtomTrafficRoute(await response.json(), now());
  // Portal terms 17.3 require the Copyright API for REST results. No separate Traffic
  // API, SDK, telemetry, basemap request, address or route coordinates are sent here.
  const credits = await request('https://api.tomtom.com/maps/orbis/copyrights', { ...options, headers: { 'TomTom-Api-Key': config.apiKey, 'TomTom-Api-Version': '2' } });
  if (!credits.ok) throw Error('Live traffic is temporarily unavailable.');
  const copyright = await credits.text();
  if (!copyright.includes('TomTom') || copyright.length > 20000) throw Error('Live traffic attribution is unavailable.');
  return { ...result, copyright };
}
