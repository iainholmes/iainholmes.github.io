import { validPoint } from './routing.js';
import { distanceMiles } from './trip-map.js';

// The 2026 TomTom Orbis Places Discover API is a separate entitlement from
// Atlas' existing traffic Routing/Copyrights products. The owner must enable
// a dedicated, restricted browser key AND verify required attribution first.
export function tomtomPlacesAvailable(config,origin){
  return config?.provider==='tomtom-search' && config.enabled===true &&
    /^[\\w-]{16,128}$/.test(config.apiKey||'') &&
    config.allowedOrigins?.includes(origin)===true;
}
const topics=[
  {term:'park',key:'walk',label:'Parks & walks',minutes:40,why:'A potential public green space to explore with Rupert.'},
  {term:'ice cream',key:'treat',label:'Ice cream & treats',minutes:20,why:'A possible treat stop; check outdoor access for Rupert.'},
  {term:'cafe',key:'cafe',label:'Cafés',minutes:30,why:'Coffee and a pause; confirm outdoor seating and dog policy.'},
];
export function tomtomPlaceRecord(raw,topic){
  const name=raw?.title,p=raw?.position?.coordinates;
  const point={lat:Number(p?.[1]),lng:Number(p?.[0]),label:name};
  if(raw?.type!=='poi'||!name||typeof name!=='string'||name.length>250||!validPoint(point))return null;
  const classes=(raw.poiTypes||[]).map(x=>(x.name||x.id||'').toLowerCase()).join(' ');
  if(topic.key==='walk'&&/parking|car park|park and ride/.test(classes))return null;
  return {
    id:'tomtom-'+String(raw.id||point.lat+':'+point.lng).slice(0,110),name,
    category:topic.key,categoryLabel:topic.label,minutes:topic.minutes,location:point,
    dog:'Dog access unverified. Confirm leash rules, outdoor areas and opening hours before visiting.',
    confidence:'unverified',why:topic.why,links:[],hours:'',
    provider:'TomTom Places (unverified lead)',sourceDistance:raw.distanceInMeters??null
  };
}
export async function discoverTomTomPlaces(point,{config,origin,request=fetch,signal,radius=4500}={}){
  if(!validPoint(point))throw Error('Choose a valid area to search.');
  if(!tomtomPlacesAvailable(config,origin))throw Error('Dedicated TomTom Places Search is not configured.');
  const all=[],seen=new Set();
  for(const topic of topics){
    signal?.throwIfAborted();
    const lookupSignal=signal?AbortSignal.any([signal,AbortSignal.timeout(12000)]):AbortSignal.timeout(12000);
    const center={type:'point',coordinates:[point.lng,point.lat]};
    const response=await request('https://api.tomtom.com/maps/orbis/places/discover',{
      method:'POST',headers:{
        'TomTom-Api-Key':config.apiKey,'TomTom-Api-Version':'3',
        Attributes:'results(id,type,title,position,poiTypes,distanceInMeters)',
        'Content-Type':'application/json',Accept:'application/json'
      },body:JSON.stringify({
        query:topic.term,maxResults:10,origin:center,
        filters:{types:['poi'],geometry:{type:'circle',center,
          radiusInMeters:Math.max(1200,Math.min(8500,Math.round(radius)))}},
        preferences:{geometry:center}
      }),signal:lookupSignal,credentials:'omit',cache:'no-store',referrerPolicy:'origin'
    });
    if(!response.ok)throw Error('TomTom Places returned HTTP '+response.status);
    const data=await response.json();
    if(!Array.isArray(data.results))throw Error('TomTom Places returned an invalid result.');
    for(const raw of data.results){
      const lead=tomtomPlaceRecord(raw,topic);
      if(!lead||seen.has(lead.id))continue;
      seen.add(lead.id);all.push(lead);
    }
  }
  return all.sort((a,b)=>distanceMiles(point,a.location)-distanceMiles(point,b.location)).slice(0,15);
}
