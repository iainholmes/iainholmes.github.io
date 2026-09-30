import { validPoint, drivingRoute } from './core/routing.js';
export function setupLocation({ getMap, features, onClear }) {
  const key='rupert-location-v1', form=document.getElementById('location-form'), enabled=document.getElementById('routing-enabled'), status=document.getElementById('location-status'), drive=document.getElementById('drive-status');
  let point=null, selected=null, controller=null;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { const saved=JSON.parse(localStorage.getItem(key)); if(validPoint(saved?.point)) {point=saved.point;enabled.checked=saved.routing===true;} } catch {}
  function save() {try{localStorage.setItem(key,JSON.stringify({point,routing:enabled.checked}));status.textContent='Home saved in this browser.';}catch{status.textContent='Home is available for this visit; this browser could not save it.';}}
  function refresh() {if(point){form.elements.lat.value=point.lat;form.elements.lng.value=point.lng;} getMap()?.setHome(point); document.getElementById('recenter').textContent=point ? 'Home view' : 'All places';}
  function clearRoute() {controller?.abort();controller=null;getMap()?.setRoutes([]);}
  async function route(id) {
    selected=id;clearRoute();const feature=features.find(f=>f.properties.id===id);
    if(!feature){drive.textContent='Select a place to plan the drive.';return;}
    const name=feature.properties.name;
    if(!point){drive.textContent=`${name} · Save home to see a driving route.`;return;}
    if(!enabled.checked){drive.textContent=`${name} · Enable driving routes in Home & driving routes to see the way there.`;return;}
    if(!getMap()){drive.textContent=`${name} · Driving routes need the map to load.`;return;}
    const current=new AbortController();controller=current;
    const timer=setTimeout(()=>current.abort(),12000);
    drive.textContent=`Finding the drive to ${name}…`;
    try{
      const [lng,lat]=feature.geometry.coordinates;
      const result=await drivingRoute(point,{lng,lat},{signal:current.signal});
      if(controller!==current || selected!==id || !enabled.checked)return;
      getMap()?.setRoutes([result.feature]);
      const coordinates=result.feature.geometry.coordinates, xs=coordinates.map(p=>p[0]),ys=coordinates.map(p=>p[1]);
      getMap()?.fit([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{duration:reduced()?0:600,padding:65});
      drive.textContent=`Home → ${name} · About ${result.minutes} min · ${result.miles} mi · OSRM estimate, without live traffic.`;
    }catch(e){if(controller!==current)return;drive.textContent=`${name} · ${e.name==='AbortError'?'Driving route timed out. Select the place to retry.':e.message}`;}finally{clearTimeout(timer);}
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
  enabled.addEventListener('change',()=>{save();if(selected)route(selected);});
  document.getElementById('forget-location').addEventListener('click',()=>{clearRoute();point=null;enabled.checked=false;form.reset();try{localStorage.removeItem(key);}catch{}refresh();selected=null;onClear();status.textContent='Home removed from this browser.';drive.textContent='Select a place to plan the drive.';});
  document.getElementById('recenter').addEventListener('click',()=>{clearRoute();selected=null;onClear();getMap()?.centerHome();drive.textContent=point?'Map centered on home.':'Showing all places.';});
  refresh();return {ready(){refresh();if(point)getMap()?.centerHome();if(selected)route(selected);},select:route,clear(){selected=null;clearRoute();drive.textContent='Select a place to plan the drive.';}};
}
