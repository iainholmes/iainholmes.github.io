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
const visualData={
  "insurance": {
    "type": "mechanism",
    "title": "Housing-cost transmission",
    "stages": [
      "Insurance strain",
      "Higher user costs",
      "Location and prices"
    ],
    "note": "Conceptual spatial-equilibrium channel; not an estimated causal path."
  },
  "2026-10-02-policy-mix": {
    "type": "mechanism",
    "title": "Cross-border leakage channel",
    "stages": [
      "Domestic demand falls",
      "World fuel price adjusts",
      "Foreign fuel use responds"
    ],
    "note": "Qualitative mechanism from the policy framework; no estimated magnitude."
  },
  "2026-10-02-storage": {
    "type": "mechanism",
    "title": "The private–social return wedge",
    "stages": [
      "Storage entry",
      "Price spreads compress",
      "Private revenue declines"
    ],
    "note": "Price-feedback mechanism in the structural model, not a measured time series."
  },
  "2026-10-09-trade-climate": {
    "type": "mechanism",
    "title": "Terms-of-trade redistribution",
    "stages": [
      "Carbon price",
      "Trade prices shift",
      "Transfers enable bargains"
    ],
    "note": "Calibrated international-policy model, not observed agreement outcomes."
  },
  "2026-10-09-winter-bills": {
    "type": "signed-bar",
    "title": "Forecast household heating expenditure change",
    "units": "% versus previous winter",
    "min": -10,
    "max": 25,
    "values": [
      [
        "Heating oil",
        21
      ],
      [
        "Electricity",
        4
      ],
      [
        "Natural gas",
        -9
      ],
      [
        "Propane",
        -3
      ]
    ],
    "note": "EIA conditional winter forecasts; not observed household expenditures."
  },
  "2026-10-16-pfas-agriculture": {
    "type": "mechanism",
    "title": "Potential cost transmission",
    "stages": [
      "Contaminated inputs",
      "Farm exposure",
      "Testing and market costs"
    ],
    "note": "Conceptual pathway; article reports no estimated incidence magnitudes."
  },
  "2026-10-16-energy-macro": {
    "type": "mechanism",
    "title": "Energy-shock exposure",
    "stages": [
      "Fuel-price shock",
      "Importer or exporter",
      "Growth and inflation"
    ],
    "note": "Qualitative channel; IMF figures are conditional projections, not causal estimates."
  },
  "2026-10-23-paper-markups": {
    "type": "decomposition",
    "title": "Estimated price effect by channel",
    "components": [
      [
        "Marginal cost",
        17.7
      ],
      [
        "Markup",
        5.2
      ]
    ],
    "units": "log points",
    "roundedTotal": 23,
    "note": "Components sum to 22.9 log points; published price coefficient is rounded to 23. Study estimates, not an accounting identity."
  },
  "2026-10-23-mobility-finance": {
    "type": "range",
    "title": "Reported annual borrowing rates",
    "units": "%",
    "min": 0,
    "max": 100,
    "ranges": [
      [
        "Some African riders",
        45,
        90
      ],
      [
        "China",
        4,
        8
      ]
    ],
    "note": "Market observations from different contexts, not a controlled causal comparison."
  },
  "2026-10-30-coal-country": {
    "type": "bar",
    "title": "Estimated decline in mining employment",
    "values": [
      [
        "Mine records",
        0.94
      ],
      [
        "Labor statistics",
        1.15
      ]
    ],
    "units": "percentage points",
    "max": 1.2,
    "note": "Two estimated measures of mining-employment decline following a one-standard-deviation coal-demand shock; not additive."
  },
  "2026-10-30-methane-rule": {
    "type": "calculation",
    "title": "EPA’s projected annual surplus ledger",
    "terms": [
      [
        "Compliance savings",
        2.5
      ],
      [
        "Energy-market surplus",
        "0.2–0.3"
      ],
      [
        "Reported subtotal",
        "2.7–2.8"
      ]
    ],
    "units": "$ billion per year",
    "note": "Equivalent annual projections over 2027–2050, relative to the 2024-rule baseline. Extra emissions damages are not fully included: subtotal ≠ social welfare."
  }
};
const longViewTakeaways={
  "electrification": "Observed share, competitive potential and a future scenario are different objects; they should not be read as points on one forecast line.",
  "grid": "Project selection precedes commissioning. Projected network capability does not establish realized bill or reliability impacts.",
  "2026-10-02-amoc": "The long-horizon welfare loss is a scenario-based model counterfactual, not observed climate damage.",
  "2026-10-09-nuclear-finance": "Conditional financing, possible uprates and extended operation are distinct milestones, each contingent on the previous one.",
  "2026-10-23-vehicle-mix": "The observed shift in quarterly sales cannot, by itself, identify the effect of the expired vehicle credit.",
  "2026-10-23-emissions-gap": "Pathway requirements are not a forecast; the later temperature trajectory depends on abatement and carbon removal.",
  "2026-10-30-solar-storage": "Reported co-location is already increasing, but later-year shares reflect proposed projects rather than completed additions."
};
const names=Object.freeze({ledger:'The Incidence Ledger',cabinet:'The Source Dossier',long:'The Long View'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function specimen(source){
 const prose=plain(source);
 if(!prose)return '';
 // Skip early stops caused by abbreviations such as U.S. and abbreviatory
 // policy identifiers. The exact source substring remains unchanged.
 const ends=[...prose.matchAll(/[.!?](?=\s|$)/g)];
 const stop=ends.find(x=>x.index>=45)||ends.at(-1);
 return stop?prose.slice(0,stop.index+1):prose;
}
function select(id){
 const entry=catalog[id];
 if(entry)return {...entry,id,curated:true};
 // Safe future fallback: only repeat the direct published lead, never
 // infer distributional outcomes or construct imaginary dated milestones.
 return {kind:'cabinet',heading:'The published record',key:'The published finding is reproduced here for close examination.',limit:'This excerpt alone is not an independently identified causal claim.',id,curated:false};
}

function graphic(id){
 const v=visualData[id];if(!v)return '';
 const head='<div class="ledger-graphic-head"><span class="ledger-graphic-label">ECONOMIC FIGURE</span><strong>'+esc(v.title)+'</strong></div>';
 const note='<p class="ledger-graphic-note">'+esc(v.note)+'</p>';
 let content='';
 if(v.type==='mechanism'){
   content='<div class="ledger-mechanism" aria-label="'+esc(v.title)+' — conceptual model">'+v.stages.map((label,i)=>'<div class="mechanism-node"><span class="mechanism-index">'+String(i+1).padStart(2,'0')+'</span><span>'+esc(label)+'</span></div>').join('<span class="mechanism-arrow" aria-hidden="true">→</span>')+'</div>';
 }else if(v.type==='calculation'){
   const [a,b,c]=v.terms;
   content='<div class="ledger-calculation" aria-label="'+esc(v.title)+'"><div><b>'+esc(a[1])+'</b><small>'+esc(a[0])+'</small></div><span class="calc-sign">+</span><div><b>'+esc(b[1])+'</b><small>'+esc(b[0])+'</small></div><span class="calc-sign">=</span><div class="calc-total"><b>'+esc(c[1])+'</b><small>'+esc(c[0])+'</small></div></div><div class="ledger-units">'+esc(v.units)+'</div>';
 }else if(v.type==='decomposition'){
   const sum=v.components.reduce((a,x)=>a+x[1],0);
   const segments=v.components.map(([label,val],i)=>'<div class="decomp-part decomp-'+i+'" style="width:'+((val/sum)*100).toFixed(3)+'%" title="'+esc(label+': '+val+' log points')+'"></div>').join('');
   content='<div class="decomp-metric"><strong>'+esc(v.roundedTotal)+'</strong><span>reported log-point price coefficient</span></div><div class="decomp-track" role="img" aria-label="'+esc(v.components.map(x=>x[0]+': '+x[1]+' log points').join(', '))+'">'+segments+'</div><div class="decomp-legend">'+v.components.map(([label,val],i)=>'<span><i class="decomp-key decomp-'+i+'"></i>'+esc(label)+' <b>'+esc(val)+'</b></span>').join('')+'</div>';
 }else{
   // All quantitative visuals use a zero-based or signed linear scale. Figures
   // come only from source-verified, explicit visualData above.
   const width=520, plotLeft=185, plotRight=465, length=plotRight-plotLeft, rows=(v.values||v.ranges||[]);
   const low=v.min??0,high=v.max??Math.max(1,...rows.map(x=>Math.abs(x[1])));
   const px=value=>plotLeft+((value-low)/(high-low))*length;
   const zero=px(0), height=58+rows.length*43;
   const base='<line x1="'+zero.toFixed(1)+'" y1="28" x2="'+zero.toFixed(1)+'" y2="'+(height-20)+'" class="plot-zero" />';
   const items=rows.map((row,i)=>{
     const y=49+i*43, label=esc(row[0]),range=v.type==='range',value=row[1];
     const min=range?row[1]:Math.min(0,value),max=range?row[2]:Math.max(0,value);
     const x=px(min),right=px(max);
     const rect='<rect x="'+x.toFixed(2)+'" y="'+(y-13)+'" width="'+Math.max(1,right-x).toFixed(2)+'" height="16" rx="2" class="plot-bar bar-'+i+'"/>';
     const printed=range?row[1]+'–'+row[2]+'%':(v.type==='signed-bar'?(value>0?'+':'')+value+'%':value.toFixed(2)+' pp');
     return '<text x="'+(plotLeft-12)+'" y="'+y+'" text-anchor="end" class="plot-label">'+label+'</text>'+rect+'<text x="'+Math.min(width-4,Math.max(12,right+7)).toFixed(1)+'" y="'+(y+1)+'" class="plot-value">'+esc(printed)+'</text>';
   }).join('');
   content='<svg class="ledger-plot" viewBox="0 0 '+width+' '+height+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(v.title+'. '+rows.map(x=>x[0]+': '+(v.type==='range'?x[1]+' to '+x[2]:x[1])+' '+v.units).join('; '))+'">'+base+items+'</svg><div class="ledger-units">'+esc(v.units)+'</div>';
 }
 return '<figure class="ledger-graphic" data-visual-kind="'+esc(v.type)+'">'+head+content+note+'</figure>';
}
function render(id,source={}){
 const e=select(id),kind=e.kind;
 const head='<header class="exhibit-head"><div class="exhibit-kicker">FROM THE ANNEX</div><strong>'+esc(names[kind])+'</strong><span class="exhibit-heading">'+esc(e.heading)+'</span></header>';
 let content='';
 if(kind==='ledger'){
   content='<div class="exhibit-ledger">'+graphic(id)+'<div class="ledger-headings" aria-hidden="true"><span>Affected party</span><span>Economic consequence</span><span>Evidence status</span></div>'+e.rows.map(([party,impact,status],i)=>'<div class="ledger-line"><div class="ledger-party"><span class="ledger-no">'+String(i+1).padStart(2,'0')+'</span>'+esc(party)+'</div><div class="ledger-effect">'+esc(impact)+'</div><div class="ledger-status">'+esc(status)+'</div></div>').join('')+'</div>';
 }else if(kind==='cabinet'){
   const excerpt=specimen(source.finding||source.title||'');
   if(!excerpt)throw Error('Evidence Cabinet requires published source text: '+id);
   content='<div class="exhibit-cabinet"><div class="cabinet-record"><div class="cabinet-label">FROM THE PUBLISHED READING</div><blockquote>'+esc(excerpt)+'</blockquote><div class="cabinet-provenance">Verbatim editorial excerpt · source citations follow below</div></div><div class="cabinet-reading"><section class="dossier-note"><div class="cabinet-label">WHAT SUPPORTS IT</div><p class="cabinet-note">'+esc(e.key)+'</p></section><section class="dossier-note"><div class="cabinet-label">WHERE THE CLAIM STOPS</div><p class="cabinet-note">'+esc(e.limit)+'</p></section></div></div>';
 }else if(kind==='long'){
   const takeaway=longViewTakeaways[id];
   if(!takeaway)throw Error('Missing curated Long View interpretation '+id);
   content='<div class="longview-guide"><span>FOLLOW THE SEQUENCE</span><span>Each stop identifies what is observed or conditional</span></div><ol class="exhibit-longview">'+e.points.map(([when,desc,status],i)=>{
     const statusType=/historical|observation|reported|policy date/i.test(status)?'observed':'conditional';
     return '<li class="longview-point" data-stage-class="'+statusType+'"><span class="longview-index">'+String(i+1).padStart(2,'0')+'</span><span class="longview-date">'+esc(when)+'</span><span class="longview-event">'+esc(desc)+'</span><span class="longview-status">'+esc(status)+'</span></li>';
   }).join('')+'</ol><div class="longview-takeaway"><span>THE POINT</span><p>'+esc(takeaway)+'</p></div>';
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
module.exports={catalog,visualData,names,specimen,select,render,audit,graphic};
