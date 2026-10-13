// Exercise the actual page calculators without adding a publication runtime dependency.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const wb=fs.readFileSync('daily-econ-challenge/index.html','utf8'),hub=fs.readFileSync('personal-updates/index.html','utf8');
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
const workbookCode=wb.slice(wb.indexOf('  var DOWN='),wb.indexOf('  function headHTML('));
const parts=hub.slice(hub.indexOf('  function nyParts('),hub.indexOf('  var now='));
const hubCode=hub.slice(hub.indexOf('  function nextRun('),hub.indexOf('  function paintSchedule('));
const fixtures=[
 ['2026-10-14T03:00Z','11 h 00 min','Tomorrow'],
 ['2026-10-19T14:00Z','Wednesday, 10:00 AM','Wednesday'],
 ['2026-10-19T03:00Z','11 h 00 min','Tomorrow'],
 ['2026-10-13T06:49Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-10-13T13:59Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-10-14T13:00Z','1 h 00 min','Today'],
 ['2026-10-14T13:59Z','1 min','Today'],
 ['2026-10-14T14:00Z','Friday, 10:00 AM','Friday'],
 ['2026-10-15T13:59Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-10-15T14:01Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-10-16T14:00Z','Monday, 10:00 AM','Monday'],
 ['2026-10-17T13:00Z','Monday, 10:00 AM','Monday'],
 ['2026-10-18T13:00Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-03-06T15:00Z','Monday, 10:00 AM','Monday'],
 ['2026-03-08T06:30Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-03-08T07:30Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-03-09T13:59Z','1 min','Today'],
 ['2026-03-11T14:00Z','Friday, 10:00 AM','Friday'],
 ['2026-10-30T14:00Z','Monday, 10:00 AM','Monday'],
 ['2026-11-01T05:30Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-11-01T06:30Z','Tomorrow, 10:00 AM','Tomorrow'],
 ['2026-11-02T14:59Z','1 min','Today'],
 ['2026-11-04T15:00Z','Friday, 10:00 AM','Friday'],
 ['2027-01-01T15:00Z','Monday, 10:00 AM','Monday']
];
const oldZone=process.env.TZ;
try{for(const zone of ['UTC','America/Los_Angeles','Pacific/Auckland']){process.env.TZ=zone;for(const [time,expected,day]of fixtures){
 class Clock extends Date{constructor(...args){super(...(args.length?args:[time]))}}
 const w={Date:Clock,Intl};vm.runInNewContext(workbookCode,w);eq(w.nextSet(),expected,zone+' Workbook '+time);
 const h={Date:Clock,Intl,TZ:'America/New_York',now:new Clock(),DOW:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']};vm.runInNewContext(parts+hubCode,h);eq(h.nextRun(...h.sched.cp),'<b>'+day+'</b>10:00 AM ET',zone+' hub '+time);
 eq(Array.from(h.sched.fb[0]),[0,1,2,3,4,5,6],'Field Brief daily');eq(Array.from(h.sched.sp[0]),[5],'L&L Friday');
}}}finally{if(oldZone===undefined)delete process.env.TZ;else process.env.TZ=oldZone}
for(const p of ['daily-econ-challenge/index.html','personal-updates/index.html','personal-updates/handbook/index.html','desk/projects.json','desk/_tools/build.mjs','desk/index.html'])eq(fs.readFileSync(p,'utf8').includes('Mon · Wed · Fri'),true,p+' current cadence');
eq(/Workbook Monday, Wednesday and Friday at 10 AM/.test(fs.readFileSync('personal-updates/PUBLISHING.md','utf8')),true,'publishing contract');
const data=s=>JSON.parse(s.match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]);
const old=cp.execFileSync('git',['show','84fa40af39b1c11406e9659b7a2c5a22729d3b9f:daily-econ-challenge/index.html'],{encoding:'utf8',maxBuffer:8e6});
for(const e of data(old).editions)eq(data(wb).editions.find(x=>x.date===e.date),e,'historical answers/questions/learning content '+e.date);
const api=require('../desk/publications.js'),archive=api.archiveFrom(fs.readFileSync('personal-updates/issue-mark-archive.js','utf8'));
const latest=api.periodical('workbook',wb,archive,new Date('2026-10-13T06:49Z'));eq(latest.date,'2026-10-12','actual latest remains Monday, not expected Wednesday');eq(latest.number,'010','number unchanged');eq(latest.artwork,archive['cp:2026-10-12'].frozen,'matching immutable artwork');
console.log(checks+' Workbook M/W/F cadence and preservation checks passed');
