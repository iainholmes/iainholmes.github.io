// Publication-aware frontispiece. Pure functions; never promotes a draft or changes selectCurrentPair.
import { addDays, nyInstant } from './dates.js';
import { expectedPublish, SLOTS } from './editions.js';
import { cycleIdentity, cycleWeekend } from './cycles.js';

export const PENDING_TIME = '7:00 AM ET';
export const DAY_LABEL = { tuesday: 'Tuesday', thursday: 'Thursday' };
const chronological = (a, b) => a.published_at.localeCompare(b.published_at) || a.id.localeCompare(b.id);

function slotState(manifest, weekendStart, slot, now, preview) {
  const entries = manifest.editions.filter(e => e.weekend.start === weekendStart && e.slot === slot).sort(chronological);
  const available = entries.filter(e => ['published','withdrawn'].includes(e.status) && new Date(e.published_at) <= now).at(-1);
  // A published replacement wins only at its real timestamp. A withdrawal never revives an older choice.
  const pending = preview && entries.filter(e => ['published','draft'].includes(e.status)
    && (!available || new Date(e.published_at) > new Date(available.published_at))).at(-1);
  const edition = available?.status === 'published' ? available : pending || available || null;
  return { edition, published: !!edition && edition.status === 'published' && new Date(edition.published_at) <= now,
    withdrawn: !!edition && edition.status === 'withdrawn' && new Date(edition.published_at) <= now };
}

export function veilState(manifest, now = new Date()) {
  const weekend = cycleWeekend(now), identity = cycleIdentity(weekend.start);
  const current = Object.fromEntries(SLOTS.map(slot => [slot, slotState(manifest, weekend.start, slot, now, true)]));
  const previousStart = addDays(weekend.start, -7);
  const previous = Object.fromEntries(SLOTS.map(slot => [slot, slotState(manifest, previousStart, slot, now, false)]));
  const wednesday = nyInstant(addDays(weekend.start, -3));
  const phase = now < wednesday ? 'preTuesday' : 'preThursday';
  const due = phase === 'preTuesday' ? 'tuesday' : 'thursday';
  const active = now < expectedPublish(due, weekend.start) || !current[due].published;
  return { weekend, identity, current, previous, phase, active,
    dismissalKey: `rupert-veil:${weekend.start}:${phase}` };
}

export function veilArtworkProblems(state, photos) {
  const issues = [];
  for (const group of ['current','previous']) for (const slot of SLOTS) {
    const e = state[group][slot].edition;
    const record = e && photos.photos.find(p => p.id === e.photo_id);
    if (!record || !record.widths?.length) issues.push(`${state.weekend.start}: missing ${group} ${slot} recommendation artwork`);
  }
  return issues;
}

// Project only the fields needed on the veil. No endpoints, route geometry, or private home data.
export function upcomingTravel(plans, today) {
  const plan = plans.filter(p => p.dates?.start > today).sort((a,b) => a.dates.start.localeCompare(b.dates.start))[0];
  return plan ? { title: plan.title, start: plan.dates.start } : null;
}
