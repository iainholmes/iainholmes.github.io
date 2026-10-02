/* No accounts, analytics or network writes. Reading state belongs to this browser. */
(()=>{'use strict';
const root=document.documentElement, path=location.pathname.replace(/index\.html$/,''), publication=/daily-watchlist|weekly-economics|daily-econ/.test(path);
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
document.querySelectorAll('.pd-imprint').forEach(b=>b.setAttribute('aria-label','Periodicals titles'));
const tools=document.createElement('nav');tools.className='pd-tools';tools.setAttribute('aria-label','Reading controls');
const home=document.createElement('a');home.href='/personal-updates/';home.textContent='Titles';tools.append(home);
function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',fn);tools.append(b);return b}
const archive=publication?button('Index',()=>{const target=document.querySelector('#indexOpen,#open-archive,#archiveLink');if(target)target.click()}):null;
let state=null, saved=null, pending=null, timer=null, engaged=false;
const resume=document.createElement('aside');resume.className='pd-resume';resume.hidden=true;resume.setAttribute('aria-label','Saved progress');
const resumeTitle=document.createElement('strong'),resumeContext=document.createElement('p'),resumeActions=document.createElement('div');
function action(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);resumeActions.append(b)}
action('Resume',()=>{if(!saved||!state)return;engaged=true;clearTimeout(timer);pending={...saved};resume.hidden=true;const hash=state.hash(saved.edition);if(location.hash!==hash)location.hash=hash;else restore()});
action('Start from top',()=>{if(!state)return;engaged=true;clearTimeout(timer);const edition=saved?.edition||state.current;pending={edition,fromTop:true};try{localStorage.removeItem(key())}catch{}saved=null;resume.hidden=true;const hash=state.hash(edition);if(location.hash!==hash)location.hash=hash;else restore()});
resume.append(resumeTitle,resumeContext,resumeActions);
const prev=publication?button('‹ Prev',()=>turn(-1)):null,next=publication?button('Next ›',()=>turn(1)):null;
if(prev)prev.setAttribute('aria-label','Previous edition');if(next)next.setAttribute('aria-label','Next edition');
const share=publication?button('Share',async()=>{const url=new URL(location.href);url.hash=state?state.hash(state.current):location.hash;try{if(navigator.share){await navigator.share({title:document.title,url:url.href});return}if(navigator.clipboard){await navigator.clipboard.writeText(url.href);status.textContent='Link copied.'}else status.textContent='Copy the edition link from the address bar.'}catch(e){if(e.name!=='AbortError')status.textContent='Sharing unavailable. Copy the address bar link.'}}):null;
const status=document.createElement('span');status.className='pd-status';status.setAttribute('role','status');tools.append(status);document.body.append(tools);
const workbook=/daily-econ/.test(path),ll=/weekly-economics/.test(path);
function key(){return 'periodicals:reading:v2:'+path}
function sections(){return [...document.querySelectorAll(ll?'.edition:not([hidden]) .entry,.edition:not([hidden]) .synthesis,.edition:not([hidden]) .knowledge':'.story')].filter(el=>el.id&&el.getClientRects().length)}
function context(el){return el.querySelector('h2,h3')?.textContent.trim()||el.id}
function readingTarget(hash=location.hash){
 if(workbook)return /^#\d{4}-\d{2}-\d{2}\/[^/]+(?:\/solution)?$/.test(hash);
 if(!ll)return /^#\d{4}-\d{2}-\d{2}\/\d{2}$/.test(hash);
 if(/^#(?:cp-ll-|heron-)/.test(hash))return true;
 try{return !!document.getElementById(decodeURIComponent(hash.slice(1)))?.closest('.entry,.synthesis,.knowledge')}catch{return false}
}
function explicitNavigation(hash){if(readingTarget(hash)){engaged=true;resume.hidden=true}}
function restore(){
 if(!pending||!state)return;const p=pending;if(p.edition!==state.current||p.applying)return;p.applying=true;
 // Keep saving suspended until routing, page load and font layout have completed.
 const frame=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(pending!==p)return;
  if(p.edition!==state.current||location.hash!==state.hash(p.edition)){pending=null;return}
  if(p.fromTop){
   if(workbook)state.start?.();else state.full?.();
   const beginning=ll?document.querySelector('.edition:not([hidden])'):null;
   if(beginning)beginning.scrollIntoView({block:'start',behavior:'auto'});else window.scrollTo(0,0);
  }else if(workbook)state.resume?.(p.question);
  else{state.full?.();const el=document.getElementById(p.section);if(el){const top=el.getBoundingClientRect().top+scrollY;window.scrollTo(0,Math.max(0,top+Math.min(p.offset,Math.max(0,el.offsetHeight-120))-120))}}
  clearTimeout(timer);pending=null;resume.hidden=true;
 }));
 const settle=()=>{if(document.fonts)document.fonts.ready.then(frame);else frame()};
 if(document.readyState&&document.readyState!=='complete')addEventListener('load',settle,{once:true});else settle();
}
function turn(dir){if(!state)return;engaged=true;save();pending=null;resume.hidden=true;const i=state.dates.indexOf(state.current),date=state.dates[i+dir];if(date)location.hash=state.hash(date)}
function save(){if(!state||pending||location.hash==='#archive'||document.querySelector('dialog[open]'))return;
if(workbook){const p=state.progress;if(p&&(p.answered>0||p.question>0)&&!p.submitted&&p.answered<p.total){write(key(),{edition:state.current,question:p.question,label:'No. '+String(p.no).padStart(3,'0')+' · Question '+(p.question+1)+' of '+p.total,at:Date.now()})}else if(p&&(p.submitted||p.answered>=p.total)){try{localStorage.removeItem(key())}catch{}}return}
if(ll&&document.body.classList.contains('glance'))return;
const els=sections();if(!els.length)return;const y=scrollY+120,first=els[0].getBoundingClientRect().top+scrollY,end=els.at(-1).getBoundingClientRect().bottom+scrollY;
if(y<first+80)return;engaged=true;resume.hidden=true;if(y>=end-200||scrollY+innerHeight>=document.documentElement.scrollHeight-120){try{localStorage.removeItem(key())}catch{}return}
let el=els[0];for(const x of els){if(x.getBoundingClientRect().top+scrollY<=y)el=x;else break}
const label=ll?(state.title+' · '+context(el)):(state.label+' · Story '+el.id.replace('story-',''));
write(key(),{edition:state.current,section:el.id,offset:Math.max(0,y-(el.getBoundingClientRect().top+scrollY)),label,at:Date.now()})}
function placeResume(){const anchor=document.querySelector(ll?'.edition:not([hidden]) .hero':workbook?'.ps-head':'.edition .front');if(anchor&&!resume.isConnected)anchor.after(resume);else if(anchor&&resume.previousElementSibling!==anchor)anchor.after(resume)}
function update(e){clearTimeout(timer);const previous=state;state=e.detail;explicitNavigation(location.hash);placeResume();if(!pending){saved=read(key());if(workbook&&!previous&&!saved)saved=state.recovery;resume.hidden=engaged||!(saved&&state.dates.includes(saved.edition)&&saved.label&&!(workbook&&(state.progress?.submitted||state.progress?.answered>=state.progress?.total)));resumeTitle.textContent=workbook?'Resume problem set':'Resume reading';resumeContext.textContent=saved?.label||''}
prev.disabled=state.dates.indexOf(state.current)<=0;next.disabled=state.dates.indexOf(state.current)>=state.dates.length-1;
const seenKey='periodicals:seen:v1:'+path,seen=[...new Set([...(read(seenKey)||[]),state.current])];document.querySelectorAll('.ix-item,.archive-entry,.pd-edition-entry').forEach(el=>{const date=el.dataset.date;let badge=el.querySelector('.pd-unread');if(date&&!seen.includes(date)){if(!badge){badge=document.createElement('small');badge.className='pd-unread';badge.textContent=' · Unread';(el.querySelector('.ix-title')||el).append(badge)}}else if(badge)badge.remove()});
write(seenKey,seen.slice(-100));if(workbook&&previous&&previous.current===state.current&&JSON.stringify(previous.progress)!==JSON.stringify(state.progress)){engaged=true;save();resume.hidden=true}restore();images();}
addEventListener('periodicals:edition',update);
// A router may reuse the current edition without announcing a new one.
addEventListener('hashchange',()=>{explicitNavigation(location.hash);if(pending&&location.hash!==state?.hash(pending.edition))pending=null;restore()});
// Collapse recovery before a publication router measures its explicit reading target.
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!e.defaultPrevented&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&a)explicitNavigation(a.hash)},true);
addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(save,400)},{passive:true});addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
// Swipes are limited to the bottom edition controls; the reading surface keeps native scrolling.
let touch=null;tools.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}:null},{passive:true});tools.addEventListener('touchend',e=>{if(!touch||!state)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*2&&Date.now()-touch.t<700)turn(dx<0?1:-1);touch=null},{passive:true});tools.addEventListener('touchcancel',()=>touch=null,{passive:true});
function theme(){const bg=getComputedStyle(document.body).backgroundColor;if(bg&&bg!=='rgba(0, 0, 0, 0)'){let meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=bg}}
new MutationObserver(theme).observe(root,{attributes:true,attributeFilter:['data-mode']});theme();
const dialog=document.createElement('dialog');dialog.className='pd-lightbox';dialog.setAttribute('aria-label','Image viewer');dialog.innerHTML='<header><button type="button" class="pd-zoom">Zoom</button><button type="button" class="pd-close">Close image</button></header><div class="pd-view"></div><p class="pd-caption"></p>';document.body.append(dialog);
let opener=null, scroll=0,oldOverflow='';
function close(){dialog.close()}
dialog.querySelector('.pd-close').onclick=close;dialog.querySelector('.pd-zoom').onclick=()=>{const zoom=dialog.dataset.zoom!=='true';dialog.dataset.zoom=String(zoom);dialog.querySelector('.pd-zoom').textContent=zoom?'Fit image':'Zoom'};
dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;window.scrollTo(0,scroll);if(opener)opener.focus({preventScroll:true})});
function open(el){opener=el;scroll=window.scrollY;oldOverflow=document.body.style.overflow;const clone=el.cloneNode(true);clone.removeAttribute('tabindex');clone.removeAttribute('role');clone.removeAttribute('aria-label');const ids=new Map();clone.querySelectorAll('[id]').forEach(n=>{ids.set(n.id,'pd-view-'+n.id);n.id='pd-view-'+n.id});clone.querySelectorAll('*').forEach(n=>{for(const a of [...n.attributes]){let value=a.value;ids.forEach((to,from)=>{value=value.replaceAll('url(#'+from+')','url(#'+to+')');if(a.name==='aria-labelledby'||a.name==='aria-describedby')value=value.split(' ').map(id=>ids.get(id)||id).join(' ')});if(value!==a.value)n.setAttribute(a.name,value)}});clone.removeAttribute('id');dialog.querySelector('.pd-view').replaceChildren(clone);const figure=el.closest('figure');dialog.querySelector('.pd-caption').textContent=figure?.querySelector('figcaption')?.innerText||el.getAttribute('alt')||el.querySelector('title')?.textContent||'Editorial illustration';dialog.dataset.zoom='false';dialog.querySelector('.pd-zoom').textContent='Zoom';dialog.showModal();document.body.style.overflow='hidden'}
function images(){document.querySelectorAll('main figure img,main figure svg').forEach(el=>{if(el.classList.contains('pd-image')||el.closest('a,button'))return;el.classList.add('pd-image');el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Open image: '+(el.getAttribute('alt')||el.querySelector('title')?.textContent||'editorial illustration'));el.addEventListener('click',()=>open(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(el)}})})}
let dismissTouch=null;const viewerHeader=dialog.querySelector('header');viewerHeader.addEventListener('touchstart',e=>{dismissTouch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});viewerHeader.addEventListener('touchend',e=>{if(dismissTouch){const t=e.changedTouches[0];if(t.clientY-dismissTouch.y>80&&Math.abs(t.clientX-dismissTouch.x)<40)close()}dismissTouch=null},{passive:true});
images();
// Ask the existing edition router to announce the initial state after this module loads.
dispatchEvent(new Event('periodicals:ready'));
if(!publication){resume.remove();for(const [label,href] of [['Commonplace','/personal-updates/commonplace/'],['Handbook','/personal-updates/handbook/']]){const a=document.createElement('a');a.textContent=label;a.href=href;tools.insertBefore(a,status)}}
})();
