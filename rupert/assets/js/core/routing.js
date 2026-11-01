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

// A route must connect the confirmed points and remain geographically credible.
// These conservative checks catch gross provider/geocoding errors, not traffic detours.
export function validateDrivingGeometry(route,from,to) {
  if(!validPoint(from)||!validPoint(to))throw Error('Confirm both route endpoints.');
  const coords=route?.feature?.geometry?.coordinates;
  const road=Number(route?.miles);
  if(!Array.isArray(coords)||coords.length<2||!coords.every(p=>Array.isArray(p)&&validPoint({lng:p[0],lat:p[1]}))||
     !Number.isFinite(road)||road<=0)throw Error('The route provider returned invalid geometry.');
  const miles=(a,b)=>{
    const rad=Math.PI/180,dy=(b.lat-a.lat)*rad,dx=(b.lng-a.lng)*rad;
    const v=Math.sin(dy/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dx/2)**2;
    return 3958.8*2*Math.atan2(Math.sqrt(v),Math.sqrt(Math.max(0,1-v)));
  };
  const start={lng:coords[0][0],lat:coords[0][1]},
    end={lng:coords.at(-1)[0],lat:coords.at(-1)[1]},
    direct=miles(from,to);
  if(miles(from,start)>30||miles(to,end)>30)
    throw Error('This route does not reach the confirmed locations. Choose a different geographic match.');
  if(direct>150&&road>direct*2.75&&road-direct>350)
    throw Error('The returned driving route is unusually circuitous for these locations. Recheck the resolved places before planning.');
  return route;
}
