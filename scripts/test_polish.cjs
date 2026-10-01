const fs=require('fs'),assert=require('assert'),vm=require('vm'),{execFileSync}=require('child_process');
const baseline='960ef0700ed31ea3c4089b2fe7e13791e8da3a81';
const read=p=>fs.readFileSync(p,'utf8'),old=p=>execFileSync('git',['show',baseline+':'+p],{encoding:'utf8'});
// Publishing data and immutable artwork must survive a presentation-only pass byte for byte.
for(const p of ['daily-econ-challenge/index.html','daily-watchlist-5/index.html','weekly-economics-environment/index.html']){
 const blocks=s=>[...s.matchAll(/<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]);
 assert.deepEqual(blocks(read(p)),blocks(old(p)),p+' canonical data changed');
 for(const m of read(p).matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/application\/json|src=/.test(m[1]))new vm.Script(m[2],{filename:p});
}
for(const p of ['personal-updates/issue-mark-archive.js','personal-updates/issue-marks.js','personal-updates/editorial-memory.js','weekly-economics-environment/field-study.js','scripts/prepare_periodicals.cjs','scripts/review_field_brief.cjs'])assert.equal(read(p),old(p),p+' maintenance contract changed');
const hub=read('personal-updates/index.html');assert.equal((hub.match(/class="shelf-unit"/g)||[]).length,3);assert(!hub.includes('class="press-notes"'),'independent metadata scroller remains');
const units=[...hub.matchAll(/<div class="shelf-unit">([\s\S]*?)<\/article><\/div>/g)];assert.equal(units.length,3);assert.deepEqual(units.map(m=>m[1].match(/data-issue-mark="(\w+)"/)[1]),['fb','sp','cp']);for(const u of units)assert.equal((u[1].match(/class="press-note"/g)||[]).length,1);
assert(hub.includes('.shelf-unit{display:contents}'),'desktop two-row grid missing');assert(hub.includes('scroll-snap-type:x mandatory'));
for(const p of ['personal-updates/index.html','personal-updates/commonplace/index.html','personal-updates/handbook/index.html','weekly-economics-environment/index.html','daily-econ-challenge/index.html']){
 const s=read(p);assert(s.includes('family=Instrument+Sans'));assert(!s.includes('family=IBM+Plex+Sans+Condensed'),'unused condensed import');assert(s.includes('text-transform:uppercase'));
}
const ll=read('weekly-economics-environment/index.html'),hb=read('personal-updates/handbook/index.html'),book=read('daily-econ-challenge/index.html');assert(ll.includes('--sans:"Instrument Sans"'));assert(ll.includes("companionViewport=matchMedia('(max-width:1024px)')"));assert(ll.includes('if(!companionMobile())return;'));assert(ll.includes('@media(min-width:1025px){.perch,.heron-toggle{display:none!important}}'));assert(ll.includes('--editorial-title:"Ectros"'));assert(read('weekly-economics-environment/refinement.css').includes("font-family:'LM Roman Dunhill'"));assert(book.includes('font-family:var(--mono);font-size:.9em'),'technical treat literal lost monospace');assert(hb.includes('.mono{font-family:var(--mono)'));
for(const p of ['personal-updates/commonplace/index.html','personal-updates/handbook/index.html']){const s=read(p);assert(s.includes('body .pd-tools{background:var(--ground);color:var(--paper)}'));assert(s.includes('color-scheme:dark'));assert(s.includes('env(safe-area-inset-bottom,0px)'));}
assert(hb.includes('class="house-index">HOUSE INDEX'));assert(!hb.includes('class="hb-no"'));assert(!hb.includes('Number 21'));assert(hb.includes('.mast-side{align-items:flex-end;padding:12px 24px 0 0}'));
console.log('Polish regression: canonical data/artwork/contracts unchanged; paired shelf; UI font scope; uppercase, editorial/technical typography; dark safe-area controls; HOUSE INDEX; inline scripts passed.');
