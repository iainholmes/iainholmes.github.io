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
async function navigate(p,url){await p.goto(origin+url,{waitUntil:'load',timeout:120000});await ready(p)}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png')})}
async function overflow(p,label){check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' no horizontal overflow')}
async function selected(p,date){await navigate(p,'/weekly-economics-environment/#edition-'+date);await p.waitForFunction(d=>!document.querySelector('[data-edition="'+d+'"]').hidden,date);await ready(p)}
(async()=>{
 const browser=await webkit.launch({executablePath:process.env.WB_WEBKIT,headless:true,env:{...process.env,WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS:'1',WEBKIT_DISABLE_COMPOSITING_MODE:'1'}}),evidence=[];
 try{
 for(const viewport of [{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:768,height:1024},{width:1280,height:720},{width:1440,height:900}]){
  const c=await context(browser,viewport,viewport.width===390),p=await c.newPage();
  // Canonical and legacy keys count in place; the hub never rewrites the saved records.
  await c.addInitScript(()=>{const items={};['fb','ll','wb','sp','cp'].forEach((key,i)=>items['saved-'+i]={publicationKey:key,title:'Kept fixture '+key});localStorage.setItem('periodicals:commonplace:v1',JSON.stringify({version:1,items}));});
  await navigate(p,'/personal-updates/');const snapshot=await p.evaluate(()=>localStorage.getItem('periodicals:commonplace:v1'));
  for(const [key,n] of [['fb','1'],['sp','2'],['cp','2']])equal(await p.locator('[data-kept="'+key+'"]').textContent(),n,'canonical and legacy '+key+' keeps');
  equal(await p.evaluate(()=>localStorage.getItem('periodicals:commonplace:v1')),snapshot,'hub leaves saved records intact');
  if(viewport.width<=1000){
   for(let i=0;i<3;i++){
    await p.evaluate(i=>{const s=document.querySelector('.shelf'),u=s.children[i];s.scrollTo({left:u.offsetLeft-s.firstElementChild.offsetLeft,behavior:'auto'})},i);
    await p.waitForFunction(i=>[...document.querySelectorAll('.mobile-press-note>.press-note')].findIndex(e=>!e.hidden)===i,i);await ready(p);
    const metrics=p.locator('.mobile-press-note>.press-note:not([hidden]) .metric-run');const visible=await metrics.locator('span').evaluateAll(es=>es.filter(x=>getComputedStyle(x).display!=='none').map(x=>x.textContent.trim()));equal(visible.length,3,'three visible mobile metrics');check(visible[2].includes('kept here'),'local keeps label');check(/editions|sets/.test(visible[0])&&/stories|readings|questions/.test(visible[1]),'publication terminology');
    await metrics.scrollIntoViewIfNeeded();await overflow(p,'hub '+viewport.width);await shot(p,'hub-'+viewport.width+'-'+i);
   }
  }else{await p.locator('.press-note').first().scrollIntoViewIfNeeded();await shot(p,'hub-'+viewport.width)}
  for(const [date,no] of [['2026-09-25','001'],['2026-10-02','002'],['2026-10-09','003']]){
   await selected(p,date);const ed=p.locator('[data-edition="'+date+'"]');equal(await p.locator('#closingNo').textContent(),no,'footer follows selected edition');
   equal(await ed.evaluate(e=>e.parentElement.tagName),'MAIN','editions are siblings in main');
   equal(await ed.locator('.reading-column>.entry').count(),5,'five principal readings');equal(await ed.locator('.reading-column .synthesis,.reading-column .knowledge,.reading-column .editorial-note').count(),0,'conclusions outside sticky article boundary');
   await overflow(p,'L&L '+date+' '+viewport.width);
   if(viewport.width>820){
    await ed.locator('.entry').nth(2).scrollIntoViewIfNeeded();await p.evaluate(()=>scrollBy(0,200));await ready(p);const sidebar=await ed.locator('.contents').boundingBox();check(sidebar.y>=69&&sidebar.y<=71,'rail remains sticky through articles');
    await ed.locator('.synthesis').evaluate(e=>e.scrollIntoView({block:'start',behavior:'auto'}));await ready(p);const geometry=await ed.evaluate(e=>({sidebarBottom:e.querySelector('.contents').getBoundingClientRect().bottom,synthesisTop:e.querySelector('.synthesis').getBoundingClientRect().top}));check(geometry.sidebarBottom<=geometry.synthesisTop+1,'rail has scrolled away before synthesis');evidence.push({viewport,date,...geometry});if(date==='2026-10-09')await shot(p,'sidebar-end-'+viewport.width);
   }
   if(viewport.width<=1024){
    equal(await ed.locator('.heron-perch').count(),2,'exactly two configured mobile perches');const button=ed.locator('.heron-perch').first(),slot=ed.locator('.perch').first();await button.scrollIntoViewIfNeeded();check(await button.isVisible(),'initial standing bird plus label');equal(await button.locator('.pose-perched').evaluate(e=>getComputedStyle(e).display),'block');await button.click();equal(await button.getAttribute('aria-expanded'),'true');check(await slot.locator('.heron-panel').isVisible());equal(await button.locator('.pose-inspect').evaluate(e=>getComputedStyle(e).display),'block');
    await slot.locator('.hp-close').click();check(await button.isVisible(),'close retains label');check(await button.evaluate(e=>e.classList.contains('vacant')),'close removes bird');await button.click();check(await slot.locator('.heron-panel').isVisible(),'label reopens');await slot.locator('.hp-dismiss').click();check(!await button.isVisible(),'dismiss hides both');
    const second=ed.locator('.heron-perch').nth(1);await p.locator('.heron-toggle').click();check(!await second.isVisible(),'Heron off suppresses remaining perch');await p.locator('.heron-toggle').click();check(await second.isVisible(),'Heron on restores remaining perch');
   }else{equal(await ed.locator('.heron-perch').count(),0,'desktop has no Heron perches')}
  }
  await selected(p,'2026-10-09');await p.locator('#glance-mode').click();check(await p.locator('body').evaluate(e=>e.classList.contains('glance')),'At a glance remains functional');await p.locator('#full-mode').click();check(!await p.locator('body').evaluate(e=>e.classList.contains('glance')),'Full Edition remains functional');await p.locator('.hero-art[data-field-study="2026-10-09"]').scrollIntoViewIfNeeded();await shot(p,'study-'+viewport.width);await p.locator('.closing-wordmark').scrollIntoViewIfNeeded();await shot(p,'closing-'+viewport.width);
  const footer=await p.locator('.closing-wordmark').evaluate(e=>{const a=e.children[0].getBoundingClientRect(),b=e.children[1].getBoundingClientRect();return {wordBottom:a.bottom,folioBottom:b.bottom,wordRight:a.right,folioLeft:b.left,font:getComputedStyle(e).fontFamily}});check(footer.wordRight<footer.folioLeft,'footer wordmark and folio do not collide');check(Math.abs(footer.wordBottom-footer.folioBottom)<8,'footer baseline alignment');evidence.push({viewport,footer});
  for(const mode of ['night','day']){await p.locator('.dn button[data-mode="'+mode+'"]').click();equal(await p.locator('html').getAttribute('data-mode'),mode);await overflow(p,'L&L '+mode);if(mode==='night')await shot(p,'closing-night-'+viewport.width)}
  await navigate(p,'/daily-watchlist-5/#2026-10-09');const identity=await p.evaluate(()=>{const a=document.querySelector('.run .title'),b=document.querySelector('.turn .mid');return {top:{family:getComputedStyle(a).fontFamily,weight:getComputedStyle(a).fontWeight,accent:getComputedStyle(a.querySelector('i')).color,italic:getComputedStyle(a.querySelector('i')).fontStyle},bottom:{family:getComputedStyle(b).fontFamily,weight:getComputedStyle(b).fontWeight,accent:getComputedStyle(b.querySelector('i')).color,italic:getComputedStyle(b.querySelector('i')).fontStyle}}});equal(identity.top,identity.bottom,'Field Brief identity matches');await p.locator('.turn').scrollIntoViewIfNeeded();await shot(p,'field-brief-closing-'+viewport.width);await overflow(p,'Field Brief');
  await navigate(p,'/daily-econ-challenge/#2026-10-09/q1');check(await p.locator('.q-num').isVisible(),'Workbook question navigation still operational');await p.locator('[data-go="4"]').click();equal(await p.locator('.q-num').textContent(),'Q5');await overflow(p,'Workbook');
  await c.close();
 }
 equal(errors,[],'no browser script errors');fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({assertions,evidence},null,2));console.log(JSON.stringify({assertions,result:'passed'}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
