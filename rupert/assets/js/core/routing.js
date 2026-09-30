export function validPoint(point) {
  return point && typeof point.lat === 'number' && typeof point.lng === 'number' && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 85 && Math.abs(point.lng) <= 180;
}
export async function drivingRoute(from, to, { signal, request = fetch } = {}) {
  if (!validPoint(from) || !validPoint(to)) throw new Error('Check both locations.');
  const points = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const response = await request(`https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson&steps=false`, { signal, referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Driving routes are unavailable. Try again later.');
  const data = await response.json(), route = data.routes?.[0];
  if (data.code !== 'Ok' || route?.geometry?.type !== 'LineString' || !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length < 2 || !Number.isFinite(route.duration) || route.duration < 0 || !Number.isFinite(route.distance) || route.distance < 0) throw new Error('No driving route found.');
  if (!route.geometry.coordinates.every(p => Array.isArray(p) && p.length >= 2 && validPoint({lng:p[0],lat:p[1]}))) throw new Error('The route returned invalid coordinates.');
  return { feature: { type: 'Feature', properties: { status: 'planned' }, geometry: route.geometry }, minutes: Math.max(1, Math.round(route.duration / 60)), miles: (route.distance / 1609.344).toFixed(1) };
}
