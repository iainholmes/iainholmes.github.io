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
const manifest=await json('data/editions/index.json'),places=await json('data/places.json');
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/publication-evidence'));await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={checks:0,errors:[],layouts:[],physicalIOS:false,map:'provider test double; actual register/selection/routing UI',routes:'OSRM fixtures; public-origin real OSRM separately verified'};
const check=(ok,message)=>{assert.ok(ok,message);evidence.checks++;};
const home=places.reference_points['chapel-hill-public'];
const fakeMap=`export async function createMap(){const callbacks={};window.__publicationMap={markers:[],routes:[],selected:null};return {setMarkers(features){window.__publicationMap.markers=features;},setRoutes(features){window.__publicationMap.routes=features;},on(event,fn){callbacks[event]=fn;},select(id){window.__publicationMap.selected=id;},resize(){},setHome(){},centerHome(){},setRelief(){},fit(){},focus(){},setTrafficMode(){},setTrafficIncidents(){},setTrafficAttribution(){}};}`;
async function context({width=393,height=852,standalone=false,saved=false,fixture=manifest,time='2026-10-08T18:00:00-04:00'}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage(),requests=[],state={fail:false,minutes:29};
 page.on('pageerror',e=>evidence.errors.push(e.message));await page.clock.install({time:new Date(time)});await page.clock.setFixedTime(new Date(time));
 if(saved)await page.addInitScript(p=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:{lat:p.lat,lng:p.lng}})),home);
 if(standalone)await page.addInitScript(()=>{const m=matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:m(q);});
 await page.route('**/data/editions/index.json*',r=>r.fulfill({json:fixture}));
 await page.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:fakeMap}));
 await page.route('https://router.project-osrm.org/**',r=>{requests.push(r.request().url());if(state.fail)return r.fulfill({status:503,body:'Unavailable'});const coordinates=new URL(r.request().url()).pathname.split('/').at(-1).split(';').map(p=>p.split(',').map(Number));return r.fulfill({json:{code:'Ok',routes:[{duration:state.minutes*60,distance:24140,geometry:{type:'LineString',coordinates}}]}});});
 return {ctx,page,requests,state};
}
async function resumed(page){await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.clock.runFor(200);}
async function geometry(page){const out=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,drive:document.querySelector('.edition-drive')?.getBoundingClientRect().toJSON()}));check(!out.overflow,'Horizontal overflow');if(out.drive)check(out.drive.right<=await page.evaluate(()=>innerWidth)+1,'Drive fact clipped');return out;}
try{
 // Cached three-place HTML advances through genuine publication without replacing map/Home/route state.
 const fixture=structuredClone(manifest);fixture.editions.find(e=>e.id==='2026-W41-thu').status='draft';
 const {ctx,page,requests}=await context({saved:true,fixture,time:'2026-10-05T12:00:00-04:00'});
 await page.goto(base+'atlas/');await page.waitForFunction(()=>document.querySelectorAll('.reg-row').length===3&&document.querySelector('#map-state').dataset.state==='ready');
 check(await page.locator('.directory-note').innerText()==='3 published places · History retained','Monday Directory count');
 check(await page.locator('#place-eno-cox-mountain').getAttribute('data-status')==='withdrawn','Withdrawal lost');
 check(await page.locator('#place-occoneechee-mountain').count()===0,'Unpublished Tuesday leaked');
 await page.keyboard.press('Escape');
 await page.clock.setFixedTime(new Date('2026-10-06T07:00:00-04:00'));await resumed(page);await page.waitForFunction(()=>document.querySelectorAll('.reg-row').length===4);
 check(await page.locator('#place-occoneechee-mountain a.reg-latest').getAttribute('href')==='../edition/2026-W41-tue/','Tuesday edition link');
 check(await page.locator('#place-picker option[value="occoneechee-mountain"]').count()===1,'Picker missing Tuesday');
 check(await page.evaluate(()=>window.__publicationMap.markers.length)===4,'Map missing Tuesday');
 await page.selectOption('#place-picker','occoneechee-mountain');await page.locator('#drive-status').filter({hasText:'OSRM Estimate'}).waitFor();
 const before=requests.length;check(before===1,'Automatic Home routing');
 await page.clock.setFixedTime(new Date('2026-10-08T10:00:00-04:00'));await resumed(page);
 check(await page.locator('.reg-row').count()===4,'Delayed Thursday leaked');
 Object.assign(fixture.editions.find(e=>e.id==='2026-W41-thu'),{status:'published',published_at:'2026-10-08T10:03:00-04:00'});
 await page.clock.setFixedTime(new Date('2026-10-08T10:03:00-04:00'));await resumed(page);await page.waitForFunction(()=>document.querySelectorAll('.reg-row').length===5);
 check(await page.evaluate(()=>window.__publicationMap.markers.length)===5,'Map missing Thursday');
 check(await page.locator('#place-picker').inputValue()==='occoneechee-mountain','Selection reset during release');
 check(await page.evaluate(()=>window.__publicationMap.routes.length)>0,'Route removed during release');check(requests.length===before,'Refresh rerouted unnecessarily');
 await page.selectOption('#place-picker','raven-rock');await page.locator('#drive-status').filter({hasText:'Raven Rock'}).waitFor();await page.waitForFunction(()=>window.__publicationMap.selected==='raven-rock');
 check(requests.length===before+1,'New destination did not route');
 const newPlace={...fixture.editions.find(e=>e.id==='2026-W41-tue'),id:'2026-W42-tue',slot:'tuesday',status:'draft',place_id:'carolina-north-forest',title:'Publication fixture',place_roles:[{place_id:'carolina-north-forest',role:'flagship'}],weekend:{start:'2026-10-17',end:'2026-10-18'},published_at:'2026-10-13T07:15:00-04:00'};fixture.editions.push(newPlace);
 await page.clock.setFixedTime(new Date('2026-10-13T08:00:00-04:00'));await resumed(page);check(await page.locator('.reg-row').count()===5,'Draft planning place leaked');
 newPlace.status='published';await resumed(page);await page.waitForFunction(()=>document.querySelectorAll('.reg-row').length===6);
 check(await page.locator('#place-picker option[value="carolina-north-forest"]').count()===1,'Subsequent publication picker');
 check(await page.evaluate(()=>window.__publicationMap.markers.length)===6,'Subsequent publication markers');
 check(await page.locator('#place-carolina-north-forest a.reg-latest').getAttribute('href')==='../edition/2026-W42-tue/','Subsequent publication link');
 await page.unroute('**/data/editions/index.json*');await page.route('**/data/editions/index.json*',r=>r.abort());await resumed(page);check(await page.locator('.reg-row').count()===6,'Offline discarded validated history');
 await ctx.close();
 console.log('Directory counts/markers/picker, delayed and subsequent releases, Home route preservation PASS');
 // Full Edition Home success, absent/invalid/failure/clear/change/reload, responsive and standalone.
 for(const [width,height] of [[375,812],[393,852],[430,932],[852,393],[1024,768],[1440,1000]])for(const standalone of [false,true]){
  const c=await context({width,height,standalone,saved:true});await c.page.goto(base+'edition/2026-W41-tue/');await c.page.locator('.edition-drive').filter({hasText:'29 min'}).waitFor();
  check(/^29 min\s*from saved Home · 15.0 mi · OSRM estimate, traffic not included$/.test(await c.page.locator('.edition-drive').innerText()),'Personalized drive label');
  check(c.requests.length===1,'Home route duplicate initial request');await resumed(c.page);check(c.requests.length===1,'Fresh Home route duplicated on resume');
  await c.page.locator('.edition-drive').scrollIntoViewIfNeeded();evidence.layouts.push({width,height,standalone,...await geometry(c.page)});
  if(width===393&&!standalone)await c.page.screenshot({path:resolve(output,'edition-home-portrait.png')});
  await c.page.evaluate(()=>localStorage.removeItem('rupert-location-v1'));await resumed(c.page);await c.page.locator('.edition-drive').filter({hasText:'Chapel Hill reference estimate'}).waitFor();
  check(!(await c.page.locator('.edition-drive').innerText()).includes('saved Home'),'Cleared Home retained personalized value');
  c.state.fail=true;await c.page.evaluate(p=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:p})),home);await resumed(c.page);await c.page.locator('.edition-drive').filter({hasText:'Home routing unavailable'}).waitFor();
  check((await c.page.locator('.edition-drive').innerText()).includes('20–25 min'),'Failure lost reference estimate');
  c.state.fail=false;c.state.minutes=37;const other=places.places.find(p=>p.id==='hillsborough-riverwalk').access;
  await c.page.evaluate(p=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:{lat:p.lat,lng:p.lng}})),other);await resumed(c.page);await c.page.locator('.edition-drive').filter({hasText:'37 min'}).waitFor();
  await c.page.reload();await c.page.locator('.edition-drive').filter({hasText:'37 min'}).waitFor();check((await c.page.locator('.edition-drive').innerText()).includes('from saved Home'),'Reload lost Home');
  await c.page.goto(base+'edition/2026-W41-thu/');await c.page.locator('.edition-drive').filter({hasText:'37 min'}).waitFor();check((await c.page.locator('.ed-conditions').innerText()).includes('Sunday: showers and thunderstorms'),'Thursday current forecast');await geometry(c.page);
  await c.ctx.close();
 }
 {const c=await context();await c.page.goto(base+'edition/2026-W41-tue/');await c.page.waitForLoadState('networkidle');check(c.requests.length===0,'No Home made routing request');check((await c.page.locator('.edition-drive').innerText()).includes('Chapel Hill reference estimate'),'Absent Home missing fallback');await c.ctx.close();}
 // Manifest content revision updates the same edition's weather on foreground resume.
 {const fixture=structuredClone(manifest),c=await context({fixture});await c.page.goto(base+'edition/2026-W41-tue/');await c.page.waitForLoadState('networkidle');
 const ed=await json('data/editions/2026-W41-tue.json');ed.conditions.summary='Updated forecast fixture with its original issue timestamp.';fixture.revision='forecast-revision-fixture';
 await c.page.route('**/data/editions/2026-W41-tue.json*',r=>r.fulfill({json:ed}));await resumed(c.page);await c.page.locator('.ed-conditions').filter({hasText:'Updated forecast fixture'}).waitFor();check((await c.page.locator('.ed-conditions').innerText()).includes('Forecast snapshot · issued Thu 8 Oct'),'Forecast revision lost provenance');await c.ctx.close();}
 check(evidence.errors.length===0,'Browser errors '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} publication/directory/edition Home/browser assertions PASS.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
