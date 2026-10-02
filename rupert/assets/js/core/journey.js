import { validPoint } from './routing.js';
import { distanceMiles, distanceToRoute, routeBounds } from './trip-map.js';

// Planning functions are independent of the map and of the publication Directory.
export function durationLabel(value) {
  if (!Number.isFinite(Number(value)) || value == null) return 'Unavailable';
  const minutes = Math.max(0, Math.round(Number(value))), hours = Math.floor(minutes / 60), rest = minutes % 60;
  return hours ? `${hours} h${rest ? ` ${rest} min` : ''}` : `${minutes} min`;
}
export function routeMeasure(route) {
  const coordinates = route.feature.geometry.coordinates, lengths = [0];
  for (let i = 1; i < coordinates.length; i++) lengths.push(lengths[i - 1] + distanceMiles({lng:coordinates[i-1][0],lat:coordinates[i-1][1]}, {lng:coordinates[i][0],lat:coordinates[i][1]}));
  return {coordinates, lengths, total:lengths.at(-1)};
}
export function routePoint(route, fraction) {
  const {coordinates:c,lengths:d,total} = routeMeasure(route), target = Math.max(0,Math.min(1,fraction))*total;
  let i = 1; while (i < c.length-1 && d[i] < target) i++;
  const t = (target-d[i-1])/(d[i]-d[i-1] || 1);
  return {lng:c[i-1][0]+(c[i][0]-c[i-1][0])*t,lat:c[i-1][1]+(c[i][1]-c[i-1][1])*t};
}
export function routeProgress(point, route) {
  const {coordinates:c,lengths:d,total} = routeMeasure(route), scale = Math.cos(point.lat*Math.PI/180);
  let nearest = Infinity, progress = 0;
  for (let i=1;i<c.length;i++) {
    const a=c[i-1],b=c[i],dx=(b[0]-a[0])*scale,dy=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((point.lng-a[0])*scale*dx+(point.lat-a[1])*dy)/(dx*dx+dy*dy || 1)));
    const distance=distanceMiles(point,{lng:a[0]+(b[0]-a[0])*t,lat:a[1]+(b[1]-a[1])*t});
    if (distance<nearest) {nearest=distance;progress=(d[i-1]+(d[i]-d[i-1])*t)/(total || 1);}
  }
  return progress;
}
export function distinctRoute(a,b) {
  const tolerance=Math.max(2,Math.min(15,Number(a.miles)*.006));
  const offsets=Array.from({length:31},(_,i)=>distanceToRoute(routePoint(a,i/30),b.feature.geometry.coordinates));
  const separated=offsets.filter(x=>x>tolerance).length/offsets.length;
  const substantive=offsets.filter(x=>x>tolerance*2).length/offsets.length;
  // A different exit, a short urban diversion, or a different shop is not a route family.
  return separated>=.23 && (substantive>=.13 || Math.abs(a.minutes-b.minutes)>=Math.max(12,a.minutes*.04));
}
export function routeFamilies(routes) {
  const selected=[];
  for (const route of [...routes].sort((a,b)=>a.minutes-b.minutes)) {
    if (!selected.some(other=>!distinctRoute(route,other))) selected.push(route);
    if (selected.length===3) break;
  }
  return selected.map((route,i)=>({...route,id:`family-${i}`,label:i===0?'Most direct':`Alternative ${i}`,extra:route.minutes-selected[0].minutes}));
}
export function wholeJourneyBounds(routes, origin, destination) {
  // Activity and break markers deliberately cannot influence this camera.
  return routeBounds([...routes.map(r=>r.feature),...[origin,destination].filter(validPoint).map(p=>({geometry:{type:'Point',coordinates:[p.lng,p.lat]}}))]);
}
export function opportunityZones(route) {
  const interval=Math.min(120,100/(Number(route.miles)/route.minutes || 1));
  const opportunities=[];
  for(let minute=interval;minute<route.minutes-30;minute+=interval) opportunities.push(minute);
  // Continental journeys expose representative segments, not dozens of repetitive breaks.
  const count=Math.min(8,opportunities.length);
  const minutes=Array.from({length:count},(_,i)=>opportunities[Math.round(i*(opportunities.length-1)/Math.max(1,count-1))]);
  if(!minutes.length && route.minutes>45) minutes.push(route.minutes*.5);
  return [...new Set(minutes)].map((minute,i)=>({id:`segment-${i}`,minute,progress:minute/route.minutes,point:routePoint(route,minute/route.minutes)}));
}
export function overnightZones(route) {
  if(route.minutes<=540) return [];
  const days=Math.ceil(route.minutes/480), out=[];
  for(let day=1;day<days && day<=8;day++) {
    const minute=day*route.minutes/days;
    out.push({id:`overnight-${day}`,day,minute,progress:minute/route.minutes,point:routePoint(route,minute/route.minutes)});
  }
  return out;
}
export function journeyLegs(origin,destination,stops=[]) {
  const points=[origin,...stops.map(s=>({...s.location,label:s.name})),destination];
  if(points.some(p=>!validPoint(p))) throw Error('Resolve the origin, destination and stops first.');
  return points.slice(1).map((to,i)=>({seq:i+1,mode:'car',from:points[i],to}));
}
export function journeySchedule(legs,results,{departure='09:00',start='',stops=[],destinationActivities=[]}={}) {
  const [h,m]=departure.split(':').map(Number), morning=h*60+m;
  let clock=morning,known=true;
  const stamp=value=>{
    if(!Number.isFinite(value)) return '—';
    const day=Math.floor(value/1440),minute=value%1440;
    const date=start?new Date(Date.parse(start+'T00:00:00Z')+day*86400000).toISOString().slice(0,10):`Day ${day+1}`;
    return `${date} · ${String(Math.floor(minute/60)).padStart(2,'0')}:${String(Math.floor(minute%60)).padStart(2,'0')}`;
  };
  const rows=legs.map((leg,i)=>{
    const minutes=leg.mode==='car'?results[i]?.minutes:leg.minutes;
    const stop=stops[i],depart=known?stamp(clock):'—';
    if(!Number.isFinite(minutes)) known=false; else clock+=minutes;
    const arrival=known?stamp(clock):'—';
    if(stop?.overnight && known) {
      const minimumRest=clock+600;
      clock=(Math.floor(clock/1440)+1)*1440+morning;
      if(clock<minimumRest) clock=minimumRest;
    } else if(stop && known) clock+=stop.minutes;
    return {leg:i+1,from:leg.from.label,to:leg.to.label,mode:leg.mode,minutes,depart,arrival,stop,nextDeparture:stop?.overnight&&known?stamp(clock):null};
  });
  const activities=destinationActivities.map(activity=>{const arrival=known?stamp(clock):'—';if(known)clock+=activity.minutes;return {...activity,arrival};});
  return {rows,activities,arrival:known?stamp(clock):'—',driveMinutes:results.reduce((sum,r,i)=>sum+(legs[i]?.mode==='car'?(r?.minutes||0):0),0),elapsedMinutes:known?clock-morning:null};
}
