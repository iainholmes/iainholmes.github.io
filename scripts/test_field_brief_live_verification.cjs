'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{verify,files}=require('./verify_field_brief_live.cjs');
const sha='c9f386f61da5edd93728216f0df4b0bf344e768e',other='0'.repeat(40),read=p=>fs.readFileSync(p,'utf8');let n=0;
function mock({mismatch,noDeployment,advanced,failUrl,unmerged}={}){let master=0;return async url=>{
 if(failUrl&&url.includes(failUrl))throw Error('Simulated HTTPS unavailable');
 if(url.includes('/commits/'))return JSON.stringify({sha:advanced&&url.endsWith('/master')&&++master>1?other:sha});
 if(url.includes('/compare/'))return JSON.stringify({status:unmerged?'diverged':'identical'});
 if(url.includes('/actions/runs?'))return JSON.stringify({workflow_runs:noDeployment?[]:[{id:44531020157,head_sha:sha,name:'pages build and deployment',conclusion:'success',status:'completed',html_url:'https://github.com/iainholmes/iainholmes.github.io/actions/runs/44531020157',updated_at:'2026-11-19T13:13:00Z'}]});
 const file=files.find(p=>url.endsWith('/'+p));if(!file)throw Error('Unexpected URL '+url);
 return read(file)+(mismatch&&url.startsWith('https://iainholmes.github.io/')&&file==='personal-updates/index.html'?'mismatch':'');
};}
(async()=>{
 const paths=[...files,'personal-updates/PUBLISHING.md'],before=paths.map(read);
 const result=await verify({date:'2026-11-19',get:mock()});assert.equal(result.report.publication,'verified-live');assert.equal(result.report.no,52);assert.equal(result.report.files.length,5);assert.equal(result.sources[files[0]],read(files[0]));assert.match(result.report.backup,/not-synchronized/);n+=5;
 for(const [options,pattern]of [[{mismatch:true},/Public byte mismatch/],[{noDeployment:true},/No successful Pages/],[{advanced:true},/Master advanced/],[{failUrl:'raw.githubusercontent.com'},/HTTPS unavailable/]]){await assert.rejects(()=>verify({date:'2026-11-19',get:mock(options)}),pattern);n++;}
 await assert.rejects(()=>verify({date:'2099-12-31',get:mock()}),/incomplete/);n++;
 await assert.rejects(()=>verify({date:'2026-11-19',ref:'main;unsafe',get:mock()}),/Supply/);n++;
 await assert.rejects(()=>verify({date:'2026-11-19',ref:other,get:mock()}),/differs/);n++;
 await assert.rejects(()=>verify({date:'2026-11-19',ref:sha,get:mock({unmerged:true})}),/not integrated/);n++;
 assert.equal((await verify({date:'2026-11-19',ref:sha,get:mock()})).report.commit,sha);n++;
 assert.deepEqual(paths.map(read),before,'verification and all failure modes never change publication or checkpoint files');n++;
 console.log(n+' live verification, deployment, race, mismatch and secondary-state checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
