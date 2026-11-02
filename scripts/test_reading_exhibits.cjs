'use strict';
/* Execute from the repo root: node scripts/test_reading_exhibits.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {catalog,select,render,specimen,audit}=require('../weekly-economics-environment/reading-exhibits.cjs');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const page=fs.readFileSync('weekly-economics-environment/index.html','utf8');
const css=fs.readFileSync('weekly-economics-environment/reading-folio.css','utf8');
const articles=new Map([...page.matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(x=>[x[1],x[0]]));
let checks=0;
function ok(cond,label){assert(cond,label);checks++}
function eq(a,b,label){assert.deepEqual(a,b,label);checks++}
eq(articles.size,30,'all thirty readings present');
eq(Object.keys(catalog).length,30,'all thirty reviewed by editorial selection');
let totals={ledger:0,cabinet:0,long:0};
for(const [id,reading] of articles){
 const e=select(id);ok(e.curated,'manually curated form for '+id);
 ok(['ledger','cabinet','long'].includes(e.kind),'supported form '+id);
 totals[e.kind]++;
 const tree=nodes(reading),finding=tree.find(x=>x.classes.includes('finding'));
 ok(finding,'existing published finding '+id);
 const extracted=reading.slice(finding.open,finding.close);
 const fragment=render(id,{finding:extracted});
 ok(fragment.includes('data-exhibit-kind="'+e.kind+'"'),'type output '+id);
 ok(fragment.includes('data-curated="true"'),'source curation marked '+id);
 ok(reading.includes(fragment),'exact exhibit generated from published finding '+id);
 const body=tree.find(x=>x.classes.includes('evidence-pair'));
 const lim=tree.find(x=>x.classes.includes('limitation'));
 const rn=tree.find(x=>x.classes.includes('research-note'));
 ok(body&&lim?.parent===body&&rn?.parent===body,'evidence/RN top-aligned structure '+id);
 ok(reading.includes('data-reading-exhibit="1"'),'future preparation stable '+id);
 if(e.kind==='ledger'){
  ok(e.rows.length>=3,'ledger includes affected parties '+id);
  ok(e.rows.every(x=>x.length===3&&x.every(y=>y)),'ledger rows have consequence and evidence classification '+id);
  ok(fragment.includes('ledger-status'),'ledger qualifies evidence '+id);
 }else if(e.kind==='cabinet'){
  const quote=specimen(extracted);
  ok(quote.length>=15,'verbatim specimen from authored lead '+id);
  ok(fragment.includes('cabinet-provenance'),'origin stated '+id);
  ok(fragment.includes('cabinet-note'),'reading annotation and limitation '+id);
 }else{
  ok(e.points.length>=3,'timeline has substantive chronological stages '+id);
  ok(e.points.every(x=>x.length===3&&x.every(y=>y)),'timeline distinguishes observation from projection '+id);
  ok(fragment.includes('style="--stops:'+e.points.length+'"'),'timeline layout adapts to dated steps '+id);
 }
}
eq(totals,{ledger:11,cabinet:12,long:7},'balance across the published archive');
const issueSets=[
['electrification','grid','carbon-border','insurance','glyphosate'],
['2026-10-02-green-spending','2026-10-02-policy-mix','2026-10-02-amoc','2026-10-02-storage','2026-10-02-tax-bias'],
['2026-10-09-trade-climate','2026-10-09-landslides','2026-10-09-nuclear-finance','2026-10-09-winter-bills','2026-10-09-climate-liability'],
['2026-10-16-targeted-power','2026-10-16-pfas-agriculture','2026-10-16-ferc-review','2026-10-16-energy-macro','2026-10-16-climate-vitals'],
['2026-10-23-paper-markups','2026-10-23-vehicle-mix','2026-10-23-emissions-gap','2026-10-23-adaptation-finance','2026-10-23-mobility-finance'],
['2026-10-30-coal-country','2026-10-30-household-climate','2026-10-30-methane-rule','2026-10-30-solar-storage','2026-10-30-moves6']
];
for(const ids of issueSets){
 const found=audit(ids);
 ok(found.longRuns.length===0,'no monotonous triple within issue '+ids[0]);
 ok(new Set(found.sequence).size>=2,'multiple editorial forms per issue '+ids[0]);
}
const fallback=render('future-reading',{finding:'A & B were both reported. A later study may clarify the difference.'});
ok(fallback.includes('data-exhibit-kind="cabinet"')&&fallback.includes('data-curated="false"'),'safe future fallback to direct evidence');
ok(fallback.includes('A &amp; B'),'future excerpt safely escaped');
ok(!fallback.includes('Affected party'),'future edition does not invent incidence');
ok(!fallback.includes('exhibit-longview'),'future edition does not invent dates');
eq(compose(page),page,'publication preparation idempotent');
ok(css.includes('.exhibit-ledger')&&css.includes('.exhibit-cabinet')&&css.includes('.exhibit-longview'),'three distinct physical treatments');
ok(css.includes('.evidence-pair>.margin'),'Heron can wrap Research Notebook in aligned evidence section');
ok(css.includes('pointer-events:none'),'decorative frames do not intercept controls');
console.log(checks+' article-specific exhibit selection, source integrity and rendering checks passed.');
