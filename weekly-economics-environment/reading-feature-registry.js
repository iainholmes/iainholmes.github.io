/* Canonical editorial vocabulary and evidence-led selection gate. No keyword/rotation selection. */
(function(root){'use strict';
const features=[
  {
    "id": "why-it-matters",
    "name": "Why It Matters",
    "group": "editorial",
    "purpose": "Explains why the result matters for decisions, institutions, or welfare. Its boundary is practical significance: it does not attempt to establish an identification strategy or trace every market adjustment.",
    "when": "Use when the consequence is not already evident from the opening finding.",
    "signals": [
      "stakes",
      "policy",
      "welfare",
      "decision"
    ],
    "example": [
      "Why it matters"
    ]
  },
  {
    "id": "economic-interpretation",
    "name": "Economic Interpretation",
    "group": "editorial",
    "purpose": "Explains incentives, constraints, equilibrium responses and economic mechanisms. Its boundary is prose-based economic reasoning; an explicit multi-step diagram belongs in The Mechanism Map.",
    "when": "Use for an economic mechanism that can be distinguished from the source's direct finding.",
    "signals": [
      "mechanism",
      "incentives",
      "substitution",
      "equilibrium",
      "externality"
    ],
    "example": [
      "Economic interpretation"
    ]
  },
  {
    "id": "evidence-limits",
    "name": "What the Evidence Does—and Does Not—Say",
    "group": "editorial",
    "purpose": "States design, measurement, uncertainty and identification limits. Its boundary is the overall inferential reach of data and design, rather than the intensive test of a single assumption.",
    "when": "Use whenever empirical evidence could otherwise be mistaken for a stronger causal or general claim.",
    "signals": [
      "empirical",
      "causal",
      "measurement",
      "uncertainty",
      "identification"
    ],
    "example": [
      "What the evidence does"
    ]
  },
  {
    "id": "research-notebook",
    "name": "In the Research Notebook",
    "group": "editorial",
    "purpose": "Connects a result to a reusable method, estimand or research question. Its boundary is transferable research literacy; a formal study-specific empirical model belongs at The Estimation Desk.",
    "when": "Use when a methodological takeaway improves understanding without repeating the issue-level Methods & Concepts.",
    "signals": [
      "method",
      "model",
      "estimand",
      "research"
    ],
    "example": [
      "Research Notebook"
    ]
  },
  {
    "id": "incidence-ledger",
    "name": "The Incidence Ledger",
    "group": "special",
    "purpose": "Traces who pays, who gains, who adjusts, and how burdens are distributed. Its boundary is distribution across affected parties and the strength of supporting evidence, not a plotted theoretical curve or the policymaker's choice set.",
    "when": "Use when heterogeneous effects or incidence can be supported by specific evidence or explicitly qualified economic reasoning.",
    "signals": [
      "incidence",
      "distribution",
      "welfare",
      "burden",
      "beneficiaries"
    ],
    "example": [
      "Incidence Ledger"
    ]
  },
  {
    "id": "long-view",
    "name": "The Long View",
    "group": "special",
    "purpose": "Places a finding against a defensible longer-run baseline, trend, or time horizon. Its boundary is temporal comparability, historical context and appropriately separated scenario versus observation.",
    "when": "Use with comparable longitudinal evidence or a clearly identified scenario, not merely to add historical atmosphere.",
    "signals": [
      "history",
      "trend",
      "long-run",
      "scenario"
    ],
    "example": [
      "The Long View"
    ]
  },
  {
    "id": "decision-margin",
    "name": "The Decision Margin",
    "group": "special",
    "purpose": "Isolates the behavioral or policy choice at which incentives change. Its boundary is the immediate choice set, opportunity cost and behavioral threshold, not the ultimate distribution of burdens.",
    "when": "Use when the relevant alternative, constraint, or threshold can be stated clearly.",
    "signals": [
      "margin",
      "choice",
      "tradeoff",
      "threshold"
    ],
    "example": [
      "The Decision Margin"
    ]
  },
  {
    "id": "heron",
    "name": "The Heron",
    "group": "special",
    "purpose": "An occasional methodological companion that probes an assumption or interpretation. Its boundary is an optional concise methodological aside; it should not replace a substantive sensitivity analysis.",
    "when": "Use sparingly, only when a pointed methodological question adds value and a sourced, concise answer is available.",
    "signals": [
      "assumption",
      "method",
      "identification"
    ],
    "example": [
      "The Heron"
    ]
  },
  {
    "id": "assumption-test",
    "name": "The Assumption Test",
    "group": "special",
    "purpose": "Shows which assumptions a finding or model depends upon and what would change if they failed. Its boundary is one consequential premise, its plausible violation and how that alters interpretation—not a generic list of limitations.",
    "when": "Use for important, testable or sensitivity-relevant assumptions; do not imply that a test has been run unless it has.",
    "signals": [
      "assumption",
      "sensitivity",
      "model",
      "identification"
    ],
    "example": [
      "Assumption Test"
    ]
  },
  {
    "id": "estimation-desk",
    "name": "The Estimation Desk",
    "group": "special",
    "purpose": "Explains a consequential econometric specification or economic model, defines its terms and estimand or objective, and separates interpretation from identification. Its boundary is formal analytical structure: reported equations, reconstructed notation, illustrative theory and proposed designs must be distinguished.",
    "when": "Use only when a model or empirical specification genuinely illuminates the study; label theoretical, proposed, estimated and illustrative equations accurately. Never invent estimates, standard errors or results.",
    "signals": [
      "econometrics",
      "regression",
      "estimation",
      "specification",
      "identification",
      "estimand"
    ],
    "example": [
      "Estimation Desk"
    ]
  },
  {
    "id": "mechanism-map",
    "name": "The Mechanism Map",
    "group": "special",
    "purpose": "Traces the hypothesized path from an intervention or shock through behavioral and market adjustments to an outcome. Its boundary is the sequence and direction of channels, not a calibrated estimate of the size of each arrow.",
    "when": "Use for multi-stage economic mechanisms; mark unverified links and avoid implying a diagram proves causality.",
    "signals": [
      "mechanism",
      "transmission",
      "spillover",
      "substitution"
    ],
    "example": [
      "Mechanism Map"
    ]
  },
  {
    "id": "economic-figures",
    "name": "Economic Figures",
    "group": "special",
    "purpose": "Plots economic relationships, model comparisons, or empirical quantities with labeled axes, legends, and a clear evidence status. Its boundary is graphical illustration or measurement with clear provenance; it is separate from distributional accounting in The Incidence Ledger.",
    "when": "Use when a visual substantially clarifies a quantitative or theoretical claim. Label schematic comparative statics, descriptive observations, simulations, and estimated effects distinctly. It may accompany but is not part of the Incidence Ledger.",
    "signals": [
      "figure",
      "visualization",
      "curve",
      "comparative statics",
      "chart",
      "quantitative"
    ],
    "example": [
      "ECONOMIC GRAPH",
      "ECONOMIC MODEL"
    ]
  }
];
const byId=Object.fromEntries(features.map(f=>[f.id,f]));
function select(meta={}){
 const special=[],rejected=[],review=[],functions=new Set();
 for(const c of meta.candidates||[]){
  const f=byId[c.id];if(!f||f.group!=='special'){rejected.push({id:c.id,reason:'Unknown Special Feature'});continue}
  const required=['analyticalRelevance','evidentiarySupport','distinctiveness','readerValue','presentationSuitability','informationBurden'];
  if(c.authored!==true||!c.provenance?.length||!required.every(k=>typeof c.assessment?.[k]==='string'&&c.assessment[k].trim())){rejected.push({id:c.id,reason:'Requires authored content, provenance and all six editorial assessments'});continue}
  if(functions.has(c.function||c.id)){rejected.push({id:c.id,reason:'Redundant analytical function'});continue}
  if(special.length>=2&&!c.editorialJustification){review.push({id:c.id,reason:'Explain the additional attention burden beyond two features'});continue}
  special.push(c.id);functions.add(c.function||c.id);
 }
 if(special.filter(x=>x!=='heron').length<2&&!meta.exception)review.push({reason:'Document why fewer than two substantive features are justified; The Heron does not fill the target'});
 return {editorial:features.filter(f=>f.group==='editorial').map(f=>f.id),special,rejected,review,minimumTarget:2,hardMaximum:null,exception:meta.exception||null};
}
const registry={features,byId,select};if(typeof module==='object'&&module.exports)module.exports=registry;else root.LLReadingFeatures=Object.freeze(registry);
})(typeof window==='object'?window:{});
