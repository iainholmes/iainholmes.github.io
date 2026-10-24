/* Test-only fixtures. Never imported by a publisher or browser runtime. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict'),Module=require('node:module');
const root=path.resolve(__dirname,'../..'),baseline='edf28fa85a93c3462683aa8a00a86ee09bcd8c39';
const read=(dir,p)=>fs.readFileSync(path.join(dir,p),'utf8');
const old=p=>cp.execFileSync('git',['show',baseline+':'+p],{cwd:process.env.PERIODICALS_TEST_GIT_ROOT||root,encoding:'utf8',maxBuffer:20e6});
const data=(s,id)=>JSON.parse(s.match(new RegExp('id="'+id+'">([\\s\\S]*?)</script>'))[1]);
const load=s=>{const c={module:{exports:{}}};vm.runInNewContext(s,c);return JSON.parse(JSON.stringify(c.module.exports));};
const editions=s=>Object.fromEntries([...s.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)(?=<section class="edition"|<\/main>)/g)].map(m=>[m[1],m[0].trim()]));
function history(reader){
 const ll=reader('weekly-economics-environment/index.html'),book=reader('weekly-economics-environment/notebook/index.html');
 const byDate=es=>Object.fromEntries(es.map(e=>[e.date,e]));
 return {covers:load(reader('personal-updates/issue-mark-archive.js')),readingArt:load(reader('daily-watchlist-5/artwork-archive.js')).issues,legacyArt:load(reader('daily-watchlist-5/artwork-archive.js')).legacy,
  brief:byDate(data(reader('daily-watchlist-5/index.html'),'briefing-data').editions),workbook:byDate(data(reader('daily-econ-challenge/index.html'),'challenge-data').editions),journal:editions(ll),studies:data(ll,'field-studies'),companions:data(ll,'companion-data'),
  register:Object.fromEntries(data(ll,'field-register').entries.map(e=>[e.no,e])),reviews:JSON.parse(reader('weekly-economics-environment/notebook/reviews.json')).reviews,
  // Notebook prose and references may grow through authorized substantive reviews.
  notebookAnchors:Object.fromEntries([...book.matchAll(/<article class="concept" id="([^"]+)"/g)].map(m=>[m[1],true]))};
}
const currentHistory=dir=>history(p=>read(dir,p)),baselineHistory=()=>history(old);
function assertHistory(now,prior){let count=0;for(const [kind,entries]of Object.entries(prior))for(const [id,value]of Object.entries(entries)){assert.deepEqual(now[kind]?.[id],value,'immutable '+kind+' '+id);count++;}return count;}
function isolatedMarks(archive){
 const filename=path.join(root,'personal-updates/issue-marks.js'),m=new Module(filename,module),req=Module.createRequire(filename);m.filename=filename;m.paths=module.paths;m.require=id=>id==='./issue-mark-archive.js'?archive:req(id);m._compile(read(root,'personal-updates/issue-marks.js'),filename);return m.exports;
}
const addDays=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
function nextDate(h){let d=addDays(Object.keys(h.brief).concat(Object.keys(h.workbook),Object.keys(h.journal)).sort().at(-1),1);while(new Date(d+'T12:00:00Z').getUTCDay()!==5)d=addDays(d,1);return d;}
function replaceData(s,id,value){return s.replace(new RegExp('(id="'+id+'">)[\\s\\S]*?(</script>)'),(_,a,b)=>a+'\n'+JSON.stringify(value,null,2)+'\n'+b);}
const write=(dir,p,s)=>fs.writeFileSync(path.join(dir,p),s);
function writeRegistry(dir,p,value){const s=read(dir,p),prefix=s.slice(0,s.indexOf('=',s.indexOf('(function(root)'))+1),suffix=s.slice(s.lastIndexOf(';if(typeof module'));assert(prefix&&suffix);write(dir,p,prefix+JSON.stringify(value,null,2)+suffix);}
function copySite(from,to){for(const p of ['personal-updates','daily-watchlist-5','daily-econ-challenge','weekly-economics-environment','scripts','assets'])fs.cpSync(path.join(from,p),path.join(to,p),{recursive:true});}
function copyControlledSite(from,to){
 copySite(from,to);
 // Historical source is input to a private fixture, not a whole-file assertion
 // about the growing real publication. Keep the actual current runtime modules.
 for(const p of ['personal-updates/index.html','personal-updates/issue-mark-archive.js','daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','daily-econ-challenge/index.html','weekly-economics-environment/index.html','weekly-economics-environment/notebook/index.html','weekly-economics-environment/notebook/reviews.json'])write(to,p,old(p));
}
const outputPaths=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','personal-updates/issue-mark-archive.js','personal-updates/index.html','weekly-economics-environment/index.html'];
const snap=dir=>outputPaths.map(p=>read(dir,p));
const prepare=dir=>cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:dir,encoding:'utf8',stdio:'pipe'});
const roman=n=>{let s='';for(const [v,c]of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=c;n-=v;}return s;};
/* Authored test-only diagrams, independent of the finite production scene pools.
   Histograms represent distributions; interval plates represent measured uncertainty.
   Deterministic alternatives must pass the unchanged real validators over ALL history.
   No production signature is assumed to be unused; no collision is filtered out. */
function freshPin(key,date,no,h,cover){
 const art=require('../../personal-updates/art-originality.js'),vectors=require('../../daily-watchlist-5/artwork.js'),studies=require('../../weekly-economics-environment/field-study.js');
 const layer=key==='cp'?'workbook':key==='sp'?'cover':'study',prior=key==='study'?h.studies:Object.fromEntries(Object.entries(h.covers).filter(([id])=>id.startsWith(key+':')));
 for(let variant=0;variant<256;variant++){
  let geometry='';const bins=4+variant%9;
  for(let i=0;i<bins;i++){
   const x=70+i*460/bins,w=460/bins-9,height=45+(i*i*53+variant*71+i*variant*31)%265;
   const intervalStart=65+(i*37+variant*13)%120;
   geometry+=key==='study'?'<path d="M'+intervalStart+' '+(70+i*250/bins)+'h'+(35+height*.65)+'m0 -8v16" stroke="#1f4a3b" stroke-width="5"/><circle cx="'+(intervalStart+height*.35)+'" cy="'+(70+i*250/bins)+'" r="7" fill="#b4532e"/>':'<rect x="'+x+'" y="'+(480-height)+'" width="'+w+'" height="'+height+'" fill="'+(i%2?'#b4532e':'#1f4a3b')+'"/>';
  }
  const signature='test-only:'+key+':'+date+':'+variant;
  const svg='<svg role="img" viewBox="0 0 600 '+(key==='study'?'390':'800')+'"><title>Unpublished distribution fixture</title><rect width="600" height="'+(key==='study'?'390':'800')+'" fill="#f3f0e6"/>'+geometry+(key==='study'?'':'<path d="M42 570H558"/>')+'</svg>';
  const m=key==='study'?{date,no,version:4,concept:'evidence',composition:signature,signature,html:svg+'<figcaption>Unpublished interval fixture</figcaption>'}:{key,date,no:String(no).padStart(3,'0'),version:key==='fb'?5:key==='cp'?4:6,subject:'evidence',theme:'identification',identity:key==='cp'?'The Workbook':key==='sp'?'Loblolly & Logit':'Field Brief',composition:signature,signature,phrase:'Unpublished distribution fixture',seed:variant,geometry,frozen:svg};
  try{if(key==='fb')vectors.validateIssue(m,prior);else if(key==='study')studies.validateOriginality(m,prior,cover);else art.validate(m,prior,layer);return m;}catch(e){if(!/originality|same-edition/.test(e.message))throw e;}
 }
 throw Error('Test-only distribution fixtures exhausted; author another test diagram without changing validation thresholds.');
}
function append(dir,keys=['fb','cp','sp'],{automatic=false}={}){
 const before=currentHistory(dir),date=nextDate(before),pins=structuredClone(before.covers),out={date,before};
 if(keys.includes('fb')){
  const p='daily-watchlist-5/index.html',doc=read(dir,p),payload=data(doc,'briefing-data'),ed=structuredClone(payload.editions.at(-1));ed.date=date;ed.displayDate=new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});ed.shortDate=new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});ed.issueTitle='Unpublished measurement and distribution fixture';ed.deck='Evidence and measurement of observed distributions';payload.editions.push(ed);write(dir,p,replaceData(doc,'briefing-data',payload));
  if(!automatic){const plates=load(read(dir,'daily-watchlist-5/artwork-archive.js')),vectors=require('../../daily-watchlist-5/artwork.js');plates.issues[date]=vectors.edition(ed,plates.issues);writeRegistry(dir,'daily-watchlist-5/artwork-archive.js',plates);pins['fb:'+date]=freshPin('fb',date,payload.editions.length,before);}out.brief=ed;
 }
 if(keys.includes('cp')){
  const p='daily-econ-challenge/index.html',doc=read(dir,p),payload=data(doc,'challenge-data'),ed=structuredClone(payload.editions.at(-1));ed.no=payload.editions.length+1;ed.date=date;
  // A temporary metadata/learning fixture, never a publishable problem set.
  ed.questions.forEach(q=>q.assistance+='<p>Unpublished distribution fixture '+date+' / '+q.id+'.</p>');payload.editions.push(ed);write(dir,p,replaceData(doc,'challenge-data',payload));if(!automatic)pins['cp:'+date]=freshPin('cp',date,ed.no,before);out.workbook=ed;
 }
 if(keys.includes('sp')){
  const p='weekly-economics-environment/index.html',doc=read(dir,p),latest=Object.entries(before.journal).sort().at(-1),no=Object.keys(before.journal).length+1,year=+date.slice(0,4),annual=Object.keys(before.journal).filter(d=>d.startsWith(String(year))).length+1;
  let ed=latest[1].replaceAll(latest[0],date);const label='Volume '+roman(year-2025)+' <span class="sep">/</span> N<sup>o</sup>. '+String(annual).padStart(3,'0')+' <span class="sep">/</span> '+new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  ed=ed.replace(/(<div class="eyebrow edition-label">)[\s\S]*?(<\/div>)/,(_,a,b)=>a+label+b).replace(/(<section class="synthesis"[^>]*>)[\s\S]*?<\/section>/,(_,a)=>a+'<h2>Unpublished fixture</h2><p>Evidence and measurement describe distributions and interval uncertainty.</p></section>');
  if(!automatic)pins['sp:'+date]=freshPin('sp',date,no,before);const field=automatic?{...before.studies}:{...before.studies,[date]:freshPin('study',date,no,before,pins['sp:'+date])};let updated=doc.replace('</main>',ed+'\n</main>');updated=replaceData(updated,'field-studies',field);write(dir,p,updated);
  const rp='weekly-economics-environment/notebook/reviews.json',reviews=JSON.parse(read(dir,rp));reviews.reviews[date]={reviewedOn:date,readings:[...ed.matchAll(/<article class="entry"[^>]*id="([^"]+)"/g)].map(m=>m[1]),synthesis:ed.match(/<section class="synthesis"[^>]*id="([^"]+)"/)[1],revisited:[],added:[],note:'Unpublished append-only pipeline fixture; not an editorial review or publication.'};write(dir,rp,JSON.stringify(reviews,null,2));out.journal=ed;
 }
 writeRegistry(dir,'personal-updates/issue-mark-archive.js',pins);prepare(dir);out.after=currentHistory(dir);assertHistory(out.after,before);const first=snap(dir);prepare(dir);assert.deepEqual(snap(dir),first,'append retry is byte-idempotent');return out;
}
module.exports={root,baseline,old,read,data,load,editions,history,currentHistory,baselineHistory,assertHistory,isolatedMarks,addDays,nextDate,replaceData,write,writeRegistry,copySite,copyControlledSite,outputPaths,snap,prepare,freshPin,append};
