/* Real-browser regression: toolbar transitions must show the current contents. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.LL_QA_DIR;
let checks=0;const errors=[],cases=[];
function check(value,message){assert.ok(value,message);checks++;}
async function main(){
 let server;
 const origin=process.env.LL_ORIGIN||await new Promise(resolve=>{
  server=http.createServer((req,res)=>{
   let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.otf':'font/otf','.ttf':'font/ttf'};
   fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(err?'Not found':data);});
  }).listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port));
 });
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const context=await browser.newContext({viewport,isMobile:viewport.width<600,hasTouch:viewport.width<600});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/weekly-economics-environment/',{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   const dates=await page.locator('.edition').evaluateAll(es=>es.map(e=>e.dataset.edition));
   check(dates.length>=6,'All published editions load');
   for(const theme of ['day','night']){
    await page.locator('.dn [data-mode='+theme+']').click();
    for(const date of dates){
     await page.locator('#open-archive').click();
     await page.locator('.archive-entry[data-date="'+date+'"]').click();
     const edition=page.locator('.edition:not([hidden])');
     check(await edition.getAttribute('data-edition')===date,'Archive selects requested edition');
     const entries=edition.locator('.entry'),count=await entries.count();
     check(count===5,'Five full readings retained');
     for(const [position,key] of [['top',null],['middle','Enter'],['bottom',' ']]){
      await page.locator('#full-mode').click();
      if(position==='top')await page.evaluate(()=>scrollTo(0,0));
      else await entries.nth(position==='middle'?2:count-1).scrollIntoViewIfNeeded();
      const glance=page.locator('#glance-mode');
      if(key){await glance.focus();await page.keyboard.press(key);}else if(viewport.width<600)await glance.tap();else await glance.click();
      const geometry=await edition.locator('.overview').evaluate(n=>{
       const r=n.getBoundingClientRect(),bar=document.querySelector('.toolbar').getBoundingClientRect();
       return {top:r.top,bottom:r.bottom,barBottom:bar.bottom,height:innerHeight};
      });
      check(geometry.top>=geometry.barBottom-1&&geometry.top<geometry.height/2,'Contents starts visibly below toolbar: '+JSON.stringify(geometry));
      check(await glance.getAttribute('aria-pressed')==='true','At a glance announces pressed');
      check(await page.locator('#full-mode').getAttribute('aria-pressed')==='false','Full Edition announces unpressed');
      check(await entries.evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')),'Readings actually hidden');
      check(!await edition.locator('.synthesis').isVisible()&&!await edition.locator('.knowledge').isVisible(),'Long closing sections hidden');
      check(await edition.locator('.hero').isVisible()&&await edition.locator('.register').isVisible(),'Title and Field Notes retained');
      check(await edition.locator('.heron-perch:visible').count()===0,'Heron quiet in glance');
      check(await glance.evaluate(n=>n===document.activeElement),'Toolbar retains keyboard focus');
      await glance.press('Enter');
      check(Math.abs(await edition.locator('.overview').evaluate(n=>n.getBoundingClientRect().top)-geometry.top)<2,'Repeated activation keeps contents visible');
      await page.locator('#full-mode').focus();await page.keyboard.press('Enter');
      check(await page.locator('#full-mode').getAttribute('aria-pressed')==='true'&&await glance.getAttribute('aria-pressed')==='false','Full Edition restored with keyboard');
      check(await entries.evaluateAll(es=>es.every(e=>getComputedStyle(e).display!=='none')),'Every full reading restored');
      check(await edition.locator('.knowledge').isVisible()&&await edition.locator('.synthesis').isVisible(),'Methods and synthesis restored');
      check(await edition.getAttribute('data-edition')===date,'Transition retains edition');
      check(await page.locator('html').getAttribute('data-mode')===theme,'Transition retains Day/Night');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
      cases.push({width:viewport.width,theme,date,position,key:key||'click'});
     }
     // The existing contents links must still reveal and align their full reading.
     await page.locator('#glance-mode').click();
     await edition.locator('.overview-item').nth(2).click();
     check(await page.locator('#full-mode').getAttribute('aria-pressed')==='true','Contents link exits glance');
     await page.waitForFunction(()=>{
      const top=document.querySelector('.edition:not([hidden]) .entry:nth-of-type(3)')?.getBoundingClientRect().top;
      return top>=document.querySelector('.toolbar').getBoundingClientRect().bottom-1&&top<innerHeight/2;
     });
     const landing=await entries.nth(2).evaluate(n=>({top:n.getBoundingClientRect().top,bar:document.querySelector('.toolbar').getBoundingClientRect().bottom}));
     check(landing.top>=landing.bar-1&&landing.top<viewport.height/2,'Article link clears toolbar');
    }
   }
   // Existing edition controls and directory remain usable after the transitions.
   await page.getByRole('button',{name:'Previous edition',exact:true}).click();
   await page.waitForFunction(d=>document.querySelector('.edition:not([hidden])').dataset.edition===d,dates[dates.length-2]);
   await page.getByRole('button',{name:'Next edition',exact:true}).click();
   await page.waitForFunction(d=>document.querySelector('.edition:not([hidden])').dataset.edition===d,dates.at(-1));
   check(true,'Previous/Next edition navigation preserved');
   const active=page.locator('.edition:not([hidden])');
   const perch=active.locator('.heron-perch').first();
   await perch.scrollIntoViewIfNeeded();await perch.click();
   check(await perch.getAttribute('aria-expanded')==='true','Heron still opens');
   await active.locator('.heron-panel:visible .hp-close').click();
   check(await perch.getAttribute('aria-expanded')==='false','Heron still closes');
   await perch.focus();await page.keyboard.press('Enter');
   check(await perch.getAttribute('aria-expanded')==='true','Heron reopens with keyboard');
   await page.keyboard.press('Escape');
   check(await perch.getAttribute('aria-expanded')==='false','Heron Escape preserved');
   await active.locator('.hero-art .pd-image').first().click();
   check(await page.locator('.pd-lightbox').evaluate(n=>n.open),'Published artwork viewer opens');
   await page.getByRole('button',{name:'Close image',exact:true}).click();
   check(!await page.locator('.pd-lightbox').evaluate(n=>n.open),'Artwork viewer closes');
   await page.locator('#glance-mode').click();
   await page.locator('.edition:not([hidden]) .fr-browse').click();
   check(await page.locator('#register-dialog').evaluate(n=>n.open),'Field Register opens');
   await page.keyboard.press('Escape');
   check(!await page.locator('#register-dialog').evaluate(n=>n.open),'Field Register closes with keyboard');
   await page.locator('#glance-mode').click();
   if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'glance-'+viewport.width+'.png')});}
   await page.goto(origin+'/weekly-economics-environment/notebook/');
   const concepts=page.locator('.concept-index a');
   check(await concepts.count()>=19,'Accepted Concept Index retained');
   await concepts.first().click();
   check(await page.locator('#complementarity').isVisible(),'Concept Index navigation works');
   await context.close();
  }
  check(errors.length===0,'No browser JavaScript errors: '+errors.join('; '));
  const result={origin,checks,cases,errors,physicalMobileDevice:false};
  if(out)fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({origin,checks,cases:cases.length,errors}));
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
