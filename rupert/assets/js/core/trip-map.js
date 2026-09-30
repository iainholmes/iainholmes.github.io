import { validPoint } from './routing.js';
export const MODE_LABEL={car:'Drive',air:'Flight',ferry:'Ferry',rail:'Train',walk:'Walk'};
export const pointFeature=(id,name,p,status='planned')=>({type:'Feature',properties:{id,name,status},geometry:{type:'Point',coordinates:[p.lng,p.lat]}});
export function distanceMiles(a,b) {
  const r=Math.PI/180,dy=(b.lat-a.lat)*r,dx=(b.lng-a.lng)*r;
  const h=Math.sin(dy/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dx/2)**2;
  return 3958.8*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function distanceToRoute(point,coordinates) {
  let best=Infinity;const xScale=Math.cos(point.lat*Math.PI/180);
  for(let i=1;i<coordinates.length;i++){
    const [ax,ay]=coordinates[i-1],[bx,by]=coordinates[i],dx=(bx-ax)*xScale,dy=by-ay;
    const t=Math.max(0,Math.min(1,(((point.lng-ax)*xScale)*dx+(point.lat-ay)*dy)/(dx*dx+dy*dy||1)));
    best=Math.min(best,distanceMiles(point,{lng:ax+(bx-ax)*t,lat:ay+(by-ay)*t}));
  }return best;
}
export function routeBounds(features) {
  const pts=features.flatMap(f=>f.geometry.type==='Point'?[f.geometry.coordinates]:f.geometry.coordinates);
  if(!pts.length)return null;const xs=pts.map(c=>c[0]),ys=pts.map(c=>c[1]);
  return [[Math.min(...xs)-.01,Math.min(...ys)-.01],[Math.max(...xs)+.01,Math.max(...ys)+.01]];
}
export function breakStops(route,interval=120) {
  if(!interval || route.minutes<=interval)return [];
  const coordinates=route.feature.geometry.coordinates,distances=[0];
  for(let i=1;i<coordinates.length;i++)distances.push(distances[i-1]+distanceMiles({lng:coordinates[i-1][0],lat:coordinates[i-1][1]},{lng:coordinates[i][0],lat:coordinates[i][1]}));
  const total=distances.at(-1),out=[];
  for(let minute=interval;minute<route.minutes-10;minute+=interval){const target=total*minute/route.minutes;let i=1;while(i<distances.length-1&&distances[i]<target)i++;const t=(target-distances[i-1])/(distances[i]-distances[i-1]||1),a=coordinates[i-1],b=coordinates[i];out.push({minute,minutes:15,point:{lng:a[0]+(b[0]-a[0])*t,lat:a[1]+(b[1]-a[1])*t}});}return out;
}
export function itineraryRows(legs,results,{departure='09:00',interval=120,stops=[]}={}) {
  const [h,m]=departure.split(':').map(Number);let elapsed=0,known=true;
  const time=minutes=>{const t=h*60+m+minutes,day=Math.floor(t/1440);return `${String(Math.floor(t%1440/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}${day?' +'+day+'d':''}`;};
  return legs.map((leg,i)=>{const result=results[i],minutes=leg.mode==='car'?result?.minutes:leg.minutes;
    const breaks=leg.mode==='car'&&result?breakStops(result,interval):[],stop=stops.find(s=>s.leg===i+1),pause=stop?.minutes ?? (stop?30:0),total=Number.isFinite(minutes)?minutes+breaks.length*15+pause:null;
    if(total===null)known=false;else elapsed+=total;
    return {leg:i+1,from:leg.from.label,to:leg.to.label,mode:MODE_LABEL[leg.mode],minutes:minutes??null,breaks,pause,arrival:known?time(elapsed):'—'};
  });
}
let lastLookup=0;
export async function geocodeLocation(label,{signal,request=fetch}={}) {
  const wait=Math.max(0,1100-(Date.now()-lastLookup));if(wait)await new Promise(r=>setTimeout(r,wait));lastLookup=Date.now();
  const url=new URL('https://nominatim.openstreetmap.org/search');url.search=new URLSearchParams({q:label,format:'jsonv2',limit:'1'});
  const response=await request(url,{signal,referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Location lookup unavailable. Use a directory place or latitude, longitude.');
  const match=(await response.json())[0],point=match&&{lat:Number(match.lat),lng:Number(match.lon)};
  if(!validPoint(point))throw Error(`Location not found: ${label}`);return {...point,display:match.display_name};
}
export async function nearbyParks(point,{signal,request=fetch}={}) {
  if(!validPoint(point))throw Error('Invalid destination');
  const around=`around:15000,${point.lat},${point.lng}`;
  const query=`[out:json][timeout:15];(nwr(${around})[leisure=park][name];nwr(${around})[leisure=nature_reserve][name];nwr(${around})[tourism=picnic_site][name];);out tags center 50;`;
  const response=await request('https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:query}),signal,referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Nearby place lookup unavailable.');const data=await response.json();
  return (data.elements||[]).filter(e=>e.tags?.name && !['private','no'].includes(e.tags?.access) && (e.tags.dog??e.tags.dogs)!=='no').map(e=>{
    const dog=e.tags.dog??e.tags.dogs;
    return {id:`osm-${e.type}-${e.id}`,name:e.tags.name,short_name:e.tags.name,kind:e.tags.tourism==='picnic_site'?'Picnic stop':'Park walk',access:{lat:e.lat??e.center?.lat,lng:e.lon??e.center?.lon,coords_verified:false},dog_policy:e.tags['dog:conditional']?'Conditional dog access — verify current rules':dog==='leashed'?'Leashed (OpenStreetMap)':dog==='yes'?'Dogs allowed; check leash rules (OpenStreetMap)':'Dog access not verified',links:[{label:'OpenStreetMap',url:`https://www.openstreetmap.org/${e.type}/${e.id}`}]} ;
  }).filter(p=>validPoint({lat:p.access.lat,lng:p.access.lng}));
}
