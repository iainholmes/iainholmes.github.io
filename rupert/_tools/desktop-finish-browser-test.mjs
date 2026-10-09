// Focused desktop refinement checks against the last accepted mobile CSS.
// Native Chrome saved-address UI and physical Safari remain device checks.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const json=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const manifest=await json('data/editions/index.json'),places=await json('data/places.json');
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||resolve(root,'_tools/desktop-finish-evidence'));await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
const server=process.env.ATLAS_QA_URL?null:createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const baselineCommit='dd8f9ef32a85d0817b4905846392bad2a2a984de';
const baselineCSS=execFileSync('git',['show',`${baselineCommit}:rupert/assets/css/atlas.css`],{cwd:root,encoding:'utf8'});
const baselineMenus=execFileSync('git',['show',`${baselineCommit}:rupert/assets/js/core/menus.js`],{cwd:root,encoding:'utf8'});
const baselineAtlasView=execFileSync('git',['show',`${baselineCommit}:rupert/assets/js/atlas-view.js`],{cwd:root,encoding:'utf8'});
const proxyURL=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyURL?{server:proxyURL.origin,bypass:'127.0.0.1,localhost',...(proxyURL.username?{username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={base,checks:0,errors:[],layouts:[],physicalIOS:false,nativeAutofill:false,map:'test double; actual page and control handlers',routes:'OSRM fixtures using a public reference point'};
const check=(ok,message)=>{assert.ok(ok,message);evidence.checks++;};
const home=places.reference_points['chapel-hill-public'];
const fakeMap=`export async function createMap(){const callbacks={};window.__publicationMap={markers:[],routes:[],selected:null};return {setMarkers(features){window.__publicationMap.markers=features;},setRoutes(features){window.__publicationMap.routes=features;},on(event,fn){callbacks[event]=fn;},select(id){window.__publicationMap.selected=id;},resize(){},setHome(){},centerHome(){},setRelief(){},fit(){},focus(){},setTrafficMode(){},setTrafficIncidents(){},setTrafficAttribution(){}};}`;
async function context({width=393,height=852,standalone=false,saved=false,fixture=manifest,time='2026-10-08T18:00:00-04:00',baseline=false}={}){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage(),requests=[],state={fail:false,minutes:29};
 page.on('pageerror',e=>evidence.errors.push(e.message));await page.clock.install({time:new Date(time)});await page.clock.setFixedTime(new Date(time));
 if(saved)await page.addInitScript(p=>localStorage.setItem('rupert-location-v1',JSON.stringify({point:{lat:p.lat,lng:p.lng}})),home);
 if(standalone)await page.addInitScript(()=>{const m=matchMedia.bind(window);window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:m(q);});
 if(baseline){await page.route('**/assets/css/atlas.css*',r=>r.fulfill({contentType:'text/css',body:baselineCSS}));await page.route('**/assets/js/core/menus.js*',r=>r.fulfill({contentType:'text/javascript',body:baselineMenus}));await page.route('**/assets/js/atlas-view.js*',r=>r.fulfill({contentType:'text/javascript',body:baselineAtlasView}));}
 await page.route('**/data/editions/index.json*',r=>r.fulfill({json:fixture}));
 await page.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:fakeMap}));
 await page.route('https://router.project-osrm.org/**',r=>{requests.push(r.request().url());if(state.fail)return r.fulfill({status:503,body:'Unavailable'});const coordinates=new URL(r.request().url()).pathname.split('/').at(-1).split(';').map(p=>p.split(',').map(Number));return r.fulfill({json:{code:'Ok',routes:[{duration:state.minutes*60,distance:24140,geometry:{type:'LineString',coordinates}}]}});});
 return {ctx,page,requests,state};
}
async function geometry(page){
 const g=await page.evaluate(()=>{
  const rect=n=>n?Object.fromEntries(['x','y','width','height','bottom','right'].map(k=>[k,n.getBoundingClientRect()[k]])):null;
  const style=n=>n?Object.fromEntries(['display','fontSize','fontFamily','lineHeight','letterSpacing','paddingTop','paddingBottom','paddingRight','backgroundColor','color','borderTopWidth','borderBottomWidth'].map(k=>[k,getComputedStyle(n)[k]])):null;
  const ink=n=>{if(!n)return null;const range=document.createRange();range.selectNodeContents(n);return rect({getBoundingClientRect:()=>range.getBoundingClientRect()});};
  const dog=document.querySelector('.page-head .lab-outline');
  return {wordmark:rect(document.querySelector('.wordmark')),wordmarkStyle:style(document.querySelector('.wordmark')),wordmarkInk:ink(document.querySelector('.wordmark a')),mastWrap:rect(document.querySelector('.masthead .wrap')),mastWrapStyle:style(document.querySelector('.masthead .wrap')),dateline:rect(document.querySelector('.dateline')),primary:rect(document.querySelector('.primary')),bar:rect(document.querySelector('.bar')),dock:rect(document.querySelector('.dock')),head:rect(document.querySelector('.page-head')),headStyle:style(document.querySelector('.page-head')),h1:rect(document.querySelector('.page-head h1')),h1Style:style(document.querySelector('.page-head h1')),dog:rect(dog),dogStyle:style(dog),dogSVG:dog?.outerHTML,bannerCopy:rect(document.querySelector('.banner-copy')),archive:rect(document.querySelector('.week-archive a')),main:rect(document.querySelector('main')),plates:[...document.querySelectorAll('.plate')].map(rect),weekStyle:style(document.querySelector('.week')),logBodyStyle:style(document.querySelector('.field-log .log-actions')),overflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 // Optical offsets can move the unused font box past a divider while all letterforms remain clear.
 // Measure rendered ink for collision checks rather than treating font descenders as painted text.
 if(g.mastWrap.width>=1024){
  const png=await page.locator('.wordmark').screenshot();
  const box=JSON.parse(execFileSync('python',['-c',`import sys,io,json\nfrom PIL import Image,ImageChops\nim=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGB')\nm=[c.point([0]*181+[255]*75) for c in im.split()]\nprint(json.dumps(ImageChops.multiply(ImageChops.multiply(m[0],m[1]),m[2]).getbbox()))`],{input:png,encoding:'utf8'}));
  g.wordmarkPaint={top:g.wordmark.y+box[1],bottom:g.wordmark.y+box[3]};
 }
 return g;
}
async function visit(page,path){await page.goto(base+path);if(path==='log/')await page.locator('.field-log').waitFor();if(path==='travel/')await page.locator('#saved-trips p').waitFor();if(path==='atlas/')await page.waitForFunction(()=>window.__publicationMap?.markers.length>0);await page.evaluate(()=>document.fonts.ready);await page.clock.runFor(100);}
const near=(a,b,label)=>check(Math.abs(a-b)<.1,`${label}: ${a} != ${b}`);
try {
 const sizes=process.env.ATLAS_QA_QUICK?[[393,852],[852,393],[1440,900]]:[[375,812],[390,844],[393,852],[402,874],[430,932],[844,390],[852,393],[1024,768],[1280,800],[1440,900],[1512,900],[1600,1000],[1920,1080]];
 for(const [width,height] of sizes){
  const before=await context({width,height,baseline:true}),after=await context({width,height});
  for(const path of ['', 'atlas/', 'travel/', 'log/']){
   await visit(before.page,path);await visit(after.page,path);
   const b=await geometry(before.page),a=await geometry(after.page),label=`${path||'week'} ${width}x${height}`;
   check(!a.overflow,`${label} overflow`);
   check(a.wordmarkStyle.fontFamily===b.wordmarkStyle.fontFamily,`${label} masthead font changed`);
   check(Math.abs(parseFloat(a.wordmarkStyle.letterSpacing)/parseFloat(a.wordmarkStyle.fontSize)-parseFloat(b.wordmarkStyle.letterSpacing)/parseFloat(b.wordmarkStyle.fontSize))<.00001,`${label} masthead tracking in em changed`);
   if(width<1024){
    for(const k of ['wordmark','wordmarkStyle','dateline','primary','bar','dock'])check(JSON.stringify(a[k])===JSON.stringify(b[k]),`${label} approved mobile ${k} moved`);
    if(path!=='log/')for(const k of ['head','dog','h1',...(path?['plates','archive','main']:width>=760&&height>500?['plates','archive','main']:[])])check(JSON.stringify(a[k])===JSON.stringify(b[k]),`${label} approved mobile ${k} changed: ${JSON.stringify(b[k])} / ${JSON.stringify(a[k])}`);
    // The authorized phone preview change retains its surrounding layout and shortens both cards.
    if(!path&&(width<760||(width<1024&&height<=500))){check(a.plates.length===b.plates.length,'Phone edition slots changed');for(let i=0;i<a.plates.length;i++){near(a.plates[i].x,b.plates[i].x,'Phone preview left inset');near(a.plates[i].width,b.plates[i].width,'Phone preview width');check(b.plates[i].height===0?a.plates[i].height===0:a.plates[i].height<b.plates[i].height,'Phone preview not condensed');}check(a.archive.y<b.archive.y,'Archive not moved with shorter previews');}
   }else{
    check(a.wordmarkInk.y-b.wordmarkInk.y>=11,`${label} masthead not lower`);
    check(a.wordmarkInk.width>b.wordmarkInk.width&&a.wordmarkInk.width<b.wordmarkInk.width*1.04,`${label} enlargement not restrained`);
    const inset=parseFloat(a.mastWrapStyle.paddingRight);
    check(a.wordmarkInk.x>=a.mastWrap.x+inset+8&&a.wordmarkInk.right<=a.mastWrap.right-inset-8,`${label} masthead too tight`);
    check(a.dateline.bottom<a.wordmarkPaint.top&&a.wordmarkPaint.bottom<a.primary.y,`${label} masthead metadata/divider collision`);
    if(!path){const gap=a.main.bottom-a.archive.bottom;check(gap>=40&&gap<=60,`${label} archive cream inset ${gap}`);}
   }
   if(path){
    check(a.headStyle.backgroundColor==='rgb(38, 56, 76)',`${label} shared slate banner missing`);
    check(a.headStyle.borderTopWidth==='1px'&&a.headStyle.borderBottomWidth==='1px',`${label} banner rules missing`);
    check(a.h1Style.color==='rgb(243, 239, 229)',`${label} title not cream`);
    for(const k of ['fontSize','fontFamily','letterSpacing'])check(a.h1Style[k]===b.h1Style[k],`${label} title ${k} changed`);
    check(a.dogSVG===b.dogSVG&&a.dogStyle.color===b.dogStyle.color,`${label} dog artwork/color changed`);
    near(a.dog.width,b.dog.width,`${label} dog width`);near(a.dog.height,b.dog.height,`${label} dog height`);
    check(a.dog.x>a.h1.right&&a.dog.right<=a.head.right&&a.dog.bottom<=a.head.bottom,`${label} dog overlaps/clips`);
    if(width>=1024){near(a.dog.right,a.head.right-parseFloat(a.headStyle.paddingRight),`${label} dog right inset`);check(a.dog.right>b.dog.right+20,`${label} dog not farther right`);if(a.bannerCopy)check(a.bannerCopy.right<a.dog.x,`${label} note overlaps dog`);}
    if(path==='log/')check(JSON.stringify(a.logBodyStyle)===JSON.stringify(b.logBodyStyle),`${label} Field Log body recolored`);
   }
   evidence.layouts.push({width,height,path,...a});
   if(width===1440||width===393){await after.page.screenshot({path:resolve(output,`${path.replace('/','')||'week'}-${width}.png`)});if(!path){await after.page.locator('.week-archive').scrollIntoViewIfNeeded();await after.page.screenshot({path:resolve(output,`week-bottom-${width}.png`)});}}
  }
  await before.ctx.close();await after.ctx.close();console.log(`layout ${width}x${height} PASS`);
 }
 // Reproduce the native-popup boundary events without using private addresses.
 for(const baseline of [true,false]){
  const {ctx,page}=await context({width:1440,height:900,baseline});await visit(page,'atlas/');await page.locator('.location-settings > summary').click();await page.locator('#address-form input').click();
  check(await page.locator('#address-form input').evaluate(n=>document.activeElement===n),'Address input not mouse-focused');
  await page.locator('.location-settings').dispatchEvent('pointerleave',{pointerType:'mouse',relatedTarget:null});await page.mouse.move(5,5);await page.clock.runFor(250);
  check(await page.locator('.location-settings').evaluate(n=>n.open)===!baseline,baseline?'Original hover-close not reproduced':'Autofill pointer exit closed Home panel');
  if(!baseline){
   await page.locator('#address-form input').evaluate(n=>n.blur());await page.clock.runFor(250);check(await page.locator('.location-settings').evaluate(n=>n.open),'Autofill focus transfer closed panel');
   await page.route('https://nominatim.openstreetmap.org/**',r=>r.fulfill({json:[{lat:String(home.lat),lon:String(home.lng),display_name:'Chapel Hill public reference point'}]}));
   await page.locator('#address-form input').fill('Chapel Hill public reference point');await page.locator('#address-form button').click();await page.waitForFunction(()=>document.querySelector('#location-form input[name=lat]').value!=='');
   await page.locator('#location-form button').first().click();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('rupert-location-v1')));check(saved.point.lat===home.lat&&saved.point.lng===home.lng,'Locate/save Home failed');check(!JSON.stringify(saved).includes('address'),'Typed address persisted');
   await page.locator('#location-form input[name=lat]').press('Escape');check(!await page.locator('.location-settings').evaluate(n=>n.open),'Escape no longer closes Home');
   await page.locator('.reg-select[data-show="hillsborough-riverwalk"]').click();await page.locator('.dossier-provider').waitFor();check(await page.locator('.dossier-provider').innerText()==='OSRM Estimate · Traffic Not Included','Baseline routing changed');
   await page.evaluate(()=>scrollTo(0,0));
   await page.locator('.location-settings > summary').click();await page.locator('.location-settings > summary').click();check(!await page.locator('.location-settings').evaluate(n=>n.open),'Summary close failed');
   // Exercise delegated disclosure events explicitly; rapid fixture toggles otherwise coalesce.
   await page.evaluate(()=>{for(const selector of ['.location-settings','.frame-menu']){const n=document.querySelector(selector);n.open=true;n.dispatchEvent(new Event('toggle'));}});
   check(!await page.locator('.location-settings').evaluate(n=>n.open),'Other disclosure did not close Home');check(await page.locator('.frame-menu').evaluate(n=>n.open),'Opening another disclosure failed');
   await page.mouse.move(5,5);await page.locator('.frame-menu').dispatchEvent('pointerleave',{pointerType:'mouse',relatedTarget:null});await page.clock.runFor(250);check(!await page.locator('.frame-menu').evaluate(n=>n.open),'Hover dismissal of actual menu regressed');
  }
  await ctx.close();
 }
 // Regenerated desktop Details panels must escape the horizontal scroller and track their card.
 const ids=['hillsborough-riverwalk','occoneechee-mountain','raven-rock','umstead-company-mill','eno-cox-mountain'];
 for(const baseline of [true,false]){
  const {ctx,page}=await context({width:1440,height:900,baseline});await visit(page,'atlas/');
  for(const id of baseline?ids.slice(0,1):ids){
   const details=page.locator(`#place-${id} .reg-details`),summary=details.locator(':scope > summary'),popup=details.locator('.reg-dossier');await summary.scrollIntoViewIfNeeded();await summary.click();await page.clock.runFor(50);
   if(!baseline)await page.waitForFunction(id=>!!document.querySelector(`#place-${id} .reg-dossier`).style.left,id);
   const g=await popup.evaluate(n=>({ready:n.parentElement.dataset.menuReady,position:getComputedStyle(n).position,y:n.getBoundingClientRect().y,bottom:n.getBoundingClientRect().bottom,x:n.getBoundingClientRect().x,right:n.getBoundingClientRect().right,width:n.getBoundingClientRect().width,text:n.textContent}));
   if(baseline){check(!g.ready&&g.y>=900,'Original uninitialized/offscreen Details not reproduced');evidence.originalDetails=g;}
   else{
    check(g.ready==='true'&&g.position==='fixed',`${id} Details positioning uninitialized`);check(g.x>=19&&g.right<=1421&&g.y>=11&&g.bottom<=889,`${id} Details outside viewport: ${JSON.stringify(g)}`);check(g.text.includes('Start:')&&g.text.includes('Published recommendation')=== (id!=='eno-cox-mountain'),`${id} Details/history content missing`);
    check(await popup.evaluate(n=>{const b=n.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+20);return n.contains(hit);}),`${id} Details clipped behind directory`);
    await summary.press('Escape');check(!await details.evaluate(n=>n.open)&&await summary.evaluate(n=>document.activeElement===n),`${id} Escape/focus failed`);
   }
  }
  if(!baseline){
   // All five cards now fit at 1440px; exercise scroll behavior where scrolling is necessary.
   await page.setViewportSize({width:1024,height:900});await page.locator('.directory-list').evaluate(n=>n.scrollLeft=0);await page.clock.runFor(100);
   check(await page.locator('.directory-list').evaluate(n=>n.scrollWidth>n.clientWidth),'Scroll fixture has no overflow');
   const mouseDetails=page.locator('#place-hillsborough-riverwalk .reg-details');await mouseDetails.locator(':scope > summary').scrollIntoViewIfNeeded();await mouseDetails.locator(':scope > summary').click();await page.locator('.directory-list').evaluate(n=>n.scrollLeft+=25);await page.clock.runFor(50);await page.waitForFunction(()=>!document.querySelector('#place-hillsborough-riverwalk .reg-details').open);check(!await mouseDetails.evaluate(n=>n.open),'Mouse-open Details did not close on directory scroll');
   const details=page.locator('#place-eno-cox-mountain .reg-details'),summary=details.locator(':scope > summary');await summary.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await summary.press('Enter');await page.clock.runFor(50);check(await details.evaluate(n=>n.open),'Keyboard Details activation failed');
   await page.locator('.directory-list').evaluate(n=>n.scrollLeft-=25);await page.clock.runFor(50);check(await details.evaluate(n=>n.open),'Keyboard-focused Details unexpectedly closed on scroll');
   await page.setViewportSize({width:1280,height:800});await page.clock.runFor(100);const box=await details.locator('.reg-dossier').boundingBox();check(box.x>=19&&box.x+box.width<=1261&&box.y>=11&&box.y+box.height<=789,'Details resize escaped viewport');
   await page.setViewportSize({width:393,height:852});await page.clock.runFor(100);check(await details.locator('.reg-dossier').evaluate(n=>getComputedStyle(n).position==='static'&&!n.style.width),'Desktop sizing leaked into iPhone Details');check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'Details resize caused mobile overflow');
  }
  await ctx.close();
 }
 // Mobile keeps inline Details and deliberate dismissal, including withdrawn history.
 {const {ctx,page}=await context();await visit(page,'atlas/');await page.locator('.directory-catalog > summary').click();for(const id of ids){const details=page.locator(`#place-${id} .reg-details`);await details.locator(':scope > summary').click();check(await details.locator('.reg-dossier').evaluate(n=>getComputedStyle(n).position==='static'),'Mobile Details no longer inline');await page.locator('.directory-note').click();await page.clock.runFor(250);check(await details.evaluate(n=>n.open),'Mobile tap outside changed Details behavior');await details.locator(':scope > summary').click();}await ctx.close();}
 // Touch/PWA control and Field Log storage smoke test, using public test content only.
 for(const standalone of [false,true]){
  const {ctx,page}=await context({standalone,saved:true});await visit(page,'atlas/');await page.locator('.location-settings > summary').click();await page.locator('#address-form input').click();await page.locator('.location-settings').dispatchEvent('pointerleave',{pointerType:'touch',relatedTarget:null});await page.clock.runFor(250);check(await page.locator('.location-settings').evaluate(n=>n.open),'Touch/PWA Home panel closed');
  await page.locator('.location-settings > summary').click();await page.locator('#place-picker').selectOption('hillsborough-riverwalk');await page.locator('.dossier-provider').waitFor();check(await page.locator('.dossier-provider').innerText()==='OSRM Estimate · Traffic Not Included','Touch/PWA routing changed');
  await visit(page,'log/');await page.locator('#unplanned').click();await page.locator('#memory-form input[name=place]').fill('Public trail QA');await page.locator('#memory-form input[name=activity]').fill('Walking');await page.locator('#memory-form button').first().click();await page.locator('.memory-card').waitFor();
  const saved=await page.evaluate(()=>localStorage.getItem('rupert-field-log-v1'));check(!!saved,'Field Log memory not saved');const download=page.waitForEvent('download');await page.locator('#export-log').click();const backup=await download;check((await readFile(await backup.path(),'utf8')).includes('Public trail QA'),'Field Log export failed');await page.reload();await page.locator('.memory-card').waitFor();await page.locator('#import-log').setInputFiles({name:'public-qa.json',mimeType:'application/json',buffer:Buffer.from(saved)});await page.waitForFunction(()=>document.querySelector('#log-status').textContent.includes('Backup restored'));check(await page.locator('.memory-card').count()===1,'Field Log import duplicated memory');
  await ctx.close();
 }
 check(evidence.errors.length===0,`Page errors: ${evidence.errors.join('; ')}`);await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} focused desktop/mobile regression checks passed.`);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
