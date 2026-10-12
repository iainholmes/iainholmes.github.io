// Actual Oct 12 manifest/production veil. Synthetic disclosure cases stay in browser interception only.
// ATLAS_QA_CHROME=/path/to/chrome node rupert/_tools/veil-browser-test.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {selectCurrentPair,pairKey} from '../assets/js/core/editions.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const json=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const manifest=await json('data/editions/index.json'),photos=await json('data/photos.json');
const monday='2026-10-12T12:00:00-04:00';
assert.equal(manifest.editions.filter(e=>e.weekend.start==='2026-10-17').length,0,'Oct 12 coverage requires the real unauthored W42 baseline.');
const previous=['tuesday','thursday'].map(slot=>manifest.editions.find(e=>e.weekend.start==='2026-10-10'&&e.slot===slot&&e.status==='published'));
assert.ok(previous.every(Boolean),'Both genuine W41 editions must be published.');
const output=process.env.ATLAS_QA_OUTPUT_DIR||'/tmp/atlas-veil-oct12';await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(path!==root&&!path.startsWith(root+'/'))throw Error();if((await stat(path)).isDirectory())path=resolve(path,'index.html');res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/`;
const u=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=u?{server:u.origin,bypass:'127.0.0.1,localhost',...(u.username?{username:decodeURIComponent(u.username),password:decodeURIComponent(u.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={checks:0,engine:await browser.version(),physicalIPhone:false,productionDataUnchanged:true,layouts:[],navigation:[],errors:[],baseline:previous.map(e=>({id:e.id,photo_id:e.photo_id,published_at:e.published_at}))};
const check=(condition,message)=>{assert.ok(condition,message);evidence.checks++;};
async function context({width=393,height=852,standalone=false,time=monday,fixture,photoFixture}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});
 await ctx.addInitScript(standalone=>{
  if(standalone){const original=window.matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:original(q);}
  const expected=!!sessionStorage.getItem('rupert-frontispiece-arrival');window.__veilHandoff={expected,exposedFrames:0,frames:0};
  const frame=()=>{const state=window.__veilHandoff;if(state.expected){state.frames++;if(document.querySelector('main')&&!document.querySelector('.atlas-veil'))state.exposedFrames++;}requestAnimationFrame(frame);};requestAnimationFrame(frame);
 },standalone);
 const page=await ctx.newPage(),requests=[];page.on('pageerror',e=>evidence.errors.push(e.message));page.on('request',r=>requests.push(r.url()));await page.clock.install({time:new Date(time)});
 if(fixture)await ctx.route('**/data/editions/index.json*',r=>r.fulfill({json:fixture}));
 if(photoFixture)await ctx.route('**/data/photos.json*',r=>r.fulfill({json:photoFixture}));
 return {ctx,page,requests};
}
async function ready(page){await page.locator('.atlas-veil[data-cycle="2026-10-17"]').waitFor();await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.atlas-veil img')].map(i=>i.decode()));});await page.clock.runFor(100);}
async function previews(page){
 const prior=page.locator('.veil-week-group[aria-label="Previous Week"]'),current=page.locator('.veil-week-group[aria-label="This Week"]');
 check(await prior.locator('.veil-tile[href]').count()===2,'Genuine W41 navigation missing');
 for(const [index,edition]of previous.entries()){
  const image=prior.locator('.veil-image').nth(index),record=photos.photos.find(p=>p.id===edition.photo_id);
  check(await prior.locator('.veil-tile').nth(index).getAttribute('href')===`edition/${edition.id}/`||new URL(await prior.locator('.veil-tile').nth(index).getAttribute('href'),page.url()).pathname.endsWith(`/edition/${edition.id}/`),'Previous Week URL changed');
  check(await image.getAttribute('src').then(src=>src.includes(`/photos/${record.file}-`)||src.includes(`photos/${record.file}-`)),'Previous Week artwork is not the genuine W41 plate');
  check(await image.evaluate(i=>i.naturalWidth>0&&getComputedStyle(i).filter==='none'&&getComputedStyle(i).opacity==='1'),'Genuine artwork failed to load or lost full color');
 }
 check(await current.locator('.veil-empty-art').count()===2,'Unauthored current slots lack neutral placeholders');
 check(await current.locator('img,a[href]').count()===0,'Current slot disclosed artwork or an edition link');
 check(await current.locator('.veil-tile').evaluateAll(ns=>ns.every((n,i)=>n.getAttribute('aria-label')===`${i===0?'Tuesday':'Thursday'} · Unpublished, 7:00 AM ET`)),'Pending accessible labels disclose recommendation information');
 check(await page.locator('.atlas-veil a[href*="W42"]').count()===0,'Premature W42 edition link');
 check(await current.locator('.veil-empty-art').evaluateAll(ns=>ns.every(n=>parseFloat(getComputedStyle(n).borderTopWidth)>0&&!getComputedStyle(n).backgroundImage.includes('url('))),'Neutral frames are missing or use artwork');
}
async function geometry(page,width,height){
 const g=await page.evaluate(()=>{const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};const v=document.querySelector('.atlas-veil'),p=v.querySelector('.veil-plate');return {veil:box(v),scroll:v.scrollHeight,client:v.clientHeight,plateScroll:p.scrollHeight,plateClient:p.clientHeight,groups:[...v.querySelectorAll('.veil-week-group')].map(box),thumbs:[...v.querySelectorAll('.veil-thumbnail')].map(box),footer:box(v.querySelector('footer')),pageOverflow:document.documentElement.scrollWidth>innerWidth+1,locked:document.querySelector('main').inert&&document.body.style.position==='fixed'};});
 check(g.veil.x===0&&g.veil.y===0&&g.veil.width===width&&g.veil.bottom>=height,'Viewport/safe-edge coverage regressed');
 check(g.scroll<=g.client+1&&g.plateScroll<=g.plateClient+1&&!g.pageOverflow,'Veil/underlying page overflow');
 check(g.groups[0].y===g.groups[1].y,'Previous/current groups lost two-column arrangement');
 check(g.thumbs.length===4&&g.thumbs.every(r=>r.x>=0&&r.right<=width&&r.y>=0&&r.bottom<=height),'Preview thumbnail clipping');
 check(g.footer.bottom<=height&&g.footer.y>0,'Almanac clipping');check(g.locked,'Underlying document not locked/inert');return g;
}
try{
 for(const [width,height]of [[375,812],[390,844],[393,852],[402,874],[430,932],[844,390],[852,393],[1024,768],[1280,800],[1440,1000],[1512,982]]){
  const {ctx,page}=await context({width,height});await page.goto(base);await ready(page);await previews(page);const g=await geometry(page,width,height);
  if([393,1440].includes(width))await page.screenshot({path:resolve(output,`oct12-${width===393?'iphone':'desktop'}.png`)});
  evidence.layouts.push({width,height,standalone:false,...g});await ctx.close();
 }
 for(const standalone of [false,true])for(const edition of previous){
  const {ctx,page}=await context({standalone});await page.goto(base);await ready(page);
  await page.locator(`.atlas-veil a[href*="${edition.id}"]`).click();await page.waitForURL(`**/edition/${edition.id}/`);await ready(page);
  check(await page.locator('.ed-head h1').innerText().then(s=>s.toLowerCase()===edition.title.toLowerCase()),'Destination underneath is not the selected Full Edition');
  check(await page.locator('.atlas-veil').count()===1&&await page.locator('main').evaluate(n=>n.inert),'Navigation prematurely dismissed the veil');
  check(await page.evaluate(()=>sessionStorage.getItem('rupert-veil:2026-10-17:preTuesday'))===null,'Navigation counted as dismissal');
  const handoff=await page.evaluate(()=>window.__veilHandoff);check(handoff.expected&&handoff.frames>0&&handoff.exposedFrames===0,'Uncovered destination frame during one-tap handoff');
  await page.locator('.atlas-veil').click({position:{x:8,y:150}});check(await page.locator('.atlas-veil').count()===0,'Deliberate background dismissal failed');
  check(await page.locator('main').evaluate(n=>!n.inert)&&await page.locator('.ed-head h1').isVisible(),'Selected edition not revealed after dismissal');
  check(await page.evaluate(()=>sessionStorage.getItem('rupert-veil:2026-10-17:preTuesday'))==='1','Dismissal not recorded');
  await page.reload();await page.waitForFunction(()=>document.documentElement.classList.contains('js'));await page.clock.runFor(100);check(await page.locator('.atlas-veil').count()===0,'Dismissal lost on reload');
  evidence.navigation.push({edition:edition.id,standalone,...handoff});await ctx.close();
 }
 // Initial-page dismissal, same-phase navigation, delayed unauthored slots and Wednesday's new key.
 for(const standalone of [false,true]){
  const {ctx,page}=await context({standalone});await page.goto(base);await ready(page);await geometry(page,393,852);
  await page.keyboard.press('Tab');check(await page.locator('.atlas-veil a').first().evaluate(n=>n===document.activeElement),'Focus did not reach a genuine published link');
  await page.locator('.atlas-veil').click({position:{x:8,y:150}});await page.goto(base+'archive/');await page.clock.runFor(100);check(await page.locator('.atlas-veil').count()===0,'Same phase reopened during ordinary navigation');
  await page.clock.setSystemTime(new Date('2026-10-13T12:00:00-04:00'));await page.clock.runFor(60050);check(await page.locator('.atlas-veil').count()===0,'Same preTuesday dismissal lost at nominal Tuesday time');
  await page.clock.setSystemTime(new Date('2026-10-14T12:00:00-04:00'));await page.clock.runFor(60050);await ready(page);check(await page.locator('.atlas-veil').getAttribute('data-phase')==='preThursday','Wednesday phase did not reactivate naturally');await previews(page);
  await page.clock.setSystemTime(new Date('2026-10-15T12:00:00-04:00'));await page.clock.runFor(60050);await ready(page);await previews(page);
  check(await page.evaluate(()=>sessionStorage.getItem('rupert-veil:2026-10-17:preThursday'))===null,'Old phase dismissal leaked into new phase');await ctx.close();
 }
 // No draft title, alt text, image URL or link before real publication, even after the nominal clock.
 for(const status of ['draft','published'])for(const time of [monday,'2026-10-13T06:59:00-04:00',...(status==='draft'?['2026-10-15T12:00:00-04:00']:[])]){
  const fixture=structuredClone(manifest),registry=structuredClone(photos);
  for(const [slot,day]of [['tuesday','13'],['thursday','15']]){
   const prior=previous.find(e=>e.slot===slot),p=photos.photos.find(p=>p.id===prior.photo_id);
   fixture.editions.push({...prior,id:'qa-w42-'+slot,status,title:'PRIVATE DRAFT '+slot,photo_id:'qa-unreleased-'+slot,published_at:`2026-10-${day}T07:00:00-04:00`,weekend:{start:'2026-10-17',end:'2026-10-18'}});
   registry.photos.push({...p,id:'qa-unreleased-'+slot,file:'qa-unreleased-'+slot,alt:'PRIVATE DRAFT ART '+slot});
  }
  const {ctx,page,requests}=await context({time,fixture,photoFixture:registry});await page.goto(base);await ready(page);await previews(page);
  check(!await page.locator('.atlas-veil').innerHTML().then(s=>/PRIVATE DRAFT|qa-unreleased|qa-w42/.test(s)),'Draft/future information leaked into veil markup');
  check(requests.every(url=>!url.includes('/photos/qa-unreleased-')),'Draft artwork was requested before publication');await ctx.close();
 }
 // Genuine W41 timings include Thursday's delayed actual release at 16:57:58, not its 7 a.m. schedule.
 for(const [time,active]of [['2026-10-11T12:00:00-04:00',false],['2026-10-06T06:59:00-04:00',true],['2026-10-06T07:00:00-04:00',false],['2026-10-07T12:00:00-04:00',true],['2026-10-08T07:00:00-04:00',true],['2026-10-08T16:57:58-04:00',false]]){
  const {ctx,page}=await context({time});await page.goto(base);await page.waitForFunction(key=>document.querySelector('.week')?.dataset.pair===key,pairKey(selectCurrentPair(manifest,new Date(time))));await page.clock.runFor(100);
  if(active)await page.locator('.atlas-veil').waitFor();else await page.waitForFunction(()=>document.querySelector('.week')?.dataset.pair);
  check(await page.locator('.atlas-veil').count()===(active?1:0),'Genuine publication lifecycle changed: '+time);await ctx.close();
 }
 check(evidence.errors.length===0,'Browser runtime errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2)+'\n');
 console.log(`${evidence.checks} Oct 12 veil browser checks PASS; ${evidence.layouts.length} layouts; genuine W41 imagery, unauthored W42, disclosure, handoff/dismissal and phase checks.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
