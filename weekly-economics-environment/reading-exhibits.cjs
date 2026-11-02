'use strict';
/* Curated rotating reading exhibits: meaning first, visual diversity audited. */
const catalog={
  "insurance": {
    "kind": "ledger",
    "heading": "Where insurance strain lands",
    "rows": [
      [
        "Insured households",
        "Affordability and availability pressures affect housing costs",
        "Measured index"
      ],
      [
        "Housing owners",
        "Higher expected costs may be capitalized into prices",
        "Economic interpretation"
      ],
      [
        "Public backstops",
        "Catastrophe arrangements can shift risk to taxpayers",
        "Potential incidence"
      ]
    ]
  },
  "2026-10-02-policy-mix": {
    "kind": "ledger",
    "heading": "The international incidence of carbon policy",
    "rows": [
      [
        "Domestic users",
        "Demand-side pricing reduces fossil fuel consumption",
        "Policy mechanism"
      ],
      [
        "Foreign users",
        "World-price effects can encourage offsetting consumption",
        "Leakage mechanism"
      ],
      [
        "Producers",
        "An extraction price acts on a different margin",
        "Alternative policy mechanism"
      ]
    ]
  },
  "2026-10-02-storage": {
    "kind": "ledger",
    "heading": "Who receives the value of storage?",
    "rows": [
      [
        "Storage investors",
        "Arbitrage spreads shrink as storage enters",
        "Modeled private return"
      ],
      [
        "Electricity consumers",
        "Smoother wholesale prices can improve surplus",
        "Modeled benefit"
      ],
      [
        "Other generators",
        "Their revenues change as hourly prices shift",
        "Equilibrium response"
      ]
    ]
  },
  "2026-10-09-trade-climate": {
    "kind": "ledger",
    "heading": "Who must agree to carbon pricing?",
    "rows": [
      [
        "Net energy importers",
        "Demand-side carbon pricing changes their terms of trade",
        "Model mechanism"
      ],
      [
        "Net energy exporters",
        "They can face offsetting trade-income losses",
        "Model mechanism"
      ],
      [
        "Governments",
        "Transfers may make a climate agreement acceptable",
        "Calibrated counterfactual"
      ]
    ]
  },
  "2026-10-09-winter-bills": {
    "kind": "ledger",
    "heading": "Four fuels, four household exposures",
    "rows": [
      [
        "Heating-oil homes",
        "Forecast winter spending rises 21%",
        "Conditional EIA forecast"
      ],
      [
        "Electric-heating homes",
        "Forecast spending rises 4%",
        "Conditional EIA forecast"
      ],
      [
        "Natural-gas homes",
        "Forecast spending falls 9%",
        "Conditional EIA forecast"
      ],
      [
        "Propane homes",
        "Forecast spending falls 3%",
        "Conditional EIA forecast"
      ]
    ]
  },
  "2026-10-16-pfas-agriculture": {
    "kind": "ledger",
    "heading": "The contamination-cost chain",
    "rows": [
      [
        "Input suppliers",
        "Contamination can reach farms through biosolids and water",
        "Exposure pathways"
      ],
      [
        "Farm operators",
        "Testing and lost markets may impose costs",
        "Possible incidence not quantified"
      ],
      [
        "Public agencies",
        "Upstream prevention may alter who bears costs",
        "Policy consideration"
      ]
    ]
  },
  "2026-10-16-energy-macro": {
    "kind": "ledger",
    "heading": "One shock, divergent national effects",
    "rows": [
      [
        "Energy importers",
        "Higher fuel costs can slow output and raise prices",
        "Conditional macro channel"
      ],
      [
        "Energy exporters",
        "Terms-of-trade gains can cushion energy shocks",
        "Conditional macro channel"
      ],
      [
        "Governments",
        "Fiscal support cushions bills but consumes buffers",
        "Potential redistribution"
      ]
    ]
  },
  "2026-10-23-paper-markups": {
    "kind": "ledger",
    "heading": "Compliance costs and market power",
    "rows": [
      [
        "Surviving paper producers",
        "Estimated markups increased by about 5.6%",
        "Matched difference-in-differences"
      ],
      [
        "Buyers",
        "Prices reflect both cost and markup channels",
        "Estimated price decomposition"
      ],
      [
        "Potential entrants",
        "Regulation may change competitive pressure",
        "Mechanism not separately measured here"
      ]
    ]
  },
  "2026-10-23-mobility-finance": {
    "kind": "ledger",
    "heading": "The financing wedge",
    "rows": [
      [
        "Commercial riders",
        "Fuel savings can coexist with unaffordable purchase finance",
        "Reported constraint"
      ],
      [
        "Lenders",
        "Collateral and default risks increase financing costs",
        "Market conditions"
      ],
      [
        "Public guarantors",
        "Guarantees can shift risk toward public balance sheets",
        "Proposed intervention"
      ]
    ]
  },
  "2026-10-30-coal-country": {
    "kind": "ledger",
    "heading": "Where coal-demand losses land",
    "rows": [
      [
        "Mining and linked firms",
        "Employment contracts in mining and connected sectors",
        "Estimated labor-market impacts"
      ],
      [
        "Local governments",
        "School revenues and expenditures fell about 4%",
        "Reported estimate"
      ],
      [
        "Households",
        "Housing and migration adjust after the shock",
        "Estimated outcomes and modeled welfare"
      ]
    ]
  },
  "2026-10-30-methane-rule": {
    "kind": "ledger",
    "heading": "What the welfare ledger leaves out",
    "rows": [
      [
        "Oil-and-gas operators",
        "About $2.5 billion in annual compliance costs avoided",
        "EPA projection"
      ],
      [
        "Energy-market participants",
        "About $0.2–$0.3 billion annual market-surplus change",
        "EPA model projection"
      ],
      [
        "Climate and health exposure",
        "Added emissions damages are not fully valued in that surplus tally",
        "Missing damages not zero damages"
      ]
    ]
  },
  "carbon-border": {
    "kind": "cabinet",
    "heading": "The procedural record",
    "key": "Establishing a trade-dispute panel is not a ruling on the merits.",
    "limit": "The announcement provides neither a legal verdict nor an emissions-effect estimate."
  },
  "glyphosate": {
    "kind": "cabinet",
    "heading": "The memorandum versus the evidence",
    "key": "The agreement coordinates evidence gathering without changing EPA registration authority.",
    "limit": "It does not establish a new health effect or predetermine the review."
  },
  "2026-10-02-green-spending": {
    "kind": "cabinet",
    "heading": "Behind the reported fiscal shock",
    "key": "The authors construct residual-based environmental-expenditure shocks before estimating macro responses.",
    "limit": "A cross-country short-run average is not the return on every green project."
  },
  "2026-10-02-tax-bias": {
    "kind": "cabinet",
    "heading": "The hidden financing distortion",
    "key": "The article studies debt deductibility and firm emissions intensity.",
    "limit": "A modeled tax reform is not an observed economy-wide intervention."
  },
  "2026-10-09-landslides": {
    "kind": "cabinet",
    "heading": "Following displaced people",
    "key": "The researchers traced households displaced by six landslides rather than surveying only original locations.",
    "limit": "The spatial comparison is informative but disaster exposure is not randomized."
  },
  "2026-10-09-climate-liability": {
    "kind": "cabinet",
    "heading": "The legal record and the economic conjecture",
    "key": "Jurisdictional proceedings establish which court may consider the case.",
    "limit": "Procedural developments alone do not measure climate damages or capital-market effects."
  },
  "2026-10-16-targeted-power": {
    "kind": "cabinet",
    "heading": "The sample is not the exposed population",
    "key": "The study uses stylized statistical-power calculations for narrowly exposed groups.",
    "limit": "Such exercises are not empirical effects of the environmental policies they illustrate."
  },
  "2026-10-16-ferc-review": {
    "kind": "cabinet",
    "heading": "Categorical authorization, conditional review",
    "key": "The LNG proposal creates differentiated review tiers based on project characteristics.",
    "limit": "The proposal does not supply measured permitting-time or emissions effects."
  },
  "2026-10-16-climate-vitals": {
    "kind": "cabinet",
    "heading": "From physical monitoring to economic evidence",
    "key": "The report monitors physical climate indicators with differing frequencies.",
    "limit": "A record extreme is not a causal policy estimate or monetized welfare effect."
  },
  "2026-10-30-household-climate": {
    "kind": "cabinet",
    "heading": "Inside the household-production model",
    "key": "The model combines survey information and national energy-use data to examine equipment complementarities.",
    "limit": "Its counterfactual subsidy results are model-dependent rather than experimentally identified."
  },
  "2026-10-30-moves6": {
    "kind": "cabinet",
    "heading": "A model revision is not an emissions change",
    "key": "MOVES6 revises fleet activity, energy consumption assumptions and emission rates.",
    "limit": "A changed modeled baseline is not itself a measured change in pollution."
  },
  "electrification": {
    "kind": "long",
    "heading": "From present share to potential",
    "points": [
      [
        "2025 observed",
        "Electricity is 23% of final global energy use",
        "Reported share"
      ],
      [
        "Today analytical",
        "Cost-competitive potential could imply 33%",
        "Not realized adoption"
      ],
      [
        "2035 scenario",
        "High Electrification Scenario reaches 35%",
        "Conditional model"
      ]
    ]
  },
  "grid": {
    "kind": "long",
    "heading": "An investment has stages",
    "points": [
      [
        "Selection",
        "DOE announces its intention to support 31 projects",
        "Not commissioning"
      ],
      [
        "Planned build-out",
        "Projects are expected to unlock over 23 GW",
        "Projected capability"
      ],
      [
        "After delivery",
        "Prices and reliability could be evaluated",
        "Not yet observed"
      ]
    ]
  },
  "2026-10-02-amoc": {
    "kind": "long",
    "heading": "A modeled circulation shock",
    "points": [
      [
        "Reference path",
        "Climate warms without modeled AMOC collapse",
        "Counterfactual"
      ],
      [
        "Circulation change",
        "Temperature and amenity patterns shift geographically",
        "Modeled mechanism"
      ],
      [
        "By 2200",
        "Global welfare falls 1.9% in the authors’ intermediate scenario",
        "Model result"
      ]
    ]
  },
  "2026-10-09-nuclear-finance": {
    "kind": "long",
    "heading": "From offer to operation",
    "points": [
      [
        "Conditional offer",
        "DOE announces up to $4.2 billion in proposed financing",
        "Not a final loan"
      ],
      [
        "Planned uprates",
        "Existing plants could add 433 MW",
        "Planned output"
      ],
      [
        "Further operation",
        "The proposal anticipates twenty additional years",
        "Contingent"
      ]
    ]
  },
  "2026-10-23-vehicle-mix": {
    "kind": "long",
    "heading": "After a policy expiration",
    "points": [
      [
        "September 2025",
        "Federal clean-vehicle credits expire at month end",
        "Policy date"
      ],
      [
        "Third quarter 2026",
        "Hybrids and plug-ins represent 23% of new light-duty sales",
        "Descriptive observation"
      ],
      [
        "Vehicle-stock turnover",
        "New sales alter the full fleet gradually",
        "Mechanism not forecast"
      ]
    ]
  },
  "2026-10-23-emissions-gap": {
    "kind": "long",
    "heading": "The pathway and its future burden",
    "points": [
      [
        "2025 reference",
        "Global emissions are the comparison year",
        "Scenario baseline"
      ],
      [
        "2030 pathway",
        "Emissions fall 18% relative to 2025",
        "Modeled requirement"
      ],
      [
        "2040 pathway",
        "Emissions fall 69% relative to 2025",
        "Modeled requirement"
      ],
      [
        "2100 scenario",
        "Temperatures approach 1.5°C after overshoot",
        "Conditional pathway"
      ]
    ]
  },
  "2026-10-23-adaptation-finance": {
    "kind": "cabinet",
    "heading": "A commitment is not a resilience outcome",
    "key": "The EIB’s plan sets a financing commitment alongside project preparation and advisory support.",
    "limit": "The announced amount is not completed investment, and avoided losses have not yet been measured."
  },
  "2026-10-30-solar-storage": {
    "kind": "long",
    "heading": "The co-location trajectory",
    "points": [
      [
        "2017",
        "About 2% of newly added solar was paired with storage",
        "Historical observation"
      ],
      [
        "Through September 2026",
        "More than 16% was paired with operating batteries",
        "Reported inventory"
      ],
      [
        "Full year 2026",
        "Annual share could reach 19%",
        "Projection"
      ],
      [
        "2027 to 2028",
        "Plans point above 30%",
        "Proposed additions"
      ]
    ]
  }
};
const names=Object.freeze({ledger:'The Incidence Ledger',cabinet:'The Evidence Cabinet',long:'The Long View'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function specimen(source){
 const prose=plain(source);
 if(!prose)return '';
 const first=prose.match(/^[\s\S]*?[.!?](?=\s|$)/);
 return first?first[0]:prose;
}
function select(id){
 const entry=catalog[id];
 if(entry)return {...entry,id,curated:true};
 // Safe future fallback: only repeat the direct published lead, never
 // infer distributional outcomes or construct imaginary dated milestones.
 return {kind:'cabinet',heading:'The published record',key:'The published finding is reproduced here for close examination.',limit:'This excerpt alone is not an independently identified causal claim.',id,curated:false};
}
function render(id,source={}){
 const e=select(id),kind=e.kind;
 const head='<header class="exhibit-head"><div class="exhibit-kicker">L&L · READING EXHIBIT</div><strong>'+esc(names[kind])+'</strong><span class="exhibit-heading">'+esc(e.heading)+'</span></header>';
 let content='';
 if(kind==='ledger'){
   content='<div class="exhibit-ledger"><div class="ledger-headings" aria-hidden="true"><span>Affected party</span><span>Economic consequence</span><span>Evidence status</span></div>'+e.rows.map(([party,impact,status],i)=>'<div class="ledger-line"><div class="ledger-party"><span class="ledger-no">'+String(i+1).padStart(2,'0')+'</span>'+esc(party)+'</div><div class="ledger-effect">'+esc(impact)+'</div><div class="ledger-status">'+esc(status)+'</div></div>').join('')+'</div>';
 }else if(kind==='cabinet'){
   const excerpt=specimen(source.finding||source.title||'');
   if(!excerpt)throw Error('Evidence Cabinet requires published source text: '+id);
   content='<div class="exhibit-cabinet"><div class="cabinet-record"><div class="cabinet-label">A LINE FROM THE PUBLISHED READING</div><blockquote>'+esc(excerpt)+'</blockquote><div class="cabinet-provenance">Verbatim excerpt · linked sources follow the reading</div></div><div class="cabinet-reading"><div class="cabinet-label">READER’S KEY</div><div class="cabinet-note">'+esc(e.key)+'</div><div class="cabinet-label">WHAT THIS CANNOT ESTABLISH</div><div class="cabinet-note">'+esc(e.limit)+'</div></div></div>';
 }else if(kind==='long'){
   content='<ol class="exhibit-longview" style="--stops:'+e.points.length+'">'+e.points.map(([when,desc,status])=>'<li class="longview-point"><span class="longview-date">'+esc(when)+'</span><span class="longview-event">'+esc(desc)+'</span><span class="longview-status">'+esc(status)+'</span></li>').join('')+'</ol>';
 }else throw Error('Unsupported exhibit kind '+kind);
 const footer='<footer class="exhibit-footer"><span>'+esc(e.curated?'Reading-specific editorial interpretation':'Published source excerpt · further editorial annotation pending')+'</span><span>See the evidence limits and sources below</span></footer>';
 return '<section class="reading-exhibit" data-exhibit-kind="'+kind+'" data-curated="'+e.curated+'" aria-label="'+esc(names[kind])+'">'+head+content+footer+'</section>';
}
function audit(ids){
 const sequence=ids.map(id=>select(id).kind);
 const frequency=sequence.reduce((acc,kind)=>(acc[kind]=(acc[kind]||0)+1,acc),{});
 const longRuns=[];
 for(let i=2;i<sequence.length;i++)if(sequence[i]===sequence[i-1]&&sequence[i]===sequence[i-2])longRuns.push({at:i,kind:sequence[i]});
 return {sequence,frequency,longRuns};
}
module.exports={catalog,names,specimen,select,render,audit};
