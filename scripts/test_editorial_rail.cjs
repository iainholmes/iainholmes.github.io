'use strict';
/* Regression for the single-rule Loblolly & Logit reading layout.
   No third column, extra aside, or changes to authored scholarship. */
const fs=require('fs'),cp=require('child_process'),assert=require('node:assert/strict');
const {compose,nodes}=require('../weekly-economics-environment/editorial-folio.cjs');
const file='weekly-economics-environment/index.html';
const source=fs.readFileSync(file,'utf8');
const baseline=cp.execFileSync('git',['show','2926414b6233f738795180b40a1475444b609467:'+file],{encoding:'utf8',maxBuffer:4e6});
const previousKey='reading-folio.css?v=20261101-synthesis-flow';
const currentKey='reading-folio.css?v=20261102-tapered-folio-spine';
let checks=0;
function eq(actual,expected,why){assert.deepEqual(actual,expected,why);checks++}
function ok(actual,why){assert(actual,why);checks++}
eq(source.replace(currentKey,previousKey),baseline,'historical authored readings and markup are unchanged');
eq(compose(source),source,'publication composer is byte-idempotent without a panel');
const main=source.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1];
const ns=nodes(main),editions=ns.filter(n=>n.classes.includes('edition'));
eq(editions.length,6,'six editions preserved');
for(const ed of editions){
 const content=main.slice(ed.start,ed.end),tree=nodes(content);
 const body=tree.find(n=>n.classes.includes('edition-body'));
 eq(body.children.slice(0,2).map(n=>n.classes[0]),['contents-boundary','reading-column'],'two semantic reading tracks only');
 ok(!content.includes('editorial-rail'),'no extraneous metadata panel');
 ok(content.includes('class="chapter-readings"'),'existing sidebar remains');
}
const injected=source.replace('<div class="reading-column">','<aside class="editorial-rail" aria-label="Edition record"><p>Retired duplicate</p></aside><div class="reading-column">');
eq(compose(injected),source,'preparation removes a legacy metadata rail safely');
const css=fs.readFileSync('weekly-economics-environment/reading-folio.css','utf8');
ok(css.includes('.edition-body{display:grid;grid-template-columns:184px minmax(0,1fr)'),'original two-column desktop grid restored');
ok(css.includes('.contents-boundary::after'),'single decorative pseudo-element in existing gutter');
ok(css.includes('right:-28px;width:12px'),'12px copper head centered in the original 44px gutter');
ok(css.includes('var(--clay) 0 52px,var(--forest) 52px 100%'),'copper head transitions to forest spine');
ok(css.includes('clip-path:polygon(0 0,100% 0,100% 52px,75% 70px,75% 100%,25% 100%,25% 70px,0 52px)'),'one tapered form, not two decorative borders');
ok(css.includes('@media(min-width:821px) and (max-width:1180px){.contents-boundary::after{right:-21px}}'),'tapered spine remains centered within the 30px laptop gutter');
ok(css.includes('body.glance .contents-boundary::after{display:none}'),'glance has no hanging border');
ok(css.includes('@media(max-width:820px)')&&css.includes('.contents-boundary{display:none}'),'mobile sidebar remains absent');
ok(!css.includes('.editorial-rail'),'retired rail has no styling');
console.log(checks+' single-divider reading layout checks passed.');
