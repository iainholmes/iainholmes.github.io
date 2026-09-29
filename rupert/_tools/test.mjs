// Tests for edition selection and date handling. Run: node rupert/_tools/test.mjs
import assert from 'node:assert/strict';
import { selectCurrentPair, archiveGroups } from '../assets/js/core/editions.js';
import { isoWeek, nyInstant, weekendRange, minutesRange, hoursRange } from '../assets/js/core/dates.js';

import { renderArchive } from '../assets/js/core/render.js';

const ed = (id, slot, published_at, start, end, status = 'published') => ({ id, slot, status, published_at, weekend: { start, end } });
const W40 = [
  ed('2026-W39-tue', 'tuesday',  '2026-09-22T07:00:00-04:00', '2026-09-26', '2026-09-27'),
  ed('2026-W39-thu', 'thursday', '2026-09-24T07:00:00-04:00', '2026-09-26', '2026-09-27'),
  ed('2026-W40-tue', 'tuesday',  '2026-09-29T07:00:00-04:00', '2026-10-03', '2026-10-04'),
  ed('2026-W40-thu', 'thursday', '2026-10-01T07:00:00-04:00', '2026-10-03', '2026-10-04'),
];
const m = { editions: W40 };
const at = s => new Date(s);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

t('Tuesday 06:59 still shows last weekend, labelled past', () => {
  const p = selectCurrentPair(m, at('2026-09-29T06:59:00-04:00'));
  assert.equal(p.weekend.start, '2026-09-26'); assert.equal(p.state, 'past');
});
t('Tuesday 07:01 switches to the new weekend with Thursday pending', () => {
  const p = selectCurrentPair(m, at('2026-09-29T07:01:00-04:00'));
  assert.equal(p.tuesday.id, '2026-W40-tue'); assert.equal(p.thursday, null);
  assert.equal(p.state, 'upcoming');
  assert.equal(p.missing.thursday, new Date('2026-10-01T07:00:00-04:00').toISOString());
});
t('Thursday after publication shows both', () => {
  const p = selectCurrentPair(m, at('2026-10-01T08:00:00-04:00'));
  assert.equal(p.tuesday.id, '2026-W40-tue'); assert.equal(p.thursday.id, '2026-W40-thu');
});
t('Saturday is "now"', () => assert.equal(selectCurrentPair(m, at('2026-10-03T09:00:00-04:00')).state, 'now'));
t('Sunday 23:59 is still "now"', () => assert.equal(selectCurrentPair(m, at('2026-10-04T23:59:00-04:00')).state, 'now'));
t('Monday keeps the pair, labelled past', () => {
  const p = selectCurrentPair(m, at('2026-10-05T09:00:00-04:00'));
  assert.equal(p.weekend.start, '2026-10-03'); assert.equal(p.state, 'past');
});
t('drafts and future editions are ignored', () => {
  const p = selectCurrentPair({ editions: [...W40, ed('2026-W41-tue', 'tuesday', '2026-10-06T07:00:00-04:00', '2026-10-10', '2026-10-11', 'draft')] }, at('2026-10-07T09:00:00-04:00'));
  assert.equal(p.weekend.start, '2026-10-03');
});
t('missing Tuesday but Thursday published', () => {
  const p = selectCurrentPair({ editions: [W40[3]] }, at('2026-10-01T09:00:00-04:00'));
  assert.equal(p.tuesday, null); assert.equal(p.thursday.id, '2026-W40-thu');
});
t('nothing published returns null', () => assert.equal(selectCurrentPair({ editions: [] }, at('2026-10-01T09:00:00-04:00')), null));
t('DST end: Sunday 1 Nov 2026 weekend ends at local midnight', () => {
  const eds = { editions: [ed('2026-W44-tue', 'tuesday', '2026-10-27T07:00:00-04:00', '2026-10-31', '2026-11-01')] };
  assert.equal(selectCurrentPair(eds, at('2026-11-01T23:30:00-05:00')).state, 'now');
  assert.equal(selectCurrentPair(eds, at('2026-11-02T00:30:00-05:00')).state, 'past');
  assert.equal(nyInstant('2026-11-02').toISOString(), '2026-11-02T05:00:00.000Z');
});
t('ISO weeks incl. week 53', () => {
  assert.deepEqual(isoWeek('2026-09-29'), { year: 2026, week: 40 });
  assert.deepEqual(isoWeek('2026-12-31'), { year: 2026, week: 53 });
  assert.deepEqual(isoWeek('2027-01-01'), { year: 2026, week: 53 });
  assert.deepEqual(isoWeek('2027-01-04'), { year: 2027, week: 1 });
});
t('formatters', () => {
  assert.equal(weekendRange('2026-10-03', '2026-10-04'), 'Sat 3 – Sun 4 October');
  assert.equal(weekendRange('2026-10-31', '2026-11-01'), 'Sat 31 Oct – Sun 1 Nov');
  assert.equal(minutesRange([25, 35]), '25–35 min');
  assert.equal(minutesRange([100, 115]), '1 h 40 – 1 h 55');
  assert.equal(hoursRange([1.75, 2.5]), '2–2½ h');
});
const archiveAt = (manifest, time) => {
  const now = at(time);
  return renderArchive(archiveGroups(manifest, now), { base: '../', photos: { photos: [] }, now });
};
t('Archive pending Thursday uses the scheduled date and This Week label', () => {
  const html = archiveAt(m, '2026-09-29T12:00:00-04:00');
  assert.match(html, /Publishes Thu 1 Oct/);
  assert.match(html, /class="arch-now">This Week</);
  assert.doesNotMatch(html, /Not published|On This Week now/);
});
t('Archive changes at Thursday publication and retains past missing slots', () => {
  assert.match(archiveAt(m, '2026-10-01T06:59:59-04:00'), /Publishes Thu 1 Oct/);
  const live = archiveAt(m, '2026-10-01T07:00:00-04:00');
  assert.doesNotMatch(live, /Publishes Thu 1 Oct/);
  assert.match(live, /edition\/2026-W40-thu\//);
  const missed = archiveAt({ editions: [W40[2]] }, '2026-10-05T12:00:00-04:00');
  assert.match(missed, /Not published/);
});
t('Archive computes new dates across DST and year boundaries', () => {
  const manifest = { editions: [ed('2026-W45-tue', 'tuesday', '2026-11-03T07:00:00-05:00', '2026-11-07', '2026-11-08')] };
  assert.match(archiveAt(manifest, '2026-11-03T08:00:00-05:00'), /Publishes Thu 5 Nov/);
  const year = { editions: [ed('2026-W53-tue', 'tuesday', '2026-12-29T07:00:00-05:00', '2027-01-02', '2027-01-03')] };
  assert.match(archiveAt(year, '2026-12-29T08:00:00-05:00'), /Publishes Thu 31 Dec/);
});
console.log(`${n} tests passed`);
