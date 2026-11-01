import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { durationLabel, opportunityZones, routeFamilies, journeySchedule, wholeJourneyBounds } from '../assets/js/core/journey.js';
import { validateDrivingGeometry } from '../assets/js/core/routing.js';
import { discoveryQuery, discoverActivities, activityFromOSM } from '../assets/js/core/discovery.js';
import { npsPlaceFromFeature, npsPOIQuery, discoverNpsActivities } from '../assets/js/core/nps-places.js';
import { tomtomPlacesAvailable, tomtomPlaceRecord, discoverTomTomPlaces } from '../assets/js/core/tomtom-places.js';
import { placesConfig } from '../assets/js/places-config.js';

const point = (lat,lng,label='Place') => ({lat,lng,label});
const chapelHill=point(35.913,-79.056,'Chapel Hill, NC');
const newOrleans=point(29.95,-90.07,'New Orleans, LA');
const geometry = (a,b) => ({type:'Feature',properties:{mode:'drive'},geometry:{type:'LineString',coordinates:[[a.lng,a.lat],[b.lng,b.lat]]}});
const route=(a,b,minutes,miles)=>({feature:geometry(a,b),minutes,miles:String(miles)});
let tests=0;
const test=(name,fn)=>{fn();tests++;console.log('PASS',name);};

test('Duration values display in hours and minutes rather than raw huge minute counts',()=>{
  assert.equal(durationLabel(61),'1 h 1 min');
  assert.equal(durationLabel(90),'1 h 30 min');
  assert.equal(durationLabel(120),'2 h');
  assert.equal(durationLabel(3029),'50 h 29 min');
});
test('Plausible endpoints pass and grossly circuitous Chapel Hill–New Orleans geometry fails',()=>{
  assert.ok(validateDrivingGeometry(route(chapelHill,newOrleans,840,840),chapelHill,newOrleans));
  assert.throws(()=>validateDrivingGeometry(route(chapelHill,newOrleans,3000,2658),chapelHill,newOrleans),/circuitous/);
  assert.throws(()=>validateDrivingGeometry(route(chapelHill,newOrleans,840,840),point(48,-122),newOrleans),/reach the confirmed locations/);
});
test('Duplicate route families are removed',()=>{
  const one=route(chapelHill,newOrleans,850,840);
  const two=route(chapelHill,newOrleans,854,842);
  assert.equal(routeFamilies([one,two]).length,1);
});
test('Discovery offers representative segments, not dozens of mandatory breaks',()=>{
  const zones=opportunityZones(route(chapelHill,newOrleans,3200,2600));
  assert.ok(zones.length>0 && zones.length<=6);
  assert.ok(zones.every(z=>z.progress>0&&z.progress<1));
});
test('Full-route bounds retain both endpoints',()=>{
  const b=wholeJourneyBounds([route(chapelHill,newOrleans,840,840)],chapelHill,newOrleans);
  assert.ok(b[0][0]<=newOrleans.lng&&b[1][0]>=chapelHill.lng);
  assert.ok(b[0][1]<=newOrleans.lat&&b[1][1]>=chapelHill.lat);
});
test('Overnight stop resets the next departure to a new travel day',()=>{
  const legs=[{mode:'car',from:chapelHill,to:point(34,-84,'Midpoint')},{mode:'car',from:point(34,-84,'Midpoint'),to:newOrleans}];
  const s=journeySchedule(legs,[{minutes:300},{minutes:300}],{departure:'09:00',start:'2026-11-01',stops:[{name:'Midpoint',overnight:true,minutes:0}]});
  assert.equal(s.rows[0].nextDeparture,'2026-11-02 · 09:00');
  assert.equal(s.arrival,'2026-11-02 · 14:00');
});
test('Travel HTML exposes four stages and opt-in routing, with no break-cadence question',()=>{
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  for(const id of ['plan-stage','route-stage','build-stage','itinerary-stage'])assert.ok(html.includes('id="'+id+'"'));
  assert.ok(html.includes('id="trip-routing"'));
  assert.ok(!html.includes('id="trip-break"'));
  assert.ok(html.includes('../assets/js/travel-view.js'), 'Travel module should be present in generated page');
});
test('Travel code retains local trip save, export/import and automatic postcard features',()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  for(const feature of ['save-trip','export-trips','import-trips','automaticPostcard','chooseGeocodeCandidate','validateDrivingGeometry','stageTo'])assert.ok(view.includes(feature),feature);
});

test('Travel comparing routes never jumps past the map',()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  const provider=readFileSync(new URL('../assets/js/map/maplibre-provider.js',import.meta.url),'utf8');
  assert.ok(view.includes("comparison:'alternative'"),'alternative features must remain on the map');
  assert.ok(provider.includes("id:'travel-route-options'"),'alternatives must have a distinct visual layer');
  assert.ok(view.includes("stageTo('build-stage');"),'Build remains a deliberate user action');
  const choose=view.slice(view.indexOf('const choose=button('),view.indexOf('function fitRoute('));
  assert.ok(!choose.includes("stageTo('build-stage')"),'choosing a route must not scroll beyond the map');
});
test('Selective discovery query searches named feature tags in one result block',()=>{
  const query=discoveryQuery(chapelHill,{radius:3500});
  assert.ok(query.includes('around:3500,35.913,-79.056'));
  assert.equal((query.match(/out center/g)||[]).length,1);
  assert.ok(query.includes('["amenity"~'));
  assert.ok(query.includes('["leisure"~'));
  assert.ok(!query.includes('->.near'), 'avoid building an expensive unfiltered POI set');
  assert.ok(query.endsWith('out center 90;'));
});
test('Travel markup exposes explicit area search and a route comparison continuation',()=>{
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  const render=readFileSync(new URL('../assets/js/core/render.js',import.meta.url),'utf8');
  for(const id of ['stop-search-form','stop-search-results','stop-search-status','retry-discovery','explore-route'])
    assert.ok(html.includes('id="'+id+'"') && render.includes('id="'+id+'"'),id);
});
test('Unverified outdoor meal is a lead, not a dog-access claim',()=>{
  const a=activityFromOSM({id:99,type:'node',lat:35.91,lon:-79.05,tags:{name:'Test Cafe',amenity:'restaurant'}});
  assert.equal(a.category,'meal');
  assert.match(a.dog,/unverified/i);
  assert.equal(activityFromOSM({id:100,type:'node',lat:35.91,lon:-79.05,tags:{name:'No Dogs',amenity:'cafe',dog:'no'}}),null);
});
const testAsync=async(name,fn)=>{await fn();tests++;console.log('PASS',name);};
await testAsync('Provider-side 502 fails over once to an alternative public instance',async()=>{
  const fake={type:'node',id:88,lat:35.912,lon:-79.055,tags:{name:'A Test Garden',leisure:'garden'}};
  const urls=[];
  const result=await discoverActivities(chapelHill,{request:async(url)=>{
    urls.push(url);
    if(urls.length===1)return {ok:false,status:502};
    return {ok:true,status:200,json:async()=>({elements:[fake]})};
  }});
  assert.equal(urls.length,2);
  assert.ok(urls[0].includes('private.coffee'));
  assert.ok(urls[1].includes('overpass-api.de'));
  assert.equal(result[0].name,'A Test Garden');
});

await testAsync('DiscoverActivities accepts real-style OSM records and reports Overpass 200 runtime errors',async()=>{
  const fake={type:'node',id:11,lat:35.913,lon:-79.056,tags:{name:'A Test Ice Cream Shop',amenity:'ice_cream'}};
  const good=await discoverActivities(chapelHill,{radius:4000,request:async(_url,args)=>{
    assert.equal(args.method,'POST');
    assert.match(String(args.body.get('data')),/out center 90/);
    return {ok:true,status:200,json:async()=>({elements:[fake]})};
  }});
  assert.equal(good.length,1);
  assert.equal(good[0].name,'A Test Ice Cream Shop');
  await assert.rejects(discoverActivities(chapelHill,{request:async()=>({ok:true,status:200,json:async()=>({
    remark:'runtime error: Query timed out',elements:[]})})}),/timed out/);
});

test('Calm planner markup has search dialog, area chooser and whole-map feedback',()=>{
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  const source=readFileSync(new URL('../assets/js/core/render.js',import.meta.url),'utf8');
  for(const id of ['stop-search-dialog','open-town-search','route-activity-results','map-fit-feedback'])
    assert.ok(html.includes('id="'+id+'"')&&source.includes('id="'+id+'"'),id);
  assert.ok(html.includes('Show Entire Journey'));
  assert.ok(!html.includes('Fit Route</button>'));
});
test('Route-area chooser does not flood the screen with individual waiting panels',()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  assert.ok(view.includes("route-area-button"));
  assert.ok(view.includes("route-activity-results"));
  assert.ok(!view.includes("journey-segment'),heading"));
  assert.ok(view.includes("function fitRoute(announce=false)"));
});

test('Exploring places does not change a trip before confirmation',()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  const render=readFileSync(new URL('../assets/js/core/render.js',import.meta.url),'utf8');
  for(const id of ['trip-context','trip-context-route','trip-context-detail',
     'trip-change-dialog','trip-change-title','trip-change-route','trip-change-details',
     'confirm-trip-change','cancel-trip-change'])
    assert.ok(html.includes('id="'+id+'"')&&render.includes('id="'+id+'"'),id);
  assert.ok(view.includes('function reviewTripChange('));
  assert.ok(view.includes('function reviewActivityAddition('));
  assert.ok(view.includes("el('details',null,'activity-more')"));
  assert.ok(view.includes('if(approved)'));
  const action=view.slice(view.indexOf('function activityCard('),view.indexOf('async function cachedDiscovery('));
  assert.ok(action.includes('reviewActivityAddition(activity,destination)'));
  assert.ok(!action.includes('rebuild([...state.stops'), 'card clicks must not rebuild without a review');
});
test('Route-shaping waypoints are reviewed instead of added immediately',()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  const anchor=view.slice(view.indexOf("$('anchor-form').addEventListener"),view.indexOf("$('fit-trip').addEventListener"));
  assert.ok(anchor.includes('reviewTripChange('));
  assert.ok(anchor.includes('Recalculate via This Town'));
  assert.ok(anchor.includes('action:async()=>{await rebuild('));
});
test('Travel highlights the current corridor and clearly labels search as non-destructive',()=>{
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('Currently editing'));
  assert.ok(html.includes('Searching never changes your trip'));
  assert.ok(html.includes('Change the driving route via a town'));
  assert.ok(html.includes('Browse an area of your selected route'));
});


test('Travel map modes, explicit route navigation and noninteractive legend are in generated source',()=>{
 const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
 const canonical=readFileSync(new URL('../assets/js/core/render.js',import.meta.url),'utf8');
 const provider=readFileSync(new URL('../assets/js/map/maplibre-provider.js',import.meta.url),'utf8');
 for(const name of ['day','dusk','night']){
   assert.ok(html.includes('data-travel-theme="'+name+'"'),name);
   assert.ok(canonical.includes('data-travel-theme="'+name+'"'),name);
 }
 assert.ok(provider.includes('setTravelTheme(mode)'));
 assert.ok(html.includes('role="note" aria-label="Map legend"'));
 assert.ok(html.includes('Step 03 · Build the Journey'));
 assert.ok(html.includes('Refresh Route Suggestions'));
});
test('Town search continues after popup close and keeps a persistent results section',()=>{
 const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
 for(const id of ['town-results-section','town-results-cards','town-results-state','return-town-results'])
   assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(view.includes('persisted.replaceChildren(...buildCards())'));
 assert.ok(!view.includes("addEventListener('close',()=>areaSearchController?.abort())"));
 assert.ok(view.includes('interactive:true'));
 assert.ok(view.includes('function setMapAppearance(choice)'));
});
test('Manual place addition requires location confirmation and review before route mutation',()=>{
 const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
 assert.ok(html.includes('id="known-place-form"'));
 const snippet=view.slice(view.indexOf("$('known-place-form').addEventListener"),view.indexOf("$('anchor-form').addEventListener"));
 assert.ok(snippet.includes('resolveLocation('));
 assert.ok(snippet.includes('reviewActivityAddition(stop,'));
 assert.ok(!snippet.includes('rebuild(['));
});
test('Dedicated TomTom Search access is OFF until product, key and origin are verified',()=>{
 assert.equal(placesConfig.enabled,false);
 assert.equal(placesConfig.apiKey,'');
 assert.equal(tomtomPlacesAvailable(placesConfig,'https://iainholmes.github.io'),false);
 const mock={provider:'tomtom-search',enabled:true,apiKey:'example-dedicated-search-key-1234',allowedOrigins:['https://example.org']};
 assert.equal(tomtomPlacesAvailable(mock,'https://iainholmes.github.io'),false);
 assert.equal(tomtomPlacesAvailable(mock,'https://example.org'),true);
});
await testAsync('TomTom Orbis Places parser handles a real-schema mock with POI classification',async()=>{
 const config={provider:'tomtom-search',enabled:true,apiKey:'synthetic-search-key-0000001',allowedOrigins:['https://example.org']};
 let calls=0;const result=await discoverTomTomPlaces(chapelHill,{config,origin:'https://example.org',
  request:async(url,options)=>{
    calls++;
    assert.ok(url.endsWith('/maps/orbis/places/discover'));
    assert.equal(options.method,'POST');
    assert.equal(options.headers['TomTom-Api-Version'],'3');
    assert.equal(options.headers['TomTom-Api-Key'],config.apiKey);
    assert.ok(!url.includes(config.apiKey));
    const body=JSON.parse(options.body);
    assert.deepEqual(body.origin.coordinates,[-79.056,35.913]);
    return {ok:true,json:async()=>({results:[{id:'park-'+calls,type:'poi',title:'A Real Park',
      position:{type:'Point',coordinates:[-79.04,35.92]},poiTypes:[{id:'park',name:'Park'}]}]})};
  }});
 assert.equal(calls,3);
 assert.equal(result.length,3);
 assert.equal(result[0].name,'A Real Park');
 assert.match(result[0].dog,/unverified/);
 assert.equal(tomtomPlaceRecord({id:'bad',type:'address',title:'Not a POI',
   position:{coordinates:[-79,35]}},{key:'walk'}),null);
});


test('Travel stage transition is compact and the Google fallback is absent',()=>{
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  const render=readFileSync(new URL('../assets/js/core/render.js',import.meta.url),'utf8');
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  assert.ok(html.includes('class="route-next"')&&render.includes('class="route-next"'));
  assert.ok(!html.includes('class="route-followup"'));
  assert.ok(!view.includes('google.com/maps/search'));
  assert.ok(!view.includes('externalPlaceFallback'));
});
test('NPS POI queries are bounded near the explicitly chosen area',()=>{
  const params=npsPOIQuery(chapelHill,{radius:20000});
  assert.equal(params.get('f'),'geojson');
  assert.equal(params.get('distance'),'20000');
  assert.equal(params.get('returnGeometry'),'true');
  assert.deepEqual(JSON.parse(params.get('geometry')).x,-79.056);
  assert.equal(npsPOIQuery(chapelHill,{radius:100000}).get('distance'),'25000');
});
test('NPS POI parser preserves provenance, rejects closed and irrelevant features',()=>{
  const feature={type:'Feature',geometry:{type:'Point',coordinates:[-79.08,35.91]},properties:{
    OBJECTID:123,POINAME:'Riverside Overlook',POITYPE:'Scenic Overlook',POISTATUS:'Active',
    UNITNAME:'Test National Park',UNITCODE:'TEST',OPENTOPUBLIC:'Yes',PUBLICDISPLAY:'Yes'
  }};
  const park=npsPlaceFromFeature(feature);
  assert.equal(park.name,'Riverside Overlook');
  assert.equal(park.source,'National Park Service public POI');
  assert.match(park.dog,/NOT verified/);
  assert.equal(park.links[0].url,'https://www.nps.gov/test/index.htm');
  assert.equal(npsPlaceFromFeature({...feature,properties:{...feature.properties,POINAME:'Parking Lot'}}),null);
  assert.equal(npsPlaceFromFeature({...feature,properties:{...feature.properties,OPENTOPUBLIC:'No'}}),null);
  assert.equal(npsPlaceFromFeature({...feature,properties:{...feature.properties,POISTATUS:'Closed'}}),null);
});
await testAsync('Official NPS GeoJSON gives real source-labeled activity cards',async()=>{
  let requested=0;
  const results=await discoverNpsActivities(chapelHill,{request:async(url,opts)=>{
    requested++;
    assert.ok(url.includes('NPS_Public_POIs_Geographic'));
    assert.equal(opts.credentials,'omit');
    return {ok:true,json:async()=>({type:'FeatureCollection',features:[{
      type:'Feature',geometry:{type:'Point',coordinates:[-79.08,35.91]},properties:{
        OBJECTID:123,POINAME:'Riverside Overlook',POITYPE:'Scenic Overlook',
        OPENTOPUBLIC:'Yes',UNITCODE:'TEST'
      }
    }]})};
  }});
  assert.equal(requested,1);
  assert.equal(results.length,1);
  assert.equal(results[0].category,'picnic');
  assert.equal(results[0].confidence,'official-location');
});
test('Chain restaurants are not promoted as Rupert adventure suggestions',()=>{
  const sample={type:'node',id:99,lat:35.91,lon:-79.05,tags:{name:'Starbucks',amenity:'cafe'}};
  assert.equal(activityFromOSM(sample),null);
  assert.equal(activityFromOSM({...sample,tags:{name:'Dunkin',amenity:'cafe'}}),null);
  assert.equal(activityFromOSM({...sample,tags:{name:'Chapel Hill Ice Cream',amenity:'ice_cream'}}).category,'treat');
  assert.equal(activityFromOSM({...sample,tags:{name:'Chain',amenity:'cafe',brand:'National Coffee'}}),null);
});

console.log(`Travel review: ${tests} focused checks passed; no live provider requests were made.`);
