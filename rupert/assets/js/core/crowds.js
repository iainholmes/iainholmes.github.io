// Shared recommendation/archive policy. Unknown crowding never qualifies as quiet.
export const CROWD_LEVELS = ['Low', 'Moderate', 'Busy', 'Very Busy'];
export const CROWD_TOLERANCES = { quiet: 'Quiet only', low_moderate: 'Low–moderate', any: 'Any' };
// Snapshot readings are categorical, not counts. Missing/invalid levels have no scale position.
export function crowdReadings(crowd) {
  const reading = value => {
    const index = CROWD_LEVELS.indexOf(value);
    return index < 0 ? null : { value, index };
  };
  const facts = [['Quietest window',crowd?.low_crowd_window],['Peak',crowd?.peak_period],['Dogs',crowd?.dog_density],['Attendance',crowd?.attendance],['Weekdays / weekends',crowd?.weekend_vs_weekday],['Foot traffic',crowd?.foot_traffic]]
    .filter(([,v]) => typeof v === 'string' ? v.trim().length > 0 : typeof v === 'number' && Number.isFinite(v));
  return { typical: reading(crowd?.typical_level), perceived: reading(crowd?.perceived_crowding), facts };
}
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
