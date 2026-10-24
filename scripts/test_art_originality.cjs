/* Prospective guards; all fixtures are isolated and no edition is published. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),vm=require('node:vm');
const marks=require('../personal-updates/issue-marks.js'),art=require('../personal-updates/art-originality.js'),archive=require('../personal-updates/issue-mark-archive.js'),studies=require('../weekly-economics-environment/field-study.js');
const root=path.resolve(__dirname,'..'),base='edf28fa85a93c3462683aa8a00a86ee09bcd8c39',read=p=>fs.readFileSync(path.join(root,p),'utf8'),old=p=>cp.execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8',maxBuffer:20e6});
const data=(s,id)=>JSON.parse(s.match(new RegExp('id="'+id+'">([\\s\\S]*?)</script>'))[1]),load=s=>{const c={module:{exports:{}}};vm.runInNewContext(s,c);return JSON.parse(JSON.stringify(c.module.exports));};
const field=data(read('weekly-economics-environment/index.html'),'field-studies'),pastField=data(old('weekly-economics-environment/index.html'),'field-studies');
let assertions=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++},ok=(v,m)=>{assert(v,m);assertions++},reject=(f,re,m)=>{assert.throws(f,re,m);assertions++};
for(const [id,m]of Object.entries(load(old('personal-updates/issue-mark-archive.js'))))eq(archive[id],m,'immutable model/SVG '+id);
for(const [date,m]of Object.entries(pastField))eq(field[date],m,'immutable Field Study '+date);
for(const p of ['daily-watchlist-5/index.html','daily-watchlist-5/artwork.js','daily-watchlist-5/artwork-archive.js','daily-econ-challenge/index.html'])eq(read(p),old(p),'publication and Field Brief production bytes unchanged '+p);
for(const p of ['personal-updates/issue-mark-archive.js','weekly-economics-environment/notebook/index.html','weekly-economics-environment/notebook/reviews.json'])eq(read(p),old(p),'published registry/notebook bytes unchanged '+p);
const llSource=read('weekly-economics-environment/index.html'),llBaseline=old('weekly-economics-environment/index.html');
eq(llSource.match(/<main[^>]*id="edition"[^>]*>[\s\S]*?<\/main>/)[0],llBaseline.match(/<main[^>]*id="edition"[^>]*>[\s\S]*?<\/main>/)[0],'all five complete L&L editions retained byte for byte');
for(const id of ['field-register','companion-data'])eq(data(llSource,id),data(llBaseline,id),'published L&L '+id+' unchanged');
for(const group of [['2026-09-29','2026-09-30'],['2026-10-01','2026-10-02','2026-10-05','2026-10-07'],['2026-10-08','2026-10-23']]){
 const first=archive['cp:'+group[0]];for(const d of group.slice(1)){
  const m=archive['cp:'+d];eq(art.signature(m,'workbook'),art.signature(first,'workbook'),'known historical structural duplicate');eq(art.features(m).geometry,art.features(first).geometry,'known historical central geometry duplicate');
 }
}
eq(archive['cp:2026-10-23'].signature,'workbook:quantile-bands');eq(archive['cp:2026-10-23'].phrase,'Ranks & distributions');eq(art.central(archive['cp:2026-10-23']),art.central(archive['cp:2026-10-08']),'008/013 exact historical plate preserved');
eq(archive['sp:2026-10-23'].signature,'loblolly:financing-transect','Issue 005 cover included');
eq(field['2026-10-23'].concept,'risk');eq(field['2026-10-23'].composition,'valley');
for(const [layer,m,history,id] of [['cover',archive['sp:2026-10-23'],Object.fromEntries(Object.entries(archive).filter(([id])=>id.startsWith('sp:'))),'sp:2026-10-23'],['study',field['2026-10-23'],field,'2026-10-23']]){
 const result=art.review({...m,date:'2028-01-01',signature:'renamed:005'},history,layer);
 ok(!result.ok,layer+' recognizes published Issue 005 geometry');eq(result.id,id,'005 is the historical collision');
}
const wrap=s=>'<svg viewBox="0 0 600 800"><rect width="600" height="800" fill="#abcdef"/><g>'+s+'</g><path d="M42 570H558"/><text>Different metadata</text></svg>';
for(const [layer,prior]of [['workbook',archive['cp:2026-10-08']],['cover',archive['sp:2026-10-16']],['study',field['2026-10-02']]]){
 const history={'2026-10-23':prior},date='2028-01-01',central=art.central(prior),candidate={...prior,date,signature:'renamed:new',composition:'renamed',frozen:wrap(central),html:null};
 ok(!art.review(candidate,history,layer).ok,layer+' exact central copy with new metadata rejected');
 for(const transform of ['rotate(90 300 300)','translate(600 0) scale(-1 1)','translate(3 5) scale(1.02)'])ok(!art.review({...candidate,frozen:wrap('<g transform="'+transform+'">'+central+'</g>')},history,layer).ok,layer+' transform cannot confer originality');
 ok(!art.review({...candidate,frozen:wrap(central.replace(/#[\da-f]{6}/gi,'#334455'))},history,layer).ok,layer+' recolor cannot confer originality');
 const perturbed=central.replace(/(\b(?:d|x|y|cx|cy|r|width|height)=")(.*?)(")/g,(_,a,s,b)=>a+s.replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)/g,n=>String(+n*1.008+1))+b);
 ok(!art.review({...candidate,frozen:wrap(perturbed)},history,layer).ok,layer+' small baked-coordinate perturbation rejected');
 const different=wrap('<circle cx="135" cy="160" r="35" fill="#1f4a3b"/><path d="M400 90V480H520" fill="none" stroke="#b4532e" stroke-width="15"/>');
 ok(art.review({...candidate,frozen:different},history,layer).ok,layer+' distinct scene with common primitives/palette allowed');
 reject(()=>art.validate({...candidate,signature:art.signature(prior,layer)},history,layer),/structural signature/,'historical identity fails independently');
}
const reused=archive['cp:2026-10-08'],reuseResult=art.review({...reused,date:'2028-01-01',signature:'new:frame',frozen:wrap(art.central(reused)+'<path d="M25 85H550V520" fill="none" stroke="#334455"/>')},{'cp:2026-10-08':reused},'workbook');
eq(reuseResult.reason,'substantial repeated geometry','additional furniture cannot hide substantial primitive reuse');
const questions=[{stem:'Interpret a conditional quantile regression.',concepts:['Quantiles']}],context={key:'cp',date:'2028-01-01',no:14,questions},generated=[];
try{
 // Make every earlier quantile scene historical; the new crossings scene must still be supported.
 for(const [i,composition]of ['rank-stair','distribution-slice','quantile-fan'].entries()){const date='2027-03-'+String(i+1).padStart(2,'0'),m={...archive['cp:2026-10-08'],date,composition,signature:'workbook:'+composition,frozen:null};archive['cp:'+date]={...m,frozen:marks.svg(m)};generated.push('cp:'+date)}
 const m=marks.model(context);eq(m.composition,'quantile-crossings','unused content-supported quantile scene selected');eq(m.questionPositions,[1]);ok(marks.validateOriginality(m,archive).ok);
 archive['cp:2027-04-01']={...m,date:'2027-04-01',frozen:marks.svg(m)};generated.push('cp:2027-04-01');reject(()=>marks.model(context),/all 5 supported authored scenes collide/,'finite pool never recycles');
 // A caller-provided recent window cannot hide the full frozen archive.
 reject(()=>marks.model({...context,recent:[]}),/all 5 supported authored scenes collide/);
}finally{generated.forEach(id=>delete archive[id])}
const llInfo={key:'sp',date:'2028-01-01',no:5,framing:'Economic incidence and pass-through determine the burden on households and firms.'},cover=marks.model(llInfo);ok(marks.validateOriginality(cover,archive).ok,'new relevant L&L cover passes');eq(cover.subject,'incidence');
archive['sp:2027-01-01']={...cover,date:'2027-01-01',frozen:marks.svg(cover)};
try{const other=marks.model(llInfo);ok(other.signature!==cover.signature,'recurring L&L concept has a second meaningful treatment');archive['sp:2027-01-08']={...other,date:'2027-01-08',frozen:marks.svg(other)};reject(()=>marks.model(llInfo),/new unused content-supported composition/,'cover exhaustion cannot rotate or change subject');}finally{delete archive['sp:2027-01-01'];delete archive['sp:2027-01-08']}
const info={date:'2028-01-01',no:5,synthesis:llInfo.framing,history:field,cover:{...cover,frozen:marks.svg(cover)}},study=studies.artifact(info);eq(study.composition,'incidence-ledgers','used transmission scene skipped');ok(studies.validateOriginality(study,field,info.cover).ok);ok(studies.distinctFromCover(study,info.cover));
const boundary=field['2026-10-02'];
reject(()=>studies.validateOriginality({...boundary,date:info.date},field,info.cover),/originality/,'exact prior study rejected');
const valley=studies.artifact({date:'2028-01-02',no:6,synthesis:'Water flows and fish displacement alter river exposure',history:{}}),watershed={...valley,date:'2028-01-03',composition:'watershed',html:valley.html.replace(/M0 208Q140 92[^\"]*/, 'M0 170L240 312L600 129V390H0Z').replace(art.central(valley),'<g transform="translate(600 0) scale(-1 1)">'+art.central(valley)+'</g>')};
reject(()=>studies.validateOriginality(watershed,{[valley.date]:valley}),/originality/,'watershed and mirror do not invent a subject');
const nextWater=studies.artifact({date:watershed.date,no:7,synthesis:'Water flows and fish displacement alter river exposure',history:{[valley.date]:valley}});ok(nextWater.composition!==valley.composition);ok(studies.validateOriginality(nextWater,{[valley.date]:valley}).ok,'different supported water mechanism passes');
const riskHistory={...field},riskInfo={date:'2028-01-01',no:6,synthesis:'Risk pooling and insurance protect against uncertain losses',history:riskHistory},riskStudy=studies.artifact(riskInfo);
eq(riskStudy.composition,'risk-pooling','Issue 005 shelter cannot recur as a valley or watershed');
ok(studies.validateOriginality({...riskStudy,composition:'valley',signature:undefined},field).ok,'same concept and landscape family can contain genuinely different central geometry');
riskHistory[riskStudy.date]=riskStudy;
reject(()=>studies.artifact({...riskInfo,date:'2028-01-08'}),/new unused content-supported risk composition/,'Field Study exhaustion never recycles the historical shelter');
reject(()=>studies.validateOriginality({...study,html:info.cover.frozen},{},info.cover),/same-edition/,'renamed cover cannot become Field Study');
// Field Brief's current and representative future outputs stay byte-identical to master.
const Module=require('node:module'),baselineModule=new Module(path.join(root,'personal-updates/issue-marks.js'),module);baselineModule.filename=path.join(root,'personal-updates/issue-marks.js');baselineModule.paths=module.paths;baselineModule._compile(old('personal-updates/issue-marks.js'),baselineModule.filename);const original=baselineModule.exports;
for(const framing of ['Court enforcement and export controls','Climate risk, heat and adaptation','Compute, power and infrastructure','Evidence, survey data and measurement']){
 const input={key:'fb',date:'2028-01-01',no:99,framing};eq(marks.model(input),original.model(input),'Field Brief model parity');eq(marks.svg(marks.model(input)),original.svg(original.model(input)),'Field Brief rendered parity');
}
// Preparation remains append-only and byte-idempotent; invalid supplied pins fail before writes.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'artwork-history-')),outputs=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html'];
try{
 for(const p of ['personal-updates','daily-watchlist-5','daily-econ-challenge','weekly-economics-environment'])fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});fs.mkdirSync(path.join(dir,'scripts'));fs.copyFileSync(path.join(root,'scripts/prepare_periodicals.cjs'),path.join(dir,'scripts/prepare_periodicals.cjs'));
 const snap=()=>outputs.map(p=>fs.readFileSync(path.join(dir,p),'utf8')),prepare=()=>cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:dir,encoding:'utf8',stdio:'pipe'});
 const before=snap();prepare();eq(snap(),before,'known historical duplicates remain valid pins');prepare();eq(snap(),before,'retry unchanged');
 const historicalPinsPath=path.join(dir,'personal-updates/issue-mark-archive.js'),historicalPins=fs.readFileSync(historicalPinsPath,'utf8');
 const missing005={...archive};delete missing005['sp:2026-10-23'];fs.writeFileSync(historicalPinsPath,'module.exports='+JSON.stringify(missing005));const missingCover=snap();reject(prepare,/Missing historical L&L cover pin/,'missing published 005 cover is not regenerated');eq(snap(),missingCover,'missing historical cover writes nothing');fs.writeFileSync(historicalPinsPath,historicalPins);
 const historicalLLPath=path.join(dir,'weekly-economics-environment/index.html'),historicalLL=fs.readFileSync(historicalLLPath,'utf8'),missingField={...field};delete missingField['2026-10-23'];fs.writeFileSync(historicalLLPath,historicalLL.replace(/(id="field-studies">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(missingField)+b));const missingStudy=snap();reject(prepare,/Missing historical Field Study pin/,'missing published 005 study is not regenerated');eq(snap(),missingStudy,'missing historical study writes nothing');fs.writeFileSync(historicalLLPath,historicalLL);
 // A synthetic future L&L append exercises covers, studies and notebook gating together.
 const llPath=path.join(dir,'weekly-economics-environment/index.html'),llDoc=fs.readFileSync(llPath,'utf8'),latestEdition=[...llDoc.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)(?=<section class="edition"|<\/main>)/g)].sort((a,b)=>a[1].localeCompare(b[1])).at(-1);
 const futureDate='2026-10-30';let futureEdition=latestEdition[0].replaceAll(latestEdition[1],futureDate).replace(/N<sup>o<\/sup>\. \d{3}/,'N<sup>o</sup>. 006').replace('Friday, 23 October 2026','Friday, 30 October 2026');
 futureEdition=futureEdition.replace(/(<section class="synthesis"[^>]*>)[\s\S]*?<\/section>/,(_,a)=>a+'<h2>Unpublished pipeline fixture</h2><p>Economic incidence and pass-through determine the burden on households and firms.</p></section>');
 fs.writeFileSync(llPath,llDoc.replace('</main>',futureEdition+'</main>'));
 const reviewPath=path.join(dir,'weekly-economics-environment/notebook/reviews.json'),reviews=JSON.parse(fs.readFileSync(reviewPath,'utf8'));
 reviews.reviews[futureDate]={reviewedOn:futureDate,readings:[...futureEdition.matchAll(/<article class="entry"[^>]*id="([^"]+)"/g)].map(x=>x[1]),synthesis:futureEdition.match(/<section class="synthesis"[^>]*id="([^"]+)"/)[1],revisited:[],added:[],note:'Unpublished pipeline fixture only; no editorial material is being prepared for publication.'};fs.writeFileSync(reviewPath,JSON.stringify(reviews));
 prepare();const llPins=load(fs.readFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'utf8')),newStudies=data(fs.readFileSync(llPath,'utf8'),'field-studies');
 ok(marks.validateOriginality(llPins['sp:'+futureDate],archive).ok,'L&L future cover passes full history');ok(studies.validateOriginality(newStudies[futureDate],field,llPins['sp:'+futureDate]).ok,'L&L future study passes both layers');
 for(const [id,m]of Object.entries(archive))eq(llPins[id],m,'L&L append preserves all cover pins '+id);for(const [date,m]of Object.entries(field))eq(newStudies[date],m,'L&L append preserves Field Study '+date);
 const llStable=snap();prepare();eq(snap(),llStable,'L&L append retry idempotent');
 const writePins=pins=>fs.writeFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'module.exports='+JSON.stringify(pins));
 writePins({...llPins,['sp:'+futureDate]:{...llPins['sp:'+futureDate],frozen:archive['sp:2026-10-16'].frozen}});const badCover=snap();reject(prepare,/artwork originality/,'supplied future L&L pin still checked');eq(snap(),badCover,'bad L&L cover writes nothing');writePins(llPins);
 const corruptStudy={...newStudies,[futureDate]:{...newStudies[futureDate],composition:'renamed',signature:'renamed',html:field['2026-10-02'].html}};const llPrepared=fs.readFileSync(llPath,'utf8');fs.writeFileSync(llPath,llPrepared.replace(/(id="field-studies">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(corruptStudy)+b));const badStudy=snap();reject(prepare,/artwork originality/,'supplied future Field Study still checked');eq(snap(),badStudy,'bad Field Study writes nothing');fs.writeFileSync(llPath,llPrepared);
 const source=path.join(dir,'daily-econ-challenge/index.html'),doc=fs.readFileSync(source,'utf8'),sets=data(doc,'challenge-data'),fixture=structuredClone(sets.editions.at(-1));fixture.no++;fixture.date='2026-10-30';fixture.questions.forEach(q=>q.assistance+='<p>Unpublished validation fixture '+q.id+'.</p>');sets.editions.push(fixture);fs.writeFileSync(source,doc.replace(/(id="challenge-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(sets)+b));prepare();
 const pins=load(fs.readFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'utf8')),pin=pins['cp:'+fixture.date];ok(pin);ok(marks.validateOriginality(pin,archive).ok);for(const [id,m]of Object.entries(archive))eq(pins[id],m,'append-only '+id);ok(fs.readFileSync(path.join(dir,'personal-updates/index.html'),'utf8').includes(pin.frozen),'no-script hub uses actual prepared pin');
 const stable=snap();prepare();eq(snap(),stable,'new valid set preparation idempotent');
 pins['cp:'+fixture.date]={...pin,frozen:archive['cp:2026-10-08'].frozen};fs.writeFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'module.exports='+JSON.stringify(pins));const bad=snap();reject(prepare,/artwork originality/,'new pre-pinned geometry still checked');eq(snap(),bad,'rejection writes no artifacts');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
console.log(assertions+' full-history Workbook/L&L artwork assertions passed; immutable historical duplicates preserved.');
