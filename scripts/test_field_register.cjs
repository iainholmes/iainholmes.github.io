'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const schema=require('../weekly-economics-environment/field-register-schema.cjs');
const fixture=require('./fixtures/art-originality.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const journal=read('weekly-economics-environment/index.html'),registry=fixture.data(journal,'field-register'),history=JSON.parse(read('weekly-economics-environment/field-register-history.json'));
const input={journal,registry,history},clone=x=>JSON.parse(JSON.stringify(x));let assertions=0;
const ok=(v,m)=>{assert.ok(v,m);assertions++;},eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++;},reject=(change,reason)=>{assert.throws(()=>schema.validate({...input,...change}),reason);assertions++;};
const result=schema.validate(input),dates=[...journal.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1].matchAll(/data-edition="([^"]+)"/g)].map(m=>m[1]);
eq({...result,history:undefined},{editions:dates.length,entries:registry.entries.length,featured:registry.entries.filter(e=>e.fieldNote).length,history:undefined});eq(result.history,history,'current preparation is byte-stable');
const prior=fixture.data(cp.execFileSync('git',['show','a4245e533cca3d65d310dec6a5a9d56422d5af4c:weekly-economics-environment/index.html'],{cwd:root,encoding:'utf8',maxBuffer:20e6}),'field-register');
for(const e of prior.entries){eq(registry.entries.find(n=>n.no===e.no),e,'published profile immutable '+e.no);eq(history.entries[e.no],{issue:e.issue,sha256:schema.hash(e)},'frozen profile pin '+e.no);}
{const r=clone(registry);r.entries.pop();reject({registry:r},/deleted/);}
{const r=clone(registry);r.entries[0].no=2;reject({registry:r},/sequential/);}
{const r=clone(registry);r.entries[0].economics+=' Unauthorised historical mutation.';reject({registry:r},/published profile changed/);}
{const r=clone(registry);r.entries[0].related='missing-reading';reject({registry:r},/related reading/);}
{const r=clone(registry);r.entries[0].source.url='javascript:alert(1)';reject({registry:r},/external source/);}
{const r=clone(registry);r.entries[0].economics='Brief';reject({registry:r},/substantive/);}
{const r=clone(registry);r.entries[0].issue='9998-01-01';reject({registry:r},/unknown issue/);}
{const r=clone(registry);r.entries[0].fieldNote='true';reject({registry:r},/boolean/);}
{const r=clone(registry);r.entries[0].image={src:'portrait.jpg'};reject({registry:r},/licence/);}
// Private far-future inputs: unrelated to which real edition is next.
const date='9999-12-03',ids=Array.from({length:5},(_,i)=>'private-register-reading-'+i);
const edition='<section class="edition" data-edition="'+date+'" data-title="Private Fixture">'+ids.map(id=>'<article class="entry" id="'+id+'"></article>').join('')+'</section>';
const future=journal.replace('</main>',edition+'</main>');
reject({journal:future},/3–5/);
for(const count of [3,4,5])for(const selected of [2,3]){
 const r=clone(registry);for(let i=0;i<count;i++)r.entries.push({...clone(registry.entries[i]),no:r.entries.length+1,issue:date,related:ids[i],fieldNote:i<selected,name:'Private unpublished fixture '+i});
 const next=schema.validate({...input,journal:future,registry:r});eq(next.entries,registry.entries.length+count,'3–5 future entries accepted');eq(next.featured,result.featured+selected,'2–3 deliberate selections accepted');
 eq(Object.fromEntries(Object.entries(next.history.entries).filter(([no])=>+no<=registry.entries.length)),history.entries,'all existing pins preserved');
 const frozen=clone(r);frozen.entries.at(-1).name+=' mutation';assert.throws(()=>schema.validate({journal:future,registry:frozen,history:next.history}),/published profile changed/);assertions++;
}
for(const [count,selected] of [[2,2],[6,3],[3,1],[4,4]]){
 const r=clone(registry);for(let i=0;i<count;i++)r.entries.push({...clone(registry.entries[i%registry.entries.length]),no:r.entries.length+1,issue:date,related:ids[i%5],fieldNote:i<selected});reject({journal:future,registry:r},/3–5|2–3/);
}
const snapshot=JSON.stringify(input);schema.validate(input);schema.validate(input);eq(JSON.stringify(input),snapshot,'validation is read-only');
ok(journal.includes("host.id='field-notes-'+date"),'date-stable Field Notes anchor');ok(journal.includes("'-profile-'+pad3(e.no)"),'profile target uses immutable Register number');
ok(journal.includes('Register record; not featured in Field Notes.'),'non-featured provenance is truthful');ok(!journal.includes('if(!picks.length)picks=issue'),'no silent selection fallback');
// A missing register update rejects the real preparation command before any writes.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'periodicals-register-'));
try{fixture.copySite(root,temp);fs.writeFileSync(path.join(temp,'weekly-economics-environment/index.html'),future);const before=fixture.snap(temp);assert.throws(()=>fixture.prepare(temp),/requires 3–5 sourced Register entries/);assertions++;eq(fixture.snap(temp),before,'failed register check writes no artwork, hub or history files');}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({assertions,result:'passed',editions:dates.length,entries:registry.entries.length,featured:result.featured}));
