'use strict';
/* Source-grounded Economic Hinge and evidence-pair regression.
 * Run from repository root: node scripts/test_economic_hinge.cjs
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {hinges,get,render}=require('../weekly-economics-environment/economic-hinge.cjs');
const {compose,nodes,readingRecord}=require('../weekly-economics-environment/editorial-folio.cjs');
const path='weekly-economics-environment/index.html';
const source=fs.readFileSync(path,'utf8');
const css=fs.readFileSync('weekly-economics-environment/reading-folio.css','utf8');
const matches=[...source.matchAll(/<article class="entry" id="([^"]+)"[\s\S]*?<\/article>/g)];
let n=0;
function ok(cond,label){assert(cond,label);n++}
function same(a,b,label){assert.deepEqual(a,b,label);n++}
same(matches.length,30,'thirty published readings');
same(Object.keys(hinges).length,30,'thirty authored mechanisms');
const texts=new Set();
for(const [id,html] of matches.map(m=>[m[1],m[0]])){
 const data=get(id);ok(data.authored,'authored economic mechanism '+id);
 ok(data.stages.length===3 && data.stages.every(v=>v.length>9),'three substantive stages '+id);
 ok(data.status.length>8,'evidence-status qualifier '+id);
 const sig=data.stages.join(' ⟶ ');
 ok(!texts.has(sig),'no repeated generic mechanism '+id);texts.add(sig);
 const tree=nodes(html),part=className=>tree.find(x=>x.classes.includes(className));
 for(const cls of ['analysis-flow','economic-hinge','evidence-pair','research-note','limitation','sources']){
  ok(!!part(cls),'reading apparatus present: '+id+' '+cls);
 }
 const evidence=part('evidence-pair'),limit=part('limitation'),notebook=part('research-note');
 ok(limit.parent===evidence && notebook.parent===evidence,'evidence and RN are direct siblings: '+id);
 ok(tree.find(x=>x.classes.includes('analysis-flow')).start<evidence.start,'analysis precedes evidence pair '+id);
 ok(html.includes('data-authored="true"'),'authored status present '+id);
}
const unknown=get('future-unknown',{
 title:'New issue',
 finding:'Observed change in the current sample. Further evidence will matter.',
 interpretation:'The interpretation is an editorial hypothesis. It is not established.',
 limitations:'Future data will constrain inference.'
});
ok(!unknown.authored && unknown.status.includes('Source excerpts'),'publisher fallback never fabricates concepts');
ok(unknown.stages[0]==='Observed change in the current sample.','fallback excerpts actual published material');
ok(render('future-x',{title:'<unsafe>',finding:'A source statement.',interpretation:'A supported mechanism.',limitations:'An unresolved limit.'}).includes('&lt;unsafe&gt;'),'untrusted words are escaped');
same(compose(source),source,'the full journal is idempotent across retries');
ok(css.includes('.entry[data-reading-layout="2"] .evidence-pair'),'evidence-register CSS exists');
ok(css.includes('.evidence-pair>.margin'),'Heron wrapper has grid placement');
ok(css.includes('.reading-column::after'),'single continuous right boundary maintained');
ok(css.includes('var(--clay) 0 70px')&&css.includes('var(--clay) 0 90px'),'both ends copper-capped with larger right accents');
console.log(n+' Economic Hinge / notebook-positioning checks passed.');
