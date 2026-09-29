(function(){
'use strict';
var VERSION=1, KEY='periodicals:commonplace:v1', BACKUP_KEY='periodicals:commonplace:lastExport', RETURN_KEY='periodicals:commonplace:return:v1';
var path=location.pathname, pageMode=document.body&&document.body.hasAttribute('data-commonplace-page');
function now(){return new Date().toISOString()}
function blank(){return {version:VERSION,updatedAt:null,items:{}}}
function load(){
  try{
    var x=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!x||typeof x!=='object')return blank();
    if(!x.items||typeof x.items!=='object')x.items={};
    Object.keys(x.items).forEach(function(id){var it=x.items[id];if(it&&it.publicationKey==='ll'&&it.publication==='Logit & Loblolly')it.publication='Loblolly & Logit'});
    x.version=VERSION;return x;
  }catch(e){return blank()}
}
var STATE=load();
function save(){
  STATE.version=VERSION;STATE.updatedAt=now();
  try{localStorage.setItem(KEY,JSON.stringify(STATE));document.dispatchEvent(new CustomEvent('periodicals:commonplace-change'));return true}
  catch(e){return false}
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
function text(s,n){s=String(s==null?'':s).replace(/\s+/g,' ').trim();return n&&s.length>n?s.slice(0,n).replace(/\s+\S*$/,'')+'…':s}
function canonical(p,h){var u=new URL(p,location.origin);if(h)u.hash=h;return u.href}
function uniq(a){var o=[],seen={};(a||[]).forEach(function(v){v=String(v||'').trim();if(!v)return;var k=v.toLowerCase();if(!seen[k]){seen[k]=1;o.push(v)}});return o}
function threadsFrom(s){return uniq(String(s||'').split(',').map(function(x){return x.trim()}))}
function linksUniq(a){
  var out=[],seen={};(a||[]).forEach(function(x){if(!x||!x.url)return;var k=x.url+'|'+(x.label||'');if(!seen[k]){seen[k]=1;out.push({label:x.label||'Source',url:x.url})}});return out;
}
function get(id){return STATE.items[id]||null}
function snapshotItem(spec){
  return {
    id:spec.id,publication:spec.publication,publicationKey:spec.publicationKey,kind:spec.kind,kindLabel:spec.kindLabel||spec.kind,
    issue:spec.issue||'',title:spec.title||'Untitled',excerpt:spec.excerpt||'',snapshot:spec.snapshot||spec.excerpt||'',
    context:spec.context||'',contentHTML:spec.contentHTML||'',media:spec.media||'',sourceUrl:spec.sourceUrl,sourceAnchor:spec.sourceAnchor||'',sourceLabel:spec.sourceLabel||'Return to passage',
    links:linksUniq(spec.links||[]),threads:[],rating:0,note:'',createdAt:now(),modifiedAt:now()
  };
}
function scheduleThreadReturn(item){
  if(!item.threads||!item.threads.length)return;
  var last={};try{last=JSON.parse(localStorage.getItem(RETURN_KEY)||'{}')||{}}catch(e){}
  if(last.shownAt&&Date.now()-Date.parse(last.shownAt)<14*864e5)return;
  var candidates=Object.keys(STATE.items).map(function(k){return STATE.items[k]}).filter(function(x){
    return x.id!==item.id&&x.threads&&x.threads.some(function(t){return item.threads.map(function(z){return z.toLowerCase()}).indexOf(t.toLowerCase())>=0});
  }).sort(function(a,b){return (b.rating||0)-(a.rating||0)||Date.parse(a.createdAt)-Date.parse(b.createdAt)});
  if(candidates[0]){
    try{localStorage.setItem(RETURN_KEY,JSON.stringify({itemId:candidates[0].id,reason:'thread',thread:item.threads[0],queuedAt:now(),shownAt:last.shownAt||null}))}catch(e){}
  }
}
function keep(spec){
  var item=get(spec.id);
  if(!item){item=snapshotItem(spec);STATE.items[item.id]=item}
  else{
    item.publication=spec.publication||item.publication;item.kind=spec.kind||item.kind;item.kindLabel=spec.kindLabel||item.kindLabel;
    item.issue=spec.issue||item.issue;item.title=spec.title||item.title;item.excerpt=spec.excerpt||item.excerpt;
    item.sourceUrl=spec.sourceUrl||item.sourceUrl;item.sourceAnchor=spec.sourceAnchor||item.sourceAnchor;item.sourceLabel=spec.sourceLabel||item.sourceLabel;
    item.links=linksUniq((item.links||[]).concat(spec.links||[]));
    if(!item.snapshot&&spec.snapshot)item.snapshot=spec.snapshot;if(!item.media&&spec.media)item.media=spec.media;
    if(spec.context)item.context=spec.context;if(!item.contentHTML&&spec.contentHTML)item.contentHTML=spec.contentHTML;
    item.modifiedAt=now();
  }
  save();return item;
}
function remove(id){if(STATE.items[id]){delete STATE.items[id];save()}}
function injectStyles(){
  if(document.getElementById('commonplace-quiet-style'))return;
  var s=document.createElement('style');s.id='commonplace-quiet-style';s.textContent=
  '.cp-keepable{position:relative}.mast-folio .cp-keep-toggle.cp-inline{display:inline-block;margin:11px 0 0 auto}.cp-keep-toggle{position:absolute;z-index:6;right:8px;top:8px;border:0;border-bottom:1px solid currentColor;background:color-mix(in srgb,var(--paper,#fff) 88%,transparent);color:inherit;padding:2px 1px;font:500 10px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;opacity:0;pointer-events:none;transition:opacity .16s ease,color .16s ease}.cp-keep-toggle.cp-inline{position:static;margin-left:auto;background:none;flex:0 0 auto}.q-head .cp-keep-toggle.cp-inline,.sol-head .cp-keep-toggle.cp-inline{margin-left:8px;opacity:.38;pointer-events:auto}.q-head .cp-keep-toggle.cp-inline:hover,.q-head .cp-keep-toggle.cp-inline:focus-visible,.sol-head .cp-keep-toggle.cp-inline:hover,.sol-head .cp-keep-toggle.cp-inline:focus-visible{opacity:1}.cp-keepable:hover .cp-keep-toggle,.cp-keepable:focus-within .cp-keep-toggle,.cp-keep-toggle:focus-visible{opacity:.72;pointer-events:auto}.cp-kept .cp-keep-toggle{font-style:italic}.cp-keep-toggle:hover,.cp-keep-toggle:focus-visible{opacity:1}.cp-anchor{scroll-margin-top:92px}.cp-editor{width:min(520px,calc(100% - 28px));padding:0;border:1px solid currentColor;background:var(--cp-dialog-bg,var(--paper,#f4efe5));color:var(--cp-dialog-ink,var(--ink,#181511));box-shadow:0 28px 90px rgba(0,0,0,.35)}.cp-editor::backdrop{background:rgba(0,0,0,.45)}.cp-editor form{padding:24px}.cp-editor h2{margin:0 0 6px;font:500 26px/1.05 Georgia,serif}.cp-editor .cp-source{margin:0 0 20px;opacity:.65;font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.cp-editor label{display:block;margin:15px 0 5px;font:600 10px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase}.cp-editor input[type=text],.cp-editor textarea{width:100%;border:0;border-bottom:1px solid currentColor;background:transparent;color:inherit;padding:8px 0;font:inherit}.cp-editor textarea{min-height:92px;resize:vertical}.cp-editor .cp-rating{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.cp-editor input[type=range]{width:100%}.cp-editor .cp-actions{display:flex;gap:12px;align-items:center;margin-top:22px;padding-top:14px;border-top:1px solid color-mix(in srgb,currentColor 24%,transparent)}.cp-editor button{background:none;border:0;border-bottom:1px solid currentColor;color:inherit;padding:4px 0;font:600 11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em}.cp-editor .cp-remove{margin-left:auto;opacity:.62}.cp-editor .cp-status{min-height:1.4em;margin:10px 0 0;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;opacity:.7}@media(hover:none){.cp-keep-toggle{clip:rect(0 0 0 0);clip-path:inset(50%);width:1px;height:1px;overflow:hidden;padding:0;white-space:nowrap}.cp-keep-toggle:focus-visible{clip:auto;clip-path:none;width:auto;height:auto;overflow:visible;padding:2px 1px}.q-head .cp-keep-toggle.cp-inline,.sol-head .cp-keep-toggle.cp-inline{clip:auto;clip-path:none;width:auto;height:auto;overflow:visible;padding:2px 1px;white-space:normal;opacity:.48}}@media(prefers-reduced-motion:reduce){.cp-keep-toggle{transition:none}}';
  document.head.appendChild(s);
}
var EDITOR=null,ACTIVE=null;
function ensureEditor(){
  if(EDITOR)return EDITOR;injectStyles();
  var d=document.createElement('dialog');d.className='cp-editor';d.innerHTML=
    '<form method="dialog"><h2>Keep this</h2><p class="cp-source"></p><label for="cpThreads">Threads</label><input id="cpThreads" type="text" autocomplete="off" placeholder="Names separated by commas"><label for="cpRating">Importance</label><div class="cp-rating"><input id="cpRating" type="range" min="0" max="5" step="1" value="0"><output for="cpRating">0 / 5</output></div><label for="cpNote">Your note</label><textarea id="cpNote" maxlength="1200" placeholder="A line or two, if you want it."></textarea><div class="cp-actions"><button type="button" class="cp-save">Save changes</button><button type="button" class="cp-close">Close</button><button type="button" class="cp-remove">Remove</button></div><p class="cp-status" role="status"></p></form>';
  document.body.appendChild(d);EDITOR=d;
  var r=d.querySelector('#cpRating'),o=d.querySelector('output');r.addEventListener('input',function(){o.textContent=r.value+' / 5'});
  d.querySelector('.cp-close').addEventListener('click',function(){d.close()});
  d.querySelector('.cp-save').addEventListener('click',function(){
    if(!ACTIVE)return;var item=get(ACTIVE.id)||keep(ACTIVE);
    item.threads=threadsFrom(d.querySelector('#cpThreads').value);item.rating=+r.value||0;item.note=d.querySelector('#cpNote').value.trim();item.modifiedAt=now();
    var ok=save();scheduleThreadReturn(item);refreshButtons();
    d.querySelector('.cp-status').textContent=ok?'Saved in this browser.':'Browser storage is full or unavailable; export what you can before leaving.';
    if(ok)setTimeout(function(){if(d.open)d.close()},420);
  });
  d.querySelector('.cp-remove').addEventListener('click',function(){if(!ACTIVE)return;remove(ACTIVE.id);refreshButtons();d.close()});
  return d;
}
function openEditor(spec){
  ACTIVE=spec;var item=get(spec.id)||keep(spec),d=ensureEditor();
  d.querySelector('h2').textContent=item.title;d.querySelector('.cp-source').textContent=item.publication+' · '+(item.kindLabel||item.kind);
  d.querySelector('#cpThreads').value=(item.threads||[]).join(', ');d.querySelector('#cpRating').value=item.rating||0;
  d.querySelector('output').textContent=(item.rating||0)+' / 5';d.querySelector('#cpNote').value=item.note||'';d.querySelector('.cp-status').textContent='';
  d.querySelector('.cp-remove').hidden=!get(spec.id);if(!d.open)d.showModal();setTimeout(function(){d.querySelector('#cpThreads').focus()},0);
}
var BOUND=[];
function refreshButtons(){BOUND.forEach(function(x){var kept=!!get(x.spec.id);x.root.classList.toggle('cp-kept',kept);x.btn.textContent=kept?'kept':'keep';x.btn.setAttribute('aria-label',(kept?'Edit kept item: ':'Keep ')+x.spec.title)})}
function register(root,spec,opt){
  if(!root||!spec||!spec.id)return;if(root.getAttribute('data-cp-bound')===spec.id)return;
  var parts=contentParts(root),full=sourceObject(document,spec);
  if(parts.context){spec.context=parts.context;spec.excerpt=parts.excerpt}
  if(full)spec.contentHTML=cleanContent(full.html,spec.sourceUrl,'cp-saved-');
  root.setAttribute('data-cp-bound',spec.id);root.classList.add('cp-keepable');if(spec.anchorId){root.classList.add('cp-anchor');if(!root.id)root.id=spec.anchorId}
  var mount=opt&&opt.mount?opt.mount:root,btn=document.createElement('button');btn.type='button';btn.className='cp-keep-toggle'+(opt&&opt.inline?' cp-inline':'');
  btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(get(spec.id))openEditor(spec);else{keep(spec);refreshButtons()}});
  mount.appendChild(btn);BOUND.push({root:root,btn:btn,spec:spec});
  var timer=0,sx=0,sy=0,held=false;
  root.addEventListener('pointerdown',function(e){if(e.pointerType!=='touch'||e.target.closest('a,button,input,textarea,select'))return;sx=e.clientX;sy=e.clientY;held=false;timer=setTimeout(function(){held=true;if(!get(spec.id))keep(spec);refreshButtons();openEditor(spec)},620)});
  root.addEventListener('pointermove',function(e){if(timer&&Math.hypot(e.clientX-sx,e.clientY-sy)>12){clearTimeout(timer);timer=0}});
  ['pointerup','pointercancel'].forEach(function(k){root.addEventListener(k,function(){if(timer){clearTimeout(timer);timer=0}})});
  refreshButtons();
}
function json(id){try{return JSON.parse(document.getElementById(id).textContent)}catch(e){return null}}
function revealHash(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;setTimeout(function(){var t=document.getElementById(id);if(t){t.scrollIntoView({block:'center'});if(id.indexOf('heron-')===0){var b=t.querySelector('.heron-perch');if(b){b.hidden=false;if(b.getAttribute('aria-expanded')!=='true')b.click()}}}},30)}
function scanFB(){
  var data=json('briefing-data');if(!data)return;var tm=document.querySelector('.mast-vn time[datetime]');if(!tm)return;
  var date=tm.getAttribute('datetime'),ed=(data.editions||[]).filter(function(x){return x.date===date})[0];if(!ed)return;
  var mast=document.querySelector('.edition .mast');if(mast){var folioMount=mast.querySelector('.mast-folio')||mast;register(mast,{id:'fb:'+date+':issue',publication:'Field Brief',publicationKey:'fb',kind:'issue',kindLabel:'Issue',issue:date,title:ed.issueTitle||'Daily Briefing',excerpt:ed.deck||'',snapshot:text((ed.deck||'')+' '+ed.stories.map(function(s){return s.title}).join(' · '),7000),sourceUrl:canonical('/daily-watchlist-5/','#'+date),sourceAnchor:'#'+date,links:[]},{mount:folioMount,inline:true})}
  document.querySelectorAll('.edition .story').forEach(function(el){
    var num=text(el.querySelector('.s-no')&&el.querySelector('.s-no').textContent),s=(ed.stories||[]).filter(function(x){return x.number===num})[0];if(!s)return;
    var links=(s.sources||[]).map(function(x){return {label:x[0],url:x[1]}});
    register(el,{id:'fb:'+date+':story:'+num,publication:'Field Brief',publicationKey:'fb',kind:'story',kindLabel:'Story',issue:date,title:s.title,excerpt:text((s.summary||[]).join(' '),360),snapshot:text(el.innerText,7000),sourceUrl:canonical('/daily-watchlist-5/','#'+date+'/'+num),sourceAnchor:'#'+date+'/'+num,links:links});
  });
}
function scanLL(){
  var reg=json('field-register')||{entries:[]},compan=json('companion-data')||{};
  document.querySelectorAll('[data-edition]').forEach(function(ed){
    var date=ed.dataset.edition,hero=ed.querySelector('.hero')||ed;
    register(hero,{id:'ll:'+date+':issue',publication:'Loblolly & Logit',publicationKey:'ll',kind:'issue',kindLabel:'Issue',issue:date,title:ed.dataset.title||'Loblolly & Logit',excerpt:text((hero.querySelector('.hero-deck')||hero).textContent,360),snapshot:text(ed.innerText,9000),sourceUrl:canonical('/weekly-economics-environment/','#'+ed.id),sourceAnchor:'#'+ed.id,links:[]});
    ed.querySelectorAll('.entry').forEach(function(a){
      var aid=a.id;if(!aid)return;var h=a.querySelector('h2'),links=[].slice.call(a.querySelectorAll('.sources a,.research-note a')).map(function(x){return {label:text(x.textContent,100),url:x.href}});var related=(reg.entries||[]).filter(function(x){return x.issue===date&&x.related===aid});related.forEach(function(x){links.push({label:'Field Register: '+x.name,url:canonical('/weekly-economics-environment/','#field-register-'+String(x.no).padStart(3,'0'))})});if(ed.querySelector('#notebook'))links.push({label:'Methods & concepts notebook',url:canonical('/weekly-economics-environment/','#notebook')});
      register(a,{id:'ll:'+date+':article:'+aid,publication:'Loblolly & Logit',publicationKey:'ll',kind:'article',kindLabel:'Article',issue:date,title:text(h&&h.textContent)||aid,excerpt:text((a.querySelector('.finding')||a).textContent,420),snapshot:text(a.innerText,9000),sourceUrl:canonical('/weekly-economics-environment/','#'+aid),sourceAnchor:'#'+aid,links:links});
      a.querySelectorAll('figure.figure').forEach(function(fig,i){var anchor=fig.getAttribute('data-keep-id')||('cp-ll-'+date+'-figure-'+aid+'-'+(i+1));fig.setAttribute('data-keep-id',anchor);fig.id=anchor;
        var cap=fig.querySelector('figcaption');register(fig,{id:'ll:'+date+':figure:'+aid+':'+(i+1),publication:'Loblolly & Logit',publicationKey:'ll',kind:'figure',kindLabel:'Figure',issue:date,title:text(cap&&cap.textContent,180)||('Figure · '+text(h&&h.textContent,120)),excerpt:text(cap&&cap.textContent,360),snapshot:text(fig.innerText,2200),media:fig.outerHTML.length<30000?fig.outerHTML:'',sourceUrl:canonical('/weekly-economics-environment/','#'+anchor),sourceAnchor:'#'+anchor,links:[]});
      });
      a.querySelectorAll('.research-note').forEach(function(note,i){var anchor=note.getAttribute('data-keep-id')||('cp-ll-'+date+'-research-note-'+aid+'-'+(i+1));note.setAttribute('data-keep-id',anchor);note.id=anchor;
        register(note,{id:'ll:'+date+':research-note:'+aid+':'+(i+1),publication:'Loblolly & Logit',publicationKey:'ll',kind:'research-note',kindLabel:'Research note',issue:date,title:'Research note · '+text(h&&h.textContent,140),excerpt:text(note.textContent,420),snapshot:text(note.innerText,4200),sourceUrl:canonical('/weekly-economics-environment/','#'+anchor),sourceAnchor:'#'+anchor,links:[].slice.call(note.querySelectorAll('a')).map(function(x){return {label:text(x.textContent,100),url:x.href}})});
      });
    });
  });
  document.querySelectorAll('.rg-row[data-reg-no]').forEach(function(row){var n=+row.dataset.regNo,e=(reg.entries||[]).filter(function(x){return x.no===n})[0];if(!e)return;var ls=[e.source];if(e.related)ls.push({label:'Related article',url:canonical('/weekly-economics-environment/','#'+e.related)});register(row,{id:'ll:register:'+n,publication:'Loblolly & Logit',publicationKey:'ll',kind:'register',kindLabel:'Field Register entry',issue:e.issue,title:e.name,excerpt:e.does,snapshot:text(e.does+' '+e.economics,5000),sourceUrl:canonical('/weekly-economics-environment/','#field-register-'+String(n).padStart(3,'0')),sourceAnchor:'#field-register-'+String(n).padStart(3,'0'),links:ls});});
  document.querySelectorAll('.perch[data-heron-id]').forEach(function(slot){var hid=slot.dataset.heronId,e=null,date='';Object.keys(compan).some(function(d){var a=(compan[d].appearances||[]).filter(function(x){return x.id===hid})[0];if(a){e=a;date=d;return true}return false});if(!e)return;
    var panel=slot.querySelector('.heron-panel'),actions=slot.querySelector('.hp-actions');
    register(slot,{id:'ll:'+date+':heron:'+hid,publication:'Loblolly & Logit',publicationKey:'ll',kind:'heron-note',kindLabel:'Heron note',issue:date,title:e.title,excerpt:e.text,snapshot:e.text,sourceUrl:canonical('/weekly-economics-environment/','#heron-'+hid),sourceAnchor:'#heron-'+hid,links:e.see?[{label:e.see.label||'Methods',url:canonical('/weekly-economics-environment/',e.see.href)}]:[]},{mount:actions||slot,inline:!!actions});
  });
  revealHash();
}
function scanWB(){
  var data=json('challenge-data');if(!data)return;var tm=document.querySelector('.ps-facts time[datetime]');if(!tm)return;var date=tm.getAttribute('datetime'),ed=(data.editions||[]).filter(function(x){return x.date===date})[0];if(!ed)return;
  var head=document.querySelector('.ps-head');if(head)register(head,{id:'wb:'+date+':issue',publication:'The Workbook',publicationKey:'wb',kind:'issue',kindLabel:'Set',issue:date,title:'The Workbook Nᵒ. '+String(ed.no).padStart(3,'0'),excerpt:ed.questions.length+' questions · about '+ed.minutes+' min',snapshot:ed.questions.map(function(q){return text(q.stem.replace(/<[^>]*>/g,' '),300)}).join('\n'),sourceUrl:canonical('/daily-econ-challenge/','#'+date),sourceAnchor:'#'+date,links:[]});
  var qEl=document.querySelector('.q');if(qEl){var n=parseInt(text(qEl.querySelector('.q-num')&&qEl.querySelector('.q-num').textContent).replace(/\D/g,''),10)||1,q=ed.questions[n-1];if(q){var mount=qEl.querySelector('.q-head')||qEl;
    register(qEl,{id:'wb:'+date+':question:'+q.id,publication:'The Workbook',publicationKey:'wb',kind:'question',kindLabel:'Question',issue:date,title:'Question '+n+' · '+q.field,excerpt:text(q.stem.replace(/<[^>]*>/g,' '),420),snapshot:text(q.stem.replace(/<[^>]*>/g,' ')+'\n'+q.options.map(function(o,i){return String.fromCharCode(65+i)+'. '+o.replace(/<[^>]*>/g,' ')}).join('\n'),7000),sourceUrl:canonical('/daily-econ-challenge/','#'+date+'/'+q.id),sourceAnchor:'#'+date+'/'+q.id,links:(Array.isArray(q.refs)?q.refs:[]).map(function(x){return {label:x[0]||'Reference',url:x[1]||x}})},{mount:mount,inline:true});}}
  document.querySelectorAll('.sol').forEach(function(sol,i){var q=ed.questions[i];if(!q)return;var mount=sol.querySelector('.sol-head')||sol;
    register(sol,{id:'wb:'+date+':solution:'+q.id,publication:'The Workbook',publicationKey:'wb',kind:'solution',kindLabel:'Worked solution',issue:date,title:'Solution · Question '+(i+1)+' · '+q.field,excerpt:text(q.explanation,420),snapshot:text(sol.innerText,7000),sourceUrl:canonical('/daily-econ-challenge/','#'+date+'/'+q.id+'/solution'),sourceAnchor:'#'+date+'/'+q.id+'/solution',links:(Array.isArray(q.refs)?q.refs:[]).map(function(x){return {label:x[0]||'Reference',url:x[1]||x}})},{mount:mount,inline:true});
  });
  revealHash();
}
function scan(){if(pageMode){renderPage();return}if(path.indexOf('/daily-watchlist-5/')>=0)scanFB();else if(path.indexOf('/weekly-economics-environment/')>=0)scanLL();else if(path.indexOf('/daily-econ-challenge/')>=0)scanWB()}
var scanTimer=0;function scheduleScan(){clearTimeout(scanTimer);scanTimer=setTimeout(scan,40)}
function injectPageDialog(){injectStyles()}
function formatDate(s){try{return new Date(s).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}catch(e){return s}}
function relatedCount(item){if(!item.threads||!item.threads.length)return 0;return Object.keys(STATE.items).map(function(k){return STATE.items[k]}).filter(function(x){return x.id!==item.id&&x.threads&&x.threads.some(function(t){return item.threads.map(function(y){return y.toLowerCase()}).indexOf(t.toLowerCase())>=0})}).length}
function chooseReturn(){
  var meta={};try{meta=JSON.parse(localStorage.getItem(RETURN_KEY)||'{}')||{}}catch(e){}
  var due=!meta.shownAt||Date.now()-Date.parse(meta.shownAt)>14*864e5, item=meta.itemId&&STATE.items[meta.itemId];if(due&&item){meta.shownAt=now();try{localStorage.setItem(RETURN_KEY,JSON.stringify(meta))}catch(e){};return {item:item,reason:meta.reason,thread:meta.thread}}
  var old=Object.keys(STATE.items).map(function(k){return STATE.items[k]}).filter(function(x){return (x.rating||0)>=4&&Date.now()-Date.parse(x.createdAt)>30*864e5}).sort(function(a,b){return (b.rating||0)-(a.rating||0)||Date.parse(a.createdAt)-Date.parse(b.createdAt)});
  if(due&&old[0]){try{localStorage.setItem(RETURN_KEY,JSON.stringify({itemId:old[0].id,reason:'importance',shownAt:now()}))}catch(e){};return {item:old[0],reason:'importance'}}
  return null;
}
function threadList(items){var a=[];items.forEach(function(x){a=a.concat(x.threads||[])});return uniq(a).sort(function(a,b){return a.localeCompare(b)})}
// Content is read from inert source documents; publication scripts never run here.
var CONTEXT_SELECTOR='[data-cp-context],.eyebrow,.kicker,.deck,.section-label,.annotation-title,.exhibit-cap';
function blockText(root){
  var c=root.cloneNode(true);
  c.querySelectorAll('button,script,style,.cp-keep-toggle,.hp-actions').forEach(function(n){n.remove()});
  c.querySelectorAll('p,div,h1,h2,h3,h4,li,dt,dd,figcaption,section,article,aside,br').forEach(function(n){n.appendChild(document.createTextNode('\n'))});
  return c.textContent.replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
function contentParts(root){
  var c=root.cloneNode(true),label=c.firstElementChild,context='';
  if(label&&label.matches(CONTEXT_SELECTOR)){context=text(label.textContent);label.remove()}
  return {context:context,excerpt:text(blockText(c.matches('figure')&&c.querySelector('figcaption')?c.querySelector('figcaption'):c),420)};
}
function summaryParts(x){
  var p=SUMMARY[x.id]||{context:x.context||x.deck||x.contextLabel||'',excerpt:x.excerpt||''};
  // Old exports have no structural fields. Only split a known label, never guess a sentence boundary.
  if(!p.context&&x.kind==='research-note'&&/^In the research notebook/.test(p.excerpt))p={context:'In the research notebook',excerpt:p.excerpt.slice(24).trim()};
  if(p.context&&p.excerpt.indexOf(p.context)===0)p={context:p.context,excerpt:p.excerpt.slice(p.context.length).trim()};
  return p;
}
function safeURL(value,base){try{var u=new URL(value,base||location.href);return /^(https?:|mailto:)$/.test(u.protocol)?u.href:''}catch(e){return ''}}
function cleanContent(html,base,prefix){
  var t=document.createElement('template');t.innerHTML=html||'';
  t.content.querySelectorAll('script,style,link,meta,base,iframe,object,embed,form,input,button,textarea,select,foreignObject,animate,animateTransform,set,.cp-keep-toggle,.hp-actions,.heron-perch,.contents,.mode-note').forEach(function(n){n.remove()});
  var ids={};t.content.querySelectorAll('[id]').forEach(function(n){ids[n.id]=prefix+n.id;n.id=ids[n.id]});
  t.content.querySelectorAll('*').forEach(function(n){
    [].slice.call(n.attributes).forEach(function(a){
      var k=a.name.toLowerCase(),v=a.value;
      if(/^on/.test(k)||['srcdoc','srcset','autofocus','tabindex','hidden','contenteditable','formaction','action','is','data-cp-bound'].indexOf(k)>=0)n.removeAttribute(a.name);
      else if(k==='href'||k==='xlink:href'||k==='src'){
        if(v[0]==='#'&&ids[v.slice(1)])n.setAttribute(a.name,'#'+ids[v.slice(1)]);
        else {var u=safeURL(v,base);if(u&&(k!=='xlink:href'&&n.localName!=='use'))n.setAttribute(a.name,u);else n.removeAttribute(a.name)}
      }else if(k==='style'){
        var css=n.style,kept=[];['width','height','color','background','background-color','fill','stroke','font-family','font-size','font-weight','text-align','opacity','overflow-x'].forEach(function(p){var v=css.getPropertyValue(p);if(v&&!/url\s*\(|expression|@|\\/i.test(v))kept.push(p+':'+v)});n.setAttribute('style',kept.join(';'));
      }else if(/url\s*\(/i.test(v))n.setAttribute(a.name,v.replace(/url\(\s*#([^\s)]+)\s*\)/g,function(_,id){return 'url(#'+(ids[id]||id)+')'}));
      else if(k==='aria-labelledby'||k==='aria-describedby')n.setAttribute(k,v.split(/\s+/).map(function(id){return ids[id]||id}).join(' '));
    });
    if(n.localName==='a'){n.setAttribute('target','_blank');n.setAttribute('rel','noopener noreferrer')}
    if(n.localName==='details')n.open=true;
  });
  return t.innerHTML;
}
function sourceJSON(doc,id){try{return JSON.parse(doc.getElementById(id).textContent)}catch(e){return null}}
function paragraphs(a){return (a||[]).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')}
function sourceLinks(a){return (a||[]).map(function(l){return '<p><a href="'+esc(l[1])+'">'+esc(l[0])+' ↗</a></p>'}).join('')}
function sourceObject(doc,x){
  var parts=x.id.split(':'),kind=x.kind,ed,node,html='';
  if(x.publicationKey==='ll'){
    ed=[].slice.call(doc.querySelectorAll('[data-edition]')).filter(function(n){return n.dataset.edition===x.issue})[0];
    if(kind==='register'){var reg=sourceJSON(doc,'field-register');var r=reg&&(reg.entries||[]).filter(function(e){return String(e.no)===parts[2]})[0];if(r)html=paragraphs([r.role,r.org,r.place])+(r.image&&r.image.src?'<figure><img src="'+esc(r.image.src)+'" alt="'+esc(r.image.alt||r.name)+'"><figcaption>'+esc([r.image.credit,r.image.license].filter(Boolean).join(' · '))+'</figcaption></figure>':'')+paragraphs([r.does])+'<h3>Where economics enters</h3>'+paragraphs([r.economics])+(r.source?sourceLinks([[r.source.label,r.source.url]]):'')+(r.related?sourceLinks([['Related article',canonical('/weekly-economics-environment/','#'+r.related)]]):'')}
    else if(kind==='heron-note'){var cd=sourceJSON(doc,'companion-data')||{},a=((cd[x.issue]||{}).appearances||[]).filter(function(a){return a.id===parts.slice(3).join(':')})[0];if(a)html=paragraphs([a.text])+readerDiagram(a.diagram)+(a.see?sourceLinks([[a.see.label||'Methods',canonical('/weekly-economics-environment/',a.see.href)]]):'')}
    else if(ed){
      if(kind==='issue')node=ed;
      else {var article=[].slice.call(ed.querySelectorAll('.entry')).filter(function(n){return n.id===parts[3]})[0];if(article){if(kind==='article')node=article;else if(kind==='research-note'||kind==='figure')node=article.querySelectorAll(kind==='figure'?'figure.figure':'.research-note')[+parts[4]-1]}}
    }
  }else if(x.publicationKey==='fb'){
    var fb=sourceJSON(doc,'briefing-data');ed=fb&&(fb.editions||[]).filter(function(e){return e.date===x.issue})[0];
    if(ed){var stories=kind==='issue'?ed.stories:ed.stories.filter(function(s){return s.number===parts[3]});if(stories.length)html=(kind==='issue'?paragraphs([ed.deck]):'')+stories.map(function(s){return '<section>'+(kind==='issue'?'<h2>'+esc(s.title)+'</h2>':'')+paragraphs(s.summary)+'<h3>Why it matters</h3>'+paragraphs([s.why])+'<dl>'+(s.implications||[]).map(function(i){return '<dt>'+esc(i[0])+'</dt><dd>'+esc(i[1])+'</dd>'}).join('')+'</dl>'+sourceLinks(s.sources)+'</section>'}).join('')}
  }else if(x.publicationKey==='wb'){
    var wb=sourceJSON(doc,'challenge-data');ed=wb&&(wb.editions||[]).filter(function(e){return e.date===x.issue})[0];
    if(ed){var qs=kind==='issue'?ed.questions:ed.questions.filter(function(q){return q.id===parts.slice(3).join(':')});if(qs.length)html=qs.map(function(q,i){return '<section>'+(kind==='issue'?'<h2>Question '+(i+1)+' · '+esc(q.field)+'</h2>':'')+'<div>'+q.stem+'</div>'+readerExhibit(q.exhibit)+(q.after||'')+'<ol type="A">'+q.options.map(function(o){return '<li>'+o+'</li>'}).join('')+'</ol>'+(kind==='solution'?'<h3>Correct answer: '+(q.correct||[]).map(function(n){return String.fromCharCode(65+n)}).join(', ')+'</h3><div>'+q.explanation+'</div><div>'+q.refs+'</div>':'')+'</section>'}).join('')}
  }
  if(node)return {html:node.outerHTML,parts:contentParts(node)};
  return html?{html:html}:null;
}
var SOURCE_DOCS={},SUMMARY={},SUMMARY_REQUESTED={},RESULT_IDS=[];
function sourceDocument(x){
  var routes={ll:'/weekly-economics-environment/',fb:'/daily-watchlist-5/',wb:'/daily-econ-challenge/'},route=routes[x.publicationKey];
  if(!route)return Promise.reject(new Error('No source adapter'));
  if(!SOURCE_DOCS[route]){
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort()},10000);
    SOURCE_DOCS[route]=fetch(route,{signal:controller.signal}).then(function(r){if(!r.ok)throw new Error('Source unavailable');return r.text()}).then(function(s){return new DOMParser().parseFromString(s,'text/html')}).catch(function(e){delete SOURCE_DOCS[route];throw e}).finally(function(){clearTimeout(timer)});
  }
  return SOURCE_DOCS[route];
}
function enrichSummaries(items){
  items.forEach(function(x){if(x.publicationKey!=='ll'||x.context||SUMMARY_REQUESTED[x.id]||['research-note','figure'].indexOf(x.kind)<0)return;SUMMARY_REQUESTED[x.id]=true;
    sourceDocument(x).then(function(doc){var found=sourceObject(doc,x);if(found&&found.parts){SUMMARY[x.id]=found.parts;renderPage()}}).catch(function(){});
  });
}
var READER=null,READ_IDS=[],READ_ID=null,READ_TOKEN=0,READ_OPENER=null,READ_OVERFLOW='';
function ensureReader(){
  if(READER)return READER;
  var d=document.createElement('dialog');d.className='cp-reader';d.setAttribute('aria-labelledby','cpReaderTitle');
  d.innerHTML='<div class="cp-reader-shell"><header class="cp-reader-top"><span>Commonplace / Reading</span><button type="button" data-reader-close aria-label="Close reader">Close ×</button></header><div class="cp-reader-scroll"><p class="cp-reader-origin"></p><h2 id="cpReaderTitle" tabindex="-1"></h2><p class="cp-reader-state" role="status"></p><div class="cp-reader-content"></div><blockquote class="cp-reader-note" hidden></blockquote><details class="cp-reader-meta"><summary>Threads &amp; Weight <span class="cp-reader-meta-value"></span></summary><form><label for="cpReaderThreads">Threads</label><input id="cpReaderThreads" type="text" placeholder="Names separated by commas"><label for="cpReaderWeight">Weight</label><select id="cpReaderWeight"><option value="0">Unrated</option><option value="1">1 / 5</option><option value="2">2 / 5</option><option value="3">3 / 5</option><option value="4">4 / 5</option><option value="5">5 / 5</option></select><button type="submit">Save metadata</button><p class="cp-reader-save-state" role="status"></p></form></details><a class="cp-reader-source">Return to passage ↗</a></div><footer class="cp-reader-nav"><button type="button" data-reader-prev>← Previous</button><span aria-live="polite" class="cp-reader-position"></span><button type="button" data-reader-next>Next →</button></footer></div>';
  document.body.appendChild(d);READER=d;
  d.querySelector('[data-reader-close]').onclick=function(){d.close()};
  d.querySelector('[data-reader-prev]').onclick=function(){stepReader(-1)};d.querySelector('[data-reader-next]').onclick=function(){stepReader(1)};
  d.addEventListener('click',function(e){if(e.target===d){var r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});
  d.addEventListener('keydown',function(e){if(e.key==='Tab'){var focusable=[].slice.call(d.querySelectorAll('a[href],button:not(:disabled),input,select,textarea,summary')).filter(function(n){return n.getClientRects().length>0}),first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement.id==='cpReaderTitle')){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}return}if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('input,select,textarea,[contenteditable]'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stepReader(e.key==='ArrowLeft'?-1:1)}});
  d.addEventListener('close',function(){READ_TOKEN++;document.body.style.overflow=READ_OVERFLOW;renderPage();var target=[].slice.call(document.querySelectorAll('[data-read]')).filter(function(b){return b.dataset.read===READ_OPENER})[0]||document.getElementById('cpSearch');if(target)target.focus({preventScroll:true})});
  d.querySelector('form').addEventListener('submit',function(e){
    e.preventDefault();var x=get(READ_ID);if(!x)return;var before={threads:x.threads,rating:x.rating,modifiedAt:x.modifiedAt};
    x.threads=threadsFrom(d.querySelector('#cpReaderThreads').value);x.rating=+d.querySelector('#cpReaderWeight').value;x.modifiedAt=now();
    var ok=save();if(!ok){Object.assign(x,before);renderPage()}else scheduleThreadReturn(x);
    d.querySelector('.cp-reader-meta-value').textContent=(x.threads||[]).join(' · ')+(x.rating?' / '+x.rating+' of 5':'');
    d.querySelector('.cp-reader-save-state').textContent=ok?'Saved in this browser. Your index will reflect the change when you close the reader.':'Could not save. Browser storage is full or unavailable.';
  });
  return d;
}
function openReader(id){
  var d=ensureReader();READ_IDS=RESULT_IDS.slice();READ_OPENER=id;
  if(!d.open){READ_OVERFLOW=document.body.style.overflow;document.body.style.overflow='hidden';d.showModal()}
  showReader(id);
}
function stepReader(delta){var ids=READ_IDS.filter(function(id){return !!get(id)}),i=ids.indexOf(READ_ID);if(ids[i+delta])showReader(ids[i+delta])}
function showReader(id){
  var x=get(id),d=READER;if(!x)return;READ_ID=id;var token=++READ_TOKEN;
  var ids=READ_IDS.filter(function(id){return !!get(id)}),i=ids.indexOf(id),body=d.querySelector('.cp-reader-content'),status=d.querySelector('.cp-reader-state');
  d.querySelector('#cpReaderTitle').textContent=x.title;d.querySelector('.cp-reader-origin').textContent=x.publication+' · '+(x.kindLabel||x.kind)+(x.issue?' · '+x.issue:'');
  d.querySelector('.cp-reader-position').textContent=(i+1)+' / '+ids.length+' in this view';d.querySelector('[data-reader-prev]').disabled=i<=0;d.querySelector('[data-reader-next]').disabled=i>=ids.length-1;
  var annotation=d.querySelector('.cp-reader-note');annotation.textContent=x.note||'';annotation.hidden=!x.note;
  var source=d.querySelector('.cp-reader-source');source.href=safeURL(x.sourceUrl);source.textContent=(x.sourceLabel||'Return to passage')+' ↗';
  d.querySelector('#cpReaderThreads').value=(x.threads||[]).join(', ');d.querySelector('#cpReaderWeight').value=x.rating||0;d.querySelector('.cp-reader-meta-value').textContent=(x.threads||[]).join(' · ')+(x.rating?' / '+x.rating+' of 5':'');d.querySelector('.cp-reader-save-state').textContent='';d.querySelector('details').open=false;
  var p=summaryParts(x),fallback=x.contentHTML||((x.media||'')+(p.context?'<p class="cp-context">'+esc(p.context)+'</p>':'')+'<div class="cp-snapshot">'+esc((x.snapshot||x.excerpt||'').replace(p.context||/^$/,'' ).trim())+'</div>');
  body.innerHTML=cleanContent(fallback,x.sourceUrl,'cp-reader-');var firstHeading=body.querySelector('h1,h2,h3,h4');if(firstHeading&&text(firstHeading.textContent)===text(x.title))firstHeading.remove();status.textContent=x.contentHTML?'Saved copy.':'Loading the complete kept object…';
  d.querySelector('.cp-reader-scroll').scrollTop=0;d.querySelector('#cpReaderTitle').focus({preventScroll:true});
  if(x.contentHTML)return;
  sourceDocument(x).then(function(doc){var found=sourceObject(doc,x);if(!found)throw new Error('Object unavailable');if(token!==READ_TOKEN||!d.open)return;body.innerHTML=cleanContent(found.html,x.sourceUrl,'cp-reader-');var firstHeading=body.querySelector('h1,h2,h3,h4');if(firstHeading&&text(firstHeading.textContent)===text(x.title))firstHeading.remove();status.textContent='From the source archive.'}).catch(function(){if(token===READ_TOKEN&&d.open)status.textContent='Saved copy — the full source is unavailable. Older keeps may contain an abbreviated snapshot. Return to passage opens the original.'});
}

function readerDiagram(k){
  if(k==='tax-wedge')return '<svg viewBox="0 0 170 104" role="img" aria-label="Supply and demand with a tax wedge between the price buyers pay and the price sellers receive"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M22 6V88H162"/><path d="M30 14L150 84"/><path d="M30 82L150 16"/><path d="M22 36.6H70M22 60.2H70" stroke-dasharray="2 3" opacity=".6"/></g><path d="M70 36.6V60.2L90 48.4Z" style="fill:var(--clay)" opacity=".28"/><path d="M70 36.6V60.2" style="stroke:var(--clay)" stroke-width="2"/><g style="fill:currentColor;font-family:var(--sans)" font-size="9"><text x="152" y="86">D</text><text x="152" y="18">S</text><text x="2" y="39">buyers</text><text x="2" y="63">sellers</text><text x="74" y="30" style="fill:var(--clay)">wedge</text><text x="130" y="100">Q</text></g></svg>';
  if(k==='counterfactual')return '<svg viewBox="0 0 170 104" role="img" aria-label="Observed adoption rising after a policy, compared with a counterfactual baseline that was already rising"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M14 6V88H162"/><path d="M74 8V88" stroke-dasharray="2 3" opacity=".5"/><path d="M16 74L74 62L156 28" stroke-width="1.6"/><path d="M74 62L156 44" stroke-dasharray="4 3"/></g><path d="M158 28V44" style="stroke:var(--clay)" stroke-width="2"/><g style="fill:currentColor;font-family:var(--sans)" font-size="9"><text x="78" y="16">policy</text><text x="112" y="24">observed</text><text x="92" y="74">counterfactual</text><text x="140" y="100">time</text></g><text x="163" y="58" text-anchor="end" style="fill:var(--clay);font-family:var(--sans)" font-size="9">effect</text></svg>';
  return '';
}

  function readerExhibit(x){
    if(!x)return '';
    var cap='<div class="exhibit-cap">'+x.caption+'</div>';
    if(x.type==='table'){
      return '<div class="exhibit">'+cap+'<div style="overflow-x:auto"><table class="data"><thead><tr>'+x.head.map(function(h){return '<th scope="col">'+h+'</th>'}).join('')+'</tr></thead><tbody>'+x.rows.map(function(r){return '<tr>'+r.map(function(c,i){return i?'<td>'+c+'</td>':'<th scope="row" style="font-weight:400">'+c+'</th>'}).join('')+'</tr>'}).join('')+'</tbody></table></div></div>';
    }
    if(x.type==='console')return '<div class="exhibit">'+cap+'<div class="console" role="figure" aria-label="R console input">'+x.code+'</div></div>';
    if(x.type==='eq')return '<div class="exhibit">'+cap+'<div class="eq">'+x.html+'</div></div>';
    return '';
  }


function itemHTML(x){
  var summary=summaryParts(x);
  var rel=relatedCount(x),thr=(x.threads||[]).length?'<p class="cp-threads">Thread'+(x.threads.length>1?'s':'')+': '+x.threads.map(esc).join(' · ')+'</p>':'';
  var note=x.note?'<blockquote>'+esc(x.note)+'</blockquote>':'',links=(x.links||[]).slice(0,4).map(function(l){return '<a href="'+esc(l.url)+'" target="_blank" rel="noopener">'+esc(l.label)+' ↗</a>'}).join('');
  return '<article class="kept-entry" data-id="'+esc(x.id)+'" data-pub="'+esc(x.publicationKey)+'" data-rating="'+(x.rating||0)+'"><div class="kept-meta"><span>'+esc(x.publication)+' · '+esc(x.kindLabel||x.kind)+(x.issue?' · '+esc(x.issue):'')+'</span><span>'+(x.rating?'importance '+x.rating+'/5':'unrated')+'</span></div><h2>'+esc(x.title)+'</h2>'+(x.media?'<div class="cp-media">'+cleanContent(x.media,x.sourceUrl,'cp-index-'+encodeURIComponent(x.id)+'-')+'</div>':'')+(summary.context?'<p class="cp-context">'+esc(summary.context)+'</p>':'')+(summary.excerpt?'<p class="kept-excerpt">'+esc(summary.excerpt)+'</p>':'')+thr+note+'<div class="kept-links"><a href="'+esc(x.sourceUrl)+'">'+esc(x.sourceLabel||'Return to passage')+' ↗</a>'+'<button type="button" data-read="'+esc(x.id)+'">'+(x.kind==='figure'?'view here':'read here')+'</button>'+links+(rel?'<button type="button" data-related="'+esc(x.id)+'">'+rel+' related in your threads</button>':'')+'<button type="button" data-edit="'+esc(x.id)+'">edit</button></div></article>';
}
function backupText(items){
  if(!items.length)return 'Nothing has been kept yet.';
  var t=null;try{t=localStorage.getItem(BACKUP_KEY)}catch(e){};if(!t){var oldest=Math.min.apply(null,items.map(function(x){return Date.parse(x.createdAt||Date.now())})),age=Math.floor((Date.now()-oldest)/864e5);return age>7?'No export backup has been made yet.':'JSON backup is available whenever you want it.'}
  var days=Math.floor((Date.now()-Date.parse(t))/864e5);return days>30?'Last export backup: '+days+' days ago.':'Last export backup: '+(days===0?'today':days+' days ago')+'.';
}
function renderPage(){
  if(!pageMode)return;injectPageDialog();
  var host=document.getElementById('commonplaceEntries');if(!host)return;
  var items=Object.keys(STATE.items).map(function(k){return STATE.items[k]}).sort(function(a,b){return Date.parse(b.modifiedAt)-Date.parse(a.modifiedAt)});
  var q=(document.getElementById('cpSearch').value||'').toLowerCase(),pub=document.getElementById('cpSource').value,thread=document.getElementById('cpThread').value,rating=+document.getElementById('cpImportance').value||0;
  var show=items.filter(function(x){var hay=(x.title+' '+(x.context||'')+' '+x.excerpt+' '+x.note+' '+(x.threads||[]).join(' ')+' '+x.publication).toLowerCase();return (!q||hay.indexOf(q)>=0)&&(!pub||x.publicationKey===pub)&&(!thread||(x.threads||[]).indexOf(thread)>=0)&&(!rating||(x.rating||0)>=rating)});
  RESULT_IDS=show.map(function(x){return x.id});enrichSummaries(show);
  if(READER&&READER.open)return;
  host.innerHTML=show.length?show.map(itemHTML).join(''):(items.length?
    '<div class="cp-empty"><p class="empty-kicker">In this view</p><h2>No passages found.</h2><p>Try another search, or widen the thread, origin or importance selections in your index. Your kept material is still here.</p></div>':
    '<div class="cp-empty"><p class="empty-kicker">Your commonplace book</p><h2>A place for what stays with you.</h2><p>Keep a passage, question or figure from any of the three titles. It will gather here, ready for a note, a thread or another reading.</p><a href="../">Browse the Periodicals ↗</a></div>');
  var ts=threadList(items),sel=document.getElementById('cpThread'),old=sel.value;if(old&&ts.indexOf(old)<0)ts.push(old);sel.innerHTML='<option value="">All threads</option>'+ts.map(function(t){return '<option>'+esc(t)+'</option>'}).join('');sel.value=ts.indexOf(old)>=0?old:'';
  document.getElementById('backupState').textContent=backupText(items);
  var lc=document.getElementById('localCount'),tc=document.getElementById('threadCount'),vc=document.getElementById('viewCount'),ls=document.getElementById('localState');
  if(lc)lc.textContent=items.length;if(tc)tc.textContent=threadList(items).length;if(vc)vc.textContent=show.length+' shown';if(ls)ls.textContent='local · this browser';
  var ret=document.getElementById('cpReturn');if(ret&&!ret.dataset.chosen){var r=chooseReturn();ret.dataset.chosen='1';if(r){ret.hidden=false;ret.innerHTML='<span class="return-k">Return</span><div><b>'+esc(r.item.title)+'</b><p>'+(r.reason==='thread'?'Another item in '+esc(r.thread||'this thread')+' brought it back into view.':'You marked this as important; it has been quiet for a while.')+'</p></div><a href="'+esc(r.item.sourceUrl)+'">Return to passage ↗</a>'}}
}
function download(name,type,body){var b=new Blob([body],{type:type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);try{localStorage.setItem(BACKUP_KEY,now())}catch(e){};renderPage()}
function exportJSON(){download('periodicals-commonplace.json','application/json',JSON.stringify(STATE,null,2))}
function exportMD(){
  var items=Object.keys(STATE.items).map(function(k){return STATE.items[k]}).sort(function(a,b){return Date.parse(b.modifiedAt)-Date.parse(a.modifiedAt)}),out=['# Periodicals Commonplace',''];
  items.forEach(function(x){out.push('## '+x.title,'',x.publication+' · '+(x.kindLabel||x.kind)+(x.issue?' · '+x.issue:''),(x.rating?'Importance: '+x.rating+'/5':''),(x.threads&&x.threads.length?'Threads: '+x.threads.join(', '):''),'',x.note?'> '+x.note.replace(/\n/g,'\n> '):'',x.snapshot||x.excerpt||'','', '[Return to source]('+x.sourceUrl+')','');});
  download('periodicals-commonplace.md','text/markdown;charset=utf-8',out.filter(function(x){return x!==undefined}).join('\n'));
}
function exportHTML(){
  var items=Object.keys(STATE.items).map(function(k){return STATE.items[k]}).sort(function(a,b){return Date.parse(b.modifiedAt)-Date.parse(a.modifiedAt)});
  var body=items.map(function(x){return '<article><p class="meta">'+esc(x.publication)+' · '+esc(x.kindLabel||x.kind)+(x.issue?' · '+esc(x.issue):'')+(x.rating?' · importance '+x.rating+'/5':'')+'</p><h2>'+esc(x.title)+'</h2>'+(x.media?x.media:'')+(x.note?'<blockquote>'+esc(x.note)+'</blockquote>':'')+'<p>'+esc(x.snapshot||x.excerpt||'')+'</p><p><a href="'+esc(x.sourceUrl)+'">Return to source</a></p></article>'}).join('');
  var doc='<!doctype html><html><head><meta charset="utf-8"><title>Periodicals Commonplace</title><style>body{max-width:760px;margin:48px auto;padding:0 24px;font:18px/1.6 Georgia,serif;color:#211d18}h1{font-size:48px}article{margin:52px 0}h2{font-size:28px;line-height:1.15}.meta{font:12px/1.4 monospace;text-transform:uppercase;color:#766}blockquote{margin:18px 0;padding-left:18px;border-left:2px solid #765}a{color:inherit}@media print{body{margin:0;max-width:none}article{break-inside:avoid}}</style></head><body><h1>Periodicals Commonplace</h1>'+body+'</body></html>';
  download('periodicals-commonplace.html','text/html;charset=utf-8',doc);
}
function mergeImported(x){
  if(!x||typeof x!=='object'||!x.items||typeof x.items!=='object')throw new Error('This is not a Commonplace export.');if(x.version&&x.version>VERSION)throw new Error('This backup uses a newer Commonplace format. Update the site before importing it.');
  var added=0,merged=0;Object.keys(x.items).forEach(function(id){var inc=x.items[id];if(!inc||!inc.id)return;var loc=STATE.items[id];
    if(!loc){STATE.items[id]=inc;added++;return}merged++;var incNew=Date.parse(inc.modifiedAt||0)>Date.parse(loc.modifiedAt||0);
    loc.threads=uniq((loc.threads||[]).concat(inc.threads||[]));if(incNew){loc.rating=inc.rating||0;loc.note=inc.note||'';loc.modifiedAt=inc.modifiedAt||loc.modifiedAt}
    loc.links=linksUniq((loc.links||[]).concat(inc.links||[]));if(!loc.snapshot&&inc.snapshot)loc.snapshot=inc.snapshot;if(!loc.media&&inc.media)loc.media=inc.media;
    ['publication','publicationKey','kind','kindLabel','issue','title','excerpt','sourceUrl','sourceAnchor','sourceLabel','context','contentHTML'].forEach(function(k){if(!loc[k]&&inc[k])loc[k]=inc[k]});
  });save();return {added:added,merged:merged};
}
function clearCommonplace(){
  if(!confirm('Clear every kept item, thread, rating and annotation from this browser? This cannot be undone unless you exported a backup.'))return;
  STATE=blank();
  try{localStorage.removeItem(KEY);localStorage.removeItem(BACKUP_KEY);localStorage.removeItem(RETURN_KEY)}catch(e){}
  document.dispatchEvent(new CustomEvent('periodicals:commonplace-change'));
  renderPage();
}
function initPage(){
  ['cpSearch','cpSource','cpThread','cpImportance'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener(id==='cpSearch'?'input':'change',renderPage)});
  document.getElementById('exportJson').addEventListener('click',exportJSON);document.getElementById('exportMd').addEventListener('click',exportMD);document.getElementById('exportHtml').addEventListener('click',exportHTML);document.getElementById('clearCommonplace').addEventListener('click',clearCommonplace);
  var input=document.getElementById('importFile');document.getElementById('importBtn').addEventListener('click',function(){input.click()});input.addEventListener('change',function(){var f=this.files&&this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var st=document.getElementById('importState');try{var x=JSON.parse(r.result),m=mergeImported(x);st.textContent='Imported '+m.added+' new item'+(m.added===1?'':'s')+'; merged '+m.merged+'. Existing items were not deleted.';renderPage()}catch(e){st.textContent=e.message||'Import failed.'}};r.readAsText(f);this.value=''});
  document.getElementById('commonplaceEntries').addEventListener('click',function(e){var read=e.target.closest('[data-read]');if(read){openReader(read.dataset.read);return}var rel=e.target.closest('[data-related]');if(rel){var rx=get(rel.dataset.related),thr=rx&&rx.threads&&rx.threads[0];if(thr){document.getElementById('cpThread').value=thr;renderPage()}return}var b=e.target.closest('[data-edit]');if(b){var x=get(b.dataset.edit);if(x)openEditor({id:x.id,publication:x.publication,kind:x.kind,kindLabel:x.kindLabel,title:x.title})}});
  document.addEventListener('periodicals:commonplace-change',renderPage);renderPage();
}
injectStyles();
if(pageMode){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPage);else initPage()}
else{
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){scan();new MutationObserver(scheduleScan).observe(document.body,{subtree:true,childList:true})});
  else{scan();new MutationObserver(scheduleScan).observe(document.body,{subtree:true,childList:true})}
  addEventListener('hashchange',function(){scheduleScan();revealHash()});
}
addEventListener('storage',function(e){if(e.key===KEY){STATE=load();refreshButtons();if(pageMode)renderPage()}});
window.PeriodicalsCommonplace={load:function(){return load()},keep:keep,remove:remove,open:function(id){var x=get(id);if(x)openEditor(x)},version:VERSION};
})();
