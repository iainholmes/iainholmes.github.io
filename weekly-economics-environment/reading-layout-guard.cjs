'use strict';
/* Loblolly & Logit publishing preflight.
 * This applies to every existing and future edition, not to one issue's IDs.
 * Safe provisional exhibits are useful in private drafts but must not leak
 * into the permanent published archive. No file writes or browser APIs. */
const {nodes}=require('./editorial-folio.cjs');
const exhibits=require('./reading-exhibits.cjs');
const has=(node,cls)=>node.classes.includes(cls);
function validate({journal,notebook,folioCss,notebookCss}={}){
 if(typeof journal!=='string'||typeof notebook!=='string'||typeof folioCss!=='string'||typeof notebookCss!=='string')
  throw Error('L&L publication layout: journal, notebook and both stylesheets required');
 if(!/href="reading-folio\.css(?:\?v=[^"]+)?"/.test(journal)||
    !/href="notebook\.css(?:\?v=[^"]+)?"/.test(notebook))
  throw Error('L&L publication layout: permanent journal/notebook CSS references missing');
 for(const [css,required,name] of [
  [folioCss,['[data-reading-finish="5"]','.reading-opening','.feature-spread','.reading-sources','nth-of-type(n+4)'],'reading-folio.css'],
  [notebookCss,['.concept-body','.concept-analysis','.concept-body+.seen','.appearance-register'],'notebook.css']]){
  for(const rule of required)if(!css.includes(rule))throw Error('L&L publication layout: '+name+' missing durable layout rule '+rule);
 }
 const main=journal.match(/<main\b[^>]*id="edition"[^>]*>([\s\S]*?)<\/main>/)?.[1];
 if(!main)throw Error('L&L publication layout: canonical edition archive missing');
 const editions=[...main.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[\s\S]*?(?=<section class="edition"|$)/g)];
 if(!editions.length)throw Error('L&L publication layout: no editions');
 const seenIds=new Set();let readingCount=0,sourceCount=0;
 for(const edition of editions){
  const date=edition[1];
  const articles=[...edition[0].matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)];
  if(articles.length!==5)throw Error('L&L publication layout: '+date+' must contain five readings, found '+articles.length);
  for(const match of articles){
   const id=match[1],markup=match[0];
   if(seenIds.has(id))throw Error('L&L publication layout: duplicate reading '+id);
   seenIds.add(id);readingCount++;
   const opening=markup.match(/^<article[^>]*>/)?.[0]||'';
   for(const marker of ['data-reading-folio="1"','data-reading-layout="2"','data-reading-exhibit="1"','data-reading-stage="3"','data-reading-finish="5"'])
    if(!opening.includes(marker))throw Error('L&L publication layout: incomplete composed layout '+id+' ('+marker+')');
   const tree=nodes(markup);
   for(const cls of ['reading-opening','feature-spread','reading-exhibit','evidence-pair','reading-sources'])
    if(!tree.some(n=>has(n,cls)))throw Error('L&L publication layout: '+id+' missing '+cls);
   const exhibit=tree.find(n=>has(n,'reading-exhibit'));
   if(!exhibits.select(id).curated||!exhibit.attrs.includes('data-curated="true"'))
    throw Error('L&L publication layout: uncurated reading '+id+'; finish the source-specific editorial exhibit before publishing');
   const finding=tree.find(n=>has(n,'finding'));
   if(!finding)throw Error('L&L publication layout: missing authored finding '+id);
   const kind=exhibit.attrs.match(/data-exhibit-kind="([^"]+)"/)?.[1];
   if(kind!==exhibits.select(id).kind)throw Error('L&L publication layout: exhibit type does not match this article '+id);
   const kindToFeature={ledger:'incidence-ledger',long:'long-view',decision:'decision-margin',test:'assumption-test'};
   const openingFeatures=(opening.match(/data-special-features="([^"]+)"/)||[])[1];
   if(!openingFeatures)throw Error('L&L publication layout: feature-selection record missing '+id);
   const featureIds=openingFeatures.split(/\s+/).filter(Boolean);
   const hasIndependentGraphic=markup.includes('class="essay-graphic"')||markup.includes('class="economic-plot"')||markup.includes('<figure class="figure"');
   const extra=markup.match(/class="reading-companion-feature"[^>]*data-special-feature="([^"]+)"/)?.[1];
   const actual=[kindToFeature[kind],...(hasIndependentGraphic?['economic-figures']:[]),...(extra?[extra]:[])];
   if(featureIds.join(' ')!==actual.join(' '))
    throw Error('L&L publication layout: special-feature record does not match authored reading '+id);
   if(extra){
    const approved=require('./reading-feature-dossiers.cjs').dossiers[id];
    if(!approved||approved.id!==extra)throw Error('L&L publication layout: unsupported supplemental feature '+id);
    if(!markup.includes('Evidence boundary.'))throw Error('L&L publication layout: supplemental feature missing evidence boundary '+id);
    if(extra==='incidence-ledger'){
     const rows=[...markup.matchAll(/class="rcf-ledger-party"/g)].length;
     const effects=[...markup.matchAll(/class="rcf-ledger-effect"/g)].length;
     if(rows<2||rows!==effects||!markup.includes('rcf-points rcf-ledger'))
      throw Error('L&L publication layout: companion Incidence Ledger must be vertical party/effect rows '+id);
    }
   }
   if(featureIds.length>2&&!/data-feature-justification="[^"]+"/.test(opening))
    throw Error('L&L publication layout: third feature requires explicit editorial justification '+id);
   let expected=exhibits.render(id,{finding:markup.slice(finding.open,finding.close)});
   if(kind==='ledger'){
    const parties=[...markup.matchAll(/class="ledger-party"/g)].length;
    const ledgerRows=[...markup.matchAll(/class="ledger-line"/g)].length;
    if(ledgerRows<2||parties!==ledgerRows)
     throw Error('L&L publication layout: primary Ledger requires vertical ordered rows '+id);
   }
   if(kind==='ledger'){
    const chart=exhibits.graphic(id),inLedger=exhibits.graphicPlacement(id)==='ledger';
    if(!chart)throw Error('L&L publication layout: absent source-grounded graphic '+id);
    if(inLedger){
     if(!expected.includes(chart)||!markup.slice(exhibit.start,exhibit.end).includes(chart)||
        tree.some(n=>has(n,'essay-graphic')))
      throw Error('L&L publication layout: selected incidence pathway misplaced '+id);
    }else{
     if(!markup.includes('<div class="essay-graphic">'+chart+'</div>'))
      throw Error('L&L publication layout: missing or stale source-grounded graphic '+id);
     expected=expected.replace(chart,'');
    }
   }
   if(markup.slice(exhibit.start,exhibit.end)!==expected)
    throw Error('L&L publication layout: stale or mismatched generated exhibit '+id);
   const sourceNode=tree.find(n=>has(n,'sources')&&n.parent&&has(n.parent,'reading-sources'));
   if(!sourceNode)throw Error('L&L publication layout: source register missing '+id);
   const anchors=tree.filter(n=>n.tag==='a'&&n.start>=sourceNode.open&&n.end<=sourceNode.close&&/\bhref=/.test(n.attrs));
   if(!anchors.length)throw Error('L&L publication layout: at least one linked primary source required for '+id);
   sourceCount+=anchors.length;
   if(!['ledger','test','decision','long'].includes(kind))throw Error('L&L publication layout: invalid exhibit type '+id);
   if(kind==='ledger'&&exhibits.graphicPlacement(id)!=='ledger'&&!tree.some(n=>has(n,'essay-graphic')&&n.parent&&has(n.parent,'interpretive-essay')))
    throw Error('L&L publication layout: Ledger graphic missing from interpretation '+id);
  }
 }
 const concepts=[...notebook.matchAll(/<article class="concept" id="([^"]+)"[\s\S]*?<\/article>/g)];
 if(!concepts.length||new Set(concepts.map(x=>x[1])).size!==concepts.length)
  throw Error('L&L publication layout: cumulative notebook absent or duplicated');
 for(const [,id,body] of concepts.map(m=>[m[0],m[1],m[0]])){
  for(const cls of ['concept-body','concept-analysis','seen','appearance-register'])
   if(!body.includes('class="'+cls+'"'))throw Error('L&L publication layout: incomplete notebook structure '+id+' ('+cls+')');
 }
 return {editions:editions.length,readings:readingCount,concepts:concepts.length,sourceLinks:sourceCount,curated:true};
}
module.exports={validate};
