import { createMap } from './map/maplibre-provider.js';
import { validPoint, drivingRoute } from './core/routing.js';
import { pointFeature, distanceMiles, distanceToRoute, routeBounds, itineraryRows, geocodeLocation, nearbyParks } from './core/trip-map.js';
import { cleanPlan, readBackup } from './core/travel.js';
const key = 'rupert-travel-v1';
const places = JSON.parse(document.getElementById('travel-places').textContent);
const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
const button = (text, action) => { const n = el('button', text); n.type = 'button'; n.addEventListener('click', action); return n; };
const status = text => { $('trip-status').textContent = text; };
let plans = [], activeId = null, dirty = false, postcard = null;
let map=null, mapped=null, routeController=null, requestVersion=0, canPersist=true;
const references=JSON.parse($('travel-references').textContent),locationCache=new Map(),discovered=new Map();
const placeById=id=>places.find(p=>p.id===id)||discovered.get(id);

try { const text = localStorage.getItem(key); if (text) plans = readBackup(text); } catch { canPersist=false; status('Saved plans could not be opened. Existing data has been left intact. Export or restore a backup.'); }
function persist(next) {
  try { if(!canPersist)throw Error('Storage unavailable'); localStorage.setItem(key, JSON.stringify({ schema_version: 1, plans: next })); plans = next; return true; }
  catch { status('This browser could not save the plan. Export a backup before leaving.'); return false; }
}
function field(label, input) { const n = el('label', label); n.append(input); return n; }
function addLeg(leg = { mode: 'car', from: {label:''}, to:{label:''} }, stop = {}) {
  if ($('trip-legs').children.length >= 40) { status('A journey can hold up to 40 legs.'); return; }
  const row = el('li', null, 'trip-leg');
  const mode = el('select'); mode.className = 'leg-mode';
  for (const [value,text] of Object.entries({car:'Drive',air:'Flight',ferry:'Ferry',rail:'Train',walk:'Walk'})) { const o = el('option',text); o.value = value; mode.append(o); } mode.value = leg.mode;
  const from = el('input'), to = el('input'); from.className = 'leg-from'; to.className = 'leg-to'; from.value = leg.from.label; to.value = leg.to.label; from.maxLength = to.maxLength = 200; from.setAttribute('list','travel-locations');to.setAttribute('list','travel-locations');
  for(const [input,value] of [[from,leg.from],[to,leg.to]]){if(validPoint(value)){input.dataset.point=JSON.stringify(value);input.dataset.label=value.label;}}
  const stops = el('div', null, 'leg-stops'), select = el('select'); select.className = 'leg-place';
  const empty = el('option','Choose a place (optional)'); empty.value = ''; select.append(empty);
  places.forEach(p => { const o = el('option',p.name); o.value = p.id; select.append(o); }); if(stop.place_id && !placeById(stop.place_id) && stop.location){const p={id:stop.place_id,name:stop.location.label,access:stop.location,dog_policy:'Confirm dog access'};discovered.set(p.id,p);}if(stop.place_id && !places.some(p=>p.id===stop.place_id)){const o=el('option',placeById(stop.place_id)?.name||stop.place_id);o.value=stop.place_id;select.append(o);}select.value = stop.place_id || '';
  const note = el('input'); note.className = 'leg-note'; note.value = stop.note || ''; note.maxLength = 500; note.placeholder = 'Optional stop note';
  const pause=el('input');pause.className='leg-pause';pause.type='number';pause.min='0';pause.max='1440';pause.value=stop.minutes??30;
  stops.append(field('Place stop',select),field('Stop minutes',pause),field('Stop note',note));
  const update = () => { stops.hidden = mode.value !== 'car'; };
  mode.addEventListener('change',update); update();
  const duration=el('input');duration.className='leg-duration';duration.type='number';duration.min='0';duration.max='10080';duration.value=leg.minutes??'';const durationField=field('Travel minutes',duration);
  mode.addEventListener('change',()=>durationField.hidden=mode.value==='car');durationField.hidden=mode.value==='car';
  row.append(field('Travel by',mode), field('From',from),field('To',to),durationField,stops);
  const actions = el('div',null,'leg-actions');
  actions.append(button('Move earlier',() => { if(row.previousElementSibling) row.before(row.previousElementSibling); dirty = true; numberLegs();clearMap(); }),button('Move later',() => { if(row.nextElementSibling) row.after(row.nextElementSibling); dirty = true; numberLegs();clearMap(); }),button('Remove leg',() => { row.remove(); dirty = true; numberLegs();clearMap(); }));
  row.append(actions); $('trip-legs').append(row); numberLegs();
}
function headerState() {
  $('travel-header-plan').textContent=$('trip-title').value.trim() || 'New Trip';
  const modes=[...new Set([...$('trip-legs').querySelectorAll('.leg-mode')].map(s=>s.selectedOptions[0].textContent))];
  $('travel-header-state').textContent=`${$('trip-legs').children.length} ${$('trip-legs').children.length===1?'Leg':'Legs'} · ${modes.join(' / ')} · ${plans.length} Saved Trips`;
}
function numberLegs() { headerState(); [...$('trip-legs').children].forEach((row,i,all) => { const bs=row.querySelectorAll('.leg-actions button'); bs[0].disabled=i===0; bs[1].disabled=i===all.length-1; }); }
function collect() {
  const rows=[...$('trip-legs').children];
  const endpoint=input=>{const label=input.value.trim();let point;try{if(input.dataset.label===label)point=JSON.parse(input.dataset.point);}catch{}return {label,...(validPoint(point)?{lat:point.lat,lng:point.lng}: {})};};
  return cleanPlan({...(postcard ? {postcard:{...postcard,caption:$('postcard-caption').value}} : {}),planning:{departure:$('trip-depart').value,break_every:Number($('break-every').value)},id:activeId,title:$('trip-title').value,dates:{start:$('trip-start').value,end:$('trip-end').value},legs:rows.map((row,i)=>({seq:i+1,mode:row.querySelector('.leg-mode').value,from:endpoint(row.querySelector('.leg-from')),to:endpoint(row.querySelector('.leg-to')),minutes:row.querySelector('.leg-duration').value})),manual_stops:rows.flatMap((row,i)=> {const place_id=row.querySelector('.leg-place').value,note=row.querySelector('.leg-note').value; return row.querySelector('.leg-mode').value==='car' && (place_id||note) ? [{leg:i+1,place_id,note,minutes:Number(row.querySelector('.leg-pause').value),...(placeById(place_id)?.access ? {location:{label:placeById(place_id).name,lat:placeById(place_id).access.lat,lng:placeById(place_id).access.lng}} : {})}] : [];})});
}
function load(plan) {
  activeId=plan?.id || null; $('trip-title').value=plan?.title || ''; $('trip-start').value=plan?.dates?.start || ''; $('trip-end').value=plan?.dates?.end || ''; $('trip-legs').replaceChildren();
  if(plan) plan.legs.forEach(leg=>addLeg(leg,plan.manual_stops.find(s=>s.leg===leg.seq))); else addLeg();
  $('trip-depart').value=plan?.planning?.departure||'09:00';$('break-every').value=plan?.planning?.break_every??120;
  clearMap();
  postcard=plan?.postcard || null; $('postcard-caption').value=postcard?.caption || ''; paintPostcard();
  dirty=false;
}
function savedList() { headerState(); $('saved-trips').replaceChildren(); if(!plans.length) $('saved-trips').append(el('p','No saved trips.')); plans.forEach(p=>{const row=el('p'); row.append(button(p.title,()=>{if(dirty && !confirm('Open this journey and discard unsaved edits?')) return; load(p); status('Journey opened.');})); $('saved-trips').append(row);}); }
$('add-leg').addEventListener('click',()=>{addLeg();dirty=true;clearMap();});
$('save-trip').addEventListener('click',()=>{try { const plan=collect(), next=plans.filter(p=>p.id!==plan.id).concat(plan); if(next.length>100) throw Error('Export your journeys before adding more.'); if(persist(next)) {activeId=plan.id;dirty=false;savedList();status('Plan saved in this browser.');} } catch(e){status(e.message);} });
$('new-trip').addEventListener('click',()=>{if(dirty && !confirm('Start a new journey and discard unsaved edits?')) return;load();status('New journey.');});
$('export-trips').addEventListener('click',()=>{try {let exportPlans=plans; if(dirty){const draft=collect();exportPlans=plans.filter(p=>p.id!==draft.id).concat(draft);}const blob=new Blob([JSON.stringify({schema_version:1,plans:exportPlans},null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=el('a');a.href=url;a.download='rupert-travel-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Backup exported, including the current draft.');} catch(e){status(e.message);} });
$('import-trips').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;const incoming=readBackup(await file.text()), next=[...plans];for(const p of incoming){if(!next.some(x=>x.id===p.id))next.push(p);}if(next.length>100)throw Error('Too many journeys.');const added=next.length-plans.length;if(persist(next)){savedList();status(`Imported ${added} journeys; existing plans were kept.`);}}catch(e){status('Import failed: '+e.message);}finally{e.target.value='';}});
document.querySelector('.travel-editor').addEventListener('input',e=>{dirty=true;headerState();if(e.target.closest('#trip-legs')&&(mapped||routeController)){clearMap();$('trip-map-status').textContent='Trip changed. Map trip to update the route.';}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
function paintPostcard() {
  const box=$('journey-postcard');box.replaceChildren();box.hidden=!postcard;
  if(postcard){const image=el('img');image.src=postcard.image;image.alt='Adventure imagined: '+postcard.caption;box.append(image,el('figcaption','Adventure imagined · '+postcard.caption));}
  $('remove-postcard').hidden=!postcard;
}
$('postcard-file').addEventListener('change',async e=>{
  try {
    const file=e.target.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10000000)throw Error('Choose a JPEG, PNG or WebP illustration under 10 MB.');
    const bitmap=await createImageBitmap(file),scale=Math.min(1,1000/bitmap.width,1000/bitmap.height),canvas=document.createElement('canvas');
    canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const context=canvas.getContext('2d');context.fillStyle='#F3EFE5';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const image=canvas.toDataURL('image/jpeg',0.82);if(image.length>1500000)throw Error('That picture is too large; use a simpler illustration.');
    postcard={image,caption:$('postcard-caption').value.trim()||$('trip-title').value.trim()||'Trip postcard'};$('postcard-caption').value=postcard.caption;paintPostcard();dirty=true;status('Postcard added to this journey. Save the plan to keep it.');
  }catch(error){status(error.message);}finally{e.target.value='';}
});
$('postcard-caption').addEventListener('input',()=>{if(postcard){postcard.caption=$('postcard-caption').value;paintPostcard();dirty=true;}});
$('remove-postcard').addEventListener('click',()=>{postcard=null;paintPostcard();dirty=true;status('Postcard removed from this journey.');});
load();savedList();
initMap();
function clearMap() {
  $('route-activities').replaceChildren(el('p','Map a driving leg to find stops.'));$('destination-activities').replaceChildren(el('p','Map the destination to find nearby places.'));
  requestVersion++;routeController?.abort();mapped=null;map?.setRoutes([]);map?.setMarkers([]);
  $('trip-table').replaceChildren();const row=el('tr');const cell=el('td','Map a trip to calculate drive times.');cell.colSpan=6;row.append(cell);$('trip-table').append(row);$('trip-summary').textContent='';
}
async function initMap() {
  try {const coords=places.filter(p=>p.access?.lat!=null).map(p=>[p.access.lng,p.access.lat]);map=await createMap($('travel-map'),{base:document.body.dataset.base||'',theme:'light',travel:true,touch:matchMedia('(pointer:coarse)').matches,bounds:routeBounds(coords.map((c,i)=>pointFeature(String(i),'',{lng:c[0],lat:c[1]})))});$('trip-map-status').textContent='';map.on('select',id=>{const place=placeById(id);if(place){map.focus(id);status(place.name+' · '+place.dog_policy);}});if(mapped)paintMap();}
  catch(error){$('trip-map-status').textContent='Map unavailable. Route times and the itinerary remain usable.';}
}
async function resolveLocation(endpoint,signal) {
  if(endpoint.label.trim().toLowerCase()==='home') {let saved;try{saved=JSON.parse(localStorage.getItem('rupert-location-v1'));}catch{}if(!validPoint(saved?.point))throw Error('Set home in Atlas, or enter an origin here.');return {label:'Home',...saved.point};}
  if(validPoint(endpoint))return endpoint;
  const label=endpoint.label.trim(),known=places.find(p=>[p.name,p.short_name,p.access?.name].some(s=>s?.toLowerCase()===label.toLowerCase())),ref=Object.values(references).find(p=>p.label.toLowerCase()===label.toLowerCase());
  if(known)return {label,lat:known.access.lat,lng:known.access.lng};if(ref)return {label,lat:ref.lat,lng:ref.lng};
  const parts=label.split(',').map(Number);if(parts.length===2&&validPoint({lat:parts[0],lng:parts[1]}))return {label,lat:parts[0],lng:parts[1]};
  if(locationCache.has(label))return {label,...locationCache.get(label)};
  const point=await geocodeLocation(label,{signal});locationCache.set(label,point);return {label,lat:point.lat,lng:point.lng,display:point.display};
}
function paintTable() {
  if(!mapped)return;const rows=itineraryRows(mapped.plan.legs,mapped.results,{departure:$('trip-depart').value||'09:00',interval:Number($('break-every').value),stops:mapped.plan.manual_stops});$('trip-table').replaceChildren();
  for(const r of rows){const tr=el('tr'),stop=mapped.plan.manual_stops.find(s=>s.leg===r.leg);for(const text of [r.leg,`${r.from} → ${r.to}`,r.mode,r.minutes==null?'Unavailable':r.minutes+' min',stop?`${placeById(stop.place_id)?.short_name||stop.note||'Stop'} · ${r.pause} min`:'—',r.arrival])tr.append(el('td',String(text)));$('trip-table').append(tr);
    for(const br of r.breaks){const tr=el('tr',null,'trip-break'),cell=el('td',`Rupert break · 15 min · around ${br.minute} min into leg ${r.leg}. Choose a safe stopping place near the marker.`);cell.colSpan=6;tr.append(cell);$('trip-table').append(tr);}
  }
  const total=rows.reduce((sum,r)=>sum+(r.minutes||0)+r.pause+r.breaks.length*15,0),known=rows.every(r=>r.minutes!=null);$('trip-summary').textContent=`${known?'Total':'Known travel'}: ${Math.floor(total/60)} h ${total%60} min including stops and breaks. Driving estimates exclude traffic; transit times are entered manually.`;mapped.rows=rows;
}
function paintMap() {
  if(!mapped||!map)return;paintTable();const marks=[];
  mapped.plan.legs.forEach((leg,i)=>{if(validPoint(leg.from))marks.push(pointFeature(`origin-${i}`,`${i+1} · ${leg.from.label}`,leg.from));if(validPoint(leg.to))marks.push(pointFeature(`end-${i}`,`${i+1} · ${leg.to.label}`,leg.to));});
  for(const stop of mapped.plan.manual_stops){const p=placeById(stop.place_id);if(p)marks.push(pointFeature(p.id,p.short_name||p.name,p.access));}
  for(const row of mapped.rows||[])for(const br of row.breaks)marks.push(pointFeature(`break-${row.leg}-${br.minute}`,'Rupert break · approximate',br.point));
  for(const p of mapped.destinationPlaces||[])marks.push(pointFeature(p.id,p.short_name||p.name,p.access,'register'));
  map.setMarkers(marks);map.setRoutes(mapped.features);mapped.bounds=routeBounds([...mapped.features,...marks]);if(mapped.bounds)map.fit(mapped.bounds,{padding:55,maxZoom:12});
}
$('map-trip').addEventListener('click',async()=>{
  if(!$('trip-routing').checked){status('Enable route lookup before sending locations to the routing services.');return;}
  routeController?.abort();const controller=new AbortController(),version=++requestVersion;routeController=controller;const timer=setTimeout(()=>controller.abort(),60000),button=$('map-trip');button.disabled=true;
  try {const plan=collect(),results=[],baseResults=[],features=[],errors=[];status('Calculating route…');
    for(let i=0;i<plan.legs.length;i++){const leg=plan.legs[i];status(`Locating leg ${i+1} of ${plan.legs.length}…`);leg.from=await resolveLocation(leg.from,controller.signal);leg.to=await resolveLocation(leg.to,controller.signal);
      if(leg.mode==='car'){try{const baseline=await drivingRoute(leg.from,leg.to,{signal:controller.signal}),stop=plan.manual_stops.find(s=>s.leg===i+1),p=stop&&placeById(stop.place_id);baseResults[i]=baseline;const result=p?await drivingRoute(leg.from,leg.to,{via:[p.access],signal:controller.signal}):baseline;result.feature.properties={status:'planned',mode:'drive'};results[i]=result;features.push(result.feature);}catch(error){if(controller.signal.aborted)throw error;errors.push(`Leg ${i+1}: ${error.message}`);}}
      else {features.push({type:'Feature',properties:{mode:leg.mode},geometry:{type:'LineString',coordinates:[[leg.from.lng,leg.from.lat],[leg.to.lng,leg.to.lat]]}});}
    }
    if(version!==requestVersion)return;$('trip-map-status').textContent='';mapped={plan,results,baseResults,features,destinationPlaces:[]};
    [...$('trip-legs').children].forEach((row,i)=>{for(const [cls,point] of [['.leg-from',plan.legs[i].from],['.leg-to',plan.legs[i].to]]){const input=row.querySelector(cls);input.dataset.point=JSON.stringify(point);input.dataset.label=point.label;}});
    dirty=true;paintTable();paintMap();status(errors.length?errors.join(' '):'Route calculated. Save the plan to keep the resolved locations.');
    await showActivities(version,controller.signal);
  }catch(error){if(version===requestVersion)status(error.name==='AbortError'?'Route lookup cancelled or timed out.':error.message);}finally{clearTimeout(timer);if(version===requestVersion){button.disabled=false;routeController=null;}else button.disabled=false;}
});
function activityCard(p,detail,action) {
  const card=el('article',null,'trip-activity');card.append(el('h3',p.short_name||p.name),el('p',detail),el('p',p.dog_policy||'Confirm dog access'));
  if(p.links?.[0]){const link=el('a','Place details');link.href=p.links[0].url;link.target='_blank';link.rel='noopener';card.append(link);}
  if(action)card.append(button(action.label,action.run));return card;
}
function chooseStop(p,legIndex) {
  const row=$('trip-legs').children[legIndex];if(!row)return;discovered.set(p.id,p);const select=row.querySelector('.leg-place');if(![...select.options].some(o=>o.value===p.id)){const option=el('option',p.name);option.value=p.id;select.append(option);}select.value=p.id;dirty=true;clearMap();$('trip-map-status').textContent='Stop changed. Map trip to update the route.';status(`Stop added to leg ${legIndex+1}. Map trip to update the route and timing.`);
}
async function showActivities(version,signal) {
  if(!mapped)return;const current=mapped,routeBox=$('route-activities'),destinationBox=$('destination-activities');routeBox.replaceChildren(el('p','Checking route stops…'));destinationBox.replaceChildren();
  const destination=current.plan.legs.at(-1).to;
  let near=places.filter(p=>distanceMiles(destination,p.access)<=25).sort((a,b)=>distanceMiles(destination,a.access)-distanceMiles(destination,b.access)).slice(0,5);
  current.destinationPlaces=near;renderDestination(near,destination);paintMap();
  const maximum=Number($('trip-detour').value),candidates=[];
  current.plan.legs.forEach((leg,i)=>{const result=current.baseResults[i];if(!result)return;for(const p of places){if(distanceMiles(p.access,leg.from)<1 || distanceMiles(p.access,leg.to)<1)continue;const offset=distanceToRoute(p.access,result.feature.geometry.coordinates);if(offset<maximum/3)candidates.push({p,i,offset});}});
  candidates.sort((a,b)=>a.offset-b.offset);const seen=new Set(),chosen=candidates.filter(c=>{if(seen.has(c.p.id))return false;seen.add(c.p.id);return true;}).slice(0,4);const cards=[];
  for(const {p,i} of chosen){if(version!==requestVersion)return;try{const leg=current.plan.legs[i],detour=await drivingRoute(leg.from,leg.to,{via:[p.access],signal}),extra=Math.max(0,detour.minutes-current.baseResults[i].minutes);if(extra<=maximum)cards.push(activityCard(p,`Leg ${i+1} · +${extra} min drive · ${p.routes?.[0]?.distance_mi ? p.routes[0].distance_mi+' mi walk' : 'Walk'}`,{label:'Add stop',run:()=>chooseStop(p,i)}));}catch(error){if(signal.aborted)throw error;}}
  if(version!==requestVersion)return;routeBox.replaceChildren(...(cards.length?cards:[el('p','No directory stops within this detour limit.')]));
  if(!near.length){destinationBox.replaceChildren(el('p','Finding nearby parks…'));try{near=await nearbyParks(destination,{signal});if(version!==requestVersion)return;for(const p of near)discovered.set(p.id,p);near.sort((a,b)=>distanceMiles(destination,a.access)-distanceMiles(destination,b.access));current.destinationPlaces=near.slice(0,6);renderDestination(current.destinationPlaces,destination);paintMap();}catch(error){if(version!==requestVersion)return;destinationBox.replaceChildren(el('p','Nearby park lookup unavailable. Try again with Map trip.'));}}
}
function renderDestination(near,destination){const box=$('destination-activities');box.replaceChildren(...(near.length?near.map(p=>activityCard(p,`${distanceMiles(destination,p.access).toFixed(1)} mi from destination · ${p.kind==='trail'?'Trail':p.kind}`,{label:'Add as next leg',run:()=>{addLeg({mode:'car',from:{...destination},to:{label:p.name,lat:p.access.lat,lng:p.access.lng}});dirty=true;clearMap();status('Destination activity added as a leg. Map trip to update timing.');}})):[el('p','No directory places within 25 miles.')]));}
$('fit-trip').addEventListener('click',()=>{if(mapped?.bounds)map?.fit(mapped.bounds,{padding:55,maxZoom:12});});
$('trip-routing').addEventListener('change',()=>{if(!$('trip-routing').checked){clearMap();status('Route lookup disabled.');$('map-trip').disabled=false;}});
for(const id of ['trip-depart','break-every'])$(id).addEventListener('input',()=>{dirty=true;paintTable();paintMap();});
$('trip-detour').addEventListener('change',async()=>{if(!mapped)return;routeController?.abort();const controller=new AbortController(),version=++requestVersion;routeController=controller;try{await showActivities(version,controller.signal);}catch{}finally{if(version===requestVersion)routeController=null;}});
