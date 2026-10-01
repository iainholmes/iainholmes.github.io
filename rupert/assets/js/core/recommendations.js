// Shared editorial reuse policy for publication validation and candidate ranking.
import { seasonFor } from './options.js';
const DAY = 86400000;
const main = e => e.flagship || e;
const placeId = e => main(e).place_id;
// Stable identity: explicit experience, recorded route, or the place itself. Titles are never identity.
export const experienceKey = e => `${placeId(e)}:${main(e).experience_id || main(e).snapshot?.route?.route_id?.replace(/@\d+$/, '') || 'default'}`;
export function previousSuggestions(candidate, history, at = candidate.published_at) {
  return history.filter(e => e.id !== candidate.id && ['published', 'withdrawn'].includes(e.status)
    && placeId(e) === placeId(candidate) && new Date(e.published_at) < new Date(at))
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
}
export function reuseEligibility(candidate, history, { at = candidate.published_at, log = [] } = {}) {
  const instant = new Date(at), f = main(candidate), date = candidate.weekend?.start || String(at).slice(0, 10);
  if (!Number.isFinite(+instant)) return { eligible: false, reason: 'A valid publication time is required.' };
  if (!f.seasons?.includes(seasonFor(date))) return { eligible: false, reason: 'Wait for a suitable season.' };
  if (f.event_window && (f.event_window.start > f.event_window.end || date < f.event_window.start || date > f.event_window.end))
    return { eligible: false, reason: 'Wait for the appropriate event window.' };
  const previous = previousSuggestions(candidate, history, at);
  if (!previous.length) return { eligible: true, cooldown: 0, recencyPenalty: 0, previous: null };
  const latest = previous[0];
  const same = previous.filter(e => experienceKey(e) === experienceKey(candidate));
  const different = !same.length && Boolean(f.experience_id && f.difference_note?.trim().length >= 20);
  // A new title or ID alone cannot grant the shorter cooldown.
  const anchor = different ? latest : same[0] || latest;
  const visited = log.some(v => (same.length ? same : [anchor]).some(e => v.edition === e.id) || (v.place_id === placeId(candidate)
    && (!v.experience_id || v.experience_id === f.experience_id)));
  const cooldown = different ? 120 : visited ? 365 : 180;
  const elapsed = (instant - new Date(anchor.published_at)) / DAY;
  const eligibleAt = new Date(+new Date(anchor.published_at) + cooldown * DAY).toISOString();
  return { eligible: elapsed >= cooldown, cooldown, eligibleAt, previous: latest,
    recencyPenalty: 100 * Math.max(0, 1 - elapsed / (cooldown * 2)),
    reason: elapsed < cooldown ? `Wait until ${eligibleAt.slice(0, 10)} (${cooldown}-day cooldown).` : null };
}
const NON_TRAIL = new Set(['cafe', 'patio', 'brewery', 'pup-treat', 'market', 'shopping', 'garden', 'town-walk', 'campus', 'scenic-drive', 'ferry', 'picnic', 'event', 'swim']);
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
    const unseen = !previousSuggestions(candidate, history, at).length;
    return { candidate, ...reuse, unseen, diversity, score: suitability + diversity + (unseen ? 12 : 0) - (reuse.recencyPenalty || 0) };
  }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score || Number(b.unseen) - Number(a.unseen));
}
