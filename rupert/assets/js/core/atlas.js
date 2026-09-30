// Atlas model: pure functions from places + editions (+ published Field Log, later) to map and register data.
// No DOM, no map library. Shared by the build tool (register pre-render) and the browser (map).

export const STATUS = {
  walked: { label: 'Walked', order: 3 },
  recommended: { label: 'Recommended', order: 2 },
  planned: { label: 'Planned', order: 1 },   // travel stops; browser-only, never published
  register: { label: 'In the register', order: 0 },
};

const SLOT_SHORT = { tuesday: "Tuesday's choice", thursday: "Thursday's choice" };
const ROLE = { flagship: 'flagship', local_trail: 'Local Trail', away_mission: 'Away Mission', wildcard: 'Wildcard' };

/**
 * For each place: its status and the editions / visits behind it.
 * manifest.editions carry place_roles: [{ place_id, role }] so a place used as a Wildcard is still found.
 */
export function placeStatuses(places, manifest, { log = [], now = new Date() } = {}) {
  const out = new Map(places.places.map(p => [p.id, { status: 'register', editions: [], visits: [] }]));
  for (const e of manifest.editions) {
    if (e.status !== 'published' || new Date(e.published_at) > now) continue;
    for (const { place_id, role } of e.place_roles || []) {
      const s = out.get(place_id); if (!s) continue;
      s.editions.push({ id: e.id, slot: e.slot, role, weekend: e.weekend, label: `${SLOT_SHORT[e.slot]}${role === 'flagship' ? '' : ' · ' + ROLE[role]}` });
      if (s.status === 'register') s.status = 'recommended';
    }
  }
  for (const v of log) {
    const s = out.get(v.place_id); if (!s) continue;
    s.visits.push(v); s.status = 'walked';
  }
  return out;
}

export function markerFeatures(places, statuses) {
  return places.places.filter(p => p.access?.lat != null).map(p => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.access.lng, p.access.lat] },
    properties: { id: p.id, name: p.short_name || p.name, status: statuses.get(p.id)?.status || 'register' },
  }));
}

/** Bounds of all places, padded. Never includes a residence: only public access points are in places.json. */
export function boundsOf(places, pad = 0.08) {
  const pts = places.places.filter(p => p.access?.lat != null).map(p => [p.access.lng, p.access.lat]);
  if (!pts.length) return [[-79.4, 35.7], [-78.6, 36.2]];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [[Math.min(...xs) - pad, Math.min(...ys) - pad], [Math.max(...xs) + pad, Math.max(...ys) + pad]];
}

/** Register grouping: regions in order of how many recommended/walked places they hold, then name. */
export function registerGroups(places, statuses) {
  const by = new Map();
  for (const p of places.places) {
    if (!by.has(p.region)) by.set(p.region, []);
    by.get(p.region).push(p);
  }
  const score = ps => ps.reduce((n, p) => n + STATUS[statuses.get(p.id)?.status || 'register'].order, 0);
  return [...by.entries()]
    .map(([region, ps]) => ({
      region,
      places: ps.sort((a, b) => STATUS[statuses.get(b.id).status].order - STATUS[statuses.get(a.id).status].order || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => score(b.places) - score(a.places) || a.region.localeCompare(b.region));
}

export function counts(statuses) {
  const c = { all: statuses.size, recommended: 0, walked: 0, planned: 0 };
  for (const s of statuses.values()) if (c[s.status] != null) c[s.status]++;
  return c;
}
