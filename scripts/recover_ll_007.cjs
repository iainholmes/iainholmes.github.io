'use strict';
/* One-off No. 007 publisher: canonical research source file; never bypass gates. */
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const issue=JSON.parse(read('docs/ll-007-recovery/AUTHORED-EDITION.json'));
const ed=issue.edition,R=issue.readings,D='2026-11-06',stamp='6 November 2026';
if(ed.date!==D||R.length!==5||new Set(R.map(x=>x.id)).size!==5)throw Error('Bad issue identity');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pp=s=>'<p>'+esc(s)+'</p>', json=(s,id)=>JSON.parse(s.match(new RegExp('id="'+id+'">([\\s\\S]*?)<\\/script>'))[1]);
const put=(s,id,o)=>s.replace(new RegExp('(<script type="application\\/json" id="'+id+'">)[\\s\\S]*?(<\\/script>)'),(_,a,b)=>a+'\n'+JSON.stringify(o,null,2)+'\n'+b);
let arrangements=read('weekly-economics-environment/reading-arrangements.cjs');
const mapText=[
" '2026-11-06-farm-robots':({E,O,Q,N,D,L})=>E+row('robot-choice',D(),O,'1.3fr','1fr')+L()+row('robot-limits',Q,N,'1.3fr','1fr'),",
" '2026-11-06-fire-exposure':({E,O,Q,N,T,X})=>row('fire-context',E,O,'1.35fr','1fr')+field('fire-trend',row('fire-horizons',T(),X(),'1.35fr','1fr'),'folio')+row('fire-research',N,Q,'1fr','1.3fr'),",
" '2026-11-06-groundwater-choice':({E,O,Q,N,T,X})=>E+row('groundwater-stock',O,T(),'1fr','1.4fr')+inset('groundwater-qualification',X(),'90%','left')+row('groundwater-inference',Q,N,'1.25fr','1fr'),",
" '2026-11-06-pollution-salience':({E,O,Q,N,G,X})=>row('pollution-attention',E,O,'1.35fr','1fr')+join(G(),X())+row('pollution-review',N,Q,'1fr','1.35fr'),",
" '2026-11-06-seagrass-carbon':({E,O,Q,N,A,X})=>E+flo('seagrass-weighting',A,O,'left','58%')+row('seagrass-baselines',Q,X(),'1fr','1.3fr')+inset('seagrass-notebook',N,'82%'),"
].join('\n');
const mark='\n});\nmodule.exports.authored={};';
if(!arrangements.includes(mark)||arrangements.includes("'2026-11-06-farm-robots'"))throw Error('Arrangements already changed or unexpected export');
arrangements=arrangements.replace(mark,',\n'+mapText+'\n});\nmodule.exports.authored={};');
write('weekly-economics-environment/reading-arrangements.cjs',arrangements);
let decision=JSON.parse(read('weekly-economics-environment/editorial-decisions.json'));
for(const r of R){
 if(decision.readings[r.id])throw Error('Duplicate article ID: '+r.id);
 const fspec=r.features.map(f=>({...f,provenance:[r.source.url],assessment:{
  analyticalRelevance:f.rationale,
  evidentiarySupport:f.status+'; source reviewed at '+r.source.label+' exact PDF.',
  distinctiveness:'A separate economic function, differentiated from the other selected feature and the editorial argument.',
  readerValue:f.note||f.consequence||f.rule||'An economically consequential test or distinction.',
  presentationSuitability:f.type+'—selected as an appropriate native panel with quantified limitations.',
  informationBurden:'Bounded evidence-specific feature; no fabricated estimates or unreported causal effects.'
 }}));
 decision.readings[r.id]={
  title:r.title,subjects:r.subjects,composition:r.readingType,argument:r.lens,
  features:fspec,rejected:r.rejected,
  rankedSelection:fspec.map((f,i)=>({rank:i+1,feature:f.type,reason:f.rationale})),
  layout:{id:r.composition,palette:r.palette,colorBasis:r.category+' and the economic object of the reading; selected editorially.',rationale:'Original composition places the finding, economic mechanism, two analytical functions, limitations, notebook and sources in a coherent feature-specific argument.',docking:{note:['opening','notebook'],heron:['opening','notebook']},variants:{}},
  figureAssessment:r.figureAssessment,modelAssessment:r.modelAssessment,
  minimumTargetReview:{substantiveFeatures:2,heronExcluded:true,exception:false},
  reviewed:D,evidenceReview:{basis:r.audit.reason,access:'Exact downloaded scholarly PDF, reviewed selectively at cited pages; no replication or blanket full-paper audit.'}
 };
}
decision.reviewed=D;
write('weekly-economics-environment/editorial-decisions.json',JSON.stringify(decision,null,2)+'\n');

const renderArticle=(r,i)=>'<article class="entry" id="'+r.id+'">'+
 '<header class="entry-head"><div class="reading-folio"><span class="entry-number">'+String(i+1).padStart(2,'0')+'</span></div><div class="reading-title"><div class="eyebrow">'+esc(r.category)+' <span class="sep">/</span> '+esc(r.published)+'</div><h2>'+esc(r.title)+'</h2><div class="status"><span></span>'+esc(r.status)+'</div></div></header>'+
 '<div class="reading-deck"><p class="finding">'+esc(r.finding)+'</p></div><div class="article-grid ll-reading">'+
 '<section class="ll-editorial"><h3>Economic interpretation</h3>'+pp(r.econ)+'</section>'+
 '<section class="ll-editorial"><h3>Research question and design</h3>'+pp(r.design)+'</section>'+
 '<section class="ll-editorial limitation"><h3>What the evidence does—and does not—say</h3>'+pp(r.limits)+'</section>'+
 '<aside class="research-note"><header class="research-heading"><div class="eyebrow">In the research notebook</div><h3>'+esc(r.notebookTitle)+'</h3></header><div class="research-agenda">'+pp(r.notebook)+'<div class="concepts">'+esc(r.concepts.join(' · '))+'</div></div></aside>'+
 '<div class="reading-sources" id="'+r.id+'--sources"><div class="sources"><div class="eyebrow">Read the source</div><a href="'+esc(r.source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.source.label)+' ↗</a></div></div></div></article>';
const overview='<section class="overview" aria-labelledby="'+D+'-overview-title"><div class="section-label"><h2 id="'+D+'-overview-title">The week, in five readings</h2><span class="eyebrow">Selected for lasting relevance</span></div><div class="overview-grid">'+R.map((r,i)=>'<a class="overview-item" href="#'+r.id+'"><span>'+String(i+1).padStart(2,'0')+'</span><div><h3>'+esc(r.title)+'</h3><p>'+esc(r.finding.split('. ')[0]+'.')+'</p></div><span aria-hidden="true">↗</span></a>').join('')+'</div><p class="mode-note">Select a reading to open its economic analysis, evidence limits and research question.</p></section>';
const nav='<nav aria-label="Edition contents">'+R.map((r,i)=>'<a href="#'+r.id+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(r.title)+'</a>').join('')+
 '<a href="#'+D+'-connections">What connects this week</a><a href="#'+D+'-notebook">Methods &amp; concepts</a><a href="#'+D+'-editorial-note">Editorial &amp; source note</a></nav>';
const synth='<section class="synthesis" id="'+D+'-connections"><div class="eyebrow">Editor&#39;s synthesis</div><h2>'+esc(ed.synthesisTitle)+'</h2>'+ed.synthesis.map(pp).join('')+'<p class="closing">'+esc(ed.synthesisClosing)+'</p></section>';
const know='<section class="knowledge" id="'+D+'-notebook"><div class="eyebrow">From this issue / Keep for later</div><h2>Methods &amp; concepts notebook</h2><p>Return to the cumulative ideas behind the evidence as the readings change.</p><div class="notebook-preview">'+ed.conceptIds.slice(0,4).map(x=>'<a href="notebook/#'+x+'">'+esc(x.replace(/-/g,' '))+'</a>').join('')+'</div><p><a href="notebook/">Open the cumulative notebook →</a></p></section>';
const editorial='<section class="editorial-note" id="'+D+'-editorial-note"><div class="eyebrow">Editorial &amp; source note</div>'+
 pp('This edition selects five published scholarly studies whose methods bear directly on consequential economic choices: agricultural production, wildfire exposure, groundwater stocks, financial information, and coastal carbon measurement. Work published before this week is explicitly identified rather than presented as a newly released result.')+
 pp('The cited PDFs were retrieved and their SHA-256 fingerprints checked. Targeted substantive reading covered key findings, model boundaries and inference limits, not complete replication or all supplementary appendices. Statistical measures, structural counterfactuals, model scenarios, and editor-proposed diagnostics are separately qualified.')+
 pp('Analytical features are original economic interpretation or explicitly source-reported evidence, not additional results attributed to the authors. Published data, denominators and the provenance records remain linked to exact primary documents.')+
 '</section>';
const hero='<div class="hero"><div><div class="eyebrow edition-label">Volume I <span class="sep">/</span> N<sup>o</sup>. 007 <span class="sep">/</span> Friday, '+stamp+'</div><h1>Where Risk<br><em>Becomes Visible</em></h1><p class="hero-deck">'+esc(ed.deck)+'</p><div class="hero-footer">'+esc(ed.window)+' &nbsp; · &nbsp; <span class="reading-time">'+ed.minutes+' minute read</span></div></div><figure class="hero-art" data-field-study="'+D+'"></figure></div>';
const issueHtml='<section class="edition" id="edition-'+D+'" data-edition="'+D+'" data-title="'+esc(ed.title)+'">'+hero+overview+
 '<div class="edition-body"><div class="contents-boundary"><aside class="contents"><div class="eyebrow">In this edition</div>'+nav+'<div class="small-rule"></div><p>Evidence through<br>'+stamp+'</p></aside></div><div class="reading-column">'+R.map(renderArticle).join('\n')+'</div>'+
 synth+know+editorial+'</div></section>';
let html=read('weekly-economics-environment/index.html');
if(html.includes('data-edition="'+D+'"')||!html.includes('data-edition="2026-10-30"'))throw Error('Incorrect current archive');
html=html.replace('</main>',issueHtml+'</main>');
let companion=json(html,'companion-data');companion[D]={enabled:false,appearances:[]};html=put(html,'companion-data',companion);
let registry=json(html,'field-register');
const profiles=R.slice(0,4).map((r,i)=>({
 no:registry.entries.length+i+1,issue:D,related:r.id,fieldNote:r.register.fieldNote===true,
 kind:r.register.kind,name:r.register.name,org:r.register.org,role:r.register.role,place:r.register.place,
 does:r.register.does,economics:r.register.economics,
 source:{url:r.source.alias,label:r.source.label},image:null
}));
if(profiles.filter(x=>x.fieldNote).length!==3)throw Error('Invalid Field Notes count');
registry.entries.push(...profiles);
html=put(html,'field-register',registry);
write('weekly-economics-environment/index.html',html);

let nb=read('weekly-economics-environment/notebook/index.html');
const mapping={
 'counterfactual-reasoning':['2026-11-06-fire-exposure','2026-11-06-groundwater-choice','2026-11-06-seagrass-carbon'],
 'identification':['2026-11-06-pollution-salience'],
 'incidence':['2026-11-06-farm-robots','2026-11-06-fire-exposure'],
 'value-of-information':['2026-11-06-pollution-salience'],
 'private-returns-social-value':['2026-11-06-groundwater-choice','2026-11-06-seagrass-carbon'],
 'selection':['2026-11-06-seagrass-carbon']
};
for(const [concept,ids] of Object.entries(mapping)){
 const re=new RegExp('<article class="concept" id="'+concept+'"[\\s\\S]*?<\\/article>');
 const match=nb.match(re);if(!match||match[0].includes('data-edition="'+D+'"'))throw Error('Bad notebook concept '+concept);
 const li='<li class="appearance" data-edition="'+D+'"><div class="appearance-edition"><p class="edition-folio">No. 007 · <time datetime="'+D+'">'+stamp+'</time></p><p class="edition-title">'+esc(ed.title)+'</p></div><ul class="appearance-readings">'+ids.map(id=>'<li data-kind="reading"><a href="../#'+id+'">'+esc(R.find(r=>r.id===id).title)+'</a></li>').join('')+'</ul></li>';
 const b=match[0].replace('</ol>',li+'</ol>').replace(/<p class="revisited">Last revisited · <time datetime="[^"]+">[^<]+<\/time><\/p>/,'<p class="revisited">Last revisited · <time datetime="'+D+'">'+stamp+'</time></p>');
 nb=nb.replace(match[0],b);
}
write('weekly-economics-environment/notebook/index.html',nb);
const reviews=JSON.parse(read('weekly-economics-environment/notebook/reviews.json'));
if(reviews.reviews[D])throw Error('Existing notebook review');
reviews.reviews[D]={reviewedOn:D,readings:R.map(r=>r.id),synthesis:D+'-connections',revisited:ed.conceptIds,added:[],note:'Individually assessed all five source-specific studies and the issue synthesis against six existing Notebook concepts. Model scenarios, observed physical rates, structural policy comparisons, measurement and quasi-experimental identification are distinguished. No new transferable concept justified beyond the existing archive.'};
write('weekly-economics-environment/notebook/reviews.json',JSON.stringify(reviews,null,2)+'\n');

const folio=require('../weekly-economics-environment/editorial-folio.cjs');
html=folio.compose(read('weekly-economics-environment/index.html'));
write('weekly-economics-environment/index.html',html);
const source=require('../weekly-economics-environment/source-evidence.cjs');
const inv=source.inventory(html).filter(x=>x.edition===D);
if(inv.length!==5||inv.some(x=>x.components.length<7))throw Error('Invalid evidence inventory '+JSON.stringify(inv.map(x=>[x.id,x.components.length])));
const evidence=JSON.parse(read('weekly-economics-environment/source-evidence.json'));
for(const r of R){
 const p=r.source,keys=Object.keys(p.passages),lead=keys[0],other=keys[1]||lead;
 evidence.documents[p.document]={url:p.url,aliases:[p.alias],title:p.label,version:'Exact publisher PDF retrieved and SHA-256 checked on 6 November 2026; '+r.published,publicationStatus:r.status,sha256:p.sha256,
  access:{httpStatus:200,downloadedAt:D,fullTextReviewed:true,reviewedAt:D,
  scope:'Targeted source-and-analysis examination of the cited passages from the full downloaded PDF; not a full replication, all-appendix inspection or blanket whole-paper audit.'},
  passages:p.passages};
 const items=inv.find(x=>x.id===r.id);
 const facts=Object.entries(p.passages).flatMap(([passage,x])=>Object.entries(x.facts||{}).map(([fact,v])=>({document:p.document,passage,fact,kind:v.kind,
  ...(v.value===undefined?{}:{value:v.value,unit:v.unit,denominator:v.denominator}),
  ...(v.performed===undefined?{}:{performed:v.performed})})));
 evidence.readings[r.id]={edition:D,historical:false,title:r.title,
  components:items.components.map(c=>{
   let kind=c.id;
   const explanation={
    'entry-head':'Bibliographic identity, source status and dated study title reviewed',
    'reading-deck':'Opening result and all source magnitude descriptions checked against identified passages',
    finding:'Opening result, source quantities and denominators checked',
    'll-argument':'Original economic reading lens, separately qualified',
    'research-note':'Proposed methodological research direction, not a performed test',
    'analysis-01':'Economic mechanisms and private versus social costs bounded by source assumptions',
    'analysis-02':'Original study design, identification and empirical/model distinctions reviewed',
    'analysis-03':'Source-specific uncertainty, extrapolation and limitations reviewed'
   }[c.id]||r.features.find(x=>x.type===c.id)?.rationale||'Original source-grounded economic and methodological analysis';
   const second=c.id==='analysis-03'||c.id==='assumption-test';
   const chosen=second?other:lead;
   const witnesses=[chosen,...(['reading-deck','finding','research-note'].includes(c.id)?[other]:[])];
   const classification=['reading-deck','finding'].includes(c.id)?'paraphrased':c.id==='entry-head'||c.id==='economic-figures'?'reported':c.id==='research-note'||c.id==='assumption-test'?'hypothesis':c.id==='analysis-02'?'paraphrased':'editorial-interpretation';
   return {id:c.id,sha256:c.sha256,status:'verified',scope:'whole-component',basis:classification,
    evidence:[...new Set(witnesses)].map(k=>({document:p.document,passage:k,sha256:p.sha256})),
    mapping:explanation+'; source status '+r.audit.basis+'; no extra source-authored empirical result is implied.',
    claims:['reading-deck','finding','economic-figures'].includes(c.id)?facts:[],
    qualifications:r.audit.qualifications,
    verification:{reviewer:'GPT-6 primary-source and economic-analysis review',reviewedAt:D,method:'source-and-analysis',reasoning:explanation+'; '+r.audit.reason+'; '+r.audit.qualifications.join(' ')}
   };
  })};
}
write('weekly-economics-environment/source-evidence.json',JSON.stringify(evidence,null,2)+'\n');
const a=source.validate({journal:html});
const b=require('../weekly-economics-environment/notebook/validate.cjs').validate({journal:html});
const c=require('../weekly-economics-environment/field-register-schema.cjs').validate({journal:html});
if(a.readings!==35||a.verifiedComponents<55||b.newestReviewed!==D||c.editions!==7)throw Error('Incomplete publication gate '+JSON.stringify({a,b,c}));
console.log('AUTHORING_GATE_PASSED '+JSON.stringify({source:a,notebook:b,register:{editions:c.editions,entries:c.entries},newReadings:inv.map(x=>({id:x.id,components:x.components.length}))}));
