// Runtime enhancement. Every page works without this file; it adds:
//  - the compact bar on desktop once the masthead scrolls away
//  - Tuesday/Thursday tabs (and swipe) on phones
//  - a manifest re-check, so a Thursday edition or Monday rollover appears without a rebuild
import { selectCurrentPair, pairKey } from './core/editions.js';
import { renderWeek } from './core/render.js';

const root = document.documentElement;
root.classList.add('js');
const base = document.body.dataset.base || '';

/* ---------- compact bar ---------- */
const mast = document.getElementById('masthead');
if (mast && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => document.body.classList.toggle('past-mast', !e.isIntersecting), { rootMargin: '-40px 0px 0px 0px' })
    .observe(mast);
}

/* ---------- This Week tabs ---------- */
const phone = window.matchMedia('(max-width: 759.98px)');
let teardown = () => {};

function setupTabs() {
  teardown();
  const week = document.querySelector('.week');
  if (!week) return;
  const list = week.querySelector('[role="tablist"]');
  const tabs = [...week.querySelectorAll('[role="tab"]')];
  const plates = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
  if (!list || tabs.length !== 2 || plates.some(p => !p)) return;

  if (!phone.matches) {
    list.hidden = true;
    root.classList.remove('js-tabs');
    plates.forEach(p => { p.hidden = false; p.removeAttribute('role'); p.removeAttribute('tabindex'); p.setAttribute('aria-labelledby', `${p.id}-h`); });
    teardown = () => {};
    return;
  }

  list.hidden = false;
  root.classList.add('js-tabs');
  plates.forEach((p, i) => { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', tabs[i].id); p.tabIndex = 0; });

  const select = (i, { focus = false, fromUser = false } = {}) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      plates[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
    if (fromUser) {
      history.replaceState(null, '', '#' + plates[i].dataset.slot);
      const top = list.getBoundingClientRect().top;
      const stuckAt = parseFloat(getComputedStyle(list).top) || 0;
      if (top <= stuckAt + 1) plates[i].scrollIntoView({ block: 'start' });
    }
  };

  const fromHash = plates.findIndex(p => '#' + p.dataset.slot === location.hash);
  const firstLive = plates.findIndex(p => !p.classList.contains('is-pending'));
  select(fromHash >= 0 ? fromHash : Math.max(0, firstLive));

  const onClick = e => { const i = tabs.indexOf(e.currentTarget); select(i, { fromUser: true }); };
  const onKey = e => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (next) { e.preventDefault(); select((i + next + 2) % 2, { focus: true, fromUser: true }); }
    if (e.key === 'Home') { e.preventDefault(); select(0, { focus: true, fromUser: true }); }
    if (e.key === 'End') { e.preventDefault(); select(1, { focus: true, fromUser: true }); }
  };
  tabs.forEach(t => t.addEventListener('click', onClick));
  list.addEventListener('keydown', onKey);

  // Swipe across a photograph switches choices.
  let sx = null, sy = null;
  const down = e => { sx = e.clientX; sy = e.clientY; };
  const up = e => {
    if (sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const cur = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      const i = dx < 0 ? Math.min(1, cur + 1) : Math.max(0, cur - 1);
      if (i !== cur) select(i, { fromUser: true });
    }
  };
  const photos = plates.map(p => p.querySelector('.p-photo')).filter(Boolean);
  photos.forEach(ph => { ph.addEventListener('pointerdown', down); ph.addEventListener('pointerup', up); ph.style.touchAction = 'pan-y'; });

  teardown = () => {
    tabs.forEach(t => t.removeEventListener('click', onClick));
    list.removeEventListener('keydown', onKey);
    photos.forEach(ph => { ph.removeEventListener('pointerdown', down); ph.removeEventListener('pointerup', up); });
  };
}

phone.addEventListener('change', setupTabs);
setupTabs();

/* ---------- manifest re-check ---------- */
async function recheck() {
  const week = document.querySelector('.week');
  if (!week) return;
  const get = p => fetch(base + p, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(p); return r.json(); });
  try {
    const [site, manifest] = await Promise.all([get('data/site.json'), get('data/editions/index.json')]);
    const now = site.review_clock ? new Date(site.review_clock) : new Date();
    const pair = selectCurrentPair(manifest, now);
    if (pairKey(pair) === week.dataset.pair) return;
    const ids = [pair?.tuesday?.id, pair?.thursday?.id].filter(Boolean);
    const [places, photos, ...eds] = await Promise.all([get('data/places.json'), get('data/photos.json'), ...ids.map(id => get(`data/editions/${id}.json`))]);
    const editions = Object.fromEntries(eds.map(e => [e.id, e]));
    const tpl = document.createElement('template');
    tpl.innerHTML = renderWeek(pair, editions, { base, places, photos });
    week.replaceWith(tpl.content);
    setupTabs();
  } catch (e) {
    // The pre-rendered page stays as it is. Nothing to tell the reader.
    console.warn('Rupert Atlas: re-check skipped', e);
  }
}
recheck();
