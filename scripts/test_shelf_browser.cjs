/* WebKit shelf return-state, geometry, artwork and canonical-refresh regressions. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {webkit}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const origin=process.env.WB_ORIGIN||'http://127.0.0.1:8765',out=process.env.WB_QA_DIR||'/tmp/workbook-browser-qa';
const canonical=JSON.parse(fs.readFileSync('daily-econ-challenge/index.html','utf8').match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]).editions, latest=canonical.at(-1), pins=require('../personal-updates/issue-mark-archive.js');
const html=s=>s.replace(/&/g,'&amp;');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(out,'cache'),{recursive:true});
let assertions=0;const errors=[];function check(value,message){assert(value,message);assertions++}function equal(a,b,message){assert.deepEqual(a,b,message);assertions++}
const locationKey='periodicals:reading:v2:/daily-econ-challenge/';
function fetchBytes(url){const file=path.join(out,'cache',crypto.createHash('sha256').update(url).digest('hex'));if(!fs.existsSync(file)){const bytes=cp.execFileSync('curl',['-fLsS','--max-time','30','--retry','2',url],{maxBuffer:16*1024*1024});fs.writeFileSync(file,bytes)}return fs.readFileSync(file)}
async function context(browser,viewport,standalone=false,storageState){
 const c=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900,deviceScaleFactor:1,storageState});
 c.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())})});
 await c.addInitScript(({standalone})=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.__copied.push(text)}});if(standalone){const original=matchMedia;window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:original(q)}},{standalone});
 await c.route('**/*',async route=>{const url=route.request().url(),p=new URL(url).pathname;let body;if(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)||process.env.WB_LIVE==='1'&&url.startsWith(origin))body=fetchBytes(url);else if(url.startsWith(origin)){const local=path.join(process.cwd(),decodeURIComponent(p),p.endsWith('/')?'index.html':'');if(!fs.existsSync(local))return route.fulfill({status:404,body:'Not found'});body=fs.readFileSync(local)}else return route.continue();const contentType=url.includes('fonts.googleapis.com')||p.endsWith('.css')?'text/css':p.endsWith('.woff2')?'font/woff2':p.endsWith('.js')?'application/javascript':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.json')?'application/json':p.endsWith('.otf')?'font/otf':'text/html';return route.fulfill({body,contentType,status:200})});
 return c;
}
async function ready(p){await p.waitForSelector('.pd-tools');await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});}
async function open(p,hash=''){await p.goto(origin+'/daily-econ-challenge/'+hash,{waitUntil:'load',timeout:120000});await ready(p)}

async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:false})}
async function settled(p){await ready(p);await p.evaluate(async()=>{await Promise.all(document.querySelector('.shelf').getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))});}
async function geometry(p,key,mobile){await settled(p);const g=await p.locator('.cover').evaluateAll(es=>es.map(e=>({key:e.dataset.issueMark,transform:getComputedStyle(e).transform,recent:e.closest('.vol').classList.contains('recent'),interactive:e.closest('.vol').matches(':hover,:focus-visible'),aspect:getComputedStyle(e).aspectRatio,cue:e.closest('.vol').querySelectorAll('[data-recent-cue]').length,top:e.getBoundingClientRect().top,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})));equal(g.filter(x=>x.recent).map(x=>x.key),key?[key]:[],'exactly the current recent title');for(const x of g){equal(x.aspect,'3 / 4');equal(x.transform,mobile?'none':x.key===key?'matrix(1, 0, 0, 1, 0, -8)':x.interactive?'matrix(1, 0, 0, 1, 0, -10)':'none','predictable recent transform');equal(x.cue,x.key===key?1:0);check(Math.abs(x.width/x.height-.75)<.001)}if(mobile)check(Math.max(...g.map(x=>x.top))-Math.min(...g.map(x=>x.top))<1,'all mobile cover tops align');check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');return g;}
async function main(){const browser=await webkit.launch({headless:true,...process.env.WB_WEBKIT?{executablePath:process.env.WB_WEBKIT}:{},env:{...process.env,WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS:'1',WEBKIT_DISABLE_COMPOSITING_MODE:'1'}});const evidence=[];try{
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
  const cover=p.locator('[data-issue-mark="cp"]');equal(await cover.getAttribute('data-edition'),latest.date);check((await cover.innerHTML()).includes(html(pins['cp:'+latest.date].phrase)));equal(await p.locator('[data-cp="count"]').textContent(),String(canonical.length));equal(await p.locator('[data-cp-depth]').textContent(),String(canonical.reduce((n,e)=>n+e.questions.length,0)));
  await p.evaluate(()=>document.querySelector('.shelf').scrollTo({left:0,behavior:'instant'}));await settled(p);await shot(p,'hub-'+viewport.width+'x'+viewport.height);console.log('Shelf return-state and geometry passed '+viewport.width+'x'+viewport.height);evidence.push({viewport,nativePageShows:await p.evaluate(()=>window.__pageShows)});await c.close();
 }

 // Next-run timing advances on restored documents under the current publication cadences.
 {const c=await context(browser,{width:390,height:844}),p=await c.newPage();await p.clock.install({time:new Date('2026-10-09T13:00:00Z')});await p.goto(origin+'/personal-updates/',{waitUntil:'load',timeout:120000});await settled(p);check((await p.locator('[data-next-clock="fb"]').textContent()).includes('Tomorrow'),'daily Field Brief includes Saturday');check((await p.locator('[data-next-clock="cp"]').textContent()).includes('Friday'));await p.clock.setSystemTime(new Date('2026-10-12T15:00:00Z'));await p.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));check((await p.locator('[data-next-clock="fb"]').textContent()).includes('Tomorrow'));check((await p.locator('[data-next-clock="cp"]').textContent()).includes('Friday'));check((await p.locator('[data-next-clock="sp"]').textContent()).includes('Friday'));await c.close();}
 // Model a newly published canonical page while this hub document stays alive.
 if(process.env.SHELF_FIXTURE&&process.env.WB_LIVE!=='1'){
  const c=await context(browser,{width:390,height:844}),p=await c.newPage();await p.goto(origin+'/personal-updates/',{waitUntil:'load',timeout:120000});await settled(p);
  const fixture=process.env.SHELF_FIXTURE;await c.route(origin+'/daily-econ-challenge/',route=>route.fulfill({status:200,contentType:'text/html',body:fs.readFileSync(path.join(fixture,'daily-econ-challenge/index.html'))}));
  const archiveContext={module:{exports:{}}};require('node:vm').runInNewContext(fs.readFileSync(path.join(fixture,'personal-updates/issue-mark-archive.js'),'utf8'),archiveContext);const future=JSON.parse(fs.readFileSync(path.join(fixture,'daily-econ-challenge/index.html'),'utf8').match(/id="challenge-data">([\s\S]*?)<\/script>/)[1]).editions.at(-1),expected=archiveContext.module.exports['cp:'+future.date].frozen;
  for(const event of ['focus','pageshow']){await p.evaluate(event=>dispatchEvent(event==='pageshow'?new PageTransitionEvent(event,{persisted:true}):new Event(event)),event);await p.waitForFunction(date=>document.querySelector('[data-issue-mark="cp"]').dataset.edition===date,future.date);equal(await p.locator('[data-issue-mark="cp"]').innerHTML(),await p.evaluate(s=>{const d=document.createElement('div');d.innerHTML=s;return d.innerHTML},expected),'dynamic new cover equals prepared static cover');equal(await p.locator('[data-cp="count"]').textContent(),String(canonical.length+1));equal(await p.locator('[data-cp-depth]').textContent(),String(canonical.reduce((n,e)=>n+e.questions.length,0)+future.questions.length));equal(await p.locator('[data-cp="title"]').textContent(),future.questions.length+' questions · '+new Set(future.questions.map(q=>q.field)).size+' fields');check((await p.locator('[data-cp="line"]').textContent()).includes(String(future.no).padStart(3,'0')+' · '+new Date(future.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})))}
  await p.reload({waitUntil:'load',timeout:120000});await settled(p);await p.waitForFunction(date=>document.querySelector('[data-issue-mark="cp"]').dataset.edition===date,future.date);equal(await p.locator('[data-cp="count"]').textContent(),String(canonical.length+1));await c.close();
 }
 // No-script/offline fallback: the stored artwork and press note are self-contained.
 const c=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});await c.route('**/*',route=>{const url=route.request().url(),u=new URL(url);if(url.startsWith(origin)){const file=path.join(process.cwd(),u.pathname,u.pathname.endsWith('/')?'index.html':'');return route.fulfill({status:200,body:fs.existsSync(file)?fs.readFileSync(file):'',contentType:u.pathname.endsWith('.css')?'text/css':u.pathname.endsWith('.js')?'application/javascript':'text/html'})}return route.fulfill({status:200,body:''})});const p=await c.newPage();await p.goto(origin+'/personal-updates/');check((await p.locator('[data-issue-mark="cp"]').innerHTML()).includes(html(pins['cp:'+latest.date].phrase)));equal(await p.locator('[data-cp="count"]').textContent(),String(canonical.length));await c.close();equal(errors,[],'no browser script errors');fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({assertions,evidence},null,2));console.log(assertions+' WebKit shelf/artwork/refresh assertions passed.');
 }finally{await browser.close()}}
main().catch(e=>{console.error(e);process.exitCode=1});
