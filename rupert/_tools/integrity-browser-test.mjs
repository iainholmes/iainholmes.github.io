import { pendingThursdayFixture } from './publication-fixtures.mjs';
// Real renderer/veil handlers; crowd observations and future publication states are test fixtures only.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {cycleWeekend} from '../assets/js/core/cycles.js';
import {expectedPublish} from '../assets/js/core/editions.js';
import {addDays,longDate,shortDate} from '../assets/js/core/dates.js';
import {currentAlmanac,moonGlyph} from '../assets/js/core/almanac.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const manifest=pendingThursdayFixture(JSON.parse(await readFile(resolve(root,'data/editions/index.json'),'utf8')));
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/integrity-evidence'));
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
let server;
if(!process.env.ATLAS_QA_URL){server=createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const proxyUrl=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyUrl?{server:proxyUrl.origin,bypass:'127.0.0.1,localhost',...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={checks:0,errors:[],crowd:[],almanac:[],physicalIOS:false,base};
const check=(ok,message)=>{assert.ok(ok,message);evidence.checks++;};
const sizes=process.env.ATLAS_QA_QUICK?[[393,852],[852,393],[1440,1000]]:[[375,812],[390,844],[393,852],[402,874],[430,932],[844,390],[852,393],[1024,768],[1440,1000]];
const cases=[
 ['none',null,0],['low',{typical_level:'Low',perceived_crowding:'Low'},2],
 ['intermediate',{typical_level:'Moderate',perceived_crowding:'Moderate'},2],
 ['high',{typical_level:'Busy',perceived_crowding:'Busy'},2],
 ['maximum',{typical_level:'Very Busy',perceived_crowding:'Very Busy'},2],
 ['different',{typical_level:'Low',perceived_crowding:'Very Busy'},2],
 ['typical-only',{typical_level:'Moderate',perceived_crowding:null},1],
 ['perceived-only',{typical_level:null,perceived_crowding:'Busy'},1]
];
async function context({width=393,height=852,standalone=false,time='2026-10-02T16:00:00-04:00',fixture}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage();
 page.on('pageerror',e=>evidence.errors.push(e.message));await page.clock.install({time:new Date(time)});await page.clock.setFixedTime(new Date(time));
 if(fixture)await page.route('**/data/editions/index.json*',r=>r.fulfill({json:fixture}));
 if(standalone)await page.addInitScript(()=>{const original=window.matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:original(q);});
 return {ctx,page};
}
function shiftedManifest(time){
 const start=cycleWeekend(new Date(time)).start,previous=addDays(start,-7);
 return {editions:[...manifest.editions.filter(e=>e.weekend.start==='2026-10-10').map(e=>({...e,weekend:{start,end:addDays(start,1)},published_at:expectedPublish(e.slot,start).toISOString()})),...manifest.editions.filter(e=>['2026-W40-r1-tue','2026-W40-thu'].includes(e.id)).map(e=>({...e,weekend:{start:previous,end:addDays(previous,1)},published_at:expectedPublish(e.slot,previous).toISOString()}))]};
}
async function almanacMatches(page,time){
 const a=currentAlmanac(new Date(time));
 await page.locator('.atlas-veil').waitFor();
 await page.waitForFunction(expected=>document.querySelector('.veil-almanac-provenance')?.textContent===expected,`Chapel Hill, N.C. · ${longDate(a.date).split(' ')[0]} ${shortDate(a.date).split(' ').slice(1).join(' ')}`);
 await page.evaluate(()=>document.fonts.ready);
 const values=await page.locator('.veil-almanac-item dd').allTextContents();
 check(JSON.stringify(values)===JSON.stringify([a.sunset+' ET',a.moon,a.daylight]),'Almanac values refer to different dates');
 check(await page.locator('.veil-almanac').getAttribute('aria-label')===`Calculated almanac for Chapel Hill, ${longDate(a.date)}`,'Accessible almanac date disagrees');
 check(await page.locator('.veil-almanac-item').nth(1).locator('svg').evaluate((svg,glyph)=>{const template=document.createElement('template');template.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg">${glyph}</svg>`;return svg.innerHTML===template.content.firstElementChild.innerHTML;},moonGlyph(a.moon)),'Moon glyph disagrees with calculated phase label');
 check(await page.locator('.veil-almanac').evaluate(n=>n.scrollWidth<=n.clientWidth),'Almanac overflow');
 check(await page.locator('.veil-almanac').evaluate(n=>n.getBoundingClientRect().bottom<=innerHeight),'Almanac clipped');
 const bounds=await page.locator('.veil-almanac-item').evaluateAll(ns=>ns.map(n=>{const boxes=[...n.children].map(e=>e.getBoundingClientRect());return {left:Math.min(...boxes.map(r=>r.left)),right:Math.max(...boxes.map(r=>r.right))};}));
 check(bounds.every((r,i)=>i===0||r.left>=bounds[i-1].right+1),'Almanac values collide '+JSON.stringify(bounds));
 evidence.almanac.push({time,...a});
}
try{
 // iPhone portrait first. Replace only the component using its canonical production renderer.
 for(const [width,height] of sizes)for(const standalone of [false,true]){
  const {ctx,page}=await context({width,height,standalone});await page.goto(base+'edition/2026-W40-r1-tue/');await page.locator('.crowd-visual').waitFor();await page.evaluate(()=>document.fonts.ready);
  const practical=await page.locator('.ed-sheet section').last().innerHTML();
  for(const [name,crowd,available] of cases){
   await page.evaluate(async({url,crowd})=>{const {crowdVisual}=await import(url);document.querySelector('.crowd-visual').outerHTML=crowdVisual(crowd);},{url:base+'assets/js/core/render.js',crowd});
   const component=page.locator('.crowd-visual');
   check(await component.locator('.crowd-scale').count()===available,`${name}: missing metric drew a scale`);
   check(await component.locator('.is-observed').count()===available,`${name}: incorrect observation markers`);
   check(await component.locator('.is-unassessed').count()===2-available,`${name}: missing state incorrect`);
   check((await component.innerText()).includes('No crowd data recorded.')===(available===0),`${name}: contradictory no-data message`);
   const indexes=await component.locator('.crowd-scale').evaluateAll(ns=>ns.map(n=>[...n.children].findIndex(c=>c.classList.contains('is-observed'))));
   const expected=[crowd?.typical_level,crowd?.perceived_crowding].filter(Boolean).map(v=>['Low','Moderate','Busy','Very Busy'].indexOf(v));
   check(JSON.stringify(indexes)===JSON.stringify(expected),`${name}: observation at wrong ordinal position`);
   const overflow=await component.evaluate(n=>[n,...n.querySelectorAll('div,p,span,strong')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,cls:e.className,scroll:e.scrollWidth,width:e.clientWidth})));
   check(!overflow.length,`${width} ${name}: crowd text overflow ${JSON.stringify(overflow)}`);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: horizontal overflow`);
   check(await page.locator('.ed-sheet section').last().innerHTML()===practical,'Practical card changed');
   if(width===393&&!standalone)await component.locator('..').screenshot({path:resolve(output,'crowd-'+name+'.png')});
   evidence.crowd.push({width,height,standalone,name,indexes});
  }
  // Same dimensions with the natural Monday Veil; its styling/geometry is not modified.
  await page.clock.setFixedTime(new Date('2026-10-05T06:28:21-04:00'));await page.goto(base);
  await almanacMatches(page,'2026-10-05T06:28:21-04:00');
  check(await page.locator('.atlas-veil').evaluate(n=>n.getBoundingClientRect().bottom>=innerHeight),'Veil bottom not covered');
  if(width===393&&!standalone)await page.screenshot({path:resolve(output,'veil-current-monday.png')});
  await ctx.close();console.log(`crowd/almanac ${width}x${height} ${standalone?'PWA':'browser'} PASS`);
 }
 for(const standalone of [false,true])for(const time of ['2026-10-06T06:59:00-04:00','2026-10-07T12:00:00-04:00','2026-10-08T06:59:00-04:00','2026-11-01T06:59:00-05:00','2026-03-08T06:59:00-04:00','2026-12-31T06:59:00-05:00','2027-01-01T06:59:00-05:00']){
  const {ctx,page}=await context({standalone,time,fixture:shiftedManifest(time)});await page.goto(base);await almanacMatches(page,time);await ctx.close();
 }
 // All eight categories use the real veil renderer, with genuine phase calculations on representative dates.
 for(const standalone of [false,true])for(const [date,phase] of [['2026-10-09','New Moon'],['2026-10-12','Waxing Crescent'],['2026-10-16','First Quarter'],['2026-10-20','Waxing Gibbous'],['2026-10-24','Full Moon'],['2026-10-01','Waning Gibbous'],['2026-10-02','Last Quarter'],['2026-10-05','Waning Crescent']]){
  const time=date+'T06:59:00-04:00';const {ctx,page}=await context({standalone,time,fixture:shiftedManifest(time)});await page.goto(base);await almanacMatches(page,time);
  check(await page.locator('.veil-almanac-item').nth(1).locator('dd').textContent()===phase,'Representative lunar date classified incorrectly');
  check(await page.locator('.veil-almanac-item').nth(1).locator('svg').evaluate(n=>{const r=n.getBoundingClientRect();return getComputedStyle(n).display!=='none'&&r.width===14&&r.height===14&&n.children.length>0;}),'Moon glyph missing or changed size');
  if(!standalone)await page.locator('.veil-almanac').screenshot({path:resolve(output,'moon-'+phase.toLowerCase().replaceAll(' ','-')+'.png')});
  await ctx.close();
 }
 // A sleeping/resumed tab refreshes its calendar even when the manifest request fails.
 for(const standalone of [false,true]){
  const {ctx,page}=await context({standalone,time:'2026-10-05T23:59:00-04:00'});await page.goto(base);await almanacMatches(page,'2026-10-05T23:59:00-04:00');
  await page.route('**/data/editions/index.json*',r=>r.abort());await page.clock.setFixedTime(new Date('2026-10-06T00:01:00-04:00'));
  await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await almanacMatches(page,'2026-10-06T00:01:00-04:00');
  check(await page.locator('.veil-tile.is-pending').count()===2,'Almanac refresh changed publication state');
  await ctx.close();
 }
 check(evidence.errors.length===0,'JavaScript errors: '+evidence.errors.join('; '));
 await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} crowd/almanac browser assertions PASS`);
}finally{await browser.close();server?.close();}
