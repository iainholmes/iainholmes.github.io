/* Prospective cover originality: published repeats are immutable fixtures, never repaired. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const art=require('../daily-watchlist-5/artwork.js'),marks=require('../personal-updates/issue-marks.js'),archive=require('../personal-updates/issue-mark-archive.js');
const base='608788890a1fcba1b3b274f9e2b5b586178d2f75',read=p=>fs.readFileSync(p,'utf8'),old=p=>cp.execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:16e6});
let assertions=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);assertions++},check=(x,label)=>{assert(x,label);assertions++},throws=(f,re,label)=>{assert.throws(f,re,label);assertions++};
const data=s=>JSON.parse(s.match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]);
const registry=s=>{const c={module:{exports:{}}};vm.runInNewContext(s,c);return JSON.parse(JSON.stringify(c.module.exports));};
const prior=registry(old('personal-updates/issue-mark-archive.js'));
for(const [key,value]of Object.entries(prior))eq(archive[key],value,'historical frozen artifact '+key);
for(const ed of data(old('daily-watchlist-5/index.html')).editions)eq(data(read('daily-watchlist-5/index.html')).editions.find(x=>x.date===ed.date),ed,'historical editorial content '+ed.date);
eq(read('daily-watchlist-5/artwork-archive.js'),old('daily-watchlist-5/artwork-archive.js'),'every published story plate unchanged');
const groups=[['2026-10-07','2026-10-11','2026-10-17'],['2026-10-05','2026-10-16'],['2026-10-09','2026-10-14'],['2026-10-10','2026-10-15']];
for(const group of groups){const first=archive['fb:'+group[0]];for(const date of group.slice(1)){
 eq(art.centralArtwork(archive['fb:'+date]),art.centralArtwork(first),'confirmed historical central illustration repeat');
 const future={...first,date:'2028-01-01',no:'999',signature:'invented-label',subject:'invented-theme',frozen:first.frozen.replace(/<title>[\s\S]*?<\/title>/,'<title>A different date and title</title>').replace(/2026-\d\d-\d\d/g,'2028-01-01')};
 throws(()=>art.validateIssue(future,archive),/identical central geometry/,'metadata cannot disguise a repeat');
}}
const original=archive['fb:2026-10-17'],center=art.centralArtwork(original),wrap=s=>'<svg viewBox="0 0 600 800"><rect width="600" height="800" fill="#f1e6d0"/>'+s+'<path d="M42 570H558"/><text>NEW ISSUE</text></svg>';
for(const transform of ['rotate(90 300 300)','translate(7 -9)','translate(600 0) scale(-1 1)','translate(3 5) scale(1.02)'])throws(()=>art.validateIssue({date:'2028-01-01',frozen:wrap('<g transform="'+transform+'">'+center+'</g>')},archive),/originality/,'whole-geometry transforms do not confer originality');
const recolored=center.replaceAll('#221a14','#403127').replaceAll('#8a2a36','#9d3341');throws(()=>art.validateIssue({date:'2028-01-01',frozen:wrap(recolored)},archive),/identical central geometry/,'recoloring cannot confer originality');
const moved=center.replace(/(\b(?:d|x|y|cx|cy|r|width|height)=")(.*?)(")/g,(_,a,v,b)=>a+v.replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)/g,n=>String(+n*1.015+2))+b);
const near=art.issueOriginality({date:'2028-01-01',frozen:wrap(moved)},archive);check(!near.ok&&/similar/.test(near.reason),'baked numeric perturbations rejected by normalized silhouette, not ID');
const simple='<rect x="100" y="105" width="120" height="175" fill="#221a14"/><circle cx="410" cy="350" r="76" fill="#8a2a36"/>';
const rotated='<rect x="320" y="100" width="175" height="120" fill="#221a14"/><circle cx="250" cy="410" r="76" fill="#8a2a36"/>';
const testHistory={'fb:2027-01-01':{key:'fb',date:'2027-01-01',frozen:wrap(simple)}};
check(!art.issueOriginality({date:'2027-01-02',frozen:wrap(rotated)},testHistory).ok,'baked 90-degree coordinates rejected by visual comparison');
const different=archive['fb:2026-10-09'];check(art.issueOriginality({...different,date:'2028-01-01'}, {['fb:'+original.date]:original}).ok,'different geometric scene using the same palette remains valid');
// Repeated broad themes retain relevant facets and never recycle the full-history composition.
const framings=['Research systems, staffing and institutional capacity','Court enforcement and export controls','Climate risks, heat and adaptation','Compute, power and infrastructure','Payroll employment and hiring adjustment','Evidence, survey data and measurement'];
let generated=0;
for(const framing of framings){const history={...archive},used=new Set();for(let i=1;i<=8;i++){
 const info={key:'fb',date:'2028-02-'+String(i).padStart(2,'0'),no:21+i,framing};const m=marks.model({...info});
 // model() reads the production archive; issueModel also accepts the publisher's evolving history.
 const next={...m,...art.issueModel(info,history)};next.frozen=marks.svg(next);
 eq(art.issueModel(info,history),art.issueModel(info,history),'deterministic bounded selection');check(!used.has(next.signature),'entire simulated history is protected');check(art.validateIssue(next,history).ok,'full-history visual separation');
 check(next.supportedConcepts.length>0,'content support is explicit');history['fb:'+next.date]=next;used.add(next.signature);generated++;
}}
// A finite vocabulary must fail closed instead of cycling through old pictures.
const exhausted={...archive},fixed={date:'2029-12-31',no:99,framing:'Court enforcement and export controls'};let blocked=false;
for(let i=0;i<=art.issuePolicy.maxAttempts;i++){
 try{const m=art.issueModel(fixed,exhausted),date=new Date(Date.UTC(2029,0,1+i)).toISOString().slice(0,10);exhausted['fb:'+date]={...m,key:'fb',date};}
 catch(e){check(/No original content-supported.*candidates/.test(e.message),'bounded exhaustion reports the concrete collision');blocked=true;break;}
}
check(blocked,'exhaustion must not bypass full-history checks');
const unknown={date:'2028-01-01',no:22,framing:'Unclassified prose with no supported editorial concept'};throws(()=>art.issueModel(unknown,archive),/content-supported framing/,'no unrelated fallback');
// Saved models remain authoritative in both Node and the actual browser module interface.
for(const [key,m]of Object.entries(archive))eq(marks.svg(marks.model({key:m.key,date:m.date,no:999,framing:'incidental later text'})),m.frozen,'pinned '+key);
const host={dataset:{},removeAttribute(){},closest:()=>null},browser={window:{FieldBriefArtwork:art,PeriodicalsMarkArchive:archive,document:{querySelector:()=>host}}};vm.runInNewContext(read('personal-updates/issue-marks.js'),browser);
browser.window.PeriodicalsIssueMarks.update({key:'fb',date:'2026-10-17',no:21});eq(host.innerHTML,original.frozen,'live refresh honors historical duplicate pin');
const latest=data(read('daily-watchlist-5/index.html')).editions.at(-1),latestMark=archive['fb:'+latest.date];eq(read('personal-updates/index.html').match(/data-issue-mark="fb"[^>]*>([\s\S]*?)<\/div>/)[1],latestMark.frozen,'no-script current cover remains pinned');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fb-cover-originality-'));
const outputs=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html'];
try{
 for(const p of ['personal-updates','daily-watchlist-5','daily-econ-challenge','weekly-economics-environment'])fs.cpSync(p,path.join(dir,p),{recursive:true});fs.mkdirSync(path.join(dir,'scripts'));fs.copyFileSync('scripts/prepare_periodicals.cjs',path.join(dir,'scripts/prepare_periodicals.cjs'));
 const prep=()=>cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:dir,encoding:'utf8',stdio:'pipe'}),snap=()=>outputs.map(p=>fs.readFileSync(path.join(dir,p),'utf8'));
 const before=snap();prep();eq(snap(),before,'known historical duplicates do not invalidate or regenerate the archive');
 const candidate=structuredClone(latest);candidate.date='2028-01-01';candidate.issueTitle='Court review and enforcement capacity';candidate.deck='Court enforcement and export controls';candidate.signalTitle='Review and verification';candidate.signal=['Legal enforcement depends on evidence.'];
 const source=path.join(dir,'daily-watchlist-5/index.html'),doc=read('daily-watchlist-5/index.html'),payload=data(doc);payload.editions.push(candidate);fs.writeFileSync(source,doc.replace(/(id="briefing-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(payload)+b));prep();
 const newArchive=registry(fs.readFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'utf8')),pin=newArchive['fb:'+candidate.date];eq(pin.no,'022','sequential numbering');eq(pin.version,5,'new originality-aware cover');check(art.validateIssue(pin,archive).ok,'publisher validates before freezing');
 for(const [k,v]of Object.entries(archive))eq(newArchive[k],v,'append-only '+k);
 eq(fs.readFileSync(path.join(dir,'personal-updates/index.html'),'utf8').match(/data-issue-mark="fb"[^>]*>([\s\S]*?)<\/div>/)[1],pin.frozen,'new embedded cover matches frozen pin');
 const stable=snap();prep();eq(snap(),stable,'repeat publication is byte-idempotent');
 // An updater cannot bypass validation by inserting a new pin before preparation.
 newArchive['fb:'+candidate.date]={...pin,frozen:original.frozen};fs.writeFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'module.exports='+JSON.stringify(newArchive));const bad=snap();throws(prep,/cover originality/,'new pre-pinned duplicates are rejected');eq(snap(),bad,'failure writes no artifact or hub state');
 newArchive['fb:'+candidate.date].date=original.date;fs.writeFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'module.exports='+JSON.stringify(newArchive));throws(prep,/does not match its canonical edition/,'old pin metadata cannot bypass the prospective boundary');
 delete newArchive['fb:'+candidate.date];fs.writeFileSync(path.join(dir,'personal-updates/issue-mark-archive.js'),'module.exports='+JSON.stringify(newArchive));throws(prep,/Missing historical Field Brief cover pin/,'a frozen future issue cannot silently regenerate a lost cover');
 if(process.env.FB_COVER_FIXTURE){fs.mkdirSync(process.env.FB_COVER_FIXTURE,{recursive:true});fs.writeFileSync(path.join(process.env.FB_COVER_FIXTURE,'candidate.svg'),pin.frozen);fs.writeFileSync(path.join(process.env.FB_COVER_FIXTURE,'candidate.json'),JSON.stringify(pin,null,2));fs.writeFileSync(path.join(process.env.FB_COVER_FIXTURE,'input.json'),JSON.stringify({key:'fb',date:candidate.date,no:22,title:candidate.issueTitle,stories:candidate.stories,framing:[candidate.deck,candidate.signalTitle,...candidate.signal||[]].join(' '),previous:archive['fb:'+latest.date]}));}
}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log(assertions+' prospective Field Brief cover checks passed; '+generated+' distinct repeated-theme covers; historical duplicates preserved.');
