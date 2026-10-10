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
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appearanceAt, nextBoundary, sectionScrollPlan };
  }
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let manual = false;
  let timer;
  let button;
  function applyAppearance(appearance) {
    root.dataset.appearance = appearance;
    if (themeMeta) themeMeta.content = appearance === 'night' ? '#141f1b' : '#eeeee6';
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
    let navigationRequest = 0;
    function measureToolbar() {
      const height = toolbar.getBoundingClientRect().height;
      root.style.setProperty('--toolbar-height', `${height}px`);
      return height;
    }
    measureToolbar();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureToolbar).observe(toolbar);
    window.addEventListener('resize', measureToolbar);

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
      window.scrollTo({ top: plan.top, behavior: 'auto' });
    }
    links.forEach(link => link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(link.hash, true);
    }));
    window.addEventListener('hashchange', () => navigate(window.location.hash, false));
    if (destinations.has(window.location.hash)) navigate(window.location.hash, false);
  });
})();
