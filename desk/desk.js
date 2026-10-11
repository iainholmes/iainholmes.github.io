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
  function chapterAt({ scrollY, toolbarHeight, viewportHeight, sections }) {
    if (scrollY <= 2) return 'home';
    // The reading line is just inside the usable viewport, not its midpoint.
    // That keeps the current chapter stable while its successor approaches.
    const line = toolbarHeight + 12 + Math.min(100, viewportHeight * .14);
    let chapter = 'home';
    for (const section of sections) {
      if (section.top <= line) chapter = section.id;
    }
    return chapter;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appearanceAt, nextBoundary, sectionScrollPlan, chapterAt };
  }
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.chapter = 'home';
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
    const destinations = new Set(links.map(link => link.hash));
    const sections = links.map(link => document.getElementById(link.hash.slice(1)));
    let navigationRequest = 0;
    let frame = 0;
    let navigationTarget = null;
    let releaseTimer;
    let toolbarHeight = 0;
    function activateChapter(id) {
      if (root.dataset.chapter === id && sections.every(section => section.dataset.active !== undefined)) return;
      root.dataset.chapter = id;
      sections.forEach(section => { section.dataset.active = String(section.id === id); });
      links.forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function updateChapter() {
      frame = 0;
      if (navigationTarget && Math.abs(window.scrollY - navigationTarget.top) <= 2) {
        navigationTarget = null;
        clearTimeout(releaseTimer);
      }
      activateChapter(navigationTarget ? navigationTarget.id : chapterAt({
        scrollY: window.scrollY, toolbarHeight, viewportHeight: root.clientHeight,
        sections: sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top }))
      }));
    }
    function scheduleChapter() {
      if (!frame) frame = window.requestAnimationFrame(updateChapter);
    }
    function cancelJourney() {
      navigationRequest += 1;
      navigationTarget = null;
      clearTimeout(releaseTimer);
      scheduleChapter();
    }
    function measureToolbar() {
      toolbarHeight = toolbar.getBoundingClientRect().height;
      root.style.setProperty('--toolbar-height', `${toolbarHeight}px`);
      scheduleChapter();
      return toolbarHeight;
    }
    measureToolbar();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureToolbar).observe(toolbar);
    window.addEventListener('resize', () => { cancelJourney(); measureToolbar(); });
    window.addEventListener('scroll', scheduleChapter, { passive: true });
    window.addEventListener('scrollend', () => {
      navigationTarget = null; clearTimeout(releaseTimer); scheduleChapter();
    });
    // User input wins immediately over an in-flight programmatic journey.
    for (const event of ['wheel', 'touchstart', 'pointerdown']) {
      window.addEventListener(event, cancelJourney, { passive: true });
    }
    window.addEventListener('keydown', event => {
      if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) cancelJourney();
    });
    window.addEventListener('pageshow', scheduleChapter);
    window.addEventListener('load', scheduleChapter);
    if (document.fonts) document.fonts.ready.then(scheduleChapter);

    async function navigate(hash, updateHistory) {
      if (!destinations.has(hash)) return;
      const request = ++navigationRequest;
      // Font loading changes line wrapping and section geometry on a fresh visit.
      if (document.fonts) await document.fonts.ready;
      if (request !== navigationRequest) return;
      const target = document.getElementById(hash.slice(1));
      const toolbarHeight = measureToolbar();
      const plan = sectionScrollPlan({
        targetTop: target.getBoundingClientRect().top + window.scrollY,
        toolbarHeight,
        viewportHeight: root.clientHeight,
        documentHeight: root.scrollHeight,
        spacerHeight: spacer.getBoundingClientRect().height
      });
      // The final short section needs extra document length to clear the sticky bar.
      spacer.style.height = `${plan.space}px`;
      if (updateHistory && window.location.hash !== hash) window.history.pushState(null, '', hash);
      target.focus({ preventScroll: true });
      const smooth = updateHistory && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      navigationTarget = { id: target.id, top: plan.top };
      activateChapter(target.id);
      clearTimeout(releaseTimer);
      // scrollend is not universal. This bounded fallback releases the visual
      // destination latch; it never scrolls, changes history or moves focus.
      releaseTimer = setTimeout(() => {
        navigationTarget = null; scheduleChapter();
      }, 1600);
      window.scrollTo({ top: plan.top, behavior: smooth ? 'smooth' : 'auto' });
      scheduleChapter();
    }
    links.forEach(link => link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(link.hash, true);
    }));
    function restoreFragment() {
      if (destinations.has(window.location.hash)) navigate(window.location.hash, false);
      else { cancelJourney(); scheduleChapter(); }
    }
    window.addEventListener('hashchange', restoreFragment);
    window.addEventListener('popstate', restoreFragment);
    if (destinations.has(window.location.hash)) navigate(window.location.hash, false);
  });
})();
