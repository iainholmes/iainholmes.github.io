/* No. 051 recovery: protect the complete pre-recovery archive and accepted design. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const root=require('node:path').resolve(__dirname,'..'),baseline='513d34466a1ee677abb770636605023be873b204';
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const old=p=>cp.execFileSync('git',['show',baseline+':'+p],{cwd:root,encoding:'utf8',maxBuffer:32e6});
const parse=s=>JSON.parse(s.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]);
const {registry,readCurrent}=require('./check_field_brief.cjs');
const art=require('../daily-watchlist-5/artwork'),plates=require('../daily-watchlist-5/artwork-archive'),marks=require('../personal-updates/issue-mark-archive'),memory=require('../personal-updates/editorial-memory');
const before=parse(old('daily-watchlist-5/index.html')),current=parse(read('daily-watchlist-5/index.html'));
const index=current.editions.findIndex(e=>e.date==='2026-11-18'),issue=current.editions[index];
assert.equal(index,50);assert.equal(current.editions.filter(e=>e.date===issue.date).length,1);
assert.deepEqual(current.editions.slice(0,index),before.editions,'every prior edition is exact');
assert.deepEqual(issue.stories.map(s=>s.number),['01','02','03','04','05']);
assert.equal(issue.stories[4].editorial.feature,'north-carolina');
assert.deepEqual(issue.editorialSelection.historyDates,memory.history(current.editions,issue.date).map(e=>e.date));
assert.equal(memory.review(issue.stories).needsEditorialDecision,false);
const priorMarks=registry(old('personal-updates/issue-mark-archive.js')),priorPlates=registry(old('daily-watchlist-5/artwork-archive.js'));
for(const [key,value]of Object.entries(priorMarks))assert.deepEqual(marks[key],value,key+' preserved');
assert.deepEqual(plates.legacy,priorPlates.legacy);
for(const [date,value]of Object.entries(priorPlates.issues))assert.deepEqual(plates.issues[date],value,date+' story plates preserved');
const expected=['fuel-price-basket','separate-service-outages','retirement-default-choice','voyager-light-day','large-load-cost-boundary'];
const generated=art.edition(issue,priorPlates.issues);
assert.deepEqual(generated,art.edition(issue,priorPlates.issues),'deterministic five-story preparation');
assert.deepEqual(generated,plates.issues[issue.date],'published candidate uses the authored story-specific scenes');
assert.deepEqual(Object.values(generated).map(m=>m.composition),expected);
assert.equal(new Set(art.scenes.map(s=>s.geometry)).size,art.scenes.length,'scene identities cannot disguise duplicated geometry');
for(const model of Object.values(generated)){
 assert(!Object.values(priorPlates.issues).flatMap(Object.values).some(m=>m.signature===model.signature),'new scene has no historical reuse');
 assert.equal(model.frozen,art.svg({...model,frozen:null}));
}
art.validateEdition(issue,generated,art.recent(priorPlates.issues,issue.date));
assert.equal(art.validateIssue(marks['fb:'+issue.date],marks).ok,true,'full-history cover gate');
assert.equal(readCurrent(root,issue.date).state,'complete');
const strip=s=>s.replace(/(<script type="application\/json" id="briefing-data">)[\s\S]*?(<\/script>)/,'$1DATA$2').replace(/artwork-archive\.js\?v=[^"]+/g,'artwork-archive.js?v=CACHE');
assert.equal(strip(read('daily-watchlist-5/index.html')),strip(old('daily-watchlist-5/index.html')),'accepted layout, behavior and IH design remain exact');
const paths=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json'],snap=()=>paths.map(read),initial=snap();
for(let i=0;i<2;i++){cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:root});assert.deepEqual(snap(),initial,'completed recovery is byte-idempotent');}
console.log('No. 051: all 50 prior editions, every historical cover/story pin, five deterministic original scenes, North Carolina order, full-history cover validation, accepted design and repeated preparation passed.');
