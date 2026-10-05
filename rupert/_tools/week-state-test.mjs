// Calendar slots and genuine publication; dates/status changes below are fixtures only.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectCurrentPair,archiveGroups,expectedPublish,pairKey} from '../assets/js/core/editions.js';
import {cycleWeekend} from '../assets/js/core/cycles.js';
import {veilState} from '../assets/js/core/veil.js';
import {renderWeek,renderArchive} from '../assets/js/core/render.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const manifest=json('data/editions/index.json'),photos=json('data/photos.json'),places=json('data/places.json');
const editions=Object.fromEntries(manifest.editions.map(e=>[e.id,json(e.path)]));
const released=structuredClone(manifest);
released.editions.find(e=>e.id==='2026-W41-thu').status='published';
const delayedTuesday=structuredClone(released);
delayedTuesday.editions.find(e=>e.id==='2026-W41-tue').status='draft';
let checks=0;const check=fn=>{fn();checks++;};
const cases=[
 ['Monday','2026-10-05T12:00:00-04:00',released,false,false],
 ['Tuesday before publication','2026-10-06T06:59:59-04:00',released,false,false],
 ['Tuesday publication','2026-10-06T07:00:00-04:00',released,true,false],
 ['Wednesday','2026-10-07T12:00:00-04:00',released,true,false],
 ['Thursday before publication','2026-10-08T06:59:59-04:00',released,true,false],
 ['Thursday publication','2026-10-08T07:00:00-04:00',released,true,true],
 ['Friday','2026-10-09T12:00:00-04:00',released,true,true],
 ['Saturday','2026-10-10T12:00:00-04:00',released,true,true],
 ['Sunday','2026-10-11T23:59:59-04:00',released,true,true],
 ['Delayed Tuesday','2026-10-06T15:00:00-04:00',delayedTuesday,false,false],
 ['Delayed Thursday','2026-10-08T15:00:00-04:00',manifest,true,false],
 ['Delayed Thursday weekend','2026-10-11T12:00:00-04:00',manifest,true,false],
 ['Next Monday','2026-10-12T00:00:00-04:00',released,false,false]
];
for(const [name,time,data,tuesday,thursday] of cases){
 const now=new Date(time),pair=selectCurrentPair(data,now),veil=veilState(data,now);
 const html=renderWeek(pair,editions,{base:'',photos,places,now});
 check(()=>assert.deepEqual(pair.weekend,cycleWeekend(now),name));
 check(()=>assert.equal(!!pair.tuesday,tuesday,name));
 check(()=>assert.equal(!!pair.thursday,thursday,name));
 check(()=>assert.equal(veil.current.tuesday.published,tuesday,name));
 check(()=>assert.equal(veil.current.thursday.published,thursday,name));
 check(()=>assert.equal((html.match(/class="plate is-pending"/g)||[]).length,2-Number(tuesday)-Number(thursday),name));
 for(const slot of ['tuesday','thursday']){
  const record=pair[slot];
  if(record){check(()=>assert.equal(record.weekend.start,pair.weekend.start));check(()=>assert.ok(new Date(record.published_at)<=now));}
  else{
   check(()=>assert.equal(pair.missing[slot],expectedPublish(slot,pair.weekend.start).toISOString()));
   const pending=html.match(new RegExp(`<article class="plate is-pending" id="plate-${slot}"[\\s\\S]*?</article>`))[0];
   check(()=>assert.doesNotMatch(pending,/<img|<a |outing-info|crowd-|snapshot|route|flagship/));
   check(()=>assert.match(pending,/7:00 AM ET/));
   for(const e of Object.values(editions))check(()=>assert.ok(!pending.includes(e.flagship.title),name+' leaks title'));
  }
 }
 check(()=>assert.doesNotMatch(html,/edition\/2026-W40/));
 check(()=>assert.equal(pairKey(pair),html.match(/data-pair="([^"]+)"/)[1]));
 const history=archiveGroups(data,now,pair),archive=renderArchive(history,{base:'',photos,places,now});
 for(const id of ['2026-W40-r1-tue','2026-W40-thu','2026-W40-tue'])check(()=>assert.match(archive,new RegExp('edition/'+id+'/')));
 check(()=>assert.ok(history.find(g=>g.weekend.start==='2026-10-03').editions.every(e=>!e.current)));
}
// A delayed release remains pending until its actual timestamp, without borrowing history.
const late=structuredClone(released);
late.editions.find(e=>e.id==='2026-W41-tue').published_at='2026-10-06T12:00:00-04:00';
for(const [time,visible] of [['2026-10-06T11:59:59-04:00',false],['2026-10-06T12:00:00-04:00',true]]){
 check(()=>assert.equal(!!selectCurrentPair(late,new Date(time)).tuesday,visible));
}
for(const time of ['2026-11-02T00:00:00-05:00','2026-03-09T00:00:00-04:00','2026-12-28T12:00:00-05:00','2027-01-04T00:00:00-05:00']){
 const now=new Date(time),pair=selectCurrentPair({editions:[]},now);
 check(()=>assert.deepEqual(pair.weekend,cycleWeekend(now)));
 check(()=>assert.equal(pair.tuesday,null));check(()=>assert.equal(pair.thursday,null));
 for(const slot of ['tuesday','thursday'])check(()=>assert.equal(pair.missing[slot],expectedPublish(slot,pair.weekend.start).toISOString()));
}
console.log(`${checks} current-week slot/publication/history assertions PASS.`);
