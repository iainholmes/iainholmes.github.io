/* Loblolly & Logit · Reading Field Guide registry, v3.
   This is editorial metadata, not permission to invent evidence or features.
   Future publishers may import select(), but must author and source the selected
   modules before rendering. No existing edition is rewritten. */
(function(root){
"use strict";
const features=[
{id:"why-it-matters",name:"Why It Matters",group:"editorial",purpose:"Explains why the result matters for decisions, institutions, or welfare.",when:"Use when the consequence is not already evident from the opening finding.",signals:["stakes","policy","welfare","decision"],example:["Why it matters"]},
{id:"economic-interpretation",name:"Economic Interpretation",group:"editorial",purpose:"Explains incentives, constraints, equilibrium responses and economic mechanisms.",when:"Use for an economic mechanism that can be distinguished from the source's direct finding.",signals:["mechanism","incentives","substitution","equilibrium","externality"],example:["Economic interpretation"]},
{id:"evidence-limits",name:"What the Evidence Does—and Does Not—Say",group:"editorial",purpose:"States design, measurement, uncertainty and identification limits.",when:"Use whenever empirical evidence could otherwise be mistaken for a stronger causal or general claim.",signals:["empirical","causal","measurement","uncertainty","identification"],example:["What the evidence does"]},
{id:"research-notebook",name:"In the Research Notebook",group:"editorial",purpose:"Connects a result to a reusable method, estimand or research question.",when:"Use when a methodological takeaway improves understanding without repeating the issue-level Methods & Concepts.",signals:["method","model","estimand","research"],example:["Research Notebook"]},
{id:"incidence-ledger",name:"The Incidence Ledger",group:"special",purpose:"Traces who pays, who gains, who adjusts, and how burdens are distributed.",when:"Use when heterogeneous effects or incidence can be supported by specific evidence or explicitly qualified economic reasoning.",signals:["incidence","distribution","welfare","burden","beneficiaries"],example:["Incidence Ledger"]},
{id:"long-view",name:"The Long View",group:"special",purpose:"Places a finding against a defensible longer-run baseline, trend, or time horizon.",when:"Use with comparable longitudinal evidence or a clearly identified scenario, not merely to add historical atmosphere.",signals:["history","trend","long-run","scenario"],example:["The Long View"]},
{id:"decision-margin",name:"The Decision Margin",group:"special",purpose:"Isolates the behavioral or policy choice at which incentives change.",when:"Use when the relevant alternative, constraint, or threshold can be stated clearly.",signals:["margin","choice","tradeoff","threshold"],example:["The Decision Margin"]},
{id:"heron",name:"The Heron",group:"special",purpose:"An occasional methodological companion that probes an assumption or interpretation.",when:"Use sparingly, only when a pointed methodological question adds value and a sourced, concise answer is available.",signals:["assumption","method","identification"],example:["The Heron"]},
{id:"assumption-test",name:"The Assumption Test",group:"special",purpose:"Shows which assumptions a finding or model depends upon and what would change if they failed.",when:"Use for important, testable or sensitivity-relevant assumptions; do not imply that a test has been run unless it has.",signals:["assumption","sensitivity","model","identification"],example:["Assumption Test"]},
{id:"estimation-desk",name:"The Estimation Desk",group:"special",purpose:"Sets out a study-specific econometric equation, defines the dependent variable and regressors, identifies the estimand, and separates coefficient interpretation from causal identification.",when:"Use only when a model or empirical specification genuinely illuminates the study; label theoretical, proposed, estimated and illustrative equations accurately. Never invent estimates, standard errors or results.",signals:["econometrics","regression","estimation","specification","identification","estimand"],example:["Estimation Desk"]},
{id:"mechanism-map",name:"The Mechanism Map",group:"special",purpose:"Traces the hypothesized path from an intervention or shock through behavioral and market adjustments to an outcome.",when:"Use for multi-stage economic mechanisms; mark unverified links and avoid implying a diagram proves causality.",signals:["mechanism","transmission","spillover","substitution"],example:["Mechanism Map"]},
{id:"economic-figures",name:"Economic Figures",group:"special",purpose:"Plots economic relationships, model comparisons, or empirical quantities with labeled axes, legends, and a clear evidence status.",when:"Use when a visual substantially clarifies a quantitative or theoretical claim. Label schematic comparative statics, descriptive observations, simulations, and estimated effects distinctly. It may accompany but is not part of the Incidence Ledger.",signals:["figure","visualization","curve","comparative statics","chart","quantitative"],example:["ECONOMIC GRAPH","ECONOMIC MODEL"]}
];
const byId=Object.fromEntries(features.map(x=>[x.id,x]));
function select(input){
 const meta=input&&typeof input==="object"?input:{};
 const tags=new Set((Array.isArray(meta.tags)?meta.tags:[]).filter(x=>typeof x==="string").map(x=>x.toLowerCase().trim()));
 const required=Array.isArray(meta.required)?meta.required.filter(x=>byId[x]):[];
 const excluded=new Set(Array.isArray(meta.exclude)?meta.exclude:[]);
 const eligible=features.filter(f=>!excluded.has(f.id)&&(required.includes(f.id)||f.signals.some(t=>tags.has(t))));
 const editorial=features.filter(f=>f.group==="editorial"&&eligible.includes(f)).map(f=>f.id);
 const candidates=eligible.filter(f=>f.group==="special").sort((a,b)=>
  (required.includes(b.id)?1:0)-(required.includes(a.id)?1:0) ||
  b.signals.filter(t=>tags.has(t)).length-a.signals.filter(t=>tags.has(t)).length ||
  features.indexOf(a)-features.indexOf(b));
 const cap=Number.isInteger(meta.maxSpecial)?Math.max(0,Math.min(meta.maxSpecial,3)):2;
 return {editorial,special:candidates.slice(0,cap).map(f=>f.id),
  advisory:"Selection is a planning recommendation only. Publish only authored, fact-checked, appropriately sourced modules."};
}
root.LLReadingFeatures=Object.freeze({features,select,byId});
})(typeof window!=="undefined"?window:typeof globalThis!=="undefined"?globalThis:this);
