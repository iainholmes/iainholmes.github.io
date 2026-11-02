/* Isolated prospective editorial-treatment tests; production pins are never regenerated. */
'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),cp=require('child_process'),os=require('os'),path=require('path');
const art=require('../daily-watchlist-5/artwork'),marks=require('../personal-updates/issue-marks'),archive=require('../personal-updates/issue-mark-archive');
let count=0;function check(ok,label){assert(ok,label);count++}function eq(a,b,label){assert.deepEqual(a,b,label);count++}
const html=fs.readFileSync('daily-watchlist-5/index.html','utf8'),data=JSON.parse(html.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]);
const input=e=>({key:'fb',date:e.date,no:data.editions.findIndex(x=>x.date===e.date)+1,title:e.issueTitle,stories:e.stories,framing:[e.deck,e.signalTitle,...e.signal||[]].join(' ')});
const nov2=data.editions.find(x=>x.date==='2026-11-02'),old=archive['fb:'+nov2.date];
check(art.issueOriginality(old,archive).ok,'published geometry was accepted by old policy and remains readable');
eq(art.issueTreatment(old,archive).reason,'repeated recent editorial caption','reported failure explicitly detected');
const candidate={...marks.model(input(nov2)),...art.issueModel(input(nov2),archive)};
check(candidate.subject!=='enforcement','headline/lead override incidental legal and voter words');
eq(candidate.composition,'capability-transfer','authored robotics mechanism supported by lead');
check(candidate.supportedConcepts[0].storyNumbers.includes('01'),'lead provenance');
check(candidate.phrase.includes('Robotics')&&!candidate.phrase.includes('Routes'),'caption derives from actual headline');
check(art.validateIssue({...candidate,frozen:marks.svg(candidate)},archive).ok,'proposal passes full archive and recent editorial comparison');
eq(art.issueModel(input(nov2),archive),art.issueModel(input(nov2),archive),'deterministic proposal');
const noise=structuredClone(input(nov2));noise.stories[4].editorial={legal:'voter regulation '.repeat(100)};
eq(art.issueCandidates(noise).subject,candidate.subject,'nested incidental metadata cannot dominate');
noise.stories[4].title+=' legal voter regulation';eq(art.issueCandidates(noise).subject,candidate.subject,'incidental secondary keywords cannot outweigh headline/lead');
const fixture={date:'9997-01-01',key:'fb',subject:'enforcement',phrase:'Courts / thresholds',composition:'study-three-fields-inspection-screen-shared-load-service-rack',frozen:old.frozen};
const history={'fb:9997-01-01':fixture};
check(!art.issueTreatment({...fixture,date:'9997-01-02',composition:'invented'},history).ok,'caption repetition caught despite arbitrary signature');
check(!art.issueTreatment({...fixture,date:'9997-01-02',phrase:'Another caption'},history).ok,'renaming caption cannot disguise arrangement');
check(!art.issueTreatment({...fixture,date:'9997-01-02',phrase:'New concept',composition:'study-open-triangle-inspection-screen-shared-load-power-junction'},history).ok,'overlapping motif combinations detected');
check(art.issueTreatment({...fixture,date:'9997-01-02',phrase:'Court review / appeals',composition:'enforcement-filter'},history).ok,'recurring subject with different treatment allowed');
const original=JSON.stringify(archive),synthetic={};
for(let i=1;i<=20;i++){
 const info={date:'9997-02-'+String(i).padStart(2,'0'),no:i,title:'Court enforcement and export controls',framing:'Court enforcement',stories:[]};
 const m={key:'fb',...art.issueModel(info,synthetic)};m.frozen=marks.svg({...m,no:String(i),identity:'Field Brief'});
 check(art.validateIssue(m,synthetic).ok,'recurring subject publication '+i);synthetic['fb:'+m.date]=m;
}
eq(JSON.stringify(archive),original,'selection never mutates published registry');
// Exercise the real preparation transaction with a simulated unavailable cover vocabulary.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fb-editorial-exhaustion-'));
try{
 for(const folder of ['scripts','personal-updates','daily-watchlist-5','daily-econ-challenge','weekly-economics-environment'])fs.cpSync(folder,path.join(dir,folder),{recursive:true});
 const copy=structuredClone(data);copy.editions.push({...structuredClone(nov2),date:'9997-03-01'});
 fs.writeFileSync(path.join(dir,'daily-watchlist-5/index.html'),html.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(copy)+b));
 fs.appendFileSync(path.join(dir,'daily-watchlist-5/artwork.js'),'\nmodule.exports.issueModel=()=>{throw Error("No original content-supported Field Brief cover: simulated exhaustion");};\n');
 const outputs=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json'];
 const before=outputs.map(p=>fs.readFileSync(path.join(dir,p),'utf8'));
 const run=cp.spawnSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:dir,encoding:'utf8'});
 check(run.status!==0&&run.stderr.includes('simulated exhaustion'),'failure is explicit and diagnosable');
 eq(outputs.map(p=>fs.readFileSync(path.join(dir,p),'utf8')),before,'editorial draft and all pins/hub remain intact; no partial writes');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log(count+' Field Brief editorial-cover checks passed.');
