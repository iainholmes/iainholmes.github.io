export function validPoint(point) {
  return point && typeof point.lat === 'number' && typeof point.lng === 'number' && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 85 && Math.abs(point.lng) <= 180;
}
export async function drivingRoute(from, to, { signal, request = fetch, via = [] } = {}) {
  if (!validPoint(from) || !validPoint(to)) throw new Error('Check both locations.');
  if(!Array.isArray(via) || via.length>20 || via.some(p=>!validPoint(p))) throw Error('Check the route stops.');
  const points = [from,...via,to].map(p=>`${p.lng},${p.lat}`).join(';');
  const response = await request(`https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson&steps=false`, { signal, referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Driving routes are unavailable. Try again later.');
  const data = await response.json(), route = data.routes?.[0];
  if (data.code !== 'Ok' || route?.geometry?.type !== 'LineString' || !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length < 2 || !Number.isFinite(route.duration) || route.duration < 0 || !Number.isFinite(route.distance) || route.distance < 0) throw new Error('No driving route found.');
  if (!route.geometry.coordinates.every(p => Array.isArray(p) && p.length >= 2 && validPoint({lng:p[0],lat:p[1]}))) throw new Error('The route returned invalid coordinates.');
  return { feature: { type: 'Feature', properties: { status: 'planned' }, geometry: route.geometry }, minutes: Math.max(1, Math.round(route.duration / 60)), miles: (route.distance / 1609.344).toFixed(1) };
}

export async function drivingAlternatives(from,to,{signal,request=fetch}={}) {
  if(!validPoint(from)||!validPoint(to)) throw Error('Check both locations.');
  const points=[from,to].map(p=>`${p.lng},${p.lat}`).join(';');
  const response=await request(`https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson&steps=true&alternatives=true`,{signal,referrerPolicy:'no-referrer'});
  if(!response.ok) throw Error('Driving routes are unavailable. Try again later.');
  const data=await response.json();
  if(data.code!=='Ok'||!Array.isArray(data.routes)||!data.routes.length) throw Error('No driving route found.');
  return data.routes.filter(r=>r.geometry?.type==='LineString'&&r.geometry.coordinates?.length>=2&&r.geometry.coordinates.every(p=>validPoint({lng:p[0],lat:p[1]}))&&Number.isFinite(r.duration)&&r.duration>=0&&Number.isFinite(r.distance)&&r.distance>=0).map(r=>{
    const roads=new Map();
    for(const leg of r.legs||[]) for(const step of leg.steps||[]) {
      const name=step.ref||step.name;
      if(name) roads.set(name,(roads.get(name)||0)+(step.distance||0));
    }
    const corridor=[...roads].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([name])=>name).join(' · ');
    return {feature:{type:'Feature',properties:{status:'planned',mode:'drive'},geometry:r.geometry},minutes:Math.max(1,Math.round(r.duration/60)),miles:(r.distance/1609.344).toFixed(1),corridor};
  });
}
