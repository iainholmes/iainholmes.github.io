/* Read-only publication gate; preparation appends hashes only after every check passes. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const stable=value=>JSON.stringify(value&&typeof value==='object'?Array.isArray(value)?value.map(v=>JSON.parse(stable(v))):Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(stable(value[k]))])):value);
const hash=entry=>crypto.createHash('sha256').update(stable(entry)).digest('hex');
const fail=message=>{throw Error('L&L Field Register: '+message+'; review the edition profiles before publication.');};
function validate(input={}){
 const journal=input.journal??fs.readFileSync(path.join(root,'weekly-economics-environment/index.html'),'utf8');
 const registry=input.registry??JSON.parse(journal.match(/id="field-register">([\s\S]*?)<\/script>/)?.[1]||'null');
 const history=input.history??JSON.parse(fs.readFileSync(path.join(__dirname,'field-register-history.json'),'utf8'));
 const main=journal.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 const editions=new Map([...main.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*>([\s\S]*?)(?=<section class="edition"|$)/g)].map(e=>[e[1],new Set([...e[0].matchAll(/<article class="entry"[^>]*id="([^"]+)"/g)].map(r=>r[1]))]));
 if(!editions.size||registry?.version!==1||!Array.isArray(registry.entries)||history?.version!==1||!history.entries)fail('missing or invalid registry/history');
 const entries=registry.entries,byIssue=new Map(),pending={version:1,entries:{...history.entries}};
 for(const [i,e] of entries.entries()){
  if(e.no!==i+1)fail('Register numbers must be unique, sequential and append-only');
  if(!editions.has(e.issue))fail('unknown issue date for No. '+e.no);
  if(!editions.get(e.issue).has(e.related))fail('related reading must belong to its issue for No. '+e.no);
  if(!['person','institution'].includes(e.kind)||['name','org','role','place'].some(k=>typeof e[k]!=='string'||!e[k].trim())||typeof e.does!=='string'||e.does.trim().length<60||typeof e.economics!=='string'||e.economics.trim().length<60)fail('incomplete identity or substantive explanation for No. '+e.no);
  if(e.fieldNote!==undefined&&typeof e.fieldNote!=='boolean')fail('fieldNote must be boolean for No. '+e.no);
  try{const u=new URL(e.source?.url);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.')||u.username||u.password||typeof e.source.label!=='string'||!e.source.label.trim())throw Error();}catch{fail('well-formed external source and label required for No. '+e.no);}
  if(e.image!=null&&(typeof e.image.src!=='string'||!e.image.src.trim()||/^\s*(javascript|data):/i.test(e.image.src)||['alt','credit','license'].some(k=>typeof e.image[k]!=='string'||!e.image[k].trim())))fail('identifying images require source, alt text, credit and licence for No. '+e.no);
  (byIssue.get(e.issue)||byIssue.set(e.issue,[]).get(e.issue)).push(e);
  const frozen=history.entries[e.no];
  if(frozen&&(frozen.issue!==e.issue||frozen.sha256!==hash(e)))fail('published profile changed or renumbered: No. '+e.no);
  if(!frozen&&Object.values(history.entries).some(p=>p.issue===e.issue))fail('new profiles must accompany a new edition, not rewrite an existing register');
  pending.entries[e.no]={issue:e.issue,sha256:hash(e)};
 }
 for(const no of Object.keys(history.entries))if(!entries.some(e=>String(e.no)===no))fail('published profile deleted: No. '+no);
 for(const date of editions.keys()){
  const group=byIssue.get(date)||[],featured=group.filter(e=>e.fieldNote);
  if(group.length<3||group.length>5)fail(date+' requires 3–5 sourced Register entries');
  if(featured.length<2||featured.length>3)fail(date+' requires 2–3 explicitly selected Field Notes');
 }
 return {editions:editions.size,entries:entries.length,featured:entries.filter(e=>e.fieldNote).length,history:pending};
}
module.exports={validate,hash};
if(require.main===module){try{const {history,...result}=validate();console.log(JSON.stringify(result));}catch(e){console.error(e.message);process.exitCode=1;}}
