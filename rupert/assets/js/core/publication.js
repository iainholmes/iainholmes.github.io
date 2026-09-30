// Publication evidence is owned by the official land manager. Secondary sources cannot unlock it.
export function accessProblem(edition, checks, officialHosts) {
  if(edition.status!=='published')return null;
  const check=checks.find(c=>c.place_id===edition.flagship.place_id);
  if(!check)return 'Missing official access check.';
  let url;try{url=new URL(check.official_url);}catch{return 'Invalid official source URL.';}
  if(url.protocol!=='https:' || !officialHosts.includes(url.hostname))return 'Source is not an approved land manager; AllTrails is secondary only.';
  if(check.status!=='open')return 'Official access is closed or unverified.';
  if(check.discrepancy)return 'Resolve the disagreement between official and secondary sources.';
  const age=(new Date(edition.published_at)-new Date(check.checked+'T00:00:00-04:00'))/86400000;
  if(!Number.isFinite(age)||age< -1||age>7)return 'Refresh the official check within seven days before publication.';
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
