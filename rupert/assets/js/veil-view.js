import { veilState, veilArtworkProblems, upcomingTravel, PENDING_TIME, DAY_LABEL } from './core/veil.js';
import { SLOTS } from './core/editions.js';
import { nyDateString, longDate } from './core/dates.js';
import { weekendAlmanac } from './core/almanac.js';
import { readBackup, TRAVEL_STORAGE_KEY } from './core/travel.js';
import { esc, photo, titleCase } from './core/render.js';

export function renderVeil(state, photos, base, trip = null) {
  const tile = (slot, entry) => {
    const { edition: e, published, withdrawn } = entry;
    const link = published || withdrawn;
    const name = `${DAY_LABEL[slot]} · ${titleCase(e.title)} · ${published ? 'Published' : withdrawn ? 'Withdrawn' : 'Unpublished, '+PENDING_TIME}`;
    const tag = link ? 'a' : 'div';
    return `<${tag} class="veil-tile${published ? ' is-published' : withdrawn ? ' is-withdrawn' : ' is-pending'}"${link ? ` href="${base}edition/${esc(e.id)}/"` : ''} aria-label="${esc(name)}">${photo({id:e.photo_id},photos,base,{sizes:'(min-width: 760px) 144px, 64px',eager:true,cls:'veil-image'})}<strong>${DAY_LABEL[slot]}</strong><span>${published ? 'Published' : withdrawn ? 'Withdrawn' : PENDING_TIME}</span></${tag}>`;
  };
  const group = (key, label) => `<section class="veil-group" aria-label="${label}"><h2>${label}</h2><div class="veil-tiles">${SLOTS.map(slot=>tile(slot,state[key][slot])).join('')}</div></section>`;
  const { month, season, year, issue } = state.identity;
  const almanac = weekendAlmanac(state.weekend.start);
  return `<div class="veil-plate"><div class="veil-lockup"><span class="veil-no">No. ${issue}</span><div class="veil-cycle"><span>${month}</span><small>${season} · ${year}</small></div></div><div class="veil-center"><div class="veil-band">${group('current','This Week')}${group('previous','Previous Week')}</div>${trip ? `<a class="veil-travel" href="${base}travel/#saved-trips"><span>Upcoming Travel</span><strong>${esc(trip.title)}</strong><time datetime="${esc(trip.start)}">${esc(longDate(trip.start))}</time></a>` : ''}</div><footer class="veil-almanac" aria-label="Calculated almanac for Chapel Hill, ${esc(longDate(state.weekend.start))}"><span>Sunset ${esc(almanac.sunset)} ET</span><span>Daylight ${esc(almanac.daylight)}</span><span>${esc(almanac.moon)}</span></footer></div>`;
}

export function setupVeil(base) {
  const reviewMode = new URLSearchParams(window.location.search).get('veil') === 'review';
  // Temporary live-review clock: show the next natural Monday frontispiece without changing normal Friday behavior.
  const reviewNow = new Date('2026-10-05T12:00:00-04:00');
  let veil = null, last = null, manifest = null, photos = null, busy = false, restore = () => {};
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
    const inert = new Map();
    const cover = node => { if (node!==veil && node instanceof HTMLElement && !inert.has(node)) { inert.set(node,node.inert); node.inert=true; } };
    [...document.body.children].forEach(cover);
    const observer = new MutationObserver(records => records.forEach(r=>r.addedNodes.forEach(cover)));
    observer.observe(document.body,{childList:true});
    Object.assign(document.body.style,{position:'fixed',top:`${-y}px`,left:`${-x}px`,width:'100%',overflow:'hidden'});
    document.documentElement.style.overflow='hidden';
    document.documentElement.classList.add('veil-active');
    return () => {
      observer.disconnect(); inert.forEach((value,node)=>node.inert=value);
      for (const [node,style] of [[document.body,bodyStyle],[document.documentElement,htmlStyle]]) style===null ? node.removeAttribute('style') : node.setAttribute('style',style);
      document.documentElement.classList.remove('veil-active');
      // Ignore CSS smooth-scroll preferences when returning to the exact previous reading position.
      const previous = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior='auto'; window.scrollTo(x,y); document.documentElement.style.scrollBehavior=previous;
      (focus?.isConnected && focus!==document.body && !focus.inert ? focus : document.getElementById('main'))?.focus({preventScroll:true});
    };
  }
  function reconcile(now) {
    if (!manifest || !photos) return;
    if (reviewMode) now = reviewNow;
    const state = veilState(manifest,now);
    // Never let a review dismissal suppress the real Monday/Wednesday frontispiece later.
    if (reviewMode) state.dismissalKey = `rupert-veil-review:${state.weekend.start}:${state.phase}`;
    if (!state.active || isDismissed(state.dismissalKey)) { close(); return; }
    const problems = veilArtworkProblems(state,photos);
    if (problems.length) { close(); console.warn('Rupert Atlas: frontispiece artwork integrity',problems.join('; ')); return; }
    if (veil && last.dismissalKey!==state.dismissalKey) close();
    last = state;
    const html = renderVeil(state,photos,base,localTrip(now));
    if (!veil) {
      veil=document.createElement('div'); veil.className='atlas-veil'; veil.tabIndex=-1;
      veil.setAttribute('role','dialog'); veil.setAttribute('aria-modal','true');
      veil.addEventListener('click',e=>{if(e.target.closest('a,button,input,select,textarea')) { e.stopPropagation(); return; } close(true);});
      veil.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
      document.body.append(veil); restore=lockPage();
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
  refresh(); setInterval(refresh,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.addEventListener('pageshow',refresh);
  window.addEventListener('storage',e=>{if(e.key===TRAVEL_STORAGE_KEY)reconcile(new Date());});
}
