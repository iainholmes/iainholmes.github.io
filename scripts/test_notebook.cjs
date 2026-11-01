'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {validate}=require('../weekly-economics-environment/notebook/validate.cjs');
const root=path.resolve(__dirname,'..'),base='a9cb3340e8b2da52ffbfcc0a6e262cb65a1a9837';
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),old=p=>cp.execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8',maxBuffer:20e6});
const notebook=read('weekly-economics-environment/notebook/index.html'),journal=read('weekly-economics-environment/index.html'),reviews=JSON.parse(read('weekly-economics-environment/notebook/reviews.json'));
const input={journal,notebook,reviews};let assertions=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);assertions++;},ok=(a,m)=>{assert(a,m);assertions++;};
const rejected=(change,reason)=>{assert.throws(()=>validate({...input,...change}),reason);assertions++;};
const copy=()=>JSON.parse(JSON.stringify(reviews));
const main=journal.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1];
const dates=[...main.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"/g)].map(m=>m[1]).sort();
const conceptCount=[...notebook.matchAll(/<article class="concept" id=/g)].length;
ok(conceptCount>=18,'restored concepts remain cumulative');
eq(validate(input),{editions:dates.length,concepts:conceptCount,newestReviewed:dates.at(-1)});
const before=old('weekly-economics-environment/notebook/index.html');
const articles=s=>[...s.matchAll(/<article class="concept" id="([^"]+)"[\s\S]*?<\/article>/g)];
const now=new Map(articles(notebook).map(m=>[m[1],m[0]]));
// Individual historical appearances stay protected as the live archive grows.
const referenceBaseline=cp.execFileSync('git',['show','a4245e533cca3d65d310dec6a5a9d56422d5af4c:weekly-economics-environment/notebook/index.html'],{cwd:root,encoding:'utf8'});
for(const m of articles(referenceBaseline)){
 const current=now.get(m[1]);ok(current,'historical concept retained '+m[1]);
 for(const g of m[0].matchAll(/<a href="\.\.\/#edition-([^"]+)">[\s\S]*?<\/a><p>([\s\S]*?)<\/p>/g)){
  const group=current.match(new RegExp('<li class="appearance" data-edition="'+g[1]+'">([\\s\\S]*?)(?=<li class="appearance"|<\\/ol>)'))?.[1];
  ok(group,'historical edition association retained '+m[1]+' '+g[1]);
  for(const a of g[2].matchAll(/<a href="[^"]+">[\s\S]*?<\/a>/g))ok(group.includes(a[0]),'historical direct reference and label retained '+a[0]);
 }
}
// Protect scholarship independently of its presentation wrappers.
const scholarship=s=>({
 heading:s.match(/<h2[^>]*>[\s\S]*?<\/h2>/)?.[0],
 number:s.match(/<div class="concept-number">([^<]+)<\/div>/)?.[1],
 definition:s.match(/<p class="canonical">[\s\S]*?<\/p>/)?.[0],
 use:s.match(/<h3[^>]*>Why it matters<\/h3>(<p>[\s\S]*?<\/p>)/)?.[1],
 caution:s.match(/<h3[^>]*>A caution<\/h3>(<p>[\s\S]*?<\/p>)/)?.[1],
 figures:[...s.matchAll(/<figure[\s\S]*?<\/figure>/g)].map(m=>m[0])
});
const referenceLinks=s=>[...s.matchAll(/href="(\.\.\/#(?!edition-)[^"]+)"/g)].map(x=>x[1]);
for(const m of articles(before)){
 const current=now.get(m[1]);ok(current,'permanent concept retained '+m[1]);
 eq(scholarship(current),scholarship(m[0]),'original explanation, identity, diagram and number unchanged');
 const links=referenceLinks(current);
 for(const href of referenceLinks(m[0]))ok(links.includes(href),'original Issue 001 reference retained '+href);
}
for(const id of ['fixed-effects','hedonic-prices','value-of-information'])if(!dates.some(d=>d>'2026-10-09'&&now.get(id).includes('data-edition="'+d+'"')))eq(referenceLinks(now.get(id)),referenceLinks(articles(before).find(m=>m[1]===id)[0]),'no unsupported historical references '+id);
for(const date of ['2026-10-02','2026-10-09']){
 const review=reviews.reviews[date];ok(review.revisited.length>0&&review.added.length>0,'substantive coverage '+date);
 for(const reading of review.readings)ok(notebook.includes('href="../#'+reading+'"'),'every reading has supported notebook coverage '+reading);
}
for(const m of old('weekly-economics-environment/index.html').matchAll(/<article class="entry"[\s\S]*?<\/article>/g))ok(journal.includes(m[0]),'published article preserved');
const snapshot=JSON.stringify(input);validate(input);validate(input);eq(JSON.stringify(input),snapshot,'validation is read-only and idempotent');
for(const date of ['2026-09-25',dates.at(-1)]){const r=copy();delete r.reviews[date];rejected({reviews:r},/missing documented review/);}
{const r=copy();r.reviews['2026-10-09'].readings.pop();rejected({reviews:r},/all five readings/);}
{const r=copy();r.reviews['2026-10-09'].synthesis='connections';rejected({reviews:r},/synthesis/);}
{const r=copy();r.reviews['2026-10-09'].reviewedOn='2026-02-30';rejected({reviews:r},/invalid review date/);}
{const r=copy();r.reviews['2026-10-09'].revisited.push('fixed-effects');rejected({reviews:r},/lacks a reference/);}
{const r=copy();r.reviews['2026-10-09'].revisited.push(r.reviews['2026-10-09'].added[0]);rejected({reviews:r},/editorial decisions/);}
rejected({notebook:notebook.replace('href="../#2026-10-09-landslides"','href="../#missing-reading"')},/unresolved journal reference/);
rejected({notebook:notebook.replace('Last revisited · <time datetime="2026-10-09">9 October 2026','Last revisited · <time datetime="2026-10-02">2 October 2026')},/Last revisited/);
rejected({notebook:notebook.replace('href="#complementarity"','href="#missing-concept"')},/index and permanent entries/);
rejected({notebook:notebook.replace('href="../#electrification"','href="../#edition-2026-09-25"')},/links only to specific/);
rejected({notebook:notebook.replace('data-edition="2026-09-25"','data-edition="2026-10-02"')},/chronological|metadata|wrong edition/);
rejected({notebook:notebook.replace('No. 001 · <time','No. 999 · <time')},/metadata/);
rejected({notebook:notebook.replace('<p class="edition-title">The Price of a Resilient Economy</p>','<p class="edition-title">Wrong edition</p>')},/metadata/);
rejected({notebook:notebook.replace('data-kind="synthesis"','data-kind="reading"')},/reference kind/);
rejected({notebook:notebook.replace('<span class="reference-kind">Synthesis</span>','')},/reference kind/);
rejected({notebook:notebook.replace('id="concept-index"','id="missing-index"')},/return-to-index destination/);
rejected({notebook:notebook.replace('class="concept-analysis"','class="missing-layout"')},/companion-volume structure/);
rejected({notebook:notebook.replace('<div class="concept-number">01</div>','<div class="concept-number">99</div>')},/folio numbers/);
rejected({notebook:notebook.replace('</article>','</article>'+now.get('complementarity'))},/duplicate concept/);
{const first=notebook.match(/<li data-kind="reading"><a href="..\/#electrification">[\s\S]*?<\/li>/)[0];rejected({notebook:notebook.replace(first,first+first)},/duplicate references/);}
// An honestly reviewed issue needs no arbitrary glossary additions or references.
const nextDate=new Date(Date.parse(dates.at(-1)+'T12:00:00Z')+7*86400000).toISOString().slice(0,10),ids=Array.from({length:5},(_,i)=>nextDate+'-reading-'+(i+1));
const next='<section class="edition" data-edition="'+nextDate+'">'+ids.map(id=>'<article class="entry" id="'+id+'"></article>').join('')+'<section class="synthesis" id="'+nextDate+'-connections"></section></section>';
const future=journal.replace('</main>',next+'</main>'),r=copy();
rejected({journal:future},/missing documented review/);
r.reviews[nextDate]={reviewedOn:nextDate,readings:ids,synthesis:nextDate+'-connections',revisited:[],added:[],note:'All five readings and synthesis reviewed; no distinct reusable addition or substantive revisit warranted.'};
eq(validate({journal:future,notebook,reviews:r}),{editions:dates.length+1,concepts:conceptCount,newestReviewed:nextDate},'valid no-addition review');
// Private, far-future inputs exercise growth without relying on the live archive's next slot.
{
 const date='9999-12-03',stamp='3 December 9999',id='private-notebook-fixture',readingIds=Array.from({length:5},(_,i)=>'private-notebook-reading-'+i),synthesis='private-notebook-synthesis';
 const edition='<section class="edition" data-edition="'+date+'" data-title="Private Fixture Edition"><div class="eyebrow edition-label">No. 999</div>'+readingIds.map(id=>'<article class="entry" id="'+id+'"></article>').join('')+'<section class="synthesis" id="'+synthesis+'"></section></section>';
 const group='<li class="appearance" data-edition="'+date+'"><div class="appearance-edition"><p class="edition-folio">No. 999 · <time datetime="'+date+'">'+stamp+'</time></p><p class="edition-title">Private Fixture Edition</p></div><ul class="appearance-readings">'+readingIds.slice(0,2).map((id,i)=>'<li data-kind="reading"><a href="../#'+id+'">A deliberately long, substantive reference label '+i+'</a></li>').join('')+'</ul></li>';
 const first=now.get('complementarity'),last=first.match(/<p class="revisited">[\s\S]*?<\/p>/)[0],newLast='<p class="revisited">Last revisited · <time datetime="'+date+'">'+stamp+'</time></p>';
 const revisited=first.replace('</ol>',group+'</ol>').replace(last,newLast);
 let added=now.get('fixed-effects').replaceAll('fixed-effects',id).replace('<div class="concept-number">05</div>','<div class="concept-number">'+String(conceptCount+1).padStart(2,'0')+'</div>').replace(/<h2[^>]*>[\s\S]*?<\/h2>/,'<h2 id="title-'+id+'">A Future Concept With a Longer Title</h2>');
 added=added.replace(/<ol class="appearance-register">[\s\S]*?<\/ol>/,'<ol class="appearance-register">'+group+'</ol>').replace(/<p class="revisited">[\s\S]*?<\/p>/,newLast);
 const grown=notebook.replace(first,revisited).replace(/<\/ol>\s*<\/nav>(?=\s*<div id="concepts">)/,'<li><a href="#'+id+'">A Future Concept With a Longer Title</a></li></ol></nav>').replace(/<\/div>\s*<\/main>/,added+'</div></main>');
 const reviewed=copy();reviewed.reviews[date]={reviewedOn:date,readings:readingIds,synthesis,revisited:['complementarity'],added:[id],note:'Private growth fixture: two supported readings share an edition group; a new distinct concept uses the same semantic presentation.'};
 eq(validate({journal:journal.replace('</main>',edition+'</main>'),notebook:grown,reviews:reviewed}),{editions:dates.length+1,concepts:conceptCount+1,newestReviewed:date},'new edition, additional appearances and a longer new concept remain valid');
}
// Actual preparation retries cannot duplicate entries or alter published artifacts.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'periodicals-notebook-'));
try{
 for(const p of ['daily-watchlist-5','daily-econ-challenge','weekly-economics-environment','personal-updates','scripts'])fs.cpSync(path.join(root,p),path.join(temp,p),{recursive:true});
 const prep=()=>cp.execFileSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:temp,encoding:'utf8',stdio:['ignore','pipe','pipe']});
 const files=['weekly-economics-environment/notebook/index.html','weekly-economics-environment/notebook/reviews.json','weekly-economics-environment/index.html','personal-updates/issue-mark-archive.js','daily-watchlist-5/artwork-archive.js','daily-watchlist-5/index.html','daily-econ-challenge/index.html','personal-updates/index.html'];
 const bytes=()=>files.map(p=>fs.readFileSync(path.join(temp,p),'utf8'));
 const initial=bytes();prep();eq(bytes(),initial,'preparation preserves notebook, journal and all pinned publication bytes');prep();eq(bytes(),initial,'repeat preparation is byte-idempotent');
 const missing=copy();delete missing.reviews['2026-10-09'];fs.writeFileSync(path.join(temp,'weekly-economics-environment/notebook/reviews.json'),JSON.stringify(missing));
 const omitted=bytes();assert.throws(prep,/missing documented review for 2026-10-09/);assertions++;eq(bytes(),omitted,'missing review fails before any publication artifact write');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({assertions,result:'passed'}));
