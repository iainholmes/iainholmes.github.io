/* Workbook artwork, pin preservation and isolated next-publication regression. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const marks=require('../personal-updates/issue-marks.js'),archive=require('../personal-updates/issue-mark-archive.js');
const data=JSON.parse(read('daily-econ-challenge/index.html').match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]);
let count=0;function equal(a,b,label){assert.deepEqual(a,b,label);count++}function check(a,label){assert(a,label);count++}
const base=process.env.SHELF_BASE||'9e7c8f2fdaa26ae01f2988c0c062155baff399a5',old={module:{exports:{}}};
vm.runInNewContext(cp.execFileSync('git',['show',base+':personal-updates/issue-mark-archive.js'],{cwd:root,encoding:'utf8'}),old);
for(const [key,value] of Object.entries(old.module.exports))if(key!=='cp:2026-10-08')equal(JSON.stringify(archive[key]),JSON.stringify(value),'historical pin unchanged: '+key);
const latest=archive['cp:2026-10-08'];equal(latest.version,4);equal(latest.composition,'quantile-bands');equal(latest.questionPositions,[1]);check(!latest.frozen.includes('rotate('),'new cover is not a rotated yesterday');
for(const date of ['2026-10-05','2026-10-07'])check(marks.workbookSignature(latest)!==marks.workbookSignature(archive['cp:'+date]),'latest structural identity differs');
equal(marks.workbookSignature(archive['cp:2026-10-05']),marks.workbookSignature(archive['cp:2026-10-07']),'legacy rotation is correctly treated as one composition');
equal(marks.svg(latest),latest.frozen,'pinned bytes authoritative');equal(marks.model({key:'cp',date:latest.date,no:999,questions:[]}),latest,'later edits cannot regenerate a pin');
check(read('personal-updates/index.html').includes(latest.frozen),'embedded no-script cover agrees');
const temporary=[];
try{
 const questions=[{field:'Econometrics',stem:'Interpret conditional median quantile regression.',concepts:['Conditional quantiles']}];
 const signatures=[];
 for(let i=0;i<12;i++){
  const date='2027-01-'+String(i+10).padStart(2,'0'),info={key:'cp',date,no:9+i,questions},m=marks.model(info);
  equal(marks.model(info),m,'deterministic same input');check(!signatures.slice(-3).includes(m.signature),'three preceding effective compositions excluded');
  equal(m.subject,'quantiles','recurring topic stays content-supported');check(!marks.svg(m).includes('rotate('));signatures.push(m.signature);archive['cp:'+date]={...m,frozen:marks.svg(m)};temporary.push('cp:'+date);
 }
 equal(new Set(signatures).size,4,'one recurring topic has four different structural pictures');
}finally{temporary.forEach(k=>delete archive[k])}
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'workbook-publication-'));
try{
 const files=['scripts/prepare_periodicals.cjs','daily-econ-challenge/learning-schema.cjs','daily-econ-challenge/index.html','daily-watchlist-5/index.html','daily-watchlist-5/artwork.js','daily-watchlist-5/artwork-archive.js','personal-updates/issue-marks.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html','weekly-economics-environment/field-study.js'];
 for(const f of files){fs.mkdirSync(path.dirname(path.join(fixture,f)),{recursive:true});fs.copyFileSync(path.join(root,f),path.join(fixture,f))}
 const candidate=structuredClone(data.editions.at(-1));candidate.no=9;candidate.date='2026-10-09';candidate.questions[0].field=candidate.questions[1].field;
 // Isolated metadata fixture, not a newly authored or publishable problem set.
 candidate.questions.forEach(q=>q.assistance+='<p>Unpublished pipeline fixture: '+candidate.date+' / '+q.id+'.</p>');
 const simulated=structuredClone(data);simulated.editions.push(candidate);const file=path.join(fixture,'daily-econ-challenge/index.html');fs.writeFileSync(file,read('daily-econ-challenge/index.html').replace(/(id="challenge-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+'\n'+JSON.stringify(simulated,null,2)+'\n'+b));
 const prepare=()=>cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:fixture,encoding:'utf8'});prepare();
 const first=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(fixture,f),'utf8')]));prepare();for(const f of files)equal(fs.readFileSync(path.join(fixture,f),'utf8'),first[f],'preparation rerun is byte-idempotent '+f);
 const generated={module:{exports:{}}};vm.runInNewContext(first['personal-updates/issue-mark-archive.js'],generated);const ar=generated.module.exports;
 for(const [key,value] of Object.entries(archive))equal(JSON.stringify(ar[key]),JSON.stringify(value),'preparation preserves published pin '+key);
 const m=ar['cp:'+candidate.date];check(m&&m.no==='009');equal(JSON.stringify(marks.model({key:'cp',date:candidate.date,no:9,questions:candidate.questions})),JSON.stringify(Object.fromEntries(Object.entries(m).filter(([k])=>k!=='frozen'))),'client generator agrees with prepared future cover');
 const later={key:'cp',date:'2026-10-12',no:10,questions:candidate.questions};archive['cp:'+candidate.date]=m;let pipeline;try{pipeline=marks.model(later)}finally{delete archive['cp:'+candidate.date]}
 equal(marks.model({...later,recent:[archive['cp:2026-10-07'],latest,m]}),pipeline,'a hub restored across two publications reconstructs the same recent context');
 const hub=first['personal-updates/index.html'];check(hub.includes(m.frozen),'future fallback cover matches');check(hub.includes('N<sup>o</sup>. 009 · 9 Oct 2026'));check(hub.includes('data-cp="count">9</b>'));check(hub.includes('data-cp-depth>72</b>'));check(hub.includes('data-cp="title">8 questions · 7 fields</p>'));check(hub.includes('issue-mark-archive.js?v=2026-10-08_2026-10-09_2026-10-02_'));
 if(process.env.SHELF_FIXTURE){fs.mkdirSync(process.env.SHELF_FIXTURE,{recursive:true});for(const f of files){fs.mkdirSync(path.dirname(path.join(process.env.SHELF_FIXTURE,f)),{recursive:true});fs.copyFileSync(path.join(fixture,f),path.join(process.env.SHELF_FIXTURE,f))}}
}finally{fs.rmSync(fixture,{recursive:true,force:true})}
for(const f of ['daily-econ-challenge/index.html','daily-watchlist-5/index.html','daily-watchlist-5/artwork.js','daily-watchlist-5/artwork-archive.js','weekly-economics-environment/index.html','personal-updates/mobile/mobile.js','personal-updates/commonplace/index.html','personal-updates/handbook/index.html'])equal(read(f),cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8'}),'frozen source unchanged '+f);
equal(read('personal-updates/mobile-shelf.js').replace("    // Keyboard focus selects a snap unit; pointer focus must not move the link mid-tap.\n    if(!mobile.matches||!event.target.matches(':focus-visible'))return;","    if(!mobile.matches)return;"),cp.execFileSync('git',['show',base+':personal-updates/mobile-shelf.js'],{cwd:root,encoding:'utf8'}),'shelf behavior changed only for pointer focus');
console.log(count+' Workbook artwork/publication assertions passed; simulated 009 was never published.');
