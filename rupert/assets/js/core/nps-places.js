import { validPoint } from './routing.js';
import { distanceMiles } from './trip-map.js';

// A second, independent source of real visitor-facing outdoor places.
// The National Park Service publishes these points for public wayfinding.
// A point is NOT a park entrance, a guaranteed public access point, or proof
// that dogs are allowed. Never conflate these records with weekly Atlas picks.
export const NPS_POI_LAYER='https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_POIs_Geographic/FeatureServer/0/query';

const unsuitable=/restroom|comfort station|toilet|parking|maintenance|staff only|employee|administration|utility|sewer|pump station|fee collection|storage|staff housing|residence|radio tower|service road/i;
// Numbered facilities are often legitimate POIs but not compelling destinations.
// Preserve distinct named pavilions and landmarks; suppress generic numbered sites.
const genericFacility=/^(?:pavilion|picnic shelter|picnic site|shelter|site|campsite|camp site|group shelter)\s*(?:#|no\.?\s*)?\d+[a-z]?$/i;
const categories=[
  {match:/overlook|viewpoint|scenic|vista|panorama|waterfall|falls/i,category:'picnic',label:'Scenic overlooks',minutes:35,why:'A scenic viewpoint to consider along the road.'},
  {match:/trailhead|trail|greenway|boardwalk|nature walk|footpath|hiking/i,category:'walk',label:'Trails & walks',minutes:50,why:'A potential walking stop. Confirm leash rules and whether this particular trail permits dogs.'},
  {match:/picnic|wayside|day use|recreation area/i,category:'picnic',label:'Picnic & outdoor stops',minutes:40,why:'A possible picnic or outdoor rest area.'},
  {match:/lake|river|shore|beach|waterfront|water access/i,category:'water',label:'Water & landscapes',minutes:40,why:'A waterside landscape; check water safety and dog restrictions.'},
  {match:/historic|heritage|monument|interpretive|visitor center|museum|exhibit|memorial/i,category:'attraction',label:'Historic & visitor places',minutes:35,why:'A place to learn about the area. Indoor areas may prohibit pets.'},
  {match:/garden|nature|wildlife|forest|canyon|cave|landscape/i,category:'walk',label:'Nature & landscape',minutes:45,why:'A notable natural setting. Visitor and dog rules vary.'},
];

export function npsPlaceFromFeature(feature){
  const a=feature?.properties||feature?.attributes||{},p=feature?.geometry;
  const coords=Array.isArray(p?.coordinates)?p.coordinates:
    Number.isFinite(p?.x)&&Number.isFinite(p?.y)?[p.x,p.y]:null;
  const location={lat:Number(coords?.[1]),lng:Number(coords?.[0]),label:a.POINAME};
  const name=String(a.POINAME||'').trim();
  const type=String(a.POITYPE||'');
  const status=String(a.POISTATUS||'');
  if(!name||name.length>210||!validPoint(location))return null;
  if(unsuitable.test(name+' '+type) || genericFacility.test(name) || /closed|inactive|removed|proposed|demolished/i.test(status))return null;
  if(/^(no|false|0)$/i.test(String(a.OPENTOPUBLIC||''))||
     /^(no|false|0)$/i.test(String(a.PUBLICDISPLAY||'')))return null;
  const group=categories.find(t=>t.match.test(type+' '+name));
  if(!group)return null;
  const unit=String(a.UNITNAME||'').trim();
  const code=String(a.UNITCODE||'').trim().toLowerCase();
  const url=/^[a-z0-9]{4,6}$/.test(code)?'https://www.nps.gov/'+code+'/index.htm':null;
  const id=String(a.OBJECTID??a.FEATUREID??name+':'+location.lat+','+location.lng).slice(0,100);
  return {id:'nps-'+id,name,category:group.category,categoryLabel:group.label,
    minutes:group.minutes,location,why:group.why+(unit?' Part of '+unit+'.':''),
    dog:'National Park Service location; pet access is NOT verified. Many park trails and buildings restrict dogs. Check the specific park rules.',
    confidence:'official-location',source:'National Park Service public POI',hours:'',
    links:url?[{label:'Official NPS park information',url}]:[],
    notes:'Reference point only: check actual parking, entry and accessibility before stopping.'};
}

export function npsPOIQuery(point,{radius=18000}={}){
  if(!validPoint(point))throw Error('Choose a valid search location.');
  const meters=Math.max(5000,Math.min(25000,Math.round(Number(radius)||18000)));
  return new URLSearchParams({
    f:'geojson',where:'POINAME IS NOT NULL',geometry:JSON.stringify({
      x:point.lng,y:point.lat,spatialReference:{wkid:4326}
    }),geometryType:'esriGeometryPoint',inSR:'4326',outSR:'4326',
    spatialRel:'esriSpatialRelIntersects',distance:String(meters),
    units:'esriSRUnit_Meter',outFields:'OBJECTID,POINAME,POITYPE,POISTATUS,OPENTOPUBLIC,PUBLICDISPLAY,UNITCODE,UNITNAME',
    returnGeometry:'true',resultRecordCount:'150'
  });
}

export async function discoverNpsActivities(point,{signal,request=fetch,radius=18000}={}){
  const url=NPS_POI_LAYER+'?'+npsPOIQuery(point,{radius}).toString();
  const timeout=signal?AbortSignal.any([signal,AbortSignal.timeout(9500)]):AbortSignal.timeout(9500);
  const response=await request(url,{signal:timeout,referrerPolicy:'origin',credentials:'omit'});
  if(!response.ok)throw Error('NPS places are temporarily unavailable (HTTP '+response.status+').');
  const data=await response.json();
  if(data?.error||!Array.isArray(data?.features))throw Error('NPS places returned an invalid response.');
  const out=[],seen=new Set(),counts=new Map();
  for(const f of data.features){
    const activity=npsPlaceFromFeature(f);
    if(!activity||seen.has(activity.id)||distanceMiles(point,activity.location)>Math.max(5,radius/1609.34+1))continue;
    const count=counts.get(activity.category)||0;if(count>=5)continue;
    seen.add(activity.id);counts.set(activity.category,count+1);out.push(activity);
  }
  return out.sort((a,b)=>distanceMiles(point,a.location)-distanceMiles(point,b.location)).slice(0,14);
}
