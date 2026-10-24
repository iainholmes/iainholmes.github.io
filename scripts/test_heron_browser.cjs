/* WebKit desktop margin Heron and unchanged mobile lifecycle regressions. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {webkit}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const origin=process.env.WB_ORIGIN||'http://127.0.0.1:8765',out=process.env.WB_QA_DIR||'/tmp/ll-heron-browser-qa';
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(out,'cache'),{recursive:true});
let assertions=0;const errors=[];function check(value,message){assert(value,message);assertions++}function equal(a,b,message){assert.deepEqual(a,b,message);assertions++}
function fetchBytes(url){const file=path.join(out,'cache',crypto.createHash('sha256').update(url).digest('hex'));if(!fs.existsSync(file)){const bytes=cp.execFileSync('curl',['-fLsS','--max-time','30','--retry','2',url],{maxBuffer:16*1024*1024});fs.writeFileSync(file,bytes)}return fs.readFileSync(file)}
async function context(browser,viewport){
 const c=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900,deviceScaleFactor:1});
 c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await c.route('**/*',async route=>{const url=route.request().url(),p=new URL(url).pathname;let body;if(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)||process.env.WB_LIVE==='1'&&url.startsWith(origin))body=fetchBytes(url);else if(url.startsWith(origin)){const local=path.join(process.cwd(),decodeURIComponent(p),p.endsWith('/')?'index.html':'');if(!fs.existsSync(local))return route.fulfill({status:404,body:'Not found'});body=fs.readFileSync(local)}else return route.continue();const contentType=url.includes('fonts.googleapis.com')||p.endsWith('.css')?'text/css':p.endsWith('.woff2')?'font/woff2':p.endsWith('.js')?'application/javascript':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.json')?'application/json':p.endsWith('.otf')?'font/otf':p.endsWith('.png')?'image/png':'text/html';return route.fulfill({body,contentType,status:200})});
 return c;
}
async function ready(p){await p.waitForSelector('.pd-tools');await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});}
async function shot(p,name){const file=path.join(out,name+'.png');await p.screenshot({path:file,animations:'disabled'});if(process.env.HERON_BASELINE&&p.viewportSize().width<=1024)equal(fs.readFileSync(file),fs.readFileSync(path.join(process.env.HERON_BASELINE,name+'.png')),'unchanged mobile pixels: '+name)}
(async()=>{const b=await webkit.launch({executablePath:process.env.WB_WEBKIT,headless:true});const evidence=[];try{
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1024,height:768},{width:1100,height:800},{width:1181,height:850},{width:1280,height:720},{width:1440,height:900},{width:1536,height:960}]){
  const c=await context(b,viewport),p=await c.newPage();
  await p.goto(origin+'/weekly-economics-environment/#edition-2026-10-16',{waitUntil:'load',timeout:120000});await ready(p);
  const ed=p.locator('.edition:not([hidden])'),article=ed.locator('[id="2026-10-16-targeted-power"]');
  await article.scrollIntoViewIfNeeded();await article.evaluate(e=>e.scrollIntoView({block:'start'}));await shot(p,'article-'+viewport.width);
  const available=viewport.width<=1024||viewport.width>=1181;
  equal(await ed.locator('.heron-perch:visible').count(),viewport.width<=1024?2:available?1:0,'curated viewport count');
  equal(await p.locator('.heron-toggle').isVisible(),available,'toggle matches available space');
  check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
  if(available){
   const button=ed.locator('[data-id="h-2026-10-16-a"] .heron-perch'),slot=button.locator('..');await button.scrollIntoViewIfNeeded();
   const geometry=await button.evaluate(e=>{const r=e.getBoundingClientRect(),g=e.closest('.article-grid'),a=g.querySelector('.prose').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,proseRight:a.right}});
   check(geometry.top>=0&&geometry.bottom<=viewport.height,'standing perch actually in viewport');
   if(viewport.width>=1181){check(geometry.left>=geometry.proseRight+20,'bird entirely in existing research margin');check(geometry.right<=viewport.width-40,'bird inside page inset')}
   await shot(p,'perch-'+viewport.width);await button.click();equal(await button.getAttribute('aria-expanded'),'true','open');
   equal(await button.locator('.pose-inspect').evaluate(e=>getComputedStyle(e).display),'block','bent pose');check(await slot.locator('.heron-panel').isVisible(),'note contents');await shot(p,'open-'+viewport.width);
   if(viewport.width>=1181){const panel=await slot.locator('.heron-panel').boundingBox();check(panel.x>=geometry.proseRight+20&&panel.x+panel.width<=viewport.width-40,'expanded note stays in margin')}
   if(viewport.width>=1181){await slot.locator('.hp-close').scrollIntoViewIfNeeded();const close=await slot.locator('.hp-close').boundingBox();check(close.y>=50&&close.y+close.height<=viewport.height,'expanded margin actions reachable without clipping')}
   await slot.locator('.hp-close').click();check(await button.isVisible(),'close retains label');check(await button.evaluate(e=>e.classList.contains('vacant')),'bird leaves');await shot(p,'closed-'+viewport.width);
   await button.focus();await p.keyboard.press('Enter');check(await slot.locator('.heron-panel').isVisible(),'keyboard reopens label');await p.keyboard.press('Escape');check(!await slot.locator('.heron-panel').isVisible(),'Escape closes');
   await button.click();await slot.locator('.hp-dismiss').click();check(!await button.isVisible(),'dismiss suppresses');await p.reload();await ready(p);check(!await p.locator('[data-id="h-2026-10-16-a"] .heron-perch').isVisible(),'dismiss persists');
   await p.locator('.heron-toggle').click();equal(await p.locator('.edition:not([hidden]) .heron-perch:visible').count(),0,'off hides all');await p.reload();await ready(p);equal(await p.locator('.heron-toggle').getAttribute('aria-pressed'),'false','off persists');await p.locator('.heron-toggle').click();
   evidence.push({viewport,geometry});
  }await c.close();
 }
 const c=await context(b,{width:1440,height:900}),p=await c.newPage();
 for(const date of ['2026-09-25','2026-10-02','2026-10-09','2026-10-16','2026-10-23']){await p.goto(origin+'/weekly-economics-environment/#edition-'+date,{waitUntil:'load',timeout:120000});await ready(p);const ed=p.locator('.edition:not([hidden])');equal(await ed.getAttribute('data-edition'),date,'correct edition');equal(await ed.locator('.heron-perch:visible').count(),1,'one selected desktop appearance in archive')}
 for(const width of [1024,1100,1181,390,1440]){await p.setViewportSize({width,height:900});await ready(p);equal(await p.locator('.edition:not([hidden]) .heron-perch:visible').count(),width<=1024?2:width>=1181?1:0,'breakpoint resize '+width)}
 await p.emulateMedia({reducedMotion:'reduce'});const btn=p.locator('.edition:not([hidden]) .heron-perch:visible').first();await btn.click();equal(await p.locator('.edition:not([hidden]) .heron-panel:visible').count(),1,'reduced motion opens statically');await p.locator('.dn button[data-mode="night"]').click();await btn.scrollIntoViewIfNeeded();await shot(p,'desktop-night');check(await btn.isVisible(),'night visible');
 await p.locator('#glance-mode').click();equal(await p.locator('.edition:not([hidden]) .heron-perch:visible').count(),0,'At a glance quiet');await p.locator('#full-mode').click();equal(await p.locator('.edition:not([hidden]) .heron-perch:visible').count(),1,'Full edition restores margin');
 await c.close();equal(errors,[],'no browser script errors');fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({assertions,evidence,result:'passed'},null,2));console.log(JSON.stringify({assertions,result:'passed'}));
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
