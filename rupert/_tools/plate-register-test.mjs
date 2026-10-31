import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publishedPlates} from '../assets/js/core/plates.js';
import {renderPlateRegister,crowdVisual} from '../assets/js/core/render.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const manifest=json('data/editions/index.json'),photos=json('data/photos.json'),locks=json('data/artwork-locks.json');
const now=new Date(),entries=publishedPlates(manifest,photos,now),before=JSON.stringify({manifest,photos});
let checks=0;const check=f=>{f();checks++;};
check(()=>assert.deepEqual(entries.map(e=>e.image.plate_no),photos.photos.filter(p=>p.plate_no).map(p=>p.plate_no).sort((a,b)=>a-b)));
for(const {edition,image} of entries){
 check(()=>assert.equal(edition.photo_id,image.id));
 check(()=>assert.equal(locks.editions[edition.id].image_id,image.id));
 check(()=>assert.ok(new Date(edition.published_at)<=now));
}
const html=renderPlateRegister(manifest,{photos,base:'../../',now});
check(()=>assert.equal((html.match(/class="register-print"/g)||[]).length,entries.length));
check(()=>assert.match(html,/Recommendation withdrawn · Historical plate/));
check(()=>assert.ok(entries.some(e=>e.edition.status==='withdrawn')));
check(()=>assert.ok(entries.some(e=>!e.image.generation)));
for(const {edition,image} of entries){
 check(()=>assert.ok(html.includes(`../../edition/${edition.id}/`)));
 check(()=>assert.ok(html.includes(`../../photos/${image.file}-${Math.max(...image.widths)}.jpg`)));
}
// A future plate appears only after actual release, without a gallery-maintained list.
const im={id:'fixture-art',file:'fixture-art',plate_no:999,widths:[800],width:800,height:1000,alt:'An original test print & <safe>.'};
const ed={id:'fixture-edition',status:'draft',photo_id:im.id,published_at:now.toISOString(),title:'Fixture <title>'};
const p={photos:[...photos.photos,im]},m={editions:[...manifest.editions,ed]};
check(()=>assert.equal(publishedPlates(m,p,now).length,entries.length));ed.status='published';
check(()=>assert.equal(publishedPlates(m,p,now).at(-1).image.id,im.id));
check(()=>assert.match(renderPlateRegister(m,{photos:p,base:'../../',now}),/Fixture &lt;title&gt;/));
ed.published_at=new Date(+now+86400000).toISOString();
check(()=>assert.equal(publishedPlates(m,p,now).length,entries.length));
ed.published_at=now.toISOString();m.editions.push({...ed,id:'repeat',published_at:new Date(+now+1).toISOString()});
check(()=>assert.equal(publishedPlates(m,p,new Date(+now+2)).length,entries.length+1));
check(()=>assert.equal(JSON.stringify({manifest,photos}),before));
// Missing, partial, qualitative, numeric zero and complete readings remain honest.
for(const c of [null,{}, {typical_level:null,perceived_crowding:null}]){
 const h=crowdVisual(c);check(()=>assert.match(h,/No verified trail-level/));check(()=>assert.doesNotMatch(h,/crowd-line|crowd-scale|Not recorded/));
}
for(const c of [{typical_level:'Moderate'}, {perceived_crowding:'Busy'}]){
 const h=crowdVisual(c);check(()=>assert.equal((h.match(/class="crowd-scale"/g)||[]).length,1));check(()=>assert.doesNotMatch(h,/Not recorded|No verified/));
}
const q=crowdVisual({foot_traffic:'Land manager: seasonal use; trail, date and scope recorded.',attendance:0});
check(()=>assert.match(q,/Land manager: seasonal use/));check(()=>assert.match(q,/<dd>0<\/dd>/));check(()=>assert.doesNotMatch(q,/crowd-scale|No verified/));
check(()=>assert.equal((crowdVisual({typical_level:'Low',perceived_crowding:'Very Busy'}).match(/class="crowd-scale"/g)||[]).length,2));
console.log(`${checks} Plate Register provenance, release/privacy, future publication and crowd-state assertions PASS.`);
