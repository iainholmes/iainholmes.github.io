// Shared recommendation/archive policy. Unknown crowding never qualifies as quiet.
export const CROWD_LEVELS = ['Low', 'Moderate', 'Busy', 'Very Busy'];
export const CROWD_TOLERANCES = { quiet: 'Quiet only', low_moderate: 'Low–moderate', any: 'Any' };
export function matchesCrowdTolerance(crowd, tolerance = 'any') {
  if (tolerance === 'any') return true;
  const level = crowd?.perceived_crowding;
  if (tolerance === 'quiet') return level === 'Low';
  if (tolerance === 'low_moderate') return level === 'Low' || level === 'Moderate';
  return false;
}
export function matchingOutings(edition, tolerance = 'any') {
  return (edition.outings || []).filter(o => matchesCrowdTolerance(o.crowd, tolerance));
}
export function crowdSummary(crowd) {
  return `Crowd: ${crowd?.typical_level || 'Not yet assessed'} · Space feels: ${crowd?.perceived_crowding || 'Not yet assessed'}`;
}
