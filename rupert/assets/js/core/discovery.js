import { validPoint } from './routing.js';
import { distanceMiles, nominatimLookup } from './trip-map.js';

// Community data is a lead, not official dog-access evidence. Never infer indoor access.
export const ACTIVITY_TYPES = [
  {key:'treat',label:'Ice cream & pup treats',tag:'amenity',values:'ice_cream',minutes:20,why:'A short treat stop for both of you.'},
  {key:'cafe',label:'Cafés & bakeries',tag:'amenity',values:'cafe',minutes:30,why:'Coffee and a pause near the journey.'},
  {key:'bakery',label:'Bakeries',tag:'shop',values:'bakery',minutes:20,why:'Pick up something for a picnic or a short outdoor pause.'},
  {key:'meal',label:'Meals & patios',tag:'amenity',values:'restaurant|fast_food|food_court',minutes:60,why:'A meal opportunity with mapped dog access or outdoor seating.'},
  {key:'brewery',label:'Breweries & patios',tag:'amenity',values:'biergarten|pub|bar',minutes:60,why:'An outdoor pause; verify dog access and leave drinking to a non-driver.'},
  {key:'walk',label:'Parks, greenways & gardens',tag:'leisure',values:'park|nature_reserve|dog_park|garden',minutes:40,why:'Room to stretch your legs with Rupert.'},
  {key:'path',label:'Greenways & short walks',tag:'highway',values:'footway|path',minutes:30,why:'A named walking route; confirm the entrance, length, surface and dog rules.'},
  {key:'boardwalk',label:'Boardwalks & piers',tag:'man_made',values:'pier',minutes:25,why:'A possible waterside pause; check public access and dog rules.'},
  {key:'water',label:'Beaches & water',tag:'natural',values:'beach',minutes:45,why:'A coastal pause; check seasonal dog rules and water conditions.'},
  {key:'swim',label:'Swimming areas',tag:'leisure',values:'swimming_area',minutes:45,why:'A waterside stop; verify dog access and safe water before swimming.'},
  {key:'picnic',label:'Picnics & overlooks',tag:'tourism',values:'picnic_site|viewpoint',minutes:30,why:'A scenic pause or picnic near the road.'},
  {key:'attraction',label:'Roadside places & boardwalks',tag:'tourism',values:'attraction',minutes:40,why:'An unusual place to investigate together; access needs checking.'},
  {key:'market',label:'Markets & farm stands',tag:'amenity',values:'marketplace',minutes:30,why:'A stop for local food or a short wander; verify opening days.'},
  {key:'farm',label:'Farm stands',tag:'shop',values:'farm',minutes:20,why:'A local produce stop near the corridor.'},
  {key:'shop',label:'Garden & outdoor stores',tag:'shop',values:'garden_centre|outdoor',minutes:30,why:'A practical stop with potential to explore; ask about dogs inside.'},
  {key:'campus',label:'Campuses',tag:'amenity',values:'university|college',minutes:40,why:'A campus walk; dog access applies to grounds only if permitted.'},
  {key:'town',label:'Towns & neighbourhoods',tag:'place',values:'town|village',minutes:45,why:'A town-centre pause to look for a public walk and an outdoor meal.'},
  {key:'ferry',label:'Ferries',tag:'amenity',values:'ferry_terminal',minutes:60,why:'A possible water crossing; check sailing times and the operator’s dog policy.'},
  {key:'overnight',label:'Overnight areas',tag:'tourism',values:'camp_site|caravan_site|hotel|motel',minutes:0,why:'A potential overnight base; confirm pet rooms or campsite rules before booking.'},
];
// Unverified restaurants and patios are leads, not promises of dog access.
// Exclude explicit dog=no, and retain strict dog-evidence for overnight lodging.
const restricted=new Set(['overnight']);
let lookupQueue=Promise.resolve(),unavailableUntil=0;
export function activityFromOSM(element) {
  const t=element.tags||{}, dog=t.dog??t.dogs;
  if(!t.name || ['private','no'].includes(t.access) || dog==='no') return null;
  const type=ACTIVITY_TYPES.find(x=>new RegExp(`^(${x.values})$`).test(t[x.tag]||''));
  if(!type || (restricted.has(type.key) && !['yes','leashed','designated'].includes(dog) && t.outdoor_seating!=='yes' && t['dog:conditional']==null)) return null;
  const location={lat:element.lat??element.center?.lat,lng:element.lon??element.center?.lon,label:t.name};
  if(!validPoint(location)) return null;
  const explicit=['yes','leashed','designated'].includes(dog);
  const confidence=t['dog:conditional']?'Conditional rules mapped — verify the current policy':dog==='leashed'?'Leashed access mapped in OpenStreetMap — confirm current rules':explicit?'Dog access mapped in OpenStreetMap — confirm current rules':t.outdoor_seating==='yes'?'Outdoor seating mapped; dog policy unverified':'Dog access unverified — check before visiting';
  const link={label:'OpenStreetMap details',url:`https://www.openstreetmap.org/${element.type}/${element.id}`};
  const website=t.website||t['contact:website'];
  return {id:`osm-${element.type}-${element.id}`,name:t.name,category:type.key,categoryLabel:type.label,minutes:type.minutes,location,dog:confidence,confidence:explicit?'community-mapped':'unverified',why:type.why,links:[...(website&&/^https?:\/\//i.test(website)?[{label:'Place website',url:website}]:[]),link],hours:t.opening_hours||''};
}
// Search directly for named activity types within a bounded area. The previous
// query assembled *every* named object before filtering ~19 sets and repeatedly
// emitted results, which can exhaust public Overpass query slots in busy cities.
// Keep public discovery deliberately small and selective. Overpass is a shared
// resource: heavy, repeated city-scale scans are neither reliable nor considerate.
const SERVERS=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
const compactTypes=[
  ['amenity','ice_cream|cafe|restaurant|marketplace'],
  ['shop','bakery|farm'],
  ['leisure','park|garden|nature_reserve|dog_park'],
  ['tourism','viewpoint|picnic_site'],
];
export function discoveryQuery(point,{radius=3500,overnight=false}={}) {
  if(!validPoint(point)) throw Error('Resolve a discovery area first.');
  const metres=Math.max(1200,Math.min(5000,Math.round(Number(radius)||3500)));
  const groups=overnight?[['place','town|village'],['leisure','park'],['tourism','hotel|motel|camp_site']]:compactTypes;
  const lines=groups.map(([tag,values])=>`nwr(around:${metres},${point.lat},${point.lng})["${tag}"~"^(${values})$"]["name"];`);
  return `[out:json][timeout:12];(\n${lines.join('\n')}\n);out center 90;`;
}
function providerProblem(status){
  if(status===429||status===406)return 'Public place search is rate-limited. Please try again later.';
  if(status===502||status===503||status===504)return 'The public place provider is busy. Try searching a smaller town area later.';
  return `Public place search returned HTTP ${status}.`;
}
export async function discoverActivities(point,{signal,request=fetch,overnight=false,radius=3500}={}) {
  const task=lookupQueue.catch(()=>{}).then(async()=>{
    signal?.throwIfAborted();
    if(Date.now()<unavailableUntil)throw Error('Public place lookup is temporarily limited. Please retry later.');
    const body=new URLSearchParams({data:discoveryQuery(point,{overnight,radius})});
    // A second public instance is tried once only on provider-side failure, never
    // to bypass a 429/406 limit. No parallel requests or unbounded retry loops.
    let lastError=null;
    for(const [index,endpoint] of SERVERS.entries()){
      signal?.throwIfAborted();
      try{
        const lookupSignal=signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000);
        const response=await request(endpoint,{method:'POST',body,signal:lookupSignal,referrerPolicy:'origin'});
        if(response.status===429||response.status===406){
          unavailableUntil=Date.now()+60000;
          throw Error(providerProblem(response.status));
        }
        if(!response.ok){
          lastError=Error(providerProblem(response.status));
          if(![502,503,504].includes(response.status)||index===SERVERS.length-1)break;
          continue;
        }
        let data;
        try{data=await response.json();}catch{lastError=Error('Public place search returned unreadable data.');if(index<SERVERS.length-1)continue;break;}
        if(data.remark && /runtime error|timed out|out of memory|error/i.test(data.remark)){
          lastError=Error('The public place search timed out. Try a smaller area.');
          if(index<SERVERS.length-1)continue;
          break;
        }
        if(!Array.isArray(data.elements))throw Error('Public place search returned an invalid response.');
        return data.elements;
      }catch(error){
        if(signal?.aborted)throw error;
        lastError=error.name==='TimeoutError'?Error('Public place search timed out. Try a smaller area.'):error;
        if([/rate-limited/,/invalid response/].some(re=>re.test(lastError.message)))break;
        if(index===SERVERS.length-1)break;
      }
    }
    // Avoid turning repeated refresh clicks into a stream of failed public requests.
    unavailableUntil=Math.max(unavailableUntil,Date.now()+30000);
    throw lastError||Error('Public place lookup unavailable.');
  });
  lookupQueue=task;
  const elements=await task;
  const candidates=elements.map(activityFromOSM).filter(Boolean).sort((a,b)=>
    (a.confidence==='unverified')-(b.confidence==='unverified') ||
    distanceMiles(point,a.location)-distanceMiles(point,b.location));
  const out=[],counts=new Map(),seen=new Set();
  for(const activity of candidates){
    const n=counts.get(activity.category)||0;
    if(n>=3||seen.has(activity.id))continue;
    seen.add(activity.id);counts.set(activity.category,n+1);out.push(activity);
    if(out.length>=14)break;
  }
  return out;
}
export async function areaName(point,{signal,request=fetch}={}) {
  const url=new URL('https://nominatim.openstreetmap.org/reverse');url.search=new URLSearchParams({lat:point.lat,lon:point.lng,format:'jsonv2',zoom:'10'});
  const response=await nominatimLookup(url,{signal,request});
  if(!response.ok) throw Error('Area name unavailable.');
  const a=(await response.json()).address||{};
  return [a.city||a.town||a.village||a.county,a.state].filter(Boolean).join(', ');
}
