import { automaticPostcard } from './core/postcard.js';
import { createMap } from './map/maplibre-provider.js';
import { validPoint, drivingRoute, drivingAlternatives, validateDrivingGeometry } from './core/routing.js';
import { pointFeature, distanceMiles, distanceToRoute, routeBounds, geocodeCandidates } from './core/trip-map.js';
import { cleanPlan, readBackup, TRAVEL_STORAGE_KEY } from './core/travel.js';
import { durationLabel, routeFamilies, routePoint, routeProgress, wholeJourneyBounds, opportunityZones, overnightZones, journeyLegs, journeySchedule } from './core/journey.js';
import { discoverActivities, areaName } from './core/discovery.js';
import { discoverNpsActivities } from './core/nps-places.js';

const key=TRAVEL_STORAGE_KEY, base=document.body.dataset.base||'', $=id=>document.getElementById(id);
const places=JSON.parse($('travel-places').textContent),references=JSON.parse($('travel-references').textContent),publications=JSON.parse($('travel-publications').textContent);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,action)=>{const n=el('button',text);n.type='button';n.addEventListener('click',action);return n;};
const field=(label,input)=>{const n=el('label',label);n.append(input);return n;};
const status=text=>{$('trip-status').textContent=text;};
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function stageTo(id,{move=true}={}){
  const section=$(id),link=document.querySelector('.journey-stages a[href="#'+id+'"]');
  if(!section)return;
  document.querySelectorAll('.journey-stages a').forEach(a=>{if(a===link)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  if(move){section.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'});const h=section.querySelector('h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
}
document.querySelectorAll('.journey-stages a').forEach(a=>a.addEventListener('click',()=>stageTo(a.hash.slice(1),{move:false})));
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible.length)stageTo(visible[0].target.id,{move:false});},{rootMargin:'-12% 0px -65% 0px',threshold:[0,.1,.3]});
  document.querySelectorAll('.journey-stage[id]').forEach(e=>observer.observe(e));
}
const emptyState=()=>({origin:null,destination:null,families:[],family:null,stops:[],destinationActivities:[],legs:[],results:[],manual:false,legacyStops:[]});
let captionEdited=false;
let state=emptyState(),plans=[],activeId=null,dirty=false,postcard=null,canPersist=true,map=null,version=0,controller=null,discoveryController=null,areaSearchController=null,building=false;
const locations=new Map(),discoveryCache=new Map();
try{const text=localStorage.getItem(key);if(text)plans=readBackup(text);}catch{canPersist=false;status('Saved plans could not be opened. Existing data has been left intact. Export or restore a backup.');}
function persist(next){try{if(!canPersist)throw Error();localStorage.setItem(key,JSON.stringify({schema_version:1,plans:next}));plans=next;return true;}catch{status('This browser could not save the plan. Export a backup before leaving.');return false;}}
function inputPoint(input){const label=input.value.trim();let point;try{if(input.dataset.label===label)point=JSON.parse(input.dataset.point);}catch{}return {label,...(validPoint(point)?{lat:point.lat,lng:point.lng}:{})};}
function putPoint(input,point){input.value=point?.label||'';input.dataset.label=point?.label||'';input.dataset.point=JSON.stringify(point||{});}
function settings(){return {departure:$('trip-depart').value||'09:00',break_every:0,detour:Number($('trip-detour').value)};}
function title(){return $('trip-title').value.trim()||`${$('trip-origin').value.trim()} → ${$('trip-destination').value.trim()}`;}
function snapshot(route){
  const coords=route.feature.geometry.coordinates;
  if(coords.length<=6000)return route;
  const indices=new Set([0,coords.length-1]);for(let i=0;i<5990;i++)indices.add(Math.round(i*(coords.length-1)/5989));
  for(const axis of [0,1])for(const compare of [(a,b)=>a<b,(a,b)=>a>b]){let found=0;for(let i=1;i<coords.length;i++)if(compare(coords[i][axis],coords[found][axis]))found=i;indices.add(found);}
  return {...route,feature:{...route.feature,geometry:{...route.feature.geometry,coordinates:[...indices].sort((a,b)=>a-b).map(i=>coords[i])}}};
}
function collect(){
  if(state.family&&($('trip-origin').value.trim()!==state.origin.label||$('trip-destination').value.trim()!==state.destination.label))throw Error('Find Routes to update the changed endpoints before saving.');
  const legs=state.legs.length?state.legs:[{mode:'car',from:inputPoint($('trip-origin')),to:inputPoint($('trip-destination'))}];
  return cleanPlan({id:activeId,title:title(),dates:{start:$('trip-start').value,end:$('trip-end').value},legs,manual_stops:state.manual?state.legacyStops:state.stops.map((s,i)=>({leg:i+1,place_id:s.id,location:s.location,minutes:s.overnight?0:s.minutes,note:s.name})),planning:settings(),...(postcard?{postcard:{...postcard,caption:$('postcard-caption').value||postcard.caption}}:{}),...(state.manual&&state.results.length?{manual_routes:state.results.map(snapshot)}:{}),...(state.family&&!state.manual?{journey:{origin:state.origin,destination:state.destination,family:snapshot(state.family),families:state.families.map(snapshot),routes:state.results.filter(Boolean).map(snapshot),stops:state.stops,destinationActivities:state.destinationActivities}}:{})});
}
function headerState(){
  $('travel-banner-copy').hidden=!state.family;
  $('travel-header-plan').textContent=state.family?`${state.origin.label} → ${state.destination.label}`:'';
  $('travel-header-state').textContent=state.family?`${Math.round(state.results.reduce((sum,r)=>sum+Number(r?.miles||0),0)).toLocaleString()} mi · ${durationLabel(state.results.reduce((sum,r)=>sum+(r?.minutes||0),0))} drive`:'';
}
function ensurePostcard(plan){if(!postcard||postcard.automatic){const caption=captionEdited?$('postcard-caption').value.trim():'';postcard=automaticPostcard(plan);if(caption)postcard.caption=caption;$('postcard-caption').value=postcard.caption;paintPostcard();}}
function paintPostcard(){const box=$('journey-postcard');box.replaceChildren();box.hidden=!postcard;if(postcard){const image=el('img');image.src=postcard.image;image.alt='Adventure imagined: '+postcard.caption;box.append(image,el('figcaption','Adventure imagined · '+postcard.caption));}$('remove-postcard').hidden=!postcard;}
function save(){try{if(building||controller)throw Error('Wait for the route update to finish before saving.');const plan=collect();ensurePostcard(plan);plan.postcard=postcard;const stored=localStorage.getItem(key);if(stored)plans=readBackup(stored);const next=plans.filter(p=>p.id!==plan.id).concat(plan);if(next.length>100)throw Error('Export your journeys before adding more.');if(persist(next)){activeId=plan.id;dirty=false;savedList();status('Trip saved in this browser, including its route and activities.');}}catch(e){status(e.message);}}
function savedList(){
  const box=$('saved-trips');box.replaceChildren();if(!plans.length)box.append(el('p','No saved trips.'));
  for(const p of plans){const row=el('article',null,'saved-trip'),info=el('div');info.append(el('h3',p.title),el('p',`${p.legs[0].from.label} → ${p.legs.at(-1).to.label}`));if(p.dates.start)info.append(el('small',[p.dates.start,p.dates.end].filter(Boolean).join(' – ')));row.classList.toggle('is-active',p.id===activeId);
    row.append(info,button('Open',()=>{if(dirty&&!confirm('Open this journey and discard unsaved edits?'))return;load(p);savedList();status('Trip opened. Saved route geometry is available without another lookup.');stageTo('route-stage');}),button('Delete',()=>{if(row.querySelector('.trip-delete-confirm'))return;const confirmation=el('div',null,'trip-delete-confirm');confirmation.append(el('p',`Delete “${p.title}” from this browser? Export a backup first to keep a copy.`),button('Confirm Delete',()=>{if(persist(plans.filter(x=>x.id!==p.id))){if(activeId===p.id){activeId=null;dirty=true;}savedList();status('Saved trip deleted. The editor is kept as an unsaved draft.');}}),button('Keep Trip',()=>confirmation.remove()));row.append(confirmation);confirmation.querySelector('button').focus();}));box.append(row);
  }
  if(plans.length)box.append(button('Clear All Saved Trips',()=>{if(box.querySelector('.clear-trips-confirm'))return;const confirmation=el('div',null,'clear-trips-confirm'),input=el('input');input.autocomplete='off';const remove=button('Delete All Trips',()=>{if(input.value!=='DELETE ALL')return;if(persist([])){activeId=null;dirty=true;savedList();status('All saved trips cleared. The editor is kept as an unsaved draft.');}});remove.disabled=true;input.addEventListener('input',()=>remove.disabled=input.value!=='DELETE ALL');confirmation.append(el('p',`Delete all ${plans.length} saved trips? Export a backup first.`),field('Type DELETE ALL to confirm',input),remove,button('Keep Trips',()=>confirmation.remove()));box.append(confirmation);input.focus();}));
}
function cancelRequests(){version++;controller?.abort();controller=null;discoveryController?.abort();discoveryController=null;areaSearchController?.abort();areaSearchController=null;building=false;$('map-trip').disabled=false;}
window.addEventListener('storage',event=>{if(event.key!==key)return;try{plans=event.newValue?readBackup(event.newValue):[];canPersist=true;savedList();}catch{canPersist=false;status('Another tab changed saved trips to unreadable data. Export the current draft before restoring a backup.');}});
function load(plan){
  cancelRequests();state=emptyState();activeId=plan?.id||null;$('trip-title').value=plan?.title||'';$('trip-start').value=plan?.dates.start||'';$('trip-end').value=plan?.dates.end||'';$('trip-depart').value=plan?.planning.departure||'09:00';$('trip-detour').value=String(plan?.planning.detour??20);$('trip-legs').replaceChildren();
  putPoint($('trip-origin'),plan?.legs[0].from);putPoint($('trip-destination'),plan?.legs.at(-1).to);
  if(plan?.journey){const j=plan.journey;state={...state,...j,legs:plan.legs,results:j.routes,destinationActivities:j.destinationActivities};}
  else if(plan){state.manual=true;state.legs=plan.legs;state.legacyStops=plan.manual_stops;state.results=plan.manual_routes||[];state.origin=plan.legs[0].from;state.destination=plan.legs.at(-1).to;}
  (plan?.legs||[]).forEach(leg=>addManualLeg(leg,plan.manual_stops.find(s=>s.leg===leg.seq)));
  document.querySelector('.travel-advanced').open=!!plan&&!plan.journey;
  postcard=plan?.postcard||null;captionEdited=!!postcard&&postcard.caption!==plan.legs.at(-1).to.label;$('postcard-caption').value=postcard?.caption||'';if(plan)ensurePostcard(plan);paintPostcard();
  renderFamilies();renderItinerary();paintMap(true);headerState();resetDiscovery();$('fit-trip').disabled=!state.results.length;
  if(state.family){$('anchor-form').hidden=false;$('journey-discovery-status').textContent='Saved activities restored. Search a town or select Search the Route Again to refresh public suggestions.';}
  dirty=false;
}
// A typed place is not an approved coordinate. Confirm Nominatim candidates before
// allowing a destination to control routing, overnight areas, or saved geometry.
function chooseGeocodeCandidate(label,candidates,signal,role='location'){
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(new DOMException('Lookup cancelled','AbortError'));return;}
    const dialog=el('dialog',null,'travel-place-dialog'),heading=el('h2','Confirm the '+role),
      intro=el('p','Choose the intended location before any route is calculated. The search provider returned these possible places.'),
      list=el('div',null,'travel-place-options'),
      actions=el('div',null,'travel-place-actions'),cancel=button('Cancel lookup',()=>finish(null));
    intro.className='travel-place-intro';
    heading.id='travel-place-dialog-title';dialog.setAttribute('aria-labelledby',heading.id);
    const query=el('p','Entered: '+label,'travel-place-query');
    function finish(candidate){
      signal?.removeEventListener('abort',abort);
      dialog.close();dialog.remove();
      if(candidate)resolve(candidate);
      else reject(new Error('Location not confirmed. Correct the place or try another search.'));
    }
    function abort(){
      signal?.removeEventListener('abort',abort);dialog.close();dialog.remove();
      reject(new DOMException('Lookup cancelled','AbortError'));
    }
    candidates.forEach((candidate,i)=>{
      const choice=button(candidate.display,()=>finish(candidate));
      choice.className='travel-place-option';
      choice.setAttribute('aria-label','Use '+candidate.display);
      list.append(choice);
    });
    actions.append(cancel);dialog.append(heading,query,intro,list,actions);
    dialog.addEventListener('cancel',e=>{e.preventDefault();finish(null)});
    document.body.append(dialog);signal?.addEventListener('abort',abort,{once:true});
    dialog.showModal();
    list.querySelector('button')?.focus();
  });
}
async function resolveLocation(endpoint,signal,role='location'){
  const label=endpoint.label.trim();if(!label)throw Error('Enter an origin and destination.');
  if(label.toLowerCase()==='home'){let home;try{home=JSON.parse(localStorage.getItem('rupert-location-v1'));}catch{}if(!validPoint(home?.point))throw Error('Set home in Atlas, or enter an origin here.');return {label:'Home',...home.point};}
  if(validPoint(endpoint))return endpoint;
  const known=places.find(p=>[p.name,p.short_name,p.access?.name].some(s=>s?.toLowerCase()===label.toLowerCase())),ref=Object.values(references).find(p=>p.label.toLowerCase()===label.toLowerCase());
  if(known)return {label,lat:known.access.lat,lng:known.access.lng};if(ref)return {label,lat:ref.lat,lng:ref.lng};
  const parts=label.split(',').map(s=>s.trim());if(parts.length===2&&parts.every(s=>s!==''&&Number.isFinite(Number(s)))){const point={lat:Number(parts[0]),lng:Number(parts[1])};if(validPoint(point))return {label,...point};}
  if(/^new\s+orleans\s*,\s*ls\s*$/i.test(label))
    throw Error('“LS” is not the Louisiana abbreviation. Did you mean “New Orleans, LA”? Correct the destination and confirm the matching location.');
  if(locations.has(label))return {label,...locations.get(label)};
  const candidates=await geocodeCandidates(label,{signal});
  const selected=await chooseGeocodeCandidate(label,candidates,signal,role);
  const point={lat:selected.lat,lng:selected.lng,display:selected.display};
  locations.set(label,point);
  return {label,...point};
}
function renderFamilies(){
  const box=$('route-families');box.replaceChildren();
  if(!state.families.length){box.append(el('p',state.manual?'Manual journey. Apply the legs to calculate road routes.':'Enter your origin and destination to compare routes.'));return;}
  const fastest=Math.min(...state.families.map(r=>r.minutes));
  for(const family of state.families){
    const card=el('article',null,'route-family');
    const alternativeOrder=state.families.filter(r=>r.id!==state.family?.id).findIndex(r=>r.id===family.id);
    card.dataset.routeStyle=family.id===state.family?.id?'selected':alternativeOrder===0?'option-a':'option-b';
    card.classList.toggle('is-selected',family.id===state.family?.id);card.append(el('h3',family.label),el('p',`${Math.round(Number(family.miles)).toLocaleString()} mi · ${durationLabel(family.minutes)} drive`,'route-figures'),el('p',family.minutes===fastest?'Fastest mapped route':`+${durationLabel(family.minutes-fastest)} vs fastest`),el('p',family.corridor?`Corridor: ${family.corridor}`:'Road corridor returned by OSRM'));
    const mix=el('p',family.mix||'Discover walks, treats, outdoor meals and scenic pauses.','route-mix');card.append(mix);
    const choose=button(family.id===state.family?.id?'Route Selected':'Compare This Route',async()=>{if(building||family.id===state.family?.id)return;if(state.stops.length&&!confirm('Switch routes and clear the selected along-route stops? Destination activities will be kept.'))return;cancelRequests();state.family=family;state.stops=[];state.legs=journeyLegs(state.origin,state.destination);state.results=[family];state.manual=false;dirty=true;renderFamilies();renderItinerary();paintMap(true);headerState();syncManual();status('Route highlighted on the map. Explore Stops on This Route to continue.');await discoverJourney();});choose.setAttribute('aria-pressed',String(family.id===state.family?.id));choose.disabled=family.id===state.family?.id;card.append(choose);box.append(card);
  }
}
function fitRoute(announce=false){
  if(!map){if(announce)$('map-fit-feedback').textContent='The map is unavailable. Your itinerary is still here.';return;}
  const bounds=wholeJourneyBounds([...state.families.filter(Boolean),...state.results.filter(Boolean)],state.origin,state.destination);
  if(!bounds){if(announce)$('map-fit-feedback').textContent='Map a journey first.';return;}
  let alreadyVisible=false;
  try{const visible=map.raw.getBounds();alreadyVisible=visible.contains(bounds[0])&&visible.contains(bounds[1]);}catch{}
  map.resize();map.select(null);
  map.fit(bounds,{padding:matchMedia('(max-width:759.98px)').matches?36:60,maxZoom:12});
  $('close-activity').hidden=true;
  if(announce)$('map-fit-feedback').textContent=alreadyVisible?
    'The entire journey is already visible. Pan or zoom in, then use this to return.':
    'Map reset to show the full journey and all alternative routes.';
}
function journeyRoute(){return state.results.length>1?{...state.family,minutes:state.results.reduce((n,r)=>n+r.minutes,0),miles:String(state.results.reduce((n,r)=>n+Number(r.miles),0)),feature:{type:'Feature',properties:{mode:'drive'},geometry:{type:'LineString',coordinates:state.results.flatMap(r=>r.feature.geometry.coordinates)}}}:state.results[0]||state.family;}
function paintMap(fit=false){
  if(!map)return;
  const alternatives=!state.manual&&state.family?state.families.filter(r=>r.id!==state.family.id).map((r,i)=>({
    ...r.feature,properties:{...r.feature.properties,mode:'drive',comparison:'alternative',comparisonIndex:i,routeLabel:r.label}
  })):[];
  const selected=state.results.filter(Boolean).map(r=>({
    ...r.feature,properties:{...r.feature.properties,mode:r.feature.properties.mode||'drive',comparison:'selected'}
  }));
  map.setRoutes([...alternatives,...selected]);
  const markers=[];if(validPoint(state.origin))markers.push(pointFeature('origin',state.origin.label,state.origin));if(validPoint(state.destination))markers.push(pointFeature('destination',state.destination.label,state.destination));
  for(const stop of state.stops)markers.push(pointFeature(stop.id,stop.name,stop.location));
  for(const activity of state.destinationActivities)markers.push(pointFeature(activity.id,activity.name,activity.location,'register'));
  map.setMarkers(markers);if(fit)fitRoute();
}
function selectedControl(activity,index,destination=false){
  const item=el('li',null,'selected-stop'),head=el('div');head.append(el('h3',activity.name),el('small',activity.overnight?'Overnight · next travel day':destination?'Destination activity':activity.defining?'Route-defining stop':'Route-adjacent activity'));item.append(head);
  if(!activity.overnight){const duration=el('select');for(const n of [15,20,30,40,45,60,90,120,180,activity.minutes].filter((x,i,all)=>all.indexOf(x)===i).sort((a,b)=>a-b)){const option=el('option',durationLabel(n));option.value=n;duration.append(option);}duration.value=activity.minutes;duration.addEventListener('change',()=>{activity.minutes=Number(duration.value);dirty=true;renderItinerary();});item.append(field('Activity duration',duration));}
  const items=destination?state.destinationActivities:state.stops,actions=el('div',null,'stop-actions');
  const move=direction=>{if(building)return;const next=[...items],other=index+direction;if(other<0||other>=next.length)return;[next[index],next[other]]=[next[other],next[index]];if(destination){state.destinationActivities=next;dirty=true;renderItinerary();}else rebuild(next);};
  const earlier=button('Move Earlier',()=>move(-1)),later=button('Move Later',()=>move(1));earlier.disabled=index===0;later.disabled=index===items.length-1;
  actions.append(earlier,later,button('Remove',()=>{if(building)return;const next=items.filter((_,i)=>i!==index);if(destination){state.destinationActivities=next;dirty=true;renderItinerary();paintMap();}else rebuild(next);}));item.append(actions);return item;
}
function updateTripContext(){
  const panel=$('trip-context'),active=!!state.family||!!state.manual;
  panel.hidden=!active;
  if(!active)return;
  const origin=state.origin?.label||'Origin',destination=state.destination?.label||'Destination';
  $('trip-context-route').textContent=origin+' → '+destination;
  const corridor=state.manual?'Manual itinerary':state.family?.label||'Selected driving route';
  const stops=state.stops.length,destinationVisits=state.destinationActivities.length;
  $('trip-context-detail').textContent=corridor+' · '+stops+' drive '+(stops===1?'stop':'stops')+
    ' · '+destinationVisits+' destination '+(destinationVisits===1?'activity':'activities')+
    ' · Updates apply to this journey only';
}
function renderItinerary(){
  updateTripContext();
  const list=$('selected-stops');list.replaceChildren(...state.stops.map((s,i)=>selectedControl(s,i)),...state.destinationActivities.map((s,i)=>selectedControl(s,i,true)));updateActivityButtons();
  const table=$('trip-table'),cards=$('itinerary-legs');table.replaceChildren();cards.replaceChildren();
  if(!state.legs.length){const row=el('tr'),cell=el('td','Map a trip to calculate drive times.');cell.colSpan=6;row.append(cell);table.append(row);$('trip-summary').textContent='Your selected activities will build the itinerary here.';$('overnight-warning').hidden=true;return;}
  const stops=state.manual?state.legs.map((_,i)=>{const s=state.legacyStops.find(s=>s.leg===i+1);return s&&{name:s.location?.label||s.note,minutes:s.minutes??30};}):state.stops;
  const schedule=journeySchedule(state.legs,state.results,{departure:$('trip-depart').value,start:$('trip-start').value,stops,destinationActivities:state.destinationActivities});
  for(const row of schedule.rows){const tr=el('tr');for(const value of [row.leg,`${row.from} → ${row.to}`,{car:'Drive',air:'Flight',ferry:'Ferry',rail:'Train',walk:'Walk'}[row.mode],durationLabel(row.minutes),row.stop?row.stop.overnight?'Overnight':`${row.stop.name} · ${durationLabel(row.stop.minutes)}`:'—',row.arrival])tr.append(el('td',String(value)));table.append(tr);
    const card=el('article',null,'itinerary-leg');card.append(el('h3',`${row.from} → ${row.to}`),el('p',`${durationLabel(row.minutes)} · Arrive ${row.arrival}`));if(row.stop)card.append(el('p',row.stop.overnight?`Stay overnight · Depart ${row.nextDeparture}`:`${row.stop.name} · ${durationLabel(row.stop.minutes)}`));cards.append(card);
  }
  for(const activity of schedule.activities){const tr=el('tr',null,'destination-table-row');for(const value of ['—',activity.name,'Destination activity',durationLabel(activity.minutes),'Local travel not included',activity.arrival])tr.append(el('td',value));table.append(tr);}
  const miles=state.results.reduce((sum,r)=>sum+Number(r?.miles||0),0),unknown=state.legs.some((l,i)=>l.mode==='car'?!state.results[i]:!Number.isFinite(l.minutes));
  $('trip-summary').textContent=`${Math.round(miles).toLocaleString()} mapped mi · ${durationLabel(schedule.driveMinutes)} driving${unknown?' (some travel times unavailable)':''} · ${state.stops.length} selected stops${state.stops.some(s=>s.overnight)?` · ${state.stops.filter(s=>s.overnight).length} overnight stays`:''}. ${schedule.elapsedMinutes==null?'':`Planned elapsed time ${durationLabel(schedule.elapsedMinutes)}; finish ${schedule.arrival}.`} ${state.destinationActivities.length?'Destination activities follow arrival; local transfers are not included.':''}`;
  const needsNight=state.results.some(r=>r?.minutes>540);
  const start=$('trip-start').value,end=$('trip-end').value;
  const daySpan=start&&end?Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000):null;
  const departure=$('trip-depart').value.split(':').map(Number);
  const finishDay=schedule.elapsedMinutes==null?null:Math.floor((departure[0]*60+departure[1]+schedule.elapsedMinutes)/1440);
  const exceedsWindow=daySpan!=null&&finishDay!=null&&finishDay>daySpan;
  $('overnight-warning').hidden=!(needsNight||exceedsWindow);
  $('overnight-warning').textContent=[needsNight?'An uninterrupted leg exceeds a sensible travel day. Add an overnight stop above; uninterrupted driving is not a practical plan.':'',exceedsWindow?'This itinerary extends beyond your selected end date. Add travel days or revise the dates.':''].filter(Boolean).join(' ');
  headerState();
}
async function rebuild(nextStops){
  if(!state.family||building)return;if(!$('trip-routing').checked){status('Enable route & place lookup to rebuild the journey.');return;}if(nextStops.length>38){status('A journey can hold up to 38 intermediate stops.');return;}
  building=true;document.querySelectorAll('[data-add-activity]').forEach(b=>b.disabled=true);discoveryController?.abort();const current=++version,abort=new AbortController();controller?.abort();controller=abort;const timer=setTimeout(()=>abort.abort(),60000);
  status('Rebuilding route legs and arrival times…');
  $('journey-change-status').textContent='Updating driving directions and arrival times for this journey…';
  let updated=false;
  try{const legs=journeyLegs(state.origin,state.destination,nextStops),results=[];
    if(!nextStops.length)results.push(state.family);
    else for(let i=0;i<legs.length;i++){
      const leg=legs[i],a=i===0?0:routeProgress(leg.from,state.family),b=i===legs.length-1?1:routeProgress(leg.to,state.family),defining=nextStops[i]?.defining||nextStops[i-1]?.defining;
      const via=!nextStops.some(s=>s.defining)&&!defining&&b>a?Array.from({length:3},(_,j)=>routePoint(state.family,a+(b-a)*(j+1)/4)):[];
      const result=validateDrivingGeometry(await drivingRoute(leg.from,leg.to,{signal:abort.signal,via}),leg.from,leg.to);result.feature.properties.mode='drive';results.push(result);
    }
    if(current!==version)return;state.stops=nextStops;state.legs=legs;state.results=results;state.manual=false;dirty=true;renderItinerary();paintMap(true);syncManual();ensurePostcard(collect());status('Itinerary rebuilt. Save Trip to keep the new route and timing.');
    $('journey-change-status').textContent='Route updated. The new stop and driving times are in your itinerary. Save Trip when ready.';
    updated=true;updateActivityButtons();stageTo('itinerary-stage');
  }catch(error){if(current===version){
    const message=error.name==='AbortError'?'Route rebuild timed out. Your previous itinerary is unchanged.':error.message+' Your previous itinerary is unchanged.';
    status(message);$('journey-change-status').textContent=message;
  }}
  finally{clearTimeout(timer);if(current===version){building=false;controller=null;updateActivityButtons();}}
  if(updated&&current===version&&state.stops===nextStops)await discoverJourney();
  return updated;
}
$('journey-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!$('trip-routing').checked){status('Enable route & place lookup before sending locations to the providers.');return;}
  cancelRequests();const current=version,abort=new AbortController();controller=abort;let timer;$('map-trip').disabled=true;
  try{
    cleanPlan({title:title(),dates:{start:$('trip-start').value,end:$('trip-end').value},legs:[{mode:'car',from:inputPoint($('trip-origin')),to:inputPoint($('trip-destination'))}]});
    status('Locating your origin and destination…');const origin=await resolveLocation(inputPoint($('trip-origin')),abort.signal,'origin'),destination=await resolveLocation(inputPoint($('trip-destination')),abort.signal,'destination');
    if(current!==version)return;
    // The traveler may need time to inspect the geographic candidates. Apply the
    // 60-second timeout only to the routing provider, not the confirmation dialog.
    timer=setTimeout(()=>abort.abort(),60000);
    status('Comparing driving corridors…');let routes;
    try{routes=await drivingAlternatives(origin,destination,{signal:abort.signal});}catch(error){if(abort.signal.aborted)throw error;routes=[await drivingRoute(origin,destination,{signal:abort.signal})];}
    if(!routes.length)throw Error('No usable driving route found.');
    const credible=[],rejected=[];
    for(const route of routes){
      try{credible.push(validateDrivingGeometry(route,origin,destination));}
      catch(error){rejected.push(error.message);}
    }
    if(!credible.length)throw Error(rejected[0]||'No geographically credible route found. Recheck both places.');
    if(current!==version)return;const families=routeFamilies(credible);state={...emptyState(),origin,destination,families,family:families[0],legs:journeyLegs(origin,destination),results:[families[0]]};
    putPoint($('trip-origin'),origin);putPoint($('trip-destination'),destination);dirty=true;$('anchor-form').hidden=false;$('fit-trip').disabled=false;
    renderFamilies();renderItinerary();paintMap(true);syncManual();ensurePostcard(collect());status(`${families.length} distinct ${families.length===1?'route':'routes'} found. Choose activities to build your journey.`);stageTo('route-stage');
    controller=null;clearTimeout(timer);$('map-trip').disabled=false;await discoverJourney();
  }catch(error){if(current===version)status(error.name==='AbortError'?'Route lookup cancelled or timed out.':error.message);}
  finally{clearTimeout(timer);if(current===version){controller=null;$('map-trip').disabled=false;}}
});
function resetDiscovery(){
  $('route-activities').replaceChildren(el('p','Choose a part of your drive to find stops.'));
  $('destination-activities').replaceChildren(el('p','Explore the destination after choosing a route.'));
  $('overnight-opportunities').hidden=true;$('overnight-areas').replaceChildren();
  $('anchor-form').hidden=!state.family;
  $('route-anchor-tools').hidden=!state.family;
  $('explore-route').disabled=!state.family;
  $('retry-discovery').disabled=!state.family||!$('trip-routing').checked;
  $('open-town-search').disabled=!state.family||!$('trip-routing').checked;
  const dialog=$('stop-search-dialog');if(dialog.open)dialog.close();
  $('stop-search-results').replaceChildren();
  $('stop-search-status').textContent='';
  $('town-results-section').hidden=true;
  $('town-results-cards').replaceChildren();
  $('town-results-state').textContent='';
  $('route-activity-results').replaceChildren();
  $('journey-discovery-status').textContent=state.family?'Choose an area below or search near a town.':'Choose a route to find stops.';
}
function activityDetails(activity,zone,destination=false){
  const route=journeyRoute(),progress=routeProgress(activity.location,route),offset=distanceToRoute(activity.location,route.feature.geometry.coordinates),detourMiles=offset*2*1.35,detourMinutes=Math.ceil(detourMiles/35*60);
  activity.progress=progress;activity.detourMinutes=detourMinutes;activity.detourMiles=detourMiles;
  const known=places.find(p=>distanceMiles(activity.location,p.access)<.3&&p.closure?.status!=='closed'),previous=known&&publications.find(e=>e.place_id===known.id);if(previous)activity.previous=previous.id;
  const stay=activity.overnight?'Overnight stay':`${durationLabel(activity.minutes)} activity`;
  return destination?`${distanceMiles(state.destination,activity.location).toFixed(1)} mi from arrival · ${stay} · local drive not yet routed`:`Around ${durationLabel(route.minutes*progress)} into the drive · ≈${durationLabel(detourMinutes)} extra drive / ≈${detourMiles.toFixed(1)} mi · ${stay}`;
}
function selected(activity){return [...state.stops,...state.destinationActivities].some(s=>s.id===activity.id);}
function updateActivityButtons(){
  document.querySelectorAll('[data-add-activity]').forEach(b=>{
    const chosen=[...state.stops,...state.destinationActivities].some(s=>s.id===b.dataset.addActivity);
    const labels={drive:'Review Stop',destination:'Review Activity',overnight:'Review Overnight'};
    b.textContent=chosen?'Added to Journey':labels[b.dataset.changeKind]||'Review Stop';
    b.disabled=chosen||building;
  });
}
// One confirmation point for every itinerary mutation. Place searches, previews,
// and map focus never modify the saved journey. The actual road route is rebuilt
// only after explicit confirmation.
let proposedChange=null;
function reviewTripChange({heading,explanation,details=[],action,buttonLabel='Apply Change'}){
  if(!state.family){status('Choose a driving route first.');return;}
  const town=$('stop-search-dialog'),fromTown=town.open;
  if(fromTown)town.close();
  const dialog=$('trip-change-dialog');
  $('trip-change-title').textContent=heading;
  $('trip-change-route').textContent='Your journey: '+state.origin.label+' → '+state.destination.label+' · '+state.family.label;
  $('trip-change-details').replaceChildren(el('p',explanation,'change-description'),...details.map(x=>el('p',x,'change-detail')));
  $('confirm-trip-change').textContent=buttonLabel;
  proposedChange={action,fromTown};
  dialog.showModal();
  $('cancel-trip-change').focus();
}
function closeTripReview(approved=false){
  const proposal=proposedChange;
  proposedChange=null;
  const dialog=$('trip-change-dialog');
  if(dialog.open)dialog.close();
  if(!proposal)return;
  if(approved){
    Promise.resolve().then(proposal.action).catch(error=>status('Could not update this trip: '+error.message));
  }else if(proposal.fromTown&&state.family&&$('trip-routing').checked){
    const town=$('stop-search-dialog');
    if(!town.open)town.showModal();
  }
}
$('cancel-trip-change').addEventListener('click',()=>closeTripReview(false));
$('confirm-trip-change').addEventListener('click',()=>closeTripReview(true));
$('trip-change-dialog').addEventListener('cancel',e=>{e.preventDefault();closeTripReview(false);});
function reviewActivityAddition(activity,destination=false){
  const isOvernight=!!activity.overnight;
  const heading=isOvernight?'Add an Overnight Break?':destination?'Add a Destination Activity?':'Add a Stop to the Drive?';
  const explanation=isOvernight?
    activity.name+' will divide your driving into travel days. No accommodation will be reserved.':
    destination?activity.name+' will be placed after arrival. The driving corridor stays unchanged.':
    activity.name+' will become a stop on your selected route. Driving legs and arrival times will be recalculated.';
  const details=[
    isOvernight?'Rest starts a new travel day; check lodging and dog access separately.':
    destination?'Duration: '+durationLabel(activity.minutes)+'. Local transport after arrival is not routed.':
    'Planned visit: '+durationLabel(activity.minutes)+'. Estimated extra driving: about '+durationLabel(activity.detourMinutes||0)+'.',
    !destination&&!isOvernight?'The road route may differ from the estimate after the stop is inserted.':'Nothing is booked or added to the Atlas Directory.'
  ];
  reviewTripChange({heading,explanation,details,
    buttonLabel:isOvernight?'Add Overnight Break':destination?'Add Destination Activity':'Add Drive Stop',
    action:async()=>{
      if(destination){
        if(state.destinationActivities.length>=40){status('A journey can hold up to 40 destination activities.');$('journey-change-status').textContent='This journey has reached the destination activity limit.';return;}
        state.destinationActivities.push({...activity});dirty=true;
        renderItinerary();paintMap();updateActivityButtons();
        status('Destination activity added. Save Trip to keep it. Local transfers are not included.');
        $('journey-change-status').textContent=activity.name+' added after arrival. Save Trip to keep this choice.';
        stageTo('itinerary-stage');
      }else{
        if(building)return;
        await rebuild([...state.stops,{...activity}].sort((a,b)=>a.progress-b.progress));
      }
    }
  });
}
function activityCard(activity,zone,destination=false){
  const card=el('article',null,'trip-activity'),detail=activityDetails(activity,zone,destination);
  card.append(el('p',activity.categoryLabel,'activity-kind'),el('h4',activity.name));
  if(activity.source==='National Park Service public POI')card.append(el('p','National Park Service · official mapped location','activity-source'));
  card.append(el('p',detail,'activity-measures'));
  const disclosure=el('details',null,'activity-more');
  disclosure.append(el('summary','Access, dog rules & visit details'),el('p',activity.dog,'activity-dog'),el('p',activity.why));
  if(activity.notes)disclosure.append(el('p',activity.notes,'activity-accuracy'));
  if(!destination)disclosure.append(el('small','Detour times are approximate. Adding the place calculates a real driving route.'));
  for(const source of activity.links||[]){const link=el('a',source.label);link.href=source.url;link.target='_blank';link.rel='noopener';disclosure.append(link);}
  if(activity.previous){const link=el('a','Previously in The Atlas');link.href=`${base}edition/${activity.previous}/`;disclosure.append(link);}
  const add=button(selected(activity)?'Already Added':activity.overnight?'Review Overnight':destination?'Review Activity':'Review Stop',()=>{
    if(selected(activity)||building)return;
    reviewActivityAddition(activity,destination);
  });
  add.dataset.addActivity=activity.id;
  add.dataset.changeKind=activity.overnight?'overnight':destination?'destination':'drive';
  add.disabled=selected(activity);
  const preview=button('Show on Map',()=>{
    if(!map)return;
    if($('stop-search-dialog').open)$('stop-search-dialog').close();
    map.setMarkers([pointFeature('origin',state.origin.label,state.origin),pointFeature('destination',state.destination.label,state.destination),
      ...state.stops.map(s=>pointFeature(s.id,s.name,s.location)),pointFeature(activity.id,activity.name,activity.location)]);
    map.focus(activity.id);$('close-activity').hidden=false;stageTo('route-stage');
  });
  const actions=el('div',null,'trip-activity-actions');actions.append(add,preview);card.append(actions,disclosure);
  return card;
}
async function cachedDiscovery(point,options={}){
  const cacheKey=[point.lat.toFixed(3),point.lng.toFixed(3),options.overnight||false,options.radius||6000].join(':');
  if(discoveryCache.has(cacheKey))return discoveryCache.get(cacheKey);
  // Official NPS visitor-facing locations come first: they are meaningful,
  // source-attributed outdoor discoveries, not chain-store business matches.
  let official=[],npsError=null;
  try{
    official=await discoverNpsActivities(point,{signal:options.signal,radius:20000});
  }catch(error){if(options.signal?.aborted)throw error;npsError=error;}
  if(official.length>=4&&new Set(official.map(a=>a.category)).size>=2){discoveryCache.set(cacheKey,official);return official;}
  try{
    const publicPlaces=await discoverActivities(point,options);
    const ids=new Set(official.map(a=>a.id));
    const combined=[...official,...publicPlaces.filter(a=>!ids.has(a.id))].slice(0,18);
    if(combined.length)discoveryCache.set(cacheKey,combined);
    return combined;
  }catch(error){
    if(official.length){discoveryCache.set(cacheKey,official);return official;}
    throw npsError?Error('NPS and local place providers could not be reached. '+error.message):error;
  }
}
async function discoverJourney(){
  if(!state.family||!$('trip-routing').checked)return;
  discoveryController?.abort();areaSearchController?.abort();areaSearchController=null;
  const abort=new AbortController();discoveryController=abort;
  const current=version,journey=journeyRoute();
  resetDiscovery();
  const zones=opportunityZones(journey),nights=overnightZones(journey);
  const routeBox=$('route-activities'),resultBox=$('route-activity-results');
  let found=0,lookups=0,failed=0;
  const fresh=()=>current===version&&!abort.signal.aborted;
  const updateSummary=()=>{
    if(!fresh())return;
    $('journey-discovery-status').textContent=found?
      `${found} places found. Choose one to add to your trip, or explore another area.`:
      failed?'Place suggestions are temporarily unavailable. Search a town or try again later.':
      lookups?'No places found here. Try another part of your drive or a town search.':
      'Choose an area of the drive or search a town for places to stop.';
  };
  // Show potential overnight areas as a single collapsed optional panel.
  // They are corridor locations, not verified hotels.
  if(nights.length){
    $('overnight-opportunities').hidden=false;$('overnight-opportunities').open=false;
    const box=$('overnight-areas');
    for(const zone of nights){
      const name=`Overnight area ${zone.day}`;
      const item={id:zone.id,name,location:{...zone.point,label:name},minutes:0,overnight:true,category:'overnight',categoryLabel:'Overnight area',dog:'Accommodation dog policies are unverified — confirm before booking.',why:`Around ${durationLabel(zone.minute)} into the drive. A corridor reference point, not a hotel.`,links:[],progress:zone.progress};
      box.append(activityCard(item,zone));
    }
  }
  async function searchSection(zone,buttonEl){
    if(!fresh())return;
    routeBox.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===buttonEl)));
    resultBox.replaceChildren(el('p',`Searching near ${durationLabel(zone.minute)} into the drive…`,'discovery-message'));
    buttonEl.disabled=true;
    try{
      const nearby=await cachedDiscovery(zone.point,{signal:abort.signal,radius:3500});
      if(!fresh())return;
      const leads=nearby.map(a=>({...a})).filter(a=>{
        activityDetails(a,zone);
        // Official park overlooks and trailheads can be worthwhile optional detours:
        // show a few even when they exceed a tight default detour tolerance,
        // with the extra driving time stated plainly on their cards.
        const limit=Number($('trip-detour').value);
        return (a.detourMinutes<=limit||(a.confidence==='official-location'&&a.detourMinutes<=Math.max(60,limit)))&&a.progress>.02&&a.progress<.98;
      }).slice(0,8);
      resultBox.replaceChildren(...(leads.length?leads.map(a=>activityCard(a,zone)):[
        el('p',nearby.length?'Places were found, but outside your detour limit. Increase the limit in Plan or try another area.':'No named places in this area. Try another part of the drive or search a town.','discovery-message')
      ]));
      found+=leads.length;lookups++;
    }catch(error){
      if(!fresh())return;
      failed++;
      resultBox.replaceChildren(el('p','Place search is unavailable for this area. Choose another area or try again later.','discovery-message'));
    }finally{if(fresh()){buttonEl.disabled=false;updateSummary();}}
  }
  if(zones.length){
    for(const [i,zone] of zones.entries()){
      const choice=button(`${durationLabel(zone.minute)} into the drive`,()=>searchSection(zone,choice));
      choice.className='route-area-button';
      choice.setAttribute('aria-pressed','false');
      routeBox.append(choice);
    }
  }else routeBox.append(el('p','This is a shorter drive. Explore places at your destination or search a town.'));
  $('journey-discovery-status').textContent='Looking for a few good stopping points…';
  // At most one automatic corridor query. The remaining parts are user-initiated,
  // rather than a barrage of overlapping searches against public infrastructure.
  if(zones.length){
    const middle=Math.floor((zones.length-1)/2);
    await searchSection(zones[middle],routeBox.children[middle]);
  }
  if(!fresh())return;
  const destBox=$('destination-activities');
  if(failed){
    destBox.replaceChildren(el('p','Public discovery is currently busy. You can search a town using the button above.','discovery-message'));
    updateSummary();return;
  }
  destBox.replaceChildren(el('p','Checking the destination…','discovery-message'));
  try{
    const activities=await cachedDiscovery(state.destination,{signal:abort.signal,radius:3500});
    if(!fresh())return;
    destBox.replaceChildren(...(activities.length?activities.map(a=>activityCard({...a},null,true)):[
      el('p','No named places returned here. Search a nearby town for more options.','discovery-message')
    ]));
    found+=activities.length;lookups++;
  }catch(error){
    if(!fresh())return;
    failed++;
    destBox.replaceChildren(el('p','Destination suggestions are currently unavailable.','discovery-message'));
  }
  updateSummary();
}
$('explore-route').addEventListener('click',()=>{if(state.family)stageTo('build-stage');});
const mapThemeKey='rupert-travel-map-theme-v1';
let travelMapTheme='day';
try{const saved=localStorage.getItem(mapThemeKey);if(['day','dusk','night'].includes(saved))travelMapTheme=saved;}catch{}
function setMapAppearance(choice){
  if(!['day','dusk','night'].includes(choice))return;
  travelMapTheme=choice;
  document.querySelectorAll('[data-travel-theme]').forEach(btn=>
    btn.setAttribute('aria-pressed',String(btn.dataset.travelTheme===choice)));
  $('route-stage').dataset.mapTheme=choice;
  map?.setTravelTheme?.(choice);
  try{localStorage.setItem(mapThemeKey,choice);}catch{}
}
document.querySelectorAll('[data-travel-theme]').forEach(btn=>
  btn.addEventListener('click',()=>setMapAppearance(btn.dataset.travelTheme)));
setMapAppearance(travelMapTheme);
function openTownSearch(){
  if(!state.family||!$('trip-routing').checked)return;
  $('stop-search-dialog').showModal();
  $('stop-search-place').focus();
}
$('open-town-search').addEventListener('click',openTownSearch);
$('return-town-results').addEventListener('click',openTownSearch);
$('close-town-search').addEventListener('click',()=>$('stop-search-dialog').close());
// Closing the town dialog does not abort discovery. The results are retained
// in the Build the Journey section and can be revisited at any point.
$('retry-discovery').addEventListener('click',()=>{
  if(!state.family)return;
  if(!$('trip-routing').checked){status('Enable route & place lookup to search public place data.');return;}
  discoverJourney();
});
$('stop-search-form').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!state.family){$('stop-search-status').textContent='Choose a route first.';return;}
  if(!$('trip-routing').checked){$('stop-search-status').textContent='Enable route & place lookup in Plan to search public place data.';return;}
  const search=$('stop-search-place').value.trim(),submit=$('stop-search-form').querySelector('button[type="submit"]');
  if(!search)return;
  areaSearchController?.abort();
  // A user-initiated town search takes priority over slow automatic discovery.
  // It may be closed without losing the query or results.
  discoveryController?.abort();
  $('journey-discovery-status').textContent='Town search requested. Automatic route suggestions paused.';
  const abort=new AbortController();areaSearchController=abort;const current=version;
  const stateLine=$('town-results-state'),title=$('town-results-title'),persisted=$('town-results-cards');
  $('town-results-section').hidden=false;
  title.textContent='Places near '+search;
  stateLine.textContent='Searching near '+search+'… You can close the popup; this search continues.';
  $('stop-search-status').textContent=stateLine.textContent;
  persisted.replaceChildren();$('stop-search-results').replaceChildren();
  submit.disabled=true;
  try{
    const point=await resolveLocation({label:search},abort.signal,'activity search area');
    if(current!==version||abort.signal.aborted)return;
    stateLine.textContent='Looking for places around '+point.label+'…';
    $('stop-search-status').textContent=stateLine.textContent;
    const activities=await cachedDiscovery(point,{signal:abort.signal,radius:4500,interactive:true});
    if(current!==version||abort.signal.aborted)return;
    const nearDestination=distanceMiles(point,state.destination)<=10;
    const townOffset=distanceToRoute(point,state.family.feature.geometry.coordinates);
    const offCorridor=townOffset>25&&!nearDestination?
      ' This town is about '+Math.round(townOffset)+' mi from your selected route (straight-line). Treat these as side-trip ideas, not convenient roadside stops.':'';
    const progress=routeProgress(point,state.family);
    const zone={point,progress,minute:state.family.minutes*progress};
    const buildCards=()=>activities.map(a=>activityCard({...a},zone,nearDestination));
    persisted.replaceChildren(...buildCards());
    if($('stop-search-dialog').open)$('stop-search-results').replaceChildren(...buildCards());
    // No outbound generic search or syndicated business listings. Only
    // grounded POIs from NPS or OSM appear as candidate activity cards.
    const outcome=(activities.length?
      activities.length+' mapped places near '+point.label+'. Review a stop before adding it; check dog access.':
      'No suitable named places were returned near '+point.label+'. Try another town or add a known place directly.')+offCorridor;
    stateLine.textContent=outcome;
    $('stop-search-status').textContent=outcome;
    $('journey-discovery-status').textContent=activities.length?
      activities.length+' town suggestions are ready below.':'No places found near '+point.label+'. Try another town.';
  }catch(error){
    if(!abort.signal.aborted&&current===version){
      const message='Town search could not finish: '+error.message;
      stateLine.textContent=message;$('stop-search-status').textContent=message;
      persisted.replaceChildren();
      $('stop-search-results').replaceChildren();
      $('journey-discovery-status').textContent='Place sources are temporarily unavailable. You can still review a named place with the tool inside Explore a Town.';
    }
  }finally{if(areaSearchController===abort){areaSearchController=null;submit.disabled=false;}}
});
$('known-place-form').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!state.family||!$('trip-routing').checked){$('known-place-status').textContent='Choose a route and enable place lookup first.';return;}
  const field=$('known-place-input'),name=field.value.trim(),placement=$('known-place-placement').value;
  if(!name)return;
  const abort=new AbortController();const current=version;
  areaSearchController?.abort();areaSearchController=abort;
  const submit=$('known-place-form').querySelector('button[type="submit"]');
  submit.disabled=true;$('known-place-status').textContent='Confirming the location of '+name+'…';
  try{
    const point=await resolveLocation({label:name},abort.signal,'custom travel stop');
    if(current!==version||abort.signal.aborted)return;
    const progress=routeProgress(point,state.family);
    const detourMiles=distanceToRoute(point,state.family.feature.geometry.coordinates)*2*1.35;
    const stop={
      id:'custom-'+(crypto.randomUUID?.()||Date.now().toString(36)),name:point.label,
      location:point,minutes:40,category:'custom',categoryLabel:'Place you selected',
      dog:'Dog policy is unverified. Check access and opening hours before visiting.',
      why:'A place selected by you, not a verified public recommendation.',links:[],
      progress,detourMinutes:Math.ceil(detourMiles/35*60),detourMiles
    };
    $('known-place-status').textContent='Location confirmed. Review its effect before adding.';
    reviewActivityAddition(stop,placement==='destination');
  }catch(error){
    if(current===version&&!abort.signal.aborted)$('known-place-status').textContent='Could not confirm this place: '+error.message;
  }finally{if(areaSearchController===abort){areaSearchController=null;submit.disabled=false;}}
});
$('anchor-form').addEventListener('submit',async e=>{
  e.preventDefault();if(building||!state.family)return;
  if(!$('trip-routing').checked){status('Enable lookup to locate the route-defining town.');return;}
  const current=version,abort=new AbortController();
  try{
    status('Finding the town to route through…');
    const point=await resolveLocation({label:$('trip-anchor').value},abort.signal,'route waypoint');
    if(current!==version)return;
    const overnight=$('anchor-overnight').checked;
    const stop={id:`anchor-${crypto.randomUUID?.()||Date.now().toString(36)}`,
      name:point.label,location:point,minutes:overnight?0:45,category:'town',
      categoryLabel:'Route-defining town',defining:true,overnight,
      dog:'Check the specific dog-access rules of activities and accommodation.',
      why:'A town chosen to shape the road route.',links:[],progress:routeProgress(point,state.family)};
    const offset=distanceToRoute(point,state.family.feature.geometry.coordinates);
    reviewTripChange({
      heading:'Route Through '+point.label+'?',
      explanation:'This makes '+point.label+' a required waypoint. The driving corridor and estimated arrival times will be recalculated.',
      details:['Current corridor: '+state.family.label+'. Distance from its current line: about '+offset.toFixed(1)+' mi.',
        overnight?'Also split the journey into travel days here; no lodging will be booked.':'Include a '+durationLabel(stop.minutes)+' stop in the itinerary.',
        'You can remove or reorder the waypoint in the itinerary afterward.'],
      buttonLabel:'Recalculate via This Town',
      action:async()=>{const applied=await rebuild([...state.stops,stop].sort((a,b)=>a.progress-b.progress));if(applied)$('trip-anchor').value='';}
    });
    status('Review the route change before applying it.');
  }catch(error){status(error.message);}
});
$('fit-trip').addEventListener('click',()=>{paintMap();fitRoute(true);});
$('close-activity').addEventListener('click',()=>{paintMap();fitRoute(true);});
$('save-trip').addEventListener('click',save);$('new-trip').addEventListener('click',()=>{if(dirty&&!confirm('Start a new trip and discard unsaved edits?'))return;load();status('New trip.');});
$('export-trips').addEventListener('click',()=>{try{if(building||controller)throw Error('Wait for the route update to finish before exporting.');let exportPlans=plans;if(dirty){const draft=collect();exportPlans=plans.filter(p=>p.id!==draft.id).concat(draft);}const blob=new Blob([JSON.stringify({schema_version:1,plans:exportPlans},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='rupert-travel-backup.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Backup exported, including the current draft.');}catch(error){status(error.message);}});
$('import-trips').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;const incoming=readBackup(await file.text()),next=[...plans];for(const p of incoming)if(!next.some(x=>x.id===p.id))next.push(p);if(next.length>100)throw Error('Too many journeys.');const added=next.length-plans.length;if(persist(next)){savedList();status(`Imported ${added} journeys; existing plans were kept.`);}}catch(error){status('Import failed: '+error.message);}finally{e.target.value='';}});
$('trip-routing').addEventListener('change',()=>{
  $('retry-discovery').disabled=!state.family||!$('trip-routing').checked;
  $('open-town-search').disabled=!state.family||!$('trip-routing').checked;
  if(!$('trip-routing').checked){
    cancelRequests();if($('stop-search-dialog').open)$('stop-search-dialog').close();
    status('Lookup disabled. The mapped itinerary stays local; no further locations will be sent.');
  }
});
for(const id of ['trip-start','trip-end','trip-depart','trip-title'])$(id).addEventListener('input',()=>{dirty=true;renderItinerary();});
for(const id of ['trip-origin','trip-destination'])$(id).addEventListener('input',()=>{cancelRequests();dirty=true;if(state.family)status('Endpoints changed. Find Routes to update this journey.');});
$('trip-detour').addEventListener('change',()=>{dirty=true;if(state.family)discoverJourney();});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});

// Existing multimodal/manual capabilities remain an advanced escape hatch.
function addManualLeg(leg={mode:'car',from:{label:''},to:{label:''}},stop={}){
  if($('trip-legs').children.length>=40){status('A journey can hold up to 40 legs.');return;}const row=el('li',null,'trip-leg'),mode=el('select');mode.className='leg-mode';for(const [value,label]of Object.entries({car:'Drive',air:'Flight',ferry:'Ferry',rail:'Train',walk:'Walk'})){const o=el('option',label);o.value=value;mode.append(o);}mode.value=leg.mode;
  const from=el('input'),to=el('input');from.className='leg-from';to.className='leg-to';from.maxLength=to.maxLength=200;from.setAttribute('list','travel-locations');to.setAttribute('list','travel-locations');putPoint(from,leg.from);putPoint(to,leg.to);
  const duration=el('input');duration.type='number';duration.min='0';duration.max='10080';duration.value=leg.minutes??'';duration.className='leg-duration';const note=el('input');note.className='leg-note';note.value=stop.note||'';note.maxLength=500;const pause=el('input');pause.type='number';pause.min='0';pause.max='1440';pause.value=stop.minutes??30;pause.className='leg-pause';
  const durationField=field('Transit duration (minutes)',duration),stopFields=el('div',null,'leg-stops');stopFields.append(field('Stop note (optional)',note),field('Stop duration (minutes)',pause));const update=()=>{durationField.hidden=mode.value==='car';stopFields.hidden=mode.value!=='car';};mode.addEventListener('change',update);update();
  row.append(field('Travel by',mode),field('From',from),field('To',to),durationField,stopFields);if(stop.location)row.dataset.stop=JSON.stringify(stop);
  const actions=el('div',null,'leg-actions');actions.append(button('Move Earlier',()=>{if(row.previousElementSibling)row.before(row.previousElementSibling);dirty=true;}),button('Move Later',()=>{if(row.nextElementSibling)row.after(row.nextElementSibling);dirty=true;}),button('Remove Leg',()=>{row.remove();dirty=true;}));row.append(actions);$('trip-legs').append(row);
}
function syncManual(){$('trip-legs').replaceChildren();state.legs.forEach((leg,i)=>addManualLeg(leg,state.stops[i]?{note:state.stops[i].name,minutes:state.stops[i].minutes}:{}));}
$('add-leg').addEventListener('click',()=>{addManualLeg();dirty=true;});
$('apply-legs').addEventListener('click',async()=>{
  if(!$('trip-routing').checked){status('Enable lookup to resolve and route manual legs.');return;}cancelRequests();const current=version,abort=new AbortController();controller=abort;const timer=setTimeout(()=>abort.abort(),60000);
  try{const rows=[...$('trip-legs').children],manual_stops=[];const legs=rows.map((row,i)=>{const note=row.querySelector('.leg-note').value,mode=row.querySelector('.leg-mode').value;let stored;try{stored=JSON.parse(row.dataset.stop);}catch{}if(mode==='car'&&note)manual_stops.push({leg:i+1,note,minutes:Number(row.querySelector('.leg-pause').value),...(stored?.location?{location:stored.location,place_id:stored.place_id}:{})});return {mode,from:inputPoint(row.querySelector('.leg-from')),to:inputPoint(row.querySelector('.leg-to')),minutes:row.querySelector('.leg-duration').value};});
    const plan=cleanPlan({title:title(),dates:{start:$('trip-start').value,end:$('trip-end').value},legs,manual_stops}),results=[];
    for(let i=0;i<plan.legs.length;i++){const leg=plan.legs[i];status(`Mapping manual leg ${i+1}…`);leg.from=await resolveLocation(leg.from,abort.signal);leg.to=await resolveLocation(leg.to,abort.signal);if(leg.mode==='car'){const stop=manual_stops.find(s=>s.leg===i+1);results[i]=validateDrivingGeometry(await drivingRoute(leg.from,leg.to,{signal:abort.signal,via:stop?.location?[stop.location]:[]}),leg.from,leg.to);results[i].feature.properties.mode='drive';}else results[i]={feature:{type:'Feature',properties:{mode:leg.mode},geometry:{type:'LineString',coordinates:[[leg.from.lng,leg.from.lat],[leg.to.lng,leg.to.lat]]}},minutes:leg.minutes||0,miles:'0'};}
    if(current!==version)return;state={...emptyState(),manual:true,legs:plan.legs,results,legacyStops:plan.manual_stops,origin:plan.legs[0].from,destination:plan.legs.at(-1).to};putPoint($('trip-origin'),state.origin);putPoint($('trip-destination'),state.destination);dirty=true;renderFamilies();renderItinerary();paintMap(true);resetDiscovery();ensurePostcard(collect());$('fit-trip').disabled=false;status('Manual itinerary mapped. Transit connectors are schematic; transit times are entered manually.');stageTo('itinerary-stage');
  }catch(error){if(current===version)status(error.message);}finally{clearTimeout(timer);if(current===version)controller=null;}
});
$('postcard-file').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10000000)throw Error('Choose a JPEG, PNG or WebP illustration under 10 MB.');const bitmap=await createImageBitmap(file),scale=Math.min(1,1000/bitmap.width,1000/bitmap.height),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const c=canvas.getContext('2d');c.fillStyle='#F3EFE5';c.fillRect(0,0,canvas.width,canvas.height);c.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const image=canvas.toDataURL('image/jpeg',.82);if(image.length>1500000)throw Error('That picture is too large; use a simpler illustration.');postcard={image,caption:$('postcard-caption').value.trim()||title().slice(0,160)};$('postcard-caption').value=postcard.caption;paintPostcard();dirty=true;status('Artwork replaced. Save Trip to keep it.');}catch(error){status(error.message);}finally{e.target.value='';}});
$('postcard-caption').addEventListener('input',()=>{if(postcard){captionEdited=true;postcard.caption=$('postcard-caption').value;paintPostcard();dirty=true;}});
$('remove-postcard').addEventListener('click',()=>{try{postcard=null;ensurePostcard(collect());dirty=true;status('Automatic artwork restored.');}catch(error){status(error.message);}});
load();savedList();
if(new URLSearchParams(location.search).has('qa')){
  const details=el('details',null,'trip-qa'),readout=el('pre');details.append(el('summary','Route fit diagnostics'),button('Inspect Route Fit',()=>{
    const routes=state.results.filter(Boolean),bounds=wholeJourneyBounds(routes,state.origin,state.destination),points=routes.flatMap(r=>r.feature.geometry.coordinates);
    readout.textContent=JSON.stringify({families:state.families.length,legs:state.legs.length,stops:state.stops.length,bounds,coordinates:points.length,completeGeometryCovered:!!bounds&&points.every(([x,y])=>x>=bounds[0][0]&&x<=bounds[1][0]&&y>=bounds[0][1]&&y<=bounds[1][1]),mapAvailable:!!map,camera:map?.raw.getBounds().toArray()||null,minimumZoom:map?.raw.getMinZoom()??null},null,2);
  }),readout);$('route-stage').append(details);
}
(async()=>{try{const initial=routeBounds(places.map(p=>pointFeature(p.id,p.name,p.access)));map=await createMap($('travel-map'),{base,theme:'light',travel:true,touch:matchMedia('(pointer:coarse)').matches,bounds:initial});$('trip-map-status').textContent='';setMapAppearance(travelMapTheme);map.on('select',id=>{const activity=[...state.stops,...state.destinationActivities].find(s=>s.id===id);if(activity){map.focus(id);$('close-activity').hidden=false;status(activity.name+' · '+activity.dog);}else fitRoute();});map.on('trouble',text=>$('trip-map-status').textContent=text);map.on('lost',()=>{$('trip-map-status').textContent='The browser released the map graphics. Reload to restore the map; the itinerary stays usable.';map.destroy();map=null;});new ResizeObserver(()=>map?.resize()).observe($('travel-map'));paintMap(true);
    // Read-only QA evidence: route bounds, camera and itinerary; never publish the user's locations.
    if(new URLSearchParams(location.search).has('qa'))window.__travelQA=()=>({families:state.families.length,legs:state.legs.length,stops:state.stops.length,destinationActivities:state.destinationActivities.length,bounds:wholeJourneyBounds(state.results.filter(Boolean),state.origin,state.destination),camera:map?.raw.getBounds().toArray(),zoom:map?.raw.getZoom(),minZoom:map?.raw.getMinZoom()});
  }catch(error){$('trip-map-status').textContent='Map unavailable. Route choices and the itinerary remain usable.';}})();
