import { matchesCrowdTolerance } from './crowds.js';
export const SEASONS = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
export const EXPERIENCES = { woodland: 'Woodland', river: 'River', ridge: 'Ridge & views', 'short-walk': 'Short walk', 'full-day': 'Full day', swim: 'Swimming', 'town-walk': 'Town walk', cafe: 'Café', patio: 'Dog-friendly patio', brewery: 'Brewery', 'pup-treat': 'Pup treats', market: 'Market & farm stand', shopping: 'Shopping stop', garden: 'Garden & garden center', campus: 'Campus', 'scenic-drive': 'Scenic drive', ferry: 'Ferry', picnic: 'Picnic & sunset', event: 'Event & festival' };
// Northern-hemisphere meteorological seasons; edition suitability tags are curated separately.
export function seasonFor(dateStr) {
  const month = Number(dateStr.slice(5, 7));
  return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter';
}
export function matchesOption(option, { query = '', season = '', experience = '', crowd = 'any' } = {}) {
  const text = `${option.title || ''} ${option.place_name || ''} ${(option.seasons || []).map(x => SEASONS[x]).join(' ')} ${(option.experiences || []).map(x => EXPERIENCES[x]).join(' ')}`.toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(x => text.includes(x))
    && matchesCrowdTolerance(option.crowd, crowd) && (!season || option.seasons?.includes(season)) && (!experience || option.experiences?.includes(experience));
}
