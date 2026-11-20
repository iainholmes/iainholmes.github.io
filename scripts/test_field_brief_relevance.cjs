'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const art=require('../daily-watchlist-5/artwork'),plates=require('../daily-watchlist-5/artwork-archive'),marks=require('../personal-updates/issue-mark-archive');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),html=read('daily-watchlist-5/index.html'),data=JSON.parse(html.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]);
let n=0;const check=(v,m)=>{assert(v,m);n++},eq=(a,b,m)=>{assert.deepEqual(a,b,m);n++},throws=(f,re,m)=>{assert.throws(f,re,m);n++};
const original=data.editions.find(e=>e.date==='2026-11-19');
for(const [number,composition]of [['03','ai-investment-gap'],['04','heat-canopy'],['05','heat-exposure']])check(!art.relevance(original.stories.find(s=>s.number===number),composition).ok,'published mismatch identified '+number);
for(const scene of art.scenes)check(art.relevance({title:scene.label,category:'',summary:[]},scene.id).reason!=='No authored subject-relevance rule','every scene has an evidence rule '+scene.id);
const hipaa=original.stories[2],poison={...hipaa,editorial:{domain:'AI investment heat shelter',technologies:['heat exposure']},art:'heat',why:'Artificial intelligence investment faces productivity gaps and heat exposure.'};
for(const composition of ['ai-investment-gap','heat-canopy','heat-exposure'])eq(art.relevance(poison,composition).ok,false,'metadata, art hint and interpretation cannot manufacture support');
check(!art.relevance({title:'North Carolina allocates fiscal exposure',summary:['The financing risk rises.']},'heat-exposure').ok,'financial exposure is not heat');
check(!art.relevance({title:'Aid to Thailand',category:'Trade',summary:['Commercial investment.']},'ai-investment-gap').ok,'AI substrings do not imply AI investment');
check(!art.relevance({title:'New institutions',summary:['Unknown subject.']},'unknown-id').ok,'unknown scenes fail closed');
const warm={title:'Heat exposure rises for outdoor workers',category:'Public health',summary:['People face high temperatures.']};check(art.relevance(warm,'heat-exposure').ok,'supported heat exposure remains eligible');
check(art.relevance(original.stories[3],'trade-checkpoint').ok,'actual trade agreement supports a trade checkpoint rather than heat imagery');
const shaded={...warm,number:'01',summary:['People face heat while seeking shade and cooling shelters.']},first=art.story(shaded,'2026-11-20');
eq(art.story({...shaded,editorial:{domain:'AI heat finance'},art:'ai',why:'Exposure finance'},'2026-11-20'),first,'prospective selection and seed ignore metadata and interpretive contamination');
const alternate=art.story(shaded,'2026-11-20',[{}, {'01':first}]);check(alternate.signature!==first.signature,'three-issue avoidance preferred when another relevant scene exists');
throws(()=>art.story(shaded,'2026-11-20',[],new Set([first.signature,alternate.signature])),/No distinct, relevant/,'relevant vocabulary exhaustion cannot borrow an unrelated scene');
const healthScene=art.story({...hipaa,number:'01'},'2026-11-20');check(art.relevance(hipaa,healthScene.composition).ok&&healthScene.composition!=='ai-investment-gap','health-access rule can use a supported legal-document scene');
throws(()=>art.story({number:'01',title:'An unclassified development',category:'News',summary:['No depicted subject is supported.'],editorial:{domain:'ai'},art:'heat'},'2026-11-20'),/No subject-relevant/,'unsupported prose blocks rather than uses unrelated stock art');
const future=structuredClone(data.editions.find(e=>e.date==='2026-11-18'));future.date='2099-12-31';
const generated=art.edition(future,plates.issues);eq(generated,art.edition(future,plates.issues),'prospective preparation deterministic');
for(const st of future.stories)check(art.relevance(st,generated[st.number].composition).ok,'each selected scene has reported support');
eq(new Set(Object.values(generated).map(x=>x.signature)).size,5,'five distinct geometries');
check(Object.values(generated).every(x=>!Object.values(plates.issues['2026-11-19']).some(y=>x.signature===y.signature)),'yesterday is still excluded');
const bad=structuredClone(generated);bad['01']={...bad['01'],composition:'heat-exposure',signature:'plate:heat-exposure'};bad['01'].frozen=art.svg({...bad['01'],frozen:null});
throws(()=>art.validateEdition(future,bad,[]),/Subject-irrelevant/,'supplied valid geometry cannot bypass relevance');
throws(()=>art.prepare([future],{legacy:plates.legacy,issues:{[future.date]:bad}}),/Subject-irrelevant/,'supplied prospective pins validated on retry');
const repeated=structuredClone(generated);repeated['02']=repeated['01'];throws(()=>art.validateEdition(future,repeated,[]),/Repeated or invalid/,'originality gate retained');
art.validateEdition(original,plates.issues[original.date],art.recent(plates.issues,original.date));n++;
eq(art.prepare(data.editions,plates),plates,'all 52 historical pin entries unchanged on retry');
const paths=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json'],snap=paths.map(read);
for(let i=0;i<2;i++){cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:root});eq(paths.map(read),snap,'all historical bytes unchanged after preparation '+i);}
// An unsupported future append must stop the real transaction before any artifact writes.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fb-relevance-'));
try{
 for(const folder of ['scripts','personal-updates','daily-watchlist-5','daily-econ-challenge','weekly-economics-environment'])fs.cpSync(path.join(root,folder),path.join(dir,folder),{recursive:true});
 const draft=structuredClone(original);draft.date='2099-12-31';const appended={...data,editions:[...data.editions,draft]};
 fs.writeFileSync(path.join(dir,'daily-watchlist-5/index.html'),html.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(appended)+b));
 const before=paths.map(p=>fs.readFileSync(path.join(dir,p),'utf8')),run=cp.spawnSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:dir,encoding:'utf8'});
 check(run.status!==0&&/No subject-relevant/.test(run.stderr),'actual publisher fails before writes for unsupported prose');eq(paths.map(p=>fs.readFileSync(path.join(dir,p),'utf8')),before,'blocked future draft has no partial artifact/hub writes');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
// Preserve every historical published object and pin from the actual hotfix base.
const base='c9f386f61da5edd93728216f0df4b0bf344e768e';
const old=p=>cp.execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8',maxBuffer:32e6}),registry=require('./check_field_brief.cjs').registry;
for(const ed of JSON.parse(old('daily-watchlist-5/index.html').match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]).editions)eq(data.editions.find(e=>e.date===ed.date),ed,'historical editorial record '+ed.date);
const oldPlates=registry(old('daily-watchlist-5/artwork-archive.js'));eq(plates.legacy,oldPlates.legacy);
for(const [date,pins]of Object.entries(oldPlates.issues))eq(plates.issues[date],pins,'historical frozen story art '+date);
for(const [key,pin]of Object.entries(registry(old('personal-updates/issue-mark-archive.js'))))eq(marks[key],pin,'historical frozen cover '+key);
const issueMarks=require('../personal-updates/issue-marks');check(issueMarks.matchesHubIssue(read('personal-updates/index.html'),issueMarks.hubIssue('fb',data.editions)),'hub matches current canonical issue, including legitimate future appends');
for(const m of Object.values(marks).filter(x=>x.key==='fb'&&x.date>'2026-10-17'))check(art.validateIssue(m,marks).ok,'existing full-history cover gate '+m.date);
console.log(n+' story relevance, historical preservation, originality and fail-before-write checks passed.');
