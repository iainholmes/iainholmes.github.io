// Daily Field Brief cadence and weekend/archive preservation.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const hub=fs.readFileSync('personal-updates/index.html','utf8'),fb=fs.readFileSync('daily-watchlist-5/index.html','utf8');
let checks=0;function eq(a,b,message){assert.deepEqual(a,b,message);checks++}
const code=hub.slice(hub.indexOf('  function nextRun('),hub.indexOf('  function paintSchedule('));
const c={now:null,nyParts:d=>{const o={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d).forEach(p=>o[p.type]=p.value);return o},DOW:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']};vm.createContext(c);vm.runInContext(code,c);
for(const [time,label] of [['2026-10-09T11:59:00Z','Today'],['2026-10-09T12:00:00Z','Tomorrow'],['2026-10-10T11:59:00Z','Today'],['2026-10-10T12:00:00Z','Tomorrow'],['2026-10-11T11:59:00Z','Today'],['2026-10-11T12:00:00Z','Tomorrow'],['2026-11-01T12:59:00Z','Today'],['2026-11-01T13:00:00Z','Tomorrow']]){c.now=new Date(time);eq(c.nextRun(...c.sched.fb),'<b>'+label+'</b>8:00 AM ET','daily weekend/DST boundary '+time)}
c.now=new Date('2026-10-10T13:00:00Z');eq(c.nextRun(...c.sched.cp),'<b>Monday</b>10:00 AM ET','Workbook remains weekdays');eq(c.nextRun(...c.sched.sp),'<b>Friday</b>3:00 PM ET','L&L remains Fridays');
eq(/<h2>Field Brief<\/h2><span>daily · 8:00/.test(hub),true,'hub daily metadata');
eq(/Field Brief daily, seven days per week \(including weekends\), at 8 AM/.test(fs.readFileSync('personal-updates/PUBLISHING.md','utf8')),true,'contract');
eq(/Schedule: daily, including Saturday and Sunday/.test(fb),true,'canonical maintenance');
eq(/\.turn \.mid\{grid-column:1\/-1;grid-row:2;text-align:center\}/.test(fb),true,'mobile wordmark beneath both links');
const data=s=>JSON.parse(s.match(/<script type="application\/json" id="briefing-data">([\s\S]*?)<\/script>/)[1]);
const base=cp.execFileSync('git',['show','0e0b7613009e9f83f3f53ddf8fc8635c2b0c6df3:daily-watchlist-5/index.html'],{encoding:'utf8',maxBuffer:8e6});for(const e of data(base).editions)eq(data(fb).editions.find(x=>x.date===e.date),e,'published content retained '+e.date);eq(data(fb).editions.some(e=>e.date==='2026-10-10'),true,'Saturday publication retained');
for(const p of ['daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js']){const c={module:{exports:{}}};vm.runInNewContext(cp.execFileSync('git',['show','0e0b7613009e9f83f3f53ddf8fc8635c2b0c6df3:'+p],{encoding:'utf8',maxBuffer:16e6}),c);const pinned=JSON.parse(JSON.stringify(c.module.exports)),current=require('../'+p);for(const [k,v] of Object.entries(pinned)){if(k==='issues'){for(const [date,plates] of Object.entries(v))eq(current.issues[date],plates,'immutable story pins '+date)}else eq(current[k],v,'immutable registry '+k)}}
const eds=data(fb).editions,latest=eds.at(-1),memory=require('../personal-updates/editorial-memory.js'),art=require('../daily-watchlist-5/artwork.js'),plates=require('../daily-watchlist-5/artwork-archive.js');
for(const e of eds)eq(e.stories.length,5,'five-story contract '+e.date);
eq(memory.history(eds,latest.date).map(e=>e.date),latest.editorialSelection.historyDates,'seven-edition assessment matches actual prior publications');
for(const e of eds.filter(e=>e.date>'2026-10-03')){art.validateEdition(e,plates.issues[e.date],art.recent(plates.issues,e.date));checks++}
eq(art.prepare(eds,plates),plates,'preparation preserves every published plate');
console.log(checks+' daily schedule/preservation checks passed');
