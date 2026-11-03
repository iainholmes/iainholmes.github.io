'use strict';
/* Historical v5 exhibit archive. Not used by the publishing renderer.
 * Current authored selections: editorial-decisions.json; renderer:
 * editorial-architecture.cjs. See docs/ll-editorial-architecture-v6.md. */
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
    "kind": "decision",
    "heading": "How should a border carbon charge be administered?",
    "intro": "A carbon border adjustment attempts to limit incentives to move emissions-intensive production abroad. Designing it requires balancing emissions coverage, trade friction and the burden of documenting embedded emissions.",
    "choice": "Regulators can prioritize breadth of coverage or simpler verifiable rules; the current WTO panel does not choose between them.",
    "options": [
      [
        "Broad emissions accounting",
        "More precise product-specific coverage could reduce circumvention, but increases verification burdens and disputes."
      ],
      [
        "Simpler default benchmarks",
        "Clear benchmarks may lower administrative costs, but could misclassify firms with unusually clean or dirty production."
      ]
    ],
    "check": "Compare measured import emissions, exporter compliance costs, supplier switching and international legal outcomes—not merely the filing of a dispute panel.",
    "note": "Illustrative administrative tradeoff, not a claim about an adopted EU reform."
  },
  "glyphosate": {
    "kind": "decision",
    "heading": "What should the next review measure?",
    "intro": "The interagency memorandum organizes a regulatory evidence-gathering process. The most consequential choice is not simply whether to collect more studies, but which uncertainty new evidence is designed to resolve.",
    "choice": "Prioritize different kinds of uncertainty before the next human-health assessment.",
    "options": [
      [
        "Real-world exposure",
        "Improve occupational and formulation-specific measurement; captures who encounters what, but requires careful field observation."
      ],
      [
        "Comparative alternatives",
        "Evaluate substitution into other herbicides and cultivation practices; reflects broader harms and costs, but involves more complex comparisons."
      ]
    ],
    "check": "Ask whether the new evidence could change an actual regulatory decision once uncertainty, alternatives and delay are considered.",
    "note": "Research priorities are examples, not new EPA mandates or established health findings."
  },
  "2026-10-02-green-spending": {
    "kind": "test",
    "heading": "Does spending itself slow growth?",
    "intro": "The paper finds a negative average short-run output response after econometrically constructed increases in environmental spending. The design is intended to separate unexpected policy changes from predictable fiscal choices, but that separation remains an identifying assumption.",
    "premise": "Residual spending shocks should reflect unexpected environmental expenditure rather than other shocks that were already affecting growth.",
    "stress": "Governments may increase or reclassify environmental spending during downturns, reconstruction, or changes in fiscal capacity. Those influences could enter both the shock measure and subsequent GDP growth.",
    "observe": "Check pre-trends, alternative spending classifications, country-specific estimates and whether results change when construction capacity, imports, or macroeconomic conditions are controlled.",
    "note": "Identification stress test — the average association is not a universal multiplier."
  },
  "2026-10-02-tax-bias": {
    "kind": "test",
    "heading": "Is debt deductibility the operative channel?",
    "intro": "A uniform corporate tax treatment can affect firms differently because leverage varies across industries. The paper combines empirical evidence with an equilibrium model that removes the debt tax advantage.",
    "premise": "Differences in debt use and emissions intensity help identify a financing distortion rather than simply reflecting unrelated industry characteristics.",
    "stress": "Capital intensity, regulation, risk, and access to credit can influence debt and emissions simultaneously. An economy-wide reform could also change prices and investment in ways the model must approximate.",
    "observe": "Compare otherwise similar firms, alternative emissions measures, and model predictions for sectors with different debt dependence. Distinguish observed corporate responses from modeled aggregate emissions.",
    "note": "Mechanism test — a model counterfactual is not an observed tax reform."
  },
  "2026-10-09-landslides": {
    "kind": "test",
    "heading": "Are neighboring households a credible comparison?",
    "intro": "A landslide damages households in a narrow physical path while nearby households on similar slopes may escape. The study uses detailed geography and follow-up surveys to make that local comparison informative.",
    "premise": "Absent the disaster, households just inside and just outside the path would have followed similar economic trajectories.",
    "stress": "Micro-geography, preexisting land values, household selection, and indirect disruption to nearby communities might differ systematically across the path boundary.",
    "observe": "Inspect pre-event balance, alternative nearby comparison groups, spillover checks, selective migration and the stability of estimates with spatially correlated uncertainty.",
    "note": "Spatial comparison provides evidence, but exposure was not randomly assigned."
  },
  "2026-10-09-climate-liability": {
    "kind": "decision",
    "heading": "What changes with the Court's jurisdictional answer?",
    "intro": "The pending case concerns whether state-law climate-damages claims may proceed, not whether the companies are liable for the alleged injuries. The legal forum determines which later economic questions can be litigated.",
    "choice": "Two procedural possibilities have different implications for where claims can be heard.",
    "options": [
      [
        "State-law claims may proceed",
        "Plaintiffs could continue pursuing evidence on causation and damages; no liability or compensation is yet established."
      ],
      [
        "Federal preemption prevails",
        "This route could constrain state-law recovery and shift attention toward federal standards or political remedies."
      ]
    ],
    "check": "Follow the holding, remand, later liability findings and eventual damages—not speculative market responses to oral argument.",
    "note": "Contingent legal pathways; not a prediction of the Court's judgment."
  },
  "2026-10-16-targeted-power": {
    "kind": "test",
    "heading": "Can the dataset detect the policy effect?",
    "intro": "A policy can matter enormously to a small subgroup and still barely move population-level averages. The study asks whether common survey sizes and variances provide enough statistical power to detect effects.",
    "premise": "A plausible first-stage change in the exposed subgroup must be large enough, after dilution, to register in the wider sample.",
    "stress": "Narrowing the sample increases exposure concentration but discards observations. Geographic clustering, imperfect treatment assignment, and heterogeneous effects can lower effective power further.",
    "observe": "Vary exposed-group prevalence, first-stage magnitude, outcome variance, significance level and effective sample size; examine minimum detectable effects before choosing a design.",
    "note": "Power exercise, not an estimated causal effect of the policy."
  },
  "2026-10-16-ferc-review": {
    "kind": "decision",
    "heading": "When should LNG work receive an individualized review?",
    "intro": "FERC's proposal creates authorization tiers for LNG-facility work. The economic challenge is deciding which projects are sufficiently routine to receive standardized treatment and which risks require closer scrutiny.",
    "choice": "The policy proposes different degrees of review intensity according to project attributes.",
    "options": [
      [
        "Categorical authorization",
        "Speeds repeatable low-change work within defined limits, but depends on thresholds that reliably capture material risks."
      ],
      [
        "Prior notice and review",
        "Allows review of more consequential capacity or facility changes, but adds delay and developer carrying costs."
      ]
    ],
    "check": "Measure actual permitting delay, compliance cost, emissions, safety events and investment—not just proposed review deadlines.",
    "note": "The three-tier proposal is not a final rule or an evaluated effect."
  },
  "2026-10-16-climate-vitals": {
    "kind": "test",
    "heading": "What does a record indicator actually prove?",
    "intro": "The report tracks many climate-system indicators, some measured annually and others through provisional year-to-date data. A new record is important evidence about the physical system, but it has a narrower interpretation than a welfare or causal-policy estimate.",
    "premise": "Comparable measurement definitions and sufficiently complete records must support a claim that an indicator reached a new extreme.",
    "stress": "Short or revised series, year-to-date comparisons, correlated indicators, and varying reporting frequencies can overstate the significance of a simple count of records.",
    "observe": "Compare common time windows, measurement revisions, uncertainty ranges and long-run trends. Assess regional exposure separately before translating global indicators into economic damages.",
    "note": "Physical monitoring does not identify policy-caused changes in welfare."
  },
  "2026-10-30-household-climate": {
    "kind": "test",
    "heading": "How much do modeled complements matter?",
    "intro": "The calibrated household-production model links rooftop solar to other clean equipment. Its policy simulations suggest that excluding solar raises the cost of meeting a fixed emissions objective.",
    "premise": "The model's substitution and complementarity patterns must approximate how real households would adopt technologies when subsidies change.",
    "stress": "Stated environmental preferences may correlate with wealth, ownership, access to rooftops or unobserved motivations. Estimated complementarities can shift under different grid emissions, credit constraints or landlord-tenant arrangements.",
    "observe": "Recompute the same 10% emissions-reduction target under alternative preferences and solar availability; compare out-of-sample adoption predictions with observed program responses.",
    "note": "Calibration and subsidy counterfactuals are not randomized treatment effects."
  },
  "2026-10-30-moves6": {
    "kind": "decision",
    "heading": "How should planners adopt a revised emissions model?",
    "intro": "A new model version can change whether a transport plan appears to satisfy an air-quality budget even before any road or vehicle changes. Adoption requires choices about the timing of new assumptions and the quality of local inputs.",
    "choice": "Planners can manage both model-version transition and local input quality; these are complementary implementation margins.",
    "options": [
      [
        "Use updated national defaults",
        "Offers a standardized baseline and timely conformity work, but may poorly match a locality's vehicle fleet or travel patterns."
      ],
      [
        "Strengthen local inputs",
        "May improve the relevance of forecasts, but requires resources, consistent documentation and comparable assumptions."
      ]
    ],
    "check": "Examine how results change under alternative fleet, travel and EV assumptions, while separating modeled changes from observed emissions.",
    "note": "Implementation analysis; a model update is not itself an emissions effect."
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
    "kind": "decision",
    "heading": "What turns climate-finance commitments into protection?",
    "intro": "The EIB has set a large adaptation-finance commitment. But more finance does not automatically translate into projects that reduce climate losses for vulnerable places.",
    "choice": "Project pipelines need both affordable capital and credible risk appraisal; neither alone guarantees useful adaptation.",
    "options": [
      [
        "Increase accessible capital",
        "Loans and guarantees may accelerate projects, but face additionality and crowding-out questions."
      ],
      [
        "Build bankable preparation",
        "Risk data, engineering and advisory work can improve selection, but do not by themselves finance completed infrastructure."
      ]
    ],
    "check": "Track completed investments, private finance mobilized net of displacement, and avoided disruption relative to credible no-project baselines.",
    "note": "Complementary implementation margins, not mutually exclusive spending choices."
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
    "plot": {
      "model": "market",
      "title": "Insurance costs and the housing market",
      "x": "Housing quantity Q →",
      "y": "Housing price P",
      "lines": [
        [
          "Housing demand · before higher insurance costs",
          [
            [
              0.12,
              0.91
            ],
            [
              0.34,
              0.76
            ],
            [
              0.57,
              0.55
            ],
            [
              0.87,
              0.23
            ]
          ]
        ],
        [
          "Housing demand · after higher insurance costs",
          [
            [
              0.08,
              0.74
            ],
            [
              0.3,
              0.58
            ],
            [
              0.55,
              0.35
            ],
            [
              0.78,
              0.14
            ]
          ]
        ],
        [
          "Housing supply",
          [
            [
              0.16,
              0.13
            ],
            [
              0.37,
              0.3
            ],
            [
              0.61,
              0.56
            ],
            [
              0.89,
              0.86
            ]
          ]
        ]
      ],
      "explain": "Conditional comparative statics: higher expected insurance expense may lower buyers' net bids, shifting housing demand inward. Equilibrium price and quantity depend on local supply elasticity; no capitalization coefficient is estimated by this diagram."
    },
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
    "plot": {
      "title": "Domestic demand and the world-fuel price",
      "x": "World fossil-fuel quantity Q →",
      "y": "World fuel price P",
      "lines": [
        [
          "Demand before policy",
          [
            [
              0.12,
              0.9
            ],
            [
              0.35,
              0.74
            ],
            [
              0.62,
              0.46
            ],
            [
              0.9,
              0.16
            ]
          ]
        ],
        [
          "Demand after policy",
          [
            [
              0.05,
              0.73
            ],
            [
              0.28,
              0.54
            ],
            [
              0.55,
              0.27
            ],
            [
              0.7,
              0.09
            ]
          ]
        ],
        [
          "World supply",
          [
            [
              0.14,
              0.11
            ],
            [
              0.33,
              0.29
            ],
            [
              0.6,
              0.59
            ],
            [
              0.89,
              0.87
            ]
          ]
        ]
      ],
      "explain": "A reduction in domestic fuel demand may shift world demand inward, reducing the world price and potentially increasing consumption elsewhere. The two equilibria are schematic, not empirical global-market estimates.",
      "model": "market"
    },
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
    "plot": {
      "title": "Storage entry and diminishing arbitrage value",
      "x": "Storage penetration →",
      "y": "Marginal value",
      "lines": [
        [
          "Private arbitrage return",
          [
            [
              0.06,
              0.91
            ],
            [
              0.27,
              0.76
            ],
            [
              0.5,
              0.52
            ],
            [
              0.73,
              0.3
            ],
            [
              0.95,
              0.14
            ]
          ]
        ],
        [
          "Other system value",
          [
            [
              0.06,
              0.78
            ],
            [
              0.29,
              0.71
            ],
            [
              0.55,
              0.58
            ],
            [
              0.77,
              0.47
            ],
            [
              0.95,
              0.39
            ]
          ]
        ]
      ],
      "explain": "Additional storage can compress price spreads that earn private arbitrage revenue, even while other system benefits remain. Curves illustrate possible feedback, not estimated marginal values or an optimal capacity."
    },
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
    "plot": {
      "title": "Transfers and the participation constraint",
      "x": "Carbon-policy ambition →",
      "y": "Net payoff from joining",
      "neutral": true,
      "lines": [
        [
          "Without compensation",
          [
            [
              0.06,
              0.77
            ],
            [
              0.33,
              0.56
            ],
            [
              0.56,
              0.35
            ],
            [
              0.78,
              0.21
            ],
            [
              0.95,
              0.1
            ]
          ]
        ],
        [
          "With transfers",
          [
            [
              0.06,
              0.94
            ],
            [
              0.33,
              0.81
            ],
            [
              0.56,
              0.67
            ],
            [
              0.78,
              0.51
            ],
            [
              0.95,
              0.36
            ]
          ]
        ]
      ],
      "explain": "Compensation can relax a participant's willingness-to-join constraint. Actual payoffs and feasible transfers depend on the calibrated model, trade exposure and agreement design."
    },
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
    "intervention": [
      "Public agencies",
      "Upstream prevention may change who ultimately bears costs"
    ],
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
    "plot": {
      "title": "Importer and exporter exposure to fuel shocks",
      "x": "Global fuel-price increase →",
      "y": "Terms-of-trade contribution",
      "neutral": true,
      "lines": [
        [
          "Net energy exporter",
          [
            [
              0.04,
              0.49
            ],
            [
              0.27,
              0.59
            ],
            [
              0.52,
              0.69
            ],
            [
              0.76,
              0.82
            ],
            [
              0.95,
              0.91
            ]
          ]
        ],
        [
          "Net energy importer",
          [
            [
              0.04,
              0.49
            ],
            [
              0.27,
              0.39
            ],
            [
              0.52,
              0.29
            ],
            [
              0.76,
              0.18
            ],
            [
              0.95,
              0.09
            ]
          ]
        ]
      ],
      "explain": "Opposing terms-of-trade channels can affect importers and exporters differently. Fiscal policy, quantities and growth responses are omitted; slopes are illustrative, not IMF estimates."
    },
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
const names=Object.freeze({ledger:'The Incidence Ledger',test:'The Assumption Test',decision:'The Decision Margin',long:'The Long View'});
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
 return {kind:'test',heading:'An uncurated reading',intro:'This reading has not yet received an editorial research test. The original finding appears here as a reference, not as a verified causal assertion.',premise:'An editorial assumption has not been assigned.',stress:'No claim-specific challenge has been approved.',observe:'See the source and Research Notebook for the original evidence.',note:'Editorial interpretation pending',id,curated:false};
}


/* Every qualitative Incidence Ledger gets a real economics diagram with
   axes, visibly differentiated curves, and no fictitious numeric scale. */
/* Schematic microeconomic graphs have no numeric ticks or estimated slopes.
   Only market diagrams with economically justified demand/supply shifts
   show notional equilibria. Other mechanisms remain transparently qualitative. */
function economicPlot(id){
 const p=visualData[id]?.plot;
 if(!p)return '';
 const X=x=>(70+x*480).toFixed(1),Y=y=>(222-y*168).toFixed(1);
 const d=pts=>pts.map(([x,y],i)=>(i?'L':'M')+X(x)+' '+Y(y)).join(' ');
 const lines=p.lines.map(([name,pts],i)=>'<path class="economic-curve economic-curve-'+i+'" d="'+d(pts)+'" aria-hidden="true"/>').join('');
 const neutral=p.neutral?'<line x1="70" y1="'+Y(.49)+'" x2="550" y2="'+Y(.49)+'" class="economic-neutral"/><text x="78" y="'+(Number(Y(.49))-7)+'" class="economic-neutral-label">neutral baseline</text>':'';
 const legend=p.lines.map(([name],i)=>'<span class="economic-legend-item"><i class="economic-legend-key economic-legend-key-'+i+'"></i>'+esc(name)+'</span>').join('');
 const alt=p.title+'. '+p.y+' against '+p.x+'. '+p.lines.map(([name])=>name).join('; ')+'. '+p.explain;
 let marks='';
 if(p.model==='market'){
   const crossing=(a,b,c,d)=>{
     const rx=b[0]-a[0],ry=b[1]-a[1],sx=d[0]-c[0],sy=d[1]-c[1],den=rx*sy-ry*sx;
     if(Math.abs(den)<1e-9)return null;
     const t=((c[0]-a[0])*sy-(c[1]-a[1])*sx)/den,u=((c[0]-a[0])*ry-(c[1]-a[1])*rx)/den;
     return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+t*rx,a[1]+t*ry]:null;
   };
   const intersect=(first,second)=>{
     for(let i=1;i<first.length;i++)for(let j=1;j<second.length;j++){
       const q=crossing(first[i-1],first[i],second[j-1],second[j]);
       if(q)return q;
     }
     return null;
   };
   const supply=p.lines[2]?.[1],demand0=p.lines[0]?.[1],demand1=p.lines[1]?.[1];
   if(!supply||!demand0||!demand1)throw Error('Incomplete authored market-shift graph '+id);
   const eq=[intersect(demand0,supply),intersect(demand1,supply)];
   if(eq.some(q=>!q))throw Error('Market equilibrium must be on actual authored curves '+id);
   marks=eq.map(([x,y],i)=>{
     const xx=X(x),yy=Y(y),index=i===0?'₀':'₁',offset=i===0?-14:15;
     return '<line x1="70" y1="'+yy+'" x2="'+xx+'" y2="'+yy+'" class="economic-eq-guide"/>'+
     '<line x1="'+xx+'" y1="'+yy+'" x2="'+xx+'" y2="222" class="economic-eq-guide"/>'+
     '<circle cx="'+xx+'" cy="'+yy+'" r="5.5" class="economic-eq-point economic-eq-point-'+i+'"/>'+
     '<text x="'+(Number(xx)+offset)+'" y="'+(Number(yy)-12)+'" class="economic-eq-label">E'+index+'</text>'+
     '<text x="58" y="'+(Number(yy)+4)+'" text-anchor="end" class="economic-eq-value">P'+index+'</text>'+
     '<text x="'+xx+'" y="240" text-anchor="middle" class="economic-eq-value">Q'+index+'</text>';
   }).join('');
   const tags=['D₀','D₁','S'];
   marks+=p.lines.map(([,pts],i)=>{
     const end=pts[pts.length-1],x=Number(X(end[0]))+8,y=Number(Y(end[1]))+(i===2?-4:4);
     return '<text x="'+x+'" y="'+y+'" class="economic-curve-label"> '+tags[i]+'</text>';
   }).join('');
 }
 return '<div class="economic-plot" data-economic-evidence="schematic" data-economic-model="'+esc(p.model||'qualitative')+'">'+
 '<div class="economic-plot-kicker">ECONOMIC GRAPH · CONCEPTUAL</div><h5>'+esc(p.title)+'</h5>'+
 '<div class="economic-y-axis">'+esc(p.y)+'</div>'+
 '<svg class="economic-plot-svg" viewBox="0 0 620 257" role="img" aria-label="'+esc(alt)+'" xmlns="http://www.w3.org/2000/svg">'+
 '<line x1="70" y1="54" x2="70" y2="222" class="economic-axis"/><line x1="70" y1="222" x2="550" y2="222" class="economic-axis"/>'+
 '<line x1="70" y1="139" x2="550" y2="139" class="economic-guide"/>'+neutral+lines+marks+'</svg>'+
 '<div class="economic-x-axis">'+esc(p.x)+'</div><div class="economic-legend">'+legend+'</div>'+
 '<p class="economic-plot-explain">'+esc(p.explain)+'</p>'+
 '<p class="economic-plot-status">Theoretical comparative statics · axes and intersections are illustrative, not fitted estimates</p></div>';
}
function graphic(id){
 const v=visualData[id];if(!v)return '';
 const label=v.type==='mechanism'?'ECONOMIC MODEL':v.type==='calculation'?'ECONOMIC ACCOUNTING':v.type==='decomposition'?'ESTIMATED DECOMPOSITION':'ECONOMIC FIGURE';
 const head='<div class="ledger-graphic-head"><span class="ledger-graphic-label">'+label+'</span><strong>'+esc(v.title)+'</strong></div>';
 const note='<figcaption class="ledger-graphic-note">'+esc(v.note)+'</figcaption>';
 let content='';
 if(v.type==='mechanism'){
   if(v.plot)content=economicPlot(id);
   else content='<div class="model-flow" role="img" aria-label="'+esc(v.title+'. '+v.stages.join('; ')+'. Conceptual transmission, no estimated magnitude.')+'">'+
      v.stages.map((stage,i)=>'<div class="model-stage"><span class="model-stage-number">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(stage)+'</strong></div>').join('<span class="model-connector" aria-hidden="true">→</span>')+'</div>'+
      '<p class="model-kind">Exposure and possible incidence · conceptual pathway, not a measured response</p>';
   if(v.intervention)content+='<div class="model-intervention"><span>'+esc(v.intervention[0])+'</span><p>'+esc(v.intervention[1])+'</p></div>';
 }else if(v.type==='calculation'){
   const [a,b,c]=v.terms;
   const min=Number(String(b[1]).split('–')[0]),max=Number(String(b[1]).split('–')[1]),base=Number(a[1]),total=base+max;
   const pct=n=>(100*n/total).toFixed(3)+'%';
   content='<div class="ledger-calculation" aria-label="'+esc(v.title)+'"><div><b>'+esc(a[1])+'</b><small>'+esc(a[0])+'</small></div><span class="calc-sign" aria-hidden="true">+</span><div><b>'+esc(b[1])+'</b><small>'+esc(b[0])+'</small></div><span class="calc-sign" aria-hidden="true">=</span><div class="calc-total"><b>'+esc(c[1])+'</b><small>'+esc(c[0])+'</small></div></div>'+
     '<div class="surplus-visual" role="img" aria-label="'+esc('Annual projected subtotal: '+a[1]+' billion in compliance savings plus '+b[1]+' billion energy-market surplus, equaling '+c[1]+' billion. Climate and health damages not fully included.')+'">'+
     '<div class="surplus-visual-title">COMPOSITION OF THE REPORTED SUBTOTAL</div>'+
     '<div class="surplus-band"><span class="surplus-fixed" style="width:'+pct(base)+'%"></span><span class="surplus-variable" style="width:'+pct(min)+'%"></span><span class="surplus-upper" style="width:'+pct(max-min)+'%"></span></div>'+
     '<div class="surplus-axis"><span>0</span><span>'+esc(base)+' · compliance</span><span>'+esc(c[1])+' · subtotal</span></div>'+
     '<div class="surplus-key"><span><i class="surplus-key-fixed"></i>Compliance savings</span><span><i class="surplus-key-variable"></i>Market surplus (range)</span></div></div>'+
     '<div class="ledger-units">'+esc(v.units)+'</div>';
 }else if(v.type==='decomposition'){
   const sum=v.components.reduce((n,row)=>n+row[1],0);
   const bars=v.components.map(([part,value],i)=>'<span class="decomp-part decomp-'+i+'" style="width:'+((value/sum)*100).toFixed(3)+'%"></span>').join('');
   content='<div class="decomp-metric"><strong>'+esc(v.roundedTotal)+'</strong><span>reported log-point price coefficient</span></div>'+
   '<div class="decomp-title">ESTIMATED CONTRIBUTIONS TO THE PRICE COEFFICIENT</div>'+
   '<div class="decomp-track" role="img" aria-label="'+esc(v.components.map(x=>x[0]+' '+x[1]+' log points').join('; '))+'">'+bars+'</div>'+
   '<div class="decomp-axis"><span>0</span><span>'+esc(sum.toFixed(1))+' log points (components)</span></div>'+
   '<div class="decomp-legend">'+v.components.map(([part,value],i)=>'<span><i class="decomp-key decomp-'+i+'"></i>'+esc(part)+' <b>'+esc(value)+' log points</b></span>').join('')+'</div>';
 }else{
   const rows=v.values||v.ranges||[],width=800,plotLeft=250,plotRight=660,range=plotRight-plotLeft;
   const low=v.min??0,high=v.max??Math.max(1,...rows.map(x=>Math.abs(x[1])));
   const x=value=>plotLeft+(value-low)/(high-low)*range;
   const zero=x(0),height=95+rows.length*74,axisY=height-34;
   const ticks=v.type==='bar'&&high===1.2?[0,.3,.6,.9,1.2]:v.type==='signed-bar'&&low===-10?[-10,0,10,20]:v.type==='range'&&high===100?[0,25,50,75,100]:Array.from({length:5},(_,i)=>low+(high-low)*i/4);
   const readable=n=>Number(n.toFixed(2)).toString();
   const grid=ticks.map(t=>'<line x1="'+x(t).toFixed(2)+'" y1="48" x2="'+x(t).toFixed(2)+'" y2="'+(axisY-8)+'" class="plot-grid'+(t===0?' plot-grid-zero':'')+'"/><text x="'+x(t).toFixed(2)+'" y="'+(height-12)+'" text-anchor="middle" class="plot-tick">'+readable(t)+'</text>').join('');
   const bars=rows.map((row,i)=>{
     const y=89+i*74,rangeType=v.type==='range',value=row[1],a=rangeType?row[1]:Math.min(0,value),b=rangeType?row[2]:Math.max(0,value);
     const begin=x(a),finish=x(b),mark=rangeType?readable(a)+'–'+readable(b)+'%':v.type==='signed-bar'?(value>0?'+':'')+readable(value)+'%':value.toFixed(2)+' pp';
     return '<line x1="'+plotLeft+'" y1="'+(y+23)+'" x2="'+plotRight+'" y2="'+(y+23)+'" class="plot-row-guide"/>'+
       '<text x="'+(plotLeft-20)+'" y="'+(y+4)+'" text-anchor="end" class="plot-label">'+esc(row[0])+'</text>'+
       '<rect x="'+Math.min(begin,finish).toFixed(2)+'" y="'+(y-19)+'" width="'+Math.max(2,Math.abs(finish-begin)).toFixed(2)+'" height="29" rx="2" class="plot-bar bar-'+i+'"/>'+
       '<text x="'+(plotRight+20)+'" y="'+(y+4)+'" class="plot-value">'+esc(mark)+'</text>';
   }).join('');
   content='<svg class="ledger-plot" viewBox="0 0 '+width+' '+height+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(v.title+'. '+rows.map(row=>row[0]+': '+(v.type==='range'?row[1]+' to '+row[2]:row[1])+' '+v.units).join('; '))+'">'+
     '<text x="'+plotLeft+'" y="28" class="plot-axis-title">'+esc(v.units)+'</text>'+grid+bars+
     '<line x1="'+plotLeft+'" y1="'+axisY+'" x2="'+plotRight+'" y2="'+axisY+'" class="plot-axis"/></svg>';
 }
 return '<figure class="ledger-graphic" data-visual-kind="'+esc(v.type)+'">'+head+content+note+'</figure>';
}
function graphicPlacement(id){return visualData[id]?.placement==='ledger'?'ledger':'interpretation';}
function render(id,source={}){
 const e=select(id),kind=e.kind;
 const head='<header class="exhibit-head"><strong>'+esc(names[kind])+'</strong><span class="exhibit-heading">'+esc(e.heading)+'</span></header>';
 const g=readingGuides[id];
 const primer=g?'<div class="exhibit-primer"><p>'+esc(g.intro)+'</p></div>':'';
 const term=g&&g.term?'<aside class="exhibit-concept"><strong>'+esc(g.term[0])+'</strong><span>'+esc(g.term[1])+'</span></aside>':'';

 let content='';
 if(kind==='ledger'){
   content=primer+'<div class="exhibit-ledger">'+(graphicPlacement(id)==='ledger'?'':graphic(id))+'<p class="ledger-how-to-read"><strong>How to read this</strong> '+esc(g?.read||'')+'</p><div class="ledger-headings" aria-hidden="true"><span>Affected party</span><span>Economic consequence</span><span>Evidence status</span></div>'+e.rows.map(([party,impact,status],i)=>'<div class="ledger-line"><div class="ledger-party"><span class="ledger-no">'+String(i+1).padStart(2,'0')+'</span>'+esc(party)+'</div><div class="ledger-effect">'+esc(impact)+'</div><div class="ledger-status">'+esc(status)+'</div></div>').join('')+(graphicPlacement(id)==='ledger'?graphic(id):'')+'</div>';
 }else if(kind==='test'){
   content='<p class="exhibit-introduction">'+esc(e.intro)+'</p><div class="test-research-question"><span class="exhibit-field-label">THE ASSUMPTION</span><p>'+esc(e.premise)+'</p></div><div class="test-challenge"><section><span class="exhibit-field-label">PRESS ON THE CLAIM</span><p>'+esc(e.stress)+'</p></section><section><span class="exhibit-field-label">WHAT WOULD HELP DECIDE?</span><p>'+esc(e.observe)+'</p></section></div><div class="test-scope">'+esc(e.note)+'</div>';
 }else if(kind==='decision'){
   content='<p class="exhibit-introduction">'+esc(e.intro)+'</p><div class="decision-question">'+esc(e.choice)+'</div><div class="decision-branches">'+e.options.map((option,i)=>'<section class="decision-option" data-path="'+(i+1)+'"><span class="decision-index">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(option[0])+'</strong><p>'+esc(option[1])+'</p></section>').join('')+'</div><div class="decision-criterion"><span class="exhibit-field-label">WHAT TO WATCH</span><p>'+esc(e.check)+'</p><small>'+esc(e.note)+'</small></div>';
 }else if(kind==='long'){
   const takeaway=longViewTakeaways[id];
   if(!takeaway)throw Error('Missing curated Long View interpretation '+id);
   if(!g||g.steps.length!==e.points.length)throw Error('Missing Long View guidance '+id);
   content=primer+'<div class="longview-guide"><span>THE SEQUENCE</span><span>'+esc(g.read)+'</span></div><ol class="exhibit-longview" data-stage-count="'+e.points.length+'" style="--longview-stages:'+e.points.length+'">'+e.points.map(([when,desc,status],i)=>{
     const statusType=/historical|observation|reported|policy date/i.test(status)?'observed':'conditional';
     return '<li class="longview-point" data-stage-class="'+statusType+'"><span class="longview-index">'+String(i+1).padStart(2,'0')+'</span><span class="longview-date">'+esc(when)+'</span><span class="longview-event">'+esc(desc)+'</span><span class="longview-status">'+esc(status)+'</span><p class="longview-explain">'+esc(g.steps[i])+'</p></li>';
   }).join('')+'</ol><div class="longview-takeaway"><span>WHY THIS MATTERS</span><p>'+esc(takeaway)+'</p></div>';
 }else throw Error('Unsupported exhibit kind '+kind);
 const footer=kind==='ledger'?'':'<footer class="exhibit-footer"><span>'+esc(e.curated?'Reading-specific editorial interpretation':'Editorial verification pending')+'</span><span>See the evidence limits and sources below</span></footer>';
 // The Ledger itself already names its economic concepts and evidence status.
 // Avoid repeating generic glossary/footer descriptors beneath its rows.
 return '<section class="reading-exhibit" data-exhibit-kind="'+kind+'" data-curated="'+e.curated+'" aria-label="'+esc(names[kind])+'">'+head+content+(kind==='ledger'?'':term)+footer+'</section>';
}
function audit(ids){
 const sequence=ids.map(id=>select(id).kind);
 const frequency=sequence.reduce((acc,kind)=>(acc[kind]=(acc[kind]||0)+1,acc),{});
 const longRuns=[];
 for(let i=2;i<sequence.length;i++)if(sequence[i]===sequence[i-1]&&sequence[i]===sequence[i-2])longRuns.push({at:i,kind:sequence[i]});
 return {sequence,frequency,longRuns};
}
module.exports={catalog,visualData,readingGuides,names,specimen,select,render,audit,graphic,graphicPlacement};
