import { veilState, veilArtworkProblems, upcomingTravel, PENDING_TIME, DAY_LABEL } from './core/veil.js';
import { SLOTS } from './core/editions.js';
import { nyDateString, longDate, shortDate } from './core/dates.js';
import { saveVeilArrival } from './core/veil-arrival.js';
import { weekendAlmanac } from './core/almanac.js';
import { readBackup, TRAVEL_STORAGE_KEY } from './core/travel.js';
import { esc, photo, titleCase } from './core/render.js';

export function renderVeil(state, photos, base, trip = null) {
  const tile = (slot, entry) => {
    const { edition: e, published, withdrawn } = entry;
    const link = published || withdrawn;
    const name = `${DAY_LABEL[slot]} · ${titleCase(e.title)} · ${published ? 'Published' : withdrawn ? 'Withdrawn' : 'Unpublished, '+PENDING_TIME}`;
    const tag = link ? 'a' : 'div';
    return `<${tag} class="veil-tile${published ? ' is-published' : withdrawn ? ' is-withdrawn' : ' is-pending'}"${link ? ` href="${base}edition/${esc(e.id)}/"` : ''} aria-label="${esc(name)}"><span class="veil-thumbnail">${photo({id:e.photo_id},photos,base,{sizes:'(min-width: 760px) 92px, 54px',eager:true,cls:'veil-image'})}</span><span class="veil-tile-copy"><strong>${DAY_LABEL[slot]}</strong><span>${published ? 'Published' : withdrawn ? 'Withdrawn' : PENDING_TIME}</span></span></${tag}>`;
  };
  const { month, season, year, issue } = state.identity;
  const almanac = weekendAlmanac(state.weekend.start);
  const symbols = {
    sunset: '<path d="M2 15h20M6 12a6 6 0 0 1 12 0M12 2v2M3 5l2 2M21 5l-2 2M12 18v4m-3-3 3 3 3-3"/>',
    moon: '<path d="M16 3a9 9 0 1 0 5 14A9 9 0 0 1 16 3Z"/>',
    daylight: '<path d="M2 18h20M4 15a8 8 0 0 1 16 0M4 11v4h4m12-4v4h-4M12 2v2"/>'
  };
  const value = (label, symbol, text) => `<div class="veil-almanac-item"><dt><span class="veil-almanac-label">${label}</span><svg class="veil-almanac-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[symbol]}</svg></dt><dd>${esc(text)}</dd></div>`;
  const provenance = `Chapel Hill, N.C. · ${longDate(state.weekend.start).split(' ')[0]} ${shortDate(state.weekend.start).split(' ').slice(1).join(' ')}`;
  const group = (key, label) => `<section class="veil-week-group" aria-label="${label}"><h2 class="veil-group-title">${label}</h2><div class="veil-tiles veil-tiles-group">${SLOTS.map(slot=>tile(slot,state[key][slot])).join('')}</div></section>`;
  return `<div class="veil-plate"><div class="veil-lockup"><span class="veil-no" aria-label="Number ${issue}"><span class="veil-number-prefix">N<sup>o</sup>.</span> ${issue}</span><div class="veil-cycle"><span>${month}</span><small>${season} · ${year}</small></div></div><div class="veil-center"><div class="veil-recommendations"><div class="veil-band" aria-label="Previous and current recommendation previews">${group('previous','Previous Week')}${group('current','This Week')}</div>${trip ? `<a class="veil-travel" href="${base}travel/#saved-trips"><span>Upcoming Travel</span><strong>${esc(trip.title)}</strong><time datetime="${esc(trip.start)}">${esc(longDate(trip.start))}</time></a>` : ''}</div><div class="veil-portrait-territory" aria-hidden="true"><img class="veil-rupert-mark" src="${base}assets/img/rupert-portrait-outline.svg" alt=""></div></div><footer class="veil-almanac" aria-label="Calculated almanac for Chapel Hill, ${esc(longDate(state.weekend.start))}"><p class="veil-almanac-provenance">${esc(provenance)}</p><dl class="veil-almanac-values">${value('Sunset','sunset',almanac.sunset+' ET')}${value('Moon','moon',almanac.moon)}${value('Daylight','daylight',almanac.daylight)}</dl></footer></div>`;
}

export function setupVeil(base) {
  let veil = null, last = null, manifest = null, photos = null, busy = false, restore = () => {};
  const arrival = window.__atlasVeilArrival;
  delete window.__atlasVeilArrival;
  const dismissed = new Set();
  const isDismissed = key => { try { return dismissed.has(key) || sessionStorage.getItem(key)==='1'; } catch { return dismissed.has(key); } };
  function close(remember = false) {
    if (!veil) return;
    if (remember) { dismissed.add(last.dismissalKey); try { sessionStorage.setItem(last.dismissalKey,'1'); } catch {} }
    veil.remove(); veil = null; restore();
  }
  function localTrip(now) {
    try { const text = localStorage.getItem(TRAVEL_STORAGE_KEY); return text ? upcomingTravel(readBackup(text),nyDateString(now)) : null; } catch { return null; }
  }
  function lockPage() {
    const focus = document.activeElement, x = window.scrollX, y = window.scrollY;
    const bodyStyle = document.body.getAttribute('style'), htmlStyle = document.documentElement.getAttribute('style');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const schemeMeta = document.querySelector('meta[name="color-scheme"]');
    const themeBefore = themeMeta?.getAttribute('content');
    const schemeBefore = schemeMeta?.getAttribute('content');
    if (themeMeta) themeMeta.setAttribute('content','#1D2A3A');
    if (schemeMeta) schemeMeta.setAttribute('content','dark');
    const inert = new Map();
    const cover = node => { if (node!==veil && node instanceof HTMLElement && !inert.has(node)) { inert.set(node,node.inert); node.inert=true; } };
    [...document.body.children].forEach(cover);
    const observer = new MutationObserver(records => records.forEach(r=>r.addedNodes.forEach(cover)));
    observer.observe(document.body,{childList:true});
    Object.assign(document.body.style,{position:'fixed',top:`${-y}px`,left:`${-x}px`,width:'100%',overflow:'hidden'});
    document.documentElement.style.overflow='hidden';
    document.documentElement.classList.add('veil-active');
    const viewport = window.visualViewport;
    const sizeVeil = () => veil?.style.setProperty('--veil-visible-height', `${viewport ? viewport.height + viewport.offsetTop : window.innerHeight}px`);
    sizeVeil();
    viewport?.addEventListener('resize',sizeVeil); viewport?.addEventListener('scroll',sizeVeil);
    window.addEventListener('resize',sizeVeil);
    return () => {
      viewport?.removeEventListener('resize',sizeVeil); viewport?.removeEventListener('scroll',sizeVeil);
      window.removeEventListener('resize',sizeVeil);
      observer.disconnect(); inert.forEach((value,node)=>node.inert=value);
      for (const [node,style] of [[document.body,bodyStyle],[document.documentElement,htmlStyle]]) style===null ? node.removeAttribute('style') : node.setAttribute('style',style);
      document.documentElement.classList.remove('veil-active');
      if (themeMeta) themeBefore===null ? themeMeta.removeAttribute('content') : themeMeta.setAttribute('content',themeBefore);
      if (schemeMeta) schemeBefore===null ? schemeMeta.removeAttribute('content') : schemeMeta.setAttribute('content',schemeBefore);
      // Ignore CSS smooth-scroll preferences when returning to the exact previous reading position.
      const previous = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior='auto'; window.scrollTo(x,y); document.documentElement.style.scrollBehavior=previous;
      (focus?.isConnected && focus!==document.body && !focus.inert ? focus : document.getElementById('main'))?.focus({preventScroll:true});
    };
  }
  function reconcile(now) {
    if (!manifest || !photos) return;
    const state = veilState(manifest,now);
    if (!state.active || isDismissed(state.dismissalKey)) { close(); return; }
    const problems = veilArtworkProblems(state,photos);
    if (problems.length) { close(); console.warn('Rupert Atlas: frontispiece artwork integrity',problems.join('; ')); return; }
    if (veil && last.dismissalKey!==state.dismissalKey) close();
    last = state;
    const html = renderVeil(state,photos,base,localTrip(now));
    if (!veil) {
      veil=arrival?.veil?.isConnected ? arrival.veil : document.createElement('div'); veil.className='atlas-veil'; veil.tabIndex=-1;
      veil.setAttribute('role','dialog'); veil.setAttribute('aria-modal','true');
      veil.addEventListener('click',e=>{
        const link=e.target.closest('a[href]');
        if(link){
          e.stopPropagation();
          if(e.defaultPrevented)return;
          const destination=new URL(link.href,location.href);
          if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&link.target!=='_blank'&&destination.origin===location.origin){
            e.preventDefault();
            saveVeilArrival(veil,destination,manifest,photos);
            // Keep the frontispiece visible until the new document takes over.
            location.assign(destination.href);
          }
          return;
        }
        if(e.target.closest('button,input,select,textarea')){e.stopPropagation();return;}
        close(true);
      });
      veil.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
      if(!veil.isConnected)document.body.append(veil); restore=lockPage();
    }
    const wasFocused = veil.contains(document.activeElement), href = wasFocused && document.activeElement.getAttribute('href');
    if (veil.innerHTML!==html) { veil.innerHTML=html; if(href) [...veil.querySelectorAll('a')].find(a=>a.getAttribute('href')===href)?.focus({preventScroll:true}); }
    veil.setAttribute('aria-label',`The Rupert Atlas · ${state.identity.label}`);
    veil.dataset.cycle=state.weekend.start; veil.dataset.phase=state.phase;
    if (!veil.contains(document.activeElement)) veil.focus({preventScroll:true});
  }
  document.addEventListener('keydown',e=>{
    if(!veil)return;
    if(e.key==='Escape'){e.preventDefault();close(true);return;}
    if(e.key==='Tab'){
      const links=[...veil.querySelectorAll('a[href]')],i=links.indexOf(document.activeElement);
      const next = i<0 ? (e.shiftKey ? links.length-1 : 0) : (i+(e.shiftKey?-1:1)+links.length)%links.length;
      e.preventDefault(); (links.length ? links[next] : veil).focus({preventScroll:true});
    }
  });
  async function refresh() {
    if(busy)return; busy=true;
    try {
      const get = p => fetch(base+p,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(p);return r.json();});
      const next=await Promise.all([get('data/editions/index.json'),get('data/photos.json')]);
      [manifest,photos]=next;
    } catch { /* Keep the last verified manifest; never infer publication from a failed request. */ }
    finally { busy=false;reconcile(new Date()); }
  }
  if(arrival){
    [manifest,photos]=[arrival.manifest,arrival.photos];
    try { reconcile(new Date()); } catch { manifest=null;photos=null; }
    if(!veil){arrival.veil.remove();document.documentElement.classList.remove('veil-active');}
  }
  refresh(); setInterval(refresh,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.addEventListener('pageshow',refresh);
  window.addEventListener('storage',e=>{if(e.key===TRAVEL_STORAGE_KEY)reconcile(new Date());});
}
