import { labrador } from './core/labrador.js';
import { LOG_KEY, LOG_CHANGED, cleanEntry, readLogBackup, readLocalHistory, rupertDay, birthdayPrompt } from './core/field-log.js';
import { nyDateString } from './core/dates.js';
import { EXPERIENCES } from './core/options.js';
import { isReleased } from './core/editions.js';
import { resolveHistoryEntry, personalHistory, editionHistory, experienceId, routeIdentity, recommendationHistory, activityCategory } from './core/experience-history.js';
import { historyCatalog } from './history-view.js';
const base = document.body.dataset.base || '';
const css = document.createElement('link'); css.rel='stylesheet'; css.href=base+'assets/css/field-log.css'+new URL(import.meta.url).search; document.head.append(css);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let openMemory;
function setupLog() {
  const host = document.querySelector('main .coming') || document.querySelector('.coming');
  if (!host) return;
  host.classList.add('field-log');
  host.innerHTML=`<header class="page-head"><div><h1>Field Log</h1></div><aside class="head-note dog-only">${labrador('sit')}</aside></header><p>Entries and photos are stored in this browser. Export a backup before clearing browser data. To move your history between iPhone and MacBook, export here and import the file in the other browser.</p><div class="log-actions"><a href="${base}">Choose an outing in This Week</a><button class="log-secondary" id="unplanned">Add an Unplanned Outing</button></div><div id="rupert-day-slot"></div><section id="log-editor" hidden><h2 class="sec-h" id="memory-heading">Outing Details</h2><p id="memory-prompt"></p><form id="memory-form"><label>Date<input name="date" type="date" required></label><label>Place<input name="place" maxlength="200" required></label><label>What you did<input name="activity" maxlength="300" required></label><label>Atlas place<select name="place_id" disabled><option value="">Not associated</option></select></label><label>History<select name="history_kind"><option value="visit">Place visited</option><option value="completed">Specific outing completed</option><option value="unclassified">Visit · completion not classified</option></select></label><label id="completion-choice" hidden>Completed outing<select name="completion_ref"><option value="">Choose an outing</option></select></label><label>Notes / memory<textarea name="notes" rows="5" maxlength="10000"></textarea></label><label>Activity category<select name="experience"><option value="">Optional</option>${Object.entries(EXPERIENCES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>Other tags<input name="tags" maxlength="500" placeholder="Optional, separated by commas"></label><label>Photos (optional, up to 3)<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><p>Season is taken from the outing date. Photos are resized for browser storage.</p><div class="travel-actions"><button>Save memory</button><button type="button" id="cancel-memory">Cancel</button></div></form></section><p id="log-status" role="status" aria-live="polite"></p><section><h2 class="sec-h">Outings</h2><div id="memories"></div></section><div class="travel-actions"><button id="export-log">Export backup</button><label>Import backup<input id="import-log" type="file" accept="application/json,.json"></label><button id="export-history">Export recommendation history</button></div><p class="history-export-note">Optional: review associated IDs, dates and activity categories for private editorial use. You may add a brief summary of useful observations. Raw notes, photos and Home information are not included; nothing is uploaded.</p><div id="log-import-review" class="delete-confirm" hidden><p>A backup contains revisions or omits memories in this browser. Choose how to restore it. Export a backup first if you need to keep the current copy.</p><button id="merge-revisions">Use backup revisions</button><button id="keep-memories">Keep existing versions</button><button id="restore-log">Restore whole backup</button><button id="cancel-import">Cancel</button><p>Whole-backup restore also removes entries absent from that backup.</p></div>`;
  const status=host.querySelector('#log-status'), form=host.querySelector('form'), editor=host.querySelector('#log-editor');
  form.querySelector('#completion-choice').insertAdjacentHTML('afterend',`<div id="completion-review" class="delete-confirm" hidden><p id="completion-review-text"></p><label class="history-consent"><input name="completion_confirm" type="checkbox">I completed the whole selected outing.</label></div>`);
  host.querySelector('.history-export-note').insertAdjacentHTML('afterend',`<section id="history-review" class="history-review" hidden tabindex="-1"><h2 class="sec-h">Review recommendation history</h2><p>Only this reviewed file is shared with the editor when you supply it privately. Summaries start blank: use your memories as a reference, then write a brief outing observation without copying raw notes, addresses or personal details. Activity choices guide ranking; they do not establish completion.</p><form id="history-review-form"><div id="history-review-places"></div><label class="history-consent"><input id="history-review-consent" type="checkbox" required>I reviewed this export and omitted private memory text and personal details.</label><div class="travel-actions"><button>Download private history</button><button type="button" id="cancel-history-review">Cancel</button></div><p id="history-review-status" role="status" aria-live="polite"></p></form></section>`);
  let entries=[], current={}, available=true, catalog, incomingBackup, exportEntries;

  try { const raw=localStorage.getItem(LOG_KEY); if(raw) entries=readLogBackup(raw); } catch(e) { available=false; status.textContent='Stored memories could not be opened. Storage may be unavailable or the data damaged. Existing data has been left intact.'; }
  const latestEntries = () => { const stored=readLocalHistory(); if(!stored.available) throw Error('Stored memories could not be opened. Existing data has been left intact.'); return stored.entries; };
  const persist = next => { if(next.length>200) throw Error('This log holds up to 200 memories. Export a backup before combining larger logs.'); if(!available) throw Error('Storage is unavailable. Your existing memories have been left intact.'); const text=JSON.stringify({version:2,entries:next}); if(text.length>4000000) throw Error('Storage is full. Export a backup and use fewer photos.'); localStorage.setItem(LOG_KEY,text); entries=next; draw(); window.dispatchEvent(new Event(LOG_CHANGED)); };
  function draw(){
    host.querySelector('#memories').innerHTML=entries.length? [...entries].sort((a,b)=>b.date.localeCompare(a.date)).map((e,i,all)=>`${i===0 || all[i-1].date.slice(0,4)!==e.date.slice(0,4) ? `<h2 class="log-year">${esc(e.date.slice(0,4))}</h2>` : ''}<article class="memory-card" id="memory-${e.id}"><p class="season-note">${esc(e.date)} · ${esc(e.season)}${e.source==='rupert-day'?' · Rupert Day':''}${e.experience?' · '+esc(EXPERIENCES[e.experience]||e.experience):''}</p><h3>${esc(e.place)}</h3><p>${esc(e.activity)}</p><p class="memory-notes">${esc(e.notes)}</p>${e.prompt?`<p class="season-note">${esc(e.prompt)}</p>`:''}<p>${esc(e.tags)}</p><p class="memory-history">${esc(memoryAssociation(e))}</p><div class="memory-photos">${e.photos.map(p=>`<img src="${p}" alt="Photo from ${esc(e.place)}" loading="lazy">`).join('')}</div><div class="memory-actions"><button data-edit="${e.id}">Edit Memory</button><button class="delete-memory" data-delete="${e.id}">Delete Entry</button></div><div class="delete-confirm" data-confirm-for="${e.id}" hidden><p>Delete this entry from this browser? Export a backup first to keep a copy.</p><button data-confirm-delete="${e.id}">Confirm Delete</button><button data-cancel-delete="${e.id}">Keep Entry</button></div></article>`).join(''):'<p>No outings recorded.</p>'; }
  openMemory=(entry={})=>{ current={...entry}; form.reset(); for(const key of ['date','place','activity','notes','experience','tags']) form.elements[key].value=entry[key]|| (key==='date'?nyDateString(new Date()):''); host.querySelector('#memory-heading').textContent=entry.source==='rupert-day'?'Rupert Day':entry.history_kind==='completed'?'Complete Outing':entry.source==='planned'?'Outing Details':'An Unplanned Outing'; host.querySelector('#memory-prompt').textContent=entry.prompt||''; historyChoices(entry); editor.hidden=false; editor.scrollIntoView({block:'start'}); form.elements.date.focus({preventScroll:true}); };
  host.querySelector('#unplanned').onclick=()=>openMemory({source:'unplanned',history_kind:'visit'});
  host.querySelector('#cancel-memory').onclick=()=>{editor.hidden=true;};
  host.querySelector('#memories').onclick=e=>{const id=e.target.dataset.edit;if(id)openMemory(entries.find(x=>x.id===id)); const remove=e.target.dataset.delete, confirmed=e.target.dataset.confirmDelete, cancel=e.target.dataset.cancelDelete;const card=e.target.closest('.memory-card'), confirmation=card?.querySelector('.delete-confirm');if(remove && confirmation){confirmation.hidden=false;confirmation.querySelector('button').focus();}if(cancel && confirmation)confirmation.hidden=true;if(confirmed){try{persist(latestEntries().filter(x=>x.id!==confirmed));if(current.id===confirmed){editor.hidden=true;current={};}status.textContent='Entry deleted from this browser.';}catch(err){status.textContent=err.message;}}};
  async function photo(file){if(file.size>15000000)throw Error('Choose photos under 15 MB.'); const bitmap=await createImageBitmap(file); try {const canvas=document.createElement('canvas'),scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.75);}finally{bitmap.close();}}
  form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button');button.disabled=true;try{const files=[...form.elements.photos.files];if(files.length>3)throw Error('Choose up to three photos.');const values=Object.fromEntries(new FormData(form));const links=chosenAssociation(values);const entry=cleanEntry({...current,...values,...links,photos:files.length?await Promise.all(files.map(photo)):current.photos||[]});const latest=latestEntries();if(current.id&&JSON.stringify(latest.find(x=>x.id===current.id))!==JSON.stringify(current))throw Error('This memory changed in another tab. Your edit has not overwritten it. Cancel and reopen the memory to review the current version.');const next=latest.filter(x=>x.id!==entry.id);next.push(entry);if(next.length>200)throw Error('This log holds up to 200 memories.');persist(next);editor.hidden=true;status.textContent='Memory saved privately in this browser.';}catch(err){status.textContent=err.message;}finally{button.disabled=false;}};
  host.querySelector('#export-log').onclick=()=>{try{entries=latestEntries();const url=URL.createObjectURL(new Blob([JSON.stringify({version:2,entries},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='rupert-field-log.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(err){status.textContent=err.message;}};
  function restoreIncoming(mode) {
    try {
      const merged=new Map(latestEntries().map(x=>[x.id,x]));
      for(const entry of incomingBackup)if(mode==='revisions'||!merged.has(entry.id))merged.set(entry.id,entry);
      persist(mode==='restore'?incomingBackup:[...merged.values()]);
      host.querySelector('#log-import-review').hidden=true; incomingBackup=null; editor.hidden=true; current={};
      status.textContent='Backup restored. '+(mode==='restore'?'This browser now matches the backup.':'Existing memories kept.');
    } catch(err) { status.textContent=err.message; }
  }
  host.querySelector('#import-log').onchange=async e=>{try{
    const file=e.target.files[0];if(!file)return;if(file.size>4000000)throw Error('Backup exceeds 4 MB.');
    incomingBackup=readLogBackup(await file.text());entries=latestEntries();
    const existing=new Map(entries.map(x=>[x.id,x])),sameIds=incomingBackup.every(x=>existing.has(x.id));
    const revisions=incomingBackup.some(x=>existing.has(x.id)&&JSON.stringify(existing.get(x.id))!==JSON.stringify(x));
    if(revisions||sameIds&&incomingBackup.length<entries.length){host.querySelector('#log-import-review').hidden=false;host.querySelector('#merge-revisions').focus();status.textContent='Review how to restore this backup.';}
    else restoreIncoming('keep');
  }catch(err){status.textContent=err.message;}e.target.value='';};
  host.querySelector('#merge-revisions').onclick=()=>restoreIncoming('revisions');
  host.querySelector('#keep-memories').onclick=()=>restoreIncoming('keep');
  host.querySelector('#restore-log').onclick=()=>restoreIncoming('restore');
  host.querySelector('#cancel-import').onclick=()=>{host.querySelector('#log-import-review').hidden=true;incomingBackup=null;};
  const review=host.querySelector('#history-review'), reviewForm=host.querySelector('#history-review-form'), reviewStatus=host.querySelector('#history-review-status');
  host.querySelector('#export-history').onclick=()=>{
    if(!available||!catalog){status.textContent='History could not be exported; your stored memories are unchanged.';return;}
    try {
      entries=latestEntries();exportEntries=JSON.stringify(entries);const data=recommendationHistory(entries,catalog);
      if(!data.records.length){status.textContent='Associate a recorded visit with an Atlas place before exporting recommendation history.';return;}
      const options='<option value="">No preference</option>'+Object.entries(EXPERIENCES).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('');
      host.querySelector('#history-review-places').innerHTML=[...new Set(data.records.map(r=>r.place_id))].map(place=>{
        const memories=entries.filter(e=>resolveHistoryEntry(e,catalog).place_id===place && e.date<=nyDateString(new Date()));
        const records=data.records.filter(r=>r.place_id===place);
        return `<fieldset data-context-place="${esc(place)}"><legend>${esc(catalog.places.places.find(p=>p.id===place)?.name||place)}</legend><p class="history-export-note">${records.map(r=>esc(`${r.date} · ${r.history_kind==='completed'?'Completed '+(r.edition||r.experience_id):'Place visited'}${r.activity_category?' · '+EXPERIENCES[r.activity_category]:''}`)).join('<br>')}</p><details><summary>Review source memories · browser only</summary>${memories.map(e=>`<p>${esc(e.date)} · ${esc(e.activity)}</p><p class="memory-notes">${esc(e.notes)}</p>`).join('')}</details><label>Optional editorial summary<textarea name="summary" rows="3" maxlength="500"></textarea></label><label>Activity to consider next<select name="explore_activity">${options}</select></label><label>Activity to avoid<select name="avoid_activity">${options}</select></label></fieldset>`;
      }).join('');
      host.querySelector('#history-review-consent').checked=false;reviewStatus.textContent='';review.hidden=false;review.scrollIntoView({block:'start'});review.focus({preventScroll:true});
    } catch(err) {status.textContent=err.message;}
  };
  host.querySelector('#cancel-history-review').onclick=()=>{review.hidden=true;exportEntries=null;host.querySelector('#export-history').focus();};
  reviewForm.onsubmit=e=>{
    e.preventDefault();try {
      const latest=latestEntries();if(JSON.stringify(latest)!==exportEntries)throw Error('History changed during review. Reopen Export recommendation history before downloading.');
      if(!host.querySelector('#history-review-consent').checked)throw Error('Review the export before downloading.');
      const contexts=[...review.querySelectorAll('[data-context-place]')].map(group=>{
        const summary=group.querySelector('[name=summary]').value.trim(),explore=group.querySelector('[name=explore_activity]').value,avoid=group.querySelector('[name=avoid_activity]').value;
        return {place_id:group.dataset.contextPlace,reviewed:true,summary,...(explore?{explore_activity:explore}:{}),...(avoid?{avoid_activity:avoid}:{})};
      }).filter(c=>c.summary||c.explore_activity||c.avoid_activity);
      const data=recommendationHistory(latest,catalog,{contexts}),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='rupert-recommendation-history.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);review.hidden=true;exportEntries=null;
      status.textContent='Reviewed recommendation history downloaded privately. Nothing was uploaded; the publisher can use it only after you supply this file.';
    }catch(err){status.textContent=err.message;reviewStatus.textContent=err.message;}
  };
  function memoryAssociation(entry) {
    if(entry.date>nyDateString(new Date()))return 'Future date · visit not recorded yet';
    const a=catalog?resolveHistoryEntry(entry,catalog):null;
    if(!a?.resolved)return 'Atlas association not recorded · use Edit Memory to associate it.';
    if(a.completed)return a.edition?'Outing completed · '+a.edition:'Experience completed · edition not recorded';
    return a.kind==='unclassified'?'Place visited · completion not classified':'Place visited · no outing completion recorded';
  }
  function historyChoices(entry={}) {
    const a=catalog?resolveHistoryEntry(entry,catalog):null;
    form.elements.place_id.value=entry.place_id||(entry.association_manual?'':a?.place_id)||'';
    form.elements.history_kind.value=entry.history_kind||(entry.id?'unclassified':'visit');
    completionChoices(entry.history_kind==='completed'?(entry.edition?'edition:'+entry.edition:entry.experience_id?'experience:'+routeIdentity(entry.experience_id):''):'');
  }
  function completionChoices(value='') {
    const place=form.elements.place_id.value,p=catalog?.places.places.find(p=>p.id===place);
    const editions=(catalog?.manifest.editions||[]).filter(e=>isReleased(e)&&e.place_id===place);
    form.elements.completion_ref.innerHTML='<option value="">Choose an outing</option>'+editions.map(e=>`<option value="edition:${esc(e.id)}">${esc(e.title)} · ${esc(e.id)}${e.status==='withdrawn'?' · Withdrawn history':''}</option>`).join('')+(p?.routes||[]).map(r=>`<option value="experience:${esc(routeIdentity(r.id))}">${esc(r.distance_mi)} mi ${esc(r.shape)} · without an edition</option>`).join('');
    form.elements.completion_ref.value=value;
    const completed=form.elements.history_kind.value==='completed';host.querySelector('#completion-choice').hidden=!completed;form.elements.completion_ref.required=completed;
    completionReview();
  }
  function completionReview() {
    const completed=form.elements.history_kind.value==='completed',confirm=form.elements.completion_confirm;
    host.querySelector('#completion-review').hidden=!completed;confirm.required=completed;confirm.checked=false;
    host.querySelector('#completion-review-text').textContent=(activityCategory(form.elements.experience.value)==='short-walk'?'A short walk alone does not establish completion of the selected itinerary. ':'')+'If your activity or notes describe only part of this outing, choose Place visited above. Your original memory is preserved.';
  }
  form.elements.experience.onchange=completionReview;
  form.elements.completion_ref.onchange=completionReview;
  form.elements.place_id.onchange=()=>completionChoices();
  form.elements.history_kind.onchange=()=>completionChoices(form.elements.completion_ref.value);
  function chosenAssociation(values) {
    if(values.history_kind!=='completed')return {place_id:values.place_id||'',experience_id:'',history_kind:values.history_kind,association_manual:true};
    if(!form.elements.completion_confirm.checked)throw Error('Confirm the whole selected outing, or record a place visit.');
    if(!catalog)throw Error('Atlas associations are unavailable. Keep this memory as a visit for now.');
    const ref=values.completion_ref||'',place_id=values.place_id;
    if(ref.startsWith('edition:')){
      const e=catalog.manifest.editions.find(e=>e.id===ref.slice(8)&&e.place_id===place_id&&isReleased(e));
      if(e)return {place_id,history_kind:'completed',edition:e.id,experience_id:experienceId(e),association_manual:true};
    }else if(ref.startsWith('experience:')){
      const p=catalog.places.places.find(p=>p.id===place_id),id=ref.slice(11);
      if(p?.routes.some(r=>routeIdentity(r.id)===id))return {place_id,history_kind:'completed',edition:'',experience_id:id,association_manual:true};
    }
    throw Error('Choose the specific outing you completed.');
  }
  historyCatalog().then(data=>{
    catalog=data;form.elements.place_id.innerHTML='<option value="">Not associated</option>'+data.places.places.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');form.elements.place_id.disabled=false;
    if(!editor.hidden)historyChoices(current);draw();
    const id=location.hash.replace(/^#memory-/,'');const entry=entries.find(e=>e.id===id);if(entry)openMemory(entry);
  }).catch(()=>{status.textContent='Atlas associations are unavailable. Memories and photos remain in this browser.';});

  const reread=()=>{if(!editor.hidden)return;const stored=readLocalHistory();available=stored.available;if(available){entries=stored.entries;draw();}};
  window.addEventListener('storage',e=>{if(e.key===LOG_KEY||e.key===null)reread();});window.addEventListener('pageshow',reread);document.addEventListener('visibilitychange',()=>{if(!document.hidden)reread();});
  draw();
  let pending;try{pending=sessionStorage.getItem('rupert-completed');}catch{}if(pending){try{openMemory(JSON.parse(pending));sessionStorage.removeItem('rupert-completed');}catch{status.textContent='Could not open the completed outing.';}}
}
if(document.body.dataset.section==='log')setupLog();
async function setupCompleted(){
 const edition=document.querySelector('.edition'),id=location.pathname.match(/\/edition\/([^/]+)\//)?.[1];if(!edition||!id)return;
 try{
  const catalog=await historyCatalog(),record=catalog.manifest.editions.find(e=>e.id===id&&isReleased(e));if(!record)return;
  const response=await fetch(base+record.path);if(!response.ok)return;const data=await response.json(),f=data.flagship;
  const block=document.createElement('div');block.className='edition-history';block.setAttribute('aria-label','Your experience history');
  const status=document.createElement('p');status.className='personal-history';
  const actions=document.createElement('div');actions.className='history-actions';block.append(status,actions);
  const foot=edition.querySelector('.ed-foot');if(foot)foot.prepend(block);else edition.querySelector('.withdrawal')?.after(block);
  const edit=memory=>{const a=document.createElement('a');a.className='log-completed';a.href=base+'log/#memory-'+encodeURIComponent(memory.id);a.textContent='Edit memory';return a;};
  const recordOuting=kind=>{const button=document.createElement('button');button.className='log-completed';button.textContent=kind==='completed'?'Mark as Completed':'Record a visit';button.onclick=()=>{try{sessionStorage.setItem('rupert-completed',JSON.stringify({source:'planned',edition:id,place_id:f.place_id,experience_id:kind==='completed'?experienceId(data):'',history_kind:kind,place:kind==='completed'?f.title:catalog.places.places.find(p=>p.id===f.place_id)?.name||f.title,activity:kind==='completed'?f.title:'',prompt:kind==='completed'?data.memory_prompt?.text||'':'',experience:f.experiences?.[0]||''}));location.href=base+'log/';}catch{status.textContent='Browser storage is unavailable';}};return button;};
  const draw=()=>{const local=readLocalHistory(),state=editionHistory(record,personalHistory(local.entries,catalog));status.textContent=local.available?state.label:'Experience history unavailable in this browser';block.dataset.history=state.state;actions.replaceChildren();
   if(state.state==='completed')actions.append(edit(state.record));else {actions.append(recordOuting('completed'));if(state.record)actions.append(edit(state.record));else actions.append(recordOuting('visit'));}
  };
  draw();window.addEventListener(LOG_CHANGED,draw);window.addEventListener('storage',e=>{if(e.key===LOG_KEY||e.key===null)draw();});window.addEventListener('pageshow',draw);document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw();});
 }catch{ /* A missing catalog must never invent completion or reveal a draft. */ }
}
setupCompleted();

function refreshDay(){const active=rupertDay();document.body.classList.toggle('rupert-day',active);let note=document.querySelector('#rupert-day-note');if(active&&!note){note=document.createElement('aside');note.id='rupert-day-note';note.className='rupert-day-note';note.innerHTML=`<span>April 7 · Rupert Day</span>`;document.querySelector('.page-head, .week')?.prepend(note);}if(!active)note?.remove();const slot=document.querySelector('#rupert-day-slot');if(!slot)return;if(!active){slot.replaceChildren();return;}if(slot.childElementCount)return;slot.innerHTML=`<section class="rupert-day-card"><h2 class="sec-h">Rupert Day · ${nyDateString(new Date()).slice(0,4)}</h2><p>${birthdayPrompt}</p><button>Record this year’s Rupert Day</button></section>`;slot.querySelector('button').onclick=()=>openMemory({source:'rupert-day',prompt:birthdayPrompt,date:nyDateString(new Date())});}
refreshDay();setInterval(refreshDay,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
