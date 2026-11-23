/* Explicitly authorized Nov 21–23 historical correction; no general reindex permission. */
'use strict';
const fs=require('fs'),cp=require('child_process'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const base='cbb41682564c981efed3032bb2c226cdb392e3af',root=require('path').resolve(__dirname,'..');
process.chdir(root);
const read=p=>fs.readFileSync(p,'utf8'),old=p=>cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:32e6});
const parse=s=>JSON.parse(s.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]).editions;
const {registry,readCurrent}=require('./check_field_brief.cjs'),art=require('../daily-watchlist-5/artwork'),marks=require('../personal-updates/issue-marks'),memory=require('../personal-updates/editorial-memory');
const editions=parse(read('daily-watchlist-5/index.html')),before=parse(old('daily-watchlist-5/index.html'));
const audit=JSON.parse(read('docs/field-brief-recovery-20261123/correction.json'));
let assertions=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++},check=(a,m)=>{assert(a,m);assertions++};
eq(audit.baseCommit,base);eq(new Set(editions.map(e=>e.date)).size,editions.length);
eq(editions.filter(e=>e.date<='2026-11-23').length,56);
for(const e of before){
 const current=structuredClone(editions.find(x=>x.date===e.date));
 if(e.date==='2026-11-23'){eq(audit.originalMondaySelection,e.editorialSelection);current.editorialSelection=e.editorialSelection;}
 eq(current,e,'all existing editorial content preserved '+e.date);
}
eq(editions.filter(e=>e.date<='2026-11-23').reduce((n,e)=>n+e.stories.length,0),280);
const currentMarks=require('../personal-updates/issue-mark-archive'),oldMarks=registry(old('personal-updates/issue-mark-archive.js'));
for(const [id,pin]of Object.entries(oldMarks)){
 const current=structuredClone(currentMarks[id]);
 if(id==='fb:2026-11-23'){
  eq(audit.originalMondayCover,pin);eq(current.no,'056');eq(current.originality.compared,55);
  current.no='054';current.originality.compared=pin.originality.compared;
  current.frozen=current.frozen.replace('issue 056:','issue 054:').replace('· 056 ·','· 054 ·').replace('ISSUE 056 /','ISSUE 054 /');
 }
 eq(current,pin,'only Monday number labels may change '+id);
}
const plates=require('../daily-watchlist-5/artwork-archive'),oldPlates=registry(old('daily-watchlist-5/artwork-archive.js'));
eq(plates.legacy,oldPlates.legacy);
for(const [date,pin]of Object.entries(oldPlates.issues))eq(plates.issues[date],pin,'every published story plate stays exact '+date);
const context={module:{exports:{}}};vm.runInNewContext(old('daily-watchlist-5/artwork.js'),context);
for(const scene of context.module.exports.scenes)eq(JSON.parse(JSON.stringify(art.scenes.find(s=>s.id===scene.id))),JSON.parse(JSON.stringify(scene)),'existing scene definition preserved '+scene.id);
eq(new Set(art.scenes.map(s=>s.geometry)).size,art.scenes.length,'new names cannot conceal old geometry');
for(const date of ['2026-11-21','2026-11-22','2026-11-23']){
 const e=editions.find(e=>e.date===date),index=[...editions].sort((a,b)=>a.date.localeCompare(b.date)).findIndex(e=>e.date===date);
 eq(index+1,{'2026-11-21':54,'2026-11-22':55,'2026-11-23':56}[date]);
 eq(currentMarks['fb:'+date].no,String(index+1).padStart(3,'0'));
 eq(e.stories.map(s=>s.number),['01','02','03','04','05']);
 eq(e.stories[4].editorial.feature,'north-carolina');
 eq(e.editorialSelection.historyDates,memory.history(editions,date).map(e=>e.date));
 check(!e.editorialSelection.historyDates.some(d=>d>=date),'no look-ahead in review');
 for(const s of e.stories){
  const score=memory.assess(s,editions,date),stored=e.editorialSelection.assessments.find(a=>a.number===s.number);
  eq(stored.rawPenalty,score.rawPenalty);eq(stored.penalty,score.penalty);
  check(art.relevance(s,plates.issues[date][s.number].composition).ok,'subject supported by reported prose');
 }
 check(art.validateIssue(currentMarks['fb:'+date],currentMarks).ok,'all chronological cover constraints remain valid');
 art.validateEdition(e,plates.issues[date],art.recent(plates.issues,date));assertions++;
 eq(readCurrent(root,date).state,'complete','retry verifies existing edition instead of preparing another');
}
const monday=editions.find(e=>e.date==='2026-11-23');
eq(crypto.createHash('sha256').update(JSON.stringify(monday.stories)).digest('hex'),audit.protectedMondayStoriesSHA256);
const mondayRaw=s=>s.slice(s.indexOf('{\n  "date": "2026-11-23"'),s.indexOf('  "editorialSelection": {',s.indexOf('{\n  "date": "2026-11-23"')));
eq(mondayRaw(read('daily-watchlist-5/index.html')),mondayRaw(old('daily-watchlist-5/index.html')),'Monday story and framing source bytes remain exact');
check(marks.matchesHubIssue(read('personal-updates/index.html'),marks.hubIssue('fb',editions)),'hub represents Monday 056 and repaired archive counts');
for(const p of ['weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json','daily-econ-challenge/index.html','personal-updates/editorial-memory.js','personal-updates/mobile/mobile.js','personal-updates/commonplace/commonplace.js','.github/workflows/periodicals-publication-watchdog.yml'])eq(read(p),old(p),'unrelated publication and scheduling contract unchanged '+p);
const paths=['daily-watchlist-5/index.html','daily-watchlist-5/artwork.js','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json'],snap=paths.map(read);
for(let i=0;i<2;i++){cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs']);eq(paths.map(read),snap,'ordinary preparation is byte-idempotent '+i);}
console.log(assertions+' explicit historical correction, source-byte preservation, chronological review, artwork and retry assertions passed.');
