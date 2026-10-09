// Visible-ink measurements, not font line boxes; preserve the accepted phone masthead.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,stat,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=resolve(process.env.ATLAS_QA_OUTPUT_DIR||'/tmp/atlas-masthead-evidence');await mkdir(output,{recursive:true});
const baselineCSS=execFileSync('git',['show','85dac1add0169ca5d7bf6b45a08dd85c1a9e27e6:rupert/assets/css/atlas.css'],{cwd:root,encoding:'utf8'});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.otf':'font/otf','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=process.env.ATLAS_QA_URL?null:createServer(async(req,res)=>{try{let f=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(f!==root&&!f.startsWith(root+'/'))throw Error();if((await stat(f)).isDirectory())f=resolve(f,'index.html');res.setHeader('Content-Type',mime[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404);res.end();}});if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.ATLAS_QA_URL||`http://127.0.0.1:${server.address().port}/`;
const proxyURL=process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyURL?{server:proxyURL.origin,bypass:'127.0.0.1,localhost',...(proxyURL.username?{username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)}:{})}:undefined;
const browser=await chromium.launch({headless:true,proxy,args:['--no-sandbox','--disable-dev-shm-usage'],...(process.env.ATLAS_QA_CHROME?{executablePath:process.env.ATLAS_QA_CHROME}:{})});
const evidence={base,checks:0,errors:[],layouts:[],physicalDevice:false};const check=(ok,msg)=>{assert.ok(ok,msg);evidence.checks++;};
const capture=process.env.ATLAS_QA_CAPTURE_BASELINE==='1';
async function layout(page){return page.evaluate(()=>{
 const rect=n=>Object.fromEntries(['x','y','width','height','right','bottom'].map(k=>[k,n.getBoundingClientRect()[k]]));
 const item=s=>{const n=document.querySelector(s),c=getComputedStyle(n);return {box:rect(n),font:c.font,fontSize:c.fontSize,fontFamily:c.fontFamily,color:c.color,letterSpacing:c.letterSpacing,paddingTop:c.paddingTop,paddingBottom:c.paddingBottom,display:c.display};};
 return {masthead:item('.masthead'),wordmark:item('.wordmark'),dateline:item('.dateline'),primary:item('.primary'),bar:item('.bar'),dock:item('.dock'),main:rect(document.querySelector('main')),wrap:rect(document.querySelector('.masthead .wrap')),overflow:document.documentElement.scrollWidth>innerWidth+1};
});}
function ink(path){return JSON.parse(execFileSync('python',['-c',`import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert('RGB')\npoints=[(x,y) for y in range(im.height) for x in range(im.width) if all(v>180 for v in im.getpixel((x,y)))]\nassert points,'No visible type'\nprint(json.dumps(dict(left=min(x for x,y in points),top=min(y for x,y in points),right=max(x for x,y in points)+1,bottom=max(y for x,y in points)+1)))`,path],{encoding:'utf8'}));}
try{
 const sizes=process.env.ATLAS_QA_WIDTH?[[Number(process.env.ATLAS_QA_WIDTH),900]]:[[375,812],[393,852],[430,932],[852,393],[1023,768],[1024,768],[1280,800],[1440,900],[1512,982],[1920,1080]];
 for(const [width,height] of sizes){const pair=[];
  for(const before of [true,false]){
   const ctx=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'}),page=await ctx.newPage();page.on('pageerror',e=>evidence.errors.push(e.message));
   if(before)await page.route('**/assets/css/atlas.css*',r=>r.fulfill({contentType:'text/css',body:baselineCSS}));
   if(!process.env.ATLAS_QA_REAL_CLOCK){await page.clock.install({time:new Date('2026-10-09T12:00:00-04:00')});await page.clock.setFixedTime(new Date('2026-10-09T12:00:00-04:00'));}
   await page.goto(base);await page.locator('.wordmark').waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready);const g=await layout(page);
   if(width>=1024){
    const prefix=resolve(output,`${before?'before':'after'}-${width}`);await page.locator('.wordmark').screenshot({path:prefix+'-title.png'});await page.locator('.dateline').screenshot({path:prefix+'-metadata.png'});await page.locator('.masthead').screenshot({path:prefix+'.png'});
    g.ink=ink(prefix+'-title.png');g.metadataInk=ink(prefix+'-metadata.png');g.upperGap=g.wordmark.box.y+g.ink.top-g.dateline.box.y-g.metadataInk.bottom;g.lowerGap=g.primary.box.y-g.wordmark.box.y-g.ink.bottom;
    g.navigation=await page.evaluate(()=>[...document.querySelectorAll('.primary a')].map(n=>{const r=n.getBoundingClientRect();return {href:n.getAttribute('href'),current:n.getAttribute('aria-current'),hit:n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};}));
   }
   pair.push(g);await ctx.close();
  }
  const [b,a]=pair;evidence.layouts.push({width,height,before:b,after:a});check(!a.overflow,`${width} overflow`);
  if(width<1024)check(JSON.stringify(a)===JSON.stringify(b),`${width} accepted mobile/tablet presentation changed`);
  else if(!capture){
   check(a.wordmark.box.y+a.ink.top>b.wordmark.box.y+b.ink.top,`${width} visible title did not move down`);
   check(Math.abs(a.upperGap-a.lowerGap)<=3,`${width} visible gaps unbalanced: ${a.upperGap}/${a.lowerGap}`);
   check(a.upperGap>8&&a.lowerGap>8,`${width} text collision`);check(a.ink.left>=8&&a.ink.right<=a.wordmark.box.width-8,`${width} title clips or crowds edges`);
   check(a.ink.bottom-a.ink.top<parseFloat(a.wordmark.fontSize)*1.2,`${width} title wrapped`);check(a.masthead.box.height<=b.masthead.box.height+1,`${width} masthead grew unnecessarily`);
   check(JSON.stringify(a.dateline)===JSON.stringify(b.dateline),`${width} metadata moved/changed`);check(a.primary.font===b.primary.font&&a.primary.color===b.primary.color&&Math.abs(a.primary.box.y-b.primary.box.y)<=1,`${width} navigation changed`);
   check(a.navigation.every(n=>n.hit)&&JSON.stringify(a.navigation)===JSON.stringify(b.navigation),`${width} navigation targets changed/overlapped`);
   check(a.wordmark.color===b.wordmark.color&&a.wordmark.fontFamily===b.wordmark.fontFamily&&Math.abs(parseFloat(a.wordmark.letterSpacing)/parseFloat(a.wordmark.fontSize)-parseFloat(b.wordmark.letterSpacing)/parseFloat(b.wordmark.fontSize))<.000001,`${width} title palette/tracking changed`);
  }
  console.log(`${width}: visible gaps ${b.upperGap?.toFixed(1)}/${b.lowerGap?.toFixed(1)} → ${a.upperGap?.toFixed(1)}/${a.lowerGap?.toFixed(1)} px`);
 }
 check(evidence.errors.length===0,'Browser errors: '+evidence.errors.join('; '));await writeFile(resolve(output,'results.json'),JSON.stringify(evidence,null,2));console.log(`${evidence.checks} masthead assertions PASS${capture?' (baseline capture)':''}.`);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
