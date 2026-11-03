'use strict';
/* Real rendered geometry, shared by CI Playwright and the connected browser.
 * Example: LL_ORIGIN=https://iainholmes.github.io LL_CHROME=/path/to/chrome node scripts/test_ll_layout_browser.cjs
 * No mocked stylesheet requests: this audits the HTML and CSS actually served.
 */
const assert=require('node:assert/strict');
const dates=['2026-09-25','2026-10-02','2026-10-09','2026-10-16','2026-10-23','2026-10-30'];
async function audit({page,goto,setViewport,origin,widths=[1440,1280,1180,1024,1000,851,850,768,651,650,520,390,320]}){
 let assertions=0;const evidence=[];
 const check=(condition,message)=>{assert(condition,message);assertions++};
 for(const width of widths){
  await setViewport({width,height:1100});
  for(const date of dates){
   await goto(origin+'/weekly-economics-environment/#edition-'+date);
   const selected=page.locator('#edition-'+date);
   check(await selected.isVisible(),`${width} ${date}: selected edition visible`);
   const result=await selected.evaluate(ed=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height}};
    const lists=[...ed.querySelectorAll('.exhibit-longview,.rcf-ledger')].map(e=>({
     type:e.classList.contains('rcf-ledger')?'ledger':'long',id:e.closest('article').id,
     declared:Number(e.dataset.stageCount),rect:rect(e),display:getComputedStyle(e).display,
     rail:getComputedStyle(e).borderLeftWidth,
     children:[...e.children].map(c=>({...rect(c),overflow:Math.max(0,...[...c.children].map(n=>n.scrollWidth-n.clientWidth)),
      markerTop:getComputedStyle(c,'::before').top,segment:getComputedStyle(c,'::after').content}))
    }));
    const panels=[...ed.querySelectorAll('.feature-spread>.interpretive-essay,.feature-spread>.reading-exhibit')].map(p=>{
     const r=p.getBoundingClientRect();const leaves=[...p.querySelectorAll('*')].filter(n=>!n.children.length&&n.getBoundingClientRect().height);
     const end=Math.max(r.top,...leaves.map(n=>n.getBoundingClientRect().bottom));
     return {id:p.closest('article').id,cls:p.className,height:r.height,blank:r.bottom-end};
    });
    const overflows=[...ed.querySelectorAll('.entry,.feature-spread,.reading-exhibit,.reading-companion-feature,.reading-media,.reading-sources')]
     // Figure crop marks intentionally extend 14px into the page margin.
     .filter(e=>e.scrollWidth>e.clientWidth+(e.matches('.entry,.reading-media')?14:2)).map(e=>({id:e.closest('article')?.id,cls:e.className,excess:e.scrollWidth-e.clientWidth}));
    return {readings:ed.querySelectorAll('article.entry').length,viewport:innerWidth,scroll:document.documentElement.scrollWidth,lists,overflows,
     panels,kinds:[...ed.querySelectorAll('.reading-exhibit')].map(e=>e.dataset.exhibitKind),
     duplicateInline:!!document.getElementById('ll-accepted-reading-arrangement-20261103')};
   });
   const label=width+' '+date;
   check(result.viewport===width,label+': actual viewport width');
   check(result.readings===5,label+': five readings');
   check(result.scroll<=width+1,label+': page overflow');
   check(!result.duplicateInline,label+': retired inline override absent');
   check(!result.overflows.length,label+': feature overflow '+JSON.stringify(result.overflows));
   check(result.panels.every(p=>p.blank<=90),label+': unfinished panel whitespace '+JSON.stringify(result.panels.filter(p=>p.blank>90)));
   for(const list of result.lists){
    const cells=list.children,n=cells.length;
    check(n===(list.type==='ledger'?3:list.declared),label+' '+list.id+': complete comparison');
    const columns=width<=650?1:list.type==='long'&&n===4&&width<=1000?2:n;
    const row=cells.slice(0,columns);
    check(row.every(c=>Math.abs(c.y-row[0].y)<1),label+' '+list.id+': expected side-by-side row');
    check(row.every(c=>Math.abs(c.w-row[0].w)<1),label+' '+list.id+': equal tracks');
    check(Math.abs(row.at(-1).right-list.rect.right)<2,label+' '+list.id+': no unused right track');
    check(cells.every(c=>c.overflow<=2),label+' '+list.id+': readable within tracks');
    if(columns===1)check(cells.every((c,i)=>!i||c.y>=cells[i-1].bottom-1),label+' '+list.id+': nonoverlapping mobile stack');
    if(list.type==='long'&&width<=650){
     check(parseFloat(list.rail)===2,label+' '+list.id+': vertical rail');
     check(cells.every(c=>c.segment==='none'&&c.markerTop==='2px'),label+' '+list.id+': connected mobile markers');
    }
   }
   evidence.push({width,date,...result});
  }
 }
 return {result:'passed',assertions,evidence};
}
module.exports={audit};
if(require.main===module)(async()=>{
 const fs=require('node:fs');const {chromium}=require(process.env.LL_PLAYWRIGHT||'playwright');
 const browser=await chromium.launch({headless:true,...(process.env.LL_CHROME?{executablePath:process.env.LL_CHROME}:{})});
 try{
  const page=await browser.newPage();
  const result=await audit({page,goto:url=>page.goto(url,{waitUntil:'networkidle'}),setViewport:size=>page.setViewportSize(size),origin:process.env.LL_ORIGIN||'http://127.0.0.1:8765'});
  if(process.env.LL_QA_JSON)fs.writeFileSync(process.env.LL_QA_JSON,JSON.stringify(result,null,2));
  console.log(JSON.stringify({result:result.result,assertions:result.assertions,viewports:new Set(result.evidence.map(x=>x.width)).size,editions:dates.length}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
