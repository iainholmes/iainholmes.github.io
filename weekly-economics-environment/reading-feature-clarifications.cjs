'use strict';
module.exports=function(nodes){
const has=(n,c)=>n.classes.includes(c),raw=(s,n)=>s.slice(n.start,n.end);
function replaceBlock(s,c,html){const n=nodes(s).find(n=>has(n,c));if(!n)throw Error('Missing '+c);return s.slice(0,n.start)+html+s.slice(n.end);}
function afterHead(s,html){const h=nodes(s).find(n=>has(n,'ll-feature-head'));return s.slice(0,h.end)+html+s.slice(h.end);}
const guide=(title,text)=>`<div class="ll-reading-key"><h5>${title}</h5><p>${text}</p></div>`;
const terms=rows=>'<dl class="ll-terms">'+rows.map(([symbol,title,text])=>`<div><dt><span class="ll-symbol">${symbol}</span><span class="ll-term-name">${title}</span></dt><dd>${text}</dd></div>`).join('')+'</dl>';
const estimand=text=>`<div class="ll-estimand"><span class="ll-label">What the relationship tells you</span><p>${text}</p></div>`;
const boundary=text=>`<div class="ll-identification"><span class="ll-label">What this does not establish</span><p>${text}</p></div>`;
function clarify(s,key,type){
 if(type==='economic-figures'){
  const copy={
   coal:['Reading the employment estimates','Start at zero. Each bar shows the estimated mining-employment decline associated with the same one-standard-deviation fall in coal-production value per person. The two series use different employment records; they are alternative measures of one response, not two independent experiments.'],
   methane:['Reading the accounting bridge','The green segment is projected compliance-resource savings. The copper segment adds energy-market surplus; hatching distinguishes EPA’s discount-rate presentations, not a confidence interval. Their sum is an accounting subtotal. Additional emissions damages must still be considered before calling it a net welfare gain.'],
   paper:['Reading the price decomposition','The bars separate the estimated price response into marginal cost and markup. The total-price bar is the reported coefficient for single-product firms. Read the scale as log points: these are not exact percentage price changes, and the rounded components need not add to the displayed total exactly.']
  }[key];return afterHead(s,guide(...copy));
 }
 if(key==='methane'&&type==='incidence-ledger'){
  const rows=[
   ['Operators','Less spending on required equipment, monitoring and operating tasks can release real resources. A lower compliance bill is therefore a possible efficiency gain, but the amount firms ultimately retain also depends on prices, production and market responses. The Ledger does not estimate each operator’s gain.'],
   ['Energy-market participants','Buyers may benefit from lower commodity prices, while producers’ revenues and output also change. Some movements between buyers and sellers are transfers; the additional surplus entry is intended to measure the net market change. Adding every private gain separately would risk double counting.'],
   ['People exposed to additional emissions','The agency projects higher emissions under a less stringent policy. Climate and local pollution consequences belong in a complete welfare assessment, even when they are absent from the displayed surplus subtotal. An omitted damage entry is not a finding that the damage is zero.']
  ];
  s=replaceBlock(s,'ll-ledger','<ol class="ll-ledger">'+rows.map(([title,text],i)=>`<li><span class="ll-number">0${i+1}</span><h5>${title}</h5><p>${text}</p></li>`).join('')+'</ol>');
  return afterHead(s,guide('Follow resources, transfers and omitted effects','This is a conditional incidence interpretation, not an estimated allocation of the subtotal across three groups. It asks whose circumstances change, which changes release resources, and which consequences the reported account leaves outside its boundary.'));
 }
 if(type==='estimation-desk'&&key==='coal'){
  s=replaceBlock(s,'ll-terms',terms([
   ['ΔC; ΔY','County changes','ΔC is the change in coal-production value per person; ΔY is the change in the county outcome being studied. The subscripts c and t identify county and period.'],
   ['Z; π','The first-stage prediction','Z assigns a modeled power-sector demand shock using predetermined delivery links. π describes how that assigned shock predicts coal-production value.'],
   ['β; ΔĈ','The outcome response','The hat marks the predicted component of the coal-value change. β relates that component to the county outcome, subject to the identifying assumptions.'],
   ['X; Γ; v; u','Controls and remaining variation','X collects the controls represented in this schematic; Γ denotes their coefficients. The error terms v and u collect variation the two equations do not explain.']
  ]));
  s=replaceBlock(s,'ll-estimand',estimand('The first equation predicts coal-value changes from downstream demand. The second uses that prediction to study local outcomes, rather than treating every observed production decline as an external shock. This is a reading aid to the design, not a full replication specification.'));
  s=replaceBlock(s,'ll-identification',boundary('A causal reading requires the assigned demand shock to affect the local outcome through coal production, rather than through another local shock. Instrument relevance alone does not establish that condition. The separate welfare calculation also requires a spatial model.'));
  return afterHead(s,guide('Two equations, two jobs','Read the upper line as the prediction step and the lower line as the outcome step. A strong first stage shows that the instrument predicts coal activity; the exclusion argument is a separate requirement.'));
 }
 if(type==='estimation-desk'&&key==='moves'){
  s=replaceBlock(s,'ll-terms',terms([
   ['E','Total emissions','Sum the contributions from the activity cells being modeled. The identity describes accounting, not an estimated behavioral response.'],
   ['g','A compatible activity cell','A cell groups the vehicle, operating mode, fuel and environmental conditions needed to pair activity with the appropriate rate.'],
   ['A<sub>g</sub>','Amount of activity','For example, operating hours must be paired with an hourly rate; distance-based activity must be paired with a distance-based rate.'],
   ['e<sub>g</sub>','Emissions per activity unit','The rate converts that activity into emissions. MOVES uses more detailed process-specific calculations than this compact identity shows.']
  ]));
  s=replaceBlock(s,'ll-estimand',estimand('A model total can change because activity changes, because emission rates change, or because their composition changes. Keeping one component fixed helps an analyst isolate the other. Matching units is essential: hours multiplied by grams per hour produce grams.'));
  s=replaceBlock(s,'ll-identification',boundary('A different emissions total after a model revision does not by itself show that a transport plan changed travel behavior. The identity cannot identify a policy effect.'));
  return afterHead(s,guide('Multiply first, then add','Within each cell, multiply the amount of activity by its corresponding emission rate. Then add across cells. This theoretical simplification explains why changed inputs can move a modeled total even when the physical plan is unchanged.'));
 }
 if(type==='estimation-desk'&&key==='paper'){
  s=replaceBlock(s,'ll-terms',terms([
   ['log yᵢₜ','The outcome','A separate regression studies logged markup, price or marginal cost. The coefficients are interpreted in the units of that logged outcome.'],
   ['Policyⱼ × Postₜ','The policy contrast','Shandong firms are exposed to the stricter rule in the post-policy period. The comparison excludes Henan.'],
   ['αᵢ; λₜ','Firm and year effects','These absorb persistent firm differences and shocks shared within a year. They do not remove every possible confounder.'],
   ['γXᵢₜ; εᵢₜ','Controls and unexplained changes','X collects time-varying firm controls; ε is the remaining disturbance. The notation is normalized here, rather than copied symbol for symbol from the authors.']
  ]));
  s=replaceBlock(s,'ll-estimand',estimand('β compares the change in regulated firms with the change in comparison firms. In the paper, the policy coefficient uses a different letter; this reconstructed notation makes its role explicit.'));
  s=replaceBlock(s,'ll-identification',boundary('Causal interpretation requires a credible counterfactual trend and no differential concurrent shock. Firm survival and product mix also affect what the sample can tell us.'));
  return afterHead(s,guide('Read β as a difference in changes','The interaction asks whether the regulated group changed differently after the policy. A post-policy difference alone would not answer that question.'));
 }
 if(type==='assumption-test'&&key==='moves'){
  s=replaceBlock(s,'ll-test-premise','<div class="ll-test-premise"><span class="ll-label">01 / Claim-bearing assumption</span><p>The same physical plan is compared under the same decision context and activity inputs. Otherwise, a model-version comparison also becomes a comparison of different assumed futures.</p></div>');
  s=replaceBlock(s,'ll-test-grid','<div class="ll-test-grid"><section><h5>02 / Pressure point</h5><p>Updating fleet composition and travel activity together can change modeled emissions even before a planner changes the project. That mixes model revisions with changed assumptions about behavior.</p></section><section><h5>03 / Proposed diagnostic</h5><p>Run the same plan in both versions with matched inputs. Then vary fleet, activity, fuel and rate inputs separately, recording which change moves the result. This is a suggested diagnostic, not a test performed here.</p></section></div>');
  s=replaceBlock(s,'ll-test-verdict','<div class="ll-test-verdict"><span class="ll-label">04 / If the assumption fails</span><p>A budget threshold may be crossed because the measurement system changed. Report that version sensitivity before interpreting the difference as an effect of the transport policy.</p></div>');
  return s;
 }
 return s;
}
return {clarify};
};
