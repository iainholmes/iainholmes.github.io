const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const runtime = fs.readFileSync(`${__dirname}/../desk.js`, 'utf8');
const { appearanceAt, nextBoundary, sectionScrollPlan, chapterAt } = require('../desk.js');

test('Eastern boundaries in standard and daylight time, independent of device zone', () => {
  for (const [date, expected] of [
    ['2026-01-15T11:59:59Z', 'night'], ['2026-01-15T12:00:00Z', 'day'],
    ['2026-01-16T01:59:59Z', 'day'], ['2026-01-16T02:00:00Z', 'night'],
    ['2026-07-15T10:59:59Z', 'night'], ['2026-07-15T11:00:00Z', 'day'],
    ['2026-07-16T00:59:59Z', 'day'], ['2026-07-16T01:00:00Z', 'night'],
    ['2026-03-08T06:59:59Z', 'night'], ['2026-03-08T07:00:00Z', 'night'],
    ['2026-03-08T10:59:59Z', 'night'], ['2026-03-08T11:00:00Z', 'day'],
    ['2026-11-01T05:59:59Z', 'night'], ['2026-11-01T06:00:00Z', 'night'],
    ['2026-11-01T11:59:59Z', 'night'], ['2026-11-01T12:00:00Z', 'day']
  ]) assert.equal(appearanceAt(new Date(date)), expected, date);
});

test('Next automatic change crosses both DST changes and a year boundary correctly', () => {
  for (const [date, expected] of [
    ['2026-01-15T10:00:00Z', '2026-01-15T12:00:00.000Z'],
    ['2026-07-15T11:00:00Z', '2026-07-16T01:00:00.000Z'],
    ['2026-07-16T01:00:00Z', '2026-07-16T11:00:00.000Z'],
    ['2026-03-08T02:00:00Z', '2026-03-08T11:00:00.000Z'],
    ['2026-11-01T01:00:00Z', '2026-11-01T12:00:00.000Z'],
    ['2027-01-01T02:00:00Z', '2027-01-01T12:00:00.000Z']
  ]) assert.equal(new Date(nextBoundary(new Date(date))).toISOString(), expected, date);
});

test('Section plan reaches every destination including the bottom section', () => {
  for (const [viewportHeight, toolbarHeight] of [[900, 62], [874, 72], [667, 84]]) {
    for (const targetTop of [250, 1300, 2700]) {
      const plan = sectionScrollPlan({ targetTop, toolbarHeight, viewportHeight, documentHeight: 3020 });
      assert.equal(targetTop - plan.top, toolbarHeight + 12);
      assert.ok(3020 + plan.space - viewportHeight >= plan.top, 'Scroll destination is reachable');
      const repeat = sectionScrollPlan({ targetTop, toolbarHeight, viewportHeight, documentHeight: 3020 + plan.space, spacerHeight: plan.space });
      assert.deepEqual(repeat, plan, 'Repeated clicks do not accumulate blank space');
    }
  }
  assert.deepEqual(sectionScrollPlan({ targetTop: 20, toolbarHeight: 72, viewportHeight: 800, documentHeight: 3000 }), { top: 0, space: 0 });
});

function browserHarness(start) {
  let now = Date.parse(start);
  const events = {}, buttonEvents = {}, timers = new Map(), frames = new Map(), targets = {};
  let frameId = 0, timerId = 0;
  function listen(name, callback) { const previous = events[name]; events[name] = previous ? event => { previous(event); callback(event); } : callback; }
  const style = { setProperty() {} };
  const root = { dataset: {}, style, clientHeight: 874 };
  const meta = {}, label = {}, button = {
    hidden: true, attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; },
    querySelector: () => label,
    addEventListener(name, callback) { buttonEvents[name] = callback; }
  };
  const toolbar = { getBoundingClientRect: () => ({ height: 72 }) };
  const spacer = { style: { height: '0px' }, getBoundingClientRect: () => ({ height: parseFloat(spacer.style.height) }) };
  Object.defineProperty(root, 'scrollHeight', { get: () => 3020 + parseFloat(spacer.style.height) });
  const links = ['research', 'reading', 'profile'].map((id, i) => {
    targets[id] = { id, dataset: {}, getBoundingClientRect: () => ({ top: [250, 1300, 2700][i] - window.scrollY }), focus(opts) { this.focused = opts.preventScroll; } };
    return { hash: `#${id}`, attrs: {}, setAttribute(k,v) { this.attrs[k]=v; }, removeAttribute(k) { delete this.attrs[k]; }, addEventListener(name, callback) { this.click = callback; } };
  });
  const document = {
    documentElement: root, hidden: false, fonts: { ready: Promise.resolve() },
    querySelector: selector => ({ 'meta[name="theme-color"]': meta, '.appearance-switch': button, '.desk-toolbar': toolbar }[selector]),
    querySelectorAll: () => links,
    getElementById: id => id === 'section-scroll-room' ? spacer : targets[id],
    addEventListener: listen
  };
  const window = {
    scrollY: 0, location: { hash: '' },
    history: { pushState(a, b, hash) { window.location.hash = hash; } },
    scrollCalls: [], reduced: false, deferSmooth: false,
    matchMedia() { return { matches: this.reduced }; },
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    scrollTo(options) { this.scrollCalls.push(options); if (!(this.deferSmooth && options.behavior === 'smooth')) this.scrollY = options.top; },
    addEventListener: listen
  };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } }
  vm.runInNewContext(runtime, {
    document, window, Intl, Date: Clock,
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  return { root, meta, button, label, events, buttonEvents, links, targets, spacer, window, timers,
    flush() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn()); },
    advance(date) { now = Date.parse(date); }, mount() { events.DOMContentLoaded(); } };
}

test('Initial appearance is applied before DOM initialization; manual choice lasts this visit', () => {
  const h = browserHarness('2026-07-15T12:00:00Z');
  assert.equal(h.root.dataset.appearance, 'day');
  assert.equal(h.meta.content, '#f3efe4');
  assert.equal(h.button.hidden, true);
  h.mount();
  assert.equal(h.button.hidden, false);
  h.buttonEvents.click();
  assert.equal(h.root.dataset.appearance, 'night');
  assert.equal(h.button.attrs['aria-pressed'], 'true');
  assert.equal(h.label.textContent, 'Night');
  assert.equal(h.meta.content, '#141f1b');
  assert.equal(h.timers.size, 0);
  h.advance('2026-07-16T13:00:00Z');
  h.events.visibilitychange();
  assert.equal(h.root.dataset.appearance, 'night');
  const fresh = browserHarness('2026-07-16T13:00:00Z');
  assert.equal(fresh.root.dataset.appearance, 'day');
  h.events.pageshow({ persisted: true });
  assert.equal(h.root.dataset.appearance, 'day', 'A restored page visit recalculates time');
});

test('Automatic appearance changes on the scheduled boundary and after backgrounding', () => {
  const h = browserHarness('2026-07-16T00:59:59Z'); h.mount();
  assert.equal(h.root.dataset.appearance, 'day');
  const scheduled = [...h.timers.values()][0];
  assert.equal(scheduled.delay, 1030);
  h.advance('2026-07-16T01:00:01Z'); scheduled.fn();
  assert.equal(h.root.dataset.appearance, 'night');
  h.advance('2026-07-16T11:00:00Z'); h.events.visibilitychange();
  assert.equal(h.root.dataset.appearance, 'day');
});

test('All three anchors move focus and land under the bar; modifier-click stays native', async () => {
  const h = browserHarness('2026-07-15T12:00:00Z'); h.mount();
  for (const link of h.links) {
    let prevented = false;
    link.click({ button: 0, preventDefault() { prevented = true; } });
    await new Promise(setImmediate);
    assert.equal(prevented, true);
    assert.equal(h.window.location.hash, link.hash);
    assert.equal(h.targets[link.hash.slice(1)].focused, true);
    assert.equal(h.targets[link.hash.slice(1)].getBoundingClientRect().top, 84);
    assert.ok(h.window.scrollY <= h.root.scrollHeight - h.root.clientHeight);
  }
  assert.ok(parseFloat(h.spacer.style.height) > 0);
  h.links[0].click({ button: 0, metaKey: true, preventDefault() { assert.fail('Modifier click intercepted'); } });
  h.links[0].click({ button: 0, preventDefault() {} });
  await new Promise(setImmediate);
  assert.equal(h.spacer.style.height, '0px');
});

test('Direct section URLs and Back/hash navigation use the same alignment', async () => {
  const h = browserHarness('2026-07-15T12:00:00Z');
  h.window.location.hash = '#profile'; h.mount(); await new Promise(setImmediate);
  assert.equal(h.targets.profile.getBoundingClientRect().top, 84);
  h.window.location.hash = '#reading'; h.events.hashchange(); await new Promise(setImmediate);
  assert.equal(h.targets.reading.getBoundingClientRect().top, 84);
});


test('Reading line selects one sequential chapter and restores home at the top', () => {
  const sections = [{id:'research',top:250},{id:'reading',top:1300},{id:'profile',top:2700}];
  const at = y => chapterAt({scrollY:y,toolbarHeight:72,viewportHeight:874,sections:sections.map(s=>({...s,top:s.top-y}))});
  assert.equal(at(0),'home'); assert.equal(at(50),'home');
  assert.equal(at(100),'research'); assert.equal(at(1200),'reading'); assert.equal(at(2600),'profile');
  assert.equal(at(1),'home');
});

test('Manual scrolling updates only chapter/current link, never history, focus or appearance', () => {
  const h=browserHarness('2026-07-15T12:00:00Z'); h.mount(); h.flush();
  assert.equal(h.root.dataset.chapter,'home');
  h.buttonEvents.click();
  for (const [top,expected] of [[100,'research'],[1200,'reading'],[2600,'profile'],[0,'home']]) {
    h.window.scrollY=top; h.events.scroll(); h.flush();
    assert.equal(h.root.dataset.chapter,expected);
    assert.equal(Object.values(h.targets).filter(s=>s.dataset.active==='true').length,expected==='home'?0:1);
    assert.equal(h.links.filter(l=>l.attrs['aria-current']==='location').length,expected==='home'?0:1);
    assert.equal(h.root.dataset.appearance,'night');
    assert.equal(h.window.location.hash,'');
    assert.ok(Object.values(h.targets).every(s=>!s.focused));
  }
  assert.equal(h.window.scrollCalls.length,0,'Scroll observer must never scroll the page');
});

test('TOC journeys are smooth, destination stays stable in transit, and user input releases it', async () => {
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();h.flush();h.window.deferSmooth=true;
  h.links[2].click({button:0,preventDefault(){}});await new Promise(setImmediate);
  assert.equal(h.window.scrollCalls.at(-1).behavior,'smooth');
  assert.equal(h.root.dataset.chapter,'profile');
  h.window.scrollY=1200;h.events.scroll();h.flush();
  assert.equal(h.root.dataset.chapter,'profile','No intermediate chapter flashing during TOC travel');
  h.events.touchstart();h.flush();
  assert.equal(h.root.dataset.chapter,'reading','Touch scrolling takes over');
  h.events.resize();h.flush();
  assert.equal(h.window.scrollCalls.length,1,'Resize and observation never create scroll loops');
});

test('Reduced motion, direct fragments and browser history use immediate exact positioning', async () => {
  const h=browserHarness('2026-07-15T12:00:00Z');h.window.reduced=true;h.mount();h.flush();
  h.links[2].click({button:0,preventDefault(){}});await new Promise(setImmediate);h.flush();
  assert.equal(h.window.scrollCalls.at(-1).behavior,'auto');
  assert.equal(h.root.dataset.chapter,'profile');
  assert.equal(h.targets.profile.getBoundingClientRect().top,84);
  h.buttonEvents.click();h.window.location.hash='#reading';h.events.popstate();await new Promise(setImmediate);h.flush();
  assert.equal(h.targets.reading.getBoundingClientRect().top,84);
  assert.equal(h.root.dataset.chapter,'reading');assert.equal(h.root.dataset.appearance,'night');
  h.window.location.hash='';h.window.scrollY=0;h.events.popstate();h.flush();
  assert.equal(h.root.dataset.chapter,'home');
});

test('Only the latest rapid TOC request moves focus and scrolls', async () => {
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();
  h.links[0].click({button:0,preventDefault(){}});h.links[1].click({button:0,preventDefault(){}});
  await new Promise(setImmediate);h.flush();
  assert.equal(h.window.scrollCalls.length,1);assert.equal(h.root.dataset.chapter,'reading');
  assert.equal(h.targets.research.focused,undefined);assert.equal(h.targets.reading.focused,true);
});


test('Completed journey releases the destination latch without relying on scrollend', async () => {
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();h.flush();
  h.links[2].click({button:0,preventDefault(){}});await new Promise(setImmediate);h.flush();
  assert.equal(h.root.dataset.chapter,'profile');
  assert.equal([...h.timers.values()].filter(t=>t.delay===1600).length,0);
  h.window.scrollY=1200;h.events.scroll();h.flush();assert.equal(h.root.dataset.chapter,'reading');
});

test('Bounded fallback clears interrupted smooth navigation without scrolling again', async () => {
  const h=browserHarness('2026-07-15T12:00:00Z');h.mount();h.flush();h.window.deferSmooth=true;
  h.links[2].click({button:0,preventDefault(){}});await new Promise(setImmediate);
  h.window.scrollY=1200;
  [...h.timers.values()].find(t=>t.delay===1600).fn();h.flush();
  assert.equal(h.root.dataset.chapter,'reading');assert.equal(h.window.scrollCalls.length,1);
});
