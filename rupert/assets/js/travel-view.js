import { cleanPlan, readBackup } from './core/travel.js';
const key = 'rupert-travel-v1';
const places = JSON.parse(document.getElementById('travel-places').textContent);
const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
const button = (text, action) => { const n = el('button', text); n.type = 'button'; n.addEventListener('click', action); return n; };
const status = text => { $('trip-status').textContent = text; };
let plans = [], activeId = null, dirty = false;
try { const text = localStorage.getItem(key); if (text) plans = readBackup(text); } catch { status('Saved plans could not be opened. Import a backup to restore them.'); }
function persist(next) {
  try { localStorage.setItem(key, JSON.stringify({ schema_version: 1, plans: next })); plans = next; return true; }
  catch { status('This browser could not save the plan. Export a backup before leaving.'); return false; }
}
function field(label, input) { const n = el('label', label); n.append(input); return n; }
function addLeg(leg = { mode: 'car', from: {label:''}, to:{label:''} }, stop = {}) {
  if ($('trip-legs').children.length >= 40) { status('A journey can hold up to 40 legs.'); return; }
  const row = el('li', null, 'trip-leg');
  const mode = el('select'); mode.className = 'leg-mode';
  for (const [value,text] of Object.entries({car:'Drive',air:'Flight',ferry:'Ferry',rail:'Train',walk:'Walk'})) { const o = el('option',text); o.value = value; mode.append(o); } mode.value = leg.mode;
  const from = el('input'), to = el('input'); from.className = 'leg-from'; to.className = 'leg-to'; from.value = leg.from.label; to.value = leg.to.label; from.maxLength = to.maxLength = 200;
  const stops = el('div', null, 'leg-stops'), select = el('select'); select.className = 'leg-place';
  const empty = el('option','Choose a place (optional)'); empty.value = ''; select.append(empty);
  places.forEach(p => { const o = el('option',p.name); o.value = p.id; select.append(o); }); select.value = stop.place_id || '';
  const note = el('input'); note.className = 'leg-note'; note.value = stop.note || ''; note.maxLength = 500; note.placeholder = 'A walk, a picnic, a place to pause';
  stops.append(field('Place stop',select),field('Your own stop or note',note));
  const update = () => { stops.hidden = mode.value !== 'car'; };
  mode.addEventListener('change',update); update();
  row.append(field('Travel by',mode), field('From',from),field('To',to),stops);
  const actions = el('div',null,'leg-actions');
  actions.append(button('Move earlier',() => { if(row.previousElementSibling) row.before(row.previousElementSibling); dirty = true; numberLegs(); }),button('Move later',() => { if(row.nextElementSibling) row.after(row.nextElementSibling); dirty = true; numberLegs(); }),button('Remove leg',() => { row.remove(); dirty = true; numberLegs(); }));
  row.append(actions); $('trip-legs').append(row); numberLegs();
}
function numberLegs() { [...$('trip-legs').children].forEach((row,i,all) => { const bs=row.querySelectorAll('.leg-actions button'); bs[0].disabled=i===0; bs[1].disabled=i===all.length-1; }); }
function collect() {
  const rows=[...$('trip-legs').children];
  return cleanPlan({id:activeId,title:$('trip-title').value,dates:{start:$('trip-start').value,end:$('trip-end').value},legs:rows.map((row,i)=>({seq:i+1,mode:row.querySelector('.leg-mode').value,from:{label:row.querySelector('.leg-from').value},to:{label:row.querySelector('.leg-to').value}})),manual_stops:rows.flatMap((row,i)=> {const place_id=row.querySelector('.leg-place').value,note=row.querySelector('.leg-note').value; return row.querySelector('.leg-mode').value==='car' && (place_id||note) ? [{leg:i+1,place_id,note}] : [];})});
}
function load(plan) {
  activeId=plan?.id || null; $('trip-title').value=plan?.title || ''; $('trip-start').value=plan?.dates?.start || ''; $('trip-end').value=plan?.dates?.end || ''; $('trip-legs').replaceChildren();
  if(plan) plan.legs.forEach(leg=>addLeg(leg,plan.manual_stops.find(s=>s.leg===leg.seq))); else addLeg();
  dirty=false;
}
function savedList() { $('saved-trips').replaceChildren(); if(!plans.length) $('saved-trips').append(el('p','Your first journey starts here.')); plans.forEach(p=>{const row=el('p'); row.append(button(p.title,()=>{if(dirty && !confirm('Open this journey and discard unsaved edits?')) return; load(p); status('Journey opened.');})); $('saved-trips').append(row);}); }
$('add-leg').addEventListener('click',()=>{addLeg();dirty=true;});
$('save-trip').addEventListener('click',()=>{try { const plan=collect(), next=plans.filter(p=>p.id!==plan.id).concat(plan); if(next.length>100) throw Error('Export your journeys before adding more.'); if(persist(next)) {activeId=plan.id;dirty=false;savedList();status('Plan saved in this browser.');} } catch(e){status(e.message);} });
$('new-trip').addEventListener('click',()=>{if(dirty && !confirm('Start a new journey and discard unsaved edits?')) return;load();status('New journey.');});
$('export-trips').addEventListener('click',()=>{try {let exportPlans=plans; if(dirty){const draft=collect();exportPlans=plans.filter(p=>p.id!==draft.id).concat(draft);}const blob=new Blob([JSON.stringify({schema_version:1,plans:exportPlans},null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=el('a');a.href=url;a.download='rupert-travel-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Backup exported, including the current draft.');} catch(e){status(e.message);} });
$('import-trips').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;const incoming=readBackup(await file.text()), next=[...plans];for(const p of incoming){if(!next.some(x=>x.id===p.id))next.push(p);}if(next.length>100)throw Error('Too many journeys.');const added=next.length-plans.length;if(persist(next)){savedList();status(`Imported ${added} journeys; existing plans were kept.`);}}catch(e){status('Import failed: '+e.message);}finally{e.target.value='';}});
document.querySelector('.travel-editor').addEventListener('input',()=>{dirty=true;});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
load();savedList();
