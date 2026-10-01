// Camera scopes never mutate markers, publication history, selection or persistent storage.
export function frameFeatures(features, regions, scope) {
  if (scope === 'all') return features;
  if (scope === 'recommended' || scope === 'withdrawn') return features.filter(f => f.properties.status === scope);
  const match = /^region:(\d+)$/.exec(scope);
  if (!match || !regions[Number(match[1])]) return [];
  const ids = new Set(regions[Number(match[1])].ids);
  return features.filter(f => ids.has(f.properties.id));
}
export function frameMap(map, features, regions, scope) {
  const points = frameFeatures(features, regions, scope).map(f => f.geometry.coordinates).filter(p => p.length === 2 && p.every(Number.isFinite));
  if (!map || !points.length) return false;
  const xs=points.map(p=>p[0]), ys=points.map(p=>p[1]);
  map.fit([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]], {maxZoom:13});
  return true;
}
