'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),gate=require('../weekly-economics-environment/source-evidence.cjs');
const journal=fs.readFileSync('weekly-economics-environment/index.html','utf8'),evidence=require('../weekly-economics-environment/source-evidence.json'),clone=x=>structuredClone(x);let n=0;
const ok=(v,m)=>{assert(v,m);n++},reject=(f,re)=>{assert.throws(f,re);n++};
const inv=gate.inventory(journal),reading=inv.find(r=>r.id==='2026-10-30-household-climate'),component=reading.components.find(c=>c.id==='estimation-desk'),record=evidence.readings[reading.id].components.find(c=>c.id===component.id);
const run=(r=clone(record),d=clone(evidence.documents),c=component)=>gate.check(r,c,reading,d);
ok(run(),'NBER 35945 reconstruction and source mapping pass');
ok(record.mapping.includes('prose')&&record.mathematics.omissions.length===3,'equation explicitly editorial with omissions');
const notation=clone(record);notation.mathematics.notation[0]={symbol:'s',sourceSymbol:'s_i',meaning:'subsidy schedule',sourceMeaning:'household solar choice'};reject(()=>run(notation),/notation conflicts/);
const author=clone(record);author.sourceAuthorEquivalence=true;reject(()=>run(author),/must not be attributed/);
const tokens=clone(record);tokens.basis='reported';tokens.mathematics.sourceTokens='authors equation';tokens.mathematics.publishedTokens='different equation';reject(()=>run(tokens),/equation tokens differ/);
const causal=clone(record);causal.claims[0].kind='causal';reject(()=>run(causal),/classification mismatch/);
const observational=clone(evidence.documents);observational['nber-35945-oct2026'].passages.policy.facts.target.kind='descriptive-association';reject(()=>run(causal,observational),/classification mismatch/);
const number=clone(record);number.claims[0].value=20;reject(()=>run(number),/unsupported numerical/);
const unit=clone(record);unit.claims[0].unit='percentage points';reject(()=>run(unit),/unsupported numerical/);
const noRead=clone(evidence.documents);noRead['nber-35945-oct2026'].access.fullTextReviewed=false;reject(()=>run(clone(record),noRead),/full-text review required/);
const wrong=clone(evidence.documents);wrong['nber-35945-oct2026'].url='https://www.nber.org/papers/w00000';wrong['nber-35945-oct2026'].aliases=[];reject(()=>run(clone(record),wrong),/not linked to this reading/);
const wrongPassage=clone(record);wrongPassage.evidence=wrongPassage.evidence.filter(x=>x.passage!=='policy');reject(()=>run(wrongPassage),/no specific supporting fact/);
const sourceChanged=clone(record);sourceChanged.evidence[0].sha256='0'.repeat(64);reject(()=>run(sourceChanged),/source artifact differs/);
const diagnostic=evidence.readings[reading.id].components.find(c=>c.id==='assumption-test'),dc=reading.components.find(c=>c.id==='assumption-test');ok(run(clone(diagnostic),clone(evidence.documents),dc),'proposed diagnostic passes');const performed=clone(diagnostic);performed.claims[0].performed=true;reject(()=>run(performed,clone(evidence.documents),dc),/proposed diagnostic represented as performed/);
const interpretation=evidence.readings[reading.id].components.find(c=>c.id==='ll-argument'),ic=reading.components.find(c=>c.id==='ll-argument');ok(run(interpretation,evidence.documents,ic),'appropriately sourced editorial interpretation passes');
const conflict=clone(record);conflict.discrepancy='Source and claim materially disagree';reject(()=>run(conflict),/unresolved material/);
const noReviewer=clone(record);delete noReviewer.verification.reasoning;reject(()=>run(noReviewer),/inspectable source-and-analysis/);
reject(()=>run(record,evidence.documents,{...component,sha256:'0'.repeat(64)}),/content changed/);
const coverage=gate.validate({journal});ok(coverage.readings===30&&coverage.verifiedComponents===10&&coverage.incompleteHistoricalComponents>0,'archive coverage remains honest');
const future=journal.replaceAll('2026-10-30','9998-12-31');reject(()=>gate.validate({journal:future}),/missing historical reading/);
const amended=journal.replace('Solar changes another technology’s emissions margin','An unreviewed changed claim');reject(()=>gate.validate({journal:amended}),/content changed/);
const incomplete=clone(evidence);incomplete.readings.insurance.components[0].sha256='0'.repeat(64);reject(()=>gate.validate({journal,evidence:incomplete}),/completed substantive review required/);
// A genuinely new reading cannot self-designate as historical. Private future
// content reuses the inspected NBER example; the fixture is not a review factory.
const newId='private-future-source-fixture',idx=JSON.parse(journal.match(/id="ll-reading-index-data">([\s\S]*?)<\/script>/)[1]);
idx.editions.push({date:'9998-01-01',readings:[{id:newId,title:'Private fixture'}]});
const article=journal.match(/<article class="entry"[^>]*id="2026-10-30-household-climate"[\s\S]*?<\/article>/)[0].replaceAll(reading.id,newId);
const grown=journal.replace(/(id="ll-reading-index-data">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(idx)+b).replace('</main>','<section class="edition" data-edition="9998-01-01">'+article+'</section></main>');
reject(()=>gate.validate({journal:grown}),/completed substantive review required/);
const unindexed=journal.replace('</main>','<section class="edition" data-edition="9998-01-01">'+article+'</section></main>');
reject(()=>gate.validate({journal:unindexed}),/completed substantive review required/);
const futureEvidence=clone(evidence),newReading=gate.inventory(grown).find(r=>r.id===newId);
futureEvidence.readings[newId]={...clone(evidence.readings[reading.id]),edition:'9998-01-01',historical:false};
for(let i=0;i<futureEvidence.readings[newId].components.length;i++){let c=futureEvidence.readings[newId].components[i];if(c.status!=='verified'){c={...clone(interpretation),id:c.id};futureEvidence.readings[newId].components[i]=c;}c.sha256=newReading.components.find(x=>x.id===c.id).sha256;}
ok(gate.validate({journal:grown,evidence:futureEvidence}).verifiedComponents===coverage.verifiedComponents+newReading.components.length,'fully recorded future fixture accepted');
futureEvidence.readings[newId].historical=true;futureEvidence.readings[newId].components[0].status='incomplete';reject(()=>gate.validate({journal:grown,evidence:futureEvidence}),/completed substantive review required/);
const {nodes}=require('../weekly-economics-environment/editorial-folio.cjs');
const removed=nodes(article).find(n=>n.id===newId+'--mechanism-map');
const missingComponent=grown.replace(article,article.slice(0,removed.start)+article.slice(removed.end));
reject(()=>gate.validate({journal:missingComponent,evidence:{...futureEvidence,readings:{...futureEvidence.readings,[newId]:{...futureEvidence.readings[newId],components:futureEvidence.readings[newId].components.map(c=>({...c,status:'verified'}))}}}}),/missing reviewed\/historical component/);
// Read-only pre-write integration: a changed claim cannot alter any artifact.
const cp=require('child_process'),os=require('os'),path=require('path'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ll-evidence-gate-'));
try{for(const dir of ['weekly-economics-environment','personal-updates','daily-watchlist-5','daily-econ-challenge','scripts'])fs.cpSync(dir,path.join(temp,dir),{recursive:true});fs.writeFileSync(path.join(temp,'weekly-economics-environment/index.html'),amended);const paths=['weekly-economics-environment/index.html','weekly-economics-environment/field-register-history.json','personal-updates/index.html','personal-updates/issue-mark-archive.js','daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js'],snapshot=paths.map(p=>fs.readFileSync(path.join(temp,p),'utf8'));const r=cp.spawnSync(process.execPath,['scripts/prepare_periodicals.cjs'],{cwd:temp,encoding:'utf8'});ok(r.status!==0&&r.stderr.includes('content changed since source review'),'preparation blocks stale review');assert.deepEqual(paths.map(p=>fs.readFileSync(path.join(temp,p),'utf8')),snapshot);n++;}finally{fs.rmSync(temp,{recursive:true,force:true})}
console.log(n+' source-to-claim, reconstruction, classification and pre-write checks passed.');
