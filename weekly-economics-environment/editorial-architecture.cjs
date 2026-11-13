'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const decisions=require('./editorial-decisions.json');
const names={'incidence-ledger':'The Incidence Ledger','long-view':'The Long View','decision-margin':'The Decision Margin','heron':'The Heron','assumption-test':'The Assumption Test','estimation-desk':'The Estimation Desk','mechanism-map':'The Mechanism Map','economic-figures':'Economic Figures'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const has=(n,c)=>n.classes.includes(c),raw=(s,n)=>s.slice(n.start,n.end),text=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function bars(chart){
 const groups=chart.kind==='panels'?chart.groups:[chart];
 return groups.map(g=>{const rows=g.rows,isRange=chart.kind==='ranges';const low=Math.min(0,...rows.map(r=>r[1])),high=Math.max(1,...rows.map(r=>isRange?r[2]:r[1]));const x=v=>(v-low)/(high-low)*100;const num=n=>Number(n.toFixed(2));
 return `<div class="ll-quant-chart" role="img" aria-label="${esc((g.title||g.unit||chart.unit)+': '+rows.map(r=>r[0]+' '+r.slice(1).join(' to ')).join('; '))}" style="--zero:${x(0)}%"><div class="ll-axis-label">${esc(g.title||g.unit||chart.unit)}</div>${rows.map((r,i)=>{const a=isRange?r[1]:Math.min(0,r[1]),b=isRange?r[2]:Math.max(0,r[1]);return `<div class="ll-data-row"><span class="ll-data-label">${esc(r[0])}</span><div class="ll-data-track"><span class="ll-data-band ll-band-${i%3}" style="left:${x(a)}%;width:${Math.max(.4,x(b)-x(a))}%"></span></div><b>${isRange&&a!==b?num(a)+'–'+num(b):num(r[1])}</b></div>`}).join('')}<div class="ll-data-axis">${Array.from({length:5},(_,i)=>`<span>${num(low+(high-low)*i/4)}</span>`).join('')}</div></div>`;
 }).join('');
}
function policyFigures(){
 const plot=supply=>{const ex=supply?134:132,ey=supply?131:178;return `<svg viewBox="0 0 280 290" role="img" aria-label="Theoretical ${supply?'supply restriction raises':'demand reduction lowers'} the world fossil price; no empirical scale"><path d="M48 35V244H260" class="ll-axis"/><path d="M65 66L250 241" class="ll-curve"/><path d="M65 245L250 60" class="ll-curve ll-curve-supply"/><path d="${supply?'M50 215L230 35':'M50 100L230 270'}" class="ll-curve ll-curve-alt"/><path d="M48 153H157M48 ${ey}H${ex}" class="ll-gridline"/><circle cx="157" cy="153" r="4" fill="var(--forest)"/><circle cx="${ex}" cy="${ey}" r="4" fill="var(--clay)"/><text x="9" y="28">Price</text><text x="260" y="278" text-anchor="end">Quantity</text><text x="257" y="59">S</text><text x="252" y="233">D</text><text x="${supply?231:222}" y="${supply?33:267}">${supply?'S′':'D′'}</text><text x="16" y="157">P₀</text><text x="16" y="${ey+4}">P₁</text></svg>`;};
 return `<div class="ll-theory-pair"><section class="ll-theory-panel"><h5>Demand-side policy</h5>${plot(false)}<p>Lower demand can reduce the world price. That price change can encourage consumption elsewhere.</p></section><section class="ll-theory-panel"><h5>Supply-side policy</h5>${plot(true)}<p>Restricted supply can raise the world price. The price response can discourage consumption elsewhere.</p></section></div>`;
}
function mobileTargetedRanges(media){const rows=[['School enrollment',40,122],['College completion',49,125],['Employment',20,62],['Family income',23,88]];const body='<div class="ll-mobile-evidence"><h5>Minimum detectable decrease (%)</h5>'+rows.map(([label,a,b])=>`<div class="ll-mobile-range"><strong>${label}</strong><span>${a}–${b}%</span><div class="ll-range-track"><i style="left:${a/130*100}%;width:${(b-a)/130*100}%"></i></div></div>`).join('')+'<div class="ll-range-axis"><span>0</span><span>65</span><span>130%</span></div><small>Least-to-most conservative assumptions, not confidence intervals or estimated policy impacts.</small></div>';return media.replace(/<\/div>$/,body+'</div>');}
function schematic(c){
 if(c.mode==='leakage')return policyFigures();
 if(c.kind==='count')return `<div class="ll-count-plot" role="img" aria-label="${c.part} of ${c.total} indicators at record extremes"><strong>${c.part}<small> / ${c.total}</small></strong><div class="ll-count-grid">${Array.from({length:c.total},(_,i)=>`<i class="${i<c.part?'active':''}"></i>`).join('')}</div><span>${esc(c.unit)}</span></div>`;
 const dilution=c.kind==='dilution';const mode=c.mode;
 const lines=dilution?`<path d="M100 330 L650 70" class="ll-curve"/><text x="390" y="165">τpopulation / τaffected = p</text>`:mode==='leakage'?`<path d="M100 80 L650 320" class="ll-curve"/><path d="M100 125 L580 335" class="ll-curve ll-curve-alt"/><path d="M100 320 L650 80" class="ll-curve ll-curve-supply"/><text x="520" y="165">Supply</text><text x="525" y="300">Demand</text><text x="340" y="305">Lower demand</text><circle cx="375" cy="200" r="6" fill="var(--forest)"/><circle cx="323" cy="223" r="6" fill="var(--clay)"/><path d="M90 200H375M90 223H323" class="ll-gridline"/><text x="390" y="190">Initial</text><text x="130" y="250">Lower world price</text>`:mode==='storage'?`<path d="M110 100 Q360 160 650 310" class="ll-curve"/><path d="M110 60 Q360 100 650 235" class="ll-curve ll-curve-alt"/><text x="320" y="220">Private revenue margin</text><text x="330" y="100">System-value margin</text>`:`<path d="M100 310 C210 310 220 75 340 80 S470 310 650 310" class="ll-curve ll-curve-supply"/><path d="M100 270 Q270 220 390 180 T650 190" class="ll-curve ll-curve-alt"/><text x="210" y="90">Solar availability</text><text x="415" y="150">Shifted delivery</text>`;
 return `<svg class="ll-schematic" viewBox="0 0 760 410" role="img" aria-label="${esc(dilution?'Illustrative exposure dilution identity':mode==='leakage'?'Schematic demand reduction with a lower world price':mode==='storage'?'Conceptual private revenue and system value margins':'Conceptual solar availability and shifted delivery')}"><path d="M90 45V340H690" class="ll-axis"/><text x="92" y="25">${dilution?'Population / affected-group effect':mode==='leakage'?'World fossil price (schematic)':mode==='storage'?'Marginal value (schematic)':'Delivery profile (schematic)'}</text>${lines}<text x="680" y="385" text-anchor="end">${dilution?'Affected share p (0 to 1)':mode==='storage'?'Storage deployment →':mode==='solar'?'Time of day →':'World fossil quantity →'}</text>${dilution?'<text x="90" y="364">0</text><text x="650" y="364">1</text>':''}</svg>`;
}
function equationMarkup(f){
 if(!f.mathLayout)return f.math;
 const {nodes}=require('./editorial-folio.cjs'),ns=nodes(f.math),row=ns.find(n=>n.tag==='mrow'),raw=n=>f.math.slice(n.start,n.end);
 const atoms=row.children.flatMap((n,i)=>f.mathLayout.flatten?.includes(i)&&n.tag==='mrow'?n.children.map(raw):[raw(n)]);
 const render=breaks=>{if(!breaks?.length)return f.math;const cuts=[0,...breaks,atoms.length];const table='<mtable columnalign="left" rowspacing=".45em">'+cuts.slice(0,-1).map((x,i)=>'<mtr><mtd><mrow>'+atoms.slice(x,cuts[i+1]).join('')+'</mrow></mtd></mtr>').join('')+'</mtable>';const m=f.math.slice(0,row.start)+table+f.math.slice(row.end);const tokens=x=>x.replace(/<[^>]*>/g,'').replace(/\s/g,'');if(tokens(m)!==tokens(f.math))throw Error('Changed mathematical tokens '+f.title);return m;};
 return '<span class="ll-full-equation">'+render(f.mathLayout.full)+'</span><span class="ll-compact-equation">'+render(f.mathLayout.compact)+'</span>';
}
function renderFeature(f,id,i,media=''){
 if(f.type==='estimation-desk'&&(!f.math||!f.terms?.length||!f.interpretation||!f.assumption))throw Error('L&L publication: incomplete Estimation Desk '+id);
 if(f.type==='economic-figures'&&media&&id==='2026-10-16-targeted-power')media=mobileTargetedRanges(media);
 if(f.type==='economic-figures'&&media)f={...f,title:'The quantities behind the reading',status:'Retained source-linked figure · read the original units and evidence qualifications',note:'The original publication graphic, quantities and source notes are retained. Comparisons across observations, scenarios or samples remain subject to the qualifications printed with the figure.'};
 const fid=`${id}--${f.type}`;
 let body='';
 if(f.type==='estimation-desk')body=`<div class="ll-equation" tabindex="0" role="group" aria-label="${esc(f.title)}">${equationMarkup(f)}</div><dl class="ll-terms">${f.terms.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl><div class="ll-estimand"><span class="ll-label">Interpretation / estimand</span><p>${esc(f.interpretation)}</p></div><div class="ll-identification"><span class="ll-label">Identification boundary</span><p>${esc(f.assumption)}</p></div>`;
 if(f.type==='mechanism-map')body=`<div class="ll-mechanism" role="img" aria-label="${esc(f.nodes.join(' → ')+'. All links qualified.')}">${f.nodes.map((n,j)=>`<div class="ll-node"><span>${String(j+1).padStart(2,'0')}</span><strong>${esc(n)}</strong></div>${j<f.nodes.length-1?`<div class="ll-edge"><span>${esc(f.edges[j]?.[2]||'conditional link')}</span><svg viewBox="0 0 120 24" aria-hidden="true"><path d="M0 12H110M100 4L112 12L100 20"/></svg></div>`:''}`).join('')}</div><p class="ll-closing">${esc(f.note)}</p>`;
 if(f.type==='incidence-ledger')body=`<ol class="ll-ledger">${f.rows.map(([a,b],j)=>`<li><span class="ll-number">${String(j+1).padStart(2,'0')}</span><h5>${esc(a)}</h5><p>${esc(b)}</p></li>`).join('')}</ol><p class="ll-closing">${esc(f.note)}</p>`;
 if(f.type==='decision-margin')body=`<p class="ll-question">${esc(f.question)}</p><div class="ll-choices">${f.options.map(([a,b],j)=>`<section><span class="ll-number">${j?'B':'A'}</span><h5>${esc(a)}</h5><p>${esc(b)}</p></section>`).join('')}</div><div class="ll-decision-rule"><span class="ll-label">The deciding margin</span><p>${esc(f.rule)}</p></div><p class="ll-closing">${esc(f.note)}</p>`;
 if(f.type==='assumption-test')body=`<div class="ll-test-premise"><span class="ll-label">01 / Claim-bearing assumption</span><p>${esc(f.premise)}</p></div><div class="ll-test-grid"><section><span class="ll-label">02 / Pressure point</span><p>${esc(f.threat)}</p></section><section><span class="ll-label">03 / Diagnostic evidence</span><p>${esc(f.check)}</p></section></div><div class="ll-test-verdict"><span class="ll-label">04 / If the assumption fails</span><p>${esc(f.consequence)}</p></div>`;
 if(f.type==='long-view')body=`<ol class="ll-timeline" data-stage-count="${f.stages.length}" style="--stages:${f.stages.length}">${f.stages.map(([a,b,c],j)=>`<li><span class="ll-number">${String(j+1).padStart(2,'0')}</span><h5>${esc(a)}</h5><p>${esc(b)}</p><em>${esc(c)}</em></li>`).join('')}</ol><p class="ll-closing">${esc(f.note)}</p>`;
 if(f.type==='economic-figures')body=`<figure class="ll-figure" tabindex="0">${media||(['bars','ranges','panels','scenario'].includes(f.chart?.kind)?bars({...f.chart,kind:f.chart.kind==='scenario'?'bars':f.chart.kind}):schematic(f.chart))}<figcaption>${esc(f.note)}</figcaption></figure>`;
 return `<section class="ll-feature ll-${f.type}${f.variant?' ll-variant-'+esc(f.variant):''}" id="${fid}" data-special-feature="${f.type}" data-evidence-status="${esc(f.status)}" aria-labelledby="${fid}-name"><header class="ll-feature-head"><div class="ll-feature-category"><span class="ll-feature-no">${String(i+1).padStart(2,'0')}</span><h3 id="${fid}-name">${names[f.type]}</h3></div><h4>${esc(f.title)}</h4><p class="ll-evidence-label">${esc(f.status)}</p></header>${f.readerGuide&&!(['2026-10-30-coal-country','2026-10-30-methane-rule','2026-10-30-moves6','2026-10-23-paper-markups'].includes(id))?`<div class="ll-reading-key"><h5>${esc(f.readerGuide.title)}</h5><p>${esc(f.readerGuide.text)}</p></div>`:''}${f.contextChart?`<figure class="ll-context-figure">${schematic(f.contextChart)}<figcaption>Physical indicator count from the source; not a monetary damage or welfare index.</figcaption></figure>`:''}${body}<footer class="ll-feature-source"><span>Evidence &amp; provenance</span><a href="#${id}--sources">${f.status.startsWith('Reported')?'Source and definitions':'Basis, qualifications and original sources'} ↓</a></footer></section>`;
}
function core(s,n,heading,cls){if(!n)throw Error('Missing '+heading);let content=raw(s,n);if(cls==='research-note')return content;return `<section class="ll-editorial ${cls||''}">${content.replace(/^<[^>]+>/,'').replace(/<\/(?:section|div)>$/,'')}</section>`;}
function composeLegacy(s,{nodes}){
 const ns=nodes(s),art=ns.find(n=>n.tag==='article'),id=art.id,v=decisions.readings[id];
 if(!v)throw Error('L&L editorial review required: '+id+' has no authored feature decisions; no legacy fallback is publishable');
 const modern=/data-editorial-system="[67]"/.test(s);
 const head=ns.find(n=>has(n,'entry-head')),deck=ns.find(n=>has(n,'reading-deck'));
 const inEvidence=n=>{let p=n.parent;while(p){if(p.classes?.includes('evidence-pair'))return true;p=p.parent}return false};
 const editorials=ns.filter(n=>has(n,'ll-editorial'));
 const interpretation=modern?editorials.find(n=>!inEvidence(n)&&/Economic interpretation/i.test(text(raw(s,n)))):ns.find(n=>has(n,'interpretive-essay'))?.children.find(n=>has(n,'analysis-block'));
 const opening=modern?editorials.find(n=>!has(n,'limitation')&&n!==interpretation):ns.find(n=>has(n,'reading-opening'))?.children.find(n=>has(n,'analysis-block'));
 const limitation=modern?editorials.find(n=>has(n,'limitation')):ns.find(n=>has(n,'limitation'));
 const note=ns.find(n=>has(n,'research-note')),sources=ns.find(n=>has(n,'reading-sources'));
 if(![head,deck,opening,interpretation,limitation,note,sources].every(Boolean))throw Error('Missing original editorial material '+id);
 const mediaNode=ns.find(n=>has(n,'ll-retained-media')||has(n,'reading-media'));
 const media=mediaNode?`<div class="ll-retained-media">${mediaNode.children.filter(n=>!has(n,'ll-mobile-evidence')).map(n=>raw(s,n)).join('')}</div>`:'';
 const fs=v.features.map(f=>({...f,variant:v.layout?.variants?.[f.type]}));if(media&&!fs.some(f=>f.type==='economic-figures'))fs.push({type:'economic-figures',title:'The source record, graphically',status:'Retained source-linked publication figure',note:'Original graphical evidence and source notes are preserved.'});
 let attrs=art.attrs.replace(/ data-(?:reading-composition|spatial-composition|reading-palette|dock-note|dock-heron)="[^"]*"/g,'').replace(/ data-reading-(?:folio|layout|exhibit|stage|finish)="[^"]*"/g,'').replace(/ data-special-features="[^"]*"/,'').replace(/ data-feature-review="[^"]*"/,'').replace(/ data-editorial-system="[^"]*"/,'').replace(/ data-composition="[^"]*"/,'');
 attrs=attrs.slice(0,-1)+` data-editorial-system="6" data-composition="${v.composition}" data-special-features="${fs.map(f=>f.type).join(' ')}">`;
 const intro=core(s,opening,'opening'),econ=core(s,interpretation,'Economic Interpretation');
 const stream=items=>items.length?`<div class="ll-feature-stream ll-composition-${v.composition}">${items.map(f=>renderFeature(f,id,fs.indexOf(f),f.type==='economic-figures'?media:'')).join('')}</div>`:'';
 let primary=fs[0];if(v.composition==='figure-led')primary=fs.find(f=>f.type==='economic-figures')||primary;
 const rest=fs.filter(f=>f!==primary);let body;
 if(v.composition==='figure-led')body=stream([primary])+intro+econ+stream(rest);
 else if(v.composition==='model-led')body=econ+stream([primary])+intro+stream(rest);
 else if(['map-led','decision-led','horizon-led'].includes(v.composition))body=intro+stream([primary])+econ+stream(rest);
 else body=intro+econ+stream(fs);
 return attrs+raw(s,head)+raw(s,deck)+`<div class="article-grid ll-reading"><div class="ll-argument"><span class="ll-label">Reading lens</span><p>${esc(v.argument)}</p></div>${body}<div class="evidence-pair">${core(s,limitation,'limits','limitation')}${raw(s,note)}</div><div class="reading-sources" id="${id}--sources">${raw(s,sources).replace(/^<div class="reading-sources"[^>]*>|<\/div>$/g,'')}</div></div></article>`;
}
function compose(s,ctx){const legacy=composeLegacy(s,ctx);return require('./reading-compositions.cjs')({nodes:ctx.nodes,decisions}).compose(legacy);}
function validateCompanions(companion,readingsByDate){
 const seen=new Set();
 for(const [date,config] of Object.entries(companion)){
  const readings=readingsByDate.get(date);
  if(!readings)throw Error('L&L Heron: unknown edition '+date);
  if(typeof config?.enabled!=='boolean'||!Array.isArray(config.appearances))throw Error('L&L Heron: expected an enabled flag and appearance list for '+date);
  if(config.appearances.length>2)throw Error('L&L Heron: at most two interventions per edition '+date);
  if(!config.enabled&&config.appearances.length)throw Error('L&L Heron: a disabled edition must have an empty appearance list '+date);
  for(const note of config.appearances){
   if(typeof note?.id!=='string'||!/^[a-z0-9][a-z0-9-]*$/.test(note.id)||seen.has(note.id))throw Error('L&L Heron: invalid or duplicate appearance ID in '+date);
   if(!readings.some(([,id])=>id===note.target))throw Error('L&L Heron: '+note.id+' must target a reading in '+date);
   if(![note.title,note.text].every(value=>typeof value==='string'&&value.trim()))throw Error('L&L Heron: title and note text required for '+note.id);
   seen.add(note.id);
  }
 }
}
function finalize(journal,{nodes}){
 const editions=[...journal.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[^>]*data-title="([^"]+)"([\s\S]*?)(?=<section class="edition"|<\/main>)/g)];
 const companion=JSON.parse(journal.match(/id="companion-data">([\s\S]*?)<\/script>/)[1]);
 editions.sort((a,b)=>a[1].localeCompare(b[1]));
 const readingsByDate=new Map(editions.map(([s,date])=>[date,[...s.matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)]]));
 validateCompanions(companion,readingsByDate);
 const indexed=editions.map(([,date,title])=>({date,title:text(title),number:String(editions.filter(e=>e[1].slice(0,4)===date.slice(0,4)&&e[1]<=date).length).padStart(3,'0'),readings:readingsByDate.get(date).map(([html,id])=>{
 const v=decisions.readings[id],features=[...html.matchAll(/<section class="ll-feature[^"]*" id="([^"]+)" data-special-feature="([^"]+)"/g)].map(m=>({id:m[2],name:names[m[2]],anchor:m[1]}));
 const appearances=(companion[date]?.appearances||[]).filter(a=>a.target===id);for(const a of appearances)features.push({id:'heron',name:names.heron,anchor:'heron-'+a.id});
 return {id,title:v.title,subjects:v.subjects,features};})}));
 const json=`<script type="application/json" id="ll-reading-index-data">\n${JSON.stringify({version:7,editions:indexed},null,2).replace(/</g,'\\u003c')}\n</script>`;
 journal=journal.includes('id="ll-reading-index-data"')?journal.replace(/<script type="application\/json" id="ll-reading-index-data">[\s\S]*?<\/script>/,json):journal.replace('</body>',json+'\n</body>');
 return journal;
}
function publishedChanges(v,features){const previous=v.changeRecord?.previous||[],current=features.filter(f=>f.id!=='heron').map(f=>f.id);return {...v.changeRecord,retained:previous.filter(id=>current.includes(id)),added:current.filter(id=>!previous.includes(id)),replaced:previous.filter(id=>!current.includes(id))};}
function inventory(journal){const index=JSON.parse(journal.match(/id="ll-reading-index-data">([\s\S]*?)<\/script>/)[1]);return {version:7,title:'Loblolly & Logit · Editorial Decision Inventory',reviewed:decisions.reviewed,policy:decisions.policy,entries:index.editions.flatMap(e=>e.readings.map(r=>({...r,edition:e.date,...decisions.readings[r.id],selected:r.features,changeRecord:publishedChanges(decisions.readings[r.id],r.features),additionalFeatureJustification:decisions.readings[r.id].additionalFeatureJustification||(r.features.filter(f=>f.id!=='heron').length>decisions.readings[r.id].features.length?'Retains an original sourced graphic in addition to the authored analytical functions; preserved visual evidence is not discarded to meet a feature quota.':null)}))),totals:{editions:index.editions.length,readings:index.editions.reduce((s,e)=>s+e.readings.length,0),features:index.editions.flatMap(e=>e.readings.flatMap(r=>r.features)).reduce((s,f)=>(s[f.id]=(s[f.id]||0)+1,s),{})}};}
module.exports={compose,finalize,inventory,renderFeature,names,decisions};
