'use strict';
/* Loblolly & Logit · Re-issued editorial companion features.
 * Explicitly authored, evidence-qualified interpretations of already published
 * articles. No synthetic estimates, no fabricated tests, no dated new claims.
 * These modules are supplementary to the curated primary exhibits. */
const dossiers={
  grid:{
    id:'incidence-ledger',title:'The Incidence Ledger',subtitle:'Who May Gain From Relieving Congestion?',
    kicker:'Distributional Mechanism · Not an Estimated Treatment Effect',
    entries:[
      ['Consumers at Constrained Import Nodes','Can benefit if congestion relief reduces delivered electricity prices.'],
      ['Incumbent Local Generators','May lose congestion or scarcity rents when the grid constraint eases.'],
      ['Exporting-Area Participants','May face higher local prices when improved transfer capacity expands the market.']
    ],
    note:'These are conditional price and surplus channels drawn from the reading’s economic interpretation. The announcement does not measure their incidence; network dispatch, investment costs and cross-border spillovers determine the net result.'
  },
  '2026-10-02-amoc':{
    id:'mechanism-map',title:'The Mechanism Map',subtitle:'The Mobility Channel in Spatial Climate Damage',
    kicker:'Modeled Mechanism · Not Observed Causal Effects',
    entries:[
      ['Climate-Circulation Shock','The simulated AMOC disruption changes regional climate conditions.'],
      ['Productivity and Amenities','Location-specific economic attractiveness responds to the model’s climatic changes.'],
      ['Households and Firms Adjust','Migration and relocation redistribute people and economic activity when feasible.'],
      ['Welfare With Frictions','The authors’ counterfactual restricts mobility and changes modeled aggregate welfare.']
    ],
    note:'This sequence represents the study’s model logic. The published welfare differences are conditional counterfactuals, not effects identified from an observed AMOC collapse.'
  },
  '2026-10-09-landslides':{
    id:'mechanism-map',title:'The Mechanism Map',subtitle:'Displacement and the Loss of Local Networks',
    kicker:'Candidate Mechanism · Less Identified Than the Exposure Effect',
    entries:[
      ['Narrow Landslide Exposure','Households inside the affected path experience destruction and displacement.'],
      ['Forced Relocation','Households may leave established neighborhoods and local markets.'],
      ['Network Capital Is Disrupted','Customers, labor ties, reciprocal support and informal insurance may weaken.'],
      ['Longer-Term Recovery','Disrupted connections may contribute to persistent losses beyond direct asset damage.']
    ],
    note:'The study’s spatial comparison supports the exposure analysis more directly than any isolated network pathway. The map is a proposed mechanism, not a separately identified mediation estimate.'
  },
  '2026-10-09-nuclear-finance':{
    id:'incidence-ledger',title:'The Incidence Ledger',subtitle:'The Financing Face Value Is Not the Subsidy',
    kicker:'Conditional Incidence · Loan Terms Insufficient for Subsidy Valuation',
    entries:[
      ['Project Borrower','Federal credit can change financing cost and project timing, depending on terms and the private alternative.'],
      ['Public Balance Sheet','The public may absorb contingent loan risk; the subsidy equivalent cannot be calculated from the announcement.'],
      ['Ratepayers and Grid Users','Reliability or price gains may arise but depend on wholesale-market outcomes and additional capacity.']
    ],
    note:'No fiscal subsidy estimate, counterfactual investment effect or ratepayer gain is attributed to the announcement. Obligations for waste and decommissioning remain relevant.'
  },
  '2026-10-30-moves6':{
    id:'assumption-test',title:'The Assumption Test',subtitle:'Does the Model Version Change the Decision?',
    kicker:'Proposed Sensitivity Design · Not Yet Executed',
    entries:[
      ['Fix the Decision Context','Hold the same metropolitan transport plan, activity assumptions and local inputs.'],
      ['Vary the Measurement System','Compare outputs from MOVES5 and MOVES6 under those matched conditions.'],
      ['Separate Sources of Difference','Examine changes in fleet, activity, fuel, technology and emission-rate assumptions.'],
      ['Test the Decision Margin','Report whether any conformity determination crosses a regulatory emissions budget.']
    ],
    note:'This is a suggested research design from the published Research Notebook, not a completed numerical sensitivity test. Neither model version alone identifies policy causality.'
  }
};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(id){
 const d=dossiers[id];if(!d)return '';
 const isLedger=d.id==='incidence-ledger';
 const items=d.entries.map(([label,explanation],i)=>
  '<li><span class="rcf-index">'+String(i+1).padStart(2,'0')+'</span><div><strong>'+esc(label)+'</strong><p>'+esc(explanation)+'</p></div></li>').join('');
 return '<aside class="reading-companion-feature" data-special-feature="'+d.id+'" data-evidence-status="'+(id==='2026-10-30-moves6'?'proposed':'qualified')+'">'+
  '<header class="rcf-head"><div><span class="rcf-kicker">'+esc(d.kicker)+'</span><h3>'+esc(d.title)+'</h3><p class="rcf-subtitle">'+esc(d.subtitle)+'</p></div><span class="rcf-feature-type">'+(isLedger?'INCIDENCE':'RESEARCH LENS')+'</span></header>'+
  '<ol class="rcf-points '+(isLedger?'rcf-ledger':'rcf-flow')+'">'+items+'</ol>'+
  '<p class="rcf-caveat"><strong>Evidence boundary.</strong> '+esc(d.note)+'</p></aside>';
}
function attach(article){
 const id=article.match(/^<article[^>]*\bid="([^"]+)"/)?.[1];
 if(!id||!dossiers[id]||article.includes('class="reading-companion-feature"'))return article;
 const target='<div class="evidence-pair">';
 if(!article.includes(target))throw Error('L&L companion: evidence boundary missing '+id);
 return article.replace(target,render(id)+target);
}
module.exports={dossiers,render,attach};
