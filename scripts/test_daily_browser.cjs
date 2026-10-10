/* Targeted WebKit iPhone/footer regressions; local checkout or deployed WB_ORIGIN with WB_LIVE=1. */
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
 for(const viewport of [{width:390,height:844},{width:393,height:852},{width:844,height:390},{width:1440,height:900}]){
  const c=await context(browser,viewport,viewport.width===390),p=await c.newPage();
  await navigate(p,'/daily-watchlist-5/');
  const dates=await p.locator('#briefing-data').evaluate(e=>JSON.parse(e.textContent).editions.map(e=>e.date).sort());
  equal(dates.at(-1),'2026-10-10','Saturday preserved as latest');
  for(const date of [dates[0],dates[Math.floor(dates.length/2)],dates.at(-1)]){
   await navigate(p,'/daily-watchlist-5/#'+date);await p.locator('.turn').scrollIntoViewIfNeeded();await ready(p);
   const geom=await p.locator('.turn').evaluate(e=>{const mid=e.querySelector('.mid'),r=mid.getBoundingClientRect(),nav=e.getBoundingClientRect(),a=e.firstElementChild.getBoundingClientRect(),b=e.lastElementChild.getBoundingClientRect();return {visible:getComputedStyle(mid).display!=='none',x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,navcx:nav.x+nav.width/2,prevBottom:a.bottom,nextBottom:b.bottom,navBottom:nav.bottom,toolbarTop:document.querySelector('.pd-tools').getBoundingClientRect().top}});
   check(geom.visible,'first/intermediate/latest closing wordmark visible');
   if(viewport.width<=820){check(geom.y>=Math.max(geom.prevBottom,geom.nextBottom)+10,'wordmark beneath both edition links');check(Math.abs(geom.cx-geom.navcx)<1,'closing label centered');check(geom.y+geom.h<geom.toolbarTop,'fixed toolbar does not obscure wordmark')}
   const identity=await p.evaluate(()=>{const value=e=>({font:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight,italic:getComputedStyle(e.querySelector('i')).fontStyle,color:getComputedStyle(e.querySelector('i')).color});return [value(document.querySelector('.run .title')),value(document.querySelector('.turn .mid'))]});equal(identity[0],identity[1],'top and closing identities match');
   await overflow(p,'Field Brief footer');await shot(p,'fb-footer-'+viewport.width+'-'+date);evidence.push({viewport,date,geom});
  }
  await navigate(p,'/daily-watchlist-5/#'+dates.at(-1)+'/04');
  const frame=await p.locator('.story').nth(3).boundingBox();const sticky=await p.locator('.run').boundingBox();check(frame.y>=sticky.y+sticky.height-2&&frame.y<sticky.y+sticky.height+40,'selected reading framed beneath sticky head');
  await p.locator('.pd-tools button').filter({hasText:/^Index$/}).click();equal(await p.locator('#indexPanel').count(),1,'one Index panel');check(await p.locator('#indexClose').isVisible(),'Index opens');await p.locator('#indexClose').click();
  await p.locator('.mode button[data-mode="night"]').click();equal(await p.locator('html').getAttribute('data-mode'),'night');await shot(p,'fb-night-'+viewport.width);await p.locator('.mode button[data-mode="day"]').click();
  await p.locator('.pd-imprint').click();equal(await p.locator('#pdDrawer').getAttribute('data-open'),'true','shelf opens');await p.keyboard.press('Escape');equal(await p.locator('#pdDrawer').getAttribute('data-open'),'false');
  if(viewport.width<900){await p.locator('.pd-tools a').click();await ready(p);check(p.url().includes('/personal-updates/'),'Titles returns hub')}
  await navigate(p,'/personal-updates/');check((await p.locator('.note-head').first().textContent()).includes('daily'),'hub daily label');await overflow(p,'hub');await shot(p,'hub-'+viewport.width);
  await selected(p,'2026-10-09');check(await p.locator('.edition:not([hidden]) .hero').isVisible(),'L&L hero');await overflow(p,'L&L');await shot(p,'ll-'+viewport.width);
  await p.locator('#glance-mode').click();check(await p.locator('body').evaluate(e=>e.classList.contains('glance')),'At a glance');await p.locator('#full-mode').click();
  await p.locator('#open-archive').click();check(await p.locator('#archive-dialog').isVisible(),'L&L archive');await p.locator('#close-archive').click();
  await p.locator('.dn button[data-mode="night"]').click();await shot(p,'ll-night-'+viewport.width);await p.locator('.dn button[data-mode="day"]').click();
  await navigate(p,'/daily-econ-challenge/#2026-10-09/q1');equal(await p.locator('.q-num').textContent(),'Q1');await p.locator('[data-go="7"]').click();equal(await p.locator('.q-num').textContent(),'Q8');await overflow(p,'Workbook');await shot(p,'wb-'+viewport.width);
  await p.locator('.ledger-head').click();check(await p.locator('[data-act="start-fresh"]').isVisible(),'Ledger');await overflow(p,'Ledger');await shot(p,'ledger-'+viewport.width);
  await c.close();
 }
 equal(errors,[],'no script errors');fs.writeFileSync(path.join(out,'daily-results.json'),JSON.stringify({assertions,evidence},null,2));console.log(JSON.stringify({assertions,result:'passed'}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
