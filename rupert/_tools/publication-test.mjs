import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { atlasModel } from '../assets/js/core/atlas.js';
import { selectCurrentPair, isReleased, pairKey } from '../assets/js/core/editions.js';
import { releaseProblem } from '../assets/js/core/publication.js';
import { nwsWeekend, fetchWeekendForecast, unavailableForecast } from '../assets/js/core/forecast.js';
import { nyTimestamp } from '../assets/js/core/dates.js';
import { renderWeek, renderAtlas, renderEdition, weatherProvenance } from '../assets/js/core/render.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const places=json('data/places.json'), photos=json('data/photos.json'), raw=json('data/editions/index.json');
const now=new Date('2026-10-08T16:55:00-04:00'),weekend={start:'2026-10-10',end:'2026-10-11'};
let n=0;const check=fn=>{fn();n++;};
const forecast={properties:{updateTime:'2026-10-08T20:48:13+00:00',periods:[
 {isDaytime:true,startTime:'2026-10-10T06:00:00-04:00',detailedForecast:'A chance of rain. High near 72. Chance of precipitation is 50%.'},
 {isDaytime:false,startTime:'2026-10-10T18:00:00-04:00',detailedForecast:'Rain and thunderstorms. Chance of precipitation is 90%.'},
 {isDaytime:true,startTime:'2026-10-11T06:00:00-04:00',detailedForecast:'Showers and thunderstorms. High near 79. Chance of precipitation is 90%.'}]}};
const url='https://api.weather.gov/gridpoints/RAH/66,42/forecast';
const conditions=nwsWeekend(forecast,weekend,{now,url});
check(()=>assert.equal(conditions.as_of,'2026-10-08T16:48:13-04:00'));
check(()=>assert.equal(conditions.days[0].forecast,forecast.properties.periods[0].detailedForecast));
check(()=>assert.equal(conditions.days[1].forecast,forecast.properties.periods[2].detailedForecast));
check(()=>assert.match(conditions.summary,/Saturday night: Rain and thunderstorms/));
check(()=>assert.equal(conditions.source.issued_at,forecast.properties.updateTime.replace('+00:00','.000Z')));
for(const broken of [{properties:{...forecast.properties,updateTime:'invalid'}},{properties:{...forecast.properties,updateTime:'2026-09-28T15:00:00-04:00'}},{properties:{...forecast.properties,updateTime:'2026-10-09T07:00:00-04:00'}},{properties:{...forecast.properties,periods:forecast.properties.periods.slice(0,2)}}])check(()=>assert.throws(()=>nwsWeekend(broken,weekend,{now,url})));
const requests=[];
const fetched=await fetchWeekendForecast({lat:35.4639,lng:-78.9142},weekend,{now,request:async(u,o)=>{requests.push({u,o});return{ok:true,json:async()=>u.includes('/points/')?{properties:{forecast:url}}:u.includes('/alerts/')?{features:[]}:forecast};}});
check(()=>assert.equal(requests.length,3));
check(()=>assert.ok(requests.every(r=>r.o.headers['User-Agent'].startsWith('TheRupertAtlas/'))));
check(()=>assert.ok(requests.every(r=>!r.u.includes('address')&&!JSON.stringify(r.o).includes('Home'))));
check(()=>assert.equal(fetched.alerts.length,0));
check(()=>assert.equal(fetched.alerts_checked_at,now.toISOString()));
await assert.rejects(()=>fetchWeekendForecast({lat:90,lng:0},weekend,{now}));n++;
await assert.rejects(()=>fetchWeekendForecast({lat:35.4639,lng:-78.9142},weekend,{now,request:async()=>({ok:false,status:503})}));n++;
const unavailable=unavailableForecast({now,reason:'NWS 503'});
check(()=>assert.equal(unavailable.kind,'unavailable'));check(()=>assert.ok(!unavailable.days));
check(()=>assert.match(weatherProvenance(unavailable),/Forecast unavailable/));
check(()=>assert.match(weatherProvenance({as_of:'2026-09-28T15:00:00-04:00',summary:'Outlook only'}),/Historical outlook/));
check(()=>assert.match(weatherProvenance(conditions),/Forecast snapshot/));
for(const [date,expected] of [['2026-10-08T20:55:00Z','2026-10-08T16:55:00-04:00'],['2026-11-05T12:00:00Z','2026-11-05T07:00:00-05:00']])check(()=>assert.equal(nyTimestamp(new Date(date)),expected));
const draft=json('data/editions/2026-W41-thu.json');draft.status='draft';draft.conditions=conditions;
const checks=[{place_id:draft.flagship.place_id,status:'open',checked:'2026-10-08',checked_at:'2026-10-08T20:40:00Z',official_url:'https://www.ncparks.gov/state-parks/raven-rock-state-park',discrepancy:false}];
const reviews=[{edition_id:draft.id,ready:true,reviewed_at:now.toISOString(),conditions_as_of:conditions.as_of,note:'Route, weather, safety, artwork and dog rules reviewed.'}];
const context={checks,officialHosts:['www.ncparks.gov'],reviews,now};
check(()=>assert.equal(releaseProblem(draft,context),null));
for(const override of [{now:new Date('2026-10-08T06:59:59-04:00')},{checks:[]},{reviews:[]},{checks:[{...checks[0],checked:'2026-09-30'}]},{checks:[{...checks[0],status:'closed'}]},{checks:[{...checks[0],discrepancy:true}]},{checks:[{...checks[0],official_url:'https://example.com/open'}]},{reviews:[{...reviews[0],ready:false}]},{reviews:[{...reviews[0],reviewed_at:'2026-10-08T19:00:00Z'}]},{reviews:[{...reviews[0],conditions_as_of:'2026-09-28T15:00:00-04:00'}]}])check(()=>assert.ok(releaseProblem(draft,{...context,...override})));
for(const changed of [{...draft,status:'published'},{...draft,conditions:{...conditions,checked_at:'invalid'}},{...draft,conditions:{...conditions,source:{...conditions.source,issued_at:'invalid'}}},{...draft,conditions:{...conditions,as_of:'2026-09-28T15:00:00-04:00'}},{...draft,conditions:unavailable,flagship:{...draft.flagship,condition_level:'normal'}}])check(()=>assert.ok(releaseProblem(changed,context)));
check(()=>assert.equal(releaseProblem({...draft,conditions:unavailable,flagship:{...draft.flagship,condition_level:'adverse'}},{...context,reviews:[{...reviews[0],conditions_as_of:unavailable.as_of}]}),null));
// Same real manifest drives This Week, Directory counts, picker and markers; drafts cannot earn a place.
const manifest=structuredClone(raw);manifest.editions.find(e=>e.id===draft.id).status='draft';
for(const [time,count,tue] of [['2026-10-05T12:00:00-04:00',3,false],['2026-10-06T07:00:00-04:00',4,true],['2026-10-08T16:55:00-04:00',4,true]]){
 const at=new Date(time),model=atlasModel(places,manifest,{now:at}),pair=selectCurrentPair(manifest,at);
 check(()=>assert.equal(model.counts.all,count));check(()=>assert.equal(model.features.length,count));
 check(()=>assert.equal(model.statuses.get('eno-cox-mountain').status,'withdrawn'));
 check(()=>assert.equal(model.statuses.has('occoneechee-mountain'),tue));
 check(()=>assert.equal(!!pair.tuesday,tue));check(()=>assert.equal(pair.thursday,null));
 check(()=>assert.ok(!renderAtlas(model,{base:'../'}).includes('data-place="raven-rock"')));
}
const published=structuredClone(manifest);Object.assign(published.editions.find(e=>e.id===draft.id),{status:'published',published_at:nyTimestamp(now)});
for(const [at,count,visible] of [[new Date(+now-1),4,false],[now,5,true]]){
 const model=atlasModel(places,published,{now:at}),pair=selectCurrentPair(published,at);
 check(()=>assert.equal(model.counts.all,count));check(()=>assert.equal(!!pair.thursday,visible));
 check(()=>assert.equal(model.statuses.has('raven-rock'),visible));
 check(()=>assert.equal(model.features.some(f=>f.properties.id==='raven-rock'),visible));
}
// Subsequent publication introduces an existing planning-only place, without manual Directory HTML.
const next={...published.editions.find(e=>e.id===draft.id),id:'2026-W42-tue',slot:'tuesday',place_id:'carolina-north-forest',place_roles:[{place_id:'carolina-north-forest',role:'flagship'}],weekend:{start:'2026-10-17',end:'2026-10-18'},published_at:'2026-10-13T07:12:00-04:00',status:'draft'};
const later={editions:[...published.editions,next]};
check(()=>assert.equal(atlasModel(places,later,{now:new Date('2026-10-13T08:00:00-04:00')}).counts.all,5));
next.status='published';
check(()=>assert.equal(atlasModel(places,later,{now:new Date('2026-10-13T07:11:59-04:00')}).counts.all,5));
check(()=>assert.equal(atlasModel(places,later,{now:new Date('2026-10-13T07:12:00-04:00')}).counts.all,6));
check(()=>assert.equal(selectCurrentPair(later,new Date('2026-10-13T08:00:00-04:00')).tuesday.id,next.id));
check(()=>assert.equal(isReleased({...next,published_at:'invalid'},now),false));
const pair=selectCurrentPair({...published,revision:'updated-weather'},now);
check(()=>assert.ok(pairKey(pair).endsWith('|updated-weather')));
check(()=>assert.notEqual(pairKey(pair),pairKey({...pair,revision:'earlier-weather'})));
check(()=>assert.match(renderWeek(pair,Object.fromEntries(raw.editions.map(e=>[e.id,json(e.path)])), {base:'',places,photos}),/data-pair="[^"]+updated-weather/));
const html=renderEdition(json('data/editions/2026-W41-tue.json'),{base:'../../',places,photos,now});
check(()=>assert.match(html,/class="edition-drive" data-place="occoneechee-mountain"/));
check(()=>assert.match(html,/Chapel Hill reference estimate/));
check(()=>assert.ok(!html.includes('saved Home')));
console.log(`${n} publication, forecast-provenance, Directory/map synchronization and Home-fallback assertions PASS.`);
