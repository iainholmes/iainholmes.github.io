'use strict';
const paletteProfiles=require('../weekly-economics-environment/reading-compositions.json').profiles;
const assert=require('node:assert/strict'),{missingJoins}=require('./ll_feature_gap_audit.cjs');
async function audit({page,goto,setViewport,origin,expectedTheme,widths=[3440,2560,1920,1710,1600,1512,1440,1280,1180,1024,900,850,820,768,651,650,520,430,390,375,320]}){
 let assertions=0;const evidence=[];const check=(v,m)=>{assert(v,m);assertions++};
 await goto(origin+'/weekly-economics-environment/');const directory=await page.locator('#ll-reading-index-data').evaluate(e=>JSON.parse(e.textContent));const publishedDates=directory.editions.map(e=>e.date),totalReadings=directory.editions.reduce((n,e)=>n+e.readings.length,0);
 for(const width of widths){await setViewport({width,height:1100});for(const date of publishedDates){await goto(origin+'/weekly-economics-environment/#edition-'+date);await page.locator('#edition-'+date).waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))));
 const r=await page.locator('#edition-'+date).evaluate(ed=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
 const features=[...ed.querySelectorAll('.ll-feature')].map(e=>{const h=e.querySelector('h3'),style=getComputedStyle(h),last=e.querySelector('.ll-feature-source');return {id:e.id,reading:e.closest('.entry').id,type:e.dataset.specialFeature,rect:rect(e),font:style.fontFamily,size:style.fontSize,style:style.fontStyle,bottomBlank:e.getBoundingClientRect().bottom-last.getBoundingClientRect().bottom,bottomPadding:parseFloat(getComputedStyle(e).paddingBottom),overflow:e.scrollWidth-e.clientWidth,bodyFont:getComputedStyle(e).fontSize,nativeJoin:!!e.closest('.ll-feature-host,.ll-touching-feature-row,.ll-joined-sequence,.ll-paper-plate')}});
 const alpha=c=>c==='transparent'?0:parseFloat(c.match(/\/\s*([\d.]+)\)/)?.[1]??c.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)?.[1]??1);
 const surfaceReadings=[...ed.querySelectorAll('.entry')].map(article=>{
  const readColor=color=>{
   const ctx=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
   ctx.fillStyle=color;ctx.fillRect(0,0,1,1);
   return [...ctx.getImageData(0,0,1,1).data];
  };
  const token=document.createElement('span');token.style.cssText='position:absolute;visibility:hidden';article.append(token);
  const colorOf=property=>{token.style.color='var('+property+')';return getComputedStyle(token).color};
  const paper=readColor(colorOf('--paper')),accent=colorOf('--ll-feature-edge'),seam=colorOf('--ll-feature-seam');
  const contrastColor=color=>{
   const lum=rgb=>rgb.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
   const a=lum(readColor(color));
   return wash=>{
    const rgb=readColor(wash),opacity=rgb[3]/255,b=lum(paper.map((p,i)=>p*(1-opacity)+rgb[i]*opacity));
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   };
  };
  const edgeContrast=contrastColor(accent),seamContrast=contrastColor(seam);token.remove();
  return {id:article.id,palette:article.dataset.readingPalette,features:[...article.querySelectorAll('.ll-feature')].map(f=>{
   const st=getComputedStyle(f),rail=getComputedStyle(f,'::before'),outer=[];
   for(let n=f.parentElement;n&&n!==article;n=n.parentElement)if(alpha(getComputedStyle(n).backgroundColor)>0)outer.push(n.className);
   const keys=['tl','tr','bl','br'],props=['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'];
   return {id:f.id,background:st.backgroundColor,alpha:alpha(st.backgroundColor),opacity:st.opacity,borders:[st.borderTopWidth,st.borderRightWidth,st.borderBottomWidth,st.borderLeftWidth].map(parseFloat),ink:st.color,parentPaint:outer,corners:Object.fromEntries(keys.map((key,i)=>[key,parseFloat(st[props[i]])])),internal:(f.dataset.contactCorners||'').split(' ').filter(Boolean),shared:(f.dataset.contactSides||'').split(' ').filter(Boolean),rail:[rail.borderTopWidth,rail.borderRightWidth,rail.borderBottomWidth,rail.borderLeftWidth].map(parseFloat),railColors:[rail.borderTopColor,rail.borderLeftColor],accent,seam,edgeContrast:edgeContrast(st.backgroundColor),seamContrast:seamContrast(st.backgroundColor)};
  })};
 });
 const spacing=[...ed.querySelectorAll('.ll-feature')].map(f=>{const s=getComputedStyle(f),sides=(f.dataset.contactSides||'').split(' ');return['Top','Right','Bottom','Left'].every(side=>Math.abs(parseFloat(s['padding'+side])-parseFloat(s.getPropertyValue(side==='Left'||side==='Right'?'--ll-feature-x':'--ll-feature-y'))-(sides.includes(side.toLowerCase())?Math.min(24,Math.max(16,document.documentElement.clientWidth*.015)):0))<.1)});
 const ornaments=[...ed.querySelectorAll('.entry')].map(a=>{const deck=getComputedStyle(a.querySelector('.reading-deck')),motif=getComputedStyle(a.querySelector('.reading-deck'),'::after'),src=getComputedStyle(a.querySelector('.ll-source-divider')),extra=Math.min(24,Math.max(16,document.documentElement.clientWidth*.015));return{deck:Math.abs(parseFloat(deck.paddingBottom)-35-extra-Math.min(8,Math.max(6,document.documentElement.clientWidth*.005)))<.1&&Math.abs(parseFloat(deck.marginBottom)-24-extra)<.1,motif:motif.height==='17px'&&motif.backgroundSize==='30% 1.25px, 19% 1.25px, 10% 1.25px',sources:src.height==='14px'&&Math.abs(parseFloat(src.marginTop)-3-extra-Math.min(6,Math.max(4,document.documentElement.clientWidth*.004)))<.1&&Math.abs(parseFloat(src.marginBottom)-20-extra)<.1}});
 const body=ed.querySelector('.edition-body'),rail=ed.querySelector('.contents-boundary'),column=ed.querySelector('.reading-column');
 const canvas={body:rect(body),rail:rect(rail),column:rect(column),available:document.body.getBoundingClientRect().right,railDisplay:getComputedStyle(rail).display,railPosition:getComputedStyle(ed.querySelector('.contents')).position};
 // Independently enumerate actual common edges; every one needs a centered rule.
 // An editorial-only wrapper owns its padding and intended inset; a mixed
 // wrapper stops the ascent, so a notebook BESIDE a figure cannot block its foot.
 const gapStandards=[...ed.querySelectorAll('.ll-opening,.ll-interpretation,.ll-evidence-destination,.ll-notebook-unit,.ll-editorial,.research-note,.perch,.reading-sources')].filter(n=>n.getClientRects().length&&!n.closest('.ll-feature')).map(n=>{while(n.parentElement&&!n.parentElement.querySelector('.ll-feature')&&!n.parentElement.classList.contains('ll-reading'))n=n.parentElement;const r=rect(n);return{reading:n.closest('.entry')?.id,rect:r}});
 const sharedEdges=[],standards=[...ed.querySelectorAll('.ll-editorial,.ll-interpretation,.ll-opening,.ll-evidence-destination,.ll-notebook-unit,.research-note,.perch,.ll-standard-break,.reading-sources')].filter(n=>n.getClientRects().length&&!n.closest('.ll-feature')).map(rect),fs=[...ed.querySelectorAll('.ll-feature')];
 const intersects=(a,b)=>a.x<b.right-1&&a.right>b.x+1&&a.y<b.bottom-1&&a.bottom>b.y+1;
 for(let i=0;i<fs.length;i++)for(let j=i+1;j<fs.length;j++){if(fs[i].closest('.entry')!==fs[j].closest('.entry'))continue;const a=rect(fs[i]),b=rect(fs[j]);let edge=null;
 if(Math.min(Math.abs(a.right-b.x),Math.abs(b.right-a.x))<=1){const start=Math.max(a.y,b.y),end=Math.min(a.bottom,b.bottom),at=a.x<b.x?(a.right+b.x)/2:(b.right+a.x)/2;if(end-start>16)edge={axis:'vertical',start,end,at,strip:{x:at-3,right:at+3,y:start,bottom:end}};}
 if(Math.min(Math.abs(a.bottom-b.y),Math.abs(b.bottom-a.y))<=1){const start=Math.max(a.x,b.x),end=Math.min(a.right,b.right),at=a.y<b.y?(a.bottom+b.y)/2:(b.bottom+a.y)/2;if(end-start>16)edge={axis:'horizontal',start,end,at,strip:{x:start,right:end,y:at-3,bottom:at+3}};}
 if(edge&&!standards.some(s=>intersects(s,edge.strip))&&!fs.some((f,k)=>k!==i&&k!==j&&intersects(rect(f),edge.strip)))sharedEdges.push({...edge,from:fs[i].id,to:fs[j].id});}
 const seamGeometry=[...ed.querySelectorAll('.ll-feature-divider')].map(d=>{const r=rect(d),axis=d.classList.contains('ll-divider-horizontal')?'horizontal':'vertical',edge=sharedEdges.find(e=>e.axis===axis&&[e.from,e.to].includes(d.dataset.from)&&[e.from,e.to].includes(d.dataset.to)),style=getComputedStyle(d);return{from:d.dataset.from,to:d.dataset.to,edge:!!edge,axis,length:axis==='horizontal'?r.w:r.h,expected:edge?(edge.end-edge.start)*.9:null,centerError:edge?Math.abs((axis==='horizontal'?r.x+r.w/2:r.y+r.h/2)-(edge.start+edge.end)/2):null,boundaryError:edge?Math.abs((axis==='horizontal'?r.y+r.h/2:r.x+r.w/2)-edge.at):null,thickness:axis==='horizontal'?r.h:r.w,clip:style.clipPath,background:style.backgroundImage,cap:parseFloat(style.getPropertyValue('--divider-cap'))}});
 const ledger=[...ed.querySelectorAll('.ll-ledger')].map(e=>({id:e.closest('.ll-feature').id,rect:rect(e),cells:[...e.children].map(rect)}));
 const timelines=[...ed.querySelectorAll('.ll-timeline')].map(e=>({id:e.closest('.ll-feature').id,n:e.children.length,rect:rect(e),cells:[...e.children].map(rect)}));
 const core=[...ed.querySelectorAll('.ll-editorial h3,.research-note h3')].map(e=>({font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,householdNote:!!e.closest('.ll-household-policy-robustness .research-note')}));
 const touching=[...ed.querySelectorAll('.ll-touching-feature-row')].map(e=>{const style=getComputedStyle(e);return {topBorder:parseFloat(style.borderTopWidth),color:style.borderTopColor,bg:style.backgroundColor,count:e.querySelectorAll('.ll-feature').length}});
 const householdField=ed.querySelector('.ll-household-policy-robustness');
 const household=householdField?(()=>{
  const feature=householdField.querySelector('.ll-assumption-test'),note=householdField.querySelector('.ll-notebook-home'),heading=note?.querySelector('.research-note h3'),row=householdField.querySelector('.ll-arranged-row');
  const f=feature?getComputedStyle(feature):null,h=heading?getComputedStyle(heading):null,n=note?getComputedStyle(note):null,w=heading?heading.textContent.indexOf('complementarity'):-1;let wordLines=null;
  if(w>=0){const node=[...heading.childNodes].find(x=>x.nodeType===3&&x.textContent.includes('complementarity'));if(node){const start=node.textContent.indexOf('complementarity'),range=document.createRange();range.setStart(node,start);range.setEnd(node,start+15);wordLines=range.getClientRects().length;}}
  return {featurePresent:!!feature,notePresent:!!heading,featureBg:f?.backgroundColor,fieldBg:getComputedStyle(householdField).backgroundColor,gap:row?parseFloat(getComputedStyle(row).columnGap):0,noteMarginTop:n?parseFloat(n.marginTop):null,notebookWrap:h?.overflowWrap,notebookBreak:h?.wordBreak,headingOverflow:heading?heading.scrollWidth-heading.clientWidth:null,wordLines};
 })():null;
 const householdArticle=ed.querySelector('[id="2026-10-30-household-climate"]');
  const householdJoin=householdArticle?(()=>{
   const upper=householdArticle.querySelector('.ll-household-complementarity'),lower=householdArticle.querySelector('.ll-household-test-and-research'),mechanism=householdArticle.querySelector('.ll-mechanism-map'),test=householdArticle.querySelector('.ll-assumption-test');
   const a=upper?.children[0]?.getBoundingClientRect(),b=upper?.children[1]?.getBoundingClientRect(),m=mechanism?.getBoundingClientRect(),t=test?.getBoundingClientRect();
   const sideBySide=!!a&&!!b&&Math.abs(a.left-b.left)>10;
   return {bothPresent:!!upper&&!!lower&&!!mechanism&&!!test,joinedSequence:upper?.parentElement===lower?.parentElement?.parentElement&&upper?.parentElement?.classList.contains('ll-joined-sequence'),sideBySide,aligned:!!m&&!!t?Math.abs(m.left-t.left):null,gap:!!m&&!!t?t.top-m.bottom:null,overlap:!!m&&!!t?Math.min(m.right,t.right)-Math.max(m.left,t.left):null,notebookSeparate:!!lower?.querySelector('.ll-notebook-home')&&!test.contains(lower.querySelector('.ll-notebook-home'))};
  })():null;
  const movesArticle=ed.querySelector('[id="2026-10-30-moves6"]');
  const movesJoin=movesArticle?(()=>{
   const group=movesArticle.querySelector('.ll-moves-featuregroup'),math=group?.querySelector('.ll-estimation-desk'),test=group?.querySelector('.ll-assumption-test');
   if(!group||!math||!test)return {bothPresent:false};
   const g=getComputedStyle(group),m=getComputedStyle(math),t=getComputedStyle(test),mRail=getComputedStyle(math,'::before'),tRail=getComputedStyle(test,'::before'),a=math.getBoundingClientRect(),b=test.getBoundingClientRect();
   return {bothPresent:true,groupBackground:g.backgroundColor,mathBackground:m.backgroundColor,testBackground:t.backgroundColor,mathBorder:parseFloat(mRail.borderTopWidth),testBorder:parseFloat(tRail.borderLeftWidth),mathBorderColor:mRail.borderTopColor,testBorderColor:tRail.borderLeftColor,gap:b.top-a.bottom,overlap:Math.min(a.right,b.right)-Math.max(a.left,b.left),separateChildren:math.parentElement!==test.parentElement};
  })():null;
  const nodes=[...ed.querySelectorAll('.ll-node')].map(e=>e.getBoundingClientRect().width);return {theme:document.documentElement.dataset.mode,canvas,spacing,ornaments,surfaceReadings,gapStandards,sharedEdges,seamGeometry,nodes,touching,household,householdJoin,movesJoin,width:innerWidth,scroll:document.documentElement.scrollWidth,readings:ed.querySelectorAll('.entry[data-editorial-system="7"]').length,features,ledger,timelines,core,maths:[...ed.querySelectorAll('.ll-equation')].map(e=>({width:e.clientWidth,content:e.scrollWidth,focus:e.tabIndex})),horizontalScrollers:[...ed.querySelectorAll('*')].filter(e=>e.clientWidth>0&&e.getClientRects().length&&e.clientWidth&&e.scrollWidth>e.clientWidth+1&&['auto','scroll'].includes(getComputedStyle(e).overflowX)).map(e=>e.className),headlines:[...ed.querySelectorAll('.reading-title h2')].map(e=>({family:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight})),sources:[...ed.querySelectorAll('.entry')].map(a=>({id:a.id,last:a.querySelector('.ll-reading').lastElementChild.classList.contains('reading-sources'),titleUnderlined:getComputedStyle(a.querySelector('.ll-source-context')).textDecorationLine==='underline'})),dividers:[...ed.querySelectorAll('.ll-feature-divider')].map(d=>({axis:d.classList.contains('ll-divider-horizontal')?'horizontal':'vertical',length:d.classList.contains('ll-divider-horizontal')?d.getBoundingClientRect().width:d.getBoundingClientRect().height,overlap:+d.dataset.overlap,from:d.dataset.from,to:d.dataset.to,gap:(()=>{const a=ed.querySelector('[id="'+d.dataset.from+'"]').getBoundingClientRect(),b=ed.querySelector('[id="'+d.dataset.to+'"]').getBoundingClientRect();return d.classList.contains('ll-divider-horizontal')?Math.min(Math.abs(a.bottom-b.top),Math.abs(b.bottom-a.top)):Math.min(Math.abs(a.right-b.left),Math.abs(b.right-a.left))})()})),bridges:ed.querySelectorAll('.ll-feature-bridge,.ll-feature-join').length,indexCount:JSON.parse(document.getElementById('ll-reading-index-data').textContent).editions.reduce((s,e)=>s+e.readings.length,0)};
 });const label=width+' '+date;if(expectedTheme)check(r.theme===expectedTheme,label+' requested reading theme');check(r.width===width,label+' viewport');check(r.scroll<=width+1,label+' page overflow');check(r.readings===5,label+' readings');check(r.indexCount===totalReadings,label+' Index coverage');check(r.features.length>=10,label+' authored features');check(r.nodes.every(w=>w>=120),label+' legible mechanism nodes');check(r.features.every(f=>f.overflow<=2),label+' feature overflow '+JSON.stringify(r.features.filter(f=>f.overflow>2)));check(r.features.every(f=>f.bottomBlank<=f.bottomPadding+5||f.nativeJoin),label+' incomplete panel termination');check(r.core.every(f=>(f.householdNote?(parseFloat(f.size)>=21&&parseFloat(f.size)<=30):['31px','34px'].includes(f.size))&&f.font===r.core[0].font),label+' consistent editorial typography');check(r.maths.every(m=>m.focus===0&&m.content<=m.width+1),label+' keyboard-accessible mathematics without horizontal overflow');
 check(r.spacing.every(Boolean),label+' clearance only on genuine shared sides');check(r.ornaments.every(o=>o.deck&&o.motif&&o.sources),label+' balanced ornamental spacing with original geometry');
 check(r.headlines.every(h=>h.family.includes('LM Roman Dunhill')&&h.weight==='400'),label+' approved headline typography');check(r.sources.every(s=>s.last&&s.titleUnderlined),label+' Sources last and copper-underlined descriptor');if(width<=650)check(r.horizontalScrollers.length===0,label+' no horizontal scrolling inside components '+JSON.stringify(r.horizontalScrollers));check(r.dividers.every(d=>d.gap<=1&&Math.abs(d.length/d.overlap-.9)<.005),label+' centered 90 percent feature dividers');check(r.bridges===0,label+' no artificial feature bridges');
 check(r.surfaceReadings.every(a=>paletteProfiles[a.palette]&&a.features.every(f=>Math.abs(f.alpha-paletteProfiles[a.palette][r.theme==='night'?'nightStrength':'dayStrength']/100)<.001)),label+' authored palette strengths without fallback colors');
 check(r.surfaceReadings.every(a=>a.features.every(f=>f.background===a.features[0].background&&f.alpha>0&&f.alpha<.6&&f.opacity==='1'&&f.parentPaint.length===0)),label+' one translucent reading-owned wash without double-painted wrappers '+JSON.stringify(r.surfaceReadings));
 check(r.surfaceReadings.every(a=>a.features.every(f=>f.borders.every(b=>b===0)&&Object.entries(f.corners).every(([k,v])=>f.internal.includes(k)?v===0:v>=10))),label+' no panel outlines and only exposed corners rounded '+JSON.stringify(r.surfaceReadings));
 check(r.surfaceReadings.every(a=>a.features.every(f=>{
  const top=f.shared.includes('top')?0:4,left=!top&&!f.shared.includes('left')?4:0;
  return f.rail.join(',')===[top,0,0,left].join(',')&&(!top||f.railColors[0]===f.accent)&&(!left||f.railColors[1]===f.accent);
 })),label+' one palette accent on the first eligible outside edge');
 check(r.surfaceReadings.every(a=>a.features.every(f=>f.edgeContrast>=3&&f.seamContrast>=3)),label+' at least 3:1 feature edge and seam contrast against wash '+JSON.stringify(r.surfaceReadings.flatMap(a=>a.features).filter(f=>f.edgeContrast<3||f.seamContrast<3)));
 const gaps=missingJoins(r.features,r.gapStandards);check(gaps.length===0,label+' no missing native feature joins '+JSON.stringify(gaps));
 check(r.sharedEdges.every(e=>r.seamGeometry.filter(d=>[d.from,d.to].includes(e.from)&&[d.from,d.to].includes(e.to)&&d.axis===e.axis).length===1),label+' every genuine shared edge receives a divider');
 check(r.seamGeometry.every(d=>d.edge&&Math.abs(d.length-d.expected)<1&&d.centerError<1&&d.boundaryError<1&&d.thickness===6&&d.cap<=24&&d.cap<=d.length*.16+.05&&d.clip.startsWith('polygon')&&r.surfaceReadings.some(a=>a.features.some(f=>f.id===d.from&&d.background.includes(f.accent)&&d.background.includes(f.seam)))),label+' 90 percent divider length, centered 6px palette seam and clipped ends '+JSON.stringify(r.seamGeometry));
 if(date==='2026-09-25'&&[390,1280].includes(width)){
  const pair=r.seamGeometry.filter(d=>[d.from,d.to].includes('insurance--economic-figures')&&[d.from,d.to].includes('insurance--estimation-desk'));
  check(pair.length===1&&pair[0].axis===(width===390?'horizontal':'vertical'),label+' the same insurance pair stacks and unstacks with one seam');
 }
 if(width>820){check(r.canvas.body.x>=16&&r.canvas.body.x<=42&&r.canvas.available-r.canvas.column.right>=16&&r.canvas.available-r.canvas.column.right<=42,label+' near-edge desktop navigator and right pillar '+JSON.stringify(r.canvas));check(r.canvas.railPosition==='sticky',label+' accepted sticky rail');}
 else check(r.canvas.railDisplay==='none',label+' mobile reading rail remains hidden');
 if(date==='2026-10-30'){
  check(!!r.householdJoin?.bothPresent&&r.householdJoin.joinedSequence,label+' household mechanism and Assumption Test belong to one authored sequence '+JSON.stringify(r.householdJoin));
   check(r.householdJoin.notebookSeparate,label+' household Notebook remains outside both feature surfaces');
   if(r.householdJoin.sideBySide){
    check(Math.abs(r.householdJoin.gap)<=1&&r.householdJoin.aligned<=2&&r.householdJoin.overlap>=100,label+' household feature surfaces genuinely touch on desktop '+JSON.stringify(r.householdJoin));
    check(r.dividers.some(d=>[d.from,d.to].includes('2026-10-30-household-climate--mechanism-map')&&[d.from,d.to].includes('2026-10-30-household-climate--assumption-test')&&d.axis==='horizontal'),label+' household feature boundary carries shared palette divider');
   }
   check(!!r.movesJoin?.bothPresent&&r.movesJoin.separateChildren,label+' MOVES6 contains two real semantic feature sections');
   check(r.movesJoin.mathBorder===4&&r.movesJoin.testBorder===4&&r.movesJoin.mathBackground!=='rgba(0, 0, 0, 0)'&&r.movesJoin.testBackground!=='rgba(0, 0, 0, 0)',label+' MOVES6 retains distinct bounded family surfaces '+JSON.stringify(r.movesJoin));
   check(r.movesJoin.mathBackground===r.movesJoin.testBackground&&r.movesJoin.groupBackground==='rgba(0, 0, 0, 0)'&&r.movesJoin.mathBorderColor===r.movesJoin.testBorderColor,label+' MOVES6 uses one inherited Estuary accent/wash across both families '+JSON.stringify(r.movesJoin));
   check(Math.abs(r.movesJoin.gap)<=1&&r.movesJoin.overlap>=100,label+' MOVES6 feature surfaces share their actual border '+JSON.stringify(r.movesJoin));
   check(r.dividers.some(d=>[d.from,d.to].includes('2026-10-30-moves6--estimation-desk')&&[d.from,d.to].includes('2026-10-30-moves6--assumption-test')&&d.axis==='horizontal'),label+' MOVES6 palette divider lies on the actual shared feature boundary');
   check(!!r.household,label+' household mixed field exists');
  check(r.household.featurePresent,label+' Assumption Test remains an independent analytical surface');
  check(r.household.featureBg!=='transparent'&&r.household.gap===0,label+' distinct feature surface and research notebook');
  if(r.household.notePresent){
   check(r.household.noteMarginTop===0&&r.household.notebookWrap==='normal'&&r.household.notebookBreak==='normal',label+' notebook receives native flow and natural word wrapping');
   check(r.household.headingOverflow<=2,label+' notebook heading is not clipped '+JSON.stringify(r.household));
   if(width>=650)check(r.household.wordLines===1,label+' complementarity remains unbroken on laptop and desktop');
  }
 }
 for(const l of r.ledger){const cols=l.cells.filter(c=>Math.abs(c.y-l.cells[0].y)<1).length;check(cols===1||cols===3,label+' content-responsive Ledger');check(l.cells.length===3,label+' Ledger parties');check(l.cells.slice(0,cols).every(c=>Math.abs(c.y-l.cells[0].y)<1),label+' Ledger side-by-side');check(Math.abs(l.cells[cols-1].right-l.rect.right)<2,label+' Ledger fills boundary')}
 for(const t of r.timelines){const cols=t.cells.filter(c=>Math.abs(c.y-t.cells[0].y)<1).length;check(cols===1||cols===t.n||t.n%cols===0,label+' content-responsive horizons');check(t.cells.slice(0,cols).every(c=>Math.abs(c.y-t.cells[0].y)<1),label+' timeline row');check(Math.abs(t.cells[cols-1].right-t.rect.right)<2,label+' no unused timeline track')}
 evidence.push({date,...r});}}
 check(new Set(evidence.flatMap(e=>e.surfaceReadings.map(a=>a.palette))).size===8,'all eight authored palettes remain actively assigned');
 const joinedAxes=new Set(evidence.flatMap(e=>e.dividers.map(b=>b.axis)));check(joinedAxes.has('horizontal')&&(!widths.some(w=>w>=1280)||joinedAxes.has('vertical')),'actual responsive shared boundaries have their applicable dividers');
 const identities=new Map(evidence.flatMap(e=>e.features.map(f=>[f.type,f.font+' '+f.size+' '+f.style])));check(identities.size===7,'all seven substantive families inspected');check(new Set(identities.values()).size===7,'distinct substantive feature typography');return {result:'passed',assertions,evidence,identities:Object.fromEntries(identities)};
}
async function navigation({page,goto,setViewport,origin,pressEscape,openIndex=async()=>{const b=await page.locator('#open-archive').boundingBox();assert(b&&b.y>=0,'visible sticky Index control');await page.mouse.click(b.x+b.width/2,b.y+b.height/2)},settleNavigation=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}){let assertions=0;const check=(v,m)=>{assert(v,m);assertions++};await goto(origin+'/weekly-economics-environment/');const archive=await page.locator('#ll-reading-index-data').evaluate(e=>JSON.parse(e.textContent));for(const width of [1440,768,390]){await setViewport({width,height:900});await goto(origin+'/weekly-economics-environment/#insurance');await page.locator('#insurance').waitFor({state:'visible'});await settleNavigation();const before=await page.evaluate(()=>scrollY);await openIndex();check(await page.locator('#ll-reading-index').evaluate(e=>e.open),'Index opens');const dialogBox=await page.locator('#ll-reading-index').boundingBox();const readingCenter=await page.evaluate(()=>{const r=document.body.getBoundingClientRect();return r.left+r.width/2});check(!!dialogBox&&Math.abs(dialogBox.x+dialogBox.width/2-readingCenter)<5,'Reading Index centered in the stable reading viewport at '+width+'px');check(dialogBox.height<=900,'Reading Index fits current viewport');await page.locator('#ll-index-search').fill('');await page.locator('[data-view="edition"]').click();check(await page.locator('.ll-index-group').count()===archive.editions.length,'all published editions');check(await page.locator('.ll-index-reading').count()===archive.editions.reduce((n,e)=>n+e.readings.length,0),'all published reading links');await pressEscape();check(!await page.locator('#ll-reading-index').evaluate(e=>e.open),'Escape closes');check(await page.evaluate(()=>document.activeElement.id==='open-archive'),'focus restored');check(Math.abs(await page.evaluate(()=>scrollY)-before)<3,'reader position preserved '+JSON.stringify({width,before,after:await page.evaluate(()=>scrollY)}));
 await openIndex();await page.locator('[data-view="subject"]').click();check(await page.locator('.ll-index-category').count()>=6,'subject groups');await page.locator('#ll-index-search').fill('coal');check(await page.locator('.ll-index-reading').count()>=2&&await page.locator('.ll-index-reading').evaluateAll(es=>es.every(e=>e.textContent.toLowerCase().includes('coal'))),'accurate coal subject results');await page.locator('#ll-index-search').fill('');await page.locator('[data-view="feature"]').click();check(await page.locator('.ll-index-category').count()===8,'all eight feature families');await page.locator('#ll-index-search').fill('insurance');await page.locator('.ll-index-reading[href="#insurance--estimation-desk"]').click();await page.locator('#insurance--estimation-desk').waitFor({state:'visible'});check(!await page.locator('#ll-reading-index').evaluate(e=>e.open),'feature selection closes Index');check(await page.evaluate(()=>location.hash==='#insurance--estimation-desk'),'precise feature deep link');}
 return {result:'passed',assertions};}
async function deepLinks({page,goto,setViewport,origin,settleNavigation=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}){
 await goto(origin+'/weekly-economics-environment/');const idx=await page.locator('#ll-reading-index-data').evaluate(e=>JSON.parse(e.textContent));let assertions=0;
 for(const width of [1440,390]){await setViewport({width,height:900});for(const ed of idx.editions){for(const rd of ed.readings){for(const anchor of [rd.id,...rd.features.map(f=>f.anchor)]){await goto(origin+'/weekly-economics-environment/#'+anchor);await settleNavigation();const r=await page.locator('[id="'+anchor+'"]').evaluate(e=>({visible:!!e.getClientRects().length,edition:e.closest('.edition')?.dataset.edition,reading:e.closest('.entry')?.id}));assert(r.visible&&r.edition===ed.date&&r.reading===rd.id,'precise archive link '+width+' '+anchor);assertions++;}}}}return {result:'passed',assertions};
}
async function companion({page,goto,setViewport,origin,pressEscape,settleNavigation=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}){
 let assertions=0;const check=(v,m)=>{assert(v,m);assertions++};await setViewport({width:1440,height:1000});await goto(origin+'/weekly-economics-environment/#edition-2026-09-25');await settleNavigation();const slot='[data-id="h-2026-09-25-a"]',button=page.locator(slot+' .heron-perch'),panel=page.locator(slot+' .heron-panel');
 await button.waitFor({state:'visible'});if(await button.getAttribute('aria-expanded')!=='true')await button.click();check(await panel.isVisible(),'Heron opens');await page.locator(slot+' .hp-close').click();await settleNavigation();check(!await panel.isVisible(),'Heron close');await button.press('Enter');await settleNavigation();check(await panel.isVisible(),'Heron keyboard reopens');await pressEscape();await settleNavigation();check(!await panel.isVisible(),'Heron Escape');await button.click();await page.locator(slot+' .hp-dismiss').click();await goto(origin+'/weekly-economics-environment/?companion-persistence=1#edition-2026-09-25');await settleNavigation();check(await page.locator(slot+' .heron-perch').count()===0||!await page.locator(slot+' .heron-perch').isVisible(),'Heron dismissal persists after reload');check(await page.locator('.heron-toggle').count()===0,'retired global toggle absent');return {result:'passed',assertions};
}
async function guideConnection({page,goto,origin,pressEscape}){await goto(origin+'/weekly-economics-environment/#index-feature-estimation-desk');await page.locator('#ll-reading-index[open]').waitFor({state:'visible'});assert(await page.locator('.ll-index-category').count()===1,'Field Guide opens exactly its feature family');assert(await page.locator('[data-feature-family="estimation-desk"]').count()===1,'Field Guide opens Estimation Desk examples');await pressEscape();return {result:'passed',assertions:2};}
module.exports={audit,navigation,deepLinks,companion,guideConnection};
if(require.main===module)(async()=>{const fs=require('fs'),{chromium}=require(process.env.LL_PLAYWRIGHT||'playwright');const browser=await chromium.launch({headless:true,...(process.env.LL_CHROME?{executablePath:process.env.LL_CHROME}:{})});try{const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});const cfg={page,goto:url=>page.goto(url,{waitUntil:'networkidle'}),setViewport:s=>page.setViewportSize(s),origin:process.env.LL_ORIGIN||'http://127.0.0.1:8765',pressEscape:()=>page.keyboard.press('Escape')};await cfg.goto(cfg.origin+'/weekly-economics-environment/');await page.locator('.dn button[data-mode="day"]').click();const result=await audit({...cfg,expectedTheme:'day'});await page.locator('.dn button[data-mode="night"]').click();await page.waitForFunction(()=>document.documentElement.dataset.mode==='night');result.night=await audit({...cfg,expectedTheme:'night'});await page.locator('.dn button[data-mode="day"]').click();await page.waitForFunction(()=>document.documentElement.dataset.mode==='day');// A coordinate click matches a reader's pointer; locator auto-scrolling can move a sticky toolbar before its click handler runs.
result.navigation=await navigation(cfg);result.deepLinks=await deepLinks(cfg);result.companion=await companion(cfg);result.guideConnection=await guideConnection(cfg);
if(process.env.LL_QA_SHOTS_DIR){
 fs.mkdirSync(process.env.LL_QA_SHOTS_DIR,{recursive:true});
 for(const shot of [{name:'macbook-1440',width:1440,height:1000},{name:'mobile-390',width:390,height:844}]){
  await page.setViewportSize({width:shot.width,height:shot.height});
  await page.goto(cfg.origin+'/weekly-economics-environment/#edition-2026-10-30',{waitUntil:'networkidle'});
  const target=page.locator('[id="2026-10-30-household-climate"] .ll-household-policy-robustness');
  await target.waitFor({state:'visible'});
  await target.screenshot({path:process.env.LL_QA_SHOTS_DIR+'/ll-household-'+shot.name+'.png',animations:'disabled'});
  const moves=page.locator('[id="2026-10-30-moves6"] .ll-moves-featuregroup');await moves.waitFor({state:'visible'});
  await moves.screenshot({path:process.env.LL_QA_SHOTS_DIR+'/ll-moves6-'+shot.name+'.png',animations:'disabled'});
 }
 for(const item of [
  {edition:'2026-10-30',reading:'2026-10-30-household-climate',target:'.ll-joined-sequence',name:'ll-joined-sequence-macbook-1440.png'},
  {edition:'2026-10-02',reading:'2026-10-02-storage',target:'.ll-touching-feature-row',name:'ll-true-feature-pair-macbook-1440.png'},
   {edition:'2026-10-30',reading:'2026-10-30-moves6',target:'.ll-moves-featuregroup',name:'ll-moves6-paired-features-macbook-1440.png'}
 ]){
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(cfg.origin+'/weekly-economics-environment/#edition-'+item.edition,{waitUntil:'networkidle'});
  const target=page.locator('[id="'+item.reading+'"] '+item.target).first();
  await target.waitFor({state:'visible'});
  await target.screenshot({path:process.env.LL_QA_SHOTS_DIR+'/'+item.name,animations:'disabled'});
 }
 await page.setViewportSize({width:1710,height:1107});
 await page.goto(cfg.origin+'/weekly-economics-environment/#edition-2026-10-30',{waitUntil:'networkidle'});
 for(const item of [
  {reading:'2026-10-30-household-climate',target:'.ll-joined-sequence',name:'ll-household-joined-macbook-air-1710.png'},
  {reading:'2026-10-30-moves6',target:'.ll-moves-featuregroup',name:'ll-moves6-macbook-air-1710.png'}
 ]){
  const target=page.locator('[id="'+item.reading+'"] '+item.target).first();
  await target.waitFor({state:'visible'});
  await target.screenshot({path:process.env.LL_QA_SHOTS_DIR+'/'+item.name,animations:'disabled'});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(cfg.origin+'/weekly-economics-environment/#edition-2026-10-30',{waitUntil:'networkidle'});
 await page.locator('.dn button[data-mode="night"]').click();
 await page.waitForFunction(()=>document.documentElement.dataset.mode==='night');
 for(const item of [
  {reading:'2026-10-30-household-climate',target:'.ll-joined-sequence',name:'ll-household-joined-night-1440.png'},
  {reading:'2026-10-30-moves6',target:'.ll-moves-featuregroup',name:'ll-moves6-night-1440.png'}
 ]){
  const target=page.locator('[id="'+item.reading+'"] '+item.target).first();
  await target.waitFor({state:'visible'});
  await target.screenshot({path:process.env.LL_QA_SHOTS_DIR+'/'+item.name,animations:'disabled'});
 }
}
if(process.env.LL_QA_JSON)fs.writeFileSync(process.env.LL_QA_JSON,JSON.stringify(result,null,2));console.log(JSON.stringify({result:result.result,assertions:result.assertions,navigation:result.navigation.assertions,cases:result.evidence.length}));}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
