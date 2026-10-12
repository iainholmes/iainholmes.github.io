import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {renderOutingInfo,renderWeek,renderEdition,renderAtlas,chrome,photo,esc,titleCase} from '../assets/js/core/render.js';
import {selectCurrentPair} from '../assets/js/core/editions.js';
import {veilState} from '../assets/js/core/veil.js';
import {renderVeil} from '../assets/js/veil-view.js';
import {weatherParts} from '../assets/js/core/weather.js';
const json=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const manifest=json('data/editions/index.json'),photos=json('data/photos.json'),places=json('data/places.json');
const editions=Object.fromEntries(manifest.editions.map(e=>[e.id,json(e.path)]));
const ctx={base:'../',photos,places,history:manifest.editions,now:new Date('2026-10-02T16:00:00-04:00')};
let checks=0;const check=fn=>{fn();checks++;};
for(const e of Object.values(editions).filter(e=>e.status!=='withdrawn')){
 const html=renderOutingInfo(e),weather=weatherParts(e);
 check(()=>assert.match(html,/Outing at a glance/));
 check(()=>assert.match(html,/class="outing-metrics"/));
 for(const d of weather.days)check(()=>assert.ok(html.includes(d.forecast.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'))));
 if(weather.days.length)check(()=>assert.match(html,/<table class="outing-forecast">/));
 if(weather.trail)check(()=>assert.match(html,/class="outing-trail"/));
}
const week=renderWeek(selectCurrentPair(manifest,ctx.now),editions,ctx);
check(()=>assert.equal((week.match(/class="outing-info"/g)||[]).length,2));
const withdrawn=Object.values(editions).find(e=>e.status==='withdrawn');
check(()=>assert.match(renderEdition(withdrawn,ctx),/Recommendation Withdrawn/));
check(()=>assert.ok(renderEdition(withdrawn,ctx).includes(withdrawn.corrections.at(-1).note)));
check(()=>assert.ok(!renderEdition(withdrawn,ctx).includes('outing-info')));
const now=new Date('2026-10-05T12:00:00-04:00');
const state=veilState(manifest,now);
check(()=>assert.match(renderVeil(state,photos,'../'),/href="\.\.\/edition\/2026-W40-r1-tue\/"/));
check(()=>assert.ok(!renderVeil(state,photos,'../').includes('?veil=review')));
check(()=>assert.match(renderVeil(state,photos,'../',{title:'Trip',start:'2026-10-17'}),/travel\/#saved-trips/));
check(()=>assert.match(chrome({...ctx,active:'week',body:'',weekLabel:'Week 40'}),/rupert-portrait-outline\.svg/));
check(()=>assert.match(renderVeil(state,photos,''),/rupert-portrait-outline\.svg/));
const svg=readFileSync(new URL('../assets/img/rupert-portrait-outline.svg',import.meta.url),'utf8');
check(()=>assert.match(svg,/AE36F5F4-9591-433C-855E-FDD32AF594C1\.jpeg/));
check(()=>assert.ok(!svg.includes('<image')&&!svg.includes('base64')));
check(()=>assert.match(svg,/fill="none"/));
const veil=renderVeil(state,photos,'../',null,now);
check(()=>assert.match(veil,/veil-number-prefix">N<sup>o<\/sup>\./));
check(()=>assert.match(veil,/aria-label="Number 41"/));
check(()=>assert.match(veil,/Chapel Hill, N.C. · Monday 5 Oct/));
check(()=>assert.equal((veil.match(/class="veil-almanac-item"/g)||[]).length,3));
check(()=>assert.equal((veil.match(/class="veil-almanac-symbol"/g)||[]).length,3));
check(()=>assert.ok(veil.indexOf('>Sunset<')<veil.indexOf('>Moon<')&&veil.indexOf('>Moon<')<veil.indexOf('>Daylight<')));
check(()=>assert.ok(!veil.includes('Home')));
const source=readFileSync(new URL('../assets/js/veil-view.js',import.meta.url),'utf8');
check(()=>assert.doesNotMatch(source,/reviewMode|reviewNow|veil=review|rupert-veil-review|display-mode:\s*standalone/));
// Golden markup from the physically approved acceptance commit 4a68d070.
// Authorized differences: current-date almanac, and neutral/anonymous unreleased previews.
// Lock the corrected markup AND prove all other markup matches the physically approved golden.
for(const [time,approvedDigest,privateDigest] of [
  ['2026-10-05T12:00:00-04:00','c3e889203580d4e8fe01c1da7f8fc9042d599c67675760d5e0f57cdbabcc8451','748702edb2af49cfb357699c0b9c69a73d097111c6f9ed3dfa1d3d3becc92042'],
  ['2026-10-07T12:00:00-04:00','e89a6ee875e09fd981edd3e93c9f9236b4229e437b82cd5b2a43fb7ea6e63ef2','51df7426a5fb599f3ba742aba1f6f9821e38380bc4043952f80cada179ffc70c']
]){
  const state=veilState(manifest,new Date(time));
  const current=renderVeil(state,photos,'../',null,new Date(time)).replace(/<footer class="veil-almanac"[\s\S]*?<\/footer>/,'');
  const digest=html=>createHash('sha256').update(html).digest('hex');
  check(()=>assert.equal(digest(current),privateDigest));
  const pending=['tuesday','thursday'].filter(slot=>!state.current[slot].published);
  let index=0;
  const normalized=current.replace(/<div class="veil-tile is-pending"[\s\S]*?<\/div>/g,()=>{
    const slot=pending[index++],e=state.current[slot].edition,day=slot==='tuesday'?'Tuesday':'Thursday';
    const oldName=`${day} · ${titleCase(e.title)} · Unpublished, 7:00 AM ET`;
    return `<div class="veil-tile is-pending" aria-label="${esc(oldName)}"><span class="veil-thumbnail">${photo({id:e.photo_id},photos,'../',{sizes:'(min-width: 760px) 92px, 54px',eager:true,cls:'veil-image'})}</span><span class="veil-tile-copy"><strong>${day}</strong><span>7:00 AM ET</span></span></div>`;
  });
  check(()=>assert.equal(index,pending.length));
  check(()=>assert.equal(digest(normalized),approvedDigest));
}
console.log(`${checks} final refinement source checks passed.`);
