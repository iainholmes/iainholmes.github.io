// Compare the current directory to its accepted desktop baseline; actual page/menu handlers.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||'/tmp/atlas-directory-cards-evidence');await mkdir(output,{recursive:true});
const baselineCSS=execFileSync('git',['show','9123dc223ecc2e7c262a22716983199dd89a9e9e:rupert/assets/css/atlas.css'],{cwd:root,encoding:'utf8'});
const capture=process.env.ATLAS_QA_CAPTURE_BASELINE==='1';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=process.env.ATLAS_QA_URL?null:createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const proxyURL=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyURL?{server:proxyURL.origin,bypass:'127.0.0.1,localhost',...(proxyURL.username?{username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const fakeMap=`export async function createMap(){window.__directoryMap={markers:[],selected:null};return {setMarkers(f){window.__directoryMap.markers=f;},setRoutes(){},on(){},select(id){window.__directoryMap.selected=id;},resize(){},setHome(){},centerHome(){},setRelief(){},fit(){},focus(){},setTrafficMode(){},setTrafficIncidents(){},setTrafficAttribution(){}};}`;
const ids=['hillsborough-riverwalk','occoneechee-mountain','raven-rock','umstead-company-mill','eno-cox-mountain'];
const evidence={base,checks:0,errors:[],layouts:[],physicalDevice:false,map:process.env.ATLAS_QA_REAL_MAP?'actual MapLibre provider':'map provider test double; actual Atlas selection and disclosure handlers'};
const check=(ok,msg)=>{assert.ok(ok,msg);evidence.checks++;};
async function context(width,height,baseline=false){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage();page.on('pageerror',e=>evidence.errors.push(e.message));
 if(!process.env.ATLAS_QA_REAL_CLOCK){await page.clock.install({time:new Date('2026-10-08T22:00:00-04:00')});await page.clock.setFixedTime(new Date('2026-10-08T22:00:00-04:00'));}
 if(baseline)await page.route('**/assets/css/atlas.css*',r=>r.fulfill({contentType:'text/css',body:baselineCSS}));
 if(!process.env.ATLAS_QA_REAL_MAP)await page.route('**/assets/js/map/maplibre-provider.js*',r=>r.fulfill({contentType:'text/javascript',body:fakeMap}));
 await page.goto(base+'atlas/');await page.locator('.reg-row').first().waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready);
 if(!process.env.ATLAS_QA_REAL_MAP)await page.waitForFunction(()=>window.__directoryMap?.markers.length===5);
 await page.waitForFunction(()=>[...document.querySelectorAll('.reg-details')].every(d=>d.dataset.menuReady==='true'));
 if(width<1024)await page.locator('.directory-catalog > summary').click();
 return {ctx,page};
}
async function geometry(page){return page.evaluate(()=>{
 const rect=n=>Object.fromEntries(['x','y','width','height','right','bottom'].map(k=>[k,n.getBoundingClientRect()[k]]));
 const style=n=>Object.fromEntries(['fontFamily','fontSize','lineHeight','color','backgroundColor','paddingLeft','paddingRight'].map(k=>[k,getComputedStyle(n)[k]]));
 const list=document.querySelector('.directory-list'),box=rect(list);
 const cards=[...document.querySelectorAll('.reg-row')].map(n=>({id:n.dataset.place,box:rect(n),style:style(n),title:{text:n.querySelector('h4').textContent,box:rect(n.querySelector('h4')),style:style(n.querySelector('h4'))},word:{text:n.querySelector('.reg-word').textContent,box:rect(n.querySelector('.reg-word')),style:style(n.querySelector('.reg-word'))},edition:{text:n.querySelector('.reg-latest').textContent,href:n.querySelector('.reg-latest').getAttribute('href'),box:rect(n.querySelector('.reg-latest')),style:style(n.querySelector('.reg-latest'))},details:rect(n.querySelector('.reg-details>summary')),status:n.dataset.status}));
 return {width:innerWidth,list:box,scrollWidth:list.scrollWidth,visible:cards.filter(c=>c.box.x>=box.x-.5&&c.box.right<=box.right+.5).length,cards,overflow:document.documentElement.scrollWidth>innerWidth+1,map:rect(document.querySelector('.map-canvas'))};
 });}
async function settle(page){if(!process.env.ATLAS_QA_REAL_CLOCK)await page.clock.runFor(100);}
try{
 const sizes=process.env.ATLAS_QA_WIDTH?[[Number(process.env.ATLAS_QA_WIDTH),900]]:[[393,852],[852,393],[1023,768],[1024,768],[1280,800],[1440,900],[1512,982],[1920,1080]];
 for(const [width,height] of sizes){
  const before=await context(width,height,true),after=await context(width,height);await settle(before.page);await settle(after.page);
  const b=await geometry(before.page),a=await geometry(after.page);evidence.layouts.push({width,height,before:b,after:a});
  check(!a.overflow,`${width} page overflow`);check(a.cards.length===5,`${width} publication count changed`);
  if(!capture){
   for(let i=0;i<5;i++){const old=b.cards[i],c=a.cards[i];check(c.status===old.status&&c.title.text===old.title.text&&c.edition.href===old.edition.href&&c.edition.text===old.edition.text,'Place/status/edition changed');
    for(const k of ['fontFamily','fontSize','lineHeight','color']){check(c.title.style[k]===old.title.style[k],`Title ${k} changed`);check(c.word.style[k]===old.word.style[k],`Status ${k} changed`);check(c.edition.style[k]===old.edition.style[k],`Edition ${k} changed`);}
    if(width>=1024){check(c.word.box.bottom<=c.edition.box.y+1,'Metadata not stacked');check(Math.abs(c.word.box.x+c.word.box.width/2-c.edition.box.x-c.edition.box.width/2)<1,'Metadata not centered together');check(c.box.width<=old.box.width+.1,'Card became wider');if(width<=1512)check(c.box.width<old.box.width,'Laptop card width not reduced');check(c.details.height>=32&&c.details.width>=32,'Details target reduced');check(c.details.right<c.box.right-15,'Details not inset');check(c.title.box.height<=60,'Title exceeds two complete lines');check(c.box.height<=old.box.height+8,'Cards unnecessarily taller');check(c.edition.box.right+4<=c.details.x,'Edition link and Details overlap');}
   }
   if(width<1024)check(JSON.stringify(a.cards)===JSON.stringify(b.cards),'Accepted mobile directory changed');
   else {check(a.visible>=b.visible,`${width} fewer complete cards`);if(width>=1440){check(a.visible===5,`${width} not all five visible`);if(b.visible<5)check(a.visible>b.visible,`${width} visibility did not improve`);}}
  }
  for(const [name,c] of [['before',before],['after',after]]){await c.page.locator('.atlas-register').screenshot({path:resolve(output,`${name}-${width}.png`)});}
  await before.ctx.close();
  if(!capture){
   for(const id of ids){
    const row=after.page.locator('#place-'+id),summary=row.locator('.reg-details>summary'),popup=row.locator('.reg-dossier');
    await row.locator('.reg-select').click();if(!process.env.ATLAS_QA_REAL_MAP)check(await after.page.evaluate(()=>window.__directoryMap.selected)===id,'Map selection failed');
    await summary.scrollIntoViewIfNeeded();await settle(after.page);await summary.click();await settle(after.page);check(await popup.isVisible(),id+' Details not visible');check((await popup.innerText()).includes('Start:'),'Details content missing');
    if(width>=1024){await after.page.waitForFunction(id=>!!document.querySelector('#place-'+id+' .reg-dossier').style.left,id);const p=await popup.boundingBox();check(p.x>=19&&p.x+p.width<=width-19&&p.y>=11&&p.y+p.height<=height-11,`${id} Details outside viewport: ${JSON.stringify(p)}`);check(await popup.evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+15));}),'Details clipped by directory');}
    else check(await popup.evaluate(n=>getComputedStyle(n).position)==='static','Mobile disclosure no longer inline');
    await summary.press('Escape');check(!await row.locator('.reg-details').evaluate(n=>n.open),'Escape close failed');check(await summary.evaluate(n=>document.activeElement===n),'Escape focus lost');
   }
   if(width>=1024){
    await after.page.locator('.directory-list').evaluate(n=>n.scrollLeft=n.scrollWidth);await settle(after.page);const end=await geometry(after.page);check(end.cards.at(-1).box.right<=end.list.right+1,'Cannot reach final card');
    const summary=after.page.locator('#place-eno-cox-mountain .reg-details>summary');await summary.focus();await after.page.keyboard.press('Tab');await after.page.keyboard.press('Shift+Tab');await summary.press('Enter');await settle(after.page);check(await after.page.locator('#place-eno-cox-mountain .reg-details').evaluate(n=>n.open),'Keyboard Details activation failed');
    await after.page.setViewportSize({width:width-80,height});await settle(after.page);check(!await after.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'Resize overflow');
    const p=await after.page.locator('#place-eno-cox-mountain .reg-dossier').boundingBox();check(p.x>=0&&p.x+p.width<=width-79,'Open Details escaped resized viewport');await summary.press('Escape');
   }
  }
  await after.ctx.close();console.log(`${width} directory: ${b.visible} → ${a.visible} complete cards; ${b.cards[0].box.width.toFixed(1)} → ${a.cards[0].box.width.toFixed(1)} px; height ${b.cards[0].box.height} → ${a.cards[0].box.height}`);
 }
 check(evidence.errors.length===0,'Page errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} directory-card browser assertions PASS${capture?' (baseline capture)':''}.`);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
