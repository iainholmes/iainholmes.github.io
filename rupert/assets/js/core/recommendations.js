// Shared editorial reuse policy for publication validation and candidate ranking.
import { seasonFor } from './options.js';
import { nyDateString } from './dates.js';
import { experienceKey, routeIdentity, activityCategory } from './experience-history.js';
export { experienceKey } from './experience-history.js';
const DAY = 86400000;
const main = e => e.flagship || e;
const placeId = e => main(e).place_id;
const NON_TRAIL = new Set(['cafe', 'patio', 'brewery', 'pup-treat', 'market', 'shopping', 'garden', 'town-walk', 'campus', 'scenic-drive', 'ferry', 'picnic', 'event', 'swim']);
const activityKey = e => (main(e).experiences || []).filter(x => NON_TRAIL.has(x)).sort().join('|') || 'trail';
const basisKey = e => JSON.stringify(Object.entries(main(e).experience_basis || {}).sort(([a],[b])=>a.localeCompare(b)));
export function sameExperience(a,b) {
  if (placeId(a) !== placeId(b)) return false;
  if (experienceKey(a) === experienceKey(b)) return true;
  const ar = routeIdentity(main(a).snapshot?.route?.route_id), br = routeIdentity(main(b).snapshot?.route?.route_id);
  return !!ar && ar === br && activityKey(a) === activityKey(b) && basisKey(a) === basisKey(b);
}
export function substantiveDifference(a,b) {
  if (sameExperience(a,b)) return false;
  const ar = routeIdentity(main(a).snapshot?.route?.route_id), br = routeIdentity(main(b).snapshot?.route?.route_id);
  return !!ar && !!br && ar !== br || activityKey(a) !== activityKey(b)
    || !!main(a).experience_basis && !!main(b).experience_basis && basisKey(a) !== basisKey(b);
}
function completionRecords(candidate, history, log, at) {
  const date = nyDateString(new Date(at));
  return log.filter(v => {
    if (v.history_kind !== 'completed' || v.date && v.date > date || v.place_id && v.place_id !== placeId(candidate)) return false;
    const edition = history.find(e => e.id === v.edition);
    if (edition && sameExperience(candidate,edition)) return true;
    return v.place_id === placeId(candidate) && v.experience_id && experienceKey(candidate) === `${v.place_id}:${routeIdentity(v.experience_id)}`;
  });
}
export function previousSuggestions(candidate, history, at = candidate.published_at) {
  return history.filter(e => e.id !== candidate.id && ['published', 'withdrawn'].includes(e.status)
    && placeId(e) === placeId(candidate) && new Date(e.published_at) < new Date(at))
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
}
export function reuseEligibility(candidate, history, { at = candidate.published_at, log = [] } = {}) {
  const instant = new Date(at), f = main(candidate), date = candidate.weekend?.start || String(at).slice(0, 10);
  if (!Number.isFinite(+instant)) return { eligible: false, reason: 'A valid publication time is required.' };
  if (!f.seasons?.includes(seasonFor(date))) return { eligible: false, reason: 'Wait for a suitable season.' };
  if (f.experiences?.includes('event') && !f.event_window) return { eligible: false, reason: 'Supply the appropriate event window.' };
  const end = candidate.weekend?.end || date;
  if (f.event_window && (f.event_window.start > f.event_window.end || end < f.event_window.start || date > f.event_window.end))
    return { eligible: false, reason: 'Wait for the appropriate event window.' };
  const previous = previousSuggestions(candidate, history, at);
  if (!previous.length) return { eligible: true, cooldown: 0, recencyPenalty: 0, previous: null };
  const latest = previous[0];
  const same = previous.filter(e => sameExperience(e,candidate));
  const different = !same.length && Boolean(f.experience_id && f.difference_note?.trim().length >= 20 && substantiveDifference(candidate,latest));
  // A new title or ID alone cannot grant the shorter cooldown.
  const anchor = different ? latest : same[0] || latest;
  const completed = completionRecords(candidate,history,log,at).length > 0;
  const cooldown = different ? 120 : completed ? 365 : 180;
  const elapsed = (instant - new Date(anchor.published_at)) / DAY;
  const eligibleAt = new Date(+new Date(anchor.published_at) + cooldown * DAY).toISOString();
  return { eligible: elapsed >= cooldown, cooldown, eligibleAt, previous: latest,
    recencyPenalty: 100 * Math.max(0, 1 - elapsed / (cooldown * 2)),
    reason: elapsed < cooldown ? `Wait until ${eligibleAt.slice(0, 10)} (${cooldown}-day cooldown).` : null };
}
export function categoryFor(e) { return main(e).experiences?.some(x => NON_TRAIL.has(x)) ? 'other' : 'trail'; }
// Suitability stays primary. Recent categories and publication history adjust editorial ranking.
// Eligibility does not validate access, weather, evidence or artwork.
export function rankCandidates(candidates, history, { at, log = [] } = {}) {
  const recent = history.filter(e => e.status === 'published' && new Date(e.published_at) < new Date(at))
    .sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, 6);
  const trailShare = recent.length ? recent.filter(e => categoryFor(e) === 'trail').length / recent.length : 0;
  return candidates.map(candidate => {
    const reuse = reuseEligibility(candidate, history, { at, log });
    const suitability = Number(candidate.suitability_score ?? 50);
    const diversity = categoryFor(candidate) === 'other' ? 15 * trailShare : 0;
    const completed = completionRecords(candidate,history,log,at);
    const familiar = log.some(v => v.place_id === placeId(candidate) && (!v.date || v.date <= nyDateString(new Date(at))));
    const personal = log.filter(v => v.place_id === placeId(candidate) && v.date && v.date <= nyDateString(new Date(at)));
    const recordedActivities = [...new Set(personal.map(v => activityCategory(v.activity_category)).filter(Boolean))].sort();
    const candidateActivities = main(candidate).experiences || [];
    // Category familiarity is a small editorial adjustment, never an experience identity or eligibility waiver.
    const repeatsActivity = recordedActivities.some(a => candidateActivities.includes(a));
    const activityAdjustment = recordedActivities.length ? repeatsActivity ? -4 : reuse.cooldown === 120 || !reuse.previous ? 4 : 0 : 0;
    const context = personal.find(v => v.editorial_context?.reviewed === true)?.editorial_context;
    const contextAdjustment = context ? (candidateActivities.includes(context.explore_activity) ? 6 : 0) - (candidateActivities.includes(context.avoid_activity) ? 8 : 0) : 0;
    const unseen = !familiar && !previousSuggestions(candidate, history, at).length;
    const completionAge = completed.length ? Math.min(...completed.map(v => v.date ? (+new Date(at) - +new Date(v.date))/DAY : 0)) : Infinity;
    const completionPenalty = completed.length ? completionAge < 365 ? 60 : 30 : 0;
    return { candidate, ...reuse, unseen, familiar, completionPenalty, diversity, recordedActivities, activityAdjustment, contextAdjustment,
      ...(context ? { editorialContext: context } : {}),
      score: suitability + diversity + (unseen ? 12 : 0) + activityAdjustment + contextAdjustment - (reuse.recencyPenalty || 0) - completionPenalty };
  }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score || Number(b.unseen) - Number(a.unseen));
}
