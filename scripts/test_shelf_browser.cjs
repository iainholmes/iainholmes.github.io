/* WebKit shelf return-state, geometry, artwork and canonical-refresh regressions. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {webkit}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const origin=process.env.WB_ORIGIN||'http://127.0.0.1:8765',out=process.env.WB_QA_DIR||'/tmp/workbook-browser-qa';
const canonical=JSON.parse(fs.readFileSync('daily-econ-challenge/index.html','utf8').match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]).editions, latest=canonical.at(-1);
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(out,'cache'),{recursive:true});
let assertions=0;const errors=[];function check(value,message){assert(value,message);assertions++}function equal(a,b,message){assert.deepEqual(a,b,message);assertions++}
const locationKey='periodicals:reading:v2:/daily-econ-challenge/';
function fetchBytes(url){const file=path.join(out,'cache',crypto.createHash('sha256').update(url).digest('hex'));if(!fs.existsSync(file)){const bytes=cp.execFileSync('curl',['-fLsS','--max-time','30','--retry','2',url],{maxBuffer:16*1024*1024});fs.writeFileSync(file,bytes)}return fs.readFileSync(file)}
async function context(browser,viewport,standalone=false,storageState){
 const c=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900,deviceScaleFactor:1,storageState});
 c.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())})});
 await c.addInitScript(({standalone})=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.__copied.push(text)}});if(standalone){const original=matchMedia;window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:original(q)}},{standalone});
 await c.route('**/*',async route=>{const url=route.request().url(),p=new URL(url).pathname;let body;if(process.env.WB_FALLBACK_FONTS==='1'&&/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url))return route.fulfill({body:'',contentType:'text/css'});if(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)||process.env.WB_LIVE==='1'&&url.startsWith(origin))body=fetchBytes(url);else if(url.startsWith(origin)){const local=path.join(process.cwd(),decodeURIComponent(p),p.endsWith('/')?'index.html':'');if(!fs.existsSync(local))return route.fulfill({status:404,body:'Not found'});body=fs.readFileSync(local)}else return route.continue();const contentType=url.includes('fonts.googleapis.com')||p.endsWith('.css')?'text/css':p.endsWith('.woff2')?'font/woff2':p.endsWith('.js')?'application/javascript':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.json')?'application/json':p.endsWith('.otf')?'font/otf':'text/html';return route.fulfill({body,contentType,status:200})});
 return c;
}
async function ready(p){await p.waitForSelector('.pd-tools');await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});}
async function open(p,hash=''){await p.goto(origin+'/daily-econ-challenge/'+hash,{waitUntil:'load',timeout:120000});await ready(p)}

async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:false})}
async function settled(p){await ready(p);await p.evaluate(async()=>{await Promise.all(document.querySelector('.shelf').getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))});}
async function checkCaptions(page){
 await page.evaluate(()=>document.fonts.ready);
 const captions=await page.locator('[data-cover-caption]').evaluateAll(nodes=>nodes.map(node=>{
  const bounds=node.getBoundingClientRect(),frame=node.parentElement.getBoundingClientRect();
  return bounds.height>0&&bounds.bottom<=frame.bottom+1&&node.scrollWidth<=node.clientWidth+1;
 }));
 equal(captions,[true,true,true],'captions fit the original SVG footers');
}
async function geometry(p,key,mobile){await settled(p);const g=await p.locator('.cover').evaluateAll(es=>es.map(e=>({key:e.dataset.issueMark,transform:getComputedStyle(e).transform,recent:e.closest('.vol').classList.contains('recent'),interactive:e.closest('.vol').matches(':hover,:focus-visible'),aspect:getComputedStyle(e).aspectRatio,cue:e.closest('.vol').querySelectorAll('[data-recent-cue]').length,top:e.getBoundingClientRect().top,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})));equal(g.filter(x=>x.recent).map(x=>x.key),key?[key]:[],'exactly the current recent title');for(const x of g){equal(x.aspect,'3 / 4');equal(x.transform,mobile?'none':'matrix(1, 0, 0, 1, 0, '+((x.key===key?-8:0)+(x.interactive?-10:0))+')','predictable recent transform');equal(x.cue,x.key===key?1:0);check(Math.abs(x.width/x.height-.75)<.001)}if(mobile)check(Math.max(...g.map(x=>x.top))-Math.min(...g.map(x=>x.top))<1,'all mobile cover tops align');check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');return g;}
async function main(){const browser=await webkit.launch({headless:true,...process.env.WB_WEBKIT?{executablePath:process.env.WB_WEBKIT}:{},env:{...process.env,WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS:'1',WEBKIT_DISABLE_COMPOSITING_MODE:'1'}});const evidence=[];try{
 if(process.env.SHELF_METADATA_ONLY!=='1'){
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1440,height:900}]){
  const mobile=viewport.width<=1000,c=await context(browser,viewport,viewport.width===390);await c.addInitScript(()=>{window.__pageShows=[];addEventListener('pageshow',e=>window.__pageShows.push(e.persisted))});const p=await c.newPage();await p.goto(origin+'/personal-updates/',{waitUntil:'load',timeout:120000});await geometry(p,null,mobile);
  for(const [key,publication] of [['fb','daily-watchlist-5'],['sp','weekly-economics-environment'],['cp','daily-econ-challenge']]){
   const link=p.locator('.vol[href="../'+publication+'/"]');await link.click();await p.waitForURL(url=>url.pathname==='/'+publication+'/',{timeout:120000});await ready(p);
   if(key==='sp'){
    const stored=await p.locator('#field-studies').evaluate(e=>JSON.parse(e.textContent));
    for(const [date,study]of Object.entries(stored)){
     await p.goto(origin+'/weekly-economics-environment/#edition-'+date);await ready(p);
     const edition=p.locator('.edition:not([hidden])');equal(await edition.getAttribute('data-edition'),date,'L&L selected archive edition');
     // The unchanged image viewer adds only interactive attributes after mount.
     const rendered=await edition.locator('.hero-art').evaluate(e=>{const d=e.cloneNode(true),svg=d.querySelector('svg.pd-image');if(svg){svg.classList.remove('pd-image');if(!svg.className.baseVal)svg.removeAttribute('class');svg.setAttribute('role','img');svg.removeAttribute('tabindex');svg.removeAttribute('aria-label')}return d.innerHTML});
     equal(rendered,await p.evaluate(s=>{const d=document.createElement('div');d.innerHTML=s;return d.innerHTML},study.html),'frozen Field Study rendered unchanged '+date);
     equal(await edition.locator('article.entry').count(),5,'all five readings retained');check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'L&L archive has no page overflow');
    }
    await p.locator('.edition:not([hidden]) .hero-art').scrollIntoViewIfNeeded();await shot(p,'field-study-'+viewport.width+'x'+viewport.height);
    await p.goto(origin+'/weekly-economics-environment/');await ready(p);
   }
   await p.goBack({waitUntil:'load',timeout:120000});
   // The archive traversal above adds real browser-history entries.
   if(key==='sp'){await p.goto(origin+'/personal-updates/');await settled(p)}
   await geometry(p,key,mobile);
   await p.reload({waitUntil:'load',timeout:120000});await geometry(p,key,mobile);await link.hover();await geometry(p,key,mobile);await link.focus();await geometry(p,key,mobile);
   if(mobile){await p.evaluate(()=>document.querySelector('.shelf').scrollTo({left:0,behavior:'instant'}));for(let i=0;i<3;i++){await p.evaluate(i=>{const s=document.querySelector('.shelf'),u=s.querySelectorAll('.shelf-unit')[i];s.scrollTo({left:s.scrollLeft+u.getBoundingClientRect().left-s.getBoundingClientRect().left,behavior:'instant'})},i);await settled(p);await p.waitForFunction(k=>document.querySelector('.mobile-press-note').dataset.publication===k,['fb','sp','cp'][i]);equal(await p.locator('.mobile-press-note .press-note:not([hidden])').count(),1,'one stationary synchronized note');await geometry(p,key,true)}}
  }
  // A restored document must reread current localStorage, not retain yesterday's class.
  await p.evaluate(()=>{localStorage.setItem('periodicals:last',JSON.stringify({t:'fb',at:Date.now()}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))});await geometry(p,'fb',mobile);
  await p.evaluate(()=>{localStorage.setItem('periodicals:last',JSON.stringify({t:'sp',at:Date.now()}));dispatchEvent(new Event('focus'))});await geometry(p,'sp',mobile);
  await p.evaluate(()=>{localStorage.setItem('periodicals:last',JSON.stringify({t:'cp',at:Date.now()}));dispatchEvent(new StorageEvent('storage',{key:'periodicals:last'}))});await geometry(p,'cp',mobile);
  const cover=p.locator('[data-issue-mark="cp"]');equal(await cover.getAttribute('data-edition'),latest.date);equal(await cover.locator('[data-cover-caption]').textContent(),await p.locator('[data-cp="title"]').textContent());equal(await p.locator('[data-cp="count"]').textContent(),String(canonical.length));equal(await p.locator('[data-cp-depth]').textContent(),String(canonical.reduce((n,e)=>n+e.questions.length,0)));
  await p.evaluate(()=>document.querySelector('.shelf').scrollTo({left:0,behavior:'instant'}));await settled(p);await shot(p,'hub-'+viewport.width+'x'+viewport.height);console.log('Shelf return-state and geometry passed '+viewport.width+'x'+viewport.height);evidence.push({viewport,nativePageShows:await p.evaluate(()=>window.__pageShows)});await c.close();
 }

 // Next-run timing advances on restored documents under the current publication cadences.
 {const c=await context(browser,{width:390,height:844}),p=await c.newPage();await p.clock.install({time:new Date('2026-10-09T13:00:00Z')});await p.goto(origin+'/personal-updates/',{waitUntil:'load',timeout:120000});await settled(p);check((await p.locator('[data-next-clock="fb"]').textContent()).includes('Tomorrow'),'daily Field Brief includes Saturday');check((await p.locator('[data-next-clock="cp"]').textContent()).includes('Friday'));await p.clock.setSystemTime(new Date('2026-10-12T15:00:00Z'));await p.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));check((await p.locator('[data-next-clock="fb"]').textContent()).includes('Tomorrow'));check((await p.locator('[data-next-clock="cp"]').textContent()).includes('Friday'));check((await p.locator('[data-next-clock="sp"]').textContent()).includes('Friday'));await c.close();}
 }
 // Serve an isolated prepared release to an already-open hub.
 if(process.env.SHELF_FIXTURE&&process.env.WB_LIVE!=='1'){
  const c=await context(browser,{width:390,height:844}),p=await c.newPage();
  await p.goto(origin+'/personal-updates/',{waitUntil:'networkidle'});await settled(p);
  const hubUrl=origin+'/personal-updates/';
  const prepared=fs.readFileSync(path.join(process.env.SHELF_FIXTURE,'personal-updates/index.html'),'utf8');
  const current=fs.readFileSync('personal-updates/index.html','utf8');
  const readPairs=()=>p.evaluate(()=>[...document.querySelectorAll('[data-issue-mark]')].map(host=>{
   const key=host.dataset.issueMark,info=attr=>document.querySelector('[data-'+key+'="'+attr+'"]');
   return {key,date:host.dataset.edition,caption:host.querySelector('[data-cover-caption]').textContent,
    title:info('title').textContent,line:info('line').textContent,lineDate:info('line').dataset.hubEdition,count:info('count').textContent};
  }));
  await checkCaptions(p);
  const original=await readPairs();
  let response={status:503,body:'Unavailable'};
  await c.route(hubUrl,route=>route.request().resourceType()==='fetch'
   ? route.fulfill({...response,contentType:'text/html'}):route.fallback());
  async function refresh(event) {
   const received=p.waitForResponse(r=>r.url()===hubUrl&&r.request().resourceType()==='fetch');
   await p.evaluate(event=>dispatchEvent(event==='pageshow'?new PageTransitionEvent(event,{persisted:true}):new Event(event)),event);
   await received;
   await p.waitForLoadState('networkidle');
  }
  await refresh('focus');
  equal(await readPairs(),original,'failed deployment refresh preserves all three pairs');
  response={status:200,body:current};
  await refresh('pageshow');
  equal(await readPairs(),original,'a delayed edition retains all previously published pairs');
  response.body=prepared.replace(/data-hub-edition="[^"]*"/g,'data-hub-edition="2000-01-01"');
  await refresh('focus');
  equal(await readPairs(),original,'incomplete pairs cannot update either surface');
  response.body=prepared;
  await refresh('pageshow');
  const advanced=await readPairs();
  await checkCaptions(p);
  for(const [i,issue] of advanced.entries()){
   check(issue.date>original[i].date,'next prepared edition becomes current for '+issue.key);
   equal(issue.count,String(Number(original[i].count)+1));
   equal(issue.caption,issue.title,'the new caption and note agree');
   equal(issue.date,issue.lineDate,'the new cover and note use the same date');
  }
  response.body=current;
  await refresh('focus');
  equal(await readPairs(),advanced,'stale response cannot roll back a published pair');
  await c.close();
 }
 // No-script/offline fallback: the stored artwork and press note are self-contained.
 const c=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});await c.route('**/*',route=>{const url=route.request().url(),u=new URL(url);if(url.startsWith(origin)){const file=path.join(process.cwd(),u.pathname,u.pathname.endsWith('/')?'index.html':'');return route.fulfill({status:200,body:fs.existsSync(file)?fs.readFileSync(file):'',contentType:u.pathname.endsWith('.css')?'text/css':u.pathname.endsWith('.js')?'application/javascript':'text/html'})}return route.fulfill({status:200,body:''})});const p=await c.newPage();await p.goto(origin+'/personal-updates/');for(const key of ['fb','sp','cp'])equal(await p.locator('[data-issue-mark="'+key+'"] [data-cover-caption]').textContent(),await p.locator('[data-'+key+'="title"]').textContent());await checkCaptions(p);equal(await p.locator('[data-cp="count"]').textContent(),String(canonical.length));await c.close();equal(errors.filter(error=>!error.includes('503')),[],'no browser script errors');fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({assertions,evidence},null,2));console.log(assertions+' WebKit shelf/artwork/refresh assertions passed.');
 }finally{await browser.close()}}
main().catch(e=>{console.error(e);process.exitCode=1});
