import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderEdition,renderWeek,esc} from '../assets/js/core/render.js';
import {selectCurrentPair} from '../assets/js/core/editions.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const manifest=json('data/editions/index.json'),photos=json('data/photos.json'),places=json('data/places.json');
const editions=Object.fromEntries(manifest.editions.map(e=>[e.id,json(e.path)]));
const ctx={base:'../',photos,places,history:manifest.editions,now:new Date('2026-10-08T18:00:00-04:00')};
let checks=0;const check=fn=>{fn();checks++;};
for(const id of ['2026-W41-tue','2026-W41-thu']){
 const e=editions[id],html=renderEdition(e,ctx);
 check(()=>assert.match(html,/<figure class="ed-hero adventure-illustration">/));
 check(()=>assert.ok(html.includes(esc(e.flagship.standfirst))));
 check(()=>assert.ok(html.includes(esc(e.conditions.summary))));
 check(()=>assert.ok(html.includes(esc(e.conditions.pivot.note))));
 // Same registered plate through the explicit artwork field remains equivalent.
 const explicit=structuredClone(e);explicit.flagship.artwork={image_id:e.flagship.photo.id};
 check(()=>assert.equal(renderEdition(explicit,ctx),html));
}
const ordinary=renderEdition(editions['2026-W40-thu'],ctx);
check(()=>assert.match(ordinary,/<figure class="ed-hero">/));
check(()=>assert.doesNotMatch(ordinary,/<figure class="ed-hero adventure-illustration">/));
const week=renderWeek(selectCurrentPair(manifest,ctx.now),editions,ctx);
check(()=>assert.equal((week.match(/data-editorial-plate/g)||[]).length,2));
for(const id of ['2026-W41-tue','2026-W41-thu']){
 const e=editions[id];
 for(const text of [e.flagship.standfirst,e.conditions.summary,e.conditions.trail_note])check(()=>assert.ok(week.includes(esc(text))));
 for(const day of e.conditions.days)check(()=>assert.ok(week.includes(esc(day.forecast))));
 check(()=>assert.ok(week.includes('edition/'+id+'/')));
}
// An ordinary photograph must not become a plate merely because it uses flagship.photo.
const photoEdition=structuredClone(editions['2026-W41-tue']);photoEdition.flagship.photo={id:'rupert-lawn-2023-01'};
check(()=>assert.match(renderEdition(photoEdition,ctx),/<figure class="ed-hero">/));
const pending=renderWeek(selectCurrentPair(manifest,new Date('2026-10-12T12:00:00-04:00')),editions,ctx);
check(()=>assert.equal((pending.match(/class="plate is-pending"/g)||[]).length,2));
check(()=>assert.doesNotMatch(pending,/data-editorial-plate|outing-info|<img/));
console.log(`${checks} editorial presentation/classification assertions PASS.`);
