'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {compose}=require('../weekly-economics-environment/editorial-folio.cjs'),arch=require('../weekly-economics-environment/editorial-architecture.cjs');
const {validate}=require('../weekly-economics-environment/reading-layout-guard.cjs');
const read=p=>fs.readFileSync(p,'utf8');const journal=read('weekly-economics-environment/index.html'),input={journal,notebook:read('weekly-economics-environment/notebook/index.html'),folioCss:read('weekly-economics-environment/reading-folio.css'),notebookCss:read('weekly-economics-environment/notebook/notebook.css')};let n=0;
function ok(v,m){assert(v,m);n++}function eq(a,b,m){assert.deepEqual(a,b,m);n++}
const indexOf=source=>JSON.parse(source.match(/id="ll-reading-index-data">([\s\S]*?)<\/script>/)[1]);
const published=indexOf(journal).editions;
const result=validate(input);eq(result.editions,published.length,'all archival editions');eq(result.readings,published.length*5,'all archival readings');eq(compose(journal),journal,'composer is idempotent');
const dataBlock=/(id="companion-data">)([\s\S]*?)(<\/script>)/;
const companion=JSON.parse(journal.match(dataBlock)[2]);
const withCompanion=(source,data)=>source.replace(dataBlock,(_,open,_data,close)=>open+JSON.stringify(data)+close);
const herons=edition=>edition.readings.flatMap(r=>r.features.filter(f=>f.id==='heron').map(f=>[r.id,f.anchor]));
const originalJournal=require('node:child_process').execFileSync('git',['show','53a0aa4:weekly-economics-environment/index.html'],{encoding:'utf8',maxBuffer:2e6});
const historical=indexOf(originalJournal).editions;
const historyDates=new Set(historical.map(ed=>ed.date));
const archive=source=>[...source.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"[\s\S]*?(?=<section class="edition"|<\/main>)/g)].filter(([,date])=>historyDates.has(date)).map(([html])=>html).join('');
eq(published.filter(ed=>historyDates.has(ed.date)).map(ed=>herons(ed).map(([id])=>ed.readings.findIndex(r=>r.id===id)+1)),[[1,4],[1,3],[1,2],[1,3],[1,2],[1],[]],'published notes remain on their original readings');
const oldTitles=/(<section class="synthesis"[^>]*><header class="closing-heading"><div class="eyebrow">Editor's synthesis<\/div><h2>)[^<]+(?=<\/h2>)/g;
const updatedTitles=['What turns a promising idea into a real gain?','What moves after a policy changes a price?','Who bears the cost after the first shock?','What should institutions measure before they act?','Who carries the risk when capital moves?','Which conclusions survive a change in baseline?','What changes when risk becomes measurable?'];
let titleIndex=0;
eq(archive(journal),archive(originalJournal).replace(oldTitles,(_,open)=>open+updatedTitles[titleIndex++]),'only the six authorized synthesis headings change within Issues 001–007');
eq(titleIndex,updatedTitles.length,'all seven synthesis headings inspected');
for(const [date,config] of Object.entries(JSON.parse(originalJournal.match(dataBlock)[2])))eq(companion[date],config,'authored Heron registry is preserved for '+date);
for(const file of ['reading-folio.css','reading-index.js','reading-composition.js']){const hash=crypto.createHash('sha256').update(read('weekly-economics-environment/'+file)).digest('hex').slice(0,12);ok(journal.includes(file+'?v='+hash),'content-versioned asset '+file)}
assert.throws(()=>validate({...input,journal:journal.replaceAll(' data-feature-flow="native"','')}),/native feature-flow contract/);n++;
require('./test_ll_feature_gap_audit.cjs');
const base=journal.match(/<article class="entry"[^>]*id="insurance"[\s\S]*?<\/article>/)[0];
assert.throws(()=>compose(journal.replace('</main>','<section class="edition" data-edition="9999-12-31" data-title="Unreviewed">'+base.replace('id="insurance"','id="private-unreviewed"')+'</section></main>')),/editorial review required/);n++;
const arrangements=require('../weekly-economics-environment/reading-arrangements.cjs');
const ids=Array.from({length:5},(_,i)=>'private-future-'+i);try{
 const articles=ids.map((id,i)=>{arch.decisions.readings[id]=JSON.parse(JSON.stringify(arch.decisions.readings.insurance));arch.decisions.readings[id].title='Private future reading '+i;arch.decisions.readings[id].layout.id='private-fixture-'+i;arrangements.authored[id]=({E,O,Q,N,A,M,L})=>E+A+O+M()+L()+Q+N;return base.replace('id="insurance"','id="'+id+'"').replaceAll('insurance--',id+'--').replace(/<h2>[^<]+<\/h2>/,'<h2>Private future reading '+i+'</h2>')}).join('');
 const date='9999-12-31';
 const draft=journal.replace('</main>','<section class="edition" data-edition="'+date+'" data-title="Private future fixture">'+articles+'<section class="synthesis" id="private-synthesis"><div class="eyebrow">Synthesis</div><h2>How does spatial exposure change the estimate?</h2><p>Private synthesis.</p></section></section></main>');
 const grown=compose(draft);const pass=validate({...input,journal:grown});eq(pass.editions,result.editions+1,'future curated edition accepted');eq(pass.readings,result.readings+5,'future readings indexed automatically');eq(indexOf(grown).editions.at(-1).readings.map(r=>r.id),ids,'all future stable anchors generated');eq(compose(grown),grown,'future publication retry stable');
 assert.throws(()=>validate({...input,journal:grown.replace('How does spatial exposure change the estimate?','What connects this week')}),/edition-specific synthesis heading required/);n++;
 const makeNote=(target,id='fixture-heron')=>({id,target,type:'method',title:'Sampling and exposure',text:'Private fixture for the source-review and placement tests.'});
 const generate=config=>compose(withCompanion(draft,{...companion,[date]:config}));
 for(const target of ids){
  const note=makeNote(target);
  const generated=generate({enabled:true,appearances:[note]});
  eq(herons(indexOf(generated).editions.at(-1)),[[target,'heron-'+note.id]],'generated index follows reading ID '+target);
  eq(compose(generated),generated,'Heron generation is repeatable');
  ok(require('../weekly-economics-environment/source-evidence.cjs').inventory(generated).find(r=>r.id===target).components.some(c=>c.id==='heron-'+note.id),'note enters the target reading’s source-review inventory');
 }
 for(const config of [{enabled:false,appearances:[]},{enabled:true,appearances:[]}])eq(herons(indexOf(generate(config)).editions.at(-1)),[],'empty companion generates no note');
 eq(herons(indexOf(grown).editions.at(-1)),[],'missing companion generates no note');
 const pair=[makeNote(ids[4],'fixture-five'),makeNote(ids[1],'fixture-two')];
 eq(herons(indexOf(generate({enabled:true,appearances:pair})).editions.at(-1)),[[ids[1],'heron-fixture-two'],[ids[4],'heron-fixture-five']],'index placement is independent of note order');
 for(const [config,error] of [
  [{enabled:true,appearances:[...pair,makeNote(ids[0])]},/at most two/],
  [{enabled:false,appearances:pair},/disabled edition/],
  [{enabled:true,appearances:[makeNote('insurance')]},/must target a reading in/],
  [{enabled:true,appearances:[makeNote(ids[4],'h-2026-09-25-a')]},/duplicate appearance ID/],
  [{enabled:true,appearances:[makeNote(ids[0]),makeNote(ids[4])]},/duplicate appearance ID/],
  [{enabled:true,appearances:[{...makeNote(ids[3]),text:' '}]},/title and note text/]
 ]){assert.throws(()=>generate(config),error);n++;}
 const f=arch.decisions.readings[ids[0]].features[0],terms=f.terms;delete f.terms;assert.throws(()=>validate({...input,journal:compose(grown)}),/incomplete Estimation Desk/);n++;f.terms=terms;
}finally{for(const id of ids){delete arch.decisions.readings[id];delete arrangements.authored[id]}}
const registry=require('../weekly-economics-environment/reading-feature-registry.js');eq(registry.select({tags:['regression','history']}).special,[],'keywords never publish features');
const candidates=arch.decisions.readings.insurance.features.map(f=>({id:f.type,authored:true,provenance:f.provenance,assessment:f.assessment,function:f.type}));eq(registry.select({candidates}).special,['estimation-desk','economic-figures'],'evidence-led authored candidates selected');ok(registry.select({candidates:[candidates[0]]}).review.length,'minimum-target exception required');
console.log(n+' publication, future growth, Index and editorial gate checks passed.');
