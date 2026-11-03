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
ok(counts['estimation-desk']>=10,'substantial mathematical presence');ok(counts['mechanism-map']>=5,'genuine mechanism diagrams');ok(counts['long-view']<10,'no default chronology');ok(new Set(Object.values(arch.decisions.readings).map(v=>v.composition)).size>=5,'content-specific compositions');ok(registry.features.filter(f=>f.group==='special').length===8&&registry.features.filter(f=>f.group==='editorial').length===4,'two distinct editorial categories');console.log(n+' authored feature, model, graph, rationale and vocabulary checks passed.');
