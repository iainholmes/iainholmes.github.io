// Actual renderer and mobile handlers; a fixed published-week clock keeps these presentation checks deterministic.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||'/tmp/atlas-presentation-evidence');await mkdir(output,{recursive:true});
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=process.env.ATLAS_QA_URL?null:createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const proxyURL=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyURL?{server:proxyURL.origin,bypass:'127.0.0.1,localhost',...(proxyURL.username?{username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={base,checks:0,errors:[],layouts:[],physicalDevice:false};
const check=(ok,msg)=>{assert.ok(ok,msg);evidence.checks++;};
const baseline=process.env.ATLAS_QA_CAPTURE_BASELINE==='1';
const prior=process.env.ATLAS_QA_BASELINE_RESULTS?JSON.parse(await readFile(process.env.ATLAS_QA_BASELINE_RESULTS,'utf8')):null;
async function layout(page){return page.evaluate(()=>{
 const rect=n=>{const r=n.getBoundingClientRect();return Object.fromEntries(['x','y','width','height','bottom','right'].map(k=>[k,r[k]]));};
 const element=n=>({box:rect(n),font:getComputedStyle(n).font,fontFamily:getComputedStyle(n).fontFamily});
 return {overflow:document.documentElement.scrollWidth>innerWidth+1,main:rect(document.querySelector('main')),plates:[...document.querySelectorAll('.plate')].filter(n=>!n.hidden).map(n=>({id:n.id,box:rect(n),title:element(n.querySelector('.p-title')),stand:element(n.querySelector('.p-stand')),headings:[...n.querySelectorAll('.outing-heading')].map(element),photo:n.querySelector('.p-photo')?rect(n.querySelector('.p-photo')):null,link:n.querySelector('.p-more')?rect(n.querySelector('.p-more')):null})),hero:document.querySelector('.ed-hero img')?(()=>{const n=document.querySelector('.ed-hero img');return {box:rect(n),naturalWidth:n.naturalWidth,naturalHeight:n.naturalHeight,fit:getComputedStyle(n).objectFit,figure:rect(n.closest('figure')),credit:rect(n.closest('figure').querySelector('.credit'))};})():null};
 });}
try{
 const sizes=process.env.ATLAS_QA_WIDTH?[[Number(process.env.ATLAS_QA_WIDTH),768]]:[[375,812],[390,844],[393,852],[393,852,true],[402,874],[430,932],[844,390],[852,393],[760,900],[1023,768],[1024,768],[1280,800],[1440,1000],[1512,982]];
 for(const [width,height,standalone=false] of sizes){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage();page.on('pageerror',e=>evidence.errors.push(e.message));
  if(!process.env.ATLAS_QA_REAL_CLOCK){await page.clock.install({time:new Date('2026-10-08T18:00:00-04:00')});await page.clock.setFixedTime(new Date('2026-10-08T18:00:00-04:00'));}
  if(standalone)await page.addInitScript(()=>{const original=matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:original(q);});
  for(const path of ['', 'edition/2026-W41-tue/','edition/2026-W41-thu/','edition/2026-W40-thu/']){
   await page.goto(base+path);await page.locator(path?'.ed-head h1':'.outing-info').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.locator(path?'.ed-hero img':'.p-photo img').first().evaluate(n=>n.decode());if(!process.env.ATLAS_QA_REAL_CLOCK)await page.clock.runFor(100);
   const g=await layout(page);check(!g.overflow,`${path||'week'} ${width} overflow`);
   if(!path&&width<760){await page.locator('#tab-thursday').click();check(await page.locator('#plate-thursday').isVisible(),'Thursday tab');await page.locator('#tab-tuesday').click();check(await page.locator('#plate-tuesday').isVisible(),'Tuesday tab');
    const swipe=async(slot,from,to)=>{const ph=page.locator('#plate-'+slot+' .p-photo');await ph.dispatchEvent('pointerdown',{clientX:from,clientY:200,pointerType:'touch'});await ph.dispatchEvent('pointerup',{clientX:to,clientY:205,pointerType:'touch'});};
    await swipe('tuesday',300,100);check(await page.locator('#plate-thursday').isVisible(),'Swipe to Thursday');await swipe('thursday',100,300);check(await page.locator('#plate-tuesday').isVisible(),'Swipe to Tuesday');
    await page.locator('#tab-tuesday').focus();await page.keyboard.press('ArrowRight');check(await page.locator('#tab-thursday').getAttribute('aria-selected')==='true','Keyboard edition choice');await page.keyboard.press('ArrowLeft');
   }
   evidence.layouts.push({width,height,standalone,path,...g});
   if([393,1024,1280,1440,1512].includes(width)){if(!path)await page.locator('.weekband').scrollIntoViewIfNeeded();else await page.locator('.ed-feature').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,`${path.split('/')[1]||'week'}-${width}.png`),fullPage:true});}
   if(!baseline){
    if(path.includes('W41')){check(g.hero.fit==='contain','Registered plate cropped');check(Math.abs(g.hero.box.width/g.hero.box.height-g.hero.naturalWidth/g.hero.naturalHeight)<.002,'Portrait aspect ratio changed');check(g.hero.box.height<=Math.min(640,height*.75)+1,'Portrait artwork excessively tall');check(Math.abs(g.hero.figure.height-g.hero.box.height-g.hero.credit.height)<2,`${path} ${width} artwork has excessive empty frame: ${JSON.stringify(g.hero)}`);}
    if(path.includes('W40'))check(g.hero.fit==='cover','Ordinary photograph changed');
    if(!path&&width>=1024){check(g.plates.length===2,'Desktop comparison not side by side');check(g.plates[0].box.right<g.plates[1].box.x,'Cards overlap');check(Math.abs(g.plates[0].photo.y-g.plates[1].photo.y)<1,'Illustrations not aligned');check(Math.abs(g.plates[0].link.y-g.plates[1].link.y)<1,'Edition actions not aligned');check(g.plates.every(p=>p.link.height>=44),'Edition tap target reduced');check(await page.locator('.outing-forecast').first().isVisible()===false,'Duplicate desktop forecast retained');check(await page.locator('.weather-context').first().isVisible(),'Authored weather/safety summary hidden');}
    if(!path&&width<760&&prior){const old=prior.layouts.find(x=>x.width===width&&x.path===path);if(old)check(JSON.stringify(g.plates)===JSON.stringify(old.plates),'Accepted mobile recommendation layout changed');}
    if(!path&&width>=1024){await page.locator('.weather-context').first().evaluate(n=>n.remove());check(await page.locator('.outing-forecast').first().isVisible(),'Forecast without authored summary became hidden');const edition=await page.locator('#plate-tuesday .p-more a').getAttribute('href');await page.locator('#plate-tuesday .p-more a').click();await page.locator('.ed-head h1').waitFor();check(page.url().endsWith(edition),'Full Edition action broken');}
   }
  }
  await ctx.close();console.log(`presentation ${width}x${height} PASS`);
 }
 check(evidence.errors.length===0,'Browser errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} presentation browser assertions PASS${baseline?' (baseline capture)':''}.`);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
