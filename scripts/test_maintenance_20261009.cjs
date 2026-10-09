'use strict';
const fs=require('fs'),cp=require('child_process'),path=require('path'),os=require('os'),assert=require('assert/strict');
const base='b342f70432d61b7cc52c5f143792fcf92c9a3463',read=p=>fs.readFileSync(p,'utf8'),old=p=>cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:20e6});
let assertions=0;function equal(a,b,m){assert.deepEqual(a,b,m);assertions++}function check(a,m){assert(a,m);assertions++}
const data=(s,id)=>JSON.parse(s.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)</script>'))[1]);
const file='weekly-economics-environment/index.html',ll=read(file),before=old(file),studies=require('../weekly-economics-environment/field-study.js'),cover=require('../personal-updates/issue-mark-archive.js');
for(const [file,id] of [['daily-watchlist-5/index.html','briefing-data'],['daily-econ-challenge/index.html','challenge-data']]){const current=data(read(file),id).editions;for(const ed of data(old(file),id).editions)equal(current.find(x=>x.date===ed.date),ed,'historical publication data unchanged: '+ed.date)}
for(const p of ['personal-updates/mobile-shelf.js','personal-updates/commonplace/commonplace.js','personal-updates/commonplace/index.html','personal-updates/handbook/index.html'])equal(read(p),old(p),p+' preserved');
for(const article of before.matchAll(/<article class="entry"[\s\S]*?<\/article>/g))check(ll.includes(article[0]),'historical L&L article unchanged');
for(const entry of data(before,'field-register').entries)equal(data(ll,'field-register').entries.find(x=>x.no===entry.no),entry,'historical Field Register entry unchanged');
const vm=require('vm');
const footerCode=ll.match(/var closing=document.getElementById\('closingNo'\);[^\n]+/)[0];
for(const [date,expected] of [['2026-09-25','001'],['2026-10-09','003'],['2027-01-08','001'],['2027-01-15','002']]){const node={},chron=['2026-09-25','2026-10-02','2026-10-09','2027-01-08','2027-01-15'].map(d=>({dataset:{edition:d}}));vm.runInNewContext(footerCode,{document:{getElementById:()=>node},chron,active:{dataset:{edition:date}},pad3:n=>String(n).padStart(3,'0')});equal(node.textContent,expected,'footer annual sequence '+date)}
for(const file of ['personal-updates/issue-mark-archive.js','daily-watchlist-5/artwork-archive.js']){const previous={module:{exports:{}}};vm.runInNewContext(old(file),previous);const current=require('../'+file);const prior=previous.module.exports.issues||previous.module.exports,now=current.issues||current;for(const [key,value] of Object.entries(prior))equal(JSON.stringify(now[key]),JSON.stringify(value),'historical artwork pin unchanged: '+key)}
const field=data(ll,'field-studies'),previous=data(before,'field-studies');
for(const date of ['2026-09-25','2026-10-02'])equal(field[date],previous[date],'historical Field Study pin preserved');
equal(field['2026-10-09'].html.match(/<figcaption>[\s\S]*/)[0],previous['2026-10-09'].html.match(/<figcaption>[\s\S]*/)[0],'caption/number unchanged');
check(!studies.distinctFromCover(previous['2026-10-09'],cover['sp:2026-10-09']),'old terrain scene rejected');
check(studies.distinctFromCover(field['2026-10-09'],cover['sp:2026-10-09']),'new incidence channels differ from frozen cover');
check(!studies.distinctFromCover({composition:'renamed',html:cover['sp:2026-10-09'].frozen},cover['sp:2026-10-09']),'metadata cannot disguise shared geometry');
equal(studies.transmission({date:'2026-10-09',no:3}),studies.transmission({date:'2026-10-09',no:3}),'deterministic diagram');
const companions=data(ll,'companion-data'),oldCompanions=data(before,'companion-data');
for(const [date,c] of Object.entries(companions)){check(c.appearances.length>=1&&c.appearances.length<=2,'curated appearance limit');if(oldCompanions[date])for(const a of c.appearances)equal(a,oldCompanions[date].appearances.find(x=>x.id===a.id),'retained intervention unchanged')}
equal(companions['2026-10-09'].appearances.map(x=>x.title),['A feasible price is not a forecast','Why the boundary helps']);
// Preparation operates on isolated copies; published registries cannot be regenerated.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'periodicals-maintenance-'));
try{
 for(const p of ['daily-watchlist-5','daily-econ-challenge','weekly-economics-environment','personal-updates','scripts'])fs.cpSync(p,path.join(temp,p),{recursive:true});
 const prep=()=>cp.execFileSync(process.execPath,[path.join(temp,'scripts/prepare_periodicals.cjs')],{cwd:temp,encoding:'utf8',stdio:['ignore','pipe','pipe']});
 prep();const paths=['weekly-economics-environment/index.html','personal-updates/issue-mark-archive.js','daily-watchlist-5/artwork-archive.js','personal-updates/index.html'];const first=paths.map(p=>fs.readFileSync(path.join(temp,p),'utf8'));prep();equal(paths.map(p=>fs.readFileSync(path.join(temp,p),'utf8')),first,'repeated preparation deterministic');
 equal(data(first[0],'field-studies'),field,'all current Field Studies remain pinned');equal(first[1],read(paths[1]),'covers remain byte stable');equal(first[2],read(paths[2]),'story plates remain byte stable');
 let fixture=data(first[0],'field-studies');delete fixture['2026-10-09'];fs.writeFileSync(path.join(temp,file),first[0].replace(/(<script type="application\/json" id="field-studies">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(fixture)+b));prep();const generated=data(fs.readFileSync(path.join(temp,file),'utf8'),'field-studies')['2026-10-09'];check(studies.distinctFromCover(generated,cover['sp:2026-10-09']),'future missing plate generated distinct from cover');
 const invalid=JSON.parse(JSON.stringify(companions));invalid['2026-10-09'].appearances.push(oldCompanions['2026-10-09'].appearances[2]);fs.writeFileSync(path.join(temp,file),ll.replace(/(<script type="application\/json" id="companion-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(invalid)+b));assert.throws(prep,/at most two active Heron/);assertions++;
}finally{fs.rmSync(temp,{recursive:true,force:true})}
console.log(JSON.stringify({assertions,result:'passed'}));
