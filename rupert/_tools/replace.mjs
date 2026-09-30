#!/usr/bin/env node
// Usage: node rupert/_tools/replace.mjs ORIGINAL_ID CANDIDATE.json [CANDIDATE.json ...] --at TIMESTAMP [--apply]
// Preview by default. --apply writes history and a distinct replacement, then runs all build gates.
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {replacementFor} from '../assets/js/core/publication.js';
const root=fileURLToPath(new URL('../',import.meta.url)),args=process.argv.slice(2),originalId=args.shift();
const atIndex=args.indexOf('--at'),at=atIndex>=0?args.splice(atIndex,2)[1]:null,apply=args.includes('--apply'),files=args.filter(x=>x!=='--apply');
if(!/^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)$/.test(originalId||'')||!at||!files.length)throw Error('Provide original ID, candidate files and --at review timestamp.');
const path=root+'data/editions/'+originalId+'.json',raw=await readFile(path,'utf8'),original=JSON.parse(raw),evidence=JSON.parse(await readFile(root+'data/access-checks.json','utf8'));
const candidates=await Promise.all(files.map(async p=>JSON.parse(await readFile(p,'utf8'))));
if(candidates.some(c=>!/^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)$/.test(c.id||'')))throw Error('Invalid candidate revision ID.');
const result=replacementFor(original,candidates,evidence.checks,evidence.official_hosts,at);
console.log(JSON.stringify({withdrawn:originalId,replacement:result.replacement?.id||null,rejected:result.rejected},null,2));
if(apply){
  const replacementPath=result.replacement?root+'data/editions/'+result.replacement.id+'.json':null;
  if(replacementPath){try{await readFile(replacementPath);throw Error('Replacement ID already exists.');}catch(e){if(e.code!=='ENOENT')throw e;}}
  try{await writeFile(path,JSON.stringify(result.withdrawn,null,2)+'\n');if(replacementPath)await writeFile(replacementPath,JSON.stringify(result.replacement,null,2)+'\n');
    const check=spawnSync(process.execPath,[root+'_tools/rupert.mjs','check'],{stdio:'inherit'});if(check.status!==0)throw Error('Publication validation failed.');
  }catch(error){await writeFile(path,raw);if(replacementPath)await unlink(replacementPath).catch(()=>{});throw error;}
  const build=spawnSync(process.execPath,[root+'_tools/rupert.mjs','build'],{stdio:'inherit'});if(build.status!==0)throw Error('Build failed; no deployment was attempted.');
  if(!result.replacement)console.warn('No officially validated candidate: withdrawal retained. Refresh the candidate queue immediately.');
}
