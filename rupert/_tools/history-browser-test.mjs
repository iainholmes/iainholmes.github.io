// Real page/Field Log handlers and MapLibre, synthetic local memories only. No private Home/provider key.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=process.env.ATLAS_QA_OUTPUT_DIR||'/tmp/atlas-history-evidence';await mkdir(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=process.env.ATLAS_QA_URL?null:createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});
if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const u=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null,proxy=u?{server:u.origin,bypass:'127.0.0.1,localhost',...(u.username?{username:decodeURIComponent(u.username),password:decodeURIComponent(u.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const provider=await readFile(resolve(root,'assets/js/map/maplibre-provider.js'),'utf8'),manifest=JSON.parse(await readFile(resolve(root,'data/editions/index.json')));
const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jlbkAAAAASUVORK5CYII=';
const original={id:'fl_occoneechee_legacy',date:'2026-09-20',source:'planned',edition:'2026-W41-tue',place:'Occoneechee Mountain and the quarry overlook',activity:'Earlier short walk',notes:'Private fixture memory stays local.',experience:'ridge',tags:'fixture',photos:[photo]};
const cox={id:'fl_cox_visit',date:'2026-09-20',source:'unplanned',place:'Cox Mountain',activity:'Earlier visit',place_id:'eno-cox-mountain',history_kind:'visit',photos:[]};
const evidence={checks:0,layouts:[],errors:[],engine:await browser.version(),physicalIOS:false,realMap:true,realProvider:false};
const check=(v,m)=>{assert.ok(v,m);evidence.checks++;};
async function context(width,height){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});
 await ctx.addInitScript(()=>{if(innerWidth===393){const m=matchMedia;window.matchMedia=q=>q==='(display-mode: standalone)'?{matches:true,media:q,addEventListener(){},removeEventListener(){}}:m(q);}});
 await ctx.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:provider.replace('  return api;','  window.__historyMap=api; return api;').replace('setMarkers(features) {','setMarkers(features) { window.__historyFeatures=features;')}));
 const requests=[];ctx.on('request',r=>{requests.push({url:r.url(),body:r.postData()||''});});
 ctx.on('page',p=>p.on('pageerror',e=>evidence.errors.push(e.message)));const page=await ctx.newPage();await page.clock.install({time:new Date('2026-10-10T12:00:00-04:00')});
 return {ctx,page,requests};
}
async function visit(page,path){await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);await page.clock.runFor(100);}
async function stored(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('rupert-field-log-v1')));}
async function save(page){await page.locator('#memory-form').getByRole('button',{name:'Save memory',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#log-status').textContent.includes('Memory saved'));}
async function localChange(page,entries){await page.evaluate(entries=>{localStorage.setItem('rupert-field-log-v1',JSON.stringify({version:2,entries}));window.dispatchEvent(new Event('rupert-history-changed'));},entries);}
async function geometry(page,width){
 const g=await page.evaluate(()=>{const rows=[...document.querySelectorAll('.reg-row')],list=document.querySelector('.directory-list'),r=list.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,rows:rows.map(n=>({height:n.getBoundingClientRect().height,width:n.getBoundingClientRect().width})),visible:rows.filter(n=>{const b=n.getBoundingClientRect();return b.x>=r.x-1&&b.right<=r.right+1;}).length};});
 check(!g.overflow,'Atlas overflow at '+width);if(width>=1440)check(g.visible===5,'Visited indicators disrupted five-card Directory');return g;
}
try{
 const sizes=process.env.ATLAS_QA_SIZES?process.env.ATLAS_QA_SIZES.split(',').map(s=>s.split('x').map(Number)):[[375,812],[390,844],[393,852],[402,874],[430,932],[852,393],[1024,768],[1280,800],[1440,1000],[1512,982]];
 for(const [width,height] of sizes){
  const {ctx,page,requests}=await context(width,height);await visit(page,'atlas/');await page.waitForFunction(()=>window.__historyFeatures?.length===5);
  await page.locator('.directory-catalog').evaluate(n=>n.open=true);
  const before=await geometry(page,width);check(await page.locator('.history-check').count()===0,'Empty history invented visits');
  check(await page.evaluate(()=>window.__historyFeatures.filter(f=>f.properties.marker_status==='recommended').length)===4,'Unvisited markers changed');
  await localChange(page,[original,cox]);await page.waitForFunction(()=>document.querySelectorAll('.history-check').length===2);
  const after=await geometry(page,width);check(JSON.stringify(before.rows)===JSON.stringify(after.rows),'Visit indicators changed Directory card geometry: '+JSON.stringify({before,after}));
  const features=await page.evaluate(()=>window.__historyFeatures.map(f=>f.properties));
  check(features.find(f=>f.id==='occoneechee-mountain').marker_status==='walked'&&features.find(f=>f.id==='occoneechee-mountain').status==='recommended','Visit lost recommendation state');
  check(features.find(f=>f.id==='eno-cox-mountain').marker_status==='withdrawn'&&features.find(f=>f.id==='eno-cox-mountain').visited,'Visited withdrawal warning lost');
  check(await page.locator('#place-eno-cox-mountain .mk-withdrawn').count()===1,'Withdrawn Directory warning lost');
  check(await page.locator('#place-occoneechee-mountain .reg-word').textContent()==='Recommended✓','Directory status misleading');
  check(await page.locator('#place-occoneechee-mountain .reg-latest').getAttribute('href')==='../edition/2026-W41-tue/','Edition destination changed');
  check(await page.locator('.atlas-label-layer span').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).fontWeight==='700')),'Accepted map-label typography regressed');
  const bytes=await page.evaluate(()=>localStorage.getItem('rupert-field-log-v1'));
  await page.locator('#place-picker').selectOption('occoneechee-mountain',{force:true});await page.clock.runFor(100);
  check(await page.locator('#place-occoneechee-mountain').evaluate(n=>n.classList.contains('is-selected')),'Visited place selection failed');
  check(await page.locator('.map-legend').innerText().then(s=>s.includes('Visited')&&s.includes('Withdrawn')),'Independent marker meanings missing');
  if([393,1440].includes(width))await page.locator('.atlas-register').screenshot({path:resolve(output,`directory-${width}.png`)});
  if([393,852,1440].includes(width)){
   await page.evaluate(()=>{window.__historyMap.focus('occoneechee-mountain');window.__historyMap.raw.panBy([80,0],{duration:0});});await page.clock.runFor(100);
   await page.locator('.atlas-map').screenshot({path:resolve(output,`map-${width}.png`)});
  }
  await visit(page,'log/');await page.locator('.memory-card').first().waitFor();await page.waitForFunction(()=>!document.querySelector('[name=place_id]').disabled);
  check(await page.evaluate(()=>localStorage.getItem('rupert-field-log-v1'))===bytes,'Opening/migrating history wrote private storage');
  check(await page.locator('#memory-fl_occoneechee_legacy .memory-history').innerText().then(s=>s.includes('completion not classified')),'Legacy completion was guessed');
  check(await page.locator('.memory-photos img').getAttribute('src')===photo,'Legacy photograph replaced');
  await page.locator('[data-edit=fl_occoneechee_legacy]').click();
  check(await page.locator('[name=place_id]').inputValue()==='occoneechee-mountain','Unambiguous old place not resolved');
  check(await page.locator('[name=history_kind]').inputValue()==='unclassified','Legacy classified without consent');
  check(await page.locator('[name=activity]').inputValue()===original.activity&&await page.locator('[name=notes]').inputValue()===original.notes,'Original memory text changed');
  await page.locator('[name=history_kind]').selectOption('visit');await save(page);
  const saved=await stored(page),old=saved.entries.find(e=>e.id===original.id);
  check(saved.version===2&&old.place_id==='occoneechee-mountain'&&!old.experience_id&&old.history_kind==='visit','Visit classification not saved');
  for(const key of ['id','date','place','activity','notes','photos','edition','experience','tags'])check(JSON.stringify(old[key])===JSON.stringify(original[key]),'Historical field changed: '+key);
  if([393,1440].includes(width))await page.locator('.memory-card').first().screenshot({path:resolve(output,`memory-${width}.png`)});
  await visit(page,'archive/');await page.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='visited');
  check(await page.locator('[data-edition="2026-W41-tue"] .personal-history').innerText()==='Place visited · outing not completed','Archive conflated place/outing');
  check(await page.locator('[data-edition="2026-W40-tue"]').getAttribute('class').then(s=>s.includes('is-withdrawn')),'Archive withdrawal changed');
  check(await page.locator('[data-edition="2026-W41-thu"] .personal-history').count()===0,'Unvisited edition marked');
  if([393,1440].includes(width))await page.locator('.archive-index').screenshot({path:resolve(output,`archive-${width}.png`)});
  await visit(page,'edition/2026-W41-tue/');await page.locator('.edition-history').waitFor();
  check(await page.locator('.edition-history .personal-history').innerText()==='Place visited · outing not completed','Full Edition visit state wrong');
  check(await page.locator('.history-actions a').getAttribute('href')==='../../log/#memory-fl_occoneechee_legacy','Correction does not reach original record');
  check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'Full Edition history overflow');
  if([393,1440].includes(width)){await page.locator('.edition-history').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,`edition-${width}.png`)});}
  if(width===393){
   // Exact completion, correction, cross-tab updates, private exports and backup revision/deletion transfer.
   const atlas=await ctx.newPage();await atlas.clock.install({time:new Date('2026-10-10T12:00:00-04:00')});await visit(atlas,'atlas/');await atlas.waitForFunction(()=>window.__historyFeatures?.length===5);
   const archive=await ctx.newPage();await archive.clock.install({time:new Date('2026-10-10T12:00:00-04:00')});await visit(archive,'archive/');await archive.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='visited');
   await page.getByRole('button',{name:'Mark as Completed',exact:true}).click();await page.waitForURL('**/log/');await page.waitForFunction(()=>!document.querySelector('[name=place_id]').disabled);
   check(await page.locator('[name=history_kind]').inputValue()==='completed'&&await page.locator('[name=completion_ref]').inputValue()==='edition:2026-W41-tue','Full Edition did not supply stable completion identity');
   await save(page);const entries=(await stored(page)).entries,done=entries.find(e=>e.id!==original.id&&e.id!==cox.id);
   check(done.edition==='2026-W41-tue'&&done.experience_id==='occoneechee-mountain-loop'&&done.history_kind==='completed','Specific completion not linked');
   await archive.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='completed');
   check(await archive.locator('[data-edition="2026-W41-thu"] .personal-history').count()===0,'Completion spread to another edition');
   const full=await ctx.newPage();await full.clock.install({time:new Date('2026-10-10T12:00:00-04:00')});await visit(full,'edition/2026-W41-tue/');await full.locator('.edition-history[data-history=completed]').waitFor();
   check(await full.getByRole('link',{name:'Edit memory',exact:true}).getAttribute('href').then(s=>s.endsWith('#memory-'+done.id)),'Completed edition cannot be corrected');
   const download=page.waitForEvent('download');await page.locator('#export-log').click();const backup=JSON.parse(await readFile(await (await download).path(),'utf8'));
   check(backup.version===2&&backup.entries.length===3&&backup.entries.find(e=>e.id===original.id).photos[0]===photo,'Full backup lost history/photo');
   const minimalDownload=page.waitForEvent('download');await page.locator('#export-history').click();const minimal=JSON.parse(await readFile(await (await minimalDownload).path(),'utf8'));
   check(minimal.type==='rupert-recommendation-history'&&minimal.records.some(e=>e.edition==='2026-W41-tue'),'Minimal opt-in history missing completion');
   for(const forbidden of [original.notes,original.activity,photo,'fl_occoneechee_legacy','rupert-location','address'])check(!JSON.stringify(minimal).includes(forbidden),'Private information in minimal export');
   await page.locator(`[data-edit="${done.id}"]`).click();await page.locator('[name=history_kind]').selectOption('visit');await save(page);
   await archive.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='visited');await full.locator('.edition-history[data-history=visited]').waitFor();
   check(await full.getByRole('button',{name:'Mark as Completed',exact:true}).isVisible(),'Correction did not restore completion action');
   const revised=(await stored(page)).entries;
   await page.locator('#import-log').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.locator('#log-import-review').waitFor();
   check((await stored(page)).entries.find(e=>e.id===done.id).history_kind==='visit','Import silently overwrote a correction');
   await page.locator('#merge-revisions').click();await archive.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='completed');
   check((await stored(page)).entries.length===3,'Revision transfer duplicated memory');
   await page.locator('#import-log').setInputFiles({name:'revised.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,entries:revised}))});await page.locator('#restore-log').click();await archive.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='visited');
   await ctx.route('**/data/editions/index.json*',r=>r.abort());await ctx.route('**/data/places.json*',r=>r.abort());
   for(const id of [original.id,done.id]){await page.locator(`[data-delete="${id}"]`).click();await page.locator(`[data-confirm-delete="${id}"]`).click();}
   await atlas.waitForFunction(()=>window.__historyFeatures.find(f=>f.properties.id==='occoneechee-mountain').properties.marker_status==='recommended');
   await archive.waitForFunction(()=>document.querySelector('[data-edition="2026-W41-tue"]').dataset.history==='uncompleted');
   check(await archive.locator('[data-edition="2026-W41-tue"] .personal-history').count()===0,'Deleted visit left stale Archive indicator');
   check((await stored(page)).entries.length===1&&(await stored(page)).entries[0].id===cox.id,'Delete removed unrelated memory');
   await ctx.unroute('**/data/editions/index.json*');await ctx.unroute('**/data/places.json*');
   // Whole-backup restore transfers deletions too, with an explicit user action.
   await page.locator('#import-log').setInputFiles({name:'empty.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,entries:[]}))});await page.locator('#restore-log').click();
   await atlas.waitForFunction(()=>document.querySelectorAll('.history-check').length===0);check((await stored(page)).entries.length===0,'Whole-backup restore did not transfer deletions');
   check(await atlas.locator('#place-eno-cox-mountain .mk-withdrawn').count()===1,'Removal of history removed withdrawal warning');
   await localChange(page,[{...original,edition:'',place:'Ambiguous old name'}]);await page.reload();await page.locator('[data-edit=fl_occoneechee_legacy]').click();await page.waitForFunction(()=>!document.querySelector('[name=place_id]').disabled);
   check(await page.locator('[name=place_id]').inputValue()==='','Ambiguous place was guessed');await page.locator('[name=place_id]').selectOption('occoneechee-mountain');await page.locator('[name=history_kind]').selectOption('visit');await save(page);
   await atlas.waitForFunction(()=>document.querySelector('#place-occoneechee-mountain .history-check'));
   await page.reload();await page.locator('.memory-card').waitFor();check((await stored(page)).entries[0].place_id==='occoneechee-mountain','Reload/PWA lost manual association');
   await page.locator('[data-edit=fl_occoneechee_legacy]').click();await page.locator('[name=notes]').fill('An edit in progress');
   const concurrent={...cox,id:'fl_concurrent',notes:'A separate memory saved in another tab'};
   const latest=(await stored(page)).entries;await atlas.evaluate(entries=>localStorage.setItem('rupert-field-log-v1',JSON.stringify({version:2,entries})),[...latest,concurrent]);
   await save(page);check((await stored(page)).entries.some(e=>e.id===concurrent.id),'Saving an open editor lost a concurrent new memory');
   await page.locator('[data-edit=fl_occoneechee_legacy]').click();await page.locator('[name=notes]').fill('Older in-progress edit');
   const newer=(await stored(page)).entries.map(e=>e.id===original.id?{...e,notes:'Newer correction in another tab'}:e);
   await atlas.evaluate(entries=>localStorage.setItem('rupert-field-log-v1',JSON.stringify({version:2,entries})),newer);
   await page.locator('#memory-form').getByRole('button',{name:'Save memory',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('#log-status').textContent.includes('changed in another tab'));
   check((await stored(page)).entries.find(e=>e.id===original.id).notes==='Newer correction in another tab','Open editor overwrote a newer correction');
   await page.locator('#cancel-memory').click();await page.reload();await page.locator('.memory-card').first().waitFor();
   await page.locator('[data-edit=fl_occoneechee_legacy]').click();await page.locator('[name=place_id]').selectOption('');await save(page);
   await atlas.waitForFunction(()=>window.__historyFeatures.find(f=>f.properties.id==='occoneechee-mountain').properties.marker_status==='recommended');
   await page.reload();await page.locator('[data-edit=fl_occoneechee_legacy]').click();await page.waitForFunction(()=>!document.querySelector('[name=place_id]').disabled);
   check(await page.locator('[name=place_id]').inputValue()==='','A deliberately removed association was inferred again');await page.locator('#cancel-memory').click();
   await ctx.clearCookies();await localChange(page,[]);await page.evaluate(()=>localStorage.setItem('rupert-field-log-v1','damaged fixture'));await page.reload();await page.locator('#log-status').waitFor();
   check(await page.locator('#log-status').innerText().then(s=>s.includes('left intact')),'Corrupt-storage disclosure missing');check(await page.evaluate(()=>localStorage.getItem('rupert-field-log-v1'))==='damaged fixture','Corrupt storage overwritten');
   await atlas.close();await archive.close();await full.close();
  }
  check(requests.every(r=>!r.url.includes('rupert-field-log')&&!r.url.includes('_private')&&!r.body.includes(original.notes)&&!r.body.includes(photo)),'Personal history was transmitted');
  evidence.layouts.push({width,height,before,after});await ctx.close();console.log(`history ${width}x${height} PASS`);
 }
 check(evidence.errors.length===0,'Browser errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} experience-history browser assertions PASS.`);
}finally{await browser.close();server?.close();}
