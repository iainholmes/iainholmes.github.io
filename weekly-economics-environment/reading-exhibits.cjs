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

/* Authored reading primers: accessible from the exhibit before the full story. */
const readingGuides={
  "electrification": {
    "intro": "Electrification means using electricity to provide services such as transport and heating that often depend on direct fuel combustion. The three percentages below describe different questions: what happens now, what appears economical with current technology, and what could happen under a particular future scenario.",
    "read": "Do not interpret 23%, 33%, and 35% as three measurements of the same trend. Only the first is an observed share.",
    "term": [
      "Final energy",
      "Energy delivered to end users, rather than the amount of fuel used to generate electricity."
    ],
    "steps": [
      "The starting point measures electricity's actual share of energy delivered to end users. It does not count every service that could be electrified economically.",
      "The study asks how much larger electricity's role might be if cost-competitive switching opportunities were fully adopted. Financing and incentives can prevent those switches, so this is not the observed present.",
      "The 2035 figure depends on the report's assumed adoption and power-system changes. It is an internally consistent scenario, not a promise that the share will reach 35%."
    ]
  },
  "grid": {
    "intro": "An electricity grid can have plenty of generating plants yet still struggle to move power from where it is produced to where it is needed. Grid upgrades may relieve those bottlenecks, but an announced project is several steps away from an actual change in consumer bills.",
    "read": "Follow the distinction between a selected investment, its expected engineering capacity, and eventual measured economic outcomes.",
    "term": [
      "GW",
      "Gigawatts: a measure of power capacity, not electricity generated over time or dollars saved."
    ],
    "steps": [
      "DOE's selection announcement identifies the intended group of projects and funding support. It does not mean that construction, financing, permitting, or interconnection are complete.",
      "Engineering studies project that the investments could make more transmission capability available. The reported gigawatts describe potential network capacity, not new power plants or guaranteed usage.",
      "Only after the projects operate can analysts compare dispatch, congestion, reliability, prices, and costs with a credible counterfactual. That last evaluation has not happened in this report."
    ]
  },
  "2026-10-02-amoc": {
    "intro": "The Atlantic Meridional Overturning Circulation (AMOC) is an ocean circulation system that helps redistribute heat. This study does not observe a future collapse; it asks what would happen to economic welfare if such a collapse occurred in a long-run model of climate, geography, trade, and migration.",
    "read": "The milestones are steps inside a model comparison, not a prediction that a collapse will occur by a specified date.",
    "term": [
      "Counterfactual",
      "A modeled alternative world used for comparison; neither path is an observed future."
    ],
    "steps": [
      "The researchers first establish a warming scenario in which the circulation continues. Economic welfare under this path is the benchmark, not a world without climate change.",
      "They then introduce an AMOC collapse into the model. Changing regional temperature patterns affects where it is attractive or productive to live and work, creating further adjustments through migration and trade.",
      "The 1.9% figure compares modeled global welfare under collapse with welfare under warming without collapse in the specified scenario by 2200. It is not an observed loss and remains sensitive to modeling assumptions."
    ]
  },
  "2026-10-09-nuclear-finance": {
    "intro": "A nuclear 'uprate' increases electrical output from an existing reactor without building an entirely new station. Federal financing could help fund those modifications, but an initial loan commitment, construction, and decades of future operation are different decisions.",
    "read": "Each step depends on legal, engineering, financing, and regulatory conditions that have not all been met.",
    "term": [
      "Uprate",
      "An engineered increase in the output capability of an existing generating unit."
    ],
    "steps": [
      "DOE's conditional commitment describes potential financing. The proposal may still change or fail to close after further diligence and agreements.",
      "The proposed plant modifications could add 433 MW of capacity across the sites. This is engineering capability if the projects proceed, not production already reaching the grid.",
      "Keeping reactors open twenty additional years requires investment, licenses, and other conditions. The longer operating life is a plan, not a measured future outcome."
    ]
  },
  "2026-10-23-vehicle-mix": {
    "intro": "A tax credit can change when people buy vehicles as well as which powertrains they choose. But the number of new hybrids or electric cars sold in a quarter is not the same as the composition of all vehicles already on the road.",
    "read": "Read the first stop as a policy date, the second as a sales observation, and the third as the slower adjustment of the vehicle stock.",
    "term": [
      "Stock versus flow",
      "New vehicle sales are a flow; the cars and trucks already in service make up the much larger stock."
    ],
    "steps": [
      "The federal credits ended on September 30, 2025. Buyers may have advanced some purchases before that date, but the expiration alone does not establish how much of the later change it caused.",
      "In the third quarter of 2026, hybrid, battery-electric, and plug-in hybrid vehicles together accounted for 23% of new light-duty sales. The composition shifted toward conventional hybrids.",
      "Older vehicles remain in service for years. Even a pronounced shift in this quarter's new sales reaches the total fleet gradually, so energy demand and emissions do not change one-for-one with sales shares."
    ]
  },
  "2026-10-23-emissions-gap": {
    "intro": "Climate 'overshoot' means temperatures temporarily rise above a target before potentially returning below it. This timeline is a model pathway describing the emissions cuts and later carbon removal needed to limit overshoot; it is not an official forecast of what governments will actually achieve.",
    "read": "The percentages are cumulative reductions from the 2025 emissions reference level, not consecutive cuts to be added together.",
    "term": [
      "Overshoot",
      "A period above a temperature threshold, followed by a possible return toward it under future mitigation and carbon removal."
    ],
    "steps": [
      "The pathway begins with emissions in 2025 as a common numerical reference. This starting point is needed to interpret subsequent percentage reductions.",
      "By 2030, the model pathway requires emissions to be 18% lower than in 2025. This is an emissions requirement of the scenario, not a report that the reduction has already happened.",
      "By 2040, the same pathway requires 69% lower emissions than in 2025. The 69% already incorporates the earlier change; it should not be added to 18%.",
      "Even with steep cuts, warming may peak above 1.5°C before returning toward it later in the century. This trajectory depends on large-scale mitigation and carbon removal actually occurring."
    ]
  },
  "2026-10-30-solar-storage": {
    "intro": "Co-location means building a battery at the same project as a solar generating facility. Instead of selling all solar output when the sun shines, the combined project can store some electricity and deliver it later. The key statistic here is the share of *new solar capacity* installed with an operating battery.",
    "read": "The early stops are reported additions; the final stops depend on projects still in the development pipeline.",
    "term": [
      "Co-located",
      "Solar generating capacity and battery storage operating together at the same site."
    ],
    "steps": [
      "In 2017, pairing new utility-scale solar with storage was relatively uncommon: the reported share of added capacity was about 2%.",
      "Through September 2026, more than 16% of solar capacity added was paired with an operating battery. This is evidence of rising adoption, not a measured estimate of the technology's financial benefits.",
      "Projects planned for the remaining months of 2026 could lift the full-year share to 19%. Because these are reported plans, the final observed percentage could differ.",
      "Planned 2027–2028 projects imply shares above 30%. Some projects may be delayed, resized, canceled, or reconfigured, so the future bars are not established installations."
    ]
  },
  "insurance": {
    "intro": "Insurance 'strain' can show up through unaffordable premiums, limited availability, or weak insurer finances. These pressures need not line up exactly with mapped natural hazards. The central economic question is how the added cost of insuring a home is eventually borne.",
    "read": "The arrows depict possible economic adjustments, not three measured causal treatment effects.",
    "term": [
      "Capitalization",
      "When expected future costs or benefits become reflected in the price of an asset such as a home."
    ]
  },
  "2026-10-02-policy-mix": {
    "intro": "A carbon price imposed in one country can affect fossil-fuel markets elsewhere. Reducing domestic demand may lower the world fuel price and make consumption cheaper abroad, offsetting some domestic emissions savings. The Ledger separates those market channels.",
    "read": "The diagram is qualitative: no leakage percentage or distributional total is estimated by this graphic.",
    "term": [
      "Leakage",
      "An emissions change outside the regulating jurisdiction that offsets part of the policy's domestic reduction."
    ]
  },
  "2026-10-02-storage": {
    "intro": "Battery storage can buy electricity when prices are low and sell when prices are high. But as more storage enters, it reduces the very price gaps that pay storage owners. That means the investment's private revenue can move differently from its value to consumers and the wider electricity system.",
    "read": "These are model-based price-feedback channels, not three quantities to add together.",
    "term": [
      "Arbitrage spread",
      "The difference between prices at times when electricity is bought and sold, before accounting for costs and losses."
    ]
  },
  "2026-10-09-trade-climate": {
    "intro": "International carbon pricing creates winners and losers through trade prices, even before accounting for climate benefits. A policy can improve aggregate welfare and still fail to secure cooperation if exporting countries expect concentrated losses.",
    "read": "The schematic separates who faces the price change from how transfers might alter the incentive to join an agreement.",
    "term": [
      "Terms of trade",
      "The price of what a country sells abroad relative to what it buys from other countries."
    ]
  },
  "2026-10-09-winter-bills": {
    "intro": "Households do not all heat their homes with the same fuel. A forecast winter spending change reflects expected prices, weather-driven energy use, and the type of heating equipment a household owns. One national average would hide these sharply different burdens.",
    "read": "Bars above zero indicate forecast spending increases; bars below zero indicate decreases, each relative to the previous winter. These are conditional forecasts, not observed bills.",
    "term": [
      "Expenditure versus price",
      "Spending changes when either the price of energy or the quantity used changes."
    ]
  },
  "2026-10-16-pfas-agriculture": {
    "intro": "PFAS can reach farms through water and other materials supplied from outside agriculture. The farm may incur testing, market, or remediation costs even if it did not create the contamination. This is an environmental-incidence problem: the source of pollution and the party bearing the cost differ.",
    "read": "The arrows show plausible exposure and cost transmission; no quantified farm-loss estimate is supplied by the article.",
    "term": [
      "Incidence",
      "Who ultimately bears a cost, which may differ from who first pays or who caused it."
    ]
  },
  "2026-10-16-energy-macro": {
    "intro": "An increase in world energy prices does not hit every economy the same way. Countries that purchase fuel abroad face higher input bills, while those selling it may receive higher export income. Governments and households then adjust through prices, spending, inventories, and fiscal support.",
    "read": "This mechanism explains why a common energy shock can be associated with different macroeconomic outcomes. It is not a causal cross-country estimate.",
    "term": [
      "Net energy importer",
      "A country that buys more energy from abroad than it sells; exporters face a different terms-of-trade exposure."
    ]
  },
  "2026-10-23-paper-markups": {
    "intro": "When pollution rules become stricter, regulated firms may face higher production costs. But they can also gain market power if competition weakens. This study separates those two channels in the price response rather than assuming the entire increase is compliance cost.",
    "read": "The 17.7 and 5.2 log-point components add to 22.9 log points, rounding to the reported 23-log-point price coefficient. That decomposition is distinct from the study's roughly 5.6% markup estimate.",
    "term": [
      "Markup",
      "The amount by which a firm's selling price exceeds its marginal production cost, expressed according to the study's estimation method."
    ]
  },
  "2026-10-23-mobility-finance": {
    "intro": "A motorcycle or three-wheeler that is cheaper to operate can still be unaffordable if buyers face extremely expensive loans. Credit terms can therefore block adoption even when fuel savings make the vehicle attractive in the long run.",
    "read": "The two intervals show reported annual borrowing-rate ranges in different market contexts. They are not an estimate of what moving a borrower between markets would cause.",
    "term": [
      "Financing wedge",
      "The added cost or constraint created when upfront capital is difficult or expensive to borrow."
    ]
  },
  "2026-10-30-coal-country": {
    "intro": "A loss of demand for coal first hits mines, but workers and firms outside mining can also be affected. Less mine activity can reduce local transport business, public revenue, housing demand, and incentives to move into the region.",
    "read": "The two bars report alternative estimates of the *mining-employment* decline, measured in percentage points. They are not two separate losses that should be added together, and they do not quantify total regional spillovers.",
    "term": [
      "Percentage point",
      "The arithmetic difference between two rates: a change from 5% to 4% is a decline of 1 percentage point."
    ]
  },
  "2026-10-30-methane-rule": {
    "intro": "EPA's proposed relaxation of parts of its methane rule may save firms compliance resources and change energy-market outcomes. But a regulatory cost saving is not automatically a net benefit to society if the change also increases emissions and their external damages.",
    "read": "The equation reproduces EPA's projected annual accounting subtotal relative to its 2024-rule baseline. It omits some climate and health damages; the result should not be called total social welfare.",
    "term": [
      "External damage",
      "A cost borne by others, such as climate or health harm, that is not fully included in the private market transaction."
    ]
  }
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
 const head='<header class="exhibit-head"><strong>'+esc(names[kind])+'</strong><span class="exhibit-heading">'+esc(e.heading)+'</span></header>';
 const g=readingGuides[id];
 const primer=g?'<div class="exhibit-primer"><p>'+esc(g.intro)+'</p></div>':'';
 const term=g&&g.term?'<aside class="exhibit-concept"><strong>'+esc(g.term[0])+'</strong><span>'+esc(g.term[1])+'</span></aside>':'';

 let content='';
 if(kind==='ledger'){
   content=primer+'<div class="exhibit-ledger">'+graphic(id)+'<p class="ledger-how-to-read"><strong>How to read this</strong> '+esc(g?.read||'')+'</p><div class="ledger-headings" aria-hidden="true"><span>Affected party</span><span>Economic consequence</span><span>Evidence status</span></div>'+e.rows.map(([party,impact,status],i)=>'<div class="ledger-line"><div class="ledger-party"><span class="ledger-no">'+String(i+1).padStart(2,'0')+'</span>'+esc(party)+'</div><div class="ledger-effect">'+esc(impact)+'</div><div class="ledger-status">'+esc(status)+'</div></div>').join('')+'</div>';
 }else if(kind==='cabinet'){
   const excerpt=specimen(source.finding||source.title||'');
   if(!excerpt)throw Error('Evidence Cabinet requires published source text: '+id);
   content='<div class="exhibit-cabinet"><div class="cabinet-record"><div class="cabinet-label">FROM THE PUBLISHED READING</div><blockquote>'+esc(excerpt)+'</blockquote><div class="cabinet-provenance">Verbatim editorial excerpt · source citations follow below</div></div><div class="cabinet-reading"><section class="dossier-note"><div class="cabinet-label">WHAT SUPPORTS IT</div><p class="cabinet-note">'+esc(e.key)+'</p></section><section class="dossier-note"><div class="cabinet-label">WHERE THE CLAIM STOPS</div><p class="cabinet-note">'+esc(e.limit)+'</p></section></div></div>';
 }else if(kind==='long'){
   const takeaway=longViewTakeaways[id];
   if(!takeaway)throw Error('Missing curated Long View interpretation '+id);
   if(!g||g.steps.length!==e.points.length)throw Error('Missing Long View guidance '+id);
   content=primer+'<div class="longview-guide"><span>THE SEQUENCE</span><span>'+esc(g.read)+'</span></div><ol class="exhibit-longview">'+e.points.map(([when,desc,status],i)=>{
     const statusType=/historical|observation|reported|policy date/i.test(status)?'observed':'conditional';
     return '<li class="longview-point" data-stage-class="'+statusType+'"><span class="longview-index">'+String(i+1).padStart(2,'0')+'</span><span class="longview-date">'+esc(when)+'</span><span class="longview-event">'+esc(desc)+'</span><span class="longview-status">'+esc(status)+'</span><p class="longview-explain">'+esc(g.steps[i])+'</p></li>';
   }).join('')+'</ol><div class="longview-takeaway"><span>WHY THIS MATTERS</span><p>'+esc(takeaway)+'</p></div>';
 }else throw Error('Unsupported exhibit kind '+kind);
 const footer='<footer class="exhibit-footer"><span>'+esc(e.curated?'Reading-specific editorial interpretation':'Published source excerpt · further editorial annotation pending')+'</span><span>See the evidence limits and sources below</span></footer>';
 return '<section class="reading-exhibit" data-exhibit-kind="'+kind+'" data-curated="'+e.curated+'" aria-label="'+esc(names[kind])+'">'+head+content+term+footer+'</section>';
}
function audit(ids){
 const sequence=ids.map(id=>select(id).kind);
 const frequency=sequence.reduce((acc,kind)=>(acc[kind]=(acc[kind]||0)+1,acc),{});
 const longRuns=[];
 for(let i=2;i<sequence.length;i++)if(sequence[i]===sequence[i-1]&&sequence[i]===sequence[i-2])longRuns.push({at:i,kind:sequence[i]});
 return {sequence,frequency,longRuns};
}
module.exports={catalog,visualData,readingGuides,names,specimen,select,render,audit,graphic};
