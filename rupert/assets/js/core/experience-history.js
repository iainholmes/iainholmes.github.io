// Personal history is independent of editorial release/withdrawal state. Pure, shared with private CLI input.
import { isReleased } from './editions.js';
import { nyDateString } from './dates.js';
import { EXPERIENCES } from './options.js';
export const activityCategory = value => typeof value === 'string' && Object.hasOwn(EXPERIENCES, value) ? value : '';
const main = e => e.flagship || e;
export const routeIdentity = id => String(id || '').replace(/@\d+$/, '');
export const experienceId = e => main(e).experience_id || routeIdentity(main(e).snapshot?.route?.route_id || e.experience_key) || 'default';
export const experienceKey = e => `${main(e).place_id}:${experienceId(e)}`;
const nameKey = s => String(s || '').trim().normalize('NFKC').toLocaleLowerCase('en-US');
export const validHistoryDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date || '') && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date;

// Resolve only exact, unique names or a known edition reference. Never reinterpret an activity tag as an identity.
// This is a view of the original memory; migration never writes back to storage or edits its prose/photos.
export function resolveHistoryEntry(entry, { places, manifest, now = new Date() }) {
  const records = (manifest?.editions || []).filter(e => isReleased(e, now));
  const edition = records.find(e => e.id === entry.edition);
  const matches = (places?.places || []).filter(p => [p.name,p.short_name].some(n => n && nameKey(n) === nameKey(entry.place)));
  let place = entry.place_id ? places?.places.find(p => p.id === entry.place_id) : null;
  if (!entry.place_id && !entry.association_manual) {
    const editionPlace = main(edition || {}).place_id;
    if (editionPlace && (!matches.length || matches.length === 1 && matches[0].id === editionPlace)) place = places?.places.find(p => p.id === editionPlace);
    else if (!editionPlace && matches.length === 1) place = matches[0];
  }
  const kind = ['visit','completed'].includes(entry.history_kind) ? entry.history_kind : 'unclassified';
  if (!place) return { place_id: '', experience_id: '', edition: '', kind, resolved: false, completed: false };
  const known = new Set((place.routes || []).map(r => routeIdentity(r.id)));
  records.filter(e => main(e).place_id === place.id).forEach(e => known.add(experienceId(e)));
  const supplied = routeIdentity(entry.experience_id);
  const linked = edition && main(edition).place_id === place.id ? edition : null;
  const identity = kind === 'completed' ? supplied || (linked ? experienceId(linked) : '') : '';
  const consistent = !entry.edition || !!linked && (!supplied || supplied === experienceId(linked));
  const completed = kind === 'completed' && !!identity && known.has(identity) && consistent;
  // A visit predating publication can establish experience history, but cannot complete that future edition.
  const editionId = completed && linked && entry.date >= nyDateString(new Date(linked.published_at)) ? linked.id : '';
  return { place_id: place.id, experience_id: completed ? identity : '', edition: editionId, kind, resolved: true, completed };
}

export function personalHistory(entries, catalog) {
  const visits = new Map(), editions = new Map(), experiences = new Map();
  const today = nyDateString(catalog.now || new Date());
  for (const entry of entries) {
    if (!validHistoryDate(entry.date) || entry.date > today) continue;
    const association = resolveHistoryEntry(entry, catalog);
    if (!association.resolved) continue;
    const record = { ...association, id: entry.id, date: entry.date, activity_category: activityCategory(entry.experience) };
    if (!visits.has(record.place_id)) visits.set(record.place_id, []);
    visits.get(record.place_id).push(record);
    if (record.completed) {
      const key = `${record.place_id}:${record.experience_id}`;
      if (!experiences.has(key)) experiences.set(key, []);
      experiences.get(key).push(record);
      if (record.edition) { if (!editions.has(record.edition)) editions.set(record.edition, []); editions.get(record.edition).push(record); }
    }
  }
  return { visits, editions, experiences };
}

export function editionHistory(edition, history) {
  const direct = history.editions.get(edition.id)?.[0];
  if (direct) return { state: 'completed', label: 'Outing completed', record: direct };
  const experience = history.experiences.get(experienceKey(edition))?.[0];
  if (experience) return { state: 'experience', label: 'Experience completed · edition not recorded', record: experience };
  const visit = history.visits.get(main(edition).place_id)?.[0];
  if (visit) return { state: 'visited', label: 'Place visited · outing not completed', record: visit };
  return { state: 'uncompleted', label: 'Outing not recorded', record: null };
}

// Deliberate export, never a stripped copy of a memory. Prose is supplied only by an explicit review.
export function recommendationHistory(entries, catalog, { contexts = [] } = {}) {
  const history = personalHistory(entries, catalog), records = [];
  for (const [place_id, visits] of history.visits) {
    const activities = new Map();
    for (const visit of visits) if (!activities.has(visit.activity_category) || activities.get(visit.activity_category).date < visit.date) activities.set(visit.activity_category, visit);
    for (const [category, visit] of activities) records.push({ history_kind: 'visit', place_id, date: visit.date, ...(category ? { activity_category: category } : {}) });
  }
  for (const completions of history.experiences.values()) {
    const latest = [...completions].sort((a,b) => b.date.localeCompare(a.date))[0];
    records.push({ history_kind: 'completed', place_id: latest.place_id, experience_id: latest.experience_id, ...(latest.edition ? { edition: latest.edition } : {}), date: latest.date, ...(latest.activity_category ? { activity_category: latest.activity_category } : {}) });
  }
  const value = { type: 'rupert-recommendation-history', version: 2, records, contexts };
  readRecommendationHistory(JSON.stringify(value), catalog);
  return value;
}

export function readRecommendationHistory(text, catalog) {
  if (text.length > 100000) throw Error('Recommendation history exceeds 100 KB.');
  const value = JSON.parse(text), allowed = ['history_kind','place_id','experience_id','edition','date'];
  if (value.version === 2) allowed.push('activity_category');
  const top = value.version === 2 ? ['type','version','records','contexts'] : ['type','version','records'];
  if (value.type !== 'rupert-recommendation-history' || ![1,2].includes(value.version) || !Array.isArray(value.records) || value.records.length > 400 || Object.keys(value).some(k => !top.includes(k))) throw Error('Use the minimal recommendation-history export.');
  for (const record of value.records) {
    if (!record || Object.keys(record).some(k => !allowed.includes(k)) || !['visit','completed'].includes(record.history_kind) || !validHistoryDate(record.date) || record.date > nyDateString(catalog.now || new Date())) throw Error('Invalid recommendation-history record.');
    const resolved = resolveHistoryEntry(record, catalog);
    if (!resolved.resolved || record.history_kind === 'visit' && (record.experience_id || record.edition) || record.history_kind === 'completed' && (!resolved.completed || record.edition && record.edition !== resolved.edition)) throw Error('History must refer to a known place and an explicitly completed experience.');
    if (record.activity_category !== undefined && !activityCategory(record.activity_category)) throw Error('Use a recognized activity category, not memory text.');
  }
  const contexts = value.version === 2 ? value.contexts : [];
  if (!Array.isArray(contexts) || contexts.length > 200 || new Set(contexts.map(c => c?.place_id)).size !== contexts.length) throw Error('Invalid reviewed editorial context.');
  for (const context of contexts) {
    if (!context || Object.keys(context).some(k => !['place_id','reviewed','summary','explore_activity','avoid_activity'].includes(k)) || context.reviewed !== true
      || !value.records.some(r => r.place_id === context.place_id) || typeof context.summary !== 'string' || context.summary.length > 500
      || !context.summary.trim() && !context.explore_activity && !context.avoid_activity
      || ['explore_activity','avoid_activity'].some(k => context[k] !== undefined && !activityCategory(context[k]))
      || context.explore_activity && context.explore_activity === context.avoid_activity) throw Error('Review a brief summary and distinct activity choices for a recorded place.');
  }
  // Internal CLI records carry the reviewed context once per place; no memory text is read or inferred.
  const pending = new Map(contexts.map(c => [c.place_id,c]));
  return value.records.map(record => {
    const context = pending.get(record.place_id); pending.delete(record.place_id);
    return context ? { ...record, editorial_context: context } : record;
  });
}
