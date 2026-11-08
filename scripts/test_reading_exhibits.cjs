'use strict';
const fs=require('fs'),assert=require('node:assert/strict');const arch=require('../weekly-economics-environment/editorial-architecture.cjs'),registry=require('../weekly-economics-environment/reading-feature-registry.js');const page=fs.readFileSync('weekly-economics-environment/index.html','utf8');let n=0;const ok=(v,m)=>{assert(v,m);n++};
const counts={};for(const [id,v]of Object.entries(arch.decisions.readings)){
 ok(v.features.length>=2||v.minimumTargetReview.exception,'substantive target reviewed '+id);ok(v.figureAssessment&&v.modelAssessment,'figure/model opportunities assessed '+id);ok(v.rejected.length,'alternatives rejected with reasons '+id);ok(v.changeRecord,'historical changes inspectable '+id);
 const funcs=new Set();for(const f of v.features){ok(!funcs.has(f.type),'nonduplicated function '+id);funcs.add(f.type);ok(f.provenance.length&&f.rationale,'provenance and rationale '+id);ok(Object.values(f.assessment).every(Boolean),'six editorial criteria '+id);ok(page.includes('id="'+id+'--'+f.type+'"'),'precise feature anchor '+id);counts[f.type]=(counts[f.type]||0)+1;
 if(f.type==='estimation-desk'){ok(f.math.includes('<math ')&&f.terms.length>=2,'semantic mathematical content '+id);ok(/Reported|Reconstructed|Theoretically|Proposed/.test(f.status),'equation provenance '+id);ok(f.assumption&&f.interpretation,'estimand and identification '+id)}
 if(f.type==='mechanism-map')ok(f.edges.length===f.nodes.length-1,'connected mechanism '+id);
 if(f.type==='economic-figures')ok(f.chart&&f.note,'graphical substance and limits '+id);
 }
}
ok(counts['estimation-desk']>=10,'substantial mathematical presence');ok(counts['mechanism-map']>=5,'genuine mechanism diagrams');ok(Object.values(arch.decisions.readings).every(v=>v.features.filter(f=>f.type==='long-view').every(f=>f.stages.length>=3&&f.stages.every(s=>s.length===3)&&f.rationale&&f.status)),'every chronology has authored horizons and an evidence label');ok(new Set(Object.values(arch.decisions.readings).map(v=>v.layout.id)).size===Object.keys(arch.decisions.readings).length,'one unique authored reading arrangement per published reading');ok(Math.max(...Object.values(counts))-Math.min(...Object.values(counts))<=4,'broadly balanced authored feature coverage without filler');ok(registry.features.filter(f=>f.group==='special').length===8&&registry.features.filter(f=>f.group==='editorial').length===4,'two distinct editorial categories');

// Special Feature microcopy is editorial material, not a repeated template.
const genericHeads=new Set(['Read the relationship before the coefficient','What the graphic does and does not compare','Compare the economic objects','Read horizons, not a forecast curve','Separate the claim from its diagnostic','What would discriminate between explanations?','Follow the party, price and resource channel']);
const guideTitles=new Set(),guideSource=arch.decisions.readings;
for(const [id,reading] of Object.entries(guideSource)){
 for(const f of reading.features){
  if(!f.readerGuide)continue;
  const g=f.readerGuide;
  ok(!genericHeads.has(g.title),'no generic guidance heading '+id+' '+f.type);
  ok(!guideTitles.has(g.title),'reading-specific guidance title '+id+' '+f.type);
  guideTitles.add(g.title);
  ok(g.text.length>=95,'substantive source-qualified feature explanation '+id+' '+f.type);
 }
}
const savedInventory=JSON.parse(fs.readFileSync('weekly-economics-environment/reading-feature-inventory.json','utf8'));
for(const reading of savedInventory.entries){
 for(const f of reading.features){
  if(!f.readerGuide)continue;
  const source=guideSource[reading.id]?.features.find(x=>x.type===f.type);
  ok(source?.readerGuide?.title===f.readerGuide.title&&source?.readerGuide?.text===f.readerGuide.text,'inventory and canonical feature guidance agree '+reading.id+' '+f.type);
 }
}

const publishedInventory=require('../weekly-economics-environment/editorial-architecture.cjs').inventory(page);
ok(publishedInventory.entries.find(e=>e.id==='electrification').changeRecord.retained.includes('economic-figures'),'retained original figure is recorded as retained');
ok(!publishedInventory.entries.find(e=>e.id==='electrification').changeRecord.replaced.includes('economic-figures'),'retained original figure is never recorded as replaced');

console.log(n+' authored feature, model, graph, rationale and vocabulary checks passed.');
