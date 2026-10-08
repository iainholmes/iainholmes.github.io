import { pendingThursdayFixture } from './publication-fixtures.mjs';
// Actual production renderer/handlers; only the clock and publication manifest are fixtures.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {selectCurrentPair,pairKey} from '../assets/js/core/editions.js';
import {renderWeek} from '../assets/js/core/render.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const json=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const manifest=pendingThursdayFixture(await json('data/editions/index.json')),photos=await json('data/photos.json'),places=await json('data/places.json');
const editions=Object.fromEntries(await Promise.all(manifest.editions.map(async e=>[e.id,await json(e.path)])));
const released=structuredClone(manifest);released.editions.find(e=>e.id==='2026-W41-thu').status='published';
const delayed=structuredClone(released);delayed.editions.find(e=>e.id==='2026-W41-tue').status='draft';
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/week-state-evidence'));await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
let server;
if(!process.env.ATLAS_QA_URL){server=createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const proxyUrl=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyUrl?{server:proxyUrl.origin,bypass:'127.0.0.1,localhost',...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={base,checks:0,errors:[],physicalIOS:false,states:[],layouts:[]};
const check=(ok,message)=>{assert.ok(ok,message);evidence.checks++;};
const sizes=process.env.ATLAS_QA_QUICK?[[393,852],[852,393],[1440,1000]]:[[375,812],[390,844],[393,852],[402,874],[430,932],[844,390],[852,393],[1024,768],[1440,1000]];
async function context({width=393,height=852,standalone=false,time='2026-10-05T12:00:00-04:00',fixture=manifest}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage(),requests=[];
 page.on('pageerror',e=>evidence.errors.push(e.message));await page.clock.install({time:new Date(time)});await page.clock.setFixedTime(new Date(time));
 await page.route('**/data/editions/index.json*',r=>r.fulfill({json:fixture}));
 page.on('request',r=>{const m=new URL(r.url()).pathname.match(/\/data\/editions\/([^/]+)\.json$/);if(m&&m[1]!=='index')requests.push(m[1]);});
 if(standalone)await page.addInitScript(()=>{const original=window.matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:original(q);});
 return {ctx,page,requests};
}
async function ready(page,time,fixture){
 const expected=pairKey(selectCurrentPair(fixture,new Date(time)));
 await page.waitForFunction(key=>document.querySelector('.week')?.dataset.pair===key,expected);
 await page.evaluate(()=>document.fonts.ready);await page.clock.runFor(100);
}
async function inspect(page,time,fixture,requests){
 const pair=selectCurrentPair(fixture,new Date(time));
 check(await page.locator('.week').getAttribute('data-pair')===pairKey(pair),'Incorrect cycle/pair');
 check(await page.locator('.weekband h1').innerText()=== (pair.weekend.start==='2026-10-10'?'Sat 10 – Sun 11 October':pair.weekend.start==='2026-10-17'?'Sat 17 – Sun 18 October':'Sat 3 – Sun 4 October'),'Week heading not synchronized');
 for(const slot of ['tuesday','thursday']){
  const plate=page.locator('#plate-'+slot),record=pair[slot],html=await plate.innerHTML();
  check(await plate.evaluate(n=>n.classList.contains('is-pending'))===!record,'Wrong slot state: '+slot);
  if(record){check(await plate.locator('.p-title a').getAttribute('href')==='edition/'+record.id+'/','Wrong published edition');}
  else{
   check(await plate.locator('img,a,.outing-info,.crowd-visual').count()===0,'Pending slot leaked recommendation content');
   check((await plate.locator('.p-title').innerText()).includes('7:00 AM ET'),'Pending cadence missing');
   check(!Object.values(editions).some(e=>html.includes(e.flagship.title)),'Pending slot leaked title');
  }
 }
 check(requests.every(id=>[pair.tuesday?.id,pair.thursday?.id].includes(id)),'Fetched unpublished or previous-week content');
 check(await page.locator('.week a[href*="edition/2026-W40"]').count()=== (pair.weekend.start==='2026-10-03'?2:0),'Previous-week content occupies current slots');
}
async function dismiss(page){if(await page.locator('.atlas-veil').count()){await page.keyboard.press('Escape');check(await page.locator('.atlas-veil').count()===0,'Deliberate dismissal failed');}}
const states=[
 ['Monday','2026-10-05T12:00:00-04:00',released],
 ['Tuesday pre','2026-10-06T06:59:59-04:00',released],
 ['Tuesday published','2026-10-06T07:00:00-04:00',released],
 ['Wednesday','2026-10-07T12:00:00-04:00',released],
 ['Thursday pre','2026-10-08T06:59:59-04:00',released],
 ['Thursday published','2026-10-08T07:00:00-04:00',released],
 ['Friday','2026-10-09T12:00:00-04:00',released],
 ['Saturday','2026-10-10T12:00:00-04:00',released],
 ['Sunday','2026-10-11T23:59:59-04:00',released],
 ['Delayed Tuesday','2026-10-06T15:00:00-04:00',delayed],
 ['Delayed Thursday','2026-10-08T15:00:00-04:00',manifest],
 ['Week boundary','2026-10-12T00:00:00-04:00',released]
];
try{
 for(const standalone of [false,true])for(const [name,time,fixture] of states){
  const {ctx,page,requests}=await context({standalone,time,fixture});await page.goto(base+'#thursday');await ready(page,time,fixture);await inspect(page,time,fixture,requests);await dismiss(page);
  check(await page.locator('#plate-thursday').isVisible(),'Thursday deep-link tab lost');
  await page.reload();await ready(page,time,fixture);await inspect(page,time,fixture,requests);
  check(await page.locator('.atlas-veil').count()===0,'Reload lost session dismissal');
  evidence.states.push({name,time,standalone,pair:await page.locator('.week').getAttribute('data-pair')});await ctx.close();
 }
 console.log('All weekly states, delayed releases, reload/hash and standalone PASS');
 // iPhone portrait first. Preserve the actual pending typography; no new artwork/panel.
 for(const [width,height] of sizes)for(const standalone of [false,true])for(const [name,time,fixture] of [states[0],states[3],states[5]]){
  const {ctx,page,requests}=await context({width,height,standalone,time,fixture});await page.goto(base);await ready(page,time,fixture);await inspect(page,time,fixture,requests);await dismiss(page);
  if(width<760){await page.locator('#tab-thursday').click();check(await page.locator('#plate-thursday').isVisible(),'Pending Thursday tab failed');}
  const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,plates:[...document.querySelectorAll('.plate')].filter(n=>!n.hidden).map(n=>{const r=n.getBoundingClientRect(),h=n.querySelector('.p-title').getBoundingClientRect();return {x:r.x,right:r.right,titleRight:h.right,titleHeight:h.height};})}));
  check(!layout.overflow,'Horizontal overflow '+JSON.stringify(layout));check(layout.plates.every(p=>p.x>=0&&p.right<=width+1&&p.titleRight<=width+1&&p.titleHeight>0),'Clipped plate '+JSON.stringify(layout));
  if(width===393&&!standalone){await page.locator('.weekband').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,name.toLowerCase()+'-portrait.png')});}
  evidence.layouts.push({width,height,standalone,name,...layout});await ctx.close();
 }
 console.log('Pending/published responsive layout and PWA-equivalent targets PASS');
 // Rollover must neutralize a stale generated week even if the manifest fails.
 {
  const {ctx,page}=await context();let release;const gate=new Promise(r=>release=r);
  await page.route('**/assets/js/site.js*',async r=>{await gate;await r.continue();});
  await page.unroute('**/data/editions/index.json*');await page.route('**/data/editions/index.json*',r=>r.abort('failed'));
  await page.goto(base,{waitUntil:'commit'});await page.locator('.week').waitFor({state:'attached'});
  const old=renderWeek(selectCurrentPair(manifest,new Date('2026-10-04T12:00:00-04:00')),editions,{base:'',places,photos});
  await page.locator('.week').evaluate((n,html)=>n.outerHTML=html,old);release();await page.waitForLoadState('load');
  await ready(page,'2026-10-05T12:00:00-04:00',{editions:[]});check(await page.locator('.plate.is-pending').count()===2,'Failed manifest revived old slots');check(await page.locator('.week a[href*="edition/"]').count()===0,'Stale edition link survived rollover');await ctx.close();
 }
 // Foreground recheck replaces the whole pair; delayed status changes alone never publish.
 {
  const fixture=structuredClone(delayed),{ctx,page}=await context({fixture,time:'2026-10-06T08:00:00-04:00'});
  await page.goto(base);await ready(page,'2026-10-06T08:00:00-04:00',fixture);await dismiss(page);
  fixture.editions.find(e=>e.id==='2026-W41-tue').status='published';
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await ready(page,'2026-10-06T08:00:00-04:00',fixture);check(await page.locator('.plate.is-pending').count()===1,'Actual Tuesday did not replace pending');
  await page.clock.setFixedTime(new Date('2026-10-08T08:00:00-04:00'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await ready(page,'2026-10-08T08:00:00-04:00',fixture);check(await page.locator('.plate.is-pending').count()===0,'Actual Thursday did not replace pending');
  await page.clock.setFixedTime(new Date('2026-10-12T00:00:00-04:00'));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await ready(page,'2026-10-12T00:00:00-04:00',fixture);check(await page.locator('.plate.is-pending').count()===2,'New cycle kept published history');await ctx.close();
 }
 {
  const {ctx,page}=await context();await page.goto(base+'archive/');await page.locator('.archive-card a[href*="2026-W40-r1-tue"]').first().waitFor({state:'attached'});await dismiss(page);
  for(const id of ['2026-W40-r1-tue','2026-W40-thu','2026-W40-tue'])check(await page.locator('.archive a[href*="edition/'+id+'/"]').count()>0,'Historical edition missing');
  await page.goto(base+'edition/2026-W40-thu/');await page.locator('.ed-head h1').waitFor({state:'attached'});check(await page.locator('.ed-head h1').count()===1,'Historical direct edition unavailable');await ctx.close();
 }
 check(evidence.errors.length===0,'Browser errors '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} current-week browser assertions PASS.`);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
