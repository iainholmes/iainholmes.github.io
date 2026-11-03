'use strict';
/* Regression for the single-rule Loblolly & Logit reading layout.
   No third column, extra aside, or changes to authored scholarship. */
const fs=require('fs'),cp=require('child_process'),assert=require('node:assert/strict');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const file='weekly-economics-environment/index.html';
const source=fs.readFileSync(file,'utf8');
const baseline=cp.execFileSync('git',['show','2926414b6233f738795180b40a1475444b609467:'+file],{encoding:'utf8',maxBuffer:4e6});
const previousKey='reading-folio.css?v=20261101-synthesis-flow';
const currentKey='reading-folio.css?v=20261102-folio-heron-pathways';
let checks=0;
function eq(actual,expected,why){assert.deepEqual(actual,expected,why);checks++}
function ok(actual,why){assert(actual,why);checks++}
const articles=s=>[...s.matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(m=>[m[1],m[0]]);
const prior=new Map(articles(baseline)),current=new Map(articles(source));
ok(current.size>=prior.size,'the thirty founding readings survive future issues');
for(const [id,old] of prior){ok(current.has(id),'reading retained '+id);eq(readingRecord(current.get(id)),readingRecord(old),'authored article unchanged '+id)}
// Only the synthesis overline has changed; all other closing copy is locked.
const stripArticles=s=>s.replace(/<article class="entry"[\s\S]*?<\/article>/g,m=>'<article id="'+m.match(/\bid="([^"]+)"/)?.[1]+'"></article>')
 .replace(/<div class="eyebrow">(?:The synthesis \/ Editorial interpretation|Editor's synthesis)<\/div>/g,'<div class="eyebrow">[SYNTHESIS OVERLINE]</div>');
// The original archive is a permanent subset. A later issue may legitimately
// extend the main publication region without changing those six editions.
const editionParts=s=>{
 const main=s.match(/<main\b[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 return new Map([...main.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[\s\S]*?(?=<section class="edition"|$)/g)].map(m=>[m[1],m[0]]));
};
const priorEditions=editionParts(baseline),currentEditions=editionParts(source);
for(const [date,priorEdition] of priorEditions){
 ok(currentEditions.has(date),'founding edition retained '+date);
 eq(stripArticles(currentEditions.get(date)),stripArticles(priorEdition),'non-reading founding edition content unchanged '+date);
}
if(current.size===prior.size){
 const mainOnly=s=>s.match(/<main\\b[^>]*id="edition"[^>]*>([\\s\\S]*?)<\\/main>/)?.[1]||'';
 eq(stripArticles(mainOnly(source)),stripArticles(mainOnly(baseline)),'entire historical issue and closing-content archive unchanged except approved synthesis label');
}
eq(compose(source),source,'publication composer is byte-idempotent without a panel');
const main=source.match(/<main[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)[1];
const ns=nodes(main),editions=ns.filter(n=>n.classes.includes('edition'));
ok(editions.length>=6,'six founding editions plus future editions supported');
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
eq((source.match(/data-reading-stage="3"/g)||[]).length,current.size,'each published reading receives the third-stage composition');
eq((source.match(/data-reading-finish="5"/g)||[]).length,current.size,'finished styles apply to all readings, including future additions');
eq((source.match(/class="reading-opening reading-opening--why"/g)||[]).length,0,'no unintended horizontal Why-it-matters sections');

ok(css.includes('.evidence-pair>.margin')&&source.includes("var grid=art.querySelector('.article-grid')"),'Heron wrapper remains compatible');
ok(source.includes('evidence.append(slot);')&&css.includes('.evidence-pair>.perch'),'Heron lives in an in-flow row beneath both evidence columns');
ok(css.includes('.reading-folio::after{content:none!important}'),'every reading numeral loses the redundant Reading label');
ok(css.includes('.entry.cp-keepable>.cp-keep-toggle'),'only reading KEEP controls are repositioned');
ok(css.includes('--folio-width:clamp('),'number/title grid has shared responsive folio dimensions');
eq((source.match(/Editor's synthesis/g)||[]).length,editions.length,'all historical synthesis labels use the approved name');
eq((source.match(/data-reading-layout="2"/g)||[]).length,current.size,'all readings use the stable layout markers');
eq((source.match(/class="reading-exhibit"/g)||[]).length,current.size,'all published readings have editorial exhibits');
eq((source.match(/data-reading-exhibit="1"/g)||[]).length,current.size,'all reading exhibits have publisher-stable markers');
ok((source.match(/data-exhibit-kind="ledger"/g)||[]).length>=11,'historical Incidence Ledgers retained');
ok((source.match(/data-exhibit-kind="test"/g)||[]).length>=6,'historical Assumption Tests retained');
ok((source.match(/data-exhibit-kind="decision"/g)||[]).length>=6,'historical Decision Margins retained');
eq((source.match(/data-exhibit-kind="cabinet"/g)||[]).length,0,'Source Dossier completely removed');
ok((source.match(/data-exhibit-kind="long"/g)||[]).length>=7,'historical Long Views retained');
ok(!source.includes('class="economic-hinge"'),'generic Economic Hinge is gone');
ok(css.includes('.exhibit-ledger')&&css.includes('.test-challenge')&&css.includes('.decision-branches')&&css.includes('.exhibit-longview'),'four distinct rendering systems included');
eq((source.match(/class="evidence-pair"/g)||[]).length,current.size,'all readings retain the paired evidence register');

ok(css.includes('height:9px')&&css.includes('padding-top:52px'),'finished substantial chapter bands and condensed entry spacing');
ok(css.includes('border:4px solid var(--forest)')&&css.includes('border-right-width:7px!important'),'paired spread has continuous structural frame and heavy internal seam');
ok(css.includes('.reading-sources>.sources')&&css.includes('grid-template-columns:minmax(112px,.23fr)'),'post-reading sources occupy a tighter horizontal register');
ok(css.includes('.essay-graphic'),'ledger source figure moved to interpretive panel');
ok(css.includes('Full-width reading and source-driven graphics'),'new width and figure design applied');
ok(css.includes('Source trail: same unboxed'),'reading references use open rather than boxed source treatment');
ok(css.includes('border:0!important;border-top:2px solid var(--hair)!important'),'sources register keeps a thin shared rule, not a surrounding frame');
ok(css.includes('.reading-deck .finding,')&&css.includes('max-width:none!important'),'lead and first analysis use full reading column');
ok(css.includes(':has(>a:nth-of-type(3):last-of-type)'),'three-source register allocates full width evenly');
ok(css.includes('.essay-graphic .plot-bar')&&css.includes('.plot-grid-zero'),'figures are styled in their actual interpretation container');
ok(css.includes('.model-stage')&&css.includes('.surplus-band'),'model and accounting graphics have distinct physical treatments');
ok((source.match(/class="ledger-plot"/g)||[]).length>=3,'historical quantified charts retained');
ok((source.match(/class="model-flow"/g)||[]).length>=6,'historical model diagrams retained');
ok((source.match(/class="surplus-visual"/g)||[]).length>=1,'historical surplus composition retained');
ok((source.match(/class="decomp-track"/g)||[]).length>=1,'historical cost decomposition retained');

ok(css.includes('max-width:80ch'),'opening prose remains stacked but has a fuller desktop measure');
ok(css.includes('grid-template-columns:25px minmax(0,1fr)'),'surplus calculation aligns terms as distinct readable rows');
ok(css.includes('min-height:44px!important'),'compact source links retain mobile tap targets');
ok(css.includes('.evidence-pair>.limitation')&&css.includes('border-left:5px solid var(--river)!important'),'evidence and notebook use stronger paired rails');
const editorial=require('../weekly-economics-environment/reading-exhibits.cjs');
const ledgers=[...current.keys()].filter(id=>editorial.select(id).kind==='ledger');
const inLedger=ledgers.filter(id=>editorial.graphicPlacement(id)==='ledger');
eq((source.match(/class="essay-graphic"/g)||[]).length,ledgers.length-inLedger.length,'interpretive figures remain for all non-relocated Ledgers');
ok(inLedger.every(id=>current.get(id).includes('class="model-intervention"')),'selected conceptual pathway and intervention reside within the ledger');
eq((source.match(/class="ledger-graphic"/g)||[]).length,ledgers.length,'no economic graphic duplicated or lost');
ok(!css.includes('.editorial-rail'),'retired rail has no styling');
console.log(checks+' single-divider reading layout checks passed.');
