// Real UI handlers; provider responses and Home below are isolated synthetic QA fixtures.
// ATLAS_QA_CHROME=/path/to/chromium node rupert/_tools/refinement-browser-test.mjs
// ATLAS_QA_URL=https://iainholmes.github.io/rupert/ checks deployed bytes with the same fixtures.
import assert from 'node:assert/strict';
import {veilState} from '../assets/js/core/veil.js';
import {renderVeil} from '../assets/js/veil-view.js';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const manifest=JSON.parse(await readFile(resolve(root,'data/editions/index.json'),'utf8'));
const photos=JSON.parse(await readFile(resolve(root,'data/photos.json'),'utf8'));
const monday='2026-10-05T12:00:00-04:00';
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/refinement-evidence'));
await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
let server;
if(!process.env.ATLAS_QA_URL){server=createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const proxyUrl=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyUrl?{server:proxyUrl.origin,bypass:'127.0.0.1,localhost',...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={engine:await browser.version(),base,physicalIOS:false,checks:0,layouts:[],lifecycle:[],errors:[]};
const check=(ok,message)=>{assert.ok(ok,message);evidence.checks++;};
const sizes=process.env.ATLAS_QA_QUICK?[[393,852],[852,393],[1440,1000]]:[[375,812],[390,844],[393,852],[402,874],[430,932],[844,390],[852,393],[1024,768],[1440,1000]];
const trip={schema_version:1,plans:[{id:'tp_refinement_qa',title:'Blue Ridge Weekend',dates:{start:'2026-10-17',end:'2026-10-18'},legs:[{mode:'car',from:{label:'Chapel Hill'},to:{label:'Asheville'}}]}]};
async function context({width=393,height=852,standalone=false,travel=false,time='2026-10-02T16:00:00-04:00',home=false,fixture=null}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});const page=await ctx.newPage();
 page.on('pageerror',e=>evidence.errors.push(e.message));await page.clock.install({time:new Date(time)});
 if(fixture)await page.route('**/data/editions/index.json*',r=>r.fulfill({json:fixture}));
 if(standalone)await page.addInitScript(()=>{const original=window.matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:original(q);});
 if(travel)await page.addInitScript(t=>localStorage.setItem('rupert-travel-v1',JSON.stringify(t)),trip);
 if(home)await page.addInitScript(()=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:{lat:35.913,lng:-79.056},routing:false})));
 return {ctx,page};
}
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.atlas-veil img,.footer-identity img')].map(i=>i.decode()));});await page.clock.runFor(100);}
const geometry=page=>page.evaluate(()=>{
 const r=n=>{const v=n.getBoundingClientRect();return {x:v.x,y:v.y,width:v.width,height:v.height,right:v.right,bottom:v.bottom};};const v=document.querySelector('.atlas-veil'),p=v.querySelector('.veil-plate'),mark=v.querySelector('.veil-rupert-mark');
 return {width:innerWidth,height:innerHeight,veil:r(v),plate:r(p),scrollHeight:p.scrollHeight,clientHeight:p.clientHeight,overflow:p.scrollHeight>p.clientHeight+1,band:r(v.querySelector('.veil-band')),lockup:r(v.querySelector('.veil-lockup')),portrait:r(mark),opacity:getComputedStyle(mark).opacity,almanac:r(v.querySelector('.veil-almanac')),rule:getComputedStyle(v.querySelector('.veil-almanac')).borderTopWidth,travel:v.querySelector('.veil-travel')?r(v.querySelector('.veil-travel')):null,bottom:!!document.elementFromPoint(innerWidth/2,innerHeight-1)?.closest('.atlas-veil')};
});
const provider=`export async function createMap(el){const handlers={};window.__refinementMap={routes:[],selected:null,home:null,fits:0};const state=window.__refinementMap;const api={resize(){},setMarkers(fs){el.replaceChildren(...fs.map(f=>{const b=document.createElement('button');b.className='qa-marker';b.textContent='Select '+f.properties.name;b.dataset.place=f.properties.id;b.onclick=()=>handlers.select?.forEach(fn=>fn(f.properties.id));return b;}));},setRoutes(v){state.routes=v},fit(){state.fits++},select(id){state.selected=id},focus(id){state.focus=id},setRelief(v){state.relief=v},setHome(v){state.home=v},centerHome(){state.centered=true},on(n,fn){(handlers[n]??=[]).push(fn);return api},diagnostics(){return{}},destroy(){}};return api}`;
async function mapFixtures(page){let requests=[];await page.route('**/assets/js/traffic-config.js*',r=>r.fulfill({contentType:'text/javascript',body:'export const trafficConfig={provider:"mapbox",publicToken:"",allowedOrigins:[]};'}));await page.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:provider}));await page.route('https://router.project-osrm.org/**',r=>{requests.push(r.request().url());const points=new URL(r.request().url()).pathname.split('/').at(-1).split(';').map(s=>s.split(',').map(Number));return r.fulfill({json:{code:'Ok',routes:[{duration:900,distance:12070,geometry:{type:'LineString',coordinates:points}}]}});});return requests;}
try{
 // Portrait first, then landscape/tablet/desktop, under the real Monday lifecycle.
 for(const [width,height] of sizes)for(const standalone of [false,true])for(const travel of [false,true]){
  const {ctx,page}=await context({width,height,standalone,travel,time:monday});await page.goto(base);await page.locator('.atlas-veil').waitFor();await settle(page);const g=await geometry(page);
  check(g.veil.y===0&&g.veil.bottom>=height&&g.bottom,'Continuous veil surface');check(!g.overflow,'Veil content overflows '+JSON.stringify(g));check(height-g.almanac.bottom<=2&&g.almanac.bottom<=height,'Almanac not at safe bottom');check(g.rule==='2px','Bright almanac rule regressed');check(g.portrait.y>=(g.travel||g.band).bottom&&g.portrait.bottom<=g.almanac.y,'Portrait outside quiet territory '+JSON.stringify(g));check(g.portrait.height>=25&&g.portrait.width>30,'Portrait clipped');check(Number(g.opacity)<=.3,'Portrait competes with information');check(g.band.y>=g.lockup.bottom,'Lockup overlaps recommendations');check(g.band.right<=width,'Week band overflow');
  check(await page.locator('.veil-tile.is-pending .veil-image').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).borderLeftWidth==='0px'&&getComputedStyle(n.parentElement).filter==='none'&&getComputedStyle(n.parentElement).borderLeftColor===getComputedStyle(n.parentElement).borderTopColor)),'Pending artwork darkens its frame');
  check(await page.locator('.veil-week-group').first().getAttribute('aria-label')==='Previous Week','Week order changed');
  const type=await page.evaluate(()=>{const width=n=>{const r=document.createRange();r.selectNodeContents(n);return r.getBoundingClientRect().width;};const cycle=document.querySelector('.veil-cycle'),sup=document.querySelector('.veil-number-prefix sup'),no=document.querySelector('.veil-no');return {month:parseFloat(getComputedStyle(cycle.firstElementChild).fontSize),season:parseFloat(getComputedStyle(cycle.lastElementChild).fontSize),ratio:width(cycle.firstElementChild)/width(cycle.lastElementChild),sup:parseFloat(getComputedStyle(sup).fontSize),issue:parseFloat(getComputedStyle(no).fontSize),top:parseFloat(getComputedStyle(sup).top)};});
  check(type.month/type.season>2&&type.ratio>.88&&type.ratio<1.15,'October hierarchy/width '+JSON.stringify(type));check(type.sup<type.issue*.5&&type.top<0,'Issue superscript missing');
  check(await page.locator('.veil-almanac-provenance').innerText()==='CHAPEL HILL, N.C. · SATURDAY 10 OCT','Almanac provenance/date wrong');
  const values=await page.locator('.veil-almanac-item').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {y:r.y,width:r.width,bottom:r.bottom}}));check(values.length===3&&Math.max(...values.map(r=>r.width))-Math.min(...values.map(r=>r.width))<1&&values.every(r=>r.y===values[0].y),'Almanac needs three balanced columns');
  if(width<760||width<1024&&height<600)check(await page.locator('.veil-almanac-symbol').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).display!=='none')),'iPhone symbols missing');
  check(await page.locator('.veil-tile.is-pending .veil-image').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).opacity==='1')),'Pending artwork should remain opaque');
  if(width===393&&!standalone&&!travel)await page.screenshot({path:resolve(output,'veil-portrait.png')});if(width===1440&&!standalone&&!travel)await page.screenshot({path:resolve(output,'veil-desktop.png')});if(width===852&&!standalone&&travel)await page.screenshot({path:resolve(output,'veil-landscape-travel.png')});
  evidence.layouts.push({standalone,travel,...g});await ctx.close();console.log(`veil ${width}x${height} ${standalone?'PWA':'browser'} travel=${travel} PASS`);
 }
 // Deliberate acceptance access uses the actual production renderer on a clear Sunday.
 const sunday='2026-10-04T17:14:00-04:00';
 const productionKey='rupert-veil:2026-10-10:preTuesday';
 const reviewKey='rupert-veil-review:acceptance-20261004:2026-10-10:preTuesday';
 const ready=async(page,url)=>{
  const data=Promise.all(['data/editions/index.json','data/photos.json'].map(path=>page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/'+path))));
  await page.goto(url);await Promise.all((await data).map(r=>r.finished()));await settle(page);
 };
 for(const [width,height] of sizes){
  const {ctx,page}=await context({width,height,time:sunday});
  await ready(page,base);check(await page.locator('.atlas-veil').count()===0,'Ordinary Sunday visit forced veil');
  await ready(page,base+'?veil=review');await page.locator('.atlas-veil').waitFor();
  const state=veilState(manifest,new Date(monday)),html=renderVeil(state,photos,await page.locator('body').getAttribute('data-base'));
  check(await page.evaluate(html=>{const normal=document.createElement('div');normal.innerHTML=html;return document.querySelector('.atlas-veil').innerHTML.replaceAll('?veil=review','')===normal.innerHTML;},html),'Review differs from actual production renderer');
  check(await page.locator('.veil-tile.is-published').count()===2&&await page.locator('.veil-tile.is-pending').count()===2,'Review changed publication states');
  check(await page.locator('.atlas-veil a').evaluateAll(ns=>ns.every(n=>new URL(n.href).searchParams.get('veil')==='review')),'Review links lost deliberate review context');
  const g=await geometry(page);check(g.bottom&&!g.overflow&&height-g.almanac.bottom<=2,'Review coverage/safe-bottom regression');
  await page.screenshot({path:resolve(output,`acceptance-review-${width}x${height}.png`)});
  await page.locator('.atlas-veil').click({position:{x:8,y:170}});
  check(await page.locator('.atlas-veil').count()===0,'Initial review background dismissal failed');
  check(await page.evaluate(k=>sessionStorage.getItem(k)==='1',reviewKey),'Review dismissal was not remembered');
  check(await page.evaluate(k=>sessionStorage.getItem(k)===null,productionKey),'Review poisoned production dismissal state');
  await ready(page,base);check(await page.locator('.atlas-veil').count()===0,'Review leaked into ordinary Sunday');
  await page.clock.setSystemTime(new Date(monday));await ready(page,base);await page.locator('.atlas-veil').waitFor();
  check(await page.locator('.atlas-veil a').evaluateAll(ns=>ns.every(n=>!n.search)),'Review query leaked into natural links');
  await ctx.close();console.log(`acceptance review/dismissal isolation ${width}x${height} PASS`);
 }
 // One physical-style touch must navigate immediately, with a pre-paint frontispiece
 // even while destination enhancement is held back. Query access also works in PWA.
 for(const standalone of [false,true]){
  const {ctx,page}=await context({time:sunday,standalone});
  await ready(page,base);check(await page.locator('.atlas-veil').count()===0,'PWA alone forced Sunday veil');
  await page.evaluate(k=>{sessionStorage.setItem(k,'1');sessionStorage.setItem('rupert-veil-review:2026-10-10:preTuesday','1');},productionKey);
  await ready(page,base+'?veil=review');await page.locator('.atlas-veil').waitFor();
  check(await page.evaluate(k=>sessionStorage.getItem(k)===null,reviewKey),'Old dismissal blocked new acceptance access');
  const tile=page.locator('.veil-week-group').first().locator('.veil-tile.is-published').first(),target=new URL(await tile.getAttribute('href'),page.url()),point=await tile.boundingBox();
  check(target.search==='?veil=review','Previous Week review destination missing query');
  let release;const gate=new Promise(r=>release=r);await page.route('**/assets/js/site.js*',async r=>{await gate;await r.continue();});
  const committed=page.waitForURL(target.href,{waitUntil:'commit'});
  await page.touchscreen.tap(point.x+point.width/2,point.y+point.height/2);await committed;
  await page.locator('.ed-head h1').waitFor({state:'attached'});
  check(page.url()===target.href,'Review touch did not immediately navigate to Full Edition');
  check(await page.locator('.atlas-veil').count()===1,'Uncovered review destination before enhancement');
  check(await page.evaluate(()=>!!window.__atlasVeilArrival&&sessionStorage.getItem('rupert-frontispiece-arrival')===null),'Review pre-paint arrival not consumed once');
  check(await page.evaluate(k=>sessionStorage.getItem(k)===null,reviewKey),'Previous Week touch dismissed review');
  release();await page.waitForLoadState('load');await page.waitForFunction(()=>!window.__atlasVeilArrival&&document.body.style.position==='fixed');
  check(await page.locator('.atlas-veil').count()===1,'Enhancement removed destination review');
  const before=page.url();await page.touchscreen.tap(8,500);
  check(await page.locator('.atlas-veil').count()===0&&await page.locator('.ed-head h1').isVisible(),'Review background touch did not reveal Full Edition');
  check(page.url()===before,'Review dismissal caused latent navigation');
  check(await page.evaluate(([p,r])=>sessionStorage.getItem(p)==='1'&&sessionStorage.getItem(r)==='1',[productionKey,reviewKey]),'Review changed pre-existing production dismissal');
  await page.reload();await settle(page);check(await page.locator('.atlas-veil').count()===0,'Review dismissal reopened on reload');
  await ready(page,base);check(await page.locator('.atlas-veil').count()===0,'Completed review forced ordinary Sunday');
  await ctx.close();console.log(`acceptance single-touch navigation ${standalone?'PWA':'browser'} PASS`);
 }
 // Unrecognized queries and installed display mode cannot override real publication.

 const thursdayPublished=structuredClone(manifest);
 thursdayPublished.editions.find(e=>e.id==='2026-W41-thu').status='published';
 const delayedTuesday=structuredClone(manifest);
 delayedTuesday.editions.find(e=>e.id==='2026-W41-tue').status='draft';
 const states=[
  {name:'Monday',time:'2026-10-05T12:00:00-04:00',active:true,published:2,pending:2,direct:true},
  {name:'Tuesday before 7 AM',time:'2026-10-06T06:59:59-04:00',active:true,published:2,pending:2},
  {name:'Tuesday actually published',time:'2026-10-06T07:00:01-04:00',active:false},
  {name:'Wednesday',time:'2026-10-07T12:00:00-04:00',active:true,published:3,pending:1,direct:true},
  {name:'Thursday before 7 AM',time:'2026-10-08T06:59:59-04:00',fixture:thursdayPublished,active:true,published:3,pending:1},
  {name:'Thursday actually published',time:'2026-10-08T07:00:01-04:00',fixture:thursdayPublished,active:false},
  {name:'Friday after Thursday publication',time:'2026-10-09T12:00:00-04:00',fixture:thursdayPublished,active:false},
  {name:'Saturday after Thursday publication',time:'2026-10-10T12:00:00-04:00',fixture:thursdayPublished,active:false},
  {name:'Sunday after Thursday publication',time:'2026-10-11T23:59:59-04:00',fixture:thursdayPublished,active:false},
  {name:'Current published Friday',time:'2026-10-02T16:00:00-04:00',active:false},
  {name:'Current published Saturday',time:'2026-10-03T12:00:00-04:00',active:false},
  {name:'Tuesday publication delayed',time:'2026-10-06T15:00:00-04:00',fixture:delayedTuesday,active:true,published:2,pending:2},
  {name:'Thursday publication delayed',time:'2026-10-08T15:00:00-04:00',active:true,published:3,pending:1},
  {name:'Friday without Thursday publication',time:'2026-10-09T12:00:00-04:00',active:true,published:3,pending:1}
 ];
 for(const mode of ['browser','other-query','standalone']){
  for(const state of states)for(const route of state.direct?['','edition/2026-W40-r1-tue/']:['']){
   const {ctx,page}=await context({time:state.time,standalone:mode==='standalone',fixture:state.fixture||manifest});
   await page.clock.setFixedTime(new Date(state.time));
   const data=Promise.all(['data/editions/index.json','data/photos.json'].map(path=>page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/'+path))));
   await page.goto(base+route+(mode==='other-query'?'?veil=ignored':''));
   await Promise.all((await data).map(r=>r.finished()));await settle(page);
   check(await page.locator('.atlas-veil').count()===(state.active?1:0),`${mode}: ${state.name} lifecycle wrong on ${route||'This Week'}`);
   if(state.active){
    check(await page.locator('.veil-tile.is-published').count()===state.published&&await page.locator('.veil-tile.is-pending').count()===state.pending,'Clock falsely revealed unpublished artwork: '+state.name);
    check(await page.locator('.atlas-veil a').evaluateAll(ns=>ns.every(n=>!n.search)),'Review-only query propagated');
    check(await page.evaluate(()=>document.body.style.position==='fixed'&&document.querySelector('main').inert),'Active veil did not lock underlying route');
   }else check(await page.evaluate(()=>document.body.style.position!=='fixed'&&!document.querySelector('main').inert&&!document.documentElement.classList.contains('veil-active')),'Inactive lifecycle retained scroll/inert lock');
   if(route)check(await page.locator('.ed-head h1').count()===1,'Direct Full Edition failed beneath active veil');
   evidence.lifecycle.push({mode,name:state.name,time:state.time,route,active:state.active});await ctx.close();
  }
  console.log(`${mode} natural lifecycle, actual publication, direct editions and clear weekends PASS`);
 }
 // Exact single-touch sequence, including the destination before its enhancement module loads.
 for(const mode of ['standard','other-query','standalone']){
  const {ctx,page}=await context({standalone:mode==='standalone',time:monday});
  await page.goto(base+(mode==='other-query'?'?veil=ignored':''));await page.locator('.atlas-veil').waitFor();await settle(page);
  const tile=page.locator('.veil-tile.is-published').first(),target=new URL(await tile.getAttribute('href'),page.url()),point=await tile.boundingBox();
  check(!target.search,'Review query propagated into published navigation');
  let release;const gate=new Promise(r=>release=r);
  await page.route('**/assets/js/site.js*',async r=>{await gate;await r.continue();});
  const committed=page.waitForURL(target.href,{waitUntil:'commit'});
  await page.touchscreen.tap(point.x+point.width/2,point.y+point.height/2);await committed;
  await page.locator('.ed-head h1').waitFor({state:'attached'});
  check(page.url()===target.href,'Single tap did not open selected Full Edition');
  check(await page.locator('.atlas-veil').count()===1,'Destination flashed before active frontispiece restoration');
  check(await page.locator('.atlas-veil img').evaluateAll(async ns=>{await Promise.all(ns.map(n=>n.decode()));return ns.every(n=>n.naturalWidth>0);}), 'Arrival artwork did not survive route depth change');
  check(await page.evaluate(()=>!!window.__atlasVeilArrival&&sessionStorage.getItem('rupert-frontispiece-arrival')===null),'Arrival must be consumed once, before enhancement');
  check(await page.evaluate(()=>!Object.keys(sessionStorage).some(k=>k.startsWith('rupert-veil'))),'Navigation incorrectly dismissed veil');
  release();await page.waitForLoadState('load');await page.waitForFunction(()=>!window.__atlasVeilArrival&&document.body.style.position==='fixed');
  const before=page.url();await page.touchscreen.tap(8,500);
  check(await page.locator('.atlas-veil').count()===0,'One background tap did not dismiss destination veil');
  check(page.url()===before&&await page.locator('.ed-head h1').isVisible(),'Background dismissal triggered latent navigation');
  check(await page.evaluate(()=>Object.keys(sessionStorage).filter(k=>k.startsWith('rupert-veil')).length===1),'Intentional dismissal not saved');
  await ctx.close();console.log(`${mode} single-touch destination/arrival/background sequence PASS`);
 }
 // Stale or unrelated one-use arrivals must never force a frontispiece on a clear Friday.
 for(const kind of ['expired','other-route','unsafe-tree']){
  const {ctx,page}=await context();
  const target=new URL(base);const payload={target:kind==='other-route'?target.pathname+'edition/':target.pathname,expires:new Date('2026-10-02T16:00:00-04:00').getTime()+(kind==='expired'?-1:10000),tree:{tag:kind==='unsafe-tree'?'script':'div',attrs:[['class','atlas-veil']],children:[]}};
  await page.addInitScript(data=>sessionStorage.setItem('rupert-frontispiece-arrival',JSON.stringify(data)),payload);
  await page.goto(base);check(await page.locator('.atlas-veil').count()===0,'Invalid arrival forced Friday veil: '+kind);
  check(await page.evaluate(()=>sessionStorage.getItem('rupert-frontispiece-arrival')===null),'Invalid arrival not consumed');await ctx.close();
 }
 // Natural publication-aware navigation preserves the selected page beneath the active veil.
 for(const mode of ['standard','standalone']){
  const {ctx,page}=await context({time:monday,standalone:mode==='standalone',travel:true});await page.goto(base);await page.locator('.atlas-veil').waitFor();
  const dest=await page.locator('.veil-tile[href]').first().getAttribute('href');await page.locator('.veil-tile[href]').first().click();await page.waitForURL('**/edition/**');await page.locator('.atlas-veil').waitFor();check(page.url().includes('/edition/'),'Navigation lost selected edition');check(await page.locator('.ed-head h1').count()===1,'Edition not underneath');check(await page.evaluate(()=>Object.keys(sessionStorage).filter(k=>k.includes('veil')).length===0),'Tile set dismissal state');
  await page.locator('.veil-travel').click();await page.waitForURL('**/travel/**');await page.locator('.atlas-veil').waitFor();check(page.url().includes('#saved-trips'),'Travel target lost');
  await page.keyboard.press('Escape');check(await page.locator('.atlas-veil').count()===0,'Escape did not dismiss');check(await page.evaluate(()=>Object.keys(sessionStorage).filter(k=>k.includes('veil')).length===1),'Dismissal not recorded');await page.reload();check(await page.locator('.atlas-veil').count()===0,'Intentional dismissal not preserved');await ctx.close();console.log(`${mode} veil navigation PASS`);
 }
 // Simulated safe area plus Safari dynamic viewport change (does not claim physical Safari coverage).
 {const {ctx,page}=await context({time:monday});await page.goto(base);await page.locator('.atlas-veil').waitFor();await page.addStyleTag({content:'.atlas-veil{bottom:-34px}.veil-plate{padding-bottom:100px}.veil-almanac{bottom:34px}'});for(const height of [700,852]){await page.setViewportSize({width:393,height});await page.waitForFunction(()=>Math.abs(document.querySelector('.veil-plate').getBoundingClientRect().height-visualViewport.height-visualViewport.offsetTop)<1);const g=await geometry(page);check(g.veil.bottom>=height+34&&g.bottom,'Safe area background');check(Math.abs(height-g.almanac.bottom-34)<1,'Safe area almanac');check(g.portrait.bottom<=g.almanac.y,'Safe area portrait collision');}await ctx.close();}
 // Shared information component and footer/dock at every changed viewport.
 for(const [width,height] of sizes){const {ctx,page}=await context({width,height});await page.goto(base);await page.locator('.outing-info').first().waitFor();await settle(page);check(await page.locator('.outing-info').count()===2,'Both recommendations need shared info');
  for(const slot of ['tuesday','thursday']){if(width<760)await page.locator('#tab-'+slot).click();const plate=page.locator('#plate-'+slot);check(await plate.locator('.outing-heading').count()>=2,'Section hierarchy missing');check(await plate.locator('.outing-forecast tbody tr').count()===2,'Weekend rows missing');check(await plate.locator('.outing-trail').count()===1,'Trail note missing');check(await plate.locator('.outing-info').evaluate(n=>n.scrollWidth<=n.clientWidth),'Information overflow');check((await plate.locator('.p-title').evaluate(n=>getComputedStyle(n).fontFamily)).includes('Dunhill'),'Recommendation title font changed');if(width<760)check(await plate.locator('.outing-heading').first().evaluate(n=>getComputedStyle(n).color==='rgb(135, 82, 31)'&&parseFloat(getComputedStyle(n).fontSize)===16),'Accepted mobile section headings changed');}
  if(width===393){await page.locator('#plate-thursday .outing-info').screenshot({path:resolve(output,'outing-portrait.png')});await page.screenshot({path:resolve(output,'this-week-portrait.png'),fullPage:true});}
  for(const route of ['', 'archive/', 'atlas/']){await page.goto(base+route);await page.locator('.footer-identity img').waitFor();await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,document.documentElement.scrollHeight)});await page.clock.runFor(100);const g=await page.evaluate(()=>{const r=n=>{const v=n.getBoundingClientRect();return {y:v.y,bottom:v.bottom,height:v.height,right:v.right}};return {dock:r(document.querySelector('.dock')),links:[...document.querySelectorAll('.utility-footer a,.footer-identity')].map(r),mark:r(document.querySelector('.footer-identity img')),targets:[...document.querySelectorAll('.dock a')].map(r),overflow:document.documentElement.scrollWidth>innerWidth};});check(!g.overflow,'Horizontal page overflow');check(g.mark.height>=28&&g.mark.height<=30,'Footer portrait size');if(width<760){check(g.dock.height===54,'Dock should be 52px plus border');check(g.targets.every(t=>t.height>=44),'Dock target too small');check(g.links.every(t=>t.bottom<=g.dock.y),'Footer hidden by dock');}}
  await ctx.close();console.log(`week/footer ${width}x${height} PASS`);
 }
 // Routing starts automatically from a saved Home even when legacy routing preference was false.
 for(const [width,height] of [[393,852],[375,812],[852,393],[1440,1000]]){
  const {ctx,page}=await context({width,height,home:true});const requests=await mapFixtures(page);await page.goto(base+'atlas/');await page.locator('.qa-marker').first().waitFor();await page.locator('.qa-marker[data-place="hillsborough-riverwalk"]').evaluate(n=>n.click());await page.locator('.dossier-provider').waitFor();check(requests.length===1,'Map selection did not route automatically');check(await page.locator('.dossier-provider').innerText()==='OSRM Estimate · Traffic Not Included','Traffic claim inaccurate');check(await page.locator('#traffic-enabled').isDisabled(),'Unavailable traffic control active');check(await page.locator('#traffic-note').textContent()==='Live traffic unavailable with current routing provider.','Traffic limitation missing');
  if(width<760&&width<height){check(await page.locator('#map-card').isHidden(),'Active baseline route must suppress place popup');await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,scrollY+document.querySelector('.atlas-map').getBoundingClientRect().top-10)});await page.clock.runFor(100);await page.screenshot({path:resolve(output,'atlas-route-portrait.png')});}
  await page.locator('#place-picker').selectOption('eno-cox-mountain',{force:width>=1024});await page.waitForFunction(()=>document.querySelector('.dossier-destination').textContent.includes('Cox Mountain')&&!!document.querySelector('.dossier-provider'));check(requests.length===2,'Picker did not replace route');if(width<760&&width<height){await page.locator('.qa-marker[data-place="eno-cox-mountain"]').evaluate(n=>n.click());await page.locator('.dossier-provider').waitFor();check(await page.locator('#map-card').isHidden(),'Cox Mountain baseline route must suppress popup');}check(await page.evaluate(()=>window.__refinementMap.routes.length===1&&window.__refinementMap.selected==='eno-cox-mountain'),'Selection/route replacement');
  await page.locator('.reg-row[data-place="hillsborough-riverwalk"] button[data-show]').evaluate(n=>n.click());await page.waitForFunction(()=>document.querySelector('.dossier-destination').textContent.includes('Riverwalk')&&!!document.querySelector('.dossier-provider'));check(requests.length===(width<760&&width<height?4:3),'Directory did not replace route');
  await page.locator('#forget-location').evaluate(n=>n.click());check(await page.evaluate(()=>window.__refinementMap.routes.length===0&&window.__refinementMap.home===null&&localStorage.getItem('rupert-location-v1')===null),'Clearing Home retained route/location');await page.locator('#place-picker').selectOption('hillsborough-riverwalk',{force:width>=1024});await page.clock.runFor(100);check(requests.length===(width<760&&width<height?4:3),'Home absent still routed');await ctx.close();console.log(`automatic routing ${width}x${height} PASS`);
 }
 // Popup composition is preserved for normal map exploration with no route.
 for(const width of [375,393]){
  const {ctx,page}=await context({width,height:852});const requests=await mapFixtures(page);await page.goto(base+'atlas/');await page.locator('.qa-marker').first().waitFor();
  for(const id of ['hillsborough-riverwalk','eno-cox-mountain','umstead-company-mill']){
   await page.locator('.qa-marker[data-place="'+id+'"]').evaluate(n=>n.click());await page.locator('#map-card').waitFor();
   const g=await page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return {card:rect('#map-card'),route:rect('#drive-status'),name:rect('.mc-name'),close:rect('.mc-close'),status:rect('.mc-status'),bottom:rect('.mc-bottom'),nameSize:parseFloat(getComputedStyle(document.querySelector('.mc-name')).fontSize),linkSize:parseFloat(getComputedStyle(document.querySelector('.mc-link')).fontSize),county:document.querySelector('.mc-place-detail').textContent};});
   check(requests.length===0&&await page.evaluate(()=>window.__refinementMap.routes.length===0),'Exploration popup must not create a route');
   check(g.card.y>=g.route.bottom+8&&g.card.width<=250&&g.card.height<=164,'Exploration card geometry changed '+JSON.stringify(g));
   check(g.name.right<=g.close.x&&g.status.y>=g.name.bottom&&g.bottom.y>=g.status.bottom,'Exploration popup hierarchy changed');
   check(g.nameSize>=32&&g.linkSize<=10&&g.close.height>=44,'Exploration type/Close target changed');
   if(id==='hillsborough-riverwalk')check(g.county==='Orange County','Canonical county missing');
   await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,scrollY+document.querySelector('.atlas-map').getBoundingClientRect().top-10)});await page.clock.runFor(100);
   check(await page.locator('#map-card').evaluate(n=>n.getBoundingClientRect().bottom<=document.querySelector('.dock').getBoundingClientRect().top),'Exploration card hidden by dock');
   await page.screenshot({path:resolve(output,'atlas-exploration-'+id+'-'+width+'.png')});
   await page.getByRole('button',{name:'Close place card',exact:true}).click();check(await page.locator('#map-card').isHidden()&&await page.evaluate(id=>window.__refinementMap.selected===id,id),'Exploration Close changed selection');
  }
  await ctx.close();
 }
 {const {ctx,page}=await context();const requests=await mapFixtures(page);await page.goto(base+'atlas/');await page.locator('.qa-marker').first().waitFor();await page.locator('#place-picker').selectOption('hillsborough-riverwalk');check(requests.length===0,'Neutral state sent route');await page.locator('.location-settings summary').click();await page.locator('#location-form input[name="lat"]').fill('35.913');await page.locator('#location-form input[name="lng"]').fill('-79.056');await page.locator('#location-form').evaluate(n=>n.requestSubmit());await page.locator('.dossier-provider').waitFor();check(requests.length===1,'Saving Home after selection did not route');await ctx.close();}
 {const {ctx,page}=await context();await page.goto(base+'edition/2026-W40-tue/');check(await page.locator('.withdrawal').innerText().then(s=>s.includes('Recommendation Withdrawn')&&s.includes('Withdrawal recorded')),'Withdrawn treatment missing');check(await page.locator('.outing-info').count()===0,'Withdrawn page redesigned');await ctx.close();}
 check(evidence.errors.length===0,'JavaScript errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} browser assertions PASS`);
}finally{await browser.close();server?.close();}
