'use strict';
/* The Economic Hinge — authored, non-numerical mechanism summaries keyed to
 * immutable reading IDs. These are interpretive guideposts, never new estimates.
 * Editorially maintain these with future editions; deterministic fallback
 * quotes existing published text rather than inferring unsupported causality.
 */
const hinges={
  'electrification':['Cost-competitive electric equipment','Upfront financing and split incentives','Gap between technical potential and uptake','Scenario / analytical mechanism'],
  'grid':['Transmission bottlenecks','Upgrades change the feasible dispatch mix','Locational prices and surplus can shift','Proposed investments, not realized impacts'],
  'carbon-border':['Different carbon costs across borders','Border adjustment changes trade incentives','Leakage and investment expectations','Legal procedure; economic effects not measured'],
  'insurance':['Uneven insurance strain','Housing user costs absorb some risk','Affordability and location adjustment','Within-metro observational association'],
  'glyphosate':['New evidence coordination','Information can alter regulatory choices','Input substitution and exposure trade-offs','Review process, not a new risk finding'],
  '2026-10-02-green-spending':['Environmental fiscal expenditure','Financing, imports and capacity constraints','Near-term output can diverge from long-run value','Cross-country estimated fiscal response'],
  '2026-10-02-policy-mix':['Demand-side carbon price','Global fossil price and supply adjustment','Leakage outside policy jurisdiction','Analytical policy framework'],
  '2026-10-02-amoc':['Ocean circulation tipping scenario','Temperature, productivity and amenity shifts','Migration redistributes long-run losses','Dynamic spatial model counterfactual'],
  '2026-10-02-storage':['Storage enters the power market','Arbitrage compresses price spreads','Private revenue can trail social value','Structural market-model mechanism'],
  '2026-10-02-tax-bias':['Interest deductibility favors debt','Leveraged firms face lower effective capital costs','Capital can tilt toward emissions-intensive sectors','Empirical association and modeled reform'],
  '2026-10-09-trade-climate':['National carbon-pricing choices','Terms of trade redistribute policy burdens','Transfers may support cooperation','Calibrated international policy model'],
  '2026-10-09-landslides':['Landslide displacement','Local networks and contacts are disrupted','Income and welfare losses can persist','Spatial comparison with remaining limitations'],
  '2026-10-09-nuclear-finance':['Conditional federal financing','Cost of capital and project risk can shift','Additional uprates versus public exposure','Commitment, not completed investment'],
  '2026-10-09-winter-bills':['Fuel-specific prices and expected weather','Heating technology and location mediate exposure','Household expenditures diverge','Conditional winter forecast'],
  '2026-10-09-climate-liability':['Jurisdictional climate litigation','Expected liability can alter perceived risk','Investment decisions may respond ahead of rulings','Legal developments, not observed damages'],
  '2026-10-16-targeted-power':['Small exposed study population','Population samples dilute treatment incidence','Power falls despite broad sample coverage','Stylized research-design calculation'],
  '2026-10-16-pfas-agriculture':['Contaminants arrive in farm inputs','Testing and remediation costs land downstream','Farm decisions absorb upstream externalities','Science and policy synthesis'],
  '2026-10-16-ferc-review':['Standardized LNG authorization proposal','Lower review delay changes information and costs','Investment speed trades against oversight','Proposed rules, not measured outcomes'],
  '2026-10-16-energy-macro':['Global energy-price shock','Importer status, stocks and substitution matter','Growth and inflation diverge across economies','Conditional IMF outlook'],
  '2026-10-16-climate-vitals':['Accumulating climate-state variables','Physical hazards interact with local exposure','Adaptation and mitigation value can change','Indicator monitoring, not policy attribution'],
  '2026-10-23-paper-markups':['Stricter wastewater standard','Compliance costs and competition both adjust','Prices reflect cost and market-power channels','Matched difference-in-differences estimates'],
  '2026-10-23-vehicle-mix':['Clean-vehicle credit expiration','Purchase timing and user prices may change','New-sales mix shifts toward hybrids','Descriptive sales, not causal policy effect'],
  '2026-10-23-emissions-gap':['Delayed global abatement','Overshoot increases future removal dependence','Risk shifts toward later generations','Conditional emissions pathways'],
  '2026-10-23-adaptation-finance':['Public adaptation-finance commitments','Risk reduction and project preparation','Potential resilience investment follows','Commitment, not measured resilience'],
  '2026-10-23-mobility-finance':['High borrowing costs for riders','Upfront capital limits vehicle switching','Electrification can stall despite fuel savings','Technical proposals, not evaluated interventions'],
  '2026-10-30-coal-country':['Declining coal demand','Mine payroll and linked sectors contract','Local employment, housing and migration adjust','Instrument-based estimates with model limits'],
  '2026-10-30-household-climate':['Heterogeneous household equipment','Solar and clean technologies can complement','The modeled cost of abatement changes','Calibrated household-production counterfactual'],
  '2026-10-30-methane-rule':['Proposed methane-rule reconsideration','Compliance savings versus higher emissions','The welfare ledger remains incomplete','Agency projections relative to 2024 baseline'],
  '2026-10-30-solar-storage':['New solar capacity additions','Battery co-location shifts output across hours','Grid and private value depend on timing','Reported inventory, not identified impacts'],
  '2026-10-30-moves6':['New EPA emissions-model version','Updated fleets and electric-vehicle assumptions','Conformity-analysis baselines may change','Model revision, not observed emissions change']
};
const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function firstSentence(s,max=110){const clean=String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();const match=clean.match(/^[\s\S]*?[.!?](?=\s|$)/);const part=match?match[0]:clean;return part.length<=max?part:part.slice(0,max-1).trimEnd()+'…';}
function get(id,source){
 if(Object.prototype.hasOwnProperty.call(hinges,id))return {stages:hinges[id].slice(0,3),status:hinges[id][3],authored:true};
 // Safe fall-through for the unattended publisher: only direct excerpts from
 // already authored content, never fabricated economic claims.
 return {stages:[
   firstSentence(source?.finding||source?.title||'',110),
   firstSentence(source?.interpretation||source?.analysis||'',110),
   firstSentence(source?.limitations||'',110)
 ],status:'Source excerpts — editorial mechanism review recommended',authored:false};
}
function render(id,source){
 const data=get(id,source);
 if(data.stages.some(x=>!x))throw Error('Missing Economic Hinge source material for '+id);
 const parts=data.stages.map((v,i)=>'<div class="hinge-stage"><span class="hinge-index">'+String(i+1).padStart(2,'0')+'</span><span class="hinge-label">'+['INITIATING CHANGE','TRANSMISSION','ECONOMIC MARGIN'][i]+'</span><span class="hinge-phrase">'+escape(v)+'</span></div>').join('');
 return '<div class="economic-hinge" role="group" aria-label="The Economic Hinge" data-authored="'+data.authored+'"><div class="hinge-heading"><span class="hinge-kicker">An economic reading</span><strong>The Economic Hinge</strong><span class="hinge-status">'+escape(data.status)+'</span></div><div class="hinge-stages">'+parts+'</div><small class="hinge-disclaimer">Interpretive pathway, not an independently identified causal diagram.</small></div>';
}
module.exports={hinges,get,render,firstSentence};
