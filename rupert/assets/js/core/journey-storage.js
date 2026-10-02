import { validPoint } from './routing.js';
const text=(value,max=200)=>typeof value==='string'?value.slice(0,max):'';
const endpoint=value=>{if(!validPoint(value)||!text(value.label).trim())throw Error('Invalid saved journey location.');return {label:text(value.label),lat:value.lat,lng:value.lng};};
export function cleanActivity(value) {
  if(!value||!text(value.id,120)||!text(value.name)||!Number.isFinite(value.minutes)||value.minutes<0||value.minutes>1440) throw Error('Invalid saved trip activity.');
  const activity={id:text(value.id,120),name:text(value.name),location:endpoint(value.location),minutes:value.minutes,category:text(value.category,40),categoryLabel:text(value.categoryLabel,80),dog:text(value.dog,300),why:text(value.why,500),links:(value.links||[]).slice(0,3).filter(x=>/^https?:\/\//i.test(x.url)).map(x=>({label:text(x.label,100),url:text(x.url,1500)}))};
  if(value.overnight===true)activity.overnight=true;
  if(value.defining===true)activity.defining=true;
  if(Number.isFinite(value.progress)&&value.progress>=0&&value.progress<=1)activity.progress=value.progress;
  if(value.previous && /^[a-z0-9-]+$/i.test(value.previous))activity.previous=value.previous;
  return activity;
}
export function cleanRoute(value) {
  const coordinates=value?.feature?.geometry?.coordinates;
  if(value?.feature?.geometry?.type!=='LineString'||!Array.isArray(coordinates)||coordinates.length<2||coordinates.length>100000||!coordinates.every(p=>Array.isArray(p)&&validPoint({lng:p[0],lat:p[1]}))||!Number.isFinite(value.minutes)||value.minutes<0||value.minutes>10080||!Number.isFinite(Number(value.miles))||Number(value.miles)<0) throw Error('Invalid saved route.');
  return {feature:{type:'Feature',properties:{status:'planned',mode:'drive'},geometry:{type:'LineString',coordinates:coordinates.map(p=>[p[0],p[1]])}},minutes:value.minutes,miles:String(value.miles),...(value.corridor?{corridor:text(value.corridor,300)}:{}),...(value.label?{label:text(value.label,100)}:{}),...(value.id?{id:text(value.id,100)}:{})};
}
export function cleanJourney(value) {
  if(!Array.isArray(value.stops)||value.stops.length>38||!Array.isArray(value.destinationActivities)||value.destinationActivities.length>40) throw Error('Too many activities in this journey.');
  const stops=value.stops.map(cleanActivity),destinationActivities=value.destinationActivities.map(cleanActivity);
  if(new Set([...stops,...destinationActivities].map(s=>s.id)).size!==stops.length+destinationActivities.length)throw Error('Duplicate activities in this journey.');
  const family=cleanRoute(value.family),routes=(value.routes||[]).map(cleanRoute);
  if(routes.length>40||value.families?.length>3)throw Error('Too many saved routes.');
  return {origin:endpoint(value.origin),destination:endpoint(value.destination),stops,destinationActivities,family,routes,families:(value.families||[family]).map(cleanRoute)};
}
export function cleanManualRoutes(routes,legs) {
  if(!Array.isArray(routes)||routes.length!==legs.length)throw Error('Saved manual routes do not match the itinerary.');
  return routes.map((route,i)=>{const clean=cleanRoute(route);clean.feature.properties.mode=legs[i].mode==='car'?'drive':legs[i].mode;return clean;});
}
