'use strict';
/* Authoring regression: future editions inherit the settled design and cannot
 * publish a provisional exhibit. This fixture remains private/in-memory. */
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {compose,nodes}=require('../weekly-economics-environment/editorial-folio.cjs');
const {catalog}=require('../weekly-economics-environment/reading-exhibits.cjs');
const {validate}=require('../weekly-economics-environment/reading-layout-guard.cjs');
const read=p=>fs.readFileSync(p,'utf8');
const journal=read('weekly-economics-environment/index.html');
const notebook=read('weekly-economics-environment/notebook/index.html');
const folioCss=read('weekly-economics-environment/reading-folio.css');
const notebookCss=read('weekly-economics-environment/notebook/notebook.css');
const input={journal,notebook,folioCss,notebookCss};
let checks=0;
function ok(x,label){assert(x,label);checks++}
function eq(a,b,label){assert.deepEqual(a,b,label);checks++}
function rejected(fn,regex,label){assert.throws(fn,regex,label);checks++}
const initial=validate(input);
ok(initial.editions>=6&&initial.readings>=30,'existing finished editions and readings retained');
ok(initial.concepts>=19&&initial.curated,'existing cumulative concepts and curated exhibits retained');
eq(compose(journal),journal,'existing canonical publication byte-idempotent');
rejected(()=>validate({...input,journal:journal.replace('reading-folio.css?v=','missing-folio.css?v=')}),/CSS references missing/,'journal style link required');
rejected(()=>validate({...input,notebook:notebook.replace('class="concept-analysis"','class="missing-analysis"')}),/notebook structure/,'concept scaffolding required');
rejected(()=>validate({...input,journal:journal.replace('data-curated="true"','data-curated="false"')}),/uncurated reading/,'unfinished exhibit cannot be published');
rejected(()=>validate({...input,folioCss:folioCss.replace('nth-of-type(n+4)','missing-source-overflow-rule')}),/durable layout rule/,'future source-count CSS required');
// Feed the publisher an unpublished, authentic authoring structure. No
// previous public issue is altered and the fixture cannot be written by us.
const source=cp.execFileSync('git',['show','70274c9dfae92aa3c6132a3cf7dfd3659d9559a1:weekly-economics-environment/index.html'],{encoding:'utf8',maxBuffer:2e6});
const raw=source.match(/<article class="entry"[^>]*id="[^"]+"[\s\S]*?<\/article>/)?.[0];
ok(!!raw,'historical authoring template available for future-layout simulation');
const ids=Array.from({length:5},(_,i)=>'9999-12-31-private-layout-'+(i+1));
const articles=ids.map((id,i)=>{
 let html=raw.replace(/(<article class="entry" id=")[^"]+/,'$1'+id);
 const src=nodes(html).find(n=>n.classes.includes('sources'));
 ok(!!src,'source section retained in future authoring fixture '+i);
 const extra=Array.from({length:i},(_,j)=>'<a href="https://example.org/future-'+i+'-'+j+'">Unpublished fixture link '+j+'</a>').join('');
 return html.slice(0,src.close)+extra+html.slice(src.close);
}).join('');
const fixture='<section class="edition" id="edition-9999-12-31" data-edition="9999-12-31" data-title="Private Growth Fixture">'+articles+'</section>';
const main=journal.match(/<main\b[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)?.[1];
const grown=journal.replace('</main>',fixture+'</main>');
const provisional=compose(grown);
const resultingMain=provisional.match(/<main\b[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)?.[1];
ok(resultingMain.startsWith(main),'all founding editions and readings remain byte-identical');
for(const id of ids){
 const article=provisional.match(new RegExp('<article class="entry"[^>]*id="'+id+'"[\\s\\S]*?<\\/article>'))?.[0]||'';
 ok(article.includes('data-reading-finish="5"')&&article.includes('class="reading-sources"'),'future article inherits finished layout '+id);
 ok(article.includes('data-curated="false"'),'missing curation clearly labeled during draft '+id);
}
eq(compose(provisional),provisional,'new issue retry does not rewrite or duplicate anything');
rejected(()=>validate({...input,journal:provisional}),/uncurated reading/,'unreviewed future issue blocked by publication preflight');
// Simulate subsequent editorial curation. This is not output content.
const test=Object.values(catalog).find(entry=>entry.kind==='test');
ok(!!test,'source-validated Assumption Test schema available');
for(const id of ids)catalog[id]={...test};
try{
 const ready=compose(grown),pass=validate({...input,journal:ready});
 eq(pass.editions,initial.editions+1,'the seventh edition is accepted by the publishing gate');
 eq(pass.readings,initial.readings+5,'all five future readings receive finished formatting');
 ok(pass.sourceLinks>=initial.sourceLinks+15,'one through five source links all survive');
 eq(compose(ready),ready,'curated future edition remains idempotent');
}finally{
 for(const id of ids)delete catalog[id];
}
console.log(checks+' future-edition layout, growth, curation and preservation checks passed.');
