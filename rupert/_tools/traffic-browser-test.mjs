// Synthetic provider responses exercise the real MapLibre adapter. No live credential or Home is used.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright'),root=fileURLToPath(new URL('../',import.meta.url));
const output=process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/traffic-evidence');await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.woff2':'font/woff2'};
let server;if(!process.env.ATLAS_QA_URL){server=createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`,origin=new URL(base).origin;
const proxyUrl=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null,proxy=proxyUrl?{server:proxyUrl.origin,bypass:'127.0.0.1,localhost',...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const places=JSON.parse(await readFile(resolve(root,'data/places.json'))),home=places.reference_points['chapel-hill-public'];
const provider=await readFile(resolve(root,'assets/js/map/maplibre-provider.js'),'utf8');
const trafficProvider=process.env.ATLAS_QA_TRAFFIC_PROVIDER || 'tomtom',trafficName=trafficProvider==='tomtom'?'TomTom':'Mapbox';
const config=`export const trafficConfig={provider:${JSON.stringify(trafficProvider)},apiKey:'synthetic-browser-fixture-key',publicToken:'pk.browser.fixture',allowedOrigins:[${JSON.stringify(origin)}]};`;
const evidence={engine:await browser.version(),checks:0,layouts:[],errors:[],realProviderVerified:false,map:'real MapLibre/OpenFreeMap',responses:`synthetic ${trafficName}/OSRM`,physicalIOS:false};
const check=(v,m)=>{assert.ok(v,m);evidence.checks++;};
const sizes=process.env.ATLAS_QA_SIZES?process.env.ATLAS_QA_SIZES.split(',').map(s=>s.split('x').map(Number)):process.env.ATLAS_QA_QUICK?[[393,852],[852,393],[1440,1000]]:[[375,812],[390,844],[393,852],[402,874],[430,932],[844,390],[852,393],[1024,768],[1440,1000]];
function fixture(from,to){const coordinates=Array.from({length:9},(_,i)=>[from[0]+(to[0]-from[0])*i/8,from[1]+(to[1]-from[1])*i/8]);return {code:'Ok',routes:[{duration:2580,duration_typical:2160,distance:43612,geometry:{type:'LineString',coordinates},legs:[{annotation:{congestion_numeric:[0,12,45,65,85,null,0,0]},closures:[{geometry_index_start:6,geometry_index_end:7}],incidents:[{type:'construction',description:'Fixture road works on this route',geometry_index_start:2,geometry_index_end:3},{type:'road_closure',closed:true,description:'Fixture route closure',geometry_index_start:6,geometry_index_end:7}]}]}]};}
function tomtomFixture(from,to){const old=fixture(from,to),coordinates=old.routes[0].geometry.coordinates;return {routes:[{summary:{travelDurationInSeconds:2580,trafficDelayDurationInSeconds:420,lengthInMeters:43612},legs:[{path:{type:'LineString',coordinates}}],sections:{traffic:[{startPathIndex:1,endPathIndex:2,iconCategory:'roadWorks',delayMagnitude:'minor',delayDurationInSeconds:120},{startPathIndex:2,endPathIndex:3,iconCategory:'jam',delayMagnitude:'moderate'},{startPathIndex:3,endPathIndex:4,iconCategory:'jam',delayMagnitude:'major'},{startPathIndex:6,endPathIndex:7,iconCategory:'roadClosed',delayMagnitude:'undefined'}]}}]};}
async function context({width=393,height=852,standalone=false,saved=true,configured=true}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage();
 page.on('pageerror',e=>evidence.errors.push(e.message));await page.clock.install({time:new Date('2026-10-03T12:00:00-04:00')});
 if(saved)await page.addInitScript(p=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:{lat:p.lat,lng:p.lng}})),home);
 if(standalone)await page.addInitScript(()=>{const m=matchMedia;window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:m(q);});
 await page.route('**/assets/js/traffic-config.js*',r=>r.fulfill({contentType:'text/javascript',body:configured?config:'export const trafficConfig={provider:"mapbox",publicToken:"",allowedOrigins:[]};'}));
 await page.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:provider.replace('  return api;','  window.__trafficQaMap=api; return api;').replace('setRoutes(features) {', 'setRoutes(features) { window.__trafficQaFeatures=features;')}));
 const requests=[],state={failure:false,failureStatus:503,hold:null};
 await page.route('https://router.project-osrm.org/**',r=>{requests.push({provider:'OSRM',url:r.request().url()});const coordinates=new URL(r.request().url()).pathname.split('/').at(-1).split(';').map(p=>p.split(',').map(Number));return r.fulfill({json:{code:'Ok',routes:[{duration:2160,distance:43000,geometry:{type:'LineString',coordinates}}]}});});
 await page.route('https://api.mapbox.com/directions/**',async r=>{
  requests.push({provider:'Mapbox',url:r.request().url(),headers:await r.request().allHeaders()});
  if(state.hold)await state.hold;if(state.failure)return r.fulfill({status:state.failureStatus,body:'Unavailable'});
  const endpoints=new URL(r.request().url()).pathname.split('/').at(-1).split(';').map(p=>p.split(',').map(Number));return r.fulfill({json:fixture(...endpoints)});
 });
 await page.route('https://api.tomtom.com/maps/orbis/routing/routes/calculate',async r=>{
  const body=r.request().postDataJSON();requests.push({provider:'TomTom',url:r.request().url(),body,headers:await r.request().allHeaders()});
  if(state.hold)await state.hold;if(state.failure)return r.fulfill({status:state.failureStatus,body:'Unavailable'});
  return r.fulfill({json:tomtomFixture(body.routePlanningLocations.origin.coordinates,body.routePlanningLocations.destination.coordinates)});
 });
 await page.route('https://api.tomtom.com/maps/orbis/copyrights',async r=>{requests.push({provider:'TomTom credits',url:r.request().url(),headers:await r.request().allHeaders()});return r.fulfill({contentType:'text/plain',body:'© TomTom. Synthetic copyright fixture.\n© OpenStreetMap contributors.'});});
 await page.goto(base+'atlas/');try{await page.waitForFunction(()=>window.__trafficQaMap,{}, {timeout:45000});}catch(e){console.error('Map initialization failed',width,height,await page.locator('.atlas-map').innerText());throw e;}
 await page.evaluate(()=>document.fonts.ready);return {ctx,page,requests,state};
}
const select=async(page,id)=>{await page.locator('#place-picker').selectOption(id,{force:true});await page.locator('.dossier-provider').waitFor();};
const toggle=async(page,on)=>{await page.locator('#traffic-enabled').evaluate((n,v)=>{n.checked=v;n.dispatchEvent(new Event('change',{bubbles:true}));},on);await page.locator('.dossier-provider').waitFor();};
const read=page=>page.evaluate(()=>{const api=window.__trafficQaMap,m=api.raw;const r=n=>{const b=n.getBoundingClientRect();return {y:b.y,bottom:b.bottom,right:b.right,height:b.height};};return {theme:api.diagnostics().theme,bg:m.getPaintProperty('bg','background-color'),routes:(window.__trafficQaFeatures || []).map(f=>f.properties.traffic || 'baseline'),line:m.getPaintProperty('route-line','line-color'),home:!!document.querySelector('.home-marker'),incidents:document.querySelectorAll('.traffic-incident').length,selected:m.getFilter('marks-sel'),zoom:m.getZoom(),center:m.getCenter().toArray(),relief:m.getLayoutProperty('relief','visibility'),overflow:document.documentElement.scrollWidth>innerWidth,map:r(document.querySelector('.atlas-map')),route:r(document.querySelector('#drive-status')),cardBackground:getComputedStyle(document.querySelector('#map-card')).backgroundColor,card:document.querySelector('#map-card').hidden?null:r(document.querySelector('#map-card')),outsideBackground:getComputedStyle(document.body).backgroundColor,controls:getComputedStyle(document.querySelector('#recenter')).backgroundColor,attribution:getComputedStyle(document.querySelector('.maplibregl-ctrl-attrib')).backgroundColor};});
try{
 for(const [width,height] of sizes){
  const {ctx,page,requests}=await context({width,height,standalone:width===393});
  await select(page,'hillsborough-riverwalk');const off=await read(page);
  check(off.theme==='light'&&off.bg==='#E6EAE1','Traffic off changed map');check(off.routes.join()==='baseline','OSRM baseline absent');
  check(await page.locator('.dossier-provider').innerText()==='OSRM Estimate · Traffic Not Included','Baseline claim wrong');check(!await page.locator('#traffic-enabled').isDisabled(),'Configured traffic disabled');
  check(requests.every(v=>v.provider==='OSRM'),'Provider contacted before traffic opt-in');
  await page.locator('.route-navigation').evaluate(n=>n.open=true);
  check(await page.locator('.navigation-choices a').count()===3,'Navigation choices absent');
  check(await page.locator('.navigation-choices a').first().getAttribute('href').then(s=>new URL(s).searchParams.get('saddr')===`${home.lat},${home.lng}`),'Navigation did not use saved Home coordinates');
  check(await page.locator('.navigation-choices a').nth(2).innerText().then(s=>s.includes('current location')),'Waze origin misrepresented');
  check(await page.locator('.navigation-choices a').evaluateAll(ns=>ns.every(n=>n.getBoundingClientRect().height>=44)),'Navigation touch targets too small');
  await page.locator('.route-navigation').evaluate(n=>n.open=false);
  await toggle(page,true);
  await page.waitForFunction(()=>window.__trafficQaMap.raw.queryRenderedFeatures({layers:['route-line','route-unknown','route-closure']}).some(f=>f.properties.traffic));
  const on=await read(page);
  check(on.theme==='traffic'&&on.bg==='#1D2A3A','Traffic mode not dark');check(on.outsideBackground===off.outsideBackground,'Traffic changed whole page');
  check(on.routes.join()===(trafficProvider==='tomtom'?'unknown,mild,moderate,heavy,unknown,closure,unknown':'normal,mild,moderate,heavy,severe,unknown,closure,normal'),'Route annotations lost');
  check(await page.locator('.dossier-provider').innerText()===(trafficProvider==='tomtom'?'Live Traffic · TomTom · +7 min vs free flow':'Live Traffic · +7 min vs typical'),'Provider ETA/delay incorrect');
  check(await page.locator('.dossier-values').innerText().then(s=>s.includes('43 min')&&s.includes('27.1 mi')),'Traffic ETA not used');
  check(on.home&&on.incidents===(trafficProvider==='tomtom'?4:2),'Home/route incident markers absent');check(on.controls==='rgb(35, 51, 70)'&&on.attribution==='rgb(35, 51, 70)','Dark controls/credits unreadable '+JSON.stringify(on));
  check(on.relief===off.relief&&JSON.stringify(on.center)===JSON.stringify(off.center)&&on.zoom===off.zoom,'Theme toggle moved camera or Relief');
  check(on.line.includes('#DEA953')&&on.line.includes('#D47742')&&on.line.includes('#C36360'),'Congestion palette missing');check(!on.overflow,'Horizontal overflow');
  const req=requests.find(v=>v.provider===trafficName);check(req.headers.referer===origin+'/','Token restriction must send origin-only Referer');check(!req.url.includes('address')&&!req.url.includes('waypoint_names'),'Address sent to traffic provider');
  if(trafficProvider==='tomtom'){
   check(req.headers['tomtom-api-version']==='3'&&req.headers.attributes==='routes.summary,routes.legs.path,routes.sections.traffic','Orbis v3 request headers wrong');
   check(req.body.traffic==='live'&&!JSON.stringify(req.body).includes('address'),'Non-live request or textual address disclosure');
   check(!req.url.includes('key')&&req.headers['tomtom-api-key']==='synthetic-browser-fixture-key','Browser key unnecessarily in URL');
   check(await page.locator('.traffic-credits').textContent().then(s=>s.includes('TomTom')),'Provider copyright missing');
   check(requests.filter(v=>v.provider==='TomTom credits').length===1,'Unnecessary attribution/provider requests');
  }
  await page.evaluate(()=>window.__trafficQaMap.focus('hillsborough-riverwalk'));await page.clock.runFor(100);
  if(width<760){await page.waitForFunction(()=>{const m=window.__trafficQaMap.raw,p=m.project(JSON.parse(document.querySelector('#atlas-data').textContent).features.find(f=>f.properties.id==='hillsborough-riverwalk').geometry.coordinates);return m.queryRenderedFeatures([[p.x-22,p.y-22],[p.x+22,p.y+22]],{layers:['marks']}).some(f=>f.properties.id==='hillsborough-riverwalk');});await page.evaluate(()=>{const m=window.__trafficQaMap.raw,event=new MouseEvent('click');Object.defineProperty(event,'target',{value:m.getCanvas()});m.fire('click',{originalEvent:event,point:m.project(JSON.parse(document.querySelector('#atlas-data').textContent).features.find(f=>f.properties.id==='hillsborough-riverwalk').geometry.coordinates)});});await page.locator('.dossier-provider').waitFor();const g=await read(page);check(g.card&&g.card.y>=g.route.bottom+8,'Traffic/place cards overlap');check(g.cardBackground==='rgb(35, 51, 70)','Dark popup contrast');check(g.card.bottom<=g.map.bottom-10,'Traffic place card clipped');check(await page.locator('.mc-place-detail').textContent()==='Orange County','County regressed');}
  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,scrollY+document.querySelector('.atlas-map').getBoundingClientRect().top-10);});await page.clock.runFor(100);
  const navigationGeometry=await page.evaluate(()=>({mapBottom:document.querySelector('.atlas-map').getBoundingClientRect().bottom,navigationTop:document.querySelector('.route-navigation').getBoundingClientRect().top}));
  check(navigationGeometry.navigationTop>=navigationGeometry.mapBottom,'Sticky map covers navigation handoff '+JSON.stringify(navigationGeometry));
  if([375,393,852,1440].includes(width))await page.screenshot({path:resolve(output,`traffic-${width}x${height}.png`)});
  await page.locator('.traffic-incident').first().evaluate(n=>n.click());check(await page.locator('.traffic-incident-popup').innerText().then(s=>s.includes(trafficProvider==='tomtom'?'Road works':'Fixture road works')),'Incident description unavailable');
  await page.locator('.traffic-incident-popup .maplibregl-popup-close-button').click();
  if(width===375){
   await select(page,'eno-cox-mountain');await page.evaluate(()=>window.__trafficQaMap.focus('eno-cox-mountain'));
   await page.waitForFunction(()=>{const m=window.__trafficQaMap.raw,p=m.project(JSON.parse(document.querySelector('#atlas-data').textContent).features.find(f=>f.properties.id==='eno-cox-mountain').geometry.coordinates);return m.queryRenderedFeatures([[p.x-22,p.y-22],[p.x+22,p.y+22]],{layers:['marks']}).some(f=>f.properties.id==='eno-cox-mountain');});
   await page.evaluate(()=>{const m=window.__trafficQaMap.raw,event=new MouseEvent('click');Object.defineProperty(event,'target',{value:m.getCanvas()});m.fire('click',{originalEvent:event,point:m.project(JSON.parse(document.querySelector('#atlas-data').textContent).features.find(f=>f.properties.id==='eno-cox-mountain').geometry.coordinates)});});await page.locator('.dossier-provider').waitFor();
   const g=await read(page);check(g.card.y>=g.route.bottom+8&&g.card.bottom<=g.map.bottom-10,'Multi-line traffic popup overlaps or clips');
   check(await page.locator('.mc-name').evaluate(n=>n.getBoundingClientRect().right<=document.querySelector('.mc-close').getBoundingClientRect().left),'Multi-line name crowds Close');
  }
  await toggle(page,false);const back=await read(page);check(back.bg===off.bg&&back.theme==='light'&&back.routes.join()==='baseline'&&back.incidents===0,'Toggle off did not restore baseline');
  check(await page.locator('.traffic-attribution').count()===0,'Traffic attribution remained on baseline');
  evidence.layouts.push({width,height,standalone:width===393,off,on,back});await ctx.close();console.log(`traffic ${width}x${height} PASS`);
 }
 // State changes, stale estimates, retries and a late aborted provider response.
 {
  const {ctx,page,requests,state}=await context();await select(page,'hillsborough-riverwalk');await toggle(page,true);
  await select(page,'eno-cox-mountain');check((await read(page)).theme==='traffic','Destination replacement lost traffic');
  check(requests.filter(v=>v.provider===trafficName).length===2,'New destination did not request traffic');
  await page.locator('.location-settings').evaluate(n=>n.open=true);await page.locator('#location-form input[name=lat]').fill(String(home.lat+.01));await page.locator('#location-form input[name=lng]').fill(String(home.lng));await page.locator('#location-form').evaluate(n=>n.requestSubmit());await page.locator('.dossier-provider').waitFor();
  check(requests.filter(v=>v.provider===trafficName).length===3,'Home change did not replace traffic');
  check(requests.filter(v=>v.provider===trafficName).at(-1)[trafficProvider==='tomtom'?'body':'url'] && (trafficProvider==='tomtom'?requests.filter(v=>v.provider===trafficName).at(-1).body.routePlanningLocations.origin.coordinates[1]===home.lat+.01:requests.at(-1).url.includes(String(home.lat+.01))),'Old Home was sent');
  await page.clock.fastForward(300001);check((await read(page)).theme==='light','Stale estimate retained dark live treatment');
  check(requests.filter(v=>v.provider===trafficName).length===3,'Traffic polled without user action');
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.locator('.dossier-provider').waitFor();check((await read(page)).theme==='traffic'&&requests.filter(v=>v.provider===trafficName).length===4,'Foreground failed to refresh stale route');
  state.failure=true;await page.locator('.traffic-refresh').evaluate(n=>n.click());await page.locator('.traffic-fallback').waitFor();
  check((await read(page)).theme==='light','Failure trapped user in dark map');check(await page.locator('.traffic-fallback').innerText().then(s=>s.includes('Live traffic temporarily unavailable · showing baseline estimate')),'Failure status missing');
  check(await page.locator('.dossier-provider').innerText()==='OSRM Estimate · Traffic Not Included','Fallback falsely claimed traffic');check(!await page.locator('#traffic-enabled').isChecked(),'Failed toggle remained on');
  state.failureStatus=429;await page.locator('.traffic-refresh').evaluate(n=>n.click());await page.locator('.traffic-fallback').waitFor();
  check((await read(page)).theme==='light'&&!await page.locator('#traffic-enabled').isChecked(),'Free allowance/rate limit did not fall back');
  const limited=requests.filter(v=>v.provider===trafficName).length;await page.clock.fastForward(300001);await page.evaluate(()=>window.dispatchEvent(new Event('focus')));check(requests.filter(v=>v.provider===trafficName).length===limited,'429 automatically retried');
  state.failure=false;await page.locator('.traffic-refresh').evaluate(n=>n.click());await page.locator('.traffic-attribution').waitFor();check((await read(page)).theme==='traffic','Retry did not recover');
  let release;state.hold=new Promise(r=>release=r);await page.locator('.traffic-refresh').evaluate(n=>n.click());await page.waitForFunction(()=>document.querySelector('.dossier-message')?.textContent.includes('Checking traffic'));
  await toggle(page,false);release();state.hold=null;await page.clock.runFor(100);check((await read(page)).theme==='light','Late provider reply re-enabled traffic');
  await page.locator('#forget-location').evaluate(n=>n.click());check(await page.locator('.route-navigation').isHidden(),'Forget Home left navigation coordinates');const before=requests.length;await page.locator('#traffic-enabled').evaluate(n=>{n.checked=true;n.dispatchEvent(new Event('change'));});await page.locator('#place-picker').selectOption('eno-cox-mountain',{force:true});await page.clock.runFor(100);check(requests.length===before,'Home absent sent coordinates');check(!(await read(page)).home&&(await read(page)).routes.length===0,'Forget Home left route/origin');
  await ctx.close();
 }
 // Reload/standalone always starts OFF. No implicit consent or persistent provider result cache.
 {
  const {ctx,page,requests}=await context({standalone:true});await select(page,'hillsborough-riverwalk');await toggle(page,true);const count=requests.filter(v=>v.provider===trafficName).length;
  await page.reload();await page.waitForFunction(()=>window.__trafficQaMap);check(!await page.locator('#traffic-enabled').isChecked()&&(await read(page)).theme==='light','Reload/PWA forced traffic');check(requests.filter(v=>v.provider===trafficName).length===count,'Reload sent Home to traffic provider');
  check(await page.evaluate(()=>!Object.keys(localStorage).some(k=>/traffic/i.test(k))),'Provider data saved locally');await ctx.close();
 }
 {const {ctx,page,requests}=await context({configured:false});check(await page.locator('#traffic-enabled').isDisabled(),'No credential pretends traffic works');await select(page,'hillsborough-riverwalk');check(requests.every(v=>v.provider==='OSRM'),'Unconfigured traffic made API request');await ctx.close();}
 check(evidence.errors.length===0,'Browser errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} traffic browser assertions PASS; live account verification remains pending.`);
}finally{await browser.close();server?.close();}
