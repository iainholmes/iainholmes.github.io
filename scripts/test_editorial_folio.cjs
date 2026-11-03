'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const path='weekly-economics-environment/index.html',source=fs.readFileSync(path,'utf8');let count=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++},ok=(x,m)=>{assert(x,m);count++};
const main=s=>s.match(/<main\b[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1];
const articles=s=>new Map([...s.matchAll(/<article class="entry" id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]));
// Protect each historical reading individually, allowing legitimate future growth.
const baseline=cp.execFileSync('git',['show','70274c9dfae92aa3c6132a3cf7dfd3659d9559a1:'+path],{encoding:'utf8',maxBuffer:2e6}),current=articles(source);
for(const [id,old] of articles(baseline)){
 ok(current.has(id),'historical reading retained '+id);
 eq(readingRecord(current.get(id)),readingRecord(old),'all scholarship, links, figures and identifiers unchanged '+id);
}
const all=nodes(main(source)),has=(n,c)=>n.classes.includes(c),raw=(s,n)=>s.slice(n.start,n.end);
for(const ed of all.filter(n=>has(n,'edition'))){
 const fragment=main(source).slice(ed.start,ed.end),ns=nodes(fragment);
 for(const type of ['synthesis','knowledge','editorial-note']){
  const oldMain=main(baseline),oldEdition=nodes(oldMain).find(n=>has(n,'edition')&&n.id===ed.id);
  if(!oldEdition)continue;
  const oldFragment=raw(oldMain,oldEdition),before=nodes(oldFragment),oldSection=before.find(n=>has(n,type)),section=ns.find(n=>has(n,type));
  ok(section,'closing retained '+type+' '+ed.id);
  const paragraphs=(s,tree,parent)=>tree.filter(n=>n.tag==='p'&&n.start>parent.start&&n.end<parent.end).map(n=>raw(s,n));
  eq(paragraphs(fragment,ns,section),paragraphs(oldFragment,before,oldSection),'closing paragraphs remain byte-identical '+ed.id+' '+type);
 }
 const nav=ns.find(n=>n.tag==='nav'&&n.attrs.includes('Edition contents'));
 ok(nav,'chapter navigation retained');
 const links=ns.filter(n=>n.tag==='a'&&n.start>nav.start&&n.end<nav.end);
 for(const link of links){const id=link.attrs.match(/href="#([^"]+)"/)?.[1];ok(ns.some(n=>n.id===id),'navigation destination exists '+id)}
}
eq(compose(source),source,'repeated preparation is byte stable');
const oldArticle=[...articles(baseline).values()][0],oldClosing=main(baseline).match(/<section class="synthesis"[\s\S]*?<\/section>/)[0];
// Private fixture has no production date, sequence number or unused-art dependency.
const future='<section class="edition" id="edition-9999-12-31" data-edition="9999-12-31">'+oldArticle.replace(/id="[^"]+"/,'id="private-reading-fixture"')+oldClosing.replace(/id="[^"]+"/,'id="private-synthesis-fixture"')+'<section class="knowledge" id="private-methods-fixture"><div class="eyebrow">From this issue</div><h2>Methods</h2><p>Authored introduction.</p><details id="private-concept"><summary>Authored concept</summary><p>Existing authored explanation, not a generated summary.</p></details><p><a href="notebook/">Open the cumulative notebook →</a></p></section><section class="editorial-note"><div class="eyebrow">Editorial &amp; source note</div><p>Authored scope.</p><p>Authored qualifications.</p><p>Authored record.</p></section></section>';
const grown=source.replace('</main>',future+'</main>'),prepared=compose(grown);
ok(prepared.includes('id="private-reading-fixture" data-reading-folio="1"'),'new reading automatically receives folio');
eq(readingRecord(articles(prepared).get('private-reading-fixture')),readingRecord(articles(grown).get('private-reading-fixture')),'new reading prose remains unchanged');
ok(prepared.includes('<details id="private-concept"><summary>Authored concept</summary><p>Existing authored explanation, not a generated summary.</p></details>'),'native accordion and its authored content preserved');
eq(compose(prepared),prepared,'new edition retry is idempotent');
eq(main(prepared).slice(0,main(source).length),main(source),'appending a future edition does not recompose existing history');

/* Future-layout stress case: a new reading with >3 sources must receive the
   same finished analytical design, a safe uncurated fallback and a stable
   source register. No fixture content is published to the live archive. */
{
 const sourceNode=nodes(oldArticle).find(n=>n.classes.includes('sources'));
 ok(!!sourceNode,'original authoring structure contains a source apparatus');
 const newId='private-layout-future-reading',extra=Array.from({length:4},(_,i)=>
  '<a href="https://example.org/private-reference-'+i+'">Private future citation '+i+'</a>').join('');
 let draft=oldArticle.replace(/(<article class="entry" id=")[^"]+/, '$1'+newId);
 const draftedSources=nodes(draft).find(n=>n.classes.includes('sources'));
 draft=draft.slice(0,draftedSources.close)+extra+draft.slice(draftedSources.close);
 const futureMarkup='<section class="edition" id="edition-9999-12-30" data-edition="9999-12-30" data-title="Private future issue">'+draft+'</section>';
 const proposed=source.replace('</main>',futureMarkup+'</main>');
 const rendered=compose(proposed),next=articles(rendered).get(newId);
 ok(!!next&&next.includes('data-reading-layout="2"')&&next.includes('data-reading-stage="3"')&&next.includes('data-reading-finish="5"'),'future draft receives final reading layout without bespoke HTML');
 ok(next.includes('class="reading-opening"')&&next.includes('class="feature-spread"'),'future reading follows full-width opening and editorial spread architecture');
 ok(next.includes('class="reading-sources"')&&extra.split('https://example.org/').length-1===4,'future multi-source register preserved');
 for(let i=0;i<4;i++)ok(next.includes('https://example.org/private-reference-'+i),'future source link retained '+i);
 ok(next.includes('data-exhibit-kind="test"')&&next.includes('data-curated="false"'),'uncurated fixture carries honest provisional label, never an invented claim');
 eq(readingRecord(next),readingRecord(draft),'future reading scholarship and links unchanged by composition');
 eq(compose(rendered),rendered,'future complete design is byte-idempotent on subsequent publish attempts');
 eq(main(rendered).slice(0,main(source).length),main(source),'historical archive remains unmodified by future full-layout preparation');
}

assert.throws(()=>compose('<main id="edition"><section class="edition"><article class="entry" id="broken"></article></section></main>'),/Incomplete reading folio/);count++;
assert.notDeepEqual(readingRecord(oldArticle.replace('class="finding">','class="finding">Unauthorized mutation. ')),readingRecord(oldArticle),'unauthorized text mutation remains detectable');count++;
assert.notDeepEqual(readingRecord(oldArticle.replace('href="','href="unauthorized-')).links,readingRecord(oldArticle).links,'link inventory remains mutation-sensitive');count++;
console.log(JSON.stringify({assertions:count,result:'passed'}));
