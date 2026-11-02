'use strict';
/* Regression for the single-rule Loblolly & Logit reading layout.
   No third column, extra aside, or changes to authored scholarship. */
const fs=require('fs'),cp=require('child_process'),assert=require('node:assert/strict');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const file='weekly-economics-environment/index.html';
const source=fs.readFileSync(file,'utf8');
const baseline=cp.execFileSync('git',['show','2926414b6233f738795180b40a1475444b609467:'+file],{encoding:'utf8',maxBuffer:4e6});
const previousKey='reading-folio.css?v=20261101-synthesis-flow';
const currentKey='reading-folio.css?v=20261102-economic-hinge-evidence-register';
let checks=0;
function eq(actual,expected,why){assert.deepEqual(actual,expected,why);checks++}
function ok(actual,why){assert(actual,why);checks++}
const articles=s=>[...s.matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]);
const prior=new Map(articles(baseline)),current=new Map(articles(source));
eq(current.size,30,'thirty readings retained');
for(const [id,old] of prior){ok(current.has(id),'reading retained '+id);eq(readingRecord(current.get(id)),readingRecord(old),'authored article unchanged '+id)}
const stripArticles=s=>s.replace(/<article class="entry"[\s\S]*?<\/article>/g,m=>'<article id="'+m.match(/\bid="([^"]+)"/)?.[1]+'"></article>');
eq(stripArticles(source.replace(currentKey,previousKey)),stripArticles(baseline),'all non-reading edition content unchanged');
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
ok(css.includes('.contents-boundary::after'),'left spine remains');
ok(css.includes('right:-29px;width:14px'),'left spine width revised');
ok(css.includes('var(--clay) 0 70px,var(--forest) 70px calc(100% - 70px),var(--clay)'),'left spine two copper ends');
ok(css.includes('calc(100% - 54px)'),'left lower taper mirrors upper');
ok(css.includes('body.glance .contents-boundary::after{display:none}'),'left spine hidden in glance');
ok(css.includes('.reading-column::after'),'right boundary remains whole-edition');
ok(css.includes('right:-26px;width:18px'),'right terminal is larger');
ok(css.includes('var(--clay) 0 90px,var(--forest) 90px calc(100% - 90px),var(--clay)'),'right tassels mirror');
ok(css.includes('pointer-events:none'),'boundaries do not intercept controls');
ok(css.includes('body.glance .reading-column::after{display:none}'),'right rule hidden in glance');
ok(css.includes('@media print{.reading-column::after{display:none}}'),'outer border hidden in print');
ok(css.includes('.entry[data-reading-layout="2"] .evidence-pair'),'paired evidence and RN');
ok(css.includes('flex-direction:column'),'single main reading track');
ok(css.includes('.evidence-pair>.margin')&&source.includes("var grid=art.querySelector('.article-grid')"),'Heron wrapper remains compatible');
eq((source.match(/data-reading-layout="2"/g)||[]).length,30,'all thirty reading layouts');
eq((source.match(/class="economic-hinge"/g)||[]).length,30,'all thirty have Economic Hinge');
eq((source.match(/class="evidence-pair"/g)||[]).length,30,'all thirty have evidence register');
ok(!css.includes('.editorial-rail'),'retired rail has no styling');
console.log(checks+' single-divider reading layout checks passed.');
