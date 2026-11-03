'use strict';
/* Execute from the repo root: node scripts/test_reading_exhibits.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {catalog,visualData,readingGuides,select,render,specimen,audit,graphic,graphicPlacement}=require('../weekly-economics-environment/reading-exhibits.cjs');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const page=fs.readFileSync('weekly-economics-environment/index.html','utf8');
const css=fs.readFileSync('weekly-economics-environment/reading-folio.css','utf8');
const articles=new Map([...page.matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(x=>[x[1],x[0]]));
let checks=0;
function ok(cond,label){assert(cond,label);checks++}
function eq(a,b,label){assert.deepEqual(a,b,label);checks++}
ok(articles.size>=30,'all 30 foundational readings remain present as the archive grows');
ok(Object.keys(catalog).length>=30,'all 30 initial reading-specific exhibits remain curated');
let totals={ledger:0,test:0,decision:0,long:0};
for(const [id,reading] of articles){
 const e=select(id);
 if(Object.prototype.hasOwnProperty.call(catalog,id))ok(e.curated,'registered, curated editorial form '+id);
 else ok(!e.curated&&e.kind==='test','safe, explicitly unfinished future fallback '+id);
 ok(['ledger','test','decision','long'].includes(e.kind),'supported form '+id);
 totals[e.kind]++;
 const tree=nodes(reading),finding=tree.find(x=>x.classes.includes('finding'));
 ok(finding,'existing published finding '+id);
 const extracted=reading.slice(finding.open,finding.close);
 const fragment=render(id,{finding:extracted});
 ok(fragment.includes('data-exhibit-kind="'+e.kind+'"'),'type output '+id);
 ok(fragment.includes('data-curated="'+String(e.curated)+'"'),'editorial curation status is explicit '+id);
 const expected=e.kind==='ledger'&&graphicPlacement(id)!=='ledger'?fragment.replace(graphic(id),''):fragment;
 ok(reading.includes(expected),'exact editorial exhibit generated from the published finding '+id);
 const body=tree.find(x=>x.classes.includes('evidence-pair'));
 const lim=tree.find(x=>x.classes.includes('limitation'));
 const rn=tree.find(x=>x.classes.includes('research-note'));
 ok(body&&lim?.parent===body&&rn?.parent===body,'evidence/RN top-aligned structure '+id);
 ok(reading.includes('data-reading-exhibit="1"'),'future preparation stable '+id);
 ok(reading.includes('data-reading-stage="3"'),'third-stage article layout remains idempotent '+id);
ok(reading.includes('data-reading-finish="5"'),'fifth-stage completed editorial layout '+id);
ok(!fragment.includes('FROM THE ANNEX'),'exhibit identified solely by its actual name '+id);

 const spread=tree.find(x=>x.classes.includes('feature-spread'));
 const readingOpening=tree.find(x=>x.classes.includes('reading-opening'));
 const interpreted=tree.find(x=>x.classes.includes('interpretive-essay'));
 const exhibit=tree.find(x=>x.classes.includes('reading-exhibit'));
 ok(spread&&readingOpening&&interpreted&&exhibit,'composed analytical spread '+id);
 ok(exhibit.parent===spread&&interpreted.parent===spread,'economic interpretation and exhibit paired '+id);
 ok(readingOpening.start<spread.start&&spread.start<body.start,'analytical narrative precedes lower evidence register '+id);
 if(e.kind==='ledger'||e.kind==='long'){
  const guide=readingGuides[id];
  ok(!!guide&&guide.intro.length>120,'standalone contextual introduction '+id);
  ok(guide.read.length>80,'reader instructions supported by the article '+id);
  ok(Array.isArray(guide.term)&&guide.term.length===2&&guide.term[0].length>=2&&guide.term[1].length>30,'key economic concept defined '+id);
  ok(fragment.includes('class="exhibit-primer"'),'source-specific guide visible without interaction '+id);
  if(e.kind==='ledger')ok(!fragment.includes('class="exhibit-concept"')&&!fragment.includes('class="exhibit-footer"'),'generic post-ledger descriptors omitted '+id);
  else ok(fragment.includes('class="exhibit-concept"'),'specific Long View concept guidance remains '+id);
 }
 if(e.kind==='ledger'){
  ok(e.rows.length>=3,'ledger includes affected parties '+id);
  ok(e.rows.every(x=>x.length===3&&x.every(y=>y)),'ledger rows have consequence and evidence classification '+id);
  ok(fragment.includes('ledger-status'),'ledger qualifies evidence '+id);
  ok(!!visualData[id],'all ledgers have custom source-grounded economic visual '+id);
  ok(fragment.includes('class="ledger-graphic"'),'ledger graph/model generator retained '+id);
  const essayGraphic=tree.find(x=>x.classes.includes('essay-graphic'));
  const ledgerGraphic=tree.find(x=>x.classes.includes('ledger-graphic'));
  if(graphicPlacement(id)==='ledger'){
   ok(!essayGraphic&&ledgerGraphic?.parent?.classes.includes('exhibit-ledger'),'selected pathway follows the affected-party rows '+id);
   ok(fragment.indexOf('class="ledger-graphic"')>fragment.indexOf('class="ledger-line"'),'the selected visual is an attached Ledger companion '+id);
  }else{
   ok(essayGraphic&&essayGraphic.parent===interpreted,'source graph belongs with the interpretation '+id);
   ok(reading.slice(essayGraphic.start,essayGraphic.end).includes('class="ledger-graphic"'),'source diagram retained in interpretive panel '+id);
  }
  ok(fragment.includes('data-visual-kind="'+visualData[id].type+'"'),'appropriate graphic type '+id);
  ok(fragment.includes(visualData[id].note),'graphic carries evidence/causal qualifier '+id);
ok(fragment.includes('class="ledger-how-to-read"'),'model or calculation interpreted explicitly '+id);
  ok(css.includes('.ledger-line:nth-of-type(3n+1)')&&css.includes('.ledger-line:nth-of-type(3n+2)'),'ledger row colors distinguish groups '+id);
 }else if(e.kind==='test'){
  if(e.curated)ok(e.premise.length>75&&e.stress.length>75&&e.observe.length>75,'authored assumption stress test, not a decorative excerpt '+id);
  else ok(fragment.includes('Editorial interpretation pending')&&fragment.includes('data-curated="false"'),'future fallback explicitly labeled incomplete '+id);
  ok(fragment.includes('class="test-research-question"')&&fragment.includes('class="test-challenge"'),'research-assumption and challenge clearly distinguished '+id);
 }else if(e.kind==='decision'){
  ok(e.options.length===2&&e.options.every(x=>x.length===2&&x[1].length>75),'real pair of evidenced decision margins '+id);
  ok(fragment.includes('class="decision-branches"')&&fragment.includes('class="decision-criterion"'),'meaningful side-by-side policy paths and observable criterion '+id);
 }else{
  ok(e.points.length>=3,'timeline has substantive chronological stages '+id);
  ok(e.points.every(x=>x.length===3&&x.every(y=>y)),'timeline distinguishes observation from projection '+id);
  ok(fragment.includes('longview-guide')&&fragment.includes('longview-takeaway'),'timeline explains sequence and its meaning '+id);
  ok((fragment.match(/class="longview-point"/g)||[]).length===e.points.length,'each timeline milestone rendered '+id);
ok((fragment.match(/class="longview-explain"/g)||[]).length===e.points.length,'every milestone explained in novice-friendly prose '+id);
  ok(readingGuides[id].steps.length===e.points.length&&readingGuides[id].steps.every(x=>x.length>=100),'all milestone explanations are substantive '+id);
 }
}
for(const [name,count] of Object.entries({ledger:11,test:6,decision:6,long:7}))ok(totals[name]>=count,'founding '+name+' exhibits preserved as future issues extend the rotation');
ok(Object.keys(readingGuides).length>=18,'historical Ledger/Long View reading guides retained');
eq([...articles.values()].filter(a=>a.includes('class="reading-opening reading-opening--why"')).length,0,'original Why-it-matters sections retain their normal composition');
const headlineSample=articles.get('2026-10-30-coal-country');
ok(headlineSample.includes('Research question and design'),'specialized first-section heading preserved');
const guidedStages=Object.entries(catalog).filter(([,entry])=>entry.kind==='long').reduce((n,[id])=>n+readingGuides[id].steps.length,0);
ok(guidedStages>=23,'historical 23 timeline milestones preserved');
ok(!page.includes('FROM THE ANNEX'),'no Annex kicker anywhere in the published review');

ok(Object.keys(visualData).length>=11,'all historical ledger visual specifications retained');
const projected=visualData['2026-10-30-methane-rule'];
eq(projected.terms.map(x=>x[1]),[2.5,'0.2–0.3','2.7–2.8'],'EPA reported subtotal and range, not invented net welfare');
const coal=visualData['2026-10-30-coal-country'];
eq(coal.values,[['Mine records',0.94],['Labor statistics',1.15]],'two source-specific mining employment estimates, not additive');
const winter=visualData['2026-10-09-winter-bills'];
eq(winter.values,[['Heating oil',21],['Electricity',4],['Natural gas',-9],['Propane',-3]],'reported four-fuel forecast contrasts');
const paper=visualData['2026-10-23-paper-markups'];
ok(Math.abs(paper.components.reduce((x,row)=>x+row[1],0)-22.9)<1e-8&&paper.roundedTotal===23,'markup and cost shares add up to rounded 23 log points');
const visualTypes=new Set(Object.values(visualData).map(x=>x.type));
ok(visualTypes.size>=5,'diverse empirical graphics, calculations, and conceptual models');
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
ok(fallback.includes('data-exhibit-kind="test"')&&fallback.includes('data-curated="false"'),'safe future uncurated research test');
ok(fallback.includes('Editorial interpretation pending'),'future fallback explicitly labeled as incomplete');
ok(!fallback.includes('Affected party'),'future edition does not invent incidence');
ok(!page.includes('The Source Dossier'),'deprecated Dossier not present in the journal');
ok(!fallback.includes('exhibit-longview'),'future edition does not invent dates');
eq(compose(page),page,'publication preparation idempotent');
ok(css.includes('.exhibit-ledger')&&css.includes('.test-challenge')&&css.includes('.decision-branches')&&css.includes('.exhibit-longview'),'four live editorial treatments with no Dossier dependency');
ok(css.includes('grid-template-columns:25px minmax(0,1fr)'),'narrow surplus figures use readable three-row layout');
ok(css.includes('grid-template-columns:minmax(112px,.23fr)'),'source register keeps horizontal desktop arrangement');
const archivalFigures=[...articles.values()].filter(a=>a.includes('class="essay-graphic"'));
const relocated=[...articles.keys()].filter(id=>select(id).kind==='ledger'&&graphicPlacement(id)==='ledger');
eq(archivalFigures.length,totals.ledger-relocated.length,'selective embedded pathways do not duplicate interpretive figures');
ok(relocated.includes('2026-10-16-pfas-agriculture'),'PFAS pathway housed under its incidence table');
ok(archivalFigures.filter(a=>a.includes('class="ledger-plot"')).length>=3,'historical quantitative charts retained');
ok([...articles.values()].filter(a=>a.includes('class="model-flow"')).length>=6,'all six historical conceptual diagrams retained across both placements');
ok(archivalFigures.filter(a=>a.includes('class="surplus-visual"')).length>=1,'historical methane accounting figure retained');
ok(archivalFigures.filter(a=>a.includes('class="decomp-track"')).length>=1,'historical decomposition retained');
ok(articles.get('2026-10-30-coal-country').includes('class="plot-tick"')&&articles.get('2026-10-30-coal-country').includes('class="plot-grid'), 'coal chart has labeled quantitative scale and guides');
ok(articles.get('2026-10-30-methane-rule').includes('class="surplus-upper"'),'reported range distinguished visually from its lower bound');
const sourceCounts=[...articles.values()].map(a=>{const x=a.match(/<div class="reading-sources">([\s\S]*?)<\/div><\/div>/);return x?(x[1].match(/<a /g)||[]).length:0});
const foundingIds=new Set(issueSets.flat());
const foundingCounts=[...articles].filter(([id])=>foundingIds.has(id)).map(([,a])=>{const x=a.match(/<div class="reading-sources">([\s\S]*?)<\/div><\/div>/);return x?(x[1].match(/<a /g)||[]).length:0});
eq(foundingCounts.reduce((out,n)=>(out[n]=(out[n]||0)+1,out),{}),{'1':9,'2':19,'3':2},'founding source distribution remains preserved');
ok(sourceCounts.every(n=>n>=1),'every reading, including future issues, retains a source link register');
ok(css.includes('Full-width reading and source-driven graphics')&&css.includes('grid-template-columns:148px repeat(3,minmax(0,1fr))'),'full-width literary opening and 3-up source register styled');
ok(css.includes('.essay-graphic .plot-value')&&css.includes('.essay-graphic .model-flow'),'real figure location carries appropriate graphic styles');
ok(css.includes('.evidence-pair>.margin'),'Heron can wrap Research Notebook in aligned evidence section');
ok(css.includes('pointer-events:none'),'decorative frames do not intercept controls');
console.log(checks+' article-specific exhibit selection, source integrity and rendering checks passed.');
