'use strict';
/* Permanent publication gate: an authored decision record is required before a
   reading can enter the public archive. Rendering cannot invent missing research. */
const {names,decisions,compose}=require('./editorial-architecture.cjs');
function validate({journal,notebook,folioCss,notebookCss}={}){
 if(![journal,notebook,folioCss,notebookCss].every(x=>typeof x==='string'))throw Error('L&L publication: journal, notebook and stylesheets required');
 if(!/href="reading-folio\.css\?v=/.test(journal)||!/href="notebook\.css\?v=/.test(notebook))throw Error('L&L publication: canonical stylesheet references required');
 const {nodes}=require('./editorial-folio.cjs');
 const index=JSON.parse(journal.match(/id="ll-reading-index-data">([\s\S]*?)<\/script>/)?.[1]||'null');
 if(!index)throw Error('L&L publication: generated Reading Index required');
 const seen=new Set(),featureCounts={};let sources=0,count=0;
 for(const ed of index.editions){if(ed.readings.length!==5)throw Error('L&L publication: five readings per edition required');
 for(const r of ed.readings){
  if(seen.has(r.id))throw Error('L&L publication: duplicate reading '+r.id);seen.add(r.id);count++;
  const v=decisions.readings[r.id];if(!v)throw Error('L&L publication: authored editorial review required '+r.id);
  if(!v.layout?.id||!v.layout.rationale||!v.layout.colorBasis||!v.layout.palette||!v.layout.docking)throw Error('L&L publication: authored spatial composition required '+r.id);
  if(!v.subjects?.length||!v.argument||!v.figureAssessment||!v.modelAssessment||!v.rejected?.length)throw Error('L&L publication: incomplete six-criterion review '+r.id);
  if(!v.rankedSelection?.length)throw Error('L&L publication: ranked editorial selection required '+r.id);
  const special=v.features.filter(f=>f.type!=='heron');if(special.length<2&&!v.minimumTargetReview?.exception)throw Error('L&L publication: document minimum-target exception '+r.id);
  const chosen=require('./reading-feature-registry.js').select({candidates:special.map(f=>({id:f.type,authored:true,provenance:f.provenance,assessment:f.assessment,function:f.type,editorialJustification:v.additionalFeatureJustification})),exception:v.minimumTargetReview?.exception});if(chosen.review.length||chosen.rejected.length||chosen.special.length!==special.length)throw Error('L&L publication: feature selection review required '+r.id);
  const html=journal.match(new RegExp('<article class="entry"[^>]*id="'+r.id+'"[\\s\\S]*?<\\/article>'))?.[0];
  if(!html?.includes('data-editorial-system="7"'))throw Error('L&L publication: legacy reading system '+r.id);
  if(compose(html,{nodes})!==html)throw Error('L&L publication: stale authored features '+r.id);
  const ns=nodes(html);
  for(const cls of ['finding','ll-argument','ll-editorial','research-note','reading-sources','ll-reading-shell'])if(!ns.some(n=>n.classes.includes(cls)))throw Error('L&L publication: missing '+cls+' '+r.id);
  const src=ns.find(n=>n.classes.includes('sources'));const links=ns.filter(n=>n.tag==='a'&&n.start>src.open&&n.end<=src.close&&n.attrs.includes('href='));if(!links.length)throw Error('L&L publication: original source register missing '+r.id);sources+=links.length;
  const reading=ns.find(n=>n.classes.includes('ll-reading')),sourceContainer=ns.find(n=>n.classes.includes('reading-sources'));if(reading.children.at(-1)!==sourceContainer)throw Error('L&L publication: Sources must be final '+r.id);
  if(!ns.some(n=>n.classes.includes('ll-source-divider'))||!ns.some(n=>n.classes.includes('ll-source-links')))throw Error('L&L publication: Sources finish required '+r.id);
  const actual=ns.filter(n=>n.classes.includes('ll-feature'));
  if(actual.length<special.length)throw Error('L&L publication: missing selected feature '+r.id);
  for(const f of v.features){
   if(!names[f.type]||!f.title||!f.status||!f.provenance?.length)throw Error('L&L publication: feature provenance required '+r.id);
   const fields=['analyticalRelevance','evidentiarySupport','distinctiveness','readerValue','presentationSuitability','informationBurden'];if(!fields.every(k=>f.assessment?.[k]))throw Error('L&L publication: six-criterion assessment required '+r.id);
   if(f.type==='estimation-desk'&&(!f.math?.includes('<math ')||f.terms?.length<2||!f.interpretation||!f.assumption))throw Error('L&L publication: incomplete Estimation Desk '+r.id);
   if(f.type==='mechanism-map'&&(!f.nodes?.length||f.edges?.length!==f.nodes.length-1))throw Error('L&L publication: mechanism connections required '+r.id);
   if(f.type==='economic-figures'&&!f.chart)throw Error('L&L publication: meaningful figure data or theoretical diagram required '+r.id);
   featureCounts[f.type]=(featureCounts[f.type]||0)+1;
  }
  for(const f of r.features){if(f.id==='heron')continue;if(!ns.some(n=>n.id===f.anchor&&n.attrs.includes('data-special-feature="'+f.id+'"')))throw Error('L&L publication: stale feature Index link '+r.id);}
 }}
 const articles=[...journal.matchAll(/<article class="entry"/g)].length;if(count!==articles)throw Error('L&L publication: Index and archive counts differ');
 if(/ll-accepted-reading-arrangement|ll-reading-transition-release/.test(journal))throw Error('L&L publication: retired inline layout override');
 if(!journal.includes('reading-composition.js?v='))throw Error('L&L publication: content-fit renderer required');
 if(!journal.includes('reading-index.js?v='))throw Error('L&L publication: publication-local Index control required');
 const concepts=[...notebook.matchAll(/<article class="concept"/g)].length;if(!concepts)throw Error('L&L publication: cumulative notebook missing');
 return {editions:index.editions.length,readings:count,concepts,sourceLinks:sources,curated:true,features:featureCounts};
}
module.exports={validate};
