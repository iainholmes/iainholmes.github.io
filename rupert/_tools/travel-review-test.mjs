import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { durationLabel, opportunityZones, routeFamilies, journeySchedule, wholeJourneyBounds } from '../assets/js/core/journey.js';
import { validateDrivingGeometry } from '../assets/js/core/routing.js';

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
console.log(`Travel review: ${tests} focused checks passed; no live provider requests were made.`);
