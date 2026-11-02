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

test('Step 03 typography scales using defined Atlas typefaces and remains mobile-readable',()=>{
  const css=readFileSync(new URL('../assets/css/atlas.css',import.meta.url),'utf8');
  assert.ok(css.includes('--f-editorial:'));
  assert.ok(css.includes('--f-text:'));
  assert.ok(css.includes('font:400 clamp(41px,3.55vw,55px)/1.09 var(--f-editorial)'));
  assert.ok(css.includes('font:400 clamp(27px,2.35vw,38px)/1.22 var(--f-editorial)'));
  assert.ok(css.includes('font:400 clamp(16px,1.2vw,19px)/1.5 var(--f-text)'));
  assert.ok(css.includes('.page-travel .discovery-intro{font-size:18px}'));
});
test('NPS filters out generic numbered pavilions but preserves distinctive named places',()=>{
  const base={type:'Feature',geometry:{type:'Point',coordinates:[-79.08,35.91]},properties:{
    OBJECTID:123,POINAME:'Pavilion 4',POITYPE:'Picnic Site',POISTATUS:'Active',
    OPENTOPUBLIC:'Yes',PUBLICDISPLAY:'Yes'
  }};
  assert.equal(npsPlaceFromFeature(base),null);
  assert.equal(npsPlaceFromFeature({...base,properties:{...base.properties,POINAME:'Picnic Shelter #12'}}),null);
  const named=npsPlaceFromFeature({...base,properties:{...base.properties,POINAME:'Riverside Pavilion'}});
  assert.equal(named.name,'Riverside Pavilion');
});
test('Town search makes substantial off-route distances explicit',()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  assert.ok(view.includes('townOffset>25&&!nearDestination'));
  assert.ok(view.includes('Treat these as side-trip ideas, not convenient roadside stops.'));
  assert.ok(view.includes('new Set(official.map(a=>a.category)).size>=2'));
});

test('All four Travel chapters share the accepted Step 03 heading size and font',()=>{
  const css=readFileSync(new URL('../assets/css/atlas.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  const headings=['plan-stage','route-stage','build-stage','itinerary-stage'];
  for(const id of headings){
    assert.ok(html.includes('id="'+id+'"'),id+' missing');
    assert.ok(css.includes('.page-travel #'+id),id+' styling missing');
  }
  assert.ok(css.includes('Shared four-chapter typography'));
  assert.ok(css.includes('font:400 clamp(41px,3.55vw,55px)/1.09 var(--f-editorial)'),
    'retain Step 03 accepted 41–55px heading and established Atlas editorial font');
  assert.ok(css.includes('font:700 .34em/1.2 var(--f-editorial)'),
    'consistent step-number treatments');
  assert.ok(css.includes('.page-travel #route-stage > .stage-head > .sec-h'),
    'Step 02 nested heading must use the same style');
  assert.ok(css.includes('.page-travel #itinerary-stage #trip-summary'),
    'Step 04 supporting text needs proportional hierarchy');
  assert.ok(css.includes('.page-travel #plan-stage .journey-endpoints label'),
    'Step 01 field labels must be legible');
  assert.ok(html.includes('atlas.css?v=20261101-only-stage-title-velenor01'),
    'new stylesheet should not use stale cached URL');
});

test('Only the four numbered Travel headings use the Atlas wordmark face',()=>{
  const css=readFileSync(new URL('../assets/css/atlas.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('../travel/index.html',import.meta.url),'utf8');
  assert.ok(css.includes('--f-editorial: "VELENOR"'));
  assert.ok(css.includes('--f-text: "Latin Modern Roman"'));
  assert.ok(css.includes('font:400 clamp(41px,3.55vw,55px)/1.09 var(--f-editorial)'),
    'preserve the approved size of all four chapter titles');
  const boundary=css.slice(css.indexOf('Exact Travel typography rule, 2026-11-01'));
  assert.ok(boundary.includes('.page-travel .travel :is(h1,h2,h3,h4,h5,h6'),
    'every other Travel heading, including the page title, uses original Latin Modern Roman');
  assert.ok(boundary.includes('font-family:var(--f-text)'), 'use the original text family');
  assert.ok(boundary.includes(':is(#plan-h,#route-h,#build-h,#itinerary-h)'),
    'only these four headings are exceptions');
  assert.ok(boundary.includes(':is(#plan-h,#route-h,#build-h,#itinerary-h) > span'),
    'the step numerals must also use the title face');
  assert.ok(boundary.includes('font-family:var(--f-editorial)'), 'the numbered headings use VELENOR');
  for(const id of ['plan-h','route-h','build-h','itinerary-h'])
    assert.ok(html.includes('id="'+id+'"'),id+' missing');
  assert.ok(css.includes('font:400 clamp(29px,2.4vw,37px)/1.2 var(--f-text)'),
    'Trip Table uses Latin Modern Roman, not Dunhill or VELENOR');
  assert.ok(css.includes('font:400 clamp(17px,1.1vw,19px)/1.5 var(--f-text)'),
    'the itinerary introduction remains regular text');
  assert.ok(css.includes('atlas.css') && html.includes('atlas.css?v=20261101-only-stage-title-velenor01'),
    'fresh stylesheet URL');
  assert.ok(!boundary.includes('var(--f-secondary)'), 'no alternative heading face in the Travel override');
  assert.equal((css.match(/[{]/g)||[]).length,(css.match(/[}]/g)||[]).length);
});


await testAsync('Drive-section buttons remain live after town search and ignore stale overlapping results',async()=>{
  const view=readFileSync(new URL('../assets/js/travel-view.js',import.meta.url),'utf8');
  const start=view.indexOf('async function discoverJourney(){');
  const end=view.indexOf("$('explore-route').addEventListener",start);
  assert.ok(start>=0&&end>start,'discovery function was not found');
  assert.ok(view.includes('pauseAutomaticDiscovery?.();'),
    'town lookup must pause background requests without disabling route buttons');
  const segment=view.slice(start,end);
  const elements=new Map(),requests=[];
  const $=id=>{
    if(!elements.has(id))elements.set(id,{
      children:[],attributes:{},checked:true,value:id==='trip-detour'?'45':'',
      replaceChildren(...items){this.children=items;},
      append(...items){this.children.push(...items);},
      setAttribute(key,value){this.attributes[key]=value;},
      querySelectorAll(tag){return this.children.filter(item=>item.tag===tag);}
    });
    return elements.get(id);
  };
  const el=(tag,text,kind)=>({tag,text,kind});
  const button=(text,onClick)=>({
    tag:'button',text,click:onClick,attributes:{},
    setAttribute(key,value){this.attributes[key]=value;}
  });
  const zones=[
    {minute:115,point:{lat:1,lng:0}},
    {minute:230,point:{lat:2,lng:0}},
    {minute:345,point:{lat:3,lng:0}}
  ];
  const cachedDiscovery=(point,options)=>new Promise((resolve,reject)=>
    requests.push({point,options,resolve,reject}));
  const factory=new Function('
,'state','journeyRoute','resetDiscovery',
    'opportunityZones','overnightZones','el','activityCard','button',
    'durationLabel','cachedDiscovery','activityDetails','AbortController','AbortSignal',
    `let discoveryController=null,areaSearchController=null,pauseAutomaticDiscovery=null,version=0;
      ${segment}
      return {discoverJourney,getPause:()=>pauseAutomaticDiscovery};`);
  const demo=factory($,{family:{label:'Example'},destination:{lat:9,lng:0}},
    ()=>({}),()=>{},()=>zones,()=>[],el,
    activity=>({tag:'article',name:activity.name}),
    button,minute=>minute+' min',cachedDiscovery,
    activity=>{activity.detourMinutes=15;activity.progress=.5;},
    AbortController,AbortSignal);
  const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
  const running=demo.discoverJourney();
  await flush();
  const choices=$('route-activities').children;
  assert.equal(choices.length,3);
  assert.equal(requests[0].point.lat,2,'one middle-zone automatic request starts');
  choices[2].click();
  await flush();
  assert.equal(requests[1].point.lat,3,'clicking another area starts its search immediately');
  assert.equal(requests[0].options.signal.aborted,true,'previous lookup is canceled');
  assert.equal(choices[2].attributes['aria-pressed'],'true');
  requests[1].resolve([{id:'new',name:'New area park',location:{lat:3,lng:0},minutes:40}]);
  await flush();
  assert.equal($('route-activity-results').children[0].name,'New area park');
  requests[0].resolve([{id:'old',name:'Old area park',location:{lat:2,lng:0},minutes:40}]);
  await flush();
  assert.equal($('route-activity-results').children[0].name,'New area park',
    'stale results must not replace the most recent selection');
  demo.getPause()();
  choices[0].click();
  await flush();
  assert.ok(requests.some(r=>r.point.lat===1),
    'town lookup must not make the segment buttons nonresponsive');
  const last=requests.find(r=>r.point.lat===1);
  last.resolve([{id:'post-town',name:'Another area park',location:{lat:1,lng:0},minutes:40}]);
  await flush();
  assert.equal($('route-activity-results').children[0].name,'Another area park');
  assert.equal($('route-activity-results').attributes['aria-busy'],'false');
  const destination=requests.find(r=>r.point.lat===9);
  if(destination)destination.resolve([]);
  await running;
});

console.log(`Travel review: ${tests} focused checks passed; no live provider requests were made.`);
