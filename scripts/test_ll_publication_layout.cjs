'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {compose}=require('../weekly-economics-environment/editorial-folio.cjs'),arch=require('../weekly-economics-environment/editorial-architecture.cjs');
const {validate}=require('../weekly-economics-environment/reading-layout-guard.cjs');
const reviewGate=require('../weekly-economics-environment/heron-editorial-review.cjs');
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
const eightIssueArchive=require('node:child_process').execFileSync('git',['show','03977d6:weekly-economics-environment/index.html'],{encoding:'utf8',maxBuffer:2e6});
for(const [date,config] of Object.entries(JSON.parse(eightIssueArchive.match(dataBlock)[2])))eq(companion[date],config,'published registry through Issue 008 preserved for '+date);
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
 const makeReview=(targets,notes=[],silenceReason,continuity,reviewedOn=date)=>({reviewer:'Private fixture reviewer',reviewedOn,completed:true,readings:Object.fromEntries(targets.map((id,i)=>[id,{
  method:['Boundary comparability','Selection into insurance','Precision of small subgroups','Comparability of housing prices','Changes in exposure'][i],
  existingCoverage:notes.some(note=>note.target===id)?'The reading states the sampling restriction but leaves its interpretation open.':'The Research Note already covers the interpretation and evidence limits.',
  decision:notes.some(note=>note.target===id)?'Explain why the estimated association can change with the sample definition.':'The proposed aside would repeat the published comparison.',
  noteId:notes.find(note=>note.target===id)?.id
 }])),silenceReason,continuity});
 const silenceReason='The five candidates repeat existing qualifications or lack evidence for a distinct intervention.';
 const priorDate=published.at(-1).date;
 const priorWasSilent=!companion[priorDate]?.appearances.length;
 const continuity={previousDate:priorDate,reassessedAllReadings:true,reason:'The second pass compared the sampling candidate against the Research Note’s discussion of within-metro selection. The other four would either repeat a listed evidence limit or require data the source does not report.'};
 const review=makeReview(ids,[],silenceReason,continuity);
 const previousReviews=arch.decisions.heronReviews;
 arch.decisions.heronReviews={...previousReviews,[date]:review};
 const checkReview=(candidate,editionReview)=>reviewGate.validate({journal:candidate,reviews:{...previousReviews,[date]:editionReview}});
 const grown=compose(withCompanion(draft,{...companion,[date]:{enabled:false,appearances:[]}}));const pass=validate({...input,journal:grown});eq(pass.editions,result.editions+1,'future curated edition accepted');eq(pass.readings,result.readings+5,'future readings indexed automatically');eq(indexOf(grown).editions.at(-1).readings.map(r=>r.id),ids,'all future stable anchors generated');eq(compose(grown),grown,'future publication retry stable');
 assert.throws(()=>checkReview(compose(draft),review),/explicit companion-data decision/);n++;
 assert.throws(()=>checkReview(grown,undefined),/complete the dated editorial decision/);n++;
 assert.throws(()=>checkReview(grown,{...review,completed:false}),/complete the dated editorial decision/);n++;
 assert.throws(()=>checkReview(grown,{...review,silenceReason:''}),/explain why no qualifying note/);n++;
 if(priorWasSilent){
  assert.throws(()=>checkReview(grown,{...review,continuity:undefined}),/acknowledge the prior silent edition/);n++;
  assert.throws(()=>checkReview(grown,{...review,continuity:{...continuity,reassessedAllReadings:false}}),/second look/);n++;
  assert.throws(()=>checkReview(grown,{...review,continuity:{...continuity,reason:silenceReason}}),/second look/);n++;
 }
 assert.throws(()=>checkReview(grown,{...review,readings:{...review.readings,[ids[0]]:null}}),/record the methodological question/);n++;
 // Run the real preparation entry point with a dated draft and no decision.
 const {mkdtempSync,cpSync,writeFileSync,rmSync}=fs;
 const temp=mkdtempSync(require('node:os').tmpdir()+'/ll-heron-preparation-');
 try{
  for(const dir of ['weekly-economics-environment','personal-updates','daily-watchlist-5','daily-econ-challenge','scripts'])cpSync(dir,temp+'/'+dir,{recursive:true});
  const fixture=require('./fixtures/art-originality.cjs');
  const register=fixture.data(grown,'field-register');
  const profiles=register.entries.slice(0,3).map((entry,i)=>({...entry,no:register.entries.length+i+1,issue:date,related:ids[i],fieldNote:i<2}));
  register.entries.push(...profiles);
  writeFileSync(temp+'/weekly-economics-environment/index.html',fixture.replaceData(grown,'field-register',register));
  const artifacts=['weekly-economics-environment/index.html','weekly-economics-environment/reading-feature-inventory.json','personal-updates/issue-mark-archive.js','personal-updates/index.html'];
  const bytes=()=>artifacts.map(file=>read(temp+'/'+file));
  const before=bytes();
  const run=require('node:child_process').spawnSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:temp,encoding:'utf8'});
  ok(run.status!==0&&run.stderr.includes('L&L Heron review '+date+': complete the dated editorial decision'),'preparation rejects an unreviewed new edition');
  eq(bytes(),before,'the rejected decision leaves all sampled publication artifacts untouched');
 }finally{rmSync(temp,{recursive:true,force:true});}
 const future=grown.slice(grown.indexOf('data-edition="'+date+'"'),grown.indexOf('</main>'));
 eq((future.match(/data-reading-palette="slate"/g)||[]).length,5,'future compositions inherit their authored palette');
 ok(future.includes('class="ll-feature-host"')&&!future.includes('data-contact-sides')&&!future.includes('ll-feature-divider'),'future issue emits native features and leaves edge measurement to the browser');
 assert.throws(()=>validate({...input,journal:grown.replace('How does spatial exposure change the estimate?','What connects this week')}),/edition-specific synthesis heading required/);n++;
 const makeNote=(target,id='fixture-heron')=>({id,target,type:'method',title:'Sampling and exposure',text:'Private fixture for the source-review and placement tests.'});
 const generate=config=>compose(withCompanion(draft,{...companion,[date]:config}));
 for(const target of ids){
  const note=makeNote(target);
  const generated=generate({enabled:true,appearances:[note]});
  checkReview(generated,makeReview(ids,[note]));n++;
  eq(herons(indexOf(generated).editions.at(-1)),[[target,'heron-'+note.id]],'generated index follows reading ID '+target);
  eq(compose(generated),generated,'Heron generation is repeatable');
  ok(require('../weekly-economics-environment/source-evidence.cjs').inventory(generated).find(r=>r.id===target).components.some(c=>c.id==='heron-'+note.id),'note enters the target reading’s source-review inventory');
 }
 for(const config of [{enabled:false,appearances:[]},{enabled:true,appearances:[]}])eq(herons(indexOf(generate(config)).editions.at(-1)),[],'empty companion generates no note');
 eq(herons(indexOf(grown).editions.at(-1)),[],'missing companion generates no note');
 const pair=[makeNote(ids[4],'fixture-five'),makeNote(ids[1],'fixture-two')];
 const paired=generate({enabled:true,appearances:pair});
 checkReview(paired,makeReview(ids,pair));n++;
 assert.throws(()=>checkReview(generate({enabled:true,appearances:[pair[0],{...pair[1],target:pair[0].target}]}),makeReview(ids,pair)),/distinct readings/);n++;
 assert.throws(()=>checkReview(paired,makeReview(ids,pair.slice(1))),/review noteId must match/);n++;
 assert.throws(()=>checkReview(generate({enabled:true,appearances:[]}),review),/enabled must match/);n++;
 eq(herons(indexOf(paired).editions.at(-1)),[[ids[1],'heron-fixture-two'],[ids[4],'heron-fixture-five']],'index placement is independent of note order');
 const inventory=arch.inventory(paired);
 eq(inventory.totals.features.heron,arch.inventory(journal).totals.features.heron+2,'inventory adds the two indexed notes');
 eq(inventory.entries.filter(r=>ids.includes(r.id)).flatMap(r=>r.selected.filter(f=>f.id==='heron').map(f=>f.anchor)),['heron-fixture-two','heron-fixture-five'],'inventory uses the new permanent anchors');
 const staleIndex=indexOf(paired);staleIndex.editions.at(-1).readings[4].features.pop();
 assert.throws(()=>reviewGate.validate({journal:paired,index:staleIndex,reviews:{...previousReviews,[date]:makeReview(ids,pair)}}),/regenerate the Heron Index/);n++;
 for(const [config,error] of [
  [{enabled:true,appearances:[...pair,makeNote(ids[0])]},/at most two/],
  [{enabled:false,appearances:pair},/disabled edition/],
  [{enabled:true,appearances:[makeNote('insurance')]},/must target a reading in/],
  [{enabled:true,appearances:[makeNote(ids[4],'h-2026-09-25-a')]},/duplicate appearance ID/],
  [{enabled:true,appearances:[makeNote(ids[0]),makeNote(ids[4])]},/duplicate appearance ID/],
  [{enabled:true,appearances:[{...makeNote(ids[3]),text:' '}]},/title and note text/]
 ]){assert.throws(()=>generate(config),error);n++;}
 const f=arch.decisions.readings[ids[0]].features[0],terms=f.terms;delete f.terms;assert.throws(()=>validate({...input,journal:compose(grown)}),/incomplete Estimation Desk/);n++;f.terms=terms;
 // Two prospective silent editions, after an authored issue, in publication order.
 const firstDate='9999-12-20',secondDate='9999-12-23';
 const newEdition=(d,readingIds)=>'<section class="edition" data-edition="'+d+'" data-title="Private fixture">'+readingIds.map(id=>'<article class="entry" id="'+id+'"></article>').join('')+'</section>';
 const firstIds=ids.map(id=>id+'-first'),secondIds=ids.map(id=>id+'-second');
 const lastWithNotes=published.filter(ed=>herons(ed).length).at(-1).date;
 const priorSilent=new Set(published.filter(ed=>ed.date>lastWithNotes).map(ed=>ed.date));
 const preceding=journal.replace(/<section class="edition"[^>]*data-edition="([^"]+)"[\s\S]*?(?=<section class="edition"|<\/main>)/g,(html,d)=>priorSilent.has(d)?'':html);
 const twoSilent=withCompanion(preceding.replace('</main>',newEdition(firstDate,firstIds)+newEdition(secondDate,secondIds)+'</main>'),{
  ...Object.fromEntries(Object.entries(companion).filter(([d])=>!priorSilent.has(d))),[firstDate]:{enabled:false,appearances:[]},[secondDate]:{enabled:false,appearances:[]}
 });
 const first=makeReview(firstIds,[],silenceReason,undefined,firstDate),second=makeReview(secondIds,[],'The proposed price comparison would rest on unreported variation, while the other candidates repeat existing qualifications.',undefined,secondDate);
 assert.throws(()=>reviewGate.validate({journal:twoSilent,reviews:{...previousReviews,[firstDate]:first,[secondDate]:second}}),new RegExp('acknowledge the prior silent edition '+firstDate));n++;
 assert.throws(()=>reviewGate.validate({journal:twoSilent,reviews:{...previousReviews,[firstDate]:first,[secondDate]:{...second,continuity:{...continuity,previousDate:firstDate,reassessedAllReadings:false}}}}),/second look/);n++;
 reviewGate.validate({journal:twoSilent,reviews:{...previousReviews,[firstDate]:first,[secondDate]:{...second,continuity:{...continuity,previousDate:firstDate}}}});n++;
 arch.decisions.heronReviews=previousReviews;
}finally{for(const id of ids){delete arch.decisions.readings[id];delete arrangements.authored[id]}}
const registry=require('../weekly-economics-environment/reading-feature-registry.js');eq(registry.select({tags:['regression','history']}).special,[],'keywords never publish features');
const candidates=arch.decisions.readings.insurance.features.map(f=>({id:f.type,authored:true,provenance:f.provenance,assessment:f.assessment,function:f.type}));eq(registry.select({candidates}).special,['estimation-desk','economic-figures'],'evidence-led authored candidates selected');ok(registry.select({candidates:[candidates[0]]}).review.length,'minimum-target exception required');
console.log(n+' publication, future growth, Index and editorial gate checks passed.');
