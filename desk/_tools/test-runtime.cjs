const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const runtime = fs.readFileSync(`${__dirname}/../desk.js`, 'utf8');
const { appearanceAt, nextBoundary, sectionScrollPlan } = require('../desk.js');

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
  const events = {}, buttonEvents = {}, timers = new Map(), targets = {};
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
    targets[id] = { getBoundingClientRect: () => ({ top: [250, 1300, 2700][i] - window.scrollY }), focus(opts) { this.focused = opts.preventScroll; } };
    return { hash: `#${id}`, addEventListener(name, callback) { this.click = callback; } };
  });
  const document = {
    documentElement: root, hidden: false, fonts: { ready: Promise.resolve() },
    querySelector: selector => ({ 'meta[name="theme-color"]': meta, '.appearance-switch': button, '.desk-toolbar': toolbar }[selector]),
    querySelectorAll: () => links,
    getElementById: id => id === 'section-scroll-room' ? spacer : targets[id],
    addEventListener(name, callback) { events[name] = callback; }
  };
  const window = {
    scrollY: 0, location: { hash: '' },
    history: { pushState(a, b, hash) { window.location.hash = hash; } },
    scrollTo({ top }) { this.scrollY = top; },
    addEventListener(name, callback) { events[name] = callback; }
  };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } }
  vm.runInNewContext(runtime, {
    document, window, Intl, Date: Clock,
    setTimeout(fn, delay) { const id = timers.size + 1; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  return { root, meta, button, label, events, buttonEvents, links, targets, spacer, window, timers,
    advance(date) { now = Date.parse(date); }, mount() { events.DOMContentLoaded(); } };
}

test('Initial appearance is applied before DOM initialization; manual choice lasts this visit', () => {
  const h = browserHarness('2026-07-15T12:00:00Z');
  assert.equal(h.root.dataset.appearance, 'day');
  assert.equal(h.meta.content, '#eeeee6');
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
