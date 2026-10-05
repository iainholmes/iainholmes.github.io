/* Real-browser Workbook regressions. Run against a served checkout or deployed origin. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {webkit}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const origin=process.env.WB_ORIGIN||'http://127.0.0.1:8765',out=process.env.WB_QA_DIR||'/tmp/workbook-browser-qa';
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(out,'cache'),{recursive:true});
let assertions=0;const errors=[];function check(value,message){assert(value,message);assertions++}function equal(a,b,message){assert.deepEqual(a,b,message);assertions++}
const locationKey='periodicals:reading:v2:/daily-econ-challenge/';
function fetchBytes(url){const file=path.join(out,'cache',crypto.createHash('sha256').update(url).digest('hex'));if(!fs.existsSync(file)){const bytes=cp.execFileSync('curl',['-fLsS','--max-time','30','--retry','2',url],{maxBuffer:16*1024*1024});fs.writeFileSync(file,bytes)}return fs.readFileSync(file)}
async function context(browser,viewport,standalone=false,storageState){
 const c=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900,deviceScaleFactor:1,storageState});
 c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await c.addInitScript(({standalone})=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.__copied.push(text)}});if(standalone){const original=matchMedia;window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:original(q)}},{standalone});
 await c.route('**/*',async route=>{const url=route.request().url(),p=new URL(url).pathname;let body;if(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)||process.env.WB_LIVE==='1'&&url.startsWith(origin))body=fetchBytes(url);else if(url.startsWith(origin)){const local=path.join(process.cwd(),decodeURIComponent(p),p.endsWith('/')?'index.html':'');if(!fs.existsSync(local))return route.fulfill({status:404,body:'Not found'});body=fs.readFileSync(local)}else return route.continue();const contentType=url.includes('fonts.googleapis.com')||p.endsWith('.css')?'text/css':p.endsWith('.woff2')?'font/woff2':p.endsWith('.js')?'application/javascript':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.json')?'application/json':p.endsWith('.otf')?'font/otf':'text/html';return route.fulfill({body,contentType,status:200})});
 return c;
}
async function ready(p){await p.waitForSelector('.pd-tools');await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});}
async function open(p,hash=''){await p.goto(origin+'/daily-econ-challenge/'+hash,{waitUntil:'load',timeout:120000});await ready(p)}
async function state(p,date){return p.evaluate(date=>JSON.parse(localStorage.getItem('dec:v1:'+date)),date)}
async function saved(p){return p.evaluate(key=>JSON.parse(localStorage.getItem(key)),locationKey)}
async function records(p){return p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('dec:v1:')||k.includes('/daily-econ-challenge/'))))}
async function overflow(p,label){check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' has no page overflow')}
async function go(p,i){await p.locator('[data-go="'+i+'"]').click();await ready(p)}
async function ledger(p){if(!await p.locator('.ledger-manage').count())await p.locator('.ledger-head').click();await p.waitForSelector('.ledger-manage');await ready(p)}
async function reset(p){await ledger(p);await p.locator('[data-act="start-fresh"]').click();await p.locator('[data-act="confirm-reset"]').click();await p.waitForSelector('.q');await ready(p)}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:false})}
async function ledgerMap(p,label){
 const rows=await p.evaluate(()=>JSON.parse(document.getElementById('challenge-data').textContent).editions.map(e=>{
  const state=JSON.parse(localStorage.getItem('dec:v1:'+e.date))||{},row=document.querySelector('table.index [data-date="'+e.date+'"]').closest('tr'),style=getComputedStyle(row),boxes=[...row.querySelectorAll('.record i')];
  return {date:e.date,text:row.querySelector('.mine').textContent,expected:e.questions.map(q=>!!(state.answers&&state.answers[q.id]?.length)),empty:style.getPropertyValue('--sheet').trim(),boxes:boxes.map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {answered:el.classList.contains('a'),color:s.backgroundColor,image:s.backgroundImage,width:r.width,height:r.height}})};
 }));
 for(const r of rows){
  equal(r.boxes.map(b=>b.answered),r.expected,label+' '+r.date+' maps the actual saved question IDs');
  check(r.text.includes(r.expected.filter(Boolean).length+' of '+r.expected.length+' answered'),label+' text and boxes agree');
  for(let i=0;i<r.boxes.length;i++){
   const b=r.boxes[i],hex=r.empty.slice(1),empty='rgb('+[0,2,4].map(n=>parseInt(hex.slice(n,n+2),16)).join(', ')+')';
   equal(b.color,r.expected[i]?'rgb(169, 199, 236)':empty,label+' '+r.date+' Q'+(i+1)+' uses existing powder blue or empty sheet');
   equal(b.image,'none',label+' Ledger progress is distinct from solution correctness');
   check(b.width===11&&b.height===11,label+' preserves existing box geometry');
  }
 }
 return rows;
}
async function main(){
 const browser=await webkit.launch({headless:true,...process.env.WB_WEBKIT?{executablePath:process.env.WB_WEBKIT}:{},env:{...process.env,WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS:'1',WEBKIT_DISABLE_COMPOSITING_MODE:'1'}});
 try{
  let c=await context(browser,{width:390,height:844}),p=await c.newPage();await open(p);
  const data=await p.evaluate(()=>JSON.parse(document.getElementById('challenge-data').textContent)),editions=data.editions.slice().sort((a,b)=>a.date.localeCompare(b.date));
  equal(editions.length,5);equal(editions.reduce((n,e)=>n+e.questions.length,0),40);
  // Acceptance regression: non-adjacent saved answers, genuine reopen/Resume, and both reset scopes.
  const mapped=editions[1],other=editions[2];await ledger(p);await ledgerMap(p,'pristine');
  await p.locator('[data-date="'+mapped.date+'"].pd-edition-entry').click();await ready(p);
  for(const i of [1,4]){await go(p,i);await p.locator('[data-opt="0"]').click()}
  const mapAnswers=(await state(p,mapped.date)).answers;equal(Object.keys(mapAnswers).sort(),['q2','q5']);
  await p.locator('.pd-tools a').filter({hasText:'Titles'}).click();await p.waitForURL('**/personal-updates/');const mapVisit=await c.storageState();await c.close();c=await context(browser,{width:390,height:844},true,mapVisit);p=await c.newPage();await open(p);
  await p.locator('.pd-resume button').click();await p.waitForFunction(d=>location.hash==='#'+d+'/q5',mapped.date);await ready(p);equal((await state(p,mapped.date)).answers,mapAnswers,'Resume preserves the exact sparse answered map');
  await ledger(p);await ledgerMap(p,'reopened Resume');await p.reload();await ready(p);await ledgerMap(p,'reloaded Ledger');
  for(const mode of ['day','night']){await p.locator('button[data-mode="'+mode+'"]').click();await ledgerMap(p,mode);await shot(p,'mapped-ledger-'+mode)}
  await p.locator('[data-date="'+other.date+'"].pd-edition-entry').click();await ready(p);for(const i of [0,7]){await go(p,i);await p.locator('[data-opt="0"]').click()}
  await ledger(p);const beforeRetake=await records(p);await p.locator('[data-retake="'+mapped.date+'"]').click();await p.locator('[data-act="cancel-reset"]').click();equal(await records(p),beforeRetake,'cancelled Retake leaves every box recorded');
  await p.locator('[data-retake="'+mapped.date+'"]').click();await p.locator('[data-act="confirm-reset"]').click();await ready(p);await ledger(p);await ledgerMap(p,'per-set Retake');equal((await state(p,mapped.date)).answers,{});equal(Object.keys((await state(p,other.date)).answers).sort(),['q1','q8'],'Retake clears only its own map');
  await p.locator('[data-date="'+other.date+'"].pd-edition-entry').click();await ready(p);for(let i=0;i<8;i++){await go(p,i);if(!(await state(p,other.date)).answers[other.questions[i].id]?.length)await p.locator('[data-opt="0"]').click()}
  await p.locator('[data-act="submit"]').click();await p.waitForSelector('.results');check(await p.locator('.record.big i').evaluateAll(es=>es.length===8&&es.every(e=>e.classList.contains('r')||e.classList.contains('w'))),'solution correctness strips retain their original semantics');await ledger(p);await ledgerMap(p,'completed 8/8');
  const beforeFresh=await records(p);await p.locator('[data-act="start-fresh"]').click();await p.locator('[data-act="cancel-reset"]').click();equal(await records(p),beforeFresh,'cancelled Start Fresh preserves all maps');await reset(p);await ledger(p);const freshMaps=await ledgerMap(p,'Start Fresh');check(freshMaps.every(r=>r.expected.every(v=>!v)),'Start Fresh empties all eight boxes of every set');await p.locator('button[data-mode="day"]').click();
  // Exercise every authored pair through the actual controls, including all three answer kinds.
  for(const e of editions){
   await ledger(p);await p.locator('a.pd-edition-entry[data-date="'+e.date+'"]').click();await p.waitForSelector('.q');await ready(p);
   for(let i=0;i<e.questions.length;i++){
    const q=e.questions[i];await go(p,i);equal(await p.locator('.q-num').textContent(),'Q'+(i+1));
    const help=p.locator('details[data-learning="assistance"]');equal(await help.count(),1);equal(await p.locator('details[data-learning="explanation"]').count(),0,'Explanation is absent before commitment');
    await help.locator('summary').click();await p.waitForFunction(id=>JSON.parse(localStorage.getItem('dec:v1:'+location.hash.slice(1,11))).learning[id]?.assistanceUsed,q.id);
    check(await help.evaluate(el=>el.open));check(await help.locator('.learning-material').isVisible());
    await help.locator('summary').click();await help.locator('summary').click();equal((await state(p,e.date)).learning[q.id].assistanceUsed,true);await help.locator('summary').click();
    await p.locator('[data-opt="0"]').click();equal(await p.locator('details[data-learning="explanation"]').count(),0,'draft selection does not reveal an answer');
    await p.locator('[data-act="answer"]').click();await p.waitForSelector('details[data-learning="explanation"]');const explanation=p.locator('details[data-learning="explanation"]');equal(await explanation.count(),1,'No. '+e.no+' '+q.id+' reveals Explanation after commitment: '+JSON.stringify(await state(p,e.date)));check(!await explanation.evaluate(el=>el.open));
    await explanation.locator('summary').click();check(await explanation.locator('.learning-material').isVisible());
    equal(await explanation.locator('.learning-material').evaluate((el,html)=>{const expected=document.createElement('div');expected.innerHTML=html;return el.textContent.includes(expected.textContent)},q.explanation),true,'actual authored explanation is displayed');
    await p.reload();await ready(p);check(await p.locator('details[data-learning="explanation"]').evaluate(el=>el.open),'answered question keeps Explanation on reload');
    await p.locator('details[data-learning="explanation"] summary').click();check(!await p.locator('details[data-learning="explanation"]').evaluate(el=>el.open),'Explanation collapses');
    await p.locator('details[data-learning="explanation"] summary').click();check(await p.locator('details[data-learning="explanation"]').evaluate(el=>el.open));
    equal((await saved(p)).question,i);equal((await saved(p)).edition,e.date);await overflow(p,'No. '+e.no+' Q'+(i+1));
   }
   equal(Object.values((await state(p,e.date)).learning).filter(v=>v.assistanceUsed).length,8,'eight questions, not toggle count');
   console.log('All eight learning interactions passed for No. '+String(e.no).padStart(3,'0'));
  }
  const last=editions.at(-1),before=await state(p,last.date),expectedScore=last.questions.filter(q=>JSON.stringify(q.correct.slice().sort())===JSON.stringify(before.answers[q.id].slice().sort())).length;
  await p.locator('[data-act="submit"]').click();await p.waitForSelector('.results');equal(await p.locator('.score').textContent(),expectedScore+'/8','Assistance does not modify scoring');
  await go(p,2);equal((await saved(p)).question,2,'completed solution navigation updates Resume');
  const geometry=await p.locator('#sol-3').evaluate(el=>({top:el.getBoundingClientRect().top,header:document.querySelector('.runhead').getBoundingClientRect().bottom}));check(geometry.top>=geometry.header-1&&geometry.top<200,'completed solution is framed below sticky header');
  const solution=p.locator('#sol-5 details[data-learning="explanation"]');if(await solution.evaluate(el=>el.open))await solution.locator('summary').click();await solution.locator('summary').click();await p.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).question===4,locationKey);equal(new URL(p.url()).hash,'#'+last.date+'/q5','opening a worked solution updates the actual last-viewed question');
  await p.goto(origin+'/personal-updates/');const completedVisit=await c.storageState();await c.close();c=await context(browser,{width:390,height:844},false,completedVisit);p=await c.newPage();await open(p);await p.locator('.pd-resume button').click();await p.waitForFunction(d=>location.hash==='#'+d+'/q5',last.date);await ready(p);equal((await state(p,last.date)).submitted,true);check(await p.locator('#sol-5 details[data-learning="explanation"]').evaluate(el=>el.open),'completed solution Resume preserves its recorded learning state');
  await p.locator('[data-act="copy"]').click();check((await p.evaluate(()=>window.__copied)).some(x=>x.includes(expectedScore+'/8')));
  await p.locator('[data-act="retake"]').click();await p.waitForSelector('.reset-confirm');const retakeSnapshot=await records(p);await p.locator('[data-act="cancel-reset"]').click();equal(await records(p),retakeSnapshot,'cancelling a set retake is inert');
  await p.locator('[data-retake="'+last.date+'"]').click();await p.locator('[data-act="confirm-reset"]').click();await ready(p);equal((await state(p,last.date)).answers,{});check(Object.keys((await state(p,editions[1].date)).answers).length===8,'per-set retake keeps other sets');
  await reset(p);const old=editions[1];await ledger(p);await p.locator('[data-date="'+old.date+'"].pd-edition-entry').click();await ready(p);await go(p,0);await p.locator('[data-opt="0"]').click();await go(p,4);
  equal((await saved(p)).edition,old.date);equal((await saved(p)).question,4,'unanswered last viewed question is recorded');const answers=(await state(p,old.date)).answers;
  // Leave through the existing Titles link, then open a new browser context with persisted storage.
  await p.locator('.pd-tools a').filter({hasText:'Titles'}).click();await p.waitForURL('**/personal-updates/');const persisted=await c.storageState();await c.close();c=await context(browser,{width:390,height:844},true,persisted);p=await c.newPage();await open(p);
  await p.waitForSelector('.pd-resume:not([hidden])');check((await p.locator('.pd-resume').textContent()).includes('No. 002 · Question 5 of 8'));equal(await p.locator('.pd-resume button').count(),1);equal(await p.locator('.pd-resume button').textContent(),'Resume');
  await shot(p,'portrait-resume');await p.locator('.pd-resume button').click();await p.waitForFunction(d=>location.hash==='#'+d+'/q5',old.date);await ready(p);equal((await state(p,old.date)).answers,answers);equal(await p.locator('.q-num').textContent(),'Q5');
  await p.locator('[data-act="next"]').click();equal((await saved(p)).question,5);await p.locator('[data-act="prev"]').click();equal((await saved(p)).question,4);await p.locator('[data-opt="0"]').click();await p.locator('[data-act="answer"]').click();
  await p.reload();await ready(p);equal(await p.locator('.q-num').textContent(),'Q5');equal(await p.locator('details[data-learning="explanation"]').count(),1);await p.goto(origin+'/personal-updates/');const answeredVisit=await c.storageState();await c.close();c=await context(browser,{width:390,height:844},false,answeredVisit);p=await c.newPage();await open(p);await p.locator('.pd-resume button').click();await p.waitForFunction(d=>location.hash==='#'+d+'/q5',old.date);await ready(p);equal(await p.locator('details[data-learning="explanation"]').count(),1,'answered last location resumes without erasing work');
  await p.evaluate(key=>localStorage.removeItem(key),locationKey);await p.reload();await ready(p);await open(p);await p.waitForSelector('.pd-resume:not([hidden])');check((await p.locator('.pd-resume').textContent()).includes('No. 002 · Question 5 of 8'),'native Workbook records reconstruct a missing shared location');await p.locator('.pd-resume button').click();await p.waitForFunction(d=>location.hash==='#'+d+'/q5',old.date);await ready(p);
  await p.locator('#homeLink').click();await ready(p);equal((await saved(p)).edition,last.date,'latest title explicitly changes last viewed set');await ledger(p);await p.locator('[data-date="'+old.date+'"].pd-edition-entry').click();await ready(p);equal((await saved(p)).edition,old.date);equal((await saved(p)).question,4,'older set restores its recorded current question');
  // Clear all only after explicit acceptance; mode and other publications' records survive.
  await p.evaluate(()=>{localStorage.setItem('commonplace:test','kept');localStorage.setItem('rupert:test','frozen');localStorage.setItem('periodicals:reading:v2:/daily-watchlist-5/','kept')});await ledger(p);const snapshot=await records(p);await p.locator('[data-act="start-fresh"]').click();equal(await records(p),snapshot);await shot(p,'portrait-start-fresh-confirmation');await p.locator('[data-act="cancel-reset"]').click();equal(await records(p),snapshot);await p.locator('[data-act="start-fresh"]').click();await p.locator('[data-act="confirm-reset"]').click();await ready(p);
  equal(new URL(p.url()).hash,'#'+editions[0].date+'/q1');equal(await p.locator('.q-num').textContent(),'Q1');const pristine=await state(p,editions[0].date);equal(pristine.answers,{});equal(pristine.learning,{});equal(pristine.committed,{});check(!pristine.submitted);equal(await p.locator('details[data-learning="explanation"]').count(),0);equal(await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('dec:v1:')).length),1);equal(await p.evaluate(()=>[localStorage.getItem('commonplace:test'),localStorage.getItem('rupert:test'),localStorage.getItem('periodicals:reading:v2:/daily-watchlist-5/')]),['kept','frozen','kept']);
  await p.goto(origin+'/personal-updates/');await open(p);await p.waitForSelector('.pd-resume:not([hidden])');check((await p.locator('.pd-resume').textContent()).includes('No. 001 · Question 1 of 8'),'fresh Resume has no stale question');await c.close();
  // Geometry and representative math/table/output content at each responsive size.
  for(const v of [{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:768,height:1024},{width:1440,height:900}]){
   c=await context(browser,v);p=await c.newPage();await open(p,'#'+old.date+'/q4/solution');equal(await p.locator('details[data-learning="explanation"]').count(),0,'direct solution route cannot expose an uncommitted answer');await p.locator('details[data-learning="assistance"] summary').click();await ready(p);await overflow(p,'expanded table '+v.width);check(await p.locator('.learning-material table').isVisible());await shot(p,'table-'+v.width);
   await open(p,'#'+editions[0].date+'/q7');await p.locator('details[data-learning="assistance"] summary').click();await overflow(p,'expanded output '+v.width);check(await p.locator('.learning-material pre').isVisible());await shot(p,'output-'+v.width);
   await open(p,'#'+last.date+'/q2');await p.locator('details[data-learning="assistance"] summary').click();await p.locator('[data-opt="0"]').click();await p.locator('[data-act="answer"]').click();await p.locator('details[data-learning="explanation"] summary').click();await overflow(p,'expanded Explanation '+v.width);await shot(p,'explanation-'+v.width);
   const fonts=await p.evaluate(()=>Object.fromEntries(['.ps-title h1','.ps-folio','.stem','.learning summary','.learning-material','.learning-material pre'].map(s=>[s,document.querySelector(s)?getComputedStyle(document.querySelector(s)).fontFamily:null])));check(fonts['.ps-title h1'].includes('STIX Two Text'));check(fonts['.ps-folio'].includes('STIX Two Text'));check(fonts['.stem'].includes('STIX Two Text'));check(fonts['.learning summary'].includes('Instrument Sans'));check(fonts['.learning-material pre'].includes('JetBrains Mono'));check(await p.evaluate(()=>document.fonts.check('16px "STIX Two Text"')&&document.fonts.check('12px "Instrument Sans"')));
   const targets=await p.locator('.learning summary').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));check(targets.every(h=>h>=44),'inline controls preserve touch height');
   await p.locator('button[data-mode="night"]').click();check(await p.locator('html').getAttribute('data-mode')==='night');await p.locator('button[data-mode="day"]').click();await p.locator('.pd-tools button').filter({hasText:'Share'}).click();check((await p.evaluate(()=>window.__copied)).some(url=>url.includes(last.date)));
   await p.locator('.pd-tools button').filter({hasText:'‹ Prev'}).click();await p.waitForFunction(d=>location.hash==='#'+d,editions.at(-2).date);await ready(p);equal((await saved(p)).edition,editions.at(-2).date);await p.locator('.pd-tools button').filter({hasText:'Next ›'}).click();await p.waitForFunction(d=>location.hash==='#'+d,last.date);await ready(p);equal((await saved(p)).edition,last.date);
   await open(p,'#'+old.date+'/q2');await p.locator('[data-opt="0"]').click();await go(p,4);await p.locator('[data-opt="0"]').click();
   await p.locator('.pd-tools button').filter({hasText:'Index'}).click();await ready(p);await overflow(p,'Ledger '+v.width);await ledgerMap(p,'responsive '+v.width);check(await p.locator('.archive').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Ledger records fit their available width');check(await p.locator('[data-act="start-fresh"]').isVisible());await shot(p,'ledger-'+v.width);await p.locator('button[data-mode="night"]').click();await ledgerMap(p,'responsive night '+v.width);await shot(p,'ledger-night-'+v.width);await p.locator('button[data-mode="day"]').click();await p.locator('[data-act="start-fresh"]').click();await overflow(p,'confirmation '+v.width);await p.locator('[data-act="cancel-reset"]').click();check(await p.locator('[data-act="start-fresh"]').evaluate(el=>el===document.activeElement),'Cancel returns focus');
   const ledgerText=await p.locator('table.index').textContent();check(ledgerText.includes('Assistance used 1×'));await c.close();console.log('Responsive Workbook checks passed at '+v.width+'×'+v.height);
  }
  equal(errors,[],'no JavaScript errors during all-question interaction');
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({assertions,questions:40,engine:'WebKit',origin,viewports:['390×844','320×568','844×390','768×1024','1440×900'],standaloneEquivalent:true},null,2));console.log(assertions+' real-browser Workbook assertions passed.');
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
