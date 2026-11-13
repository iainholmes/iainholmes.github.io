/* Content-sized publication composition. No section heights or spacer tracks. */
(()=>{'use strict';
 const plans={
  coal:{note:['.ll-coal-design','.ll-coal-plate','.ll-coal-notebook'],heron:['.ll-coal-design','.ll-coal-identification','.ll-coal-plate','.ll-coal-notebook']},
  methane:{note:['.ll-policy-counterfactual','.ll-methane-annotation'],heron:['.ll-policy-counterfactual','.ll-methane-annotation']},
  moves:{note:['.ll-moves-context','.ll-interpretation'],heron:['.ll-moves-context','.ll-moves-identity']},
  paper:{note:['.ll-paper-design','.ll-equation-column','.ll-paper-notebook'],heron:['.ll-paper-design','.ll-equation-column','.ll-paper-notebook']}
 };
 const regions='[data-balance]';
 const cache=new WeakMap(),reports=new Map(),homes=new Map();let running=false,scheduled=false,paused=false;
 const visible=e=>!!(e&&e.getClientRects().length&&e.getBoundingClientRect().width);
 const articleHeight=a=>a.getBoundingClientRect().height;
 function balance(region){
  const cs=getComputedStyle(region);if(cs.display!=='grid')return;
  const children=[...region.children].filter(n=>visible(n)&&!n.classList.contains('ll-feature-divider'));if(children.length!==2)return;
  const [a,b]=children,ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
  if(Math.abs(ar.top-br.top)>4||Math.abs(ar.left-br.left)<10)return;
  const width=region.clientWidth,minimum=parseFloat(getComputedStyle(region).fontSize)*16;
  const readable=n=>{const svg=n.querySelector('.ll-desktop-plot');if(!svg||!visible(svg))return minimum;const vb=svg.viewBox.baseVal.width;return Math.max(minimum,vb*11/17+54)};
  const authoredA=parseFloat(cs.getPropertyValue('--initial-share')),authoredB=parseFloat(cs.getPropertyValue('--initial-rest')),authored=authoredA&&authoredB?authoredA/(authoredA+authoredB):null;
  const low=Math.max(.27,readable(a)/width,authored?authored-.12:0),high=Math.min(.73,1-readable(b)/width,authored?authored+.12:1);if(low>=high)return;
  const initialMax=Math.max(ar.height,br.height);let best=(ar.width)/(ar.width+br.width),bestCost=initialMax+.25*Math.abs(ar.height-br.height);
  const tryShare=share=>{region.style.setProperty('--fit-share',share+'fr');region.style.setProperty('--fit-rest',(1-share)+'fr');
   const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
   const overflow=[...region.querySelectorAll('.ll-equation')].reduce((s,n)=>s+Math.max(0,n.scrollWidth-n.clientWidth),0);
   const cost=Math.max(x.height,y.height)+.25*Math.abs(x.height-y.height)+overflow*1000;
   if(Math.max(x.height,y.height)<=initialMax+.5&&cost<bestCost){bestCost=cost;best=share;}
  };
  for(let i=0;i<=8;i++)tryShare(low+(high-low)*i/8);
  const center=best,radius=(high-low)/8;
  for(let i=0;i<=6;i++)tryShare(Math.max(low,Math.min(high,center-radius+radius*i/3)));
  region.style.setProperty('--fit-share',best+'fr');region.style.setProperty('--fit-rest',(1-best)+'fr');
 }
 // The occasional text-light column is vertically recentered rather than
 // stretched or padded with filler; editorial words and figures are untouched.
 function alignQuietColumn(region){
  const columns=[...region.children].filter(n=>visible(n)&&!n.classList.contains('ll-feature-divider'));
  for(const col of columns)col.classList.remove('ll-quiet-centered');
  if(columns.length!==2||getComputedStyle(region).display!=='grid')return;
  const rects=columns.map(n=>n.getBoundingClientRect());
  if(Math.abs(rects[0].left-rects[1].left)<10||Math.abs(rects[0].top-rects[1].top)>4)return;
  const ix=rects[0].height<rects[1].height?0:1,short=columns[ix],tall=columns[1-ix];
  if(rects[1-ix].height-rects[ix].height<120||rects[ix].height/rects[1-ix].height>.66)return;
  if(!short.querySelector('.ll-editorial,.ll-opening')||short.querySelector('.ll-feature,.research-note,.perch'))return;
  if(!tall.querySelector('.ll-feature'))return;
  short.classList.add('ll-quiet-centered');
 }
 function layoutCost(a){let empty=0;for(const r of a.querySelectorAll(regions)){
  const c=[...r.children].filter(n=>visible(n)&&!n.classList.contains('ll-feature-divider'));if(c.length!==2)continue;const x=c[0].getBoundingClientRect(),y=c[1].getBoundingClientRect();
  if(Math.abs(x.top-y.top)<4&&Math.abs(x.left-y.left)>10)empty+=Math.abs(x.height-y.height);
 }const plate=a.querySelector('.ll-paper-plate'),design=a.querySelector('.ll-paper-design');if(visible(plate)&&visible(design)&&getComputedStyle(plate).float==='right')empty+=Math.max(0,plate.getBoundingClientRect().bottom-design.getBoundingClientRect().bottom);return articleHeight(a)+empty*.1;}
 function dock(a,node,selectors){
  if(!visible(node))return null;
  const originalParent=node.parentNode,originalNext=node.nextSibling,startingHeight=articleHeight(a);let bestParent=originalParent,bestNext=originalNext,best=layoutCost(a);
  for(const selector of selectors){const host=a.querySelector(selector),target=host?.querySelector(':scope > .ll-dock-slot')||host;if(!target||target===node||node.contains(target))continue;
   target.append(node);const h=articleHeight(a),cost=layoutCost(a);
   if(h<=startingHeight+.5&&cost<best-.5){best=cost;bestParent=target;bestNext=null;}
  }
  bestParent.insertBefore(node,bestNext&&bestNext.parentNode===bestParent?bestNext:null);
  return {component:node.className,parent:bestParent.className,heightBefore:startingHeight,heightAfter:articleHeight(a)};
 }
 // Retain semantic markers for entirely analytical groups. Physical adjacency
 // is governed by the native primitives, including mixed and partial edges;
 // updateDividers measures those real boundaries independently of these markers.
 const nonFeatures='.ll-editorial,.ll-interpretation,.ll-opening,.ll-evidence-destination,.ll-notebook-unit,.research-note,.perch,.ll-standard-break,.reading-sources';
 const featureOnly=n=>!!n?.querySelector('.ll-feature')&&!n.querySelector(nonFeatures);
 const isHost=n=>(n?.classList.contains('ll-feature-host')||n?.classList.contains('ll-shared-field'))&&featureOnly(n);
 function refreshFeatureJoins(a){
  a.querySelectorAll('.ll-arranged-row').forEach(row=>{
   const cols=[...row.children].filter(n=>n.nodeType===1&&!n.classList.contains('ll-feature-divider'));
   row.classList.toggle('ll-touching-feature-row',cols.length===2&&cols.every(featureOnly));
  });
  for(const parent of [a.querySelector('.ll-reading'),...a.querySelectorAll('.ll-arranged-row>div,.ll-authored-inset,.ll-shared-field')].filter(Boolean)){
   const children=[...parent.children];
   let hasJoin=false;
   for(const child of children)child.classList.remove('ll-join-prev','ll-join-next');
   for(let i=0;i<children.length-1;i++){
    if(isHost(children[i])&&isHost(children[i+1])){
     children[i].classList.add('ll-join-next');children[i+1].classList.add('ll-join-prev');hasJoin=true;
    }
   }
   parent.classList.toggle('ll-touching-feature-stack',hasJoin);
  }
 }
 function updateDividers(a){
  const rect=n=>n.getBoundingClientRect(),intersects=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
  for(const field of a.querySelectorAll('.ll-reading')){
   const features=[...field.querySelectorAll('.ll-feature')].filter(visible);
   const bounds=features.map(rect);
   const corners=new Map(features.map(f=>[f,new Set()])),sides=new Map(features.map(f=>[f,new Set()]));
   const halfWidth=parseFloat(getComputedStyle(field).getPropertyValue('--ll-divider-width'))/2;
   const fr=rect(field),standards=[...field.querySelectorAll(nonFeatures)].filter(n=>visible(n)&&!n.closest('.ll-feature')).map(rect),rules=[];
   for(let i=0;i<features.length;i++)for(let j=i+1;j<features.length;j++){
    const ar=bounds[i],br=bounds[j];let one=ar,two=br,axis=null,overlap=0,start=0,cross=0,strip;
    if(Math.max(ar.top,br.top)<Math.min(ar.bottom,br.bottom)-16&&(ar.right<=br.left+2||br.right<=ar.left+2)){
     if(ar.left>br.left){one=br;two=ar;}const gap=two.left-one.right;if(Math.abs(gap)>1)continue;
     axis='vertical';start=Math.max(one.top,two.top);overlap=Math.min(one.bottom,two.bottom)-start;cross=(one.right+two.left)/2;
     strip={left:cross-halfWidth,right:cross+halfWidth,top:start,bottom:start+overlap};
    }else if(Math.max(ar.left,br.left)<Math.min(ar.right,br.right)-16&&(ar.bottom<=br.top+2||br.bottom<=ar.top+2)){
     if(ar.top>br.top){one=br;two=ar;}const gap=two.top-one.bottom;if(Math.abs(gap)>1)continue;
     axis='horizontal';start=Math.max(one.left,two.left);overlap=Math.min(one.right,two.right)-start;cross=(one.bottom+two.top)/2;
     strip={top:cross-halfWidth,bottom:cross+halfWidth,left:start,right:start+overlap};
    }
    if(!axis||standards.some(r=>intersects(r,strip))||bounds.some((r,k)=>k!==i&&k!==j&&intersects(r,strip)))continue;
    const leading=ar===one?features[i]:features[j],trailing=ar===one?features[j]:features[i];
    if(axis==='vertical'){
     sides.get(leading).add('right');sides.get(trailing).add('left');
     if(Math.abs(start-one.top)<=1)corners.get(leading).add('tr');
     if(Math.abs(start+overlap-one.bottom)<=1)corners.get(leading).add('br');
     if(Math.abs(start-two.top)<=1)corners.get(trailing).add('tl');
     if(Math.abs(start+overlap-two.bottom)<=1)corners.get(trailing).add('bl');
    }else{
     sides.get(leading).add('bottom');sides.get(trailing).add('top');
     if(Math.abs(start-one.left)<=1)corners.get(leading).add('bl');
     if(Math.abs(start+overlap-one.right)<=1)corners.get(leading).add('br');
     if(Math.abs(start-two.left)<=1)corners.get(trailing).add('tl');
     if(Math.abs(start+overlap-two.right)<=1)corners.get(trailing).add('tr');
    }
    const length=overlap*.9,cap=Math.min(24,length*.16),shoulder=cap*.8;
    rules.push({axis,x:axis==='vertical'?cross-fr.left-halfWidth:start-fr.left+overlap*.05,y:axis==='vertical'?start-fr.top+overlap*.05:cross-fr.top-halfWidth,length,cap,shoulder,overlap,from:features[i].id,to:features[j].id});
   }
   for(const [feature,values]of sides){if(values.size)feature.dataset.contactSides=[...values].join(' ');else feature.removeAttribute('data-contact-sides');}
   for(const [feature,values]of corners){if(values.size)feature.dataset.contactCorners=[...values].join(' ');else feature.removeAttribute('data-contact-corners');}
   const old=[...field.querySelectorAll(':scope > .ll-feature-divider')];rules.forEach((r,i)=>{const n=old[i]||document.createElement('span');n.className='ll-feature-divider ll-divider-'+r.axis;n.setAttribute('aria-hidden','true');n.dataset.from=r.from;n.dataset.to=r.to;n.dataset.overlap=String(r.overlap);n.style.cssText='left:'+r.x+'px;top:'+r.y+'px;--divider-length:'+r.length+'px;--divider-cap:'+r.cap+'px;--divider-shoulder:'+r.shoulder+'px';if(!n.parentElement){const sources=field.querySelector(':scope > .reading-sources');if(sources)field.insertBefore(n,sources);else field.append(n)}});old.slice(rules.length).forEach(n=>n.remove());
  }
 }

 function fit(a,force=false){
  if(!visible(a))return;
  const note=a.querySelector('.ll-notebook-unit'),heron=a.querySelector('.ll-heron-dock');
  for(const n of [note,heron])if(n&&!homes.has(n))homes.set(n,{parent:n.parentNode,next:n.nextSibling});
  const open=a.querySelector('.heron-perch[aria-expanded="true"]');
  const signature=[Math.round(a.clientWidth),a.textContent.length,document.documentElement.dataset.mode,!!a.querySelector('.perch'),!!open].join('|');
  // Cached composition choices do not imply cached geometry. Fonts, a quiet
  // column or a neighboring panel can reflow without changing article width.
  if(!force&&cache.get(a)===signature){updateDividers(a);return;}cache.set(a,signature);
  if(open){refreshFeatureJoins(a);updateDividers(a);return;} // The companion stays where the reader opened it.
  const before=articleHeight(a);refreshFeatureJoins(a);a.querySelectorAll(regions).forEach(balance);
  const moves=[],plan=plans[a.dataset.readingComposition]||{note:(a.dataset.dockNote||'').split(';').filter(Boolean),heron:(a.dataset.dockHeron||'').split(';').filter(Boolean)};
  const n=dock(a,note,plan.note);if(n)moves.push(n);
  const h=dock(a,heron,plan.heron);if(h)moves.push(h);
  a.querySelectorAll(regions).forEach(balance);
  a.querySelectorAll(regions).forEach(alignQuietColumn);
  refreshFeatureJoins(a);updateDividers(a);
  const previous=reports.get(a.id),initial=previous&&previous.width===a.clientWidth?Math.max(previous.initialHeight,before):before;
  reports.set(a.id,{id:a.id,width:a.clientWidth,initialHeight:initial,heightBefore:before,heightAfter:articleHeight(a),heightSaved:initial-articleHeight(a),moves,
   sourcesLast:a.querySelector('.ll-reading').lastElementChild.classList.contains('reading-sources')});
  a.dataset.layoutReady='true';
 }
 function run(force=false){if(running||paused)return;running=true;const focused=document.activeElement;try{document.querySelectorAll('.entry[data-reading-composition]').forEach(a=>fit(a,force));}finally{running=false;document.body.dataset.layoutReady='true';if(focused?.isConnected&&visible(focused)&&document.activeElement!==focused)focused.focus({preventScroll:true});}}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;run();});}
 const observer=new MutationObserver(records=>{if(running)return;if(records.some(r=>r.type==='childList'||r.attributeName==='hidden'||r.attributeName==='aria-expanded'||r.attributeName==='data-mode'))schedule();});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-expanded','data-mode']});
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-mode']});
 const resize=new ResizeObserver(schedule);document.querySelectorAll('.entry[data-reading-composition],.entry[data-reading-composition] .ll-feature,.entry[data-reading-composition] [data-balance]').forEach(n=>resize.observe(n));
 document.fonts.ready.then(()=>{run(true);const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t?.closest('.entry')&&t.getClientRects().length)t.scrollIntoView({block:'start',behavior:'instant'});});document.fonts.addEventListener('loadingdone',()=>run(true));addEventListener('resize',schedule);
 window.LLLayout={reflow:()=>{paused=false;run(true)},reset:()=>{paused=true;document.querySelectorAll('.ll-feature-divider').forEach(n=>n.remove());document.querySelectorAll('.ll-touching-feature-row,.ll-touching-feature-stack').forEach(n=>n.classList.remove('ll-touching-feature-row','ll-touching-feature-stack'));document.querySelectorAll('.ll-join-prev,.ll-join-next').forEach(n=>n.classList.remove('ll-join-prev','ll-join-next'));for(const [n,h]of homes){h.parent.insertBefore(n,h.next&&h.next.parentNode===h.parent?h.next:null)}document.querySelectorAll(regions).forEach(r=>{r.style.removeProperty('--fit-share');r.style.removeProperty('--fit-rest')});},report:()=>[...reports.values()]};
})();
