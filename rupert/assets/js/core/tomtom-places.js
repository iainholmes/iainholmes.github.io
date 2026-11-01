import { validPoint } from './routing.js';
import { distanceMiles } from './trip-map.js';

// TomTom Search API v2 is a distinct product from the existing TomTom traffic
// integration. Requests are deliberately disabled until a dedicated,
 // domain- and Search-product-restricted browser key is configured.
export function tomtomPlacesAvailable(config,origin){
  return config?.provider==='tomtom-search' &&
    /^[\\w-]{16,128}$/.test(config.apiKey||'') &&
    config.allowedOrigins?.includes(origin)===true;
}
const topics=[
  {term:'park',key:'walk',label:'Parks & walks',minutes:40,why:'A potential park or outdoor stroll with Rupert.'},
  {term:'ice cream',key:'treat',label:'Ice cream & treats',minutes:20,why:'An ice cream stop; check outdoor access for Rupert.'},
  {term:'cafe',key:'cafe',label:'Cafés',minutes:30,why:'A coffee stop; confirm whether outdoor seating welcomes dogs.'},
];
export function tomtomPlaceRecord(raw,topic){
  const name=raw?.poi?.name,position=raw?.position;
  const point={lat:Number(position?.lat),lng:Number(position?.lon),label:name};
  if(!name||typeof name!=='string'||name.length>250||!validPoint(point))return null;
  const descriptions=(raw.poi.classifications||[]).flatMap(item=>(item.names||[]).map(x=>x.name||'')).join(' ').toLowerCase();
  if(topic.key==='walk'&&/car park|parking lot|parking garage|parking facility/.test(descriptions))return null;
  const link=raw.poi.url&&/^https?:\\/\\//i.test(raw.poi.url)?[{label:'Place website',url:raw.poi.url}]:[];
  return {id:'tomtom-'+String(raw.id||point.lat+':'+point.lng).slice(0,110),
    name,category:topic.key,categoryLabel:topic.label,minutes:topic.minutes,location:point,
    dog:'Dog access unverified. Confirm leash rules, outdoor areas and opening hours before visiting.',
    confidence:'unverified',why:topic.why,links:link,hours:'',
    provider:'TomTom Search (POI lead)',sourceDistance:raw.dist??null};
}
export async function discoverTomTomPlaces(point,{config,origin,request=fetch,signal,radius=4500}={}){
  if(!validPoint(point))throw Error('Choose a valid area to search.');
  if(!tomtomPlacesAvailable(config,origin))throw Error('Dedicated TomTom Search access is not configured.');
  const timeout=signal?AbortSignal.any([signal,AbortSignal.timeout(10000)]):AbortSignal.timeout(10000);
  const all=[],seen=new Set();
  for(const topic of topics){
    signal?.throwIfAborted();
    const url=new URL('https://api.tomtom.com/search/2/poiSearch/'+encodeURIComponent(topic.term)+'.json');
    url.search=new URLSearchParams({key:config.apiKey,lat:String(point.lat),lon:String(point.lng),
      radius:String(Math.max(1000,Math.min(10000,Math.round(radius)))),limit:'12',language:'en-US'});
    const response=await request(url.toString(),{signal:timeout,referrerPolicy:'origin',credentials:'omit',cache:'no-store'});
    if(!response.ok)throw Error('TomTom Search returned HTTP '+response.status);
    const data=await response.json();
    if(!Array.isArray(data.results))throw Error('TomTom Search returned an invalid result.');
    for(const raw of data.results){
      const lead=tomtomPlaceRecord(raw,topic);if(!lead||seen.has(lead.id))continue;
      seen.add(lead.id);all.push(lead);
    }
  }
  return all.sort((a,b)=>distanceMiles(point,a.location)-distanceMiles(point,b.location)).slice(0,15);
}
