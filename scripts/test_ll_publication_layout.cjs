'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {compose}=require('../weekly-economics-environment/editorial-folio.cjs'),arch=require('../weekly-economics-environment/editorial-architecture.cjs');
const {validate}=require('../weekly-economics-environment/reading-layout-guard.cjs');
const read=p=>fs.readFileSync(p,'utf8');const journal=read('weekly-economics-environment/index.html'),input={journal,notebook:read('weekly-economics-environment/notebook/index.html'),folioCss:read('weekly-economics-environment/reading-folio.css'),notebookCss:read('weekly-economics-environment/notebook/notebook.css')};let n=0;
function ok(v,m){assert(v,m);n++}function eq(a,b,m){assert.deepEqual(a,b,m);n++}
const result=validate(input);eq(result.editions,6,'six archival editions');eq(result.readings,30,'30 readings');eq(compose(journal),journal,'composer is idempotent');
for(const file of ['reading-folio.css','reading-index.js']){const hash=crypto.createHash('sha256').update(read('weekly-economics-environment/'+file)).digest('hex').slice(0,12);ok(journal.includes(file+'?v='+hash),'content-versioned asset '+file)}
const base=journal.match(/<article class="entry"[^>]*id="insurance"[\s\S]*?<\/article>/)[0];
assert.throws(()=>compose(journal.replace('</main>','<section class="edition" data-edition="9999-12-31" data-title="Unreviewed">'+base.replace('id="insurance"','id="private-unreviewed"')+'</section></main>')),/editorial review required/);n++;
const ids=Array.from({length:5},(_,i)=>'private-future-'+i);try{
 const articles=ids.map((id,i)=>{arch.decisions.readings[id]=JSON.parse(JSON.stringify(arch.decisions.readings.insurance));arch.decisions.readings[id].title='Private future reading '+i;return base.replace('id="insurance"','id="'+id+'"').replaceAll('insurance--',id+'--').replace(/<h2>[^<]+<\/h2>/,'<h2>Private future reading '+i+'</h2>')}).join('');
 const grown=compose(journal.replace('</main>','<section class="edition" data-edition="9999-12-31" data-title="Private future fixture">'+articles+'</section></main>'));const pass=validate({...input,journal:grown});eq(pass.editions,7,'future curated edition accepted');eq(pass.readings,35,'future readings indexed automatically');const idx=JSON.parse(grown.match(/id="ll-reading-index-data">([\s\S]*?)<\/script>/)[1]);eq(idx.editions.at(-1).readings.map(r=>r.id),ids,'all future stable anchors generated');eq(compose(grown),grown,'future publication retry stable');
 const f=arch.decisions.readings[ids[0]].features[0],terms=f.terms;delete f.terms;assert.throws(()=>validate({...input,journal:compose(grown)}),/incomplete Estimation Desk/);n++;f.terms=terms;
}finally{for(const id of ids)delete arch.decisions.readings[id]}
const registry=require('../weekly-economics-environment/reading-feature-registry.js');eq(registry.select({tags:['regression','history']}).special,[],'keywords never publish features');
const candidates=arch.decisions.readings.insurance.features.map(f=>({id:f.type,authored:true,provenance:f.provenance,assessment:f.assessment,function:f.type}));eq(registry.select({candidates}).special,['estimation-desk','economic-figures'],'evidence-led authored candidates selected');ok(registry.select({candidates:[candidates[0]]}).review.length,'minimum-target exception required');
console.log(n+' publication, future growth, Index and editorial gate checks passed.');
