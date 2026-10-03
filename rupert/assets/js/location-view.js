import { validPoint, drivingRoute } from './core/routing.js';
import { durationLabel } from './core/journey.js';
export function setupLocation({ getMap, features, onClear }) {
  const key='rupert-location-v1', form=document.getElementById('location-form'), traffic=document.getElementById('traffic-enabled'), status=document.getElementById('location-status'), drive=document.getElementById('drive-status');
  let point=null, selected=null, controller=null;
  const esc=s=>String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dossier(name, message, result, feature) {
    const selection=document.getElementById('atlas-selection'); if(selection) selection.textContent=name || 'Choose a Place';
    const context=document.getElementById('atlas-context'); if(context){const row=document.querySelector('.reg-row.is-selected'),region=row?.closest('.reg-group')?.dataset.region,access=row?.querySelector('.reg-start')?.textContent.replace(/^Start: /,'');context.textContent=name?[region,access].filter(Boolean).join(' · '):'';context.hidden=!context.textContent;}
    drive.innerHTML=`<span class="dossier-label"><i aria-hidden="true"></i>Driving Route</span><strong class="dossier-destination">${name ? 'Home → '+esc(name) : 'Select a Place'}</strong>${result ? `<div class="dossier-values"><span>${esc(durationLabel(result.minutes))}</span><b>${esc(result.miles)} mi</b></div><p class="dossier-context">${esc(feature?.properties.status === 'recommended' ? 'This Week’s Recommendation' : 'Selected Destination')}</p><small class="dossier-provider">OSRM Baseline · Traffic Not Included</small>` : `<p class="dossier-message">${esc(message)}</p>`}`;
  }
  dossier('', 'Choose a directory entry or map marker.');
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { const saved=JSON.parse(localStorage.getItem(key)); if(validPoint(saved?.point)) point=saved.point; } catch {}
  if(traffic){traffic.checked=false;traffic.disabled=true;traffic.title='Live traffic is not available with the current OSRM routing service.';}
  function save() {try{localStorage.setItem(key,JSON.stringify({point}));status.textContent='Home saved in this browser. Selecting a place now calculates its driving route automatically.';}catch{status.textContent='Home is available for this visit; this browser could not save it.';}}
  function refresh() {if(point){form.elements.lat.value=point.lat;form.elements.lng.value=point.lng;} getMap()?.setHome(point); document.getElementById('recenter').textContent='Home';document.getElementById('recenter').disabled=!point||!getMap();}
  function clearRoute() {controller?.abort();controller=null;getMap()?.setRoutes([]);}
  async function route(id) {
    selected=id;clearRoute();const feature=features.find(f=>f.properties.id===id);
    if(!feature){dossier('', 'Choose a directory entry or map marker.');return;}
    const name=feature.properties.name;
    if(!point){dossier(name, 'Save home in Home & Driving Routes to calculate the drive.');return;}
    if(!getMap()){dossier(name, 'Driving routes need the map to load.');return;}
    const current=new AbortController();controller=current;
    const timer=setTimeout(()=>current.abort(),12000);
    dossier(name, 'Calculating the drive…');
    try{
      const [lng,lat]=feature.geometry.coordinates;
      const result=await drivingRoute(point,{lng,lat},{signal:current.signal});
      if(controller!==current || selected!==id)return;
      getMap()?.setRoutes([result.feature]);
      const coordinates=result.feature.geometry.coordinates, xs=coordinates.map(p=>p[0]),ys=coordinates.map(p=>p[1]);
      getMap()?.fit([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{duration:reduced()?0:600,padding:65});
      dossier(name, '', result, feature);
    }catch(e){if(controller!==current)return;dossier(name, e.name==='AbortError'?'Driving route timed out. Select the place to retry.':e.message);}finally{clearTimeout(timer);}
  }
  document.getElementById('address-form').addEventListener('submit',async e=>{
    e.preventDefault(); const addressForm=e.currentTarget, button=addressForm.querySelector('button'); button.disabled=true;
    status.textContent='Locating the address…';
    try {
      const url=new URL('https://nominatim.openstreetmap.org/search');url.search=new URLSearchParams({q:addressForm.elements.address.value,format:'jsonv2',limit:'1',countrycodes:'us'});
      const response=await fetch(url,{signal:AbortSignal.timeout(12000),referrerPolicy:'no-referrer'});
      if(!response.ok)throw Error('Address lookup is unavailable. Enter map coordinates instead.');
      const found=(await response.json())[0], next=found && {lat:Number(found.lat),lng:Number(found.lon)};
      if(!validPoint(next))throw Error('Address not found. Enter its map coordinates instead.');
      form.elements.lat.value=next.lat;form.elements.lng.value=next.lng;
      status.textContent=`Found: ${found.display_name}. Check the match, then save home.`;
    }catch(error){status.textContent=error.name==='TimeoutError'?'Address lookup timed out. Enter coordinates or try again.':error.message;}finally{button.disabled=false;}
  });
  form.addEventListener('submit',e=>{e.preventDefault();const next={lat:Number(form.elements.lat.value),lng:Number(form.elements.lng.value)};if(!validPoint(next))return;point=next;save();refresh();getMap()?.centerHome();if(selected)route(selected);});
  document.getElementById('forget-location').addEventListener('click',()=>{clearRoute();point=null;traffic && (traffic.checked=false);form.reset();try{localStorage.removeItem(key);}catch{}refresh();selected=null;onClear();status.textContent='Home removed from this browser.';dossier('', 'Choose a directory entry or map marker.');});
  document.getElementById('recenter').addEventListener('click',()=>{clearRoute();selected=null;onClear();getMap()?.centerHome();dossier('',point?'Map centered on home.':'Showing all places.');});
  refresh();return {hasHome:()=>!!point,ready(){refresh();if(point)getMap()?.centerHome();if(selected)route(selected);},select:route,clear(){selected=null;clearRoute();dossier('', 'Choose a directory entry or map marker.');}};
}
