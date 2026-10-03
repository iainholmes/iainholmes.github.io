import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trafficAvailable, trafficRoute, trafficProviderLabel } from '../assets/js/core/traffic.js';
import { parseTomtomTrafficRoute, tomtomSeverity } from '../assets/js/core/tomtom-traffic.js';
import { navigationLinks } from '../assets/js/core/navigation.js';
let checks=0;const check=fn=>{fn();checks++;};
const config={provider:'tomtom',apiKey:'synthetic-unit-fixture-key',allowedOrigins:['https://atlas.example']};
check(()=>assert.ok(trafficAvailable(config,'https://atlas.example')));
for(const patch of [{apiKey:''},{apiKey:'not a key'},{apiKey:'https://secret.example'},{provider:'other'}])check(()=>assert.equal(trafficAvailable({...config,...patch},'https://atlas.example'),false));
check(()=>assert.equal(trafficAvailable(config,'https://wrong.example'),false));
const coordinates=Array.from({length:9},(_,i)=>[-79+i/100,35+i/100]);
const fixture={routes:[{summary:{travelDurationInSeconds:2580,lengthInMeters:43612,trafficDelayDurationInSeconds:420},legs:[{path:{type:'LineString',coordinates}}],sections:{traffic:[
 {startPathIndex:1,endPathIndex:2,iconCategory:'roadWorks',delayMagnitude:'minor',delayDurationInSeconds:120},
 {startPathIndex:2,endPathIndex:3,iconCategory:'jam',delayMagnitude:'moderate'},
 {startPathIndex:3,endPathIndex:4,iconCategory:'jam',delayMagnitude:'major'},
 {startPathIndex:6,endPathIndex:7,iconCategory:'roadClosed',delayMagnitude:'undefined'},
]}}]};
const result=parseTomtomTrafficRoute(fixture,100);
check(()=>assert.equal(result.minutes,43));check(()=>assert.equal(result.miles,'27.1'));check(()=>assert.equal(result.fetchedAt,100));
check(()=>assert.equal(result.typicalSeconds,null));check(()=>assert.equal(result.delaySeconds,420));
check(()=>assert.equal(trafficProviderLabel(result),'Live Traffic · TomTom · +7 min vs free flow'));
check(()=>assert.deepEqual(result.features.map(f=>f.properties.traffic),['unknown','mild','moderate','heavy','unknown','closure','unknown']));
check(()=>assert.deepEqual(result.features.flatMap((f,i)=>i?f.geometry.coordinates.slice(1):f.geometry.coordinates),coordinates));
check(()=>assert.equal(result.unknownSegments,4));check(()=>assert.equal(result.incidents.length,4));
check(()=>assert.equal(result.incidents[0].description,'Road works · 2 min delay'));check(()=>assert.equal(result.incidents[3].closed,true));
for(const [patch,expected] of [[{delaySeconds:0},' · 0 min delay vs free flow'],[{delaySeconds:1},' · <1 min delay vs free flow'],[{delaySeconds:null},'']])check(()=>assert.equal(trafficProviderLabel({...result,...patch}),'Live Traffic · TomTom'+expected));
for(const section of [{delayMagnitude:'unknown'},{delayMagnitude:'undefined'},{delayMagnitude:'invented'},{delayDurationInSeconds:0,effectiveSpeedInKilometersPerHour:70},{}])check(()=>assert.equal(tomtomSeverity(section),'unknown'));
check(()=>assert.equal(tomtomSeverity({iconCategory:'roadClosed',delayMagnitude:'minor'}),'closure'));
const empty=structuredClone(fixture);delete empty.routes[0].sections;
check(()=>assert.equal(parseTomtomTrafficRoute(empty).features[0].properties.traffic,'unknown'));
const overlap=structuredClone(fixture);overlap.routes[0].sections.traffic.push({startPathIndex:1,endPathIndex:7,delayMagnitude:'minor',iconCategory:'jam'});
check(()=>assert.deepEqual(parseTomtomTrafficRoute(overlap).features.map(f=>f.properties.traffic),['unknown','mild','moderate','heavy','mild','closure','unknown']));
const duplicate=structuredClone(fixture);duplicate.routes[0].sections.traffic[0].eventId='same';duplicate.routes[0].sections.traffic.push({...duplicate.routes[0].sections.traffic[0]});
check(()=>assert.equal(parseTomtomTrafficRoute(duplicate).incidents.length,4));
for(const mutate of [d=>d.routes=[],d=>d.routes[0].summary.travelDurationInSeconds=NaN,d=>d.routes[0].summary.lengthInMeters=-1,d=>d.routes[0].legs.push({}),d=>d.routes[0].legs[0].path.coordinates[1]=[181,35],d=>d.routes[0].sections.traffic[0].endPathIndex=900,d=>d.routes[0].sections.traffic[0].startPathIndex=-1,d=>d.routes[0].sections.traffic[0].endPathIndex=0,d=>d.routes[0].sections.traffic={}]){const bad=structuredClone(fixture);mutate(bad);check(()=>assert.throws(()=>parseTomtomTrafficRoute(bad),/Live traffic/));}
let calls=[];const from={lng:-79,lat:35,address:'NEVER SEND THIS ADDRESS'},to={lng:-78,lat:36};
const route=await trafficRoute(from,to,{config,origin:'https://atlas.example',now:()=>300,request:async(url,opts)=>{
 calls.push(url);check(()=>assert.equal(new URL(url).origin,'https://api.tomtom.com'));
 check(()=>assert.equal(new URL(url).search,''));check(()=>assert.equal(opts.headers['TomTom-Api-Key'],config.apiKey));
 check(()=>assert.equal(opts.credentials,'omit'));check(()=>assert.equal(opts.cache,'no-store'));check(()=>assert.equal(opts.referrerPolicy,'origin'));
 if(url.endsWith('/calculate')){
  check(()=>assert.equal(opts.method,'POST'));check(()=>assert.equal(opts.headers['TomTom-Api-Version'],'3'));
  check(()=>assert.equal(opts.headers.Attributes,'routes.summary,routes.legs.path,routes.sections.traffic'));
  check(()=>assert.deepEqual(JSON.parse(opts.body),{routePlanningLocations:{origin:{type:'Point',coordinates:[-79,35]},destination:{type:'Point',coordinates:[-78,36]}},travelMode:'car',routeType:'fast',traffic:'live'}));
  return {ok:true,json:async()=>fixture};
 }
 check(()=>assert.equal(opts.headers['TomTom-Api-Version'],'2'));check(()=>assert.equal(opts.body,undefined));return {ok:true,text:async()=>'© TomTom\n© OpenStreetMap contributors'};
}});
check(()=>assert.equal(route.fetchedAt,300));check(()=>assert.equal(calls.length,2));check(()=>assert.ok(route.copyright.includes('TomTom')));
for(const status of [401,403,429,500,503]){let attempts=0;await assert.rejects(()=>trafficRoute(from,to,{config,origin:'https://atlas.example',request:async()=>{attempts++;return {ok:false,status};}}),/temporarily unavailable/);checks++;check(()=>assert.equal(attempts,1));}
await assert.rejects(()=>trafficRoute(from,to,{config,origin:'https://atlas.example',request:async url=>url.endsWith('/calculate')?{ok:true,json:async()=>fixture}:{ok:false,status:429}}),/temporarily unavailable/);checks++;
await assert.rejects(()=>trafficRoute(from,to,{config,origin:'https://wrong.example',request:()=>{throw Error('Wrong origin requested');}}),/not configured/);checks++;
check(()=>assert.deepEqual(navigationLinks(null,to),[]));
const links=navigationLinks(from,to),apple=new URL(links[0].href),google=new URL(links[1].href),waze=new URL(links[2].href);
check(()=>assert.equal(apple.searchParams.get('saddr'),'35,-79'));check(()=>assert.equal(apple.searchParams.get('daddr'),'36,-78'));check(()=>assert.equal(apple.searchParams.get('dirflg'),'d'));
check(()=>assert.equal(google.searchParams.get('api'),'1'));check(()=>assert.equal(google.searchParams.get('origin'),'35,-79'));check(()=>assert.equal(google.searchParams.get('destination'),'36,-78'));
check(()=>assert.equal(waze.searchParams.get('ll'),'36,-78'));check(()=>assert.equal(waze.searchParams.get('navigate'),'yes'));check(()=>assert.match(links[2].label,/current location/));
check(()=>assert.ok(!JSON.stringify(links).includes(from.address)));
check(()=>assert.ok(!readFileSync(new URL('../assets/js/traffic-config.js',import.meta.url),'utf8').includes(config.apiKey)));
console.log(`${checks} TomTom/coordinate-navigation assertions PASS (synthetic fixtures; real key verification pending).`);
