const assert=require('node:assert/strict');
const {model,svg}=require('../personal-updates/issue-marks.js');
const cases=[
  {key:'fb',date:'2027-09-30',no:5,framing:'The common constraint is institutional: statutory authority, courts and administrative credibility.'},
  {key:'sp',date:'2027-09-25',no:1,framing:'Complementarity between investments. Finance and networks shift incidence and risk. Who bears the bill?'},
  {key:'cp',date:'2027-09-30',no:3,questions:[{stem:'Demand and supply',field:'Microeconomics'},{stem:'A credible counterfactual',field:'Causal inference'},{stem:'Instrumental variables and selection',field:'Research design'}]}
];
assert.deepEqual(cases.map(x=>model(x).theme),['institutions','complements','identification']);
for(const x of cases){const a=model(x),b=model({...x,date:'2027-10-02',no:Number(x.no)+1});assert.notEqual(a.seed,b.seed);assert.notEqual(svg(a),svg(b));assert.match(svg(a),/viewBox="0 0 600 800"/);assert.equal((svg(a).match(/<svg /g)||[]).length,1);assert.ok(svg(a).includes(a.no));assert.equal(model({...x,no:String(x.no).padStart(3,'0')}).seed,a.seed)}
assert.equal(model({...cases[2],questions:[{stem:'Supply and demand '.repeat(100)},...cases[2].questions.slice(1)]}).theme,'identification','One long first question must not overwhelm issue-wide concepts');
assert.notEqual(model({...cases[0],framing:'Inflation and growth change over time.'}).theme,model(cases[0]).theme);
console.log('Issue framing, whole-set weighting, edition updates, stable numbering and single-image marks passed.');
