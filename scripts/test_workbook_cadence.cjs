// Exercise the shipped Eastern-time calculators; publication data stays calendar-independent.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const wb=fs.readFileSync('daily-econ-challenge/index.html','utf8'),hub=fs.readFileSync('personal-updates/index.html','utf8');
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
const workbookCode=wb.slice(wb.indexOf('  var DOWN='),wb.indexOf('  function headHTML('));
const parts=hub.slice(hub.indexOf('  function nyParts('),hub.indexOf('  var now='));
const hubCode=hub.slice(hub.indexOf('  function nextRun('),hub.indexOf('  function paintSchedule('));
const fixtures=[
 ['2026-10-12T13:00Z','Friday, 8:00 AM','Friday'], // Monday is no longer a release day.
 ['2026-10-14T14:00Z','Friday, 8:00 AM','Friday'], // Wednesday historical Set 011 remains valid.
 ['2026-10-15T03:59Z','Friday, 8:00 AM','Friday'], // Wednesday night Eastern, Thursday UTC.
 ['2026-10-15T04:00Z','Tomorrow, 8:00 AM','Tomorrow'],
 ['2026-10-15T23:59Z','Tomorrow, 8:00 AM','Tomorrow'],
 ['2026-10-16T00:00Z','12 h 00 min','Tomorrow'],
 ['2026-10-16T03:59Z','8 h 01 min','Tomorrow'],
 ['2026-10-16T04:00Z','8 h 00 min','Today'],
 ['2026-10-16T11:00Z','1 h 00 min','Today'],
 ['2026-10-16T11:59Z','1 min','Today'],
 ['2026-10-16T12:00Z','Friday, 8:00 AM','Friday'],
 ['2026-10-16T12:01Z','Friday, 8:00 AM','Friday'],
 ['2026-10-17T13:00Z','Friday, 8:00 AM','Friday'],
 ['2026-10-18T13:00Z','Friday, 8:00 AM','Friday'],
 ['2026-10-19T13:00Z','Friday, 8:00 AM','Friday'],
 ['2026-10-21T13:00Z','Friday, 8:00 AM','Friday'],
 ['2026-03-06T12:59Z','1 min','Today'], // Standard time, before spring DST.
 ['2026-03-06T13:00Z','Friday, 8:00 AM','Friday'],
 ['2026-03-08T06:30Z','Friday, 8:00 AM','Friday'],
 ['2026-03-08T07:30Z','Friday, 8:00 AM','Friday'],
 ['2026-03-13T11:59Z','1 min','Today'], // Daylight time, after spring DST.
 ['2026-03-13T12:00Z','Friday, 8:00 AM','Friday'],
 ['2026-10-30T11:59Z','1 min','Today'],
 ['2026-10-30T12:00Z','Friday, 8:00 AM','Friday'],
 ['2026-11-01T05:30Z','Friday, 8:00 AM','Friday'],
 ['2026-11-01T06:30Z','Friday, 8:00 AM','Friday'],
 ['2026-11-06T12:59Z','1 min','Today'], // Standard time after fall DST.
 ['2026-11-06T13:00Z','Friday, 8:00 AM','Friday'],
 ['2027-01-01T12:59Z','1 min','Today'],
 ['2027-01-01T13:00Z','Friday, 8:00 AM','Friday']
];
const oldZone=process.env.TZ;
try{for(const zone of ['UTC','America/New_York','America/Los_Angeles','Pacific/Auckland']){process.env.TZ=zone;for(const [time,expected,day]of fixtures){
 class Clock extends Date{constructor(...args){super(...(args.length?args:[time]))}}
 const w={Date:Clock,Intl};vm.runInNewContext(workbookCode,w);eq(w.nextSet(),expected,zone+' Workbook '+time);
 const h={Date:Clock,Intl,TZ:'America/New_York',now:new Clock(),DOW:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']};vm.runInNewContext(parts+hubCode,h);eq(h.nextRun(...h.sched.cp),'<b>'+day+'</b>8:00 AM ET',zone+' hub '+time);
 eq(Array.from(h.sched.cp[0]),[5],'Workbook Friday only');eq(h.sched.cp[1],8,'Workbook 8 AM');
 eq(Array.from(h.sched.fb[0]),[0,1,2,3,4,5,6],'Field Brief daily');eq(h.sched.fb[1],8,'Field Brief time unchanged');eq(Array.from(h.sched.sp[0]),[5],'L&L Friday');eq(h.sched.sp[1],15,'L&L time unchanged');
}}}finally{if(oldZone===undefined)delete process.env.TZ;else process.env.TZ=oldZone}
for(const p of ['daily-econ-challenge/index.html','personal-updates/index.html','personal-updates/handbook/index.html','desk/projects.json','desk/_tools/build.mjs','desk/index.html']){
 const s=fs.readFileSync(p,'utf8');eq(s.includes('Fridays'),true,p+' current cadence');eq(s.includes('Mon · Wed · Fri'),false,p+' no obsolete operative label');
}
eq(/Workbook Fridays only at 8 AM/.test(fs.readFileSync('personal-updates/PUBLISHING.md','utf8')),true,'publishing contract');
eq(wb.includes("latest?'Latest set':'From the ledger'"),true,'latest is not necessarily today');
eq(wb.includes("i===0?' · latest':''"),true,'Ledger does not misdate the latest set');
const base='beac64dd33cdff67ab07575f379333319f572d9c';
const dataText=s=>s.match(/id="challenge-data">([\s\S]*?)<\/script>/)[1];
const old=cp.execFileSync('git',['show',base+':daily-econ-challenge/index.html'],{encoding:'utf8',maxBuffer:8e6});
const published=JSON.parse(dataText(wb)),prior=JSON.parse(dataText(old));
for(const edition of prior.editions)eq(published.editions.find(e=>e.date===edition.date),edition,'historical question/learning content retained '+edition.date);
eq(published.editions.length>=prior.editions.length,true,'published sets cannot disappear');
eq(wb.match(/<style>[\s\S]*?<\/style>/)[0],old.match(/<style>[\s\S]*?<\/style>/)[0],'Workbook visual CSS unchanged');
const api=require('../desk/publications.js'),archive=api.archiveFrom(fs.readFileSync('personal-updates/issue-mark-archive.js','utf8'));
for(const time of ['2026-10-15T05:00Z','2026-10-16T11:59Z','2026-10-16T12:00Z','2026-10-19T14:00Z']){
 // A fixed, genuinely published archive cannot invent Set 012 as the calendar advances.
 const latest=api.periodical('workbook',old,archive,new Date(time));eq(latest.date,'2026-10-14','actual latest is independent of expected release '+time);eq(latest.number,'011','no early 012');eq(latest.title,'Precision & information','title preserved');eq(latest.artwork,archive['cp:2026-10-14'].frozen,'matching immutable artwork');
}
const snapshot=JSON.parse(fs.readFileSync('desk/publication-snapshot.json','utf8')).publications.workbook;
const snapshotPin=archive['cp:'+snapshot.date];
eq(snapshot.number,String(snapshotPin.no).padStart(3,'0'),'generated fallback number matches its actual pin');eq(snapshot.artwork,snapshotPin.frozen,'generated fallback artwork');
const current=api.periodical('workbook',wb,archive,new Date());const actual=published.editions.filter(e=>e.date<=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
eq(current.number,String(actual.no).padStart(3,'0'),'live integration follows actual canonical editions, not the release calendar');eq(current.artwork,archive['cp:'+actual.date].frozen,'live integration uses that edition’s pin');
for(const p of ['desk/publications.js','personal-updates/mobile/mobile.js'])eq(fs.readFileSync(p,'utf8'),cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:8e6}),'frozen source '+p);
console.log(checks+' Workbook Friday 8 AM cadence and preservation checks passed');
