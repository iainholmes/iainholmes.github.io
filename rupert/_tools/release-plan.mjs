// Clock-only slot accounting. Editorial/release eligibility remains in the canonical guards.
import { cycleWeekend } from '../assets/js/core/cycles.js';
import { expectedPublish, isReleased, SLOTS } from '../assets/js/core/editions.js';

export function releasePlan(editions, now = new Date()) {
  const weekend = cycleWeekend(now);
  const current = editions.filter(ed => ed.weekend.start === weekend.start);
  const dueSlots = SLOTS.filter(slot => now >= expectedPublish(slot, weekend.start));
  const missing = dueSlots.filter(slot => !current.some(ed => ed.slot === slot
    && (isReleased(ed, now) || ed.status === 'draft')));
  const next = SLOTS.map(slot => ({slot, at: expectedPublish(slot, weekend.start)}))
    .find(({at}) => at > now) || null;
  return {weekend, missing, next};
}

export function missingReleaseMessage(plan) {
  return plan.missing.map(slot => `${slot} for ${plan.weekend.start}: publication is due but no prepared draft or released edition exists. Prepare an authentic candidate privately with verified official access, public trailhead coordinates and original registered artwork; refresh weather and complete editorial review, then rerun release. Report the blocker; do not mark this attempt complete or bypass safeguards.`).join('\n');
}
