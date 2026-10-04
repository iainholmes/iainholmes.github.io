import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {renderOutingInfo,renderWeek,renderEdition,renderAtlas,chrome} from '../assets/js/core/render.js';
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
const state=veilState(manifest,new Date('2026-10-05T12:00:00-04:00'));
check(()=>assert.match(renderVeil(state,photos,'../'),/href="\.\.\/edition\/2026-W40-r1-tue\/"/));
check(()=>assert.ok(!renderVeil(state,photos,'../').includes('?veil=review')));
check(()=>assert.match(renderVeil(state,photos,'../',{title:'Trip',start:'2026-10-17'}),/travel\/#saved-trips/));
check(()=>assert.match(chrome({...ctx,active:'week',body:'',weekLabel:'Week 40'}),/rupert-portrait-outline\.svg/));
check(()=>assert.match(renderVeil(state,photos,''),/rupert-portrait-outline\.svg/));
const svg=readFileSync(new URL('../assets/img/rupert-portrait-outline.svg',import.meta.url),'utf8');
check(()=>assert.match(svg,/AE36F5F4-9591-433C-855E-FDD32AF594C1\.jpeg/));
check(()=>assert.ok(!svg.includes('<image')&&!svg.includes('base64')));
check(()=>assert.match(svg,/fill="none"/));
const veil=renderVeil(state,photos,'../');
check(()=>assert.match(veil,/veil-number-prefix">N<sup>o<\/sup>\./));
check(()=>assert.match(veil,/aria-label="Number 41"/));
check(()=>assert.match(veil,/Chapel Hill, N.C. · Saturday 10 Oct/));
check(()=>assert.equal((veil.match(/class="veil-almanac-item"/g)||[]).length,3));
check(()=>assert.equal((veil.match(/class="veil-almanac-symbol"/g)||[]).length,3));
check(()=>assert.ok(veil.indexOf('>Sunset<')<veil.indexOf('>Moon<')&&veil.indexOf('>Moon<')<veil.indexOf('>Daylight<')));
check(()=>assert.ok(!veil.includes('Home')));
const source=readFileSync(new URL('../assets/js/veil-view.js',import.meta.url),'utf8');
check(()=>assert.doesNotMatch(source,/reviewMode|reviewNow|veil=review|rupert-veil-review|display-mode:\s*standalone/));
// Golden markup from the physically approved acceptance commit 4a68d070.
// Review removal must not change production rendering at either active phase.
for(const [time,digest] of [
  ['2026-10-05T12:00:00-04:00','d619f66b939c64bed6cc9b70bc6eac242367017d2900055ce1b6aac470284107'],
  ['2026-10-07T12:00:00-04:00','a5cb2109514537b64e89a44256c21ed3f83ff66f6ebe527f6ef88faf8dcc926f']
])check(()=>assert.equal(createHash('sha256').update(renderVeil(veilState(manifest,new Date(time)),photos,'../')).digest('hex'),digest));
console.log(`${checks} final refinement source checks passed.`);
