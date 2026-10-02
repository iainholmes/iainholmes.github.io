import { automaticPostcard } from './core/postcard.js';
import { createMap } from './map/maplibre-provider.js';
import { validPoint, drivingRoute, drivingAlternatives } from './core/routing.js';
import { pointFeature, distanceMiles, distanceToRoute, routeBounds, geocodeLocation } from './core/trip-map.js';
import { cleanPlan, readBackup } from './core/travel.js';
import { durationLabel, routeFamilies, routePoint, routeProgress, wholeJourneyBounds, opportunityZones, overnightZones, journeyLegs, journeySchedule } from './core/journey.js';
import { discoverActivities, areaName } from './core/discovery.js';

const key='rupert-travel-v1', base=document.body.dataset.base||'', $=id=>document.getElementById(id);
const places=JSON.parse($('travel-places').textContent),references=JSON.parse($('travel-references').textContent),publications=JSON.parse($('travel-publications').textContent);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,action)=>{const n=el('button',text);n.type='button';n.addEventListener('click',action);return n;};
const field=(label,input)=>{const n=el('label',label);n.append(input);return n;};
const status=text=>{$('trip-status').textContent=text;};
const emptyState=()=>({origin:null,destination:null,families:[],family:null,stops:[],destinationActivities:[],legs:[],results:[],manual:false,legacyStops:[]});
let captionEdited=false;
let state=emptyState(),plans=[],activeId=null,dirty=false,postcard=null,canPersist=true,map=null,version=0,controller=null,discoveryController=null,building=false;
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
    row.append(info,button('Open',()=>{if(dirty&&!confirm('Open this journey and discard unsaved edits?'))return;load(p);savedList();status('Trip opened. Saved route geometry is available without another lookup.');}),button('Delete',()=>{if(row.querySelector('.trip-delete-confirm'))return;const confirmation=el('div',null,'trip-delete-confirm');confirmation.append(el('p',`Delete “${p.title}” from this browser? Export a backup first to keep a copy.`),button('Confirm Delete',()=>{if(persist(plans.filter(x=>x.id!==p.id))){if(activeId===p.id){activeId=null;dirty=true;}savedList();status('Saved trip deleted. The editor is kept as an unsaved draft.');}}),button('Keep Trip',()=>confirmation.remove()));row.append(confirmation);confirmation.querySelector('button').focus();}));box.append(row);
  }
  if(plans.length)box.append(button('Clear All Saved Trips',()=>{if(box.querySelector('.clear-trips-confirm'))return;const confirmation=el('div',null,'clear-trips-confirm'),input=el('input');input.autocomplete='off';const remove=button('Delete All Trips',()=>{if(input.value!=='DELETE ALL')return;if(persist([])){activeId=null;dirty=true;savedList();status('All saved trips cleared. The editor is kept as an unsaved draft.');}});remove.disabled=true;input.addEventListener('input',()=>remove.disabled=input.value!=='DELETE ALL');confirmation.append(el('p',`Delete all ${plans.length} saved trips? Export a backup first.`),field('Type DELETE ALL to confirm',input),remove,button('Keep Trips',()=>confirmation.remove()));box.append(confirmation);input.focus();}));
}
function cancelRequests(){version++;controller?.abort();controller=null;discoveryController?.abort();discoveryController=null;building=false;$('map-trip').disabled=false;}
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
  if(state.family){$('anchor-form').hidden=false;$('journey-discovery-status').textContent='Saved activities are restored. Find Routes to refresh public place suggestions.';}
  dirty=false;
}
async function resolveLocation(endpoint,signal){
  const label=endpoint.label.trim();if(!label)throw Error('Enter an origin and destination.');
  if(label.toLowerCase()==='home'){let home;try{home=JSON.parse(localStorage.getItem('rupert-location-v1'));}catch{}if(!validPoint(home?.point))throw Error('Set home in Atlas, or enter an origin here.');return {label:'Home',...home.point};}
  if(validPoint(endpoint))return endpoint;
  const known=places.find(p=>[p.name,p.short_name,p.access?.name].some(s=>s?.toLowerCase()===label.toLowerCase())),ref=Object.values(references).find(p=>p.label.toLowerCase()===label.toLowerCase());
  if(known)return {label,lat:known.access.lat,lng:known.access.lng};if(ref)return {label,lat:ref.lat,lng:ref.lng};
  const parts=label.split(',').map(s=>s.trim());if(parts.length===2&&parts.every(s=>s!==''&&Number.isFinite(Number(s)))){const point={lat:Number(parts[0]),lng:Number(parts[1])};if(validPoint(point))return {label,...point};}
  if(locations.has(label))return {label,...locations.get(label)};const point=await geocodeLocation(label,{signal});locations.set(label,point);return {label,lat:point.lat,lng:point.lng};
}
function renderFamilies(){
  const box=$('route-families');box.replaceChildren();
  if(!state.families.length){box.append(el('p',state.manual?'Manual journey. Apply the legs to calculate road routes.':'Enter your origin and destination to compare routes.'));return;}
  const fastest=Math.min(...state.families.map(r=>r.minutes));
  for(const family of state.families){const card=el('article',null,'route-family');card.classList.toggle('is-selected',family.id===state.family?.id);card.append(el('h3',family.label),el('p',`${Math.round(Number(family.miles)).toLocaleString()} mi · ${durationLabel(family.minutes)} drive`,'route-figures'),el('p',family.minutes===fastest?'Fastest mapped route':`+${durationLabel(family.minutes-fastest)} vs fastest`),el('p',family.corridor?`Corridor: ${family.corridor}`:'Road corridor returned by OSRM'));
    const mix=el('p',family.mix||'Discover walks, treats, outdoor meals and scenic pauses.','route-mix');card.append(mix);
    const choose=button(family.id===state.family?.id?'Route Selected':'Choose This Route',async()=>{if(building)return;if(state.stops.length&&!confirm('Switch routes and clear the selected along-route stops? Destination activities will be kept.'))return;cancelRequests();state.family=family;state.stops=[];state.legs=journeyLegs(state.origin,state.destination);state.results=[family];state.manual=false;dirty=true;renderFamilies();renderItinerary();paintMap(true);headerState();syncManual();await discoverJourney();});choose.setAttribute('aria-pressed',String(family.id===state.family?.id));card.append(choose);box.append(card);
  }
}
function fitRoute(){if(!map)return;const bounds=wholeJourneyBounds(state.results.filter(Boolean),state.origin,state.destination);if(bounds){map.select(null);map.fit(bounds,{padding:matchMedia('(max-width:759.98px)').matches?36:60,maxZoom:12});}$('close-activity').hidden=true;}
function journeyRoute(){return state.results.length>1?{...state.family,minutes:state.results.reduce((n,r)=>n+r.minutes,0),miles:String(state.results.reduce((n,r)=>n+Number(r.miles),0)),feature:{type:'Feature',properties:{mode:'drive'},geometry:{type:'LineString',coordinates:state.results.flatMap(r=>r.feature.geometry.coordinates)}}}:state.results[0]||state.family;}
function paintMap(fit=false){
  if(!map)return;map.setRoutes(state.results.filter(Boolean).map(r=>({...r.feature,properties:{...r.feature.properties,mode:r.feature.properties.mode||'drive'}})));
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
function renderItinerary(){
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
  const needsNight=state.results.some(r=>r?.minutes>540);$('overnight-warning').hidden=!needsNight;$('overnight-warning').textContent='An uninterrupted leg exceeds a sensible travel day. Add an overnight stop above; these estimates do not assume continuous driving is a practical plan.';
  headerState();
}
async function rebuild(nextStops){
  if(!state.family||building)return;if(!$('trip-routing').checked){status('Enable route & place lookup to rebuild the journey.');return;}if(nextStops.length>38){status('A journey can hold up to 38 intermediate stops.');return;}
  building=true;discoveryController?.abort();const current=++version,abort=new AbortController();controller?.abort();controller=abort;const timer=setTimeout(()=>abort.abort(),60000);
  status('Rebuilding route legs and arrival times…');
  try{const legs=journeyLegs(state.origin,state.destination,nextStops),results=[];
    if(!nextStops.length)results.push(state.family);
    else for(let i=0;i<legs.length;i++){
      const leg=legs[i],a=i===0?0:routeProgress(leg.from,state.family),b=i===legs.length-1?1:routeProgress(leg.to,state.family),defining=nextStops[i]?.defining||nextStops[i-1]?.defining;
      const via=!nextStops.some(s=>s.defining)&&!defining&&b>a?Array.from({length:3},(_,j)=>routePoint(state.family,a+(b-a)*(j+1)/4)):[];
      const result=await drivingRoute(leg.from,leg.to,{signal:abort.signal,via});result.feature.properties.mode='drive';results.push(result);
    }
    if(current!==version)return;state.stops=nextStops;state.legs=legs;state.results=results;state.manual=false;dirty=true;renderItinerary();paintMap(true);syncManual();ensurePostcard(collect());status('Itinerary rebuilt. Save Trip to keep the new route and timing.');updateActivityButtons();
  }catch(error){if(current===version)status(error.name==='AbortError'?'Route rebuild timed out. The previous itinerary has been kept.':error.message+' The previous itinerary has been kept.');}
  finally{clearTimeout(timer);if(current===version){building=false;controller=null;}}
  if(current===version&&state.stops===nextStops)await discoverJourney();
}
$('journey-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!$('trip-routing').checked){status('Enable route & place lookup before sending locations to the providers.');return;}
  cancelRequests();const current=version,abort=new AbortController();controller=abort;const timer=setTimeout(()=>abort.abort(),60000);$('map-trip').disabled=true;
  try{
    cleanPlan({title:title(),dates:{start:$('trip-start').value,end:$('trip-end').value},legs:[{mode:'car',from:inputPoint($('trip-origin')),to:inputPoint($('trip-destination'))}]});
    status('Locating your origin and destination…');const origin=await resolveLocation(inputPoint($('trip-origin')),abort.signal),destination=await resolveLocation(inputPoint($('trip-destination')),abort.signal);
    status('Comparing driving corridors…');let routes;
    try{routes=await drivingAlternatives(origin,destination,{signal:abort.signal});}catch(error){if(abort.signal.aborted)throw error;routes=[await drivingRoute(origin,destination,{signal:abort.signal})];}
    if(!routes.length)throw Error('No usable driving route found.');
    if(current!==version)return;const families=routeFamilies(routes);state={...emptyState(),origin,destination,families,family:families[0],legs:journeyLegs(origin,destination),results:[families[0]]};
    putPoint($('trip-origin'),origin);putPoint($('trip-destination'),destination);dirty=true;$('anchor-form').hidden=false;$('fit-trip').disabled=false;
    renderFamilies();renderItinerary();paintMap(true);syncManual();ensurePostcard(collect());status(`${families.length} distinct ${families.length===1?'route':'routes'} found. Choose activities to build your journey.`);
    controller=null;clearTimeout(timer);$('map-trip').disabled=false;await discoverJourney();
  }catch(error){if(current===version)status(error.name==='AbortError'?'Route lookup cancelled or timed out.':error.message);}
  finally{clearTimeout(timer);if(current===version){controller=null;$('map-trip').disabled=false;}}
});
function resetDiscovery(){
  $('route-activities').replaceChildren(el('p','Useful stops will appear around natural journey segments.'));$('destination-activities').replaceChildren(el('p','Explore the destination after choosing a route.'));$('overnight-opportunities').hidden=true;$('overnight-areas').replaceChildren();$('anchor-form').hidden=!state.family;$('journey-discovery-status').textContent='Choose a route to discover places for Rupert along the way.';
}
function activityDetails(activity,zone,destination=false){
  const route=journeyRoute(),progress=routeProgress(activity.location,route),offset=distanceToRoute(activity.location,route.feature.geometry.coordinates),detourMiles=offset*2*1.35,detourMinutes=Math.ceil(detourMiles/35*60);
  activity.progress=progress;activity.detourMinutes=detourMinutes;activity.detourMiles=detourMiles;
  const known=places.find(p=>distanceMiles(activity.location,p.access)<.3&&p.closure?.status!=='closed'),previous=known&&publications.find(e=>e.place_id===known.id);if(previous)activity.previous=previous.id;
  const stay=activity.overnight?'Overnight stay':`${durationLabel(activity.minutes)} activity`;
  return destination?`${distanceMiles(state.destination,activity.location).toFixed(1)} mi from arrival · ${stay} · local drive not yet routed`:`Around ${durationLabel(route.minutes*progress)} into the drive · ≈${durationLabel(detourMinutes)} extra drive / ≈${detourMiles.toFixed(1)} mi · ${stay}`;
}
function selected(activity){return [...state.stops,...state.destinationActivities].some(s=>s.id===activity.id);}
function updateActivityButtons(){document.querySelectorAll('[data-add-activity]').forEach(b=>{const chosen=[...state.stops,...state.destinationActivities].some(s=>s.id===b.dataset.addActivity);b.textContent=chosen?'Added to Trip':'Add to Trip';b.disabled=chosen;});}
function activityCard(activity,zone,destination=false){
  const card=el('article',null,'trip-activity'),detail=activityDetails(activity,zone,destination);
  card.append(el('p',activity.categoryLabel,'activity-kind'),el('h4',activity.name),el('p',detail,'activity-measures'),el('p',activity.dog,'activity-dog'),el('p',activity.why));
  if(!destination)card.append(el('p',activity.overnight?'This stay starts a new travel day.':Math.abs(activity.progress-zone.progress)*journeyRoute().minutes<=45?'This activity can serve as a natural break.':'A worthwhile corridor stop.'));
  if(!destination)card.append(el('small','Detour estimates use distance from the corridor. Adding the stop calculates the actual road route.'));
  for(const source of activity.links||[]){const link=el('a',source.label);link.href=source.url;link.target='_blank';link.rel='noopener';card.append(link);}
  if(activity.previous){const link=el('a','Previously in The Atlas');link.href=`${base}edition/${activity.previous}/`;card.append(link);}
  const add=button(selected(activity)?'Added to Trip':'Add to Trip',()=>{if(selected(activity)||building)return;if(destination){if(state.destinationActivities.length>=40){status('A journey can hold up to 40 destination activities.');return;}state.destinationActivities.push({...activity});dirty=true;renderItinerary();paintMap();updateActivityButtons();status('Destination activity appended after arrival. Local transfers are not included.');}else rebuild([...state.stops,{...activity}].sort((a,b)=>a.progress-b.progress));});add.dataset.addActivity=activity.id;add.disabled=selected(activity);card.append(add);
  const preview=button('Show on Map',()=>{if(!map)return;map.setMarkers([pointFeature('origin',state.origin.label,state.origin),pointFeature('destination',state.destination.label,state.destination),...state.stops.map(s=>pointFeature(s.id,s.name,s.location)),pointFeature(activity.id,activity.name,activity.location)]);map.focus(activity.id);$('close-activity').hidden=false;});card.append(preview);return card;
}
async function cachedDiscovery(point,options){const cacheKey=[point.lat.toFixed(2),point.lng.toFixed(2),options.overnight||false].join(':');if(discoveryCache.has(cacheKey))return discoveryCache.get(cacheKey);const result=await discoverActivities(point,options);discoveryCache.set(cacheKey,result);return result;}
async function discoverJourney(){
  if(!state.family||!$('trip-routing').checked)return;discoveryController?.abort();const abort=new AbortController();discoveryController=abort;const current=version,journey=journeyRoute();
  resetDiscovery();$('anchor-form').hidden=false;$('journey-discovery-status').textContent='Looking for walks, treats, patios, markets and scenic stops…';
  const zones=opportunityZones(journey),nights=overnightZones(journey),seen=new Set();let found=0,failures=0;
  // Overnight planning does not wait for the separate public activity provider.
  const overnightTask=(async()=>{
    if(!nights.length)return;$('overnight-opportunities').hidden=false;const box=$('overnight-areas');
    for(const zone of nights){if(current!==version||abort.signal.aborted)break;let name;try{name=await areaName(zone.point,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(10000)])});}catch{}
      if(current!==version||abort.signal.aborted)break;
      const activity={id:zone.id,name:name?`${name} area`:`Overnight area ${zone.day}`,location:{...zone.point,label:name||`Overnight area ${zone.day}`},minutes:0,overnight:true,category:'overnight',categoryLabel:'Overnight area',dog:'Accommodation dog policies are unverified — confirm before booking.',why:`Around ${durationLabel(zone.minute)} into the drive. A possible base between travel days; the mapped point is on the corridor, not a hotel.`,links:[],progress:zone.progress};box.append(activityCard(activity,zone));
    }
  })();
  // Queue destination and bounded corridor lookups; only one Overpass query runs at a time.
  const destinationTask=(async()=>{try{const activities=await cachedDiscovery(state.destination,{signal:abort.signal,radius:12000});if(current!==version||abort.signal.aborted)return;$('destination-activities').replaceChildren(...(activities.length?activities.map(a=>activityCard({...a},null,true)):[el('p','No suitable named places found in the public data. Try a nearby town as an added stop.')]));found+=activities.length;}catch{if(current===version&&!abort.signal.aborted){failures++;$('destination-activities').replaceChildren(el('p','Destination discovery is temporarily unavailable.'),button('Retry Destination Search',()=>discoverJourney()));}}})();
  const routeBox=$('route-activities');routeBox.replaceChildren();
  for(const zone of zones){
    if(current!==version||abort.signal.aborted)break;
    const section=el('section',null,'journey-segment'),heading=el('h4',`Around ${durationLabel(zone.minute)} into the drive`),cards=el('div',null,'activity-cards');section.append(heading,cards);cards.append(el('p','Checking nearby places…'));routeBox.append(section);
    try{const nearby=await cachedDiscovery(zone.point,{signal:abort.signal});if(current!==version||abort.signal.aborted)break;
      const activities=nearby.map(a=>({...a})).filter(a=>{activityDetails(a,zone);return a.detourMinutes<=Number($('trip-detour').value)&&!seen.has(a.id)&&a.progress>.02&&a.progress<.98;}).slice(0,6);activities.forEach(a=>seen.add(a.id));cards.replaceChildren(...(activities.length?activities.map(a=>activityCard(a,zone)):[el('p','No named activities within this detour tolerance in the public data.')]));found+=activities.length;
      const town=nearby.find(a=>a.category==='town');if(town)heading.textContent=`${town.name} area · around ${durationLabel(zone.minute)} into the drive`;
    }catch{if(current!==version||abort.signal.aborted)break;failures++;cards.replaceChildren(el('p','Public place lookup is temporarily unavailable for this segment.'));}
  }
  if(!zones.length)routeBox.append(el('p','A short journey: destination activities are likely the most useful stops.'));
  await Promise.all([destinationTask,overnightTask]);if(current!==version||abort.signal.aborted)return;
  const summary=`${found} activity leads found${failures?' · some search areas are temporarily unavailable':''}. Dog policies and opening hours need checking; nothing is added to the published Directory.`;$('journey-discovery-status').textContent=summary;if(failures)$('journey-discovery-status').append(' ',button('Retry Discovery',()=>discoverJourney()));
  const categories=[...new Set([...document.querySelectorAll('.activity-kind')].map(n=>n.textContent))].slice(0,4);state.family.mix=categories.length?`Activity mix: ${categories.join(' · ')}`:'No public activity leads found yet.';renderFamilies();
}
$('anchor-form').addEventListener('submit',async e=>{e.preventDefault();if(building)return;if(!$('trip-routing').checked){status('Enable lookup to locate the added town.');return;}const current=version,abort=new AbortController();try{status('Locating the added stop…');const point=await resolveLocation({label:$('trip-anchor').value},AbortSignal.timeout(20000));if(current!==version)return;const stop={id:`anchor-${crypto.randomUUID?.()||Date.now().toString(36)}`,name:point.label,location:point,minutes:45,category:'town',categoryLabel:'Route-defining stop',defining:true,overnight:$('anchor-overnight').checked,dog:'Check the specific dog-access rules of activities and accommodation.',why:'A town you chose to shape this journey.',links:[],progress:routeProgress(point,state.family)};await rebuild([...state.stops,stop].sort((a,b)=>a.progress-b.progress));$('trip-anchor').value='';}catch(error){status(error.message);}});
$('fit-trip').addEventListener('click',()=>{paintMap();fitRoute();});$('close-activity').addEventListener('click',()=>{paintMap();fitRoute();});
$('save-trip').addEventListener('click',save);$('new-trip').addEventListener('click',()=>{if(dirty&&!confirm('Start a new trip and discard unsaved edits?'))return;load();status('New trip.');});
$('export-trips').addEventListener('click',()=>{try{if(building||controller)throw Error('Wait for the route update to finish before exporting.');let exportPlans=plans;if(dirty){const draft=collect();exportPlans=plans.filter(p=>p.id!==draft.id).concat(draft);}const blob=new Blob([JSON.stringify({schema_version:1,plans:exportPlans},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='rupert-travel-backup.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Backup exported, including the current draft.');}catch(error){status(error.message);}});
$('import-trips').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;const incoming=readBackup(await file.text()),next=[...plans];for(const p of incoming)if(!next.some(x=>x.id===p.id))next.push(p);if(next.length>100)throw Error('Too many journeys.');const added=next.length-plans.length;if(persist(next)){savedList();status(`Imported ${added} journeys; existing plans were kept.`);}}catch(error){status('Import failed: '+error.message);}finally{e.target.value='';}});
$('trip-routing').addEventListener('change',()=>{if(!$('trip-routing').checked){cancelRequests();status('Lookup disabled. The mapped itinerary stays local; no further locations will be sent.');}});
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
    for(let i=0;i<plan.legs.length;i++){const leg=plan.legs[i];status(`Mapping manual leg ${i+1}…`);leg.from=await resolveLocation(leg.from,abort.signal);leg.to=await resolveLocation(leg.to,abort.signal);if(leg.mode==='car'){const stop=manual_stops.find(s=>s.leg===i+1);results[i]=await drivingRoute(leg.from,leg.to,{signal:abort.signal,via:stop?.location?[stop.location]:[]});results[i].feature.properties.mode='drive';}else results[i]={feature:{type:'Feature',properties:{mode:leg.mode},geometry:{type:'LineString',coordinates:[[leg.from.lng,leg.from.lat],[leg.to.lng,leg.to.lat]]}},minutes:leg.minutes||0,miles:'0'};}
    if(current!==version)return;state={...emptyState(),manual:true,legs:plan.legs,results,legacyStops:plan.manual_stops,origin:plan.legs[0].from,destination:plan.legs.at(-1).to};putPoint($('trip-origin'),state.origin);putPoint($('trip-destination'),state.destination);dirty=true;renderFamilies();renderItinerary();paintMap(true);resetDiscovery();ensurePostcard(collect());$('fit-trip').disabled=false;status('Manual itinerary mapped. Transit connectors are schematic; transit times are entered manually.');
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
(async()=>{try{const initial=routeBounds(places.map(p=>pointFeature(p.id,p.name,p.access)));map=await createMap($('travel-map'),{base,theme:'light',travel:true,touch:matchMedia('(pointer:coarse)').matches,bounds:initial});$('trip-map-status').textContent='';map.on('select',id=>{const activity=[...state.stops,...state.destinationActivities].find(s=>s.id===id);if(activity){map.focus(id);$('close-activity').hidden=false;status(activity.name+' · '+activity.dog);}else fitRoute();});map.on('trouble',text=>$('trip-map-status').textContent=text);map.on('lost',()=>{$('trip-map-status').textContent='The browser released the map graphics. Reload to restore the map; the itinerary stays usable.';map.destroy();map=null;});new ResizeObserver(()=>map?.resize()).observe($('travel-map'));paintMap(true);
    // Read-only QA evidence: route bounds, camera and itinerary; never publish the user's locations.
    if(new URLSearchParams(location.search).has('qa'))window.__travelQA=()=>({families:state.families.length,legs:state.legs.length,stops:state.stops.length,destinationActivities:state.destinationActivities.length,bounds:wholeJourneyBounds(state.results.filter(Boolean),state.origin,state.destination),camera:map?.raw.getBounds().toArray(),zoom:map?.raw.getZoom(),minZoom:map?.raw.getMinZoom()});
  }catch(error){$('trip-map-status').textContent='Map unavailable. Route choices and the itinerary remain usable.';}})();
