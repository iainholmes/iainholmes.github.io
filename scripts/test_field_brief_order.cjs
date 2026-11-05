'use strict';
const fs=require('fs'),cp=require('child_process'),vm=require('vm'),assert=require('node:assert/strict'),os=require('os'),path=require('path');
const gate=require('../daily-watchlist-5/editorial-order.cjs'),plates=require('../daily-watchlist-5/artwork-archive');
const base='e404c1c88cf90b5a114d0011729e352b4d294f2b',p='daily-watchlist-5/index.html',read=p=>fs.readFileSync(p,'utf8'),old=p=>cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:8e6});
const data=s=>JSON.parse(s.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]),doc=read(p),before=data(old(p)),current=data(doc),ed=current.editions.find(e=>e.date==='2026-11-05'),prior=before.editions.find(e=>e.date===ed.date);
let n=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);n++},ok=(v,m)=>{assert(v,m);n++},reject=(f,re,m)=>{assert.throws(f,re,m);n++};
ok(current.editions.length>=before.editions.length,'historical editions remain while legitimate appends are allowed');
for(const e of before.editions.filter(e=>e.date!==ed.date))eq(current.editions.find(x=>x.date===e.date),e,'historical issue intact '+e.date);
const normalized=structuredClone(ed);delete normalized.stories.find(s=>s.number==='04').editorial.feature;normalized.stories.sort((a,b)=>a.number.localeCompare(b.number));eq(normalized,prior,'only approved pair order and dedicated-feature metadata differ; every word, source and ID preserved');
eq(ed.stories.map(s=>s.number),['01','02','03','05','04'],'approved display order');
// Protect historical pins individually, allowing future registry entries and hub updates.
for(const file of ['daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js']){
 const parse=source=>{const c={module:{exports:{}}};vm.runInNewContext(source,c);return JSON.parse(JSON.stringify(c.module.exports));};
 const historical=parse(old(file)),live=parse(read(file)),a=file.includes('artwork-archive')?historical.issues:historical,b=file.includes('artwork-archive')?live.issues:live;
 eq(Object.fromEntries(Object.keys(a).map(k=>[k,b[k]])),a,'each historical artwork record remains exact '+file);
}
const functionBody=doc.slice(doc.indexOf('  function storyHTML('),doc.indexOf('  function nextCell('));
const context={INKS:['--prussian','--vermilion','--viridian','--ochre','--oxblood'],esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])),art:(e,s)=>plates.issues[e.date][s.number].frozen};vm.createContext(context);vm.runInContext(functionBody,context);
for(let i=0;i<5;i++){
 const s=ed.stories[i],html=context.storyHTML(ed,s,i),num=String(i+1).padStart(2,'0');
 ok(html.includes('id="story-'+s.number+'"'),'permanent deep-link destination '+s.number);
 ok(html.includes(plates.issues[ed.date][s.number].frozen),'original artwork bytes remain with subject '+s.number);
 ok(html.includes('style="--k:var('+context.INKS[i]+')"'),'positional color '+num);
 ok(html.includes('>'+num+'</span>'),'visible folio '+num);
 eq(html.match(/class="s-no"(?: hidden)?>(\d+)<\/span>/)[1],s.number,'cached Commonplace identity hook '+s.number);
 eq(plates.issues[ed.date][s.number].title,s.title,'illustration title association');
}
ok(ed.stories[3].title.startsWith('Productivity'),'fourth national reporting');ok(ed.stories[4].title.startsWith('Wake and Raleigh'),'fifth local reporting');gate.validate(ed);n++;
const fixture=require('./fixtures/field-brief-edition.cjs').future(ed,'9998-01-01');gate.validate(fixture);n++;
const misplaced=structuredClone(fixture);[misplaced.stories[3],misplaced.stories[4]]=[misplaced.stories[4],misplaced.stories[3]];misplaced.stories.forEach((s,i)=>s.number=String(i+1).padStart(2,'0'));
reject(()=>gate.validate(misplaced),/North Carolina feature is in position 4/,'misplaced designated feature rejected');
const missing=structuredClone(fixture);delete missing.stories[4].editorial.feature;reject(()=>gate.validate(missing),/designated exactly once/,'a mere NC mention does not satisfy designation');
const extra=structuredClone(fixture);extra.stories[1].editorial={...extra.stories[1].editorial,domain:'regional',geographies:['North Carolina']};gate.validate(extra);n++;
extra.stories[1].editorial.feature='north-carolina';reject(()=>gate.validate(extra),/designated exactly once/,'two dedicated features ambiguous');
for(const invalid of [{reason:'Deliberate exception'}, {reason:'Important news',approvedBy:'',approvedAt:'2026-11-05',reviewUrl:'https://example.org/review'}]){const bad=structuredClone(misplaced);bad.editorialSelection.orderException=invalid;reject(()=>gate.validate(bad),/reviewed editorialSelection/,'unreviewed exception rejected');}
const authorized=structuredClone(misplaced);authorized.editorialSelection.orderException={reason:'Private test: a documented editorial priority changes the final position.',approvedBy:'Test reviewer',approvedAt:'2026-11-05',reviewUrl:'https://example.org/private-test-review'};gate.validate(authorized);n++;
const historical=structuredClone(prior);historical.date='2026-11-04';gate.validate(historical);n++;
// Exercise the real publisher gate: invalid append fails before any filesystem write.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fb040-order-'));
try{
 for(const dir of ['daily-watchlist-5','daily-econ-challenge','weekly-economics-environment','personal-updates','scripts'])fs.cpSync(dir,path.join(temp,dir),{recursive:true});
 const payload=structuredClone(current);payload.editions.push(misplaced);fs.writeFileSync(path.join(temp,p),doc.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(payload)+b));
 const files=[p,'daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json'],snapshot=files.map(f=>fs.readFileSync(path.join(temp,f),'utf8'));
 const run=cp.spawnSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:temp,encoding:'utf8'});ok(run.status!==0&&run.stderr.includes('North Carolina feature is in position 4'),'actionable prepublication failure');eq(files.map(f=>fs.readFileSync(path.join(temp,f),'utf8')),snapshot,'failed preparation writes nothing');
 const preflight=require('./check_field_brief.cjs').inspect({date:misplaced.date,html:fs.readFileSync(path.join(temp,p),'utf8'),marks:require('../personal-updates/issue-mark-archive'),plates});ok(preflight.errors.some(x=>x.includes('North Carolina feature is in position 4')),'read-only preflight uses same gate');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(n+' Field Brief order, identity, source, artwork and prepublication checks passed.');
