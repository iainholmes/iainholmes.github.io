'use strict';
/* Machine checks establish consistency and stale-review detection, not scientific
 * truth. A completed record must come from an actual source-and-analysis review. */
const crypto=require('node:crypto'),{nodes}=require('./editorial-folio.cjs');
// Frozen historical exemption: a new reading cannot opt itself into incomplete-review status.
const historicalIds=new Set(["electrification", "grid", "carbon-border", "insurance", "glyphosate", "2026-10-02-green-spending", "2026-10-02-policy-mix", "2026-10-02-amoc", "2026-10-02-storage", "2026-10-02-tax-bias", "2026-10-09-trade-climate", "2026-10-09-landslides", "2026-10-09-nuclear-finance", "2026-10-09-winter-bills", "2026-10-09-climate-liability", "2026-10-16-targeted-power", "2026-10-16-pfas-agriculture", "2026-10-16-ferc-review", "2026-10-16-energy-macro", "2026-10-16-climate-vitals", "2026-10-23-paper-markups", "2026-10-23-vehicle-mix", "2026-10-23-emissions-gap", "2026-10-23-adaptation-finance", "2026-10-23-mobility-finance", "2026-10-30-coal-country", "2026-10-30-household-climate", "2026-10-30-methane-rule", "2026-10-30-solar-storage", "2026-10-30-moves6"]);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const text=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function fingerprint(s){return hash(JSON.stringify({text:text(s),math:[...s.matchAll(/<math[\s\S]*?<\/math>/g)].map(m=>m[0].replace(/\s+/g,' ')),figures:[...s.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m=>m[0]),links:[...s.matchAll(/href="([^"]+)"/g)].map(m=>m[1])}));}
function inventory(journal){
 const companion=JSON.parse(journal.match(/id="companion-data">([\s\S]*?)<\/script>/)[1]);
 // Inspect actual edition/article markup, never trust a potentially stale Index.
 const editions=[...journal.matchAll(/<section class="edition"[^>]*data-edition="([^"]+)"([\s\S]*?)(?=<section class="edition"|<\/main>)/g)];
 return editions.flatMap(([markup,date])=>[...markup.matchAll(/<article class="entry"[^>]*id="([^"]+)"[\s\S]*?<\/article>/g)].map(([article,id])=>{
  const ed={date},r={id,title:text(article.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]||id)};
  const html=article,ns=nodes(html),components=[];let analysis=0;
  for(const n of ns){let id;if(n.classes.includes('ll-feature'))id=n.attrs.match(/data-special-feature="([^"]+)"/)[1];else if(n.classes.includes('ll-editorial'))id='analysis-'+String(++analysis).padStart(2,'0');else id=['entry-head','finding','reading-deck','ll-argument','research-note'].find(c=>n.classes.includes(c));if(id)components.push({id,sha256:fingerprint(html.slice(n.start,n.end)),math:n.classes.includes('ll-feature')&&n.attrs.includes('estimation-desk'),tokens:[...html.slice(n.start,n.end).matchAll(/<math[\s\S]*?<\/math>/g)].map(m=>m[0].replace(/<[^>]*>/g,'').replace(/\s/g,''))[0]});}
  // Catch newly introduced standalone prose, equations and graphics too: a new
  // wrapper must never make substantive material fall outside review coverage.
  let extra=0;for(const n of ns.filter(n=>['p','figure','svg','math','table'].includes(n.tag))){
   const covered=ns.some(p=>p.start<=n.start&&p.end>=n.end&&(['entry-head','finding','reading-deck','ll-argument','research-note','ll-editorial','ll-feature','reading-sources'].some(c=>p.classes.includes(c))));
   if(!covered&&!ns.some(p=>p.start<n.start&&p.end>n.end&&['p','figure','svg','math','table'].includes(p.tag)))components.push({id:'supplement-'+(++extra),sha256:fingerprint(html.slice(n.start,n.end)),math:n.tag==='math',tokens:n.tag==='math'?html.slice(n.start,n.end).replace(/<[^>]*>/g,'').replace(/\s/g,''):undefined});
  }
  for(const a of companion[ed.date]?.appearances||[])if(a.target===r.id)components.push({id:'heron-'+a.id,sha256:hash(JSON.stringify(a)),math:false});
  return {id:r.id,edition:ed.date,title:r.title,sourceUrls:[...html.matchAll(/href="(https:[^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')),components};
 }));
}
function check(record,component,reading,documents){
 const fail=m=>{throw Error('L&L source evidence '+reading.id+'/'+component.id+': '+m)};
 if(!record||record.status!=='verified')fail('completed substantive review required; URL accessibility is insufficient');
 if(record.sha256!==component.sha256)fail('content changed since source review');
 if(record.scope!=='whole-component'||!record.verification?.reviewer||!/^\d{4}-\d{2}-\d{2}$/.test(record.verification.reviewedAt)||record.verification.method!=='source-and-analysis'||!record.verification.reasoning)fail('inspectable source-and-analysis review required');
 if(record.discrepancy)fail('unresolved material discrepancy: '+record.discrepancy);
 const modes=['reported','paraphrased','editorial-reconstruction','calculated','hypothesis','editorial-interpretation'];
 if(!modes.includes(record.basis)||!record.mapping||!record.qualifications?.length||!record.evidence?.length)fail('classification, source mapping and qualifications required');
 const facts=[];
 for(const ref of record.evidence){const d=documents[ref.document],p=d?.passages?.[ref.passage];
  if(!d||!p?.locator||!p.support)fail('precise supporting passage required');
  if(!d.version||!d.publicationStatus||!d.access?.fullTextReviewed||!d.access?.reviewedAt||!/^([a-f\d]{64})$/.test(d.sha256||''))fail('inspected source version and full-text review required');
  if(ref.sha256!==d.sha256)fail('source artifact differs from reviewed version');
  if(![d.url,...d.aliases||[]].some(u=>reading.sourceUrls.includes(u)))fail('supporting document is not linked to this reading');
  for(const [id,f]of Object.entries(p.facts||{}))facts.push({...f,id,document:ref.document,passage:ref.passage});
 }
 for(const c of record.claims||[]){const f=facts.find(f=>f.id===c.fact&&f.document===c.document&&f.passage===c.passage);if(!f)fail('claim has no specific supporting fact '+c.fact);
  if(c.kind!==f.kind)fail('source-to-claim classification mismatch (causal / modeled / descriptive / proposed)');
  if(c.value!==undefined&&(c.value!==f.value||c.unit!==f.unit||c.denominator!==f.denominator))fail('unsupported numerical magnitude, unit or denominator');
  if(c.performed!==undefined&&c.performed!==f.performed)fail('proposed diagnostic represented as performed');
 }
 if(record.sourceAuthorEquivalence&&(!['reported','paraphrased'].includes(record.basis)||!record.claims?.length))fail('editorial analysis must not be attributed as a source-authored result');
 if(component.math){const m=record.mathematics;if(!m||!m.derivation||!m.omissions?.length||!m.notation?.length)fail('mathematical mapping, omissions and notation review required');
  if(record.basis==='reported'&&(!m.sourceTokens||component.tokens!==m.sourceTokens||!facts.some(f=>f.kind==='source-equation'&&f.tokens===m.sourceTokens)))fail('source-authored equation tokens differ');
  if(!['reported','editorial-reconstruction','calculated'].includes(record.basis))fail('equation origin must be explicit');
  for(const n of m.notation)if(n.sourceSymbol&&n.symbol.split('_')[0]===n.sourceSymbol.split('_')[0]&&n.meaning!==n.sourceMeaning)fail('notation conflicts with the source; choose a distinct symbol and document the mapping');
 }
 return true;
}
function validate({journal,evidence=require('./source-evidence.json')}={}){
 const readings=inventory(journal);let verified=0,incomplete=0;
 for(const id of historicalIds)if(!readings.some(r=>r.id===id))throw Error('L&L source evidence: missing historical reading '+id);
 for(const r of readings){if(!r.components.length)throw Error('L&L source evidence '+r.id+': substantive components and completed review required');const previous=evidence.readings[r.id],legacy=historicalIds.has(r.id)&&previous?.historical===true&&previous.edition===r.edition&&r.edition<=evidence.historicalThrough;
  for(const c of previous?.components||[])if(!r.components.some(x=>x.id===c.id))throw Error('L&L source evidence '+r.id+': missing reviewed/historical component '+c.id);
  for(const c of r.components){const rec=previous?.components.find(x=>x.id===c.id);
   if(legacy&&rec?.status==='incomplete'&&rec.sha256===c.sha256){incomplete++;continue;}
   check(rec,c,r,evidence.documents);verified++;
  }
 }
 return {readings:readings.length,verifiedComponents:verified,incompleteHistoricalComponents:incomplete,warning:incomplete?'Historical full-text verification remains incomplete; preservation is not substantive endorsement.':null};
}
module.exports={inventory,fingerprint,check,validate};
if(require.main===module)console.log(JSON.stringify(validate({journal:require('fs').readFileSync(require('path').join(__dirname,'index.html'),'utf8')}),null,2));
