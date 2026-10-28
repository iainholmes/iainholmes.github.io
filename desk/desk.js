/* Desk owns only its appearance and section navigation; applications own their data. */
(() => {
  'use strict';
  const eastern = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric'
  });
  const partsAt = date => Object.fromEntries(eastern.formatToParts(date)
    .filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  function appearanceAt(date) {
    const { hour } = partsAt(date);
    return hour >= 7 && hour < 21 ? 'day' : 'night';
  }
  function easternInstant(year, month, day, hour) {
    // 07:00 and 21:00 are unambiguous even on DST transition days.
    const local = Date.UTC(year, month - 1, day, hour);
    let instant = local;
    for (let i = 0; i < 4; i += 1) {
      const p = partsAt(new Date(instant));
      const adjustment = local - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      instant += adjustment;
      if (!adjustment) break;
    }
    return instant;
  }
  function nextBoundary(date) {
    const p = partsAt(date);
    const tomorrow = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
    return Math.min(...[
      easternInstant(p.year, p.month, p.day, 7),
      easternInstant(p.year, p.month, p.day, 21),
      easternInstant(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth() + 1, tomorrow.getUTCDate(), 7)
    ].filter(instant => instant > date.getTime()));
  }
  function sectionScrollPlan({ targetTop, toolbarHeight, viewportHeight, documentHeight, spacerHeight = 0 }) {
    const top = Math.max(0, targetTop - toolbarHeight - 12);
    const space = Math.max(0, Math.ceil(top + viewportHeight - (documentHeight - spacerHeight)));
    return { top, space };
  }
  function revealSelection(current, action, works) {
    const ids = new Set(works.map(work => work.id));
    if (action.type === 'chapter') return works.filter(work => work.chapter === action.id).map(work => work.id);
    if (action.type === 'reset') return [];
    if (action.type === 'return') return current.filter(id => works.find(work => work.id === id)?.chapter !== action.id);
    if (action.type === 'restore') {
      const valid = [...new Set(action.ids || [])].filter(id => ids.has(id));
      const chapter = works.find(work => work.id === valid[0])?.chapter;
      return valid.filter(id => works.find(work => work.id === id)?.chapter === chapter);
    }
    if (action.type === 'toggle' && ids.has(action.id)) {
      if (current.includes(action.id)) return current.filter(id => id !== action.id);
      const chapter = works.find(work => work.id === action.id).chapter;
      return [...current.filter(id => works.find(work => work.id === id)?.chapter === chapter), action.id];
    }
    return current;
  }
  function selectionForHash(hash, works) {
    if (hash.startsWith('#work-')) return works.filter(work => `#work-${work.id}` === hash).map(work => work.id);
    return works.filter(work => `#${work.chapter}` === hash).map(work => work.id);
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appearanceAt, nextBoundary, sectionScrollPlan, revealSelection, selectionForHash };
  }
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.chapter = 'home';
  root.dataset.initialReveal = window.location.hash.slice(1);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let manual = false;
  let timer;
  let button;
  function applyAppearance(appearance) {
    root.dataset.appearance = appearance;
    if (themeMeta) themeMeta.content = appearance === 'night' ? '#141f1b' : '#f3efe4';
    if (button) {
      button.setAttribute('aria-pressed', String(appearance === 'night'));
      button.querySelector('.appearance-label').textContent = appearance === 'night' ? 'Night' : 'Day';
      button.title = `Switch to ${appearance === 'night' ? 'day' : 'night'} appearance`;
    }
  }
  function automaticAppearance() {
    clearTimeout(timer);
    if (manual) return;
    const now = new Date();
    applyAppearance(appearanceAt(now));
    timer = setTimeout(automaticAppearance, nextBoundary(now) - now.getTime() + 30);
  }
  // This small, local script runs before the stylesheet and before body paint.
  automaticAppearance();
  window.addEventListener('pageshow', event => {
    if (event.persisted) manual = false;
    automaticAppearance();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) automaticAppearance();
  });
  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.appearance-switch');
    applyAppearance(root.dataset.appearance);
    button.addEventListener('click', () => {
      manual = true;
      clearTimeout(timer);
      applyAppearance(root.dataset.appearance === 'night' ? 'day' : 'night');
    });
    button.hidden = false;

    const toolbar = document.querySelector('.desk-toolbar');
    const spacer = document.getElementById('section-scroll-room');
    const links = [...document.querySelectorAll('.desk-nav a')];
    const sections = links.map(link => document.getElementById(link.hash.slice(1)));
    const items = [...document.querySelectorAll('[data-work]')].map(element => ({
      id: element.dataset.work, chapter: element.dataset.chapter, name: element.dataset.name, element,
      collection: element.querySelector('[data-collection]'), authentic: element.querySelector('[data-authentic]'),
      button: element.querySelector('[data-reveal]')
    }));
    const returns = [...document.querySelectorAll('[data-return]')];
    const publicationHeading = document.querySelector('[data-publication-heading]');
    let revealed = [];
    let navigationRequest = 0;
    let navigating = false;
    let releaseTimer;
    let homeFrame = 0;
    let layoutHold = false;
    window.history.scrollRestoration = 'manual';
    window.DeskPublications?.start();
    function paintSelection(ids) {
      window.DeskPublications?.refresh?.();
      revealed = revealSelection([], { type:'restore', ids }, items);
      items.forEach(item => {
        const open = revealed.includes(item.id);
        const changed = item.authentic.hidden === open;
        item.collection.hidden = open;
        item.authentic.hidden = !open;
        item.element.dataset.revealed = String(open);
        item.button.hidden = false;
        item.button.setAttribute('aria-expanded', String(open));
        item.button.setAttribute('aria-label', `${open ? 'Return' : 'Reveal'} ${item.name}${open ? ' to the collection' : ' within desk.'}`);
        item.button.querySelector('span').textContent = open ? 'Return' : 'Reveal';
        item.button.querySelector('.reveal-sign').textContent = open ? '−' : '+';
        if (changed) (open ? item.authentic : item.collection).classList.add('face-enter');
      });
      const chapter = items.find(item => revealed.includes(item.id))?.chapter || 'home';
      root.dataset.chapter = chapter;
      sections.forEach(section => {
        const children = items.filter(item => item.chapter === section.id);
        section.dataset.active = String(children.some(item => revealed.includes(item.id)));
        section.dataset.complete = String(children.every(item => revealed.includes(item.id)));
      });
      returns.forEach(control => { control.hidden = !items.some(item => item.chapter === control.dataset.return && revealed.includes(item.id)); });
      links.forEach(link => {
        if (link.hash === `#${chapter}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      publicationHeading.hidden = !revealed.some(id => ['field-brief','loblolly','workbook'].includes(id));
    }
    function record(hash, anchor, replace = false, offset) {
      const snapshot = { ids:[...revealed], hash, anchor, offset };
      const previous = window.history.state?.deskReveal;
      if (!replace && window.location.hash === hash && JSON.stringify(previous?.ids) === JSON.stringify(revealed)) return;
      const url = hash || window.location.pathname + window.location.search;
      window.history[replace ? 'replaceState' : 'pushState']({ deskReveal:snapshot }, '', url);
    }
    function routeForSelection() {
      if (!revealed.length) return '#collection';
      const chapter = items.find(item => item.id === revealed[0]).chapter;
      return items.filter(item => item.chapter === chapter).every(item => revealed.includes(item.id)) ? `#${chapter}` : `#work-${revealed.at(-1)}`;
    }
    function measureToolbar() {
      const height = toolbar.getBoundingClientRect().height;
      root.style.setProperty('--toolbar-height', `${height}px`);
      return height;
    }
    function holdLayout() {
      navigating = true;
      if (layoutHold) return;
      layoutHold = true;
      // Reserve before hiding faces: Safari must not clamp the old viewport to
      // a suddenly shorter document or run the top-reset handler during a swap.
      spacer.style.height = `${root.scrollHeight}px`;
    }
    function releaseJourney() {
      navigating = false; clearTimeout(releaseTimer); layoutHold = false;
      const base = root.scrollHeight - spacer.getBoundingClientRect().height;
      spacer.style.height = `${Math.max(0, Math.ceil(window.scrollY + root.clientHeight - base))}px`;
    }
    async function navigate(anchor, smooth, offset) {
      const request = ++navigationRequest;
      navigating = true;
      clearTimeout(releaseTimer);
      const target = document.getElementById(anchor.slice(1));
      if (!target) { releaseJourney(); return; }
      if (document.fonts) await document.fonts.ready;
      if (request !== navigationRequest) return;
      await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      if (request !== navigationRequest) return;
      const height = measureToolbar();
      const clearance = Number.isFinite(offset) ? Math.max(height + 12, Math.min(offset, root.clientHeight * .75)) : height + 12;
      const plan = sectionScrollPlan({
        targetTop: anchor === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY + height + 12 - clearance,
        toolbarHeight: height, viewportHeight: root.clientHeight,
        documentHeight: root.scrollHeight, spacerHeight: spacer.getBoundingClientRect().height
      });
      spacer.style.height = `${plan.space}px`;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top:plan.top, behavior:smooth && !reduced ? 'smooth' : 'auto' });
      target.focus({ preventScroll:true });
      layoutHold = false;
      // No repeated scroll correction or height animation. The fallback only
      // ends the temporary top-reset guard on browsers without scrollend.
      releaseTimer = setTimeout(releaseJourney, 1600);
    }
    function restoreRoute() {
      const hash = window.location.hash;
      const recognized = !hash || ['#top','#collection'].includes(hash) || links.some(link => link.hash === hash) || items.some(item => `#work-${item.id}` === hash);
      if (!recognized) return;
      const saved = window.history.state?.deskReveal;
      const valid = saved && saved.hash === hash;
      holdLayout();
      paintSelection(valid ? saved.ids : selectionForHash(hash, items));
      const anchor = valid ? saved.anchor : (!hash || ['#top','#collection'].includes(hash) ? '#top' : hash);
      navigate(anchor, false, valid ? saved.offset : undefined);
    }
    function transition(ids, anchor, hash, smooth, returning = false) {
      const target = document.getElementById(anchor.slice(1));
      const top = target?.getBoundingClientRect().top;
      const offset = returning && window.matchMedia('(max-width:759.98px)').matches && top >= measureToolbar() + 12 ? top : undefined;
      holdLayout(); paintSelection(ids);
      record(hash, anchor, false, offset); navigate(anchor, smooth, offset);
    }
    paintSelection([]);
    measureToolbar();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureToolbar).observe(toolbar);
    window.addEventListener('resize', measureToolbar);
    links.forEach(link => link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      transition(revealSelection(revealed, {type:'chapter',id:link.hash.slice(1)}, items), link.hash, link.hash, true);
    }));
    items.forEach(item => item.button.addEventListener('click', () => {
      const returning = revealed.includes(item.id);
      const ids = revealSelection(revealed, {type:'toggle',id:item.id}, items);
      // Personal Website is a single-work chapter: reveal its heading too.
      // Return keeps the existing work anchor and mobile position restoration.
      const anchor = !returning && item.id === 'portfolio' ? '#profile' : `#work-${item.id}`;
      holdLayout();
      const top = item.element.getBoundingClientRect().top;
      const offset = returning && window.matchMedia('(max-width:759.98px)').matches && top >= measureToolbar() + 12 ? top : undefined;
      paintSelection(ids); record(routeForSelection(), anchor, false, offset); navigate(anchor, false, offset);
    }));
    returns.forEach(control => control.addEventListener('click', () => {
      holdLayout();
      paintSelection(revealSelection(revealed, {type:'return',id:control.dataset.return}, items));
      const anchor = `#${control.dataset.return}`;
      record(routeForSelection(), anchor);
      navigate(anchor, false);
    }));
    window.addEventListener('scrollend', releaseJourney);
    for (const name of ['wheel','touchstart','pointerdown']) window.addEventListener(name, () => {
      navigationRequest += 1; releaseJourney();
    }, { passive:true });
    window.addEventListener('keydown', event => {
      if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) { navigationRequest += 1; releaseJourney(); }
    });
    // Ordinary scrolling never reveals or closes a selected work. Only the
    // explicit return to the very beginning restores the complete collection.
    window.addEventListener('scroll', () => {
      if (homeFrame) return;
      homeFrame = window.requestAnimationFrame(() => {
        homeFrame = 0;
        if (window.scrollY <= 2 && !navigating && revealed.length) {
          paintSelection([]); record('', '#top', true);
        }
      });
    }, { passive:true });
    window.addEventListener('popstate', restoreRoute);
    window.addEventListener('hashchange', restoreRoute);
    if (window.location.hash) restoreRoute();
    else record('', '#top', true);
    root.dataset.revealReady = 'true';
  });
})();
