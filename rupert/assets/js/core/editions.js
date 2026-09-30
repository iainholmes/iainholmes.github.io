// Edition selection. Pure functions: no DOM, no fetch. Shared by the browser and the build tool.
import { nyInstant, addDays } from './dates.js';

export const SLOTS = ['tuesday', 'thursday'];

/** When a slot is expected to publish for a given weekend (Sat start): Tue/Thu 07:00 New York. */
export function expectedPublish(slot, weekendStart) {
  const offset = slot === 'tuesday' ? -4 : -2;
  return nyInstant(addDays(weekendStart, offset), '07:00:00');
}

/**
 * Choose the pair of editions to show.
 * Published editions and withdrawal notices with published_at <= now count.
 * Withdrawal notices preserve the weekend context; they are not active recommendations.
 * The latest weekend with at least one published choice wins.
 *
 * Returns { weekend, tuesday, thursday, state, missing } or null when nothing is published yet.
 *   state: "upcoming" (before Saturday), "now" (Sat–Sun), "past" (after Sunday; shown as "Last weekend")
 *   missing: for each empty slot, the time it is expected (only meaningful while state !== "past")
 */
export function selectCurrentPair(manifest, now = new Date()) {
  const live = manifest.editions.filter(e => ['published','withdrawn'].includes(e.status) && new Date(e.published_at) <= now);
  if (!live.length) return null;

  const latestStart = live.map(e => e.weekend.start).sort().at(-1);
  const group = live.filter(e => e.weekend.start === latestStart);
  const weekend = group[0].weekend;

  const pick = slot => group.filter(e => e.slot === slot)
    .sort((a, b) => a.published_at.localeCompare(b.published_at)).at(-1) || null;

  const satStart = nyInstant(weekend.start, '00:00:00');
  const sunEnd = nyInstant(addDays(weekend.end, 1), '00:00:00');
  const state = now < satStart ? 'upcoming' : now < sunEnd ? 'now' : 'past';

  const pair = { weekend, tuesday: pick('tuesday'), thursday: pick('thursday'), state, missing: {} };
  for (const slot of SLOTS) {
    if (!pair[slot]) pair.missing[slot] = expectedPublish(slot, weekend.start).toISOString();
  }
  return pair;
}

/** Stable key used to tell whether the rendered page already shows the right pair. */
export function pairKey(pair) {
  if (!pair) return 'none';
  return [pair.weekend.start, pair.tuesday?.id || '-', pair.thursday?.id || '-', pair.state].join('|');
}

/** Archive grouping: every published edition not in the current pair, newest weekend first. */
export function archiveGroups(manifest, now = new Date(), current = selectCurrentPair(manifest, now)) {
  const shown = new Set([current?.tuesday?.id, current?.thursday?.id].filter(Boolean));
  const live = manifest.editions.filter(e => ['published','withdrawn'].includes(e.status) && new Date(e.published_at) <= now);
  const byWeekend = new Map();
  for (const e of live) {
    if (!byWeekend.has(e.weekend.start)) byWeekend.set(e.weekend.start, { weekend: e.weekend, editions: [] });
    byWeekend.get(e.weekend.start).editions.push({ ...e, current: shown.has(e.id) });
  }
  return [...byWeekend.values()]
    .sort((a, b) => b.weekend.start.localeCompare(a.weekend.start))
    .map(g => ({ ...g, editions: g.editions.sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot)) }));
}
