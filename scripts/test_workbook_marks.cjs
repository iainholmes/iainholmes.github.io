/* Workbook artwork, pin preservation and isolated next-publication regression. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const protectedFiles=['daily-econ-challenge/index.html','daily-watchlist-5/index.html','daily-watchlist-5/artwork.js','daily-watchlist-5/artwork-archive.js','weekly-economics-environment/index.html','personal-updates/mobile/mobile.js','personal-updates/commonplace/index.html','personal-updates/handbook/index.html','personal-updates/mobile-shelf.js'];
const sourceBefore=Object.fromEntries(protectedFiles.map(f=>[f,read(f)]));
const marks=require('../personal-updates/issue-marks.js'),archive=require('../personal-updates/issue-mark-archive.js');
const data=JSON.parse(read('daily-econ-challenge/index.html').match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]);
let count=0;function equal(a,b,label){assert.deepEqual(a,b,label);count++}function check(a,label){assert(a,label);count++}
const base=process.env.SHELF_BASE||'9e7c8f2fdaa26ae01f2988c0c062155baff399a5',old={module:{exports:{}}};
vm.runInNewContext(cp.execFileSync('git',['show',base+':personal-updates/issue-mark-archive.js'],{cwd:process.env.PERIODICALS_TEST_GIT_ROOT||root,encoding:'utf8'}),old);
for(const [key,value] of Object.entries(old.module.exports))if(key!=='cp:2026-10-08')equal(JSON.stringify(archive[key]),JSON.stringify(value),'historical pin unchanged: '+key);
const latest=archive['cp:2026-10-08'];equal(latest.version,4);equal(latest.composition,'quantile-bands');equal(latest.questionPositions,[1]);check(!latest.frozen.includes('rotate('),'new cover is not a rotated yesterday');
for(const date of ['2026-10-05','2026-10-07'])check(marks.workbookSignature(latest)!==marks.workbookSignature(archive['cp:'+date]),'latest structural identity differs');
equal(marks.workbookSignature(archive['cp:2026-10-05']),marks.workbookSignature(archive['cp:2026-10-07']),'legacy rotation is correctly treated as one composition');
equal(marks.svg(latest),latest.frozen,'pinned bytes authoritative');equal(marks.model({key:'cp',date:latest.date,no:999,questions:[]}),latest,'later edits cannot regenerate a pin');
const published=data.editions.at(-1);
check(read('personal-updates/index.html').includes(archive['cp:'+published.date].frozen),'embedded no-script cover agrees with latest actual set');
const fx=require('./fixtures/art-originality.cjs'),controlled=fx.baselineHistory(),privateArchive=structuredClone(controlled.covers),privateMarks=fx.isolatedMarks(privateArchive),questions=[{field:'Econometrics',stem:'Interpret conditional median quantile regression.',concepts:['Conditional quantiles']}];
const start=fx.addDays(fx.nextDate(controlled),14),signatures=[],inputs=[];let exhausted=false;
for(let i=0;i<256;i++){
 const date=fx.addDays(start,i),info={key:'cp',date,no:Object.keys(controlled.workbook).length+1+i,questions};let m;
 try{m=privateMarks.model(info)}catch(e){check(/all \d+ supported authored scenes collide/.test(e.message),'actionable finite-pool exhaustion');exhausted=true;break;}
 equal(privateMarks.model(info),m,'deterministic same input');check(!signatures.includes(m.signature),'all prior fixture compositions excluded');equal(m.subject,'quantiles');check(privateMarks.validateOriginality(m,privateArchive).ok);signatures.push(m.signature);inputs.push(info);privateArchive['cp:'+date]={...m,frozen:privateMarks.svg(m)};
}
check(signatures.length>=2,'controlled archive supports distinct repeated-concept treatments');check(exhausted,'full history never cycles');
const first=privateArchive['cp:'+inputs[0].date],without=structuredClone(controlled.covers),withFirst={...without,['cp:'+first.date]:first},later=inputs[1];
equal(fx.isolatedMarks(without).model({...later,history:[first]}),fx.isolatedMarks(withFirst).model(later),'restored client reconstructs complete prepared history');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'workbook-publication-'));
try{
 fx.copySite(root,fixture);const appended=fx.append(fixture,['cp']),ar=appended.after.covers,m=ar['cp:'+appended.date],simulated=fx.data(fx.read(fixture,'daily-econ-challenge/index.html'),'challenge-data');
 check(m&&m.no===String(appended.workbook.no).padStart(3,'0'));check(marks.validateOriginality(m,archive).ok,'supplied authored test plate passes actual full live history');count+=fx.assertHistory(appended.after,appended.before);
 const hub=fx.read(fixture,'personal-updates/index.html'),candidate=appended.workbook,label=new Date(candidate.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 check(hub.includes(m.frozen),'fallback is the prepared pin');check(hub.includes('N<sup>o</sup>. '+m.no+' · '+label));check(hub.includes('data-cp="count">'+simulated.editions.length+'</b>'));check(hub.includes('data-cp-depth>'+simulated.editions.reduce((n,e)=>n+e.questions.length,0)+'</b>'));check(hub.includes('data-cp="title">'+candidate.questions.length+' questions · '+new Set(candidate.questions.map(q=>q.field)).size+' fields</p>'));check(hub.includes('_'+candidate.date+'_'),'append advances cache key');
 if(process.env.SHELF_FIXTURE){fs.mkdirSync(process.env.SHELF_FIXTURE,{recursive:true});fx.copySite(fixture,process.env.SHELF_FIXTURE);}
}finally{fs.rmSync(fixture,{recursive:true,force:true})}
// Legitimate later releases may append source data; the test must never rewrite any current public byte.
for(const f of protectedFiles)equal(read(f),sourceBefore[f],'current published source unchanged '+f);
const oldData=JSON.parse(cp.execFileSync('git',['show',base+':daily-econ-challenge/index.html'],{cwd:process.env.PERIODICALS_TEST_GIT_ROOT||root,encoding:'utf8'}).match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]);
for(const ed of oldData.editions)equal(data.editions.find(e=>e.date===ed.date),ed,'historical question set unchanged '+ed.date);
console.log(count+' Workbook artwork/publication assertions passed; next-set fixture was never published.');
