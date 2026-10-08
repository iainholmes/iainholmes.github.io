// Edition selection. Pure functions: no DOM, no fetch. Shared by the browser and the build tool.
import { nyInstant, addDays } from './dates.js';
import { cycleWeekend } from './cycles.js';

export const SLOTS = ['tuesday', 'thursday'];

export function isReleased(edition, now = new Date()) {
  return ['published', 'withdrawn'].includes(edition.status)
    && Number.isFinite(+new Date(edition.published_at)) && new Date(edition.published_at) <= now;
}

/** When a slot is expected to publish for a given weekend (Sat start): Tue/Thu 07:00 New York. */
export function expectedPublish(slot, weekendStart) {
  const offset = slot === 'tuesday' ? -4 : -2;
  return nyInstant(addDays(weekendStart, offset), '07:00:00');
}

/**
 * Choose the current calendar cycle's Tuesday and Thursday slots.
 * Published editions and withdrawal notices with published_at <= now count.
 * Withdrawal notices preserve the weekend context; they are not active recommendations.
 * Both slots belong to the same cycle as the masthead and veil, even before
 * either edition publishes. A missing slot never borrows a previous week.
 *
 * Returns { weekend, tuesday, thursday, state, missing }.
 *   state: "upcoming" (before Saturday), "now" (Sat–Sun)
 *   missing: each empty slot's nominal publication time, never a release signal
 */
export function selectCurrentPair(manifest, now = new Date()) {
  const weekend = cycleWeekend(now);
  const group = manifest.editions.filter(e => e.weekend.start === weekend.start
    && isReleased(e, now));

  const pick = slot => group.filter(e => e.slot === slot)
    .sort((a, b) => a.published_at.localeCompare(b.published_at)).at(-1) || null;

  const satStart = nyInstant(weekend.start, '00:00:00');
  const sunEnd = nyInstant(addDays(weekend.end, 1), '00:00:00');
  const state = now < satStart ? 'upcoming' : now < sunEnd ? 'now' : 'past';

  const pair = { weekend, tuesday: pick('tuesday'), thursday: pick('thursday'), state, missing: {}, revision: manifest.revision || '' };
  for (const slot of SLOTS) {
    if (!pair[slot]) pair.missing[slot] = expectedPublish(slot, weekend.start).toISOString();
  }
  return pair;
}

/** Stable key used to tell whether the rendered page already shows the right pair. */
export function pairKey(pair) {
  if (!pair) return 'none';
  return [pair.weekend.start, pair.tuesday?.id || '-', pair.thursday?.id || '-', pair.state, ...(pair.revision ? [pair.revision] : [])].join('|');
}

/** Archive grouping: every published edition not in the current pair, newest weekend first. */
export function archiveGroups(manifest, now = new Date(), current = selectCurrentPair(manifest, now)) {
  const shown = new Set([current?.tuesday?.id, current?.thursday?.id].filter(Boolean));
  const live = manifest.editions.filter(e => isReleased(e, now));
  const byWeekend = new Map();
  for (const e of live) {
    if (!byWeekend.has(e.weekend.start)) byWeekend.set(e.weekend.start, { weekend: e.weekend, editions: [] });
    byWeekend.get(e.weekend.start).editions.push({ ...e, current: shown.has(e.id) });
  }
  return [...byWeekend.values()]
    .sort((a, b) => b.weekend.start.localeCompare(a.weekend.start))
    .map(g => ({ ...g, editions: g.editions.sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot)) }));
}
