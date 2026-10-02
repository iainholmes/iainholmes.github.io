// Browser QA only: clocks, route responses and saved journeys are isolated runtime fixtures.
// Usage: ATLAS_QA_CHROME=/path/to/chromium node rupert/_tools/closure-browser-test.mjs
// ATLAS_QA_URL=https://iainholmes.github.io/rupert/ reuses the same checks against deployed bytes.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
const require=createRequire(import.meta.url), { chromium }=require('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const json=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const manifest=await json('data/editions/index.json');
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/closure-evidence'));await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
let server;
if(!process.env.ATLAS_QA_URL){
  server=createServer(async(req,res)=>{try{let file=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+'/'))throw Error();if((await stat(file)).isDirectory())file=resolve(file,'index.html');res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
}
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
const proxyUrl=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyUrl?{server:proxyUrl.origin,bypass:'127.0.0.1,localhost',...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,args,proxy,...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={base,engine:await browser.version(),checks:0,layouts:[],pages:[],errors:[],map:'fixture',physicalIPhone:false};
const check=(condition,message)=>{assert.ok(condition,message);evidence.checks++;};
const delay = async page => {
  await page.evaluate(async()=>{const images=[...document.images].filter(i=>{const r=i.getBoundingClientRect();return i.closest('.atlas-veil')||i.loading!=='lazy'||(r.top<innerHeight&&r.bottom>0);});await Promise.all(images.map(i=>{i.loading='eager';return i.decode();}));await document.fonts.ready;});
  await page.clock.runFor(100);
};
const journey={schema_version:1,plans:[{id:'tp_closure_qa',title:'Blue Ridge Weekend',dates:{start:'2026-10-17',end:'2026-10-18'},legs:[{mode:'car',from:{label:'Chapel Hill'},to:{label:'Asheville'}}]}]};
const routes=['','atlas/','travel/','log/','archive/','edition/2026-W40-r1-tue/','edition/2026-W40-thu/','edition/2026-W41-thu/','edition/'];
const viewports=[[375,812],[390,844],[393,852],[402,874],[430,932],[852,393],[844,390],[768,1024],[1024,768],[1440,1000]];
async function context(viewport={width:393,height:852},time='2026-10-05T12:00:00-04:00',travel=false,fixture=manifest){
  const ctx=await browser.newContext({viewport,isMobile:viewport.width<760,hasTouch:viewport.width<760,reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>evidence.errors.push(e.message));
  await page.clock.install({time:new Date(time)});
  await page.route('**/data/editions/index.json',r=>r.fulfill({json:fixture}));
  if(travel)await page.addInitScript(value=>localStorage.setItem('rupert-travel-v1',JSON.stringify(value)),journey);
  return {ctx,page};
}
try{
  // Every shared shell opens its requested route under the veil, without a redirect.
  for(const route of routes){const {ctx,page}=await context();const response=await page.goto(base+route);check(response.ok(),'Route unavailable: '+route);await page.locator('.atlas-veil').waitFor();await delay(page);check(page.url()===base+route,'Requested route changed');check(await page.locator('main').evaluate(n=>n.inert),'Main is not inert');check(await page.locator('.dock').evaluate(n=>n.inert),'Dock is not inert');evidence.pages.push(route||'This Week');await ctx.close();}
  // All four artworks, optional genuine local Travel, and footer remain inside one viewport.
  for(const [width,height] of viewports)for(const time of ['2026-10-05T12:00:00-04:00','2026-10-07T12:00:00-04:00'])for(const travel of [false,true]){
    const {ctx,page}=await context({width,height},time,travel);await page.goto(base);await page.locator('.atlas-veil').waitFor();await delay(page);
    const geometry=await page.evaluate(()=>{const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};const v=document.querySelector('.atlas-veil'),plate=v.querySelector('.veil-plate');return {viewport:{width:innerWidth,height:innerHeight},veil:rect(v),client:v.clientHeight,scroll:v.scrollHeight,plateClient:plate.clientHeight,plateScroll:plate.scrollHeight,groups:[...v.querySelectorAll('.veil-group')].map(rect),tiles:[...v.querySelectorAll('.veil-image')].map(rect),footer:rect(v.querySelector('footer')),travel:v.querySelector('.veil-travel')?rect(v.querySelector('.veil-travel')):null,lockup:rect(v.querySelector('.veil-lockup')),documentScroll:document.documentElement.scrollHeight,focusInside:v.contains(document.activeElement)};});
    check(geometry.veil.x===0&&geometry.veil.y===0&&geometry.veil.width===width&&geometry.veil.height===height,'Veil coverage');check(geometry.scroll<=geometry.client,'Veil scrolls');check(geometry.plateScroll<=geometry.plateClient,'Plate overflows');check(geometry.groups[0].y===geometry.groups[1].y,'Recommendation groups stack');check(geometry.tiles.length===4&&geometry.tiles.every(t=>t.width>=44&&t.x>=0&&t.right<=width&&t.y>=0&&t.bottom<=height),'Artwork clipped');check(geometry.footer.bottom<=height&&geometry.footer.y>=0,'Almanac clipped');check(!geometry.travel||geometry.travel.bottom<=geometry.footer.y,'Travel overflow');check(Math.abs(geometry.lockup.x+geometry.lockup.width/2-width/2)<1,'Lockup off center');check(geometry.focusInside,'Focus behind veil');check(geometry.documentScroll<=height,'Underlying document can scroll');
    const before=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,500);check(await page.evaluate(()=>scrollY)===before,'Background scroll changed');check((await page.locator('.veil-tile.is-pending').count())===(time.includes('05T')?2:1),'Tile publication state');check(await page.locator('.veil-travel').count()===(travel?1:0),'Travel omission');
    evidence.layouts.push({width,height,time,travel,...geometry});
    if(width===393&&time.includes('05T')&&travel)await page.screenshot({path:resolve(output,'veil-portrait.png')});
    if(width===1440&&time.includes('07T')&&!travel)await page.screenshot({path:resolve(output,'veil-desktop.png')});
    await ctx.close();
  }
  // Child clicks do not dismiss; keyboard focus stays above the inert shell.
  {const {ctx,page}=await context();await page.goto(base);await page.locator('.atlas-veil').waitFor();await page.keyboard.press('Shift+Tab');check(await page.evaluate(()=>document.activeElement===document.querySelector('.atlas-veil a:last-of-type')||document.activeElement===Array.from(document.querySelectorAll('.atlas-veil a')).at(-1)),'Reverse Tab missed last link');await page.locator('.veil-tile[href]').first().evaluate(a=>a.addEventListener('click',e=>e.preventDefault(),{once:true}));await page.locator('.veil-tile[href]').first().click();check(await page.locator('.atlas-veil').count()===1,'Child click dismissed veil');for(let i=0;i<6;i++){await page.keyboard.press('Tab');check(await page.evaluate(()=>document.querySelector('.atlas-veil').contains(document.activeElement)),'Tab escaped veil');}await page.keyboard.press('Escape');check(await page.locator('.atlas-veil').count()===0,'Escape did not dismiss');check(await page.locator('main').evaluate(n=>!n.inert),'Inert not restored');check(await page.evaluate(()=>document.body.style.position!=='fixed'),'Scroll lock not restored');await page.goto(base+'atlas/');check(await page.locator('.atlas-veil').count()===0,'Same phase reopened');await page.clock.setSystemTime(new Date('2026-10-07T12:00:00-04:00'));await page.clock.runFor(60050);await page.locator('.atlas-veil[data-phase="preThursday"]').waitFor();check(await page.locator('.veil-tile.is-published').count()===3,'Wednesday did not return with published Tuesday');await page.locator('.atlas-veil').click({position:{x:8,y:170}});check(await page.locator('.atlas-veil').count()===0,'Backdrop did not dismiss');check(page.url()===base+'atlas/','Backdrop clicked through');await ctx.close();}
  // A phase appearing while the reader is already deep in a page preserves reading position and focus.
  {const {ctx,page}=await context(undefined,'2026-10-02T16:00:00-04:00');await page.goto(base);await page.locator('.dock a').nth(1).focus();await page.evaluate(()=>scrollTo(0,700));const before=await page.evaluate(()=>scrollY);await page.clock.setSystemTime(new Date('2026-10-05T12:00:00-04:00'));await page.clock.runFor(60050);await page.locator('.atlas-veil').waitFor();check(await page.evaluate(()=>document.body.style.top)===`-${before}px`,'Reading position not captured');await page.keyboard.press('Escape');check(await page.evaluate(()=>scrollY)===before,'Reading position not restored');check(await page.locator('.dock a').nth(1).evaluate(n=>n===document.activeElement),'Focus not restored');await ctx.close();}
  // Exact clock boundary plus genuine availability; no production data is changed.
  for(const [time,published,visible] of [['2026-10-06T07:00:00-04:00',false,true],['2026-10-06T07:00:00-04:00',true,false],['2026-10-08T07:00:00-04:00',false,true],['2026-10-08T07:00:00-04:00',true,false]]){
    const fixture=structuredClone(manifest),slot=time.includes('06T')?'2026-W41-tue':'2026-W41-thu';fixture.editions.find(e=>e.id===slot).status=published?'published':'draft';const {ctx,page}=await context(undefined,time,false,fixture);await page.goto(base);await page.waitForFunction(()=>document.documentElement.classList.contains('js'));if(visible)await page.locator('.atlas-veil').waitFor();else await page.waitForFunction(()=>document.querySelector('.week')?.dataset.pair.includes('2026-10-10'));check(await page.locator('.atlas-veil').count()===(visible?1:0),'Clock implied false publication');check(await page.locator(`.veil-tile[href*="${slot}"]`).count()===0,'Unpublished full-edition route exposed');await ctx.close();
  }
  // New cycle can re-open, and sessions spanning midnight update the calendar identity.
  {const fixture=structuredClone(manifest);fixture.editions.find(e=>e.id==='2026-W41-thu').status='published';for(const slot of ['tue','thu'])fixture.editions.push({...fixture.editions.find(e=>e.id==='2026-W41-'+slot),id:'2026-W42-'+slot,status:'draft',published_at:`2026-10-${slot==='tue'?'13':'15'}T07:00:00-04:00`,weekend:{start:'2026-10-17',end:'2026-10-18'}});const {ctx,page}=await context(undefined,'2026-10-05T12:00:00-04:00',false,fixture);await page.goto(base);await page.locator('.atlas-veil').waitFor();await page.keyboard.press('Escape');await page.clock.setSystemTime(new Date('2026-10-12T00:00:00-04:00'));await page.clock.runFor(60050);await page.locator('.atlas-veil[data-cycle="2026-10-17"]').waitFor();check(await page.locator('.dateline span').last().innerText()==='October III · AUTUMN · 2026','Midnight cycle identity stale');await ctx.close();}
  // Local portrait selectors, actual long titles, and full-edition title font.
  {const {ctx,page}=await context(undefined,'2026-10-02T16:00:00-04:00');await page.goto(base);await delay(page);const align=await page.locator('.tab-k').evaluateAll(nodes=>nodes.map(n=>({number:n.firstElementChild.getBoundingClientRect().top,label:n.lastElementChild.getBoundingClientRect().top,height:n.getBoundingClientRect().height})));check(align[0].number===align[1].number&&align[0].label===align[1].label&&align[0].height===align[1].height,'Choice alignment mismatch');for(const slot of ['tuesday','thursday']){await page.locator('#tab-'+slot).click();await delay(page);const title=await page.locator('#plate-'+slot+' .p-title').evaluate(n=>({family:getComputedStyle(n).fontFamily,line:parseFloat(getComputedStyle(n).lineHeight),size:parseFloat(getComputedStyle(n).fontSize),height:n.getBoundingClientRect().height}));check(title.family.includes('Dunhill')&&title.line/title.size>=1.25&&title.height>title.line,'Multiline Dunhill metrics');}await page.screenshot({path:resolve(output,'this-week-portrait.png')});for(const id of ['2026-W40-r1-tue','2026-W40-thu']){await page.goto(base+'edition/'+id+'/');await delay(page);check((await page.locator('.ed-head h1').evaluate(n=>getComputedStyle(n).fontFamily)).includes('Dunhill'),'Full-edition title font');check(await page.locator('.fetch-trigger').count()>0,'Fetch game missing');}await page.screenshot({path:resolve(output,'edition-portrait.png')});await ctx.close();}
  // Route UI uses real application event handlers and geometry, with a deterministic provider/OSRM fixture.
  const provider=`export async function createMap(el){let handlers={},features=[];window.__closureMap={routes:[],selected:null,focus:null};const state=window.__closureMap;const api={resize(){},setMarkers(list){features=list;el.replaceChildren(...list.map((f,i)=>{const b=document.createElement('button');b.className='qa-marker';b.textContent='Select '+f.properties.name;b.style.cssText='position:absolute;left:20px;top:'+(340+i*48)+'px';b.onclick=()=>handlers.select?.forEach(fn=>fn(f.properties.id));return b;}));},setRoutes(value){state.routes=value;},fit(){},select(id){state.selected=id;},focus(id){state.focus=id;},setRelief(){},setHome(){},centerHome(){},on(name,fn){(handlers[name]??=[]).push(fn);return api;},diagnostics(){return{};},destroy(){}};return api;}`;
  for(const viewport of [{width:393,height:852},{width:375,height:812},{width:852,height:393}]){
    const {ctx,page}=await context(viewport,'2026-10-02T16:00:00-04:00');
    await page.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:provider}));
    await page.route('https://router.project-osrm.org/**',r=>r.fulfill({json:{code:'Ok',routes:[{duration:900,distance:12070,geometry:{type:'LineString',coordinates:[[-79.056,35.913],[-79.099,36.07]]}}]}}));
    await page.addInitScript(()=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:{lat:35.913,lng:-79.056},routing:true})));
    await page.goto(base+'atlas/');await page.locator('.qa-marker').first().waitFor();
    await page.getByRole('button',{name:'Select Riverwalk',exact:true}).click();await page.locator('.dossier-provider').waitFor();
    const before=await page.locator('#drive-status').innerText();
    if(viewport.width<viewport.height){check(await page.locator('#atlas-selection').evaluate(n=>getComputedStyle(n).textAlign==='left'),'Selected title alignment');check(await page.locator('#atlas-context').evaluate(n=>getComputedStyle(n).textAlign==='left'&&n.scrollWidth<=n.clientWidth),'Selected address wrapping');}
    if(viewport.width<760){
      await page.locator('#map-card').waitFor();
      const bounds=await page.evaluate(()=>{const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return {route:rect('#drive-status'),popup:rect('#map-card'),controls:rect('.map-direct-controls')};});
      check(bounds.popup.top>=bounds.route.bottom+8,'Portrait cards collide');check(bounds.popup.top>=bounds.controls.bottom,'Popup hides map controls');
      await page.screenshot({path:resolve(output,'atlas-popup-portrait.png')});
      await page.getByRole('button',{name:'Close place card',exact:true}).click();check(await page.locator('#map-card').isVisible()===false,'Popup did not close');
    }else check(await page.locator('#map-card').isVisible()===false,'Wide map treatment changed');
    check(await page.locator('#drive-status').innerText()===before,'Popup close changed route card');
    check(await page.locator('#place-picker').inputValue()==='hillsborough-riverwalk','Popup close cleared selection');
    check(await page.evaluate(()=>window.__closureMap.routes.length)===1,'Popup close cleared route');
    check(await page.locator('#atlas-header-action').count()===0,'Banner action remains');
    await page.locator('#place-picker').selectOption('');check(await page.locator('#atlas-selection').innerText()==='Choose a Place','Stale selected title');
    check(await page.locator('#atlas-context').isVisible()===false,'Stale address');check(await page.evaluate(()=>window.__closureMap.routes.length)===0,'Empty selection retained route');
    await page.goto(base+'atlas/#place-not-a-real-place');await page.locator('.qa-marker').first().waitFor();check(await page.locator('#place-picker').inputValue()===''&&await page.evaluate(()=>window.__closureMap.routes.length===0&&window.__closureMap.focus===null),'Invalid hash targeted a place');
    await ctx.close();
  }
  // Existing Travel storage round-trip and saved-trip controls remain functional.
  {const {ctx,page}=await context(undefined,'2026-10-02T16:00:00-04:00',true);await page.goto(base+'travel/');await page.locator('#saved-trips .saved-trip').waitFor();await page.locator('#saved-trips').getByRole('button',{name:'Open',exact:true}).click();check(await page.locator('#trip-title').inputValue()==='Blue Ridge Weekend','Saved trip did not open');await page.getByRole('button',{name:'Save Trip',exact:true}).click();check(await page.locator('#saved-trips .saved-trip').count()===1,'Saving duplicated journey');check(await page.evaluate(()=>JSON.parse(localStorage.getItem('rupert-travel-v1')).plans.length)===1,'Travel storage changed');await ctx.close();}
  // Icon URLs and MIME; HTML references point to the same fresh portrait asset.
  {const {ctx,page}=await context(undefined,'2026-10-02T16:00:00-04:00');await page.goto(base);const pwa=await (await ctx.request.get(base+'manifest.webmanifest')).json();check(pwa.display==='standalone'&&pwa.start_url==='/rupert/'&&pwa.theme_color==='#1D2A3A','PWA identity changed');for(const icon of pwa.icons){const response=await ctx.request.get(base+icon.src);check(response.ok()&&response.headers()['content-type'].includes('image/png'),'PWA icon unavailable');}check((await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')).includes('?v='),'Apple icon cache version absent');await ctx.close();}
  // Genuine provider smoke test: no map or tile fixture and real timers. Failure is recorded accurately.
  {const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,reducedMotion:'reduce'}),page=await ctx.newPage();await page.clock.setFixedTime(new Date('2026-10-02T16:00:00-04:00'));await page.goto(base+'atlas/?qa=1');try{await page.waitForFunction(()=>['ready','failed','notice'].includes(document.querySelector('#map-state')?.dataset.state),{},{timeout:35000});}catch{}evidence.webgl=await page.locator('.qa-panel').innerText();await page.screenshot({path:resolve(output,'atlas-provider-portrait.png')});await ctx.close();}
  check(evidence.errors.length===0,'Browser runtime error: '+evidence.errors.join('; '));
  await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log(`${evidence.checks} browser checks passed; ${evidence.layouts.length} rendered layout cases; ${evidence.pages.length} routes. Chromium ${evidence.engine}.`);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
