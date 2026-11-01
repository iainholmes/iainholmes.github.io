import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { durationLabel, opportunityZones, routeFamilies, journeySchedule, wholeJourneyBounds } from '../assets/js/core/journey.js';
import { validateDrivingGeometry } from '../assets/js/core/routing.js';
import { discoveryQuery, discoverActivities, activityFromOSM } from '../assets/js/core/discovery.js';

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
  const choose=view.slice(view.indexOf('const choose=button('),view.indexOf('function fitRoute()'));
  assert.ok(!choose.includes("stageTo('build-stage')"),'choosing a route must not scroll beyond the map');
});
test('Selective discovery query searches named feature tags in one result block',()=>{
  const query=discoveryQuery(chapelHill,{radius:6500});
  assert.ok(query.includes('around:6500,35.913,-79.056'));
  assert.equal((query.match(/out center/g)||[]).length,1);
  assert.ok(query.includes('[amenity~'));
  assert.ok(query.includes('[leisure~'));
  assert.ok(!query.includes('->.near'), 'avoid building an expensive unfiltered POI set');
  assert.ok(query.endsWith('out center 240;'));
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
await testAsync('DiscoverActivities accepts real-style OSM records and reports Overpass 200 runtime errors',async()=>{
  const fake={type:'node',id:11,lat:35.913,lon:-79.056,tags:{name:'A Test Ice Cream Shop',amenity:'ice_cream'}};
  const good=await discoverActivities(chapelHill,{radius:4000,request:async(_url,args)=>{
    assert.equal(args.method,'POST');
    assert.match(String(args.body.get('data')),/out center 240/);
    return {ok:true,status:200,json:async()=>({elements:[fake]})};
  }});
  assert.equal(good.length,1);
  assert.equal(good[0].name,'A Test Ice Cream Shop');
  await assert.rejects(discoverActivities(chapelHill,{request:async()=>({ok:true,status:200,json:async()=>({
    remark:'runtime error: Query timed out',elements:[]})})}),/processing limit/);
});

console.log(`Travel review: ${tests} focused checks passed; no live provider requests were made.`);
