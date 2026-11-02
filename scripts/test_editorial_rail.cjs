'use strict';
/* Regression for the single-rule Loblolly & Logit reading layout.
   No third column, extra aside, or changes to authored scholarship. */
const fs=require('fs'),cp=require('child_process'),assert=require('node:assert/strict');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const file='weekly-economics-environment/index.html';
const source=fs.readFileSync(file,'utf8');
const baseline=cp.execFileSync('git',['show','2926414b6233f738795180b40a1475444b609467:'+file],{encoding:'utf8',maxBuffer:4e6});
const previousKey='reading-folio.css?v=20261101-synthesis-flow';
const currentKey='reading-folio.css?v=20261102-five-reading-finishing';
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
ok(css.includes('right:-21px;width:8px'),'right spine is thinner than left, same mirrored taper');
ok((css.match(/var\(--clay\) 0 70px,var\(--forest\) 70px calc\(100% - 70px\),var\(--clay\)/g)||[]).length===2,'both vertical spine tassels have identical 70px geometry');
ok(css.includes('pointer-events:none'),'boundaries do not intercept controls');
ok(css.includes('body.glance .reading-column::after{display:none}'),'right rule hidden in glance');
ok(css.includes('@media print{.reading-column::after{display:none}}'),'outer border hidden in print');
ok(css.includes('.entry[data-reading-layout="2"] .evidence-pair'),'paired evidence and RN');
ok(css.includes('flex-direction:column'),'single main reading track');
ok(css.includes('.feature-spread[data-feature="test"]')&&css.includes('.feature-spread[data-feature="decision"]'),'two alternative feature panels styled');
ok(css.includes('.ledger-plot')&&css.includes('.ledger-calculation')&&css.includes('.ledger-mechanism'),'numeric graphics and conceptual models have distinct CSS');
ok(css.includes('.entry[data-reading-finish="4"] .entry-head::after'),'polished chapter title-to-lead keyline');
ok(css.includes('.entry[data-reading-finish="4"] .reading-deck::after'),'refined lead-to-analysis separator');
ok(css.includes('.entry[data-reading-finish="5"] .reading-opening>.analysis-block'),'normal stacked Why it matters and research introductions restored');
ok(css.includes('.feature-spread .interpretive-essay')&&css.includes('border-right:1px solid var(--hair)'),'paired interpretive border');
ok(css.includes('.evidence-pair::before')&&css.includes('border-top:1px solid var(--forest)'),'coordinated evidence paired rule');
eq((source.match(/data-reading-stage="3"/g)||[]).length,30,'thirty composed reading spreads');
eq((source.match(/data-reading-finish="5"/g)||[]).length,30,'finished designs applied in all thirty readings');
eq((source.match(/class="reading-opening reading-opening--why"/g)||[]).length,0,'no unintended horizontal Why-it-matters sections');

ok(css.includes('.evidence-pair>.margin')&&source.includes("var grid=art.querySelector('.article-grid')"),'Heron wrapper remains compatible');
eq((source.match(/data-reading-layout="2"/g)||[]).length,30,'all thirty reading layouts');
eq((source.match(/class="reading-exhibit"/g)||[]).length,30,'all thirty have reading-specific exhibits');
eq((source.match(/data-reading-exhibit="1"/g)||[]).length,30,'all thirty have publisher-stable exhibit markers');
eq((source.match(/data-exhibit-kind="ledger"/g)||[]).length,11,'11 Incidence Ledgers');
eq((source.match(/data-exhibit-kind="test"/g)||[]).length,6,'six Assumption Tests');
eq((source.match(/data-exhibit-kind="decision"/g)||[]).length,6,'six Decision Margins');
eq((source.match(/data-exhibit-kind="cabinet"/g)||[]).length,0,'Source Dossier completely removed');
eq((source.match(/data-exhibit-kind="long"/g)||[]).length,7,'7 Long Views');
ok(!source.includes('class="economic-hinge"'),'generic Economic Hinge is gone');
ok(css.includes('.exhibit-ledger')&&css.includes('.test-challenge')&&css.includes('.decision-branches')&&css.includes('.exhibit-longview'),'four distinct rendering systems included');
eq((source.match(/class="evidence-pair"/g)||[]).length,30,'all thirty have evidence register');

ok(css.includes('height:6px')&&css.includes('padding-top:68px'),'substantial boundaries make chapter transitions visible');
ok(css.includes('border:3px solid var(--forest)')&&css.includes('border-right:5px solid var(--clay)'),'paired spread framed by structural borders');
ok(css.includes('.reading-sources>.sources')&&css.includes('grid-template-columns:minmax(125px,.28fr)'),'post-reading sources occupy a compact horizontal register');
ok(css.includes('.essay-graphic'),'ledger source figure moved to interpretive panel');
eq((source.match(/class="essay-graphic"/g)||[]).length,11,'eleven economic figures paired with their interpretation');
ok(!css.includes('.editorial-rail'),'retired rail has no styling');
console.log(checks+' single-divider reading layout checks passed.');
