/* Prospective guards; all fixtures are isolated and no edition is published. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const fixture=require('./fixtures/art-originality.cjs'),{root,data,load}=fixture;
const live=fixture.currentHistory(root),historical=fixture.baselineHistory();
// Baseline entries remain immutable; append-only growth is deliberately allowed.
let assertions=fixture.assertHistory(live,historical);
const archive=structuredClone(historical.covers),field=structuredClone(historical.studies),marks=fixture.isolatedMarks(archive),art=require('../personal-updates/art-originality.js'),studies=require('../weekly-economics-environment/field-study.js');
const future=fixture.addDays(fixture.nextDate(historical),14),number=Object.keys(historical.workbook).length+1;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++},ok=(v,m)=>{assert(v,m);assertions++},reject=(f,re,m)=>{assert.throws(f,re,m);assertions++};
// Exercise the same preservation checker with actual historical mutations/missing entries.
for(const kind of ['covers','readingArt','brief','workbook','journal','studies','reviews']){
 const bad=structuredClone(live),id=Object.keys(historical[kind])[0];delete bad[kind][id];reject(()=>fixture.assertHistory(bad,historical),/immutable/,'missing historical '+kind+' rejected');
 const changed=structuredClone(live);changed[kind][id]=typeof changed[kind][id]==='string'?changed[kind][id]+' MUTATED':{...changed[kind][id],unauthorizedMutation:true};reject(()=>fixture.assertHistory(changed,historical),/immutable/,'changed historical '+kind+' rejected');
}
for(const group of [['2026-09-29','2026-09-30'],['2026-10-01','2026-10-02','2026-10-05','2026-10-07'],['2026-10-08','2026-10-23']]){
 const first=archive['cp:'+group[0]];for(const d of group.slice(1)){
  const m=archive['cp:'+d];eq(art.signature(m,'workbook'),art.signature(first,'workbook'),'known historical structural duplicate');eq(art.features(m).geometry,art.features(first).geometry,'known historical central geometry duplicate');
 }
}
eq(archive['cp:2026-10-23'].signature,'workbook:quantile-bands');eq(archive['cp:2026-10-23'].phrase,'Ranks & distributions');eq(art.central(archive['cp:2026-10-23']),art.central(archive['cp:2026-10-08']),'008/013 exact historical plate preserved');
eq(archive['sp:2026-10-23'].signature,'loblolly:financing-transect','Issue 005 cover included');
eq(field['2026-10-23'].concept,'risk');eq(field['2026-10-23'].composition,'valley');
for(const [layer,m,history,id] of [['cover',archive['sp:2026-10-23'],Object.fromEntries(Object.entries(archive).filter(([id])=>id.startsWith('sp:'))),'sp:2026-10-23'],['study',field['2026-10-23'],field,'2026-10-23']]){
 const result=art.review({...m,date:future,signature:'renamed:005'},history,layer);
 ok(!result.ok,layer+' recognizes published Issue 005 geometry');eq(result.id,id,'005 is the historical collision');
}
const wrap=s=>'<svg viewBox="0 0 600 800"><rect width="600" height="800" fill="#abcdef"/><g>'+s+'</g><path d="M42 570H558"/><text>Different metadata</text></svg>';
for(const [layer,prior]of [['workbook',archive['cp:2026-10-08']],['cover',archive['sp:2026-10-16']],['study',field['2026-10-02']]]){
 const history={'2026-10-23':prior},date=future,central=art.central(prior),candidate={...prior,date,signature:'renamed:new',composition:'renamed',frozen:wrap(central),html:null};
 ok(!art.review(candidate,history,layer).ok,layer+' exact central copy with new metadata rejected');
 for(const transform of ['rotate(90 300 300)','translate(600 0) scale(-1 1)','translate(3 5) scale(1.02)'])ok(!art.review({...candidate,frozen:wrap('<g transform="'+transform+'">'+central+'</g>')},history,layer).ok,layer+' transform cannot confer originality');
 ok(!art.review({...candidate,frozen:wrap(central.replace(/#[\da-f]{6}/gi,'#334455'))},history,layer).ok,layer+' recolor cannot confer originality');
 const perturbed=central.replace(/(\b(?:d|x|y|cx|cy|r|width|height)=")(.*?)(")/g,(_,a,s,b)=>a+s.replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)/g,n=>String(+n*1.008+1))+b);
 ok(!art.review({...candidate,frozen:wrap(perturbed)},history,layer).ok,layer+' small baked-coordinate perturbation rejected');
 const different=wrap('<circle cx="135" cy="160" r="35" fill="#1f4a3b"/><path d="M400 90V480H520" fill="none" stroke="#b4532e" stroke-width="15"/>');
 ok(art.review({...candidate,frozen:different},history,layer).ok,layer+' distinct scene with common primitives/palette allowed');
 reject(()=>art.validate({...candidate,signature:art.signature(prior,layer)},history,layer),/structural signature/,'historical identity fails independently');
}
const reused=archive['cp:2026-10-08'],reuseResult=art.review({...reused,date:future,signature:'new:frame',frozen:wrap(art.central(reused)+'<path d="M25 85H550V520" fill="none" stroke="#334455"/>')},{'cp:2026-10-08':reused},'workbook');
eq(reuseResult.reason,'substantial repeated geometry','additional furniture cannot hide substantial primitive reuse');
const questions=[{stem:'Interpret a conditional quantile regression.',concepts:['Quantiles']}],context={key:'cp',date:future,no:number,questions},generated=[];
try{
 // A private copy of the historical registry controls pool occupancy; live pins never change.
 let exhausted=false,selected=0;
 for(let i=0;i<256;i++){
  const date=fixture.addDays(future,i),input={...context,date,no:number+i};let m;
  try{m=marks.model(input)}catch(e){ok(/all \d+ supported authored scenes collide/.test(e.message),'finite pool fails with actionable exhaustion');exhausted=true;break;}
  eq(m.subject,'quantiles');eq(m.questionPositions,[1]);ok(marks.validateOriginality(m,archive).ok);
  const id='cp:'+date;archive[id]={...m,frozen:marks.svg(m)};generated.push(id);selected++;
 }
 ok(selected>0,'controlled fixture has content-supported unused candidates');ok(exhausted,'finite pool never silently cycles');
 reject(()=>marks.model({...context,date:fixture.addDays(future,300),recent:[]}),/all \d+ supported authored scenes collide/,'recent window cannot hide complete fixture history');
}finally{generated.forEach(id=>delete archive[id])}
const llInfo={key:'sp',date:future,no:Object.keys(historical.journal).length+1,framing:'Economic incidence and pass-through determine the burden on households and firms.'},cover=marks.model(llInfo);ok(marks.validateOriginality(cover,archive).ok,'relevant L&L cover passes');eq(cover.subject,'incidence');
const coverHistory=structuredClone(archive),coverMarks=fixture.isolatedMarks(coverHistory);let coverExhausted=false,coverCount=0;
for(let i=0;i<256;i++){
 const input={...llInfo,date:fixture.addDays(future,i),no:llInfo.no+i};let m;
 try{m=coverMarks.model(input)}catch(e){ok(/new unused content-supported composition/.test(e.message));coverExhausted=true;break;}
 ok(coverMarks.validateOriginality(m,coverHistory).ok);coverHistory['sp:'+input.date]={...m,frozen:coverMarks.svg(m)};coverCount++;
}
ok(coverCount>0);ok(coverExhausted,'cover exhaustion cannot rotate or change subject');
const info={date:future,no:llInfo.no,synthesis:llInfo.framing,history:field,cover:{...cover,frozen:marks.svg(cover)}},study=studies.artifact(info);ok(studies.validateOriginality(study,field,info.cover).ok);ok(studies.distinctFromCover(study,info.cover));
const boundary=field['2026-10-02'];
reject(()=>studies.validateOriginality({...boundary,date:info.date},field,info.cover),/originality/,'exact prior study rejected');
const valley=studies.artifact({date:fixture.addDays(future,1),no:info.no,synthesis:'Water flows and fish displacement alter river exposure',history:{}}),watershed={...valley,date:fixture.addDays(future,2),composition:'watershed',html:valley.html.replace(/M0 208Q140 92[^\"]*/, 'M0 170L240 312L600 129V390H0Z').replace(art.central(valley),'<g transform="translate(600 0) scale(-1 1)">'+art.central(valley)+'</g>')};
reject(()=>studies.validateOriginality(watershed,{[valley.date]:valley}),/originality/,'watershed and mirror do not invent a subject');
const nextWater=studies.artifact({date:watershed.date,no:info.no+1,synthesis:'Water flows and fish displacement alter river exposure',history:{[valley.date]:valley}});ok(nextWater.composition!==valley.composition);ok(studies.validateOriginality(nextWater,{[valley.date]:valley}).ok,'different supported water mechanism passes');
const riskHistory={...field},riskInfo={date:future,no:info.no,synthesis:'Risk pooling and insurance protect against uncertain losses',history:riskHistory},riskStudy=studies.artifact(riskInfo);
ok(studies.validateOriginality(riskStudy,field).ok,'new risk scene differs from Issue 005 shelter');
ok(studies.validateOriginality({...riskStudy,composition:'valley',signature:undefined},field).ok,'landscape family alone does not establish duplication');
let riskExhausted=false;
for(let i=0;i<256;i++){
 const input={...riskInfo,date:fixture.addDays(future,i)};let m;
 try{m=studies.artifact(input)}catch(e){ok(/new unused content-supported risk composition/.test(e.message));riskExhausted=true;break;}
 ok(studies.validateOriginality(m,riskHistory).ok);riskHistory[m.date]=m;
}
ok(riskExhausted,'Field Study exhaustion cannot recycle historical subjects');
reject(()=>studies.validateOriginality({...study,html:info.cover.frozen},{},info.cover),/same-edition/,'renamed cover cannot become Field Study');
// Test automatic generation on isolated known history as well as supplied authored
// pins on live history. Neither test depends on live scene-pool availability.
const automaticDir=fs.mkdtempSync(path.join(os.tmpdir(),'artwork-automatic-'));
try{
 fixture.copyControlledSite(root,automaticDir);const automatic=fixture.append(automaticDir,['fb','cp','sp'],{automatic:true});
 for(const key of ['fb','cp','sp']){const pin=automatic.after.covers[key+':'+automatic.date];ok(pin&&pin.frozen,'automatic '+key+' cover generated');ok(!pin.signature.startsWith('test-only:'),'actual generator, not supplied test pin');}
 ok(automatic.after.studies[automatic.date],'automatic Field Study generated');
}finally{fs.rmSync(automaticDir,{recursive:true,force:true})}
// Preparation uses a copy of current history, not the controlled unit-test registry.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'artwork-history-'));
try{
 fixture.copySite(root,dir);const prepare=()=>fixture.prepare(dir),snap=()=>fixture.snap(dir),before=snap();prepare();eq(snap(),before,'current production history is byte-idempotent');
 const pinsPath=path.join(dir,'personal-updates/issue-mark-archive.js'),pinsText=fs.readFileSync(pinsPath,'utf8'),missing=load(pinsText);delete missing['sp:2026-10-23'];fixture.writeRegistry(dir,'personal-updates/issue-mark-archive.js',missing);const absent=snap();reject(prepare,/Missing historical L&L cover pin/,'missing Issue 005 cover cannot regenerate');eq(snap(),absent,'missing pin writes nothing');fs.writeFileSync(pinsPath,pinsText);
 const llPath=path.join(dir,'weekly-economics-environment/index.html'),llDoc=fs.readFileSync(llPath,'utf8'),missingField=data(llDoc,'field-studies');delete missingField['2026-10-23'];fs.writeFileSync(llPath,fixture.replaceData(llDoc,'field-studies',missingField));const absentStudy=snap();reject(prepare,/Missing historical Field Study pin/);eq(snap(),absentStudy,'missing study writes nothing');fs.writeFileSync(llPath,llDoc);
 const appended=fixture.append(dir),after=appended.after,date=appended.date;
 assertions+=fixture.assertHistory(after,live);eq(Object.keys(after.brief).length,Object.keys(live.brief).length+1);eq(Object.keys(after.workbook).length,Object.keys(live.workbook).length+1);eq(Object.keys(after.journal).length,Object.keys(live.journal).length+1);
 const validPins=load(fs.readFileSync(pinsPath,'utf8')),validLL=fs.readFileSync(llPath,'utf8');
 for(const [key,oldId]of [['fb','fb:2026-10-17'],['cp','cp:2026-10-08'],['sp','sp:2026-10-16']]){
  const bad=structuredClone(validPins);bad[key+':'+date].frozen=live.covers[oldId].frozen;fixture.writeRegistry(dir,'personal-updates/issue-mark-archive.js',bad);const snapBad=snap();reject(prepare,/originality/,'supplied '+key+' duplicate rejected');eq(snap(),snapBad,'invalid supplied '+key+' writes nothing');fixture.writeRegistry(dir,'personal-updates/issue-mark-archive.js',validPins);
 }
 const badField=data(validLL,'field-studies');badField[date]={...badField[date],signature:'test-renamed',html:live.studies['2026-10-02'].html};fs.writeFileSync(llPath,fixture.replaceData(validLL,'field-studies',badField));const badStudy=snap();reject(prepare,/originality/,'supplied Field Study duplicate rejected');eq(snap(),badStudy,'invalid study writes nothing');fs.writeFileSync(llPath,validLL);
 const stable=snap();prepare();eq(snap(),stable,'all three appended publications retry without writes');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
console.log(assertions+' durable full-history artwork assertions passed; private fixtures and append-only growth verified.');
