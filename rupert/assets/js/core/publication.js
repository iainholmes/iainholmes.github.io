// Publication evidence is owned by the official land manager. Secondary sources cannot unlock it.
import { nyDateString, nyInstant } from './dates.js';
import { expectedPublish } from './editions.js';
import { cycleWeekend } from './cycles.js';
export function accessProblem(edition, checks, officialHosts) {
  if(edition.status!=='published')return null;
  // Keep dated evidence when a place is suggested again. An Archive edition uses the
  // latest check available at its own publication; a newer closure still blocks a new one.
  const stamp=new Date(edition.published_at),day=86400000;
  const matching=checks.filter(c=>c.place_id===edition.flagship.place_id);
  const checkedAt=c=>nyInstant(c.checked);
  const check=matching.filter(c=>checkedAt(c)-stamp<=day)
    .sort((a,b)=>checkedAt(b)-checkedAt(a) || Number(Boolean(b.status!=='open'||b.discrepancy))-Number(Boolean(a.status!=='open'||a.discrepancy)))[0]
    || matching[0];
  if(!check)return 'Missing official access check.';
  let url;try{url=new URL(check.official_url);}catch{return 'Invalid official source URL.';}
  if(url.protocol!=='https:' || !officialHosts.includes(url.hostname))return 'Source is not an approved land manager; AllTrails is secondary only.';
  if(check.status!=='open')return 'Official access is closed or unverified.';
  if(check.discrepancy)return 'Resolve the disagreement between official and secondary sources.';
  const age=(stamp-checkedAt(check))/day;
  if(!Number.isFinite(age)||age< -1||age>7)return 'Refresh the official check within seven days before publication.';
  return null;
}

// A draft is not a timed release. Promotion requires a real, current editorial review.
export function releaseProblem(edition, { checks, officialHosts, reviews, now = new Date() }) {
  if (edition.status !== 'draft') return 'Only a draft may be released.';
  if (edition.weekend.start !== cycleWeekend(now).start || now < expectedPublish(edition.slot, edition.weekend.start)) return 'This publication slot is not due.';
  const today = nyDateString(now), at = now.toISOString();
  const access = accessProblem({ ...edition, status: 'published', published_at: at }, checks, officialHosts);
  if (access) return access;
  if (!checks.some(c => c.place_id === edition.flagship.place_id && c.checked === today && c.status === 'open' && !c.discrepancy && c.checked_at && new Date(c.checked_at) <= now)) return 'A publication-day official access review is required.';
  const conditions = edition.conditions;
  if (!['forecast','unavailable'].includes(conditions?.kind) || !Number.isFinite(+new Date(conditions.checked_at)) || nyDateString(new Date(conditions.checked_at)) !== today || new Date(conditions.checked_at) > now) return 'Refresh publication-day conditions first.';
  if (conditions.kind === 'forecast' && (!Number.isFinite(+new Date(conditions.source?.issued_at)) || +new Date(conditions.as_of) !== +new Date(conditions.source.issued_at) || now - new Date(conditions.source.issued_at) > 3 * 86400000 || new Date(conditions.source.issued_at) > now || conditions.days?.length !== 2)) return 'The forecast is stale or invalid.';
  if (conditions.kind === 'unavailable' && (conditions.days?.length || !/unavailable/i.test(conditions.summary) || edition.flagship.condition_level !== 'adverse')) return 'Unavailable weather must not appear as a benign forecast.';
  const review = reviews.filter(r => r.edition_id === edition.id).sort((a,b) => b.reviewed_at.localeCompare(a.reviewed_at))[0];
  if (!review || !Number.isFinite(+new Date(review.reviewed_at)) || new Date(review.reviewed_at) > now || nyDateString(new Date(review.reviewed_at)) !== today || !review.ready || !review.note || review.conditions_as_of !== conditions.as_of || new Date(review.reviewed_at) < new Date(conditions.checked_at)) return 'Review the actual refreshed conditions, safety, dog policy, route and artwork before release.';
  return null;
}

// Candidate order is authored editorial preference. Only official evidence can unlock a candidate.
// Return the original publication unchanged except for its withdrawal record; never overwrite history.
export function replacementFor(original,candidates,checks,officialHosts,at) {
  const instant=new Date(at);if(!Number.isFinite(+instant))throw Error('A replacement needs a valid review timestamp.');
  const withdrawn=structuredClone(original);withdrawn.status='withdrawn';
  if(original.status!=='withdrawn')withdrawn.corrections=[...(withdrawn.corrections||[]),{at,field:'flagship',note:'Recommendation withdrawn: '+(accessProblem({...original,status:'published',published_at:at},checks,officialHosts)||'Unavailable after editorial review.') }];
  const rejected=[];
  for(const candidate of candidates){
    if(candidate.flagship.place_id===original.flagship.place_id){rejected.push({id:candidate.id,reason:'Choose a different place.'});continue;}
    if(candidate.slot!==original.slot||candidate.weekend.start!==original.weekend.start||candidate.weekend.end!==original.weekend.end){rejected.push({id:candidate.id,reason:'Wrong publication slot or weekend.'});continue;}
    const replacement={...structuredClone(candidate),status:'published',published_at:at};
    const issue=accessProblem(replacement,checks,officialHosts);
    if(issue){rejected.push({id:candidate.id,reason:issue});continue;}
    if(candidate.id===original.id)throw Error('Replacement must have a separate revision ID.');
    return {withdrawn,replacement,rejected};
  }
  return {withdrawn,replacement:null,rejected};
}
