'use strict';
const assert=require('node:assert/strict');
const wd=require('./periodicals-publication-watchdog.cjs');
let count=0;
function equal(a,b){assert.deepEqual(a,b);count++;}
equal(wd.eastern('2026-11-06T20:47:00Z'),{date:'2026-11-06',weekday:'Fri',minute:15*60+47});
equal(wd.eastern('2026-07-10T12:47:00Z'),{date:'2026-07-10',weekday:'Fri',minute:8*60+47});
equal(wd.due('2026-11-06T13:44:00Z').length,0);
equal(wd.due('2026-11-06T13:45:00Z').map(x=>x.key),['fb','cp']);
equal(wd.due('2026-11-06T20:44:00Z').map(x=>x.key),['fb','cp']);
equal(wd.due('2026-11-06T20:45:00Z').map(x=>x.key),['fb','cp','sp']);
equal(wd.due('2026-11-07T13:45:00Z').map(x=>x.key),['fb']);
equal(wd.due('2026-11-08T13:45:00Z').map(x=>x.key),['fb']);
equal(wd.due('2026-11-09T13:45:00Z').map(x=>x.key),['fb']);
equal(wd.due('2026-07-10T12:45:00Z').map(x=>x.key),['fb','cp']);
equal(wd.due('2026-07-10T19:45:00Z').map(x=>x.key),['fb','cp','sp']);
equal(wd.due('2026-11-06T13:46:00Z').map(x=>x.date),['2026-11-06','2026-11-06']);
equal(wd.editionHTML('<main><section class="edition" data-edition="2026-11-06"><article class="entry"></article></main>','2026-11-06').includes('article class="entry"'),true);
equal(wd.editionHTML('<main><section class="edition" data-edition="2026-10-30"></section></main>','2026-11-06'),null);
equal(wd.parseJSON('<script type="application/json" id="briefing-data">{"editions":[]}</script>','briefing-data').editions.length,0);
equal(wd.issueTitle(wd.due('2026-11-06T20:45:00Z').at(-1)),'[Publisher incident] Loblolly & Logit — 2026-11-06');
for(const d of wd.DEFINITIONS){
 equal(typeof d.url,'string');
 equal(d.grace>=30,true);
 equal(d.file.endsWith('/index.html'),true);
}
const fb=wd.audit({...wd.DEFINITIONS[0],date:'2026-11-06'});
equal(fb.state,'canonical_ready');
const cp=wd.audit({...wd.DEFINITIONS[1],date:'2026-11-06'});
equal(cp.state,'canonical_ready');
const ll=wd.audit({...wd.DEFINITIONS[2],date:'2026-11-06'});
equal(['missing','canonical_ready','incomplete'].includes(ll.state),true);
// Previous completed releases remain valid after the public hub advances.
equal(wd.audit({...wd.DEFINITIONS[0],date:'2026-11-05'}).state,'canonical_ready');
equal(wd.audit({...wd.DEFINITIONS[1],date:'2026-10-30'}).state,'canonical_ready');
equal(wd.audit({...wd.DEFINITIONS[2],date:'2026-10-30'}).state,'canonical_ready');
console.log(count+' scheduled-publisher, DST, canonical archive and incident classification checks passed.');
