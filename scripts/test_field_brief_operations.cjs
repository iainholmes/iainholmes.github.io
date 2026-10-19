/* Publication-state regressions: append-only, noninteractive and no secondary-failure republish. */
'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {inspect,readCurrent,registry}=require('./check_field_brief.cjs');
let assertions=0;const check=(x,label)=>{assert(x,label);assertions++},eq=(a,b,label)=>{assert.deepEqual(a,b,label);assertions++};
const html=fs.readFileSync('daily-watchlist-5/index.html','utf8'),hub=fs.readFileSync('personal-updates/index.html','utf8'),marks=require('../personal-updates/issue-mark-archive.js'),plates=require('../daily-watchlist-5/artwork-archive.js');
const parse=s=>JSON.parse(s.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]),replace=d=>html.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(d)+b),latest=parse(html).editions.at(-1),date=latest.date,args={date,html,hub,marks,plates};
const complete=inspect(args);eq(complete.state,'complete');eq(complete.action,'verify-deployment','existing canonical publication is never regenerated');
for(const secondaryFailure of ['deployment pending','deployment failed','public HTTPS mismatch','backup unavailable','optional browser permission']){
 const again=inspect(args);eq(again,complete,secondaryFailure+' cannot erase the canonical edition or trigger regeneration');
}
const tomorrow=new Date(date+'T12:00:00Z');tomorrow.setUTCDate(tomorrow.getUTCDate()+1);const missing=tomorrow.toISOString().slice(0,10);
eq(inspect({...args,date:missing}).state,'missing','comments and unrelated dates are not publication records');eq(inspect({...args,date:missing}).nextNumber,parse(html).editions.length+1);
eq(inspect({...args,date:missing,html:html+'<!-- '+missing+' -->'}).action,'prepare','date substring is not an edition');
const bad=parse(html);bad.editions.at(-1).stories.pop();assert.throws(()=>inspect({...args,html:replace(bad)}),/five-story/);assertions++;
const duplicate=parse(html);duplicate.editions.push(duplicate.editions.at(-1));assert.throws(()=>inspect({...args,html:replace(duplicate)}),/Duplicate/);assertions++;
for(const broken of [{marks:{}},{plates:{issues:{}}},{hub:''}]){const r=inspect({...args,...broken});eq(r.state,'incomplete');eq(r.action,'stop','partial publication requires repair, not duplicate publication');}
const tampered=structuredClone(marks);tampered['fb:'+date].frozen=marks['fb:2026-10-17'].frozen;
check(inspect({...args,marks:tampered}).errors.some(e=>/originality/.test(e)),'reused cover blocks publication');
const historical=parse(cp.execFileSync('git',['show','2c11e1691f2650898bc6b68a22a088cbba8e8830:daily-watchlist-5/index.html'],{encoding:'utf8',maxBuffer:16e6}));
for(const issue of historical.editions)eq(parse(html).editions.find(e=>e.date===issue.date),issue,'published content unchanged '+issue.date);
for(const p of ['personal-updates/issue-mark-archive.js','daily-watchlist-5/artwork-archive.js']){
 const before=registry(cp.execFileSync('git',['show','2c11e1691f2650898bc6b68a22a088cbba8e8830:'+p],{encoding:'utf8',maxBuffer:16e6})),after=registry(fs.readFileSync(p,'utf8'));
 if(p.includes('issue-mark'))for(const [id,m]of Object.entries(before))eq(after[id],m,'published cover unchanged '+id);
 else {eq(after.legacy,before.legacy);for(const [day,pins]of Object.entries(before.issues))eq(after.issues[day],pins,'published story art unchanged '+day);}
}
eq(readCurrent(process.cwd(),date),complete,'CLI and imported preflight agree');
console.log(assertions+' Field Brief publication-state, preservation and retry checks passed.');
