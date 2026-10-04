import { validPoint, drivingRoute } from './core/routing.js';
import { durationLabel } from './core/journey.js';
import { trafficConfig } from './traffic-config.js';
import { trafficAvailable, trafficRoute, TRAFFIC_FRESH_MS, TRAFFIC_COLORS } from './core/traffic.js';
import { trafficCardStatus, trafficCardSwatch } from './core/traffic-card.js';
import { navigationLinks } from './core/navigation.js';
export function setupLocation({ getMap, features, onClear, onRouteDisplay }) {
  const key='rupert-location-v1', form=document.getElementById('location-form'), traffic=document.getElementById('traffic-enabled'), status=document.getElementById('location-status'), drive=document.getElementById('drive-status');
  let point=null, selected=null, controller=null, baseline=null, baselineKey=null, live=null, staleTimer=null;
  const configured=trafficAvailable(trafficConfig,location.origin), mapBox=document.querySelector('.atlas-map');
  const unavailable='Live traffic temporarily unavailable · showing baseline estimate';
  const trafficNote=document.getElementById('traffic-note');
  const providerName=trafficConfig.provider==='tomtom'?'TomTom':'Mapbox';
  const navigation=document.createElement('details');navigation.className='route-navigation wrap';navigation.hidden=true;mapBox?.parentElement.after(navigation);
  const credits=document.createElement('details');credits.className='traffic-credits';credits.hidden=true;trafficNote?.after(credits);
  const routeKey=(id)=>JSON.stringify([point?.lng,point?.lat,id]);
  function mode(on, incidents=[]) {mapBox?.classList.toggle('is-traffic',on);getMap()?.setTrafficMode?.(on);getMap()?.setTrafficIncidents?.(incidents);}
  const esc=s=>String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dossier(name, message, result, feature, notice='', {pending=false}={}) {
    const [lng,lat]=feature?.geometry.coordinates || [];
    const links=navigationLinks(point,{lng,lat});navigation.hidden=!result || !links.length;
    navigation.innerHTML=`<summary>Open Live Navigation</summary><div class="navigation-choices">${links.map(v=>`<a href="${esc(v.href)}" target="_blank" rel="noopener noreferrer">${esc(v.label)}</a>`).join('')}</div><p>Shares coordinates with the chosen service only when opened. Apple and Google use Home; Waze starts from your current location.</p>`;
    const selection=document.getElementById('atlas-selection'); if(selection) selection.textContent=name || 'Choose a Place';
    const context=document.getElementById('atlas-context'); if(context){const row=document.querySelector('.reg-row.is-selected'),region=row?.closest('.reg-group')?.dataset.region,access=row?.querySelector('.reg-start')?.textContent.replace(/^Start: /,'');context.textContent=name?[region,access].filter(Boolean).join(' · '):'';context.hidden=!context.textContent;}
    credits.hidden=result?.provider!=='tomtom';
    if(!credits.hidden)credits.innerHTML=`<summary>TomTom data credits</summary><p>${esc(result.copyright)}</p><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap copyright</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">Open Database License</a>`;
    const tomtomCredit=result?.traffic && result.provider==='tomtom'?'<span class="traffic-attribution"><a href="https://www.tomtom.com/legal/en_gb/product-attributions/" target="_blank" rel="noopener noreferrer">© TomTom</a></span>':'';
    getMap()?.setTrafficAttribution?.(tomtomCredit);
    const attribution=result?.provider==='tomtom'?'':`<span class="traffic-attribution"><a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener"><img src="${document.body.dataset.base || ''}assets/img/mapbox-logo.svg" alt="Mapbox" width="81" height="20"></a><span><a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">© Mapbox</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a></span></span>`;
    const level=result?.traffic ? trafficCardSwatch(result) : null;
    const swatch=level ? `<svg class="traffic-swatch" data-traffic="${level}" width="18" height="6" viewBox="0 0 18 6" aria-hidden="true"><path d="M0 3H18" fill="none" stroke="${TRAFFIC_COLORS[level]}" stroke-width="2"${level==='closure'?' stroke-dasharray="2.4 2"':level==='unknown'?' stroke-dasharray="4 3"':''}/></svg>` : '';
    const provider=result?.traffic ? `<small class="dossier-provider">${swatch}${esc(trafficCardStatus(result))}</small>${attribution}<small class="traffic-coverage"><span class="traffic-checked">Updated ${esc(new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(result.fetchedAt))}</span> · <button type="button" class="traffic-refresh">Refresh</button></small>` : '<small class="dossier-provider">OSRM Estimate · Traffic Not Included</small>';
    drive.innerHTML=`<span class="dossier-label"><i aria-hidden="true"></i>Driving Route</span><strong class="dossier-destination">${name ? 'Home → '+esc(name) : 'Select a Place'}</strong>${result ? `<div class="dossier-values"><span>${esc(durationLabel(result.minutes))}</span><b>${esc(result.miles)} mi</b></div>${provider}${notice?`<small class="traffic-fallback">${esc(notice)} <button type="button" class="traffic-refresh">Retry</button></small>`:''}` : `<p class="dossier-message">${esc(message)}${configured&&message.startsWith('Traffic estimate expired')?' <button type="button" class="traffic-refresh">Refresh</button>':''}</p>`}`;
    // Popup presentation only; pending/visible routing keeps the map to one card.
    onRouteDisplay?.(!!result || pending);
  }
  dossier('', 'Choose a directory entry or map marker.');
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { const saved=JSON.parse(localStorage.getItem(key)); if(validPoint(saved?.point)) point=saved.point; } catch {}
  if(traffic){traffic.checked=false;traffic.disabled=!configured;traffic.title=configured?`Traffic routing sends Home and destination coordinates to ${providerName}.`:'Live traffic is not available with the current OSRM routing service.';}
  if(configured && trafficNote) trafficNote.innerHTML=trafficConfig.provider==='tomtom'?'Optional TomTom routing sends only Home and destination coordinates, plus your IP address, browser request information and site origin. No typed address or location tracking is sent. Estimates expire after five minutes; returning to Atlas refreshes them. Ochre indicates no reported delay; amber minor delay, orange moderate, muted red major; red dashes a closure, grey dashes unknown traffic. Delay compares with free flow, not typical traffic. By enabling, you agree to the <a href="https://www.tomtom.com/en-gb/legal/third-party-product-terms/" target="_blank" rel="noopener noreferrer">TomTom end-user terms</a>. <a href="https://www.tomtom.com/en-gb/legal/privacy/" target="_blank" rel="noopener noreferrer">TomTom privacy</a>.':'Optional Mapbox routing sends only Home and destination coordinates, plus your IP address and site origin. No address or location tracking is sent. Estimates expire after five minutes; returning to Atlas refreshes them. Route colours: ochre low/normal, amber mild, orange moderate, muted red heavy/severe; red dashes indicate a closure, grey dashes unknown traffic. <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener">Mapbox privacy</a>.';
  function save() {try{localStorage.setItem(key,JSON.stringify({point}));status.textContent='Home saved in this browser. Selecting a place now calculates its driving route automatically.';}catch{status.textContent='Home is available for this visit; this browser could not save it.';}}
  function refresh() {if(point){form.elements.lat.value=point.lat;form.elements.lng.value=point.lng;} getMap()?.setHome(point); document.getElementById('recenter').textContent='Home';document.getElementById('recenter').disabled=!point||!getMap();}
  function clearRoute() {controller?.abort();controller=null;clearTimeout(staleTimer);live=null;mode(false);getMap()?.setRoutes([]);}
  async function timed(fn, signal) {
    const child=new AbortController(), abort=()=>child.abort();signal.addEventListener('abort',abort,{once:true});if(signal.aborted)child.abort();
    const timer=setTimeout(abort,12000);try{return await fn(child.signal);}finally{clearTimeout(timer);signal.removeEventListener('abort',abort);}
  }
  function draw(result, feature, {fit=true,notice=''}={}) {
    mode(!!result.traffic,result.incidents || []);getMap()?.setRoutes(result.features || [result.feature]);
    if(fit){const coordinates=result.feature.geometry.coordinates, xs=coordinates.map(p=>p[0]),ys=coordinates.map(p=>p[1]);getMap()?.fit([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{duration:reduced()?0:600,padding:65});}
    dossier(feature.properties.name,'',result,feature,notice);
  }
  async function route(id, {fit=true}={}) {
    selected=id;clearRoute();const feature=features.find(f=>f.properties.id===id);
    if(!feature){dossier('', 'Choose a directory entry or map marker.');return;}
    const name=feature.properties.name;
    if(!point){dossier(name, 'Save home in Home & Driving Routes to calculate the drive.');return;}
    if(!getMap()){dossier(name, 'Driving routes need the map to load.');return;}
    const current=new AbortController();controller=current;
    const keyNow=routeKey(id), wantsTraffic=!!(configured && traffic?.checked);
    if(baselineKey!==keyNow){baseline=null;baselineKey=null;}
    const stillCurrent=()=>controller===current && selected===id && routeKey(id)===keyNow && !current.signal.aborted;
    dossier(name, wantsTraffic?'Checking traffic…':'Calculating the drive…',undefined,undefined,'',{pending:true});
    try{
      const [lng,lat]=feature.geometry.coordinates;
      let notice='';
      if(wantsTraffic){
        try {
          const result=await timed(signal=>trafficRoute(point,{lng,lat},{config:trafficConfig,origin:location.origin,signal}),current.signal);
          if(!stillCurrent())return;
          live=result;draw(result,feature,{fit});
          staleTimer=setTimeout(()=>{
            if(live!==result || selected!==id)return;
            live=null;mode(false);getMap()?.setRoutes([]);
            if(baselineKey===keyNow && baseline)draw(baseline,feature,{fit:false,notice:'Traffic estimate expired · refresh for current conditions'});
            else dossier(name,'Traffic estimate expired. Refresh to check current conditions.');
          },TRAFFIC_FRESH_MS);
          return;
        }catch(error){if(!stillCurrent())return;notice=unavailable;traffic.checked=false;mode(false);}
      }
      const result=(wantsTraffic || !fit) && baselineKey===keyNow && baseline ? baseline : await timed(signal=>drivingRoute(point,{lng,lat},{signal}),current.signal);
      if(!stillCurrent())return;
      baseline=result;baselineKey=keyNow;draw(result,feature,{fit,notice});
    }catch(e){if(!stillCurrent())return;mode(false);dossier(name, e.name==='AbortError'?'Driving route timed out. Select the place to retry.':e.message);}
    finally{if(controller===current)controller=null;}
  }
  traffic?.addEventListener('change',()=>{if(selected)route(selected,{fit:false});else mode(false);});
  drive.addEventListener('click',e=>{if(e.target.closest('.traffic-refresh') && configured && selected){traffic.checked=true;route(selected,{fit:false});}});
  const foreground=()=>{if(document.visibilityState==='visible' && traffic?.checked && selected && point && !controller && (!live || Date.now()-live.fetchedAt>=TRAFFIC_FRESH_MS))route(selected,{fit:false});};
  document.addEventListener('visibilitychange',foreground);window.addEventListener('focus',foreground);window.addEventListener('pageshow',foreground);
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
  document.getElementById('forget-location').addEventListener('click',()=>{clearRoute();baseline=null;baselineKey=null;point=null;traffic && (traffic.checked=false);form.reset();try{localStorage.removeItem(key);}catch{}refresh();selected=null;onClear();status.textContent='Home removed from this browser.';dossier('', 'Choose a directory entry or map marker.');});
  document.getElementById('recenter').addEventListener('click',()=>{clearRoute();selected=null;onClear();getMap()?.centerHome();dossier('',point?'Map centered on home.':'Showing all places.');});
  refresh();return {hasHome:()=>!!point,ready(){refresh();if(point)getMap()?.centerHome();if(selected)route(selected);},select:route,clear(){selected=null;clearRoute();baseline=null;baselineKey=null;dossier('', 'Choose a directory entry or map marker.');}};
}
